import { NextResponse } from "next/server";
import { PaymentService } from "@/lib/Services/PaymentService";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const result = await PaymentService.createPaymentIntent(amount);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
