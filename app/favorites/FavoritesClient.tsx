"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Redux/store";
import { setFavorites, removeFavorite } from "@/lib/Redux/slices/favoriteSlice";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./favorites.module.css";
import HeroSlider from "../Components/HeroSlider";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number;
  discount: number;
  thumbnail?: { url: string };
  images: { url: string }[];
  brand?: string;
}

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const favoriteIds = useSelector((state: RootState) => state.favorites.items);
  const [products, setProducts] = useState<Product[]>([]);
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

  // Fetch favorites, product details, and banners
  useEffect(() => {
    const fetchData = async () => {
      // Fetch banners (public)
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
        const { data: favData } = await axios.get("/api/favorites");
        if (favData.success) {
          dispatch(setFavorites(favData.favorites));

          if (favData.favorites.length > 0) {
            const { data: prodData } = await axios.get("/api/favorites/products");
            if (prodData.success) {
              setProducts(prodData.products);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, dispatch]);

  const handleRemove = async (productId: string) => {
    dispatch(removeFavorite(productId));
    setProducts((prev) => prev.filter((p) => p._id !== productId));

    try {
      await axios.post("/api/favorites", { productId });
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {banners.length > 0 && <HeroSlider banners={banners} noMargin={true} />}
      <div className={styles.container}>
        {!isLoggedIn ? (
          <div className={styles.emptyState}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2>Please login to see your favorites</h2>
            <p>Sign in to save and view your favorite products</p>
            <Link href="/auth/login" className={styles.loginBtn}>Login Now</Link>
          </div>
        ) : products.length === 0 ? (
          <>
            <h1 className={styles.pageTitle}>My Favorites</h1>
            <div className={styles.emptyState}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <h2>No favorites yet</h2>
              <p>Start adding products to your wishlist!</p>
              <Link href="/shop" className={styles.shopBtn}>Browse Shop</Link>
            </div>
          </>
        ) : (
          <>
            <h1 className={styles.pageTitle}>My Favorites <span className={styles.count}>({products.length})</span></h1>
            <div className={styles.grid}>
              {products.map((product) => (
                <div key={product._id} className={styles.card}>
                  <button className={styles.removeBtn} onClick={() => handleRemove(product._id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  {product.discount > 0 && (
                    <span className={styles.badge}>{product.discount}% OFF</span>
                  )}
                  <Link href={`/product/${product.slug}`}>
                    <div className={styles.imgWrapper}>
                      <img
                        src={product.thumbnail?.url || product.images[0]?.url}
                        alt={product.name}
                        className={styles.img}
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className={styles.info}>
                    <span className={styles.brand}>{product.brand || "Premium"}</span>
                    <Link href={`/product/${product.slug}`} className={styles.name}>{product.name}</Link>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>Rs. {Math.round(product.discountPrice || product.price)}</span>
                      {product.discount > 0 && <span className={styles.oldPrice}>Rs. {Math.round(product.price)}</span>}
                    </div>
                    <Link href={`/product/${product.slug}`} className={styles.viewBtn}>View Detail</Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
