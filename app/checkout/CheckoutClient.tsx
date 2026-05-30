"use client";

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/Redux/store';
import styles from '../styles/checkout.module.css';
import Reveal from '../Components/Reveal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { clearCart } from '@/lib/Redux/slices/cartSlice';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import getStripe from '@/lib/stripe';

function CheckoutForm() {
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingFee, setShippingFee] = useState(150);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(20000);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data) {
          if (data.shippingFee !== undefined) setShippingFee(data.shippingFee);
          if (data.freeShippingThreshold !== undefined) setFreeShippingThreshold(data.freeShippingThreshold);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, []);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0 && !isPlacingOrder) {
      router.replace('/');
    }
  }, [items.length, isPlacingOrder, router]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const subtotal = items.reduce((acc, item) => acc + (item.discountPrice * item.qty), 0);
  const shipping = items.length > 0 ? (subtotal >= freeShippingThreshold ? 0 : shippingFee) : 0;
  const total = subtotal + shipping - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setIsApplying(true);
      const { data } = await axios.post("/api/coupon/validate", {
        code: couponCode,
        orderAmount: subtotal
      });

      if (data.success) {
        setDiscountAmount(data.discountAmount);
        setAppliedCoupon(data.code);
        toast.success(data.message);
      }
    } catch (error: any) {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      toast.error(error.response?.data?.error || "Invalid coupon code");
    } finally {
      setIsApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;

    // Basic validation
    const { fullName, email, phone, address, city, zipCode } = formData;
    
    if (!fullName || !email || !phone || !address || !city || !zipCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsPlacingOrder(true);

      // 1. Check if user is logged in
      const { data: authCheck } = await axios.get('/api/auth/check');
      if (!authCheck.authenticated) {
        toast.error("Please login to place an order");
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      let paymentId = "COD";

      // 2. Handle Stripe Payment if selected
      if (paymentMethod === 'Card') {
        if (!stripe || !elements) {
          toast.error("Stripe is not initialized");
          setIsPlacingOrder(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setIsPlacingOrder(false);
          return;
        }

        if (cardError) {
          toast.error(cardError);
          setIsPlacingOrder(false);
          return;
        }

        // Create Payment Intent
        const { data: intentData } = await axios.post("/api/payment/intent", {
          amount: total
        });

        if (intentData.error) {
          throw new Error(intentData.error);
        }

        const { clientSecret } = intentData;

        // Confirm Payment
        const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: fullName,
              email: email,
            },
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent?.status === "succeeded") {
          paymentId = paymentIntent.id;
        } else {
          throw new Error("Payment could not be completed. Please try again.");
        }
      }

      // 3. Save order to database
      const orderPayload = {
        items,
        fullName,
        email,
        phone,
        address,
        city,
        zipCode,
        subtotal,
        shipping,
        discount: discountAmount,
        couponCode: appliedCoupon || "",
        total,
        paymentMethod: paymentMethod,
        paymentId: paymentId
      };

      const { data: orderRes } = await axios.post('/api/order', orderPayload);
      if (orderRes.success) {
        toast.success(paymentMethod === 'Card' ? "Payment successful & Order placed!" : "Order placed successfully!");
        dispatch(clearCart());
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (error: any) {
      console.error("Order Error:", error);
      
      // Better error message extraction
      let errorMsg = "Failed to place order";
      
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        {/* Left Side: Forms */}
        <div className={styles.formSection}>
          <Reveal>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Contact Information
              </h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    className={styles.input} 
                    placeholder="Enter Name" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    className={styles.input} 
                    placeholder="Enter Email" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    className={styles.input} 
                    placeholder="Enter Phone Number" 
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal style={{ animationDelay: '0.1s' } as any}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Shipping Address
              </h2>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Street Address</label>
                  <input 
                    type="text" 
                    name="address"
                    className={styles.input} 
                    placeholder="Enter Street Address" 
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>City</label>
                  <input 
                    type="text" 
                    name="city"
                    className={styles.input} 
                    placeholder="Enter City" 
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Postal Code</label>
                  <input 
                    type="text" 
                    name="zipCode"
                    className={styles.input} 
                    placeholder="Enter Postal Code" 
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Side: Order Summary */}
        <div className={styles.summaryContainer}>
          <Reveal>
            <div className={styles.section}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              
              <div className={styles.cartItems}>
                {items.map((item) => (
                  <div key={`${item._id}-${item.selectedColor}-${item.selectedSize}`} className={styles.cartItem}>
                    <img src={item.thumbnail} alt={item.name} className={styles.itemImg} />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                    <div className={styles.itemMeta}>
                      <span>{item.qty} unit{item.qty > 1 ? 's' : ''}</span>
                      {item.selectedSize && <span style={{ opacity: 0.3 }}>|</span>}
                      {item.selectedSize && <span>{item.selectedSize}</span>}
                    </div>
                    </div>
                    <span className={styles.itemPrice}>Rs. {Math.round(item.discountPrice * item.qty)}</span>
                  </div>
                ))}
                {items.length === 0 && <p style={{ color: '#6b7280' }}>Your cart is empty</p>}
              </div>

              <div className={styles.divider} />

              <div className={styles.couponRow}>
                <input 
                  type="text" 
                  className={styles.couponInput} 
                  placeholder="Coupon Code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button 
                  className={styles.applyBtn} 
                  onClick={handleApplyCoupon}
                  disabled={isApplying}
                >
                  {isApplying ? "..." : "APPLY"}
                </button>
              </div>

              <div className={styles.divider} />

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Subtotal</span>
                <span className={styles.totalValue}>Rs. {Math.round(subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Shipping</span>
                <span className={styles.totalValue}>
                  {shipping === 0 ? <span style={{color: '#10b981'}}>Free</span> : `Rs. ${Math.round(shipping)}`}
                </span>
              </div>
              
              {discountAmount > 0 && (
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel} style={{ color: '#10b981' }}>
                    Discount ({appliedCoupon})
                  </span>
                  <span className={styles.totalValue} style={{ color: '#10b981' }}>
                    - Rs. {Math.round(discountAmount)}
                  </span>
                </div>
              )}
              
              <div className={styles.divider} />

              <div className={styles.miniPaymentSection}>
                <p className={styles.miniSectionTitle}>Select Payment Method</p>
                <div className={styles.radioGroup}>
                  <label className={`${styles.radioLabel} ${paymentMethod === 'COD' ? styles.radioActive : ''}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'COD'} 
                      onChange={() => setPaymentMethod('COD')}
                      className={styles.hiddenRadio}
                    />
                    <span className={styles.customRadio}></span>
                    Cash on Delivery
                  </label>
                  <label className={`${styles.radioLabel} ${paymentMethod === 'Card' ? styles.radioActive : ''}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'Card'} 
                      onChange={() => setPaymentMethod('Card')}
                      className={styles.hiddenRadio}
                    />
                    <span className={styles.customRadio}></span>
                    Debit / Credit Card
                  </label>
                </div>

                {paymentMethod === 'Card' && (
                  <div className={styles.stripeContainer}>
                    <label className={styles.stripeLabel}>Card Details</label>
                    <CardElement 
                      onChange={(e) => setCardError(e.error ? e.error.message : null)}
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#fff',
                            '::placeholder': { color: '#9ca3af' },
                          },
                          invalid: { color: '#ef4444' },
                        },
                      }}
                    />
                    {cardError && <p className={styles.cardErrorText}>{cardError}</p>}
                  </div>
                )}
              </div>

              <div className={styles.divider} />

              <div className={styles.totalRow}>
                <span className={styles.totalLabel} style={{ fontSize: '1.1rem', color: '#fff' }}>Total</span>
                <span className={styles.grandTotal}>Rs. {Math.round(total)}</span>
              </div>

              <button 
                className={styles.placeOrderBtn}
                disabled={items.length === 0 || isPlacingOrder}
                onClick={handlePlaceOrder}
              >
                {isPlacingOrder ? "PROCESSING..." : "PLACE ORDER"}
              </button>
            </div>
          </Reveal>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={getStripe()}>
      <CheckoutForm />
    </Elements>
  );
}
