import React from 'react';
import LoginPage from './LoginClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | NextShop',
  description: 'Sign in to your NextShop account to manage your wishlist, track orders, and experience custom e-commerce.',
  keywords: ['login', 'sign in', 'account', 'NextShop'],
  openGraph: {
    title: 'Sign In | NextShop',
    description: 'Sign in to your NextShop account.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In | NextShop',
    description: 'Sign in to your NextShop account.',
  }
};

export default function Page() {
  return <LoginPage />;
}
