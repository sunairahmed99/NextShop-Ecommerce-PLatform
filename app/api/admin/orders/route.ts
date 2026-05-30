import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/Services/admin/OrderService";

// GET all orders
export async function GET() {
  try {
    const orders = await OrderService.getAllOrders();
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
