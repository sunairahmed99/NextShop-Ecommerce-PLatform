import { NextRequest, NextResponse } from "next/server";
import { ContactAdminService } from "@/lib/Services/admin/ContactAdminService";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await ContactAdminService.deleteContact(id);
    return NextResponse.json({ message: "Contact deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
