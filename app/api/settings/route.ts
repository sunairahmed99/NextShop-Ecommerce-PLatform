import { NextRequest, NextResponse } from "next/server";
import { WebsiteSettingsService } from "@/lib/Services/WebsiteSettingsService";

export async function GET() {
  try {
    const settings = await WebsiteSettingsService.getSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const logo = formData.get("logo");
    
    // Convert formData to object
    const data: any = {};
    formData.forEach((value, key) => {
      if (key !== "logo") {
        data[key] = value;
      }
    });

    const updatedSettings = await WebsiteSettingsService.updateSettings(data, logo);
    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
