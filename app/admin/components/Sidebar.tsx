"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles/dashboard.module.css';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !pathname) return null;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.logo} style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={styles.logoIcon}>N</div>
          <span>Nextshop</span>
        </div>
        {isOpen && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.sidebarMenu}>
        <Link href="/admin/dashboard" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/dashboard' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>🏠</span>
              <span>Dashboard</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/users" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/users' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>👥</span>
              <span>Users</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/banner" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/banner' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>📢</span>
              <span>Banner</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/categories" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/categories' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>🗂️</span>
              <span>Categories</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/products" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/products' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>🛍️</span>
              <span>Products</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/coupon" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/coupon' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>🎟️</span>
              <span>Coupon</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/about" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/about' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>ℹ️</span>
              <span>About Us</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/contact-info" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/contact-info' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>⚙️</span>
              <span>Contact Info</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/contacts" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/contacts' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>📧</span>
              <span>Inquiries</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/orders" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/orders' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>📦</span>
              <span>Orders</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/chat" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/chat' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>💬</span>
              <span>Chat</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/admin/settings" onClick={onClose}>
          <div className={`${styles.menuItem} ${pathname === '/admin/settings' ? styles.active : ''}`}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>🌐</span>
              <span>Website Settings</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
        <Link href="/" onClick={() => { localStorage.removeItem('adminToken'); onClose?.(); }}>
          <div className={styles.menuItem}>
            <div className={styles.menuItemLeft}>
              <span className={styles.menuIcon}>🚪</span>
              <span>Logout</span>
            </div>
            <span>{">"}</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
