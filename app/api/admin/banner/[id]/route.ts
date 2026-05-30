import { NextRequest, NextResponse } from "next/server";
import { BannerService } from "@/lib/Services/admin/BannerService";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const banner = await BannerService.getBannerById(id);
    return NextResponse.json(banner, { status: 200 });
  } catch (error: any) {
    const status = error.message === "Banner not found" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const updatedBanner = await BannerService.updateBanner(id, formData);
    return NextResponse.json(updatedBanner, { status: 200 });
  } catch (error: any) {
    const status = error.message === "Banner not found" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await BannerService.deleteBanner(id);
    return NextResponse.json({ message: "Banner deleted successfully" }, { status: 200 });
  } catch (error: any) {
    const status = error.message === "Banner not found" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
