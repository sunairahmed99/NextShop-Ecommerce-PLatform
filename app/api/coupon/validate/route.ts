import { CouponService } from "@/lib/Services/admin/CouponService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await CouponService.getCouponByCode(code);

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    // Check if expired
    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Check min order amount
    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount for this coupon is Rs. ${coupon.minOrderAmount}` 
      }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
      discountAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      code: coupon.code
    });

  } catch (error: any) {
    console.error("Validate Coupon Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
