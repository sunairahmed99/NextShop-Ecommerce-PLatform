import { NextResponse } from "next/server";
import { ChatService } from "@/lib/Services/admin/ChatService";

export async function GET() {
  try {
    const conversations = await ChatService.getConversations();
    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
