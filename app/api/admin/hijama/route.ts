import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac-base";
import {
  getHijamaSettings,
  updateHijamaSettings,
  formatDateStr,
} from "@/lib/hijama";

/**
 * GET /api/admin/hijama
 * Lists Hijama bookings with search, date, gender, and status filters,
 * along with live statistics and clinic settings.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to Hijama management." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim();
    const gender = searchParams.get("gender")?.trim();
    const status = searchParams.get("status")?.trim();
    const search = searchParams.get("search")?.trim();

    const todayStr = formatDateStr(new Date());

    const where: any = {};
    if (date && date !== "ALL") {
      where.appointmentDate = date;
    }
    if (gender && gender !== "ALL") {
      where.gender = gender;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cuppingReason: { contains: search, mode: "insensitive" } },
      ];
    }

    const [
      bookings,
      total,
      settings,
      todayCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      noShowCount,
      sunnahCount,
    ] = await Promise.all([
      prisma.hijamaBooking.findMany({
        where,
        orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
        include: { user: true },
        take: 100,
      }),
      prisma.hijamaBooking.count({ where }),
      getHijamaSettings(),
      // Quick stats counts
      prisma.hijamaBooking.count({
        where: {
          appointmentDate: todayStr,
          status: { not: "CANCELLED" },
        },
      }),
      prisma.hijamaBooking.count({ where: { status: "CONFIRMED" } }),
      prisma.hijamaBooking.count({ where: { status: "COMPLETED" } }),
      prisma.hijamaBooking.count({ where: { status: "CANCELLED" } }),
      prisma.hijamaBooking.count({ where: { status: "NO_SHOW" } }),
      prisma.hijamaBooking.count({
        where: {
          isSunnahDay: true,
          appointmentDate: { gte: todayStr },
          status: { not: "CANCELLED" },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        total,
        stats: {
          todayCount,
          confirmedCount,
          completedCount,
          cancelledCount,
          noShowCount,
          sunnahCount,
        },
        settings,
        todayStr,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/hijama:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load Hijama admin data." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/hijama
 * Updates Hijama clinic settings (moon-sighting offset, capacity sliders, fee).
 */
export async function PUT(request: NextRequest) {
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
    const {
      moonSightingOffset,
      sunnahMaleCapacity,
      sunnahFemaleCapacity,
      standardFee,
    } = body;

    const updated = await updateHijamaSettings({
      moonSightingOffset:
        typeof moonSightingOffset === "number" ? moonSightingOffset : undefined,
      sunnahMaleCapacity:
        typeof sunnahMaleCapacity === "number" ? sunnahMaleCapacity : undefined,
      sunnahFemaleCapacity:
        typeof sunnahFemaleCapacity === "number"
          ? sunnahFemaleCapacity
          : undefined,
      standardFee: typeof standardFee === "number" ? standardFee : undefined,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Hijama settings updated successfully.",
    });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/hijama:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update Hijama settings." },
      { status: 500 }
    );
  }
}
