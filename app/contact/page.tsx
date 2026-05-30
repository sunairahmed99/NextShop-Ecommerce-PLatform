import React from 'react';
import ContactPage from './ContactClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | NextShop',
  description: 'Get in touch with the NextShop support team. We are here to help you with your queries, orders, and feedback.',
  keywords: ['contact us', 'support', 'customer care', 'NextShop', 'help'],
  openGraph: {
    title: 'Contact Us | NextShop',
    description: 'Get in touch with the NextShop support team.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | NextShop',
    description: 'Get in touch with the NextShop support team.',
  }
};

export default function Page() {
  return <ContactPage />;
}
