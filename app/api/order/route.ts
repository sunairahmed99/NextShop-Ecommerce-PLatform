import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { OrderService } from "@/lib/Services/admin/OrderService";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    body.userId = decoded.id;

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
