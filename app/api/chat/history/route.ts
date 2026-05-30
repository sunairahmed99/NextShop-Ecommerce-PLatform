import { NextRequest, NextResponse } from "next/server";
import { Authrequire } from "@/lib/Services/Auth/Authrequire";
import { ChatService } from "@/lib/Services/admin/ChatService";

export async function GET(request: NextRequest) {
  try {
    const auth = Authrequire(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.user.id;
    const messages = await ChatService.getMessages(userId);

    return NextResponse.json({
      success: true,
      messages: messages.map((m: any) => ({
        id: m._id,
        text: m.message,
        sender: m.isAdmin ? "admin" : "user",
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
