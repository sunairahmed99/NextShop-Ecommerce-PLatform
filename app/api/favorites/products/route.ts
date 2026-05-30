import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/DB/dbconfig";
import FavoriteModel from "@/lib/DB/Models/FavoriteModel";
import ProductModel from "@/lib/DB/Models/Productmodel";
import { Authrequire } from "@/lib/Services/Auth/Authrequire";

export async function GET(request: NextRequest) {
  const auth = Authrequire(request);
  if (!auth.success) return auth.response!;

  try {
    await connectDB();
    
    // Find all product IDs favorited by this user
    const favorites = await FavoriteModel.find({ userId: auth.user.id }).select("productId");
    const productIds = favorites.map((f: any) => f.productId);

    if (productIds.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Fetch full product details for these IDs
    const products = await ProductModel.find({
      _id: { $in: productIds },
      isPublished: true
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Favorites Products GET error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
