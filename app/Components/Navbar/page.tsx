"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Redux/store";
import { openCart } from "@/lib/Redux/slices/cartSlice";
import { setFavorites } from "@/lib/Redux/slices/favoriteSlice";
import AdminGuard from "../AdminGuard";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  
  const { items } = useSelector((state: RootState) => state.cart);
  const favoriteItems = useSelector((state: RootState) => state.favorites.items);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user profile to check if logged in
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/profile");
      return data;
    },
    retry: false,
  });

  const isLoggedIn = !!profileData?.success;

  // Fetch favorites when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      axios.get("/api/favorites").then(({ data }) => {
        if (data.success) {
          dispatch(setFavorites(data.favorites));
        }
      }).catch(() => {});
    }
  }, [isLoggedIn, dispatch]);

  // Logout mutation
  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.get("/api/auth/logout");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userProfile"], null);
      toast.success(data.message || "Logged out successfully");
      router.push("/");
      router.refresh();
      setIsMobileMenuOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Logout failed");
    },
  });

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "SHOP", href: "/shop" },
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ];

  return (
    <nav className="bg-black text-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 border-b border-gray-800 shadow-lg">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-2xl font-bold tracking-tighter hover:text-gray-300 transition-colors">
          <span className="text-blue-500">NEXT</span>SHOP
        </Link>
      </div>

      {/* Center Menu (Desktop) */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href} className="hover:text-blue-400 transition-colors">
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Cart Icon */}
        <button 
          className="p-2 text-gray-400 hover:text-blue-400 transition-colors relative focus:outline-none"
          onClick={() => dispatch(openCart())}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {items.length}
          </span>
        </button>

        {/* Favorites Icon */}
        <Link 
          href="/favorites"
          className="p-2 text-gray-400 hover:text-pink-400 transition-colors relative focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {favoriteItems.length > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {favoriteItems.length}
            </span>
          )}
        </Link>

        {/* Profile Dropdown (Desktop) */}
        <div className="relative hidden md:block" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all focus:outline-none"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : isLoggedIn && profileData?.data?.imageurl ? (
              <img src={profileData.data.imageurl} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : isLoggedIn && profileData?.data?.name ? (
              <span className="text-sm font-bold text-gray-300">
                {profileData.data.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-950 border border-gray-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="py-1">
                {!isLoggedIn ? (
                  <>
                    <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-900 hover:text-blue-400 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                      Login
                    </Link>
                    <Link href="/auth/register" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-900 hover:text-blue-400 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-900 hover:text-blue-400 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      My Orders
                    </Link>
                    <Link href="/auth/userprofile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-900 hover:text-blue-400 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Profile
                    </Link>
                    <AdminGuard>
                      <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-500 hover:bg-gray-900 hover:text-yellow-400 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                        Admin Panel
                      </Link>
                    </AdminGuard>
                    <div className="border-t border-gray-800 my-1"></div>
                    <button disabled={isLoggingOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-900 transition-colors disabled:opacity-50" onClick={() => { setIsDropdownOpen(false); logout(); }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-b border-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        } z-40`}
      >
        <div className="flex flex-col items-center p-8 space-y-6 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xl font-semibold tracking-widest hover:text-blue-400 transition-colors w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-800 pt-6 mt-2 w-full flex flex-col items-center space-y-5 text-white">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-base text-gray-400 hover:text-blue-400 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  LOGIN
                </Link>
                <Link
                  href="/auth/register"
                  className="px-8 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  REGISTER
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/orders"
                  className="text-base text-gray-400 hover:text-blue-400 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  MY ORDERS
                </Link>
                <Link
                  href="/auth/userprofile"
                  className="text-base text-gray-400 hover:text-blue-400 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  MY PROFILE
                </Link>
                <AdminGuard>
                  <Link
                    href="/admin/dashboard"
                    className="text-base text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ADMIN PANEL
                  </Link>
                </AdminGuard>
                <button
                  disabled={isLoggingOut}
                  className="text-base text-red-500 hover:text-red-400 font-medium disabled:opacity-50 transition-colors"
                  onClick={() => {
                    logout();
                  }}
                >
                  {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
