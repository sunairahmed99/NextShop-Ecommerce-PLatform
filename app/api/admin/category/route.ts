import { CategoryService } from "@/lib/Services/admin/CategoryService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await CategoryService.getAllCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const category = await CategoryService.createCategory(formData);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
