import { NextRequest, NextResponse } from "next/server";
import { BannerService } from "@/lib/Services/admin/BannerService";

export async function GET() {
  try {
    const banners = await BannerService.getAllBanners();
    return NextResponse.json(banners, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const newBanner = await BannerService.createBanner(formData);
    return NextResponse.json(newBanner, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
