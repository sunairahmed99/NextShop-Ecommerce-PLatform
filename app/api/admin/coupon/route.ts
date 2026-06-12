import { CouponService } from "@/lib/Services/admin/CouponService";
import { NextRequest, NextResponse } from "next/server";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

// GET all coupons
export async function GET(req: NextRequest) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const coupons = await CouponService.getAllCoupons();
    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create coupon
export async function POST(req: NextRequest) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const body = await req.json();
    const coupon = await CouponService.createCoupon(body);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
