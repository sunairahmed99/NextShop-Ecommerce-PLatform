import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/DB/dbconfig";
import FavoriteModel from "@/lib/DB/Models/FavoriteModel";
import { Authrequire } from "@/lib/Services/Auth/Authrequire";

// GET - fetch all favorites for logged-in user
export async function GET(request: NextRequest) {
  const auth = Authrequire(request);
  if (!auth.success) return auth.response!;

  try {
    await connectDB();
    const favorites = await FavoriteModel.find({ userId: auth.user.id }).select("productId");
    const productIds = favorites.map((f: any) => f.productId.toString());
    return NextResponse.json({ success: true, favorites: productIds });
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST - toggle favorite (add/remove)
export async function POST(request: NextRequest) {
  const auth = Authrequire(request);
  if (!auth.success) return auth.response!;

  try {
    await connectDB();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
    }

    const existing = await FavoriteModel.findOne({
      userId: auth.user.id,
      productId,
    });

    if (existing) {
      await FavoriteModel.deleteOne({ _id: existing._id });
      const count = await FavoriteModel.countDocuments({ userId: auth.user.id });
      return NextResponse.json({ success: true, added: false, count, message: "Removed from favorites" });
    } else {
      await FavoriteModel.create({ userId: auth.user.id, productId });
      const count = await FavoriteModel.countDocuments({ userId: auth.user.id });
      return NextResponse.json({ success: true, added: true, count, message: "Added to favorites" });
    }
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
