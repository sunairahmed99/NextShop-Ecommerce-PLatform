import React from 'react';
import ForgotPassPage from './ForgotPassClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | NextShop',
  description: 'Recover your NextShop account password. Enter your registered email to receive a password reset code.',
  keywords: ['forgot password', 'recover account', 'password reset', 'NextShop'],
  openGraph: {
    title: 'Forgot Password | NextShop',
    description: 'Recover your NextShop account password.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgot Password | NextShop',
    description: 'Recover your NextShop account password.',
  }
};

export default function Page() {
  return <ForgotPassPage />;
}
