import { forgotpassword } from "@/lib/Services/Auth/AuthService";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  return await forgotpassword(email);
}
