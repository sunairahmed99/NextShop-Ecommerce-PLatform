import React from 'react';
import RegisterPage from './RegisterClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | NextShop',
  description: 'Join the NextShop community. Register a new account to unlock custom shopping experiences, wishlists, and seamless orders.',
  keywords: ['register', 'sign up', 'create account', 'NextShop'],
  openGraph: {
    title: 'Create Account | NextShop',
    description: 'Join the NextShop community and create a new account today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Account | NextShop',
    description: 'Join the NextShop community and create a new account today.',
  }
};

export default function Page() {
  return <RegisterPage />;
}
