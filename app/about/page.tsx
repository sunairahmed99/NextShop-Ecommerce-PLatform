import React from 'react';
import styles from '../styles/about.module.css';
import Reveal from '../Components/Reveal';
import { AboutService } from '@/lib/Services/AboutService';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | NextShop',
  description: 'Learn about NextShop story, our mission, values, and what makes us the premium destination for e-commerce.',
  keywords: ['about us', 'our story', 'mission', 'NextShop', 'premium e-commerce'],
  openGraph: {
    title: 'About Us | NextShop',
    description: 'Learn about NextShop story, our mission, values, and what makes us the premium destination for e-commerce.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | NextShop',
    description: 'Learn about NextShop story, our mission, values, and what makes us the premium destination for e-commerce.',
  }
};

export const revalidate = 0;

export default async function AboutPage() {
  const about = await AboutService.getAbout();

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.contentWrapper}>
        {/* Left Section: Text Content */}
        <div className={styles.textSection}>
          <Reveal>
            <span className={styles.subtitle}>Our Story</span>
            <h1 className={styles.title}>{about.title}</h1>
          </Reveal>

          <Reveal threshold={0.1}>
            <p className={styles.description}>
              {about.description}
            </p>
          </Reveal>

          <Reveal threshold={0.2}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <h3>10k+</h3>
                <p>Happy Customers</p>
              </div>
              <div className={styles.statItem}>
                <h3>500+</h3>
                <p>Premium Products</p>
              </div>
              <div className={styles.statItem}>
                <h3>15+</h3>
                <p>Global Brands</p>
              </div>
              <div className={styles.statItem}>
                <h3>24/7</h3>
                <p>Expert Support</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Section: Visual Content */}
        <Reveal threshold={0.1}>
          <div className={styles.imageSection}>
            <img 
              src={about.image.url} 
              alt={about.title} 
              className={styles.mainImage} 
            />
            <div className={styles.imageOverlay}>
              <p className={styles.overlayText}>
                "Quality is not an act, it is a habit. We strive for excellence in every detail."
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Additional Values Section */}
      <div className={`${styles.contentWrapper} ${styles.valuesGrid}`} style={{ marginTop: '100px' }}>
         <Reveal threshold={0.2} style={{ animationDelay: '0.1s' } as any}>
            <div className={styles.valueCard}>
              <h4>Premium Quality</h4>
              <p>We source only the finest materials and ensure every product undergoes strict quality checks.</p>
            </div>
         </Reveal>
         <Reveal threshold={0.2} style={{ animationDelay: '0.2s' } as any}>
            <div className={styles.valueCard}>
              <h4>Fast Delivery</h4>
              <p>Our global logistics network ensures that your luxury items reach you safely and swiftly.</p>
            </div>
         </Reveal>
         <Reveal threshold={0.2} style={{ animationDelay: '0.3s' } as any}>
            <div className={styles.valueCard}>
              <h4>Secure Payment</h4>
              <p>We provide state-of-the-art security for all your transactions, so you can shop with peace of mind.</p>
            </div>
         </Reveal>
      </div>
    </div>
  );
}
