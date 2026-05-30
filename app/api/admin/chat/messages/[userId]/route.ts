import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/Services/admin/ChatService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const messages = await ChatService.getMessages(userId);
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
