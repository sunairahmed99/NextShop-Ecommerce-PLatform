import { NextRequest, NextResponse } from "next/server";
import { ContactAdminService } from "@/lib/Services/admin/ContactAdminService";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

export async function GET(req: NextRequest) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const contacts = await ContactAdminService.getAllContacts();
    return NextResponse.json(contacts, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
