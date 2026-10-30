import { NextRequest, NextResponse } from "next/server";
import { getUpcomingSunnahDates, getHijamaSettings, getHijriDate } from "@/lib/hijama";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthsParam = searchParams.get("months");
    const months = monthsParam ? parseInt(monthsParam, 10) : 2;

    const [sunnahDates, settings] = await Promise.all([
      getUpcomingSunnahDates(
        isNaN(months) || months < 1 ? 2 : Math.min(months, 6)
      ),
      getHijamaSettings(),
    ]);

    return NextResponse.json({
      success: true,
      data: sunnahDates,
      meta: {
        moonSightingOffset: settings.moonSightingOffset,
        todayHijri: getHijriDate(new Date(), settings.moonSightingOffset),
      },
    });
  } catch (error: any) {
    console.error("Error fetching upcoming Sunnah dates:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load Sunnah dates." },
      { status: 500 }
    );
  }
}
