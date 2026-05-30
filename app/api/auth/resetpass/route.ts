import { resetpassword } from "@/lib/Services/Auth/AuthService";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { code, newPassword, password } = await req.json();
  
  // Handle both 'newPassword' and 'password' fields from the request
  const pass = newPassword || password;
  
  return await resetpassword(code, pass);
}
