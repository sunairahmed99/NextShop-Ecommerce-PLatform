import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // Coupon Code
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // percentage or fixed
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    // 20% or 500 rs
    discountValue: {
      type: Number,
      required: true,
    },

    // Minimum cart amount required
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    // Maximum cart amount allowed (optional)
    maxOrderAmount: {
      type: Number,
      default: null,
    },

    // Discount cap
    maxDiscountAmount: {
      type: Number,
      default: null,
    },

    // Total coupon usage limit
    usageLimit: {
      type: Number,
      default: 1,
    },

    // Current usage count
    usedCount: {
      type: Number,
      default: 0,
    },

    // Per user limit
    perUserLimit: {
      type: Number,
      default: 1,
    },

    // Expiry
    expiryDate: {
      type: Date,
      required: true,
    },

    // Active / inactive
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;
