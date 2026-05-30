import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12 px-6 md:px-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="space-y-4">
          <Link href="/" className="text-xl font-bold text-white tracking-tighter">
            <span className="text-blue-500">NEXT</span>SHOP
          </Link>
          <p className="text-sm leading-relaxed">
            Premium e-commerce experience built with Next.js and Tailwind CSS.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
            <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-white font-semibold mb-4">Stay Connected</h3>
          <p className="text-xs mb-4 text-gray-500">Subscribe to get latest updates and offers.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Email address"
              className="bg-gray-950 border border-gray-800 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors text-sm font-medium">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
        <p>&copy; {new Date().getFullYear()} NEXTSHOP. All rights reserved.</p>
        <div className="flex space-x-6">
          <Link href="#" className="hover:text-white">Facebook</Link>
          <Link href="#" className="hover:text-white">Twitter</Link>
          <Link href="#" className="hover:text-white">Instagram</Link>
          <Link href="#" className="hover:text-white">LinkedIn</Link>
        </div>
      </div>
    </footer>
  );
}
