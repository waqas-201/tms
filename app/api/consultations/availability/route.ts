import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForDate, getOrInitClinicSchedule } from "@/lib/clinic-schedule";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // If specific date requested
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { success: false, error: "Invalid date format. Use YYYY-MM-DD." },
          { status: 400 }
        );
      }

      const availability = await getAvailableSlotsForDate(date);
      return NextResponse.json({ success: true, data: availability });
    }

    // Otherwise return weekly schedule overview
    const schedule = await getOrInitClinicSchedule();
    return NextResponse.json({ success: true, data: { schedule } });
  } catch (error: any) {
    console.error("Error fetching clinic availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve availability." },
      { status: 500 }
    );
  }
}
