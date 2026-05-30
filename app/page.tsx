import React from 'react';
import Link from 'next/link';
import styles from './styles/home.module.css';
import Reveal from './Components/Reveal';
import HeroSlider from './Components/HeroSlider';
import FavoriteBtn from './Components/FavoriteBtn';
import { headers } from 'next/headers';
import { BannerService } from '@/lib/Services/admin/BannerService';
import { CategoryService } from '@/lib/Services/admin/CategoryService';
import { ProductService } from '@/lib/Services/admin/ProductService';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NextShop | Your Premium E-commerce Destination',
  description: 'Welcome to NextShop, the best place to find premium electronics, fashion, and accessories at unbeatable prices.',
  keywords: ['ecommerce', 'online shopping', 'NextShop', 'buy online', 'electronics', 'fashion'],
  openGraph: {
    title: 'NextShop | Your Premium E-commerce Destination',
    description: 'Welcome to NextShop, the best place to find premium electronics, fashion, and accessories at unbeatable prices.',
    type: 'website',
    siteName: 'NextShop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextShop | Your Premium E-commerce Destination',
    description: 'Welcome to NextShop, the best place to find premium electronics, fashion, and accessories at unbeatable prices.',
  }
};

async function getHomeData() {
  const host = (await headers()).get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  let banners = [];
  let categories = [];
  let allProducts = [];

  try {
   

    
    const [bannersRes, categoriesRes, productsRes] = await Promise.all([
      fetch(`${baseUrl}/api/admin/banner`, { cache: 'no-store' }).catch(() => null),
      fetch(`${baseUrl}/api/admin/category`, { cache: 'no-store' }).catch(() => null),
      fetch(`${baseUrl}/api/admin/products`, { cache: 'no-store' }).catch(() => null)
    ]);

    if (bannersRes?.ok) banners = await bannersRes.json();
    if (categoriesRes?.ok) categories = await categoriesRes.json();
    if (productsRes?.ok) allProducts = await productsRes.json();

 
    if (!banners || banners.length === 0 || banners.error) {

      banners = await BannerService.getAllBanners();
    }
    if (!categories || categories.length === 0 || categories.error) {

      categories = await CategoryService.getAllCategories();
    }
    if (!allProducts || allProducts.length === 0 || allProducts.error) {

      allProducts = await ProductService.getAllProducts();
    }

    
    const bannersArray = JSON.parse(JSON.stringify(Array.isArray(banners) ? banners : []));
    const categoriesArray = JSON.parse(JSON.stringify(Array.isArray(categories) ? categories : []));
    const productsArray = JSON.parse(JSON.stringify(Array.isArray(allProducts) ? allProducts : []));


    const featuredProducts = productsArray.filter((p: any) => p.ptype === 'featured' && p.isPublished).slice(0, 8);
    const bestSellers = productsArray.filter((p: any) => p.ptype === 'best' && p.isPublished).slice(0, 8);

    return {
      banners: bannersArray,
      categories: categoriesArray,
      featuredProducts,
      bestSellers
    };
  } catch (error) {
    // Fail silently or handle error gracefully in production
    // console.error("Home Data Load Error:", error);
    return { banners: [], categories: [], featuredProducts: [], bestSellers: [] };
  }
}

export default async function Home() {
  const { banners, categories, featuredProducts, bestSellers } = await getHomeData();

  return (
    <div className={styles.home}>

      {banners.length > 0 ? (
        <HeroSlider banners={banners} />
      ) : (
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1b23' }}>
          <p>No banners found. Please add some in the Admin Panel.</p>
        </div>
      )}


      <section className={styles.section}>
        <Reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Shop by Categories</h2>
              <p className={styles.sectionSubtitle}>Find what you're looking for in seconds</p>
            </div>

          </div>
        </Reveal>
        
        <Reveal threshold={0.05}>
          <div className={styles.categoryGrid}>
            {categories.length > 0 ? categories.map((cat: any) => (
              <Link href={`/category/${cat._id}`} key={cat._id} className={styles.categoryCard}>
                <div className={styles.categoryImgWrapper}>
                  <img src={cat.image?.url} alt={cat.name} className={styles.categoryImg} loading="lazy" decoding="async" />
                </div>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            )) : <p>No categories found.</p>}
          </div>
        </Reveal>
      </section>

 
      <section className={styles.section}>
        <Reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Best Selling Products</h2>
              <p className={styles.sectionSubtitle}>Most loved items by our community</p>
            </div>
            <Link href="/shop" className={styles.viewAll}>View All &rarr;</Link>
          </div>
        </Reveal>
        <div className={styles.productGrid}>
          {bestSellers.length > 0 ? bestSellers.map((product: any, index: number) => (
            <Reveal key={product._id} threshold={0.1} className={styles.revealDelay} style={{ animationDelay: `${index * 0.1}s` } as any}>
              <div className={styles.productCard}>
                {product.discount > 0 && <span className={styles.badge}>{product.discount}% OFF</span>}
                <FavoriteBtn productId={product._id} />
                <div className={styles.productImgWrapper}>
                  <img 
                    src={product.thumbnail?.url || product.images[0]?.url} 
                    alt={product.name} 
                    className={styles.productImg} 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productCategory}>{product.brand || 'Premium'}</span>
                  <Link href={`/product/${product.slug}`} className={styles.productName}>{product.name}</Link>
                  <div className={styles.priceContainer}>
                    <span className={styles.currentPrice}>Rs. {Math.round(product.discountPrice || product.price)}</span>
                    {product.discount > 0 && <span className={styles.oldPrice}>Rs. {Math.round(product.price)}</span>}
                  </div>
                  <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <button className={styles.addToCart}>View Detail</button>
                  </Link>
                </div>
              </div>
            </Reveal>
          )) : <p>No best selling products found.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <Reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Featured Collections</h2>
              <p className={styles.sectionSubtitle}>Hand-picked styles for your unique taste</p>
            </div>
            <Link href="/shop" className={styles.viewAll}>View All &rarr;</Link>
          </div>
        </Reveal>
        <div className={styles.productGrid}>
          {featuredProducts.length > 0 ? featuredProducts.map((product: any, index: number) => (
            <Reveal key={product._id} threshold={0.1} style={{ animationDelay: `${index * 0.1}s` } as any}>
              <div className={styles.productCard}>
                {product.discount > 0 ? (
                  <span className={styles.badge}>{product.discount}% OFF</span>
                ) : (
                  <span className={styles.badge}>Featured</span>
                )}
                <FavoriteBtn productId={product._id} />
                <div className={styles.productImgWrapper}>
                  <img 
                    src={product.thumbnail?.url || product.images[0]?.url} 
                    alt={product.name} 
                    className={styles.productImg} 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productCategory}>{product.brand || 'Premium'}</span>
                  <Link href={`/product/${product.slug}`} className={styles.productName}>{product.name}</Link>
                  <div className={styles.priceContainer}>
                    <span className={styles.currentPrice}>Rs. {Math.round(product.discountPrice || product.price)}</span>
                    {product.discount > 0 && <span className={styles.oldPrice}>Rs. {Math.round(product.price)}</span>}
                  </div>
                  <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <button className={styles.addToCart}>View Detail</button>
                  </Link>
                </div>
              </div>
            </Reveal>
          )) : <p>No featured products found.</p>}
        </div>
      </section>
    </div>
  );
}
