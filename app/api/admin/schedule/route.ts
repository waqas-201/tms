import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLES, isStaffRole } from "@/lib/rbac-base";
import { getOrInitClinicSchedule } from "@/lib/clinic-schedule";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to clinic schedule." },
        { status: 403 }
      );
    }

    const [schedule, holidays] = await Promise.all([
      getOrInitClinicSchedule(),
      prisma.clinicHoliday.findMany({
        orderBy: { date: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { schedule, holidays },
    });
  } catch (error: any) {
    console.error("Error fetching admin schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load schedule." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to update schedule." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { days } = body;

    if (!Array.isArray(days)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload. 'days' array required." },
        { status: 400 }
      );
    }

    // Update each day in database
    for (const day of days) {
      if (typeof day.dayOfWeek === "number") {
        await prisma.clinicSchedule.upsert({
          where: { dayOfWeek: day.dayOfWeek },
          update: {
            isOpen: Boolean(day.isOpen),
            openTime: day.openTime || "10:00",
            closeTime: day.closeTime || "21:00",
            slotDurationMins: Number(day.slotDurationMins) || 60,
            maxSlotsPerWindow: Number(day.maxSlotsPerWindow) || 1,
            dayName: day.dayName || "",
          },
          create: {
            dayOfWeek: day.dayOfWeek,
            dayName: day.dayName || "",
            isOpen: Boolean(day.isOpen),
            openTime: day.openTime || "10:00",
            closeTime: day.closeTime || "21:00",
            slotDurationMins: Number(day.slotDurationMins) || 60,
            maxSlotsPerWindow: Number(day.maxSlotsPerWindow) || 1,
          },
        });
      }
    }

    const updated = await prisma.clinicSchedule.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Clinic operating hours updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating clinic schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update clinic schedule." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { date, reason } = body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !reason) {
      return NextResponse.json(
        { success: false, error: "Date (YYYY-MM-DD) and reason are required." },
        { status: 400 }
      );
    }

    const holiday = await prisma.clinicHoliday.upsert({
      where: { date },
      update: { reason },
      create: { date, reason },
    });

    return NextResponse.json({
      success: true,
      data: holiday,
      message: `Holiday / off-day added for ${date}.`,
    });
  } catch (error: any) {
    console.error("Error adding holiday:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add clinic holiday." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Date parameter required." },
        { status: 400 }
      );
    }

    await prisma.clinicHoliday.delete({
      where: { date },
    });

    return NextResponse.json({
      success: true,
      message: `Holiday on ${date} removed successfully.`,
    });
  } catch (error: any) {
    console.error("Error removing holiday:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove holiday." },
      { status: 500 }
    );
  }
}
