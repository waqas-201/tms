import { NextRequest, NextResponse } from "next/server";
import { getHijamaAvailabilityForDate } from "@/lib/hijama";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const gender = searchParams.get("gender") as "MALE" | "FEMALE" | undefined;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: "Invalid date. Please use YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    const availability = await getHijamaAvailabilityForDate(
      date,
      gender === "MALE" || gender === "FEMALE" ? gender : undefined
    );

    return NextResponse.json({ success: true, data: availability });
  } catch (error: any) {
    console.error("Error fetching Hijama availability:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load availability." },
      { status: 500 }
    );
  }
}
