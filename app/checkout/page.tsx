import React from 'react';
import CheckoutPage from './CheckoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | NextShop',
  description: 'Complete your purchase securely. Enter your shipping details, review your order, and choose your payment method.',
  keywords: ['checkout', 'payment', 'Stripe', 'COD', 'purchase', 'NextShop'],
  openGraph: {
    title: 'Secure Checkout | NextShop',
    description: 'Complete your purchase securely on NextShop.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secure Checkout | NextShop',
    description: 'Complete your purchase securely on NextShop.',
  }
};

export default function Page() {
  return <CheckoutPage />;
}
