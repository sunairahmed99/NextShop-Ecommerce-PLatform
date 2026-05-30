"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/reviews.module.css";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Link from "next/link";
import Reveal from "./Reveal";

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    imageurl?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
  isLoggedIn: boolean;
}

export default function ReviewSection({ productId, isLoggedIn }: ReviewSectionProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/reviews?productId=${productId}`);
      return data;
    },
  });

  // Post review mutation
  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/reviews", {
        productId,
        rating,
        comment,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Review submitted!");
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    submitReview();
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className={interactive ? styles.ratingInput : styles.ratingStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${interactive ? styles.starBtn : styles.star} ${
              star <= (interactive ? rating : count) ? styles.starActive : ""
            }`}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const reviews = data?.reviews || [];
  const stats = data?.stats || { averageRating: 0, totalReviews: 0 };

  return (
    <div className={styles.reviewSection}>
      <Reveal>
        <h2 className={styles.title}>Customer Reviews</h2>
      </Reveal>

      {/* Summary Stats */}
      <Reveal style={{ animationDelay: "0.1s" } as any}>
        <div className={styles.statsContainer}>
          <div className={styles.averageRating}>
            <div className={styles.ratingNumber}>
              {stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
            </div>
            {renderStars(Math.round(stats.averageRating))}
            <div className={styles.totalReviews}>{stats.totalReviews} reviews</div>
          </div>
          <div className={styles.statsInfo}>
            <p>
              Based on genuine feedback from verified buyers.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Review Form */}
      <Reveal style={{ animationDelay: "0.2s" } as any}>
        {isLoggedIn ? (
          <form className={styles.reviewForm} onSubmit={handleSubmit}>
            <h3 className={styles.formTitle}>Write a Review</h3>
            <div style={{ marginBottom: "10px", color: "#9ca3af", fontSize: "0.9rem" }}>
              Your rating:
            </div>
            {renderStars(rating, true)}
            <textarea
              className={styles.textarea}
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending ? "Submitting..." : "Post Review"}
            </button>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            Please <Link href="/auth/login" className={styles.loginLink}>login</Link> to post a review.
          </div>
        )}
      </Reveal>

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {isLoading ? (
          <div style={{ textAlign: "center", color: "#6b7280" }}>Loading reviews...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review: Review, index: number) => (
            <Reveal key={review._id} style={{ animationDelay: `${index * 0.05}s` } as any}>
              <div className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {review.userId.imageurl ? (
                        <img src={review.userId.imageurl} alt={review.userId.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        review.userId.name[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className={styles.userName}>{review.userId.name}</div>
                      <div className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            </Reveal>
          ))
        ) : (
          <div className={styles.noReviews}>
            <h3>No reviews yet</h3>
            <p>Be the first to share your thoughts on this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}
