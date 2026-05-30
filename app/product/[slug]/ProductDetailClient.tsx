"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/productDetail.module.css';
import Reveal from '../../Components/Reveal';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/lib/Redux/slices/cartSlice';
import toast from 'react-hot-toast';
import FavoriteBtn from '../../Components/FavoriteBtn';
import ReviewSection from '../../Components/ReviewSection';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  discountPrice: number;
  categoryId: { _id: string; name: string };
  brand?: string;
  sku?: string;
  thumbnail?: { url: string; public_id: string };
  images: { url: string; public_id: string }[];
  colors?: any[]; // Can be string[] or {name, hex}[] depending on old/new data
  sizes?: any[]; // Can be {size, qty}[] or {name, qty}[]

  totalQty: number;
}

export default function ProductDetailClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Fetch user profile to check if logged in for reviews
  const { data: profileData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/api/auth/profile");
        return data;
      } catch (err) {
        return null;
      }
    },
    retry: false,
  });

  const isLoggedIn = !!profileData?.success;

  const allImages = product.images?.length > 0
    ? product.images
    : (product.thumbnail ? [product.thumbnail] : [{ url: '/placeholder.png', public_id: 'placeholder' }]);

  const displayImages = [...allImages];
  while (displayImages.length < 3) {
    displayImages.push(displayImages[0]);
  }
  const top3Images = displayImages.slice(0, 3);

  // Helper to map custom color names to hex codes
  const getColorHex = (name: string) => {
    const mapping: { [key: string]: string } = {
      'stealth': '#1a1a1a',
      'midnight': '#191970',
      'original': '#3b82f6',
      'ocean': '#0077be',
      'forest': '#228b22',
      'rose': '#ff007f',
      'gold': '#ffd700',
      'silver': '#c0c0c0',
      'space gray': '#71706e',
      'carbon': '#333333',
      'sand': '#c2b280',
      'navy': '#000080',
      'charcoal': '#36454f',
      'burgundy': '#800020'
    };
    const lowerName = name.toLowerCase();
    // Return mapping, or original name if it's likely a standard CSS color, 
    // otherwise a neutral fallback to avoid transparent circles.
    return mapping[lowerName] || lowerName;
  };

  const [mainImage, setMainImage] = useState(top3Images[0]?.url);
  const validColors = product.colors?.filter(c => typeof c === 'string' ? c.trim() !== '' : c?.name?.trim() !== '') || [];
  const validSizes = product.sizes?.filter(s => (s.size && s.size.trim() !== '') || (s.name && s.name.trim() !== '')) || [];

  const [selectedSize, setSelectedSize] = useState(validSizes.length > 0 ? (validSizes[0].size || validSizes[0].name) : '');
  const [selectedColor, setSelectedColor] = useState(validColors.length > 0 ? (typeof validColors[0] === 'string' ? validColors[0] : validColors[0].name) : '');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const cartItem = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      thumbnail: product.thumbnail?.url || product.images[0]?.url || '',
      qty: quantity,
      selectedColor,
      selectedSize,
      stock: product.totalQty
    };
    
    dispatch(addToCart(cartItem));
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    const cartItem = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      thumbnail: product.thumbnail?.url || product.images[0]?.url || '',
      qty: quantity,
      selectedColor,
      selectedSize,
      stock: product.totalQty
    };
    
    dispatch(addToCart(cartItem));
    router.push('/checkout');
  };

  const incrementQty = () => {
    if (quantity < product.totalQty) setQuantity(prev => prev + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <Reveal className={styles.mainImageArea}>
          <div className={styles.mainImageContainer}>
            {product.discount > 0 && (
              <div className={styles.badge}>{product.discount}% OFF</div>
            )}
            <FavoriteBtn productId={product._id} />
            <img
              key={mainImage}
              src={mainImage}
              alt={product.name}
              className={styles.mainImage}
            />
          </div>
        </Reveal>

        <Reveal style={{ animationDelay: '0.1s' } as any} className={styles.infoArea}>
          <div className={styles.info}>
            <div className={styles.breadcrumbs}>
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/shop">Shop</Link>
              <span>/</span>
              <Link href={`/shop?category=${product.categoryId?._id}`}>
                {product.categoryId?.name || 'Category'}
              </Link>
            </div>

            <div>
              {product.brand && <div className={styles.brand}>{product.brand}</div>}
              <h1 className={styles.title}>{product.name}</h1>
            </div>

            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}>Rs. {Math.round(product.discountPrice)}</span>
              {product.discount > 0 && (
                <span className={styles.oldPrice}>Rs. {Math.round(product.price)}</span>
              )}
            </div>

            <div className={styles.description}>
              {product.description}
            </div>

            <div className={styles.metaInfo}>
              {product.sku && (
                <div><strong>SKU:</strong> {product.sku}</div>
              )}
              <div><strong>Category:</strong> {product.categoryId?.name}</div>
              <div><strong>Availability:</strong> {product.totalQty > 0 ? `${product.totalQty} in stock` : 'Out of Stock'}</div>
            </div>

            {/* Colors */}
            {validColors.length > 0 && (
              <div>
                <h3 className={styles.sectionTitle}>Color</h3>
                <div className={styles.optionsGrid}>
                  {validColors.map((color, idx) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    const hexCode = typeof color === 'string' ? colorName : (color.hex || color.name);
                    return (
                      <button
                        key={idx}
                        className={`${styles.colorBtn} ${selectedColor === colorName ? styles.active : ''}`}
                        style={{ backgroundColor: colorName.toLowerCase() === 'white' ? '#f3f4f6' : getColorHex(colorName) }}
                        onClick={() => setSelectedColor(colorName)}
                        title={colorName}
                        aria-label={`Select color ${colorName}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {validSizes.length > 0 && (
              <div>
                <h3 className={styles.sectionTitle}>Size</h3>
                <div className={styles.optionsGrid}>
                  {validSizes.map((size, idx) => {
                    const sizeName = size.size || size.name;
                    const isOutOfStock = parseInt(size.qty) <= 0;
                    return (
                      <button
                        key={idx}
                        disabled={isOutOfStock}
                        className={`${styles.optionBtn} ${selectedSize === sizeName ? styles.active : ''}`}
                        style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                        onClick={() => setSelectedSize(sizeName)}
                      >
                        {sizeName} {isOutOfStock ? '(Out of Stock)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.totalQty > 0 && (
              <div>
                <h3 className={styles.sectionTitle}>Quantity</h3>
                <div className={styles.quantitySelector}>
                  <button onClick={decrementQty} className={styles.qtyBtn}>-</button>
                  <span className={styles.qtyDisplay}>{quantity}</span>
                  <button onClick={incrementQty} className={styles.qtyBtn}>+</button>
                </div>
              </div>
            )}

            <div className={styles.actionButtons}>
              <button 
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={product.totalQty <= 0}
                style={{ opacity: product.totalQty <= 0 ? 0.5 : 1 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {product.totalQty > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {product.totalQty > 0 && (
                <button className={styles.buyNowBtn} onClick={handleBuyNow}>
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal style={{ animationDelay: '0.2s' } as any} className={styles.thumbnailsArea}>
          <div className={styles.thumbnailStrip}>
            {top3Images.map((img, idx) => (
              <button
                key={`${img.public_id}-${idx}`}
                className={`${styles.thumbnailBtn} ${mainImage === img.url ? styles.active : ''}`}
                onClick={() => setMainImage(img.url)}
              >
                <img src={img.url} alt={`${product.name} - view ${idx + 1}`} className={styles.thumbnailImg} />
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <Reveal>
            <h2 className={styles.relatedTitle}>Related Products</h2>
          </Reveal>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((p, idx) => (
              <Reveal key={p._id} style={{ animationDelay: `${idx * 0.1}s` } as any}>
                <div className={styles.relatedCard}>
                  <Link href={`/product/${p.slug}`} className={styles.relatedImgWrapper}>
                    <img src={p.thumbnail?.url || p.images[0]?.url || '/placeholder.png'} alt={p.name} className={styles.relatedImg} />
                  </Link>
                  <div className={styles.relatedInfo}>
                    <Link href={`/product/${p.slug}`} className={styles.relatedName}>{p.name}</Link>
                    <div className={styles.relatedPrice}>Rs. {p.discountPrice.toFixed(2)}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <div className={styles.contentWrapper} style={{ display: 'block' }}>
        <ReviewSection productId={product._id} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
