import { userverify } from "@/lib/Services/Auth/AuthService";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  return await userverify(code);
}
