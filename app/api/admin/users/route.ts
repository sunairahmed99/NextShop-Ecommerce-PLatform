import { NextRequest, NextResponse } from "next/server";
import { UserAdminService } from "@/lib/Services/admin/UserAdminService";

export async function GET() {
  try {
    const users = await UserAdminService.getAllUsers();
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
