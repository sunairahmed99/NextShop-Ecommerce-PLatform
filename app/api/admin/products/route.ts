import { ProductService } from "@/lib/Services/admin/ProductService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await ProductService.getAllProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const product = await ProductService.createProduct(formData);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
