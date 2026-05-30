import React from 'react';
import FavoritesPage from './FavoritesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist & Favorites | NextShop',
  description: 'View and manage your favorite items and products on NextShop. Save them for later or add them directly to your cart.',
  keywords: ['wishlist', 'favorites', 'saved items', 'NextShop', 'shopping'],
  openGraph: {
    title: 'My Wishlist & Favorites | NextShop',
    description: 'View and manage your favorite items and products on NextShop.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Wishlist & Favorites | NextShop',
    description: 'View and manage your favorite items and products on NextShop.',
  }
};

export default function Page() {
  return <FavoritesPage />;
}
