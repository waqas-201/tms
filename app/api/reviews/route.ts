import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const where: Record<string, unknown> = {};
    if (productId) {
      where.productId = productId;
    }

    let reviews: any[] = [];
    try {
      reviews = await prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 30,
      });
    } catch (dbErr) {
      console.warn("Review database read error or no direct connection:", dbErr);
    }

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, name, rating, comment, city } = body;

    if (!name || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: "Please provide name, rating, and feedback comment." },
        { status: 400 }
      );
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    let newReview: any = {
      id: `rev_${Date.now()}`,
      productId: productId || null,
      name,
      rating: numericRating,
      comment,
      city: city || "Karachi, Pakistan",
      verified: true,
      createdAt: new Date(),
    };

    try {
      newReview = await prisma.review.create({
        data: {
          productId: productId || null,
          name,
          rating: numericRating,
          comment,
          city: city || "Karachi, Pakistan",
          verified: true,
        },
      });

      // Update product average rating if product exists
      if (productId) {
        const prodReviews = await prisma.review.findMany({
          where: { productId },
        });
        const avg =
          prodReviews.reduce((sum, r) => sum + r.rating, 0) /
          Math.max(1, prodReviews.length);

        await prisma.product.update({
          where: { id: productId },
          data: {
            rating: Math.round(avg * 10) / 10,
            reviewCount: prodReviews.length,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Database create error on review, continuing with memory return:", dbErr);
    }

    return NextResponse.json({
      success: true,
      data: newReview,
      message: "Thank you for sharing your experience! Your review has been submitted.",
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review." },
      { status: 500 }
    );
  }
}
