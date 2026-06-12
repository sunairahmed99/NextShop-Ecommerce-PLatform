import { ProductService } from "@/lib/Services/admin/ProductService";
import { NextRequest, NextResponse } from "next/server";
import { AdminAuthrequire } from "@/lib/Services/Auth/AdminAuthrequire";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { id } = await params;
    const product = await ProductService.getProductById(id);
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { id } = await params;
    const formData = await req.formData();
    const product = await ProductService.updateProduct(id, formData);
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = AdminAuthrequire(req);
  if (!auth.success) return auth.response!;

  try {
    const { id } = await params;
    await ProductService.deleteProduct(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
