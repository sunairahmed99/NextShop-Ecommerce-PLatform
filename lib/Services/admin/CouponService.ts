import { connectDB } from "@/lib/DB/dbconfig";
import Coupon from "@/lib/DB/Models/Couponmodel";

export const CouponService = {
  // Get all coupons
  async getAllCoupons() {
    await connectDB();
    return await Coupon.find().sort({ createdAt: -1 });
  },

  // Get single coupon by ID
  async getCouponById(id: string) {
    await connectDB();
    const coupon = await Coupon.findById(id);
    if (!coupon) throw new Error("Coupon not found");
    return coupon;
  },

  // Get single coupon by Code
  async getCouponByCode(code: string) {
    await connectDB();
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    return coupon;
  },

  // Create coupon
  async createCoupon(data: any) {
    try {
      await connectDB();
      
      // Basic validation
      if (!data.code || !data.discountType || !data.discountValue || !data.expiryDate) {
        throw new Error("Missing required fields");
      }

      const newCoupon = new Coupon({
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        minOrderAmount: Number(data.minOrderAmount) || 0,
        maxOrderAmount: data.maxOrderAmount ? Number(data.maxOrderAmount) : null,
        maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
        usageLimit: Number(data.usageLimit) || 1,
        perUserLimit: Number(data.perUserLimit) || 1,
        expiryDate: new Date(data.expiryDate),
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      return await newCoupon.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Coupon code already exists");
      }
      console.error("CouponService.createCoupon Error:", error);
      throw error;
    }
  },

  // Update coupon
  async updateCoupon(id: string, data: any) {
    try {
      await connectDB();
      
      const coupon = await Coupon.findById(id);
      if (!coupon) throw new Error("Coupon not found");

      if (data.code) coupon.code = data.code.toUpperCase();
      if (data.discountType) coupon.discountType = data.discountType;
      if (data.discountValue !== undefined) coupon.discountValue = Number(data.discountValue);
      if (data.minOrderAmount !== undefined) coupon.minOrderAmount = Number(data.minOrderAmount);
      if (data.maxOrderAmount !== undefined) coupon.maxOrderAmount = data.maxOrderAmount ? Number(data.maxOrderAmount) : null;
      if (data.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null;
      if (data.usageLimit !== undefined) coupon.usageLimit = Number(data.usageLimit);
      if (data.perUserLimit !== undefined) coupon.perUserLimit = Number(data.perUserLimit);
      if (data.expiryDate) coupon.expiryDate = new Date(data.expiryDate);
      if (data.isActive !== undefined) coupon.isActive = data.isActive;

      return await coupon.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Coupon code already exists");
      }
      console.error("CouponService.updateCoupon Error:", error);
      throw error;
    }
  },

  // Delete coupon
  async deleteCoupon(id: string) {
    await connectDB();
    return await Coupon.findByIdAndDelete(id);
  },
};
