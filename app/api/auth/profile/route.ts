import { getProfile, updateProfile } from "@/lib/Services/Userservice";
import { NextRequest } from "next/server";
import { Authrequire } from "@/lib/Services/Auth/Authrequire";

export async function GET(request: NextRequest) {
  const auth = Authrequire(request);
  if (!auth.success) return auth.response!;

  return await getProfile(auth.user.id);
}

export async function POST(request: NextRequest) {
  const auth = Authrequire(request);
  if (!auth.success) return auth.response!;

  const formData = await request.formData();
  return await updateProfile(auth.user.id, formData);
}
