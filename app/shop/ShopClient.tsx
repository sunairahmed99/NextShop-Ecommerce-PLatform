"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/shop.module.css';
import Reveal from '../Components/Reveal';
import FavoriteBtn from '../Components/FavoriteBtn';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  discountPrice: number;
  categoryId: { _id: string; name: string };
  brand?: string;
  thumbnail?: { url: string; public_id: string };
  images: { url: string; public_id: string }[];
  isPublished: boolean;
}

interface Category {
  _id: string;
  name: string;
}

export default function ShopClient({ initialProducts, categories }: { initialProducts: Product[], categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(1000000); 
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile drawer state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, maxPrice]);

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || p.categoryId?._id === selectedCategory;
        const matchesPrice = p.discountPrice <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice && p.isPublished;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b as any).getTime() - new Date(a as any).getTime(); 
        if (sortBy === "price-low") return a.discountPrice - b.discountPrice;
        if (sortBy === "price-high") return b.discountPrice - a.discountPrice;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [initialProducts, searchTerm, selectedCategory, sortBy, maxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const maxProductPrice = Math.max(...initialProducts.map(p => p.discountPrice), 1000);

  return (
    <div className={styles.shopContainer}>
      {/* Overlay Backdrop for Mobile */}
      <div 
        className={`${styles.mobileFilterOverlay} ${isFilterOpen ? styles.mobileFilterOverlayVisible : ''}`}
        onClick={() => setIsFilterOpen(false)}
      />

      {/* Sidebar - Left Side */}
      <aside className={`${styles.sidebar} ${isFilterOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
           <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#fff' }}>Filters</h2>
           <button 
             onClick={() => setIsFilterOpen(false)}
             style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
           >
             ✕
           </button>
        </div>

        <Reveal>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>🔍 Search</h3>
            <input 
              type="text" 
              placeholder="Search products..." 
              className={styles.sortSelect} 
              style={{ width: '100%', padding: '12px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Reveal>

        <Reveal threshold={0.05}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>📂 Categories</h3>
            <ul className={styles.categoryList}>
              <li 
                className={`${styles.categoryItem} ${selectedCategory === 'all' ? styles.categoryItemActive : ''}`}
                onClick={() => { setSelectedCategory('all'); setIsFilterOpen(false); }}
              >
                All Categories
              </li>
              {categories.map(cat => (
                <li 
                  key={cat._id} 
                  className={`${styles.categoryItem} ${selectedCategory === cat._id ? styles.categoryItemActive : ''}`}
                  onClick={() => { setSelectedCategory(cat._id); setIsFilterOpen(false); }}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>💰 Price Range</h3>
            <div className={styles.priceRange}>
              <input 
                type="range" 
                min="0" 
                max="1000000" 
                step="1000"
                className={styles.rangeInput} 
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              />
              <div className={styles.priceLabels}>
                <span>Rs. 0</span>
                <span>Rs. {maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>🏷️ Brand</h3>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Filter by brand coming soon...
            </div>
          </div>
        </Reveal>
      </aside>

      {/* Main Content - Right Side */}
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.resultsCount}>
            Showing <strong>{filteredProducts.length}</strong> products
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Mobile Filter Toggle */}
            <button className={styles.mobileFilterBtn} onClick={() => setIsFilterOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              Filters
            </button>

            <span className={styles.sortByLabel}>Sort by:</span>
            <select 
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>


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
                      <button className={styles.addToCartBtn}>
                        View Detail
                      </button>
                    </Link>
                  </div>

                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '40px', padding: '20px' }}>
            <button 
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              style={{ backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', padding: '8px 16px', borderRadius: '8px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(i + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ 
                    backgroundColor: currentPage === i + 1 ? '#ec4899' : '#1a1b23', 
                    border: '1px solid #2d303e', 
                    color: '#fff', 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              style={{ backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', padding: '8px 16px', borderRadius: '8px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
