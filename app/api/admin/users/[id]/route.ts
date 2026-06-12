import { NextRequest, NextResponse } from "next/server";
import { UserAdminService } from "@/lib/Services/admin/UserAdminService";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { id } = await params;
    await UserAdminService.deleteUser(id);
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { id } = await params;
    const { role } = await req.json();
    const updatedUser = await UserAdminService.updateUserRole(id, role);
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
