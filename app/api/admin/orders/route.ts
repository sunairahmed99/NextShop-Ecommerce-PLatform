import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/Services/admin/OrderService";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

// GET all orders
export async function GET(req: NextRequest) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const orders = await OrderService.getAllOrders();
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
