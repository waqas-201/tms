import { NextRequest, NextResponse } from "next/server";
import { getUpcomingSunnahDates } from "@/lib/hijama";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthsParam = searchParams.get("months");
    const months = monthsParam ? parseInt(monthsParam, 10) : 2;

    const sunnahDates = await getUpcomingSunnahDates(
      isNaN(months) || months < 1 ? 2 : Math.min(months, 6)
    );

    return NextResponse.json({ success: true, data: sunnahDates });
  } catch (error: any) {
    console.error("Error fetching upcoming Sunnah dates:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load Sunnah dates." },
      { status: 500 }
    );
  }
}
