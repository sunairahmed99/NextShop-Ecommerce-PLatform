import { login } from "@/lib/Services/Auth/AuthService";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const credentials = await req.json();
  return await login(credentials);
}
