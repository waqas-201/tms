import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CLINIC_INFO } from "@/app/data/products";

// In-memory cache for Google Places API response (1-hour TTL)
let cachedData: {
  timestamp: number;
  data: GoogleReviewsResponse;
} | null = null;

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface LiveReviewItem {
  id: string;
  author: string;
  avatarUrl?: string;
  avatarText: string;
  avatarBg: string;
  rating: number;
  relativeTime: string;
  text: string;
  source: "Google Business Profile" | "Verified Patient";
  verified: boolean;
  googleReviewUrl?: string;
}

export interface GoogleReviewsResponse {
  success: boolean;
  isLiveGoogle: boolean;
  placeName: string;
  rating: number;
  totalReviews: number;
  googleMapsUrl: string;
  googleReviewUrl: string;
  reviews: LiveReviewItem[];
  missingConfig?: string[];
  lastFetchedAt: string;
}

const AVATAR_COLORS = [
  "bg-[#22623a]",
  "bg-[#8c6a15]",
  "bg-[#143e23]",
  "bg-[#2d7648]",
  "bg-[#1a4a2b]",
];

function getAvatarInitials(name: string): string {
  if (!name) return "P";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    // Zero external API cost - serve verified reviews from the database
    let dbReviews: any[] = [];
    try {
      dbReviews = await prisma.review.findMany({
        where: { productId: null },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } catch (dbErr) {
      console.warn("Database review query note:", dbErr);
    }

    const formattedDbReviews: LiveReviewItem[] = dbReviews.map((r, idx) => ({
      id: r.id,
      author: r.name,
      avatarText: getAvatarInitials(r.name),
      avatarBg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      rating: r.rating,
      relativeTime: formatRelativeDate(r.createdAt),
      text: r.comment,
      source: "Verified Patient" as const,
      verified: r.verified ?? true,
      googleReviewUrl: CLINIC_INFO.googleReviewUrl,
    }));

    const averageRating =
      formattedDbReviews.length > 0
        ? Math.round(
            (formattedDbReviews.reduce((sum, r) => sum + r.rating, 0) /
              formattedDbReviews.length) *
              10
          ) / 10
        : 5.0;

    const payload: GoogleReviewsResponse = {
      success: true,
      isLiveGoogle: false,
      placeName: CLINIC_INFO.clinicName,
      rating: averageRating,
      totalReviews: formattedDbReviews.length > 0 ? formattedDbReviews.length : 1,
      googleMapsUrl: CLINIC_INFO.googleMapsUrl,
      googleReviewUrl: CLINIC_INFO.googleReviewUrl,
      reviews: formattedDbReviews,
      lastFetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error in /api/reviews/google:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve reviews.",
      },
      { status: 500 }
    );
  }
}

// Helper to format date relative
function formatRelativeDate(dateInput: Date | string): string {
  try {
    const d = new Date(dateInput);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 1) return "Recently";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return "Verified Patient";
  }
}
