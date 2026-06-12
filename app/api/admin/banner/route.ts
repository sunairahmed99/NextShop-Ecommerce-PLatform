import { NextRequest, NextResponse } from "next/server";
import { BannerService } from "@/lib/Services/admin/BannerService";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

export async function GET(req: NextRequest) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const banners = await BannerService.getAllBanners();
    return NextResponse.json(banners, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const formData = await req.formData();
    const newBanner = await BannerService.createBanner(formData);
    return NextResponse.json(newBanner, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
