import { submitContact } from "@/lib/Services/ContactService";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return await submitContact(body);
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
