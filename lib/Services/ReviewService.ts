import { connectDB } from "../DB/dbconfig";
import Review from "../DB/Models/ReviewModel";
import mongoose from "mongoose";

export const ReviewService = {
  // Create a new review
  async createReview(reviewData: { userId: string; productId: string; rating: number; comment: string }) {
    await connectDB();
    const review = await Review.create(reviewData);
    return review;
  },

  // Get all reviews for a specific product
  async getProductReviews(productId: string) {
    await connectDB();
    return await Review.find({ productId })
      .populate("userId", "name imageurl")
      .sort({ createdAt: -1 });
  },

  // Check if a user has already reviewed a product
  async hasUserReviewed(userId: string, productId: string) {
    await connectDB();
    const review = await Review.findOne({ userId, productId });
    return !!review;
  },

  // Get average rating for a product
  async getAverageRating(productId: string) {
    await connectDB();
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return stats.length > 0 ? stats[0] : { averageRating: 0, totalReviews: 0 };
  },

  // Get recent reviews for community feed
  async getRecentReviews(limit = 10) {
    await connectDB();
    return await Review.find()
      .populate("userId", "name imageurl")
      .populate("productId", "name slug thumbnail images")
      .sort({ createdAt: -1 })
      .limit(limit);
  },
};
