import { NextRequest, NextResponse } from "next/server";
import { ContactAdminService } from "@/lib/Services/admin/ContactAdminService";

export async function GET() {
  try {
    const contacts = await ContactAdminService.getAllContacts();
    return NextResponse.json(contacts, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
