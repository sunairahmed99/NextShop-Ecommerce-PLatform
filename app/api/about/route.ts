import { NextRequest, NextResponse } from "next/server";
import { AboutService } from "@/lib/Services/AboutService";

export async function GET() {
  try {
    const about = await AboutService.getAbout();
    return NextResponse.json(about, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const updatedAbout = await AboutService.updateAbout(formData);
    return NextResponse.json(updatedAbout, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
