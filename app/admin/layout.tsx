"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import styles from './styles/dashboard.module.css';
import AdminGuard from '../Components/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (!pathname) return 'Admin';
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/users')) return 'Users';
    if (pathname.includes('/banner')) return 'Banner Management';
    if (pathname.includes('/categories')) return 'Categories';
    if (pathname.includes('/products')) return 'Products';
    if (pathname.includes('/coupon')) return 'Coupon';
    if (pathname.includes('/about')) return 'About Us';
    if (pathname.includes('/contact-info')) return 'Contact Info';
    if (pathname.includes('/contacts')) return 'Inquiries';
    if (pathname.includes('/orders')) return 'Orders';
    if (pathname.includes('/chat')) return 'Chat';
    if (pathname.includes('/settings')) return 'Website Settings';
    return 'Admin';
  };

  return (
    <AdminGuard redirectTo="/">
      <div className={styles.adminLayout}>
      <div className={`${styles.mobileOverlay} ${isSidebarOpen ? styles.open : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={styles.mainWrapper}>
        {/* Unified Header */}
        <div className={styles.unifiedHeader}>
          <div className={styles.headerLeftArea}>
            <button className={`${styles.mobileHeaderBtn} ${styles.onlyMobile}`} onClick={() => setIsSidebarOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className={styles.headerCenterArea}>
            <div className={styles.pageTitle}>
              <span>{getPageTitle()}</span>
            </div>
          </div>

          <div className={styles.headerRightArea}>
            <Link href="/" className={styles.settingsBtn}>
              Home
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Link>
          </div>
        </div>

        {children}
      </div>
    </div>
    </AdminGuard>
  );
}
