"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styles from "./orders.module.css";
import Reveal from "../Components/Reveal";
import HeroSlider from "../Components/HeroSlider";

interface OrderItem {
  name: string;
  thumbnail: string;
  price: number;
  discountPrice: number;
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  paymentMethod: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: profileData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/profile");
      return data;
    },
    retry: false,
  });

  const isLoggedIn = !!profileData?.success;

  useEffect(() => {
    const fetchData = async () => {
      // Fetch banners
      try {
        const { data: bannerData } = await axios.get("/api/admin/banner");
        if (Array.isArray(bannerData)) {
          setBanners(bannerData as any);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }

      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get("/api/orders");
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        {banners.length > 0 && <HeroSlider banners={banners} noMargin={true} />}
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            <h2>Please login to see your orders</h2>
            <p>Sign in to view your order history and track shipments</p>
            <Link href="/auth/login" className={styles.primaryBtn}>Login Now</Link>
          </div>
        </div>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        {banners.length > 0 && <HeroSlider banners={banners} noMargin={true} />}
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>My Orders</h1>
          <div className={styles.emptyState}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet. Start shopping!</p>
            <Link href="/shop" className={styles.primaryBtn}>Explore Shop</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {banners.length > 0 && <HeroSlider banners={banners} noMargin={true} />}
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>My Orders <span className={styles.count}>({orders.length})</span></h1>
        
        <div className={styles.ordersList}>
        {orders.map((order, idx) => (
          <Reveal key={order._id} style={{ animationDelay: `${idx * 0.1}s` } as any}>
            <div className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.headerInfo}>
                  <div className={styles.headerItem}>
                    <span className={styles.label}>Order ID</span>
                    <span className={styles.value}>#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className={styles.headerItem}>
                    <span className={styles.label}>Placed On</span>
                    <span className={styles.value}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.headerItem}>
                    <span className={styles.label}>Total Amount</span>
                    <span className={styles.value}>Rs. {Math.round(order.total)}</span>
                  </div>
                </div>
                <div className={`${styles.statusBadge} ${styles[order.status]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              <div className={styles.orderBody}>
                {order.items.map((item, i) => (
                  <div key={i} className={styles.orderItem}>
                    <div className={styles.itemImgWrapper}>
                      <img src={item.thumbnail} alt={item.name} className={styles.itemImg} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <div className={styles.itemMeta}>
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        <span>Qty: {item.qty}</span>
                      </div>
                    </div>
                    <div className={styles.itemPrice}>
                      Rs. {Math.round(item.discountPrice || item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.paymentInfo}>
                  <span className={styles.label}>Payment Method:</span>
                  <span className={styles.value}>{order.paymentMethod}</span>
                </div>
                <button className={styles.detailBtn}>View Full Details</button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
    </>
  );
}
