import { register } from "@/lib/Services/Auth/AuthService";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const image = formData.get("image") as File;

    const userData = { name, email, password, phone };

    return await register(userData, image);
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
