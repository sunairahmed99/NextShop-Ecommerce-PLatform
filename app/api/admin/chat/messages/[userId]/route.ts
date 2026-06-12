import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/Services/admin/ChatService";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { userId } = await params;
    const messages = await ChatService.getMessages(userId);
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
