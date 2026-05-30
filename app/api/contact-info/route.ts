import { NextRequest, NextResponse } from "next/server";
import { ContactInfoService } from "@/lib/Services/ContactInfoService";

export async function GET() {
  try {
    const info = await ContactInfoService.getContactInfo();
    return NextResponse.json(info, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updatedInfo = await ContactInfoService.updateContactInfo(body);
    return NextResponse.json(updatedInfo, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
