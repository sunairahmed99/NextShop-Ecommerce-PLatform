import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/Services/PaymentService";
import { Authrequire } from "@/lib/Services/Auth/Authrequire";

export async function POST(req: NextRequest) {
  const auth = Authrequire(req);
  if (!auth.success) return auth.response!;

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
