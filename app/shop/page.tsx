import React from 'react';
import { ProductService } from '@/lib/Services/admin/ProductService';
import { CategoryService } from '@/lib/Services/admin/CategoryService';
import { BannerService } from '@/lib/Services/admin/BannerService';
import HeroSlider from '../Components/HeroSlider';
import ShopClient from './ShopClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products | NextShop',
  description: 'Browse our complete collection of premium products. Find the best deals on electronics, fashion, and more at NextShop.',
  keywords: ['shop', 'ecommerce', 'buy online', 'NextShop', 'products', 'store'],
  openGraph: {
    title: 'Shop All Products | NextShop',
    description: 'Browse our complete collection of premium products.',
    type: 'website',
    siteName: 'NextShop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop All Products | NextShop',
    description: 'Browse our complete collection of premium products.',
  }
};
export const revalidate = 60;

export default async function ShopPage() {
  let products = [];
  let categories = [];
  let banners = [];

  try {

    const [productsData, categoriesData, bannersData] = await Promise.all([
      ProductService.getAllProducts(),
      CategoryService.getAllCategories(),
      BannerService.getAllBanners()
    ]);

    products = JSON.parse(JSON.stringify(productsData || []));
    categories = JSON.parse(JSON.stringify(categoriesData || []));
    banners = JSON.parse(JSON.stringify(bannersData || []));
  } catch (error) {
    console.error("Shop Page Fetch Error:", error);
  }

  return (
    <div style={{ backgroundColor: '#0f1016', overflowX: 'hidden' }}>
      {banners.length > 0 ? (
        <HeroSlider banners={banners} noMargin={true} />
      ) : (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1b23' }}>
          <h1 style={{ color: '#fff' }}>Shop Our Collection</h1>
        </div>
      )}

      <ShopClient initialProducts={products} categories={categories} />
    </div>
  );
}

