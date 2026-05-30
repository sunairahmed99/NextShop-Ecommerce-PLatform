import React from 'react';
import ResetPassPage from './ResetPassClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | NextShop',
  description: 'Create a new password to secure and access your NextShop account.',
  keywords: ['reset password', 'new password', 'NextShop', 'security'],
  openGraph: {
    title: 'Reset Password | NextShop',
    description: 'Create a new password to secure and access your NextShop account.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reset Password | NextShop',
    description: 'Create a new password to secure and access your NextShop account.',
  }
};

export default function Page() {
  return <ResetPassPage />;
}
