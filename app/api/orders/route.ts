import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/Services/admin/OrderService";
import { Authrequire } from "@/lib/Services/Auth/Authrequire";

export async function GET(request: NextRequest) {
  const auth = Authrequire(request);
  if (!auth.success) return auth.response!;

  try {
    // Fetch orders for this user using the existing service
    const orders = await OrderService.getOrdersByUser(auth.user.id);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("User Orders GET error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
