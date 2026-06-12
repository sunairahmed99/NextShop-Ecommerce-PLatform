import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/Services/admin/OrderService";
import { Authrequire } from "@/lib/Services/Auth/Authrequire";

export async function POST(req: NextRequest) {
  const auth = Authrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const body = await req.json();
    body.userId = auth.user.id;

    const order = await OrderService.createOrder(body);

    return NextResponse.json(
      { success: true, message: "Order placed successfully", order },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order Create Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to place order" },
      { status: 500 }
    );
  }
}
