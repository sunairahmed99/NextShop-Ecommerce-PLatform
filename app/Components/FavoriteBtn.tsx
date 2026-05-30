"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/Redux/store";
import { addFavorite, removeFavorite } from "@/lib/Redux/slices/favoriteSlice";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export default function FavoriteBtn({ productId }: { productId: string }) {
  const dispatch = useDispatch();
  const favoriteItems = useSelector((state: RootState) => state.favorites.items);
  const isFav = favoriteItems.includes(productId);

  // Check if user is logged in
  const { data: profileData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/profile");
      return data;
    },
    retry: false,
  });

  const isLoggedIn = !!profileData?.success;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please login first");
      return;
    }

    // Optimistic update
    if (isFav) {
      dispatch(removeFavorite(productId));
    } else {
      dispatch(addFavorite(productId));
    }

    try {
      const { data } = await axios.post("/api/favorites", { productId });
      if (!data.success) {
        // Revert on failure
        if (isFav) {
          dispatch(addFavorite(productId));
        } else {
          dispatch(removeFavorite(productId));
        }
        toast.error(data.message || "Failed to update favorites");
      } else {
        toast.success(data.added ? "Added to favorites" : "Removed from favorites");
      }
    } catch {
      // Revert on error
      if (isFav) {
        dispatch(addFavorite(productId));
      } else {
        dispatch(removeFavorite(productId));
      }
      toast.error("Something went wrong");
    }
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        width: "36px",
        height: "36px",
        background: isFav ? "#ec4899" : "rgba(15, 16, 21, 0.6)",
        backdropFilter: "blur(4px)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "none",
        zIndex: 10,
      }}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isFav ? "#fff" : "none"}
        stroke={isFav ? "#fff" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}
