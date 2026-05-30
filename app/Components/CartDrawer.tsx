"use client";

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/Redux/store';
import { closeCart, removeFromCart, updateQuantity } from '@/lib/Redux/slices/cartSlice';
import styles from '../styles/cartDrawer.module.css';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { items, isOpen } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  const subtotal = items.reduce((acc, item) => acc + (item.discountPrice * item.qty), 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={() => dispatch(closeCart())}
      />

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart ({items.length})</h2>
          <button className={styles.closeBtn} onClick={() => dispatch(closeCart())}>✕</button>
        </div>

        <div className={styles.cartItems}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item._id}-${item.selectedColor}-${item.selectedSize}`} className={styles.cartItem}>
                <img src={item.thumbnail} alt={item.name} className={styles.itemImg} />
                <div className={styles.itemInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <div className={styles.itemMeta}>
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && ' | '}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </div>
                    </div>
                    <button
                      className={styles.closeBtn}
                      style={{ fontSize: '1rem' }}
                      onClick={() => dispatch(removeFromCart({ _id: item._id, color: item.selectedColor, size: item.selectedSize }))}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div className={styles.itemQty}>
                      <button
                        className={styles.qtyBtnSmall}
                        onClick={() => dispatch(updateQuantity({ _id: item._id, qty: item.qty - 1, color: item.selectedColor, size: item.selectedSize }))}
                      >-</button>
                      <span>{item.qty}</span>
                      <button
                        className={styles.qtyBtnSmall}
                        onClick={() => dispatch(updateQuantity({ _id: item._id, qty: item.qty + 1, color: item.selectedColor, size: item.selectedSize }))}
                      >+</button>
                    </div>
                    <div className={styles.itemPriceArea}>
                      <div className={styles.itemPriceRow}>
                        <span className={styles.itemPrice}>Rs. {Math.round(item.discountPrice)}</span>
                        {item.price > item.discountPrice && (
                          <span className={styles.itemOldPrice}>Rs. {Math.round(item.price)}</span>
                        )}
                      </div>
                      <div className={styles.itemTotal}>Total: Rs. {Math.round(item.discountPrice * item.qty)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Subtotal</span>
            <span className={styles.totalPrice}>Rs. {Math.round(subtotal)}</span>
          </div>
          <button 
            className={styles.checkoutBtn} 
            disabled={items.length === 0}
            onClick={() => {
              dispatch(closeCart());
              router.push('/checkout');
            }}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </>
  );
}
