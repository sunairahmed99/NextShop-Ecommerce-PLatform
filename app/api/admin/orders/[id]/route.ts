import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/Services/admin/OrderService";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

// GET single order
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { id } = await params;
    const order = await OrderService.getOrderById(id);
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update order status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { id } = await params;
    const { status } = await req.json();
    const order = await OrderService.updateOrderStatus(id, status);
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE order
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { id } = await params;
    await OrderService.deleteOrder(id);
    return NextResponse.json({ message: "Order deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
