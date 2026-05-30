import { NextResponse } from "next/server";
import { ReviewService } from "@/lib/Services/ReviewService";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

// GET reviews for a product
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      const reviews = await ReviewService.getRecentReviews();
      return NextResponse.json({ success: true, reviews }, { status: 200 });
    }

    const reviews = await ReviewService.getProductReviews(productId);
    const stats = await ReviewService.getAverageRating(productId);

    return NextResponse.json({ success: true, reviews, stats }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST a new review
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    // Check if user already reviewed
    const alreadyReviewed = await ReviewService.hasUserReviewed(decoded.id, productId);
    if (alreadyReviewed) {
      return NextResponse.json({ success: false, message: "You have already reviewed this product" }, { status: 400 });
    }

    const review = await ReviewService.createReview({
      userId: decoded.id,
      productId,
      rating,
      comment,
    });

    return NextResponse.json({ success: true, message: "Review submitted successfully", review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
