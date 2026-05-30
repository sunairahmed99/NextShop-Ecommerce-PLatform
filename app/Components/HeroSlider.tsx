"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/home.module.css';

interface Banner {
  title: string;
  description: string;
  image: {
    url: string;
    publicId: string;
  };
}

export default function HeroSlider({ banners, noMargin = false }: { banners: Banner[], noMargin?: boolean }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000); // 4 seconds for better reading time
    
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className={styles.heroSection} style={noMargin ? { marginBottom: 0 } : {}}>
      {banners.map((banner, index) => (
        <div 
          key={index}
          className={`${styles.heroSlide} ${index === currentSlide ? styles.activeSlide : styles.inactiveSlide}`}
          style={{ backgroundImage: `url(${banner.image.url})` }}
        >
          <div className={styles.heroContent}>
            <span className={styles.heroSubtitle}>Exclusive Collection</span>
            <h1 className={styles.heroTitle}>{banner.title}</h1>
            <p className={styles.heroDesc}>{banner.description}</p>
            <Link href="/shop" className={styles.heroBtn}>Explore Now</Link>
          </div>
        </div>
      ))}
      
      {banners.length > 1 && (
        <div className={styles.sliderDots}>
          {banners.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
