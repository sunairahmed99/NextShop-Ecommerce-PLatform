"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '../../Components/Reveal';
import FavoriteBtn from '../../Components/FavoriteBtn';
import styles from '../../styles/shop.module.css';
import catStyles from '../../styles/category.module.css';


interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  discountPrice: number;
  brand?: string;
  thumbnail?: { url: string; public_id: string };
  images: { url: string; public_id: string }[];
  isPublished: boolean;
}

interface Props {
  products: Product[];
  categoryName: string;
  categoryImage: string;
  categoryId: string;
}

export default function CategoryClient({ products, categoryName, categoryImage, categoryId }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  const publishedProducts = useMemo(() => products.filter(p => p.isPublished), [products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, maxPrice]);

  const filteredProducts = useMemo(() => {
    return publishedProducts
      .filter(p => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = p.discountPrice <= maxPrice;
        return matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.discountPrice - b.discountPrice;
        if (sortBy === 'price-high') return b.discountPrice - a.discountPrice;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [publishedProducts, searchTerm, sortBy, maxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ backgroundColor: '#0f1016', minHeight: '100vh' }}>

      {/* Category Hero Banner */}
      <div className={catStyles.heroBanner} style={categoryImage ? { backgroundImage: `url(${categoryImage})` } : {}}>
        <div className={catStyles.heroOverlay}>
          <Reveal>
            <div className={catStyles.heroContent}>
              <p className={catStyles.heroSub}>Explore Collection</p>
              <h1 className={catStyles.heroTitle}>{categoryName}</h1>
              <p className={catStyles.heroCount}>
                {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className={catStyles.heroBreadcrumb}>
                <Link href="/" className={catStyles.breadLink}>Home</Link>
                <span className={catStyles.breadSep}>›</span>
                <Link href="/shop" className={catStyles.breadLink}>Shop</Link>
                <span className={catStyles.breadSep}>›</span>
                <span className={catStyles.breadCurrent}>{categoryName}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={catStyles.controlsBar}>
        <div className={catStyles.controlsInner}>
          {/* Search */}
          <div className={catStyles.searchWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search in this category..."
              className={catStyles.searchInput}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Price Range */}
          <div className={catStyles.priceWrap}>
            <span className={catStyles.priceLabel}>Up to Rs. {maxPrice.toLocaleString()}</span>
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={maxPrice}
              onChange={e => setMaxPrice(parseInt(e.target.value))}
              className={catStyles.rangeInput}
            />
          </div>

          {/* Sort */}
          <div className={catStyles.sortWrap}>
            <span className={catStyles.sortLabel}>Sort:</span>
            <select
              className={catStyles.sortSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>

          <div className={catStyles.countBadge}>
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={catStyles.gridWrapper}>
        {paginatedProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {paginatedProducts.map((product, index) => (
              <Reveal key={product._id} threshold={0.1} style={{ animationDelay: `${index * 0.05}s` } as any}>
                <div className={styles.productCard}>
                  <Link href={`/product/${product.slug}`} className={styles.imageWrapper}>
                    {product.discount > 0 && (
                      <div className={styles.badge}>{product.discount}% OFF</div>
                    )}
                    <FavoriteBtn productId={product._id} />
                    <img
                      src={product.thumbnail?.url || product.images[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      className={styles.productImg}
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                  <div className={styles.productInfo}>
                    <span className={styles.brand}>{product.brand || 'Premium'}</span>
                    <Link href={`/product/${product.slug}`} className={styles.productName}>
                      {product.name}
                    </Link>
                    <div className={styles.priceContainer}>
                      <span className={styles.currentPrice}>Rs. {Math.round(product.discountPrice)}</span>
                      {product.discount > 0 && (
                        <span className={styles.oldPrice}>Rs. {Math.round(product.price)}</span>
                      )}
                    </div>
                    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <button className={styles.addToCartBtn}>View Detail</button>
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <h3>No products found</h3>
            <p>Try adjusting your search or price range.</p>
            <Link href="/shop" style={{ color: '#3b82f6', marginTop: '12px', display: 'inline-block' }}>
              ← Browse All Products
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '40px', padding: '20px' }}>
            <button
              onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === 1}
              style={{ backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', padding: '8px 16px', borderRadius: '8px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ backgroundColor: currentPage === i + 1 ? '#3b82f6' : '#1a1b23', border: '1px solid #2d303e', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === totalPages}
              style={{ backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', padding: '8px 16px', borderRadius: '8px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
