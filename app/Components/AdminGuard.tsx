"use client";

import React, { ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function AdminGuard({ children, fallback = null, redirectTo }: AdminGuardProps) {
  const router = useRouter();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/profile");
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Share cache with other components like Navbar
  });

  const role = profileData?.data?.role;

  useEffect(() => {
    if (!isLoading && role !== "admin" && redirectTo) {
      router.push(redirectTo);
    }
  }, [isLoading, role, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Render children only if user is an admin
  if (role === "admin") {
    return <>{children}</>;
  }

  // Otherwise return fallback (null by default)
  return <>{fallback}</>;
}
