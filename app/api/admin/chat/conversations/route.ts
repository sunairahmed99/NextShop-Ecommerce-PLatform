import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/Services/admin/ChatService";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

export async function GET(req: NextRequest) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const conversations = await ChatService.getConversations();
    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
