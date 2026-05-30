import React from 'react';
import OrdersPage from './OrdersClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders & Purchase History | NextShop',
  description: 'View your order history, track current shipments, and manage past purchases at NextShop.',
  keywords: ['my orders', 'order history', 'purchase history', 'NextShop', 'track package'],
  openGraph: {
    title: 'My Orders & Purchase History | NextShop',
    description: 'View your order history, track current shipments, and manage past purchases.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Orders & Purchase History | NextShop',
    description: 'View your order history, track current shipments, and manage past purchases.',
  }
};

export default function Page() {
  return <OrdersPage />;
}
