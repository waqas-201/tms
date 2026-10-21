import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac-base";

/**
 * Searches users and consultations by name, phone, or email to assist staff
 * in linking phone-based WhatsApp bookings to registered accounts.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Staff access only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        data: { users: [], consultations: [] },
      });
    }

    const [users, rawConsultations] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
        },
      }),
      prisma.consultationRequest.findMany({
        where: {
          OR: [
            { patientPhone: { contains: q, mode: "insensitive" } },
            { patientName: { contains: q, mode: "insensitive" } },
            { ticketNumber: { contains: q, mode: "insensitive" } },
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { phone: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketNumber: true,
          patientName: true,
          patientPhone: true,
          status: true,
          appointmentDate: true,
          appointmentSlot: true,
          createdAt: true,
          userId: true,
          user: {
            select: { name: true, phone: true },
          },
        },
      }),
    ]);

    const consultations = rawConsultations.map((c) => ({
      id: c.id,
      ticketNumber: c.ticketNumber,
      fullName: c.patientName || c.user?.name || "Patient",
      phone: c.patientPhone || c.user?.phone || null,
      status: c.status,
      appointmentDate: c.appointmentDate,
      appointmentSlot: c.appointmentSlot,
      createdAt: c.createdAt,
      userId: c.userId,
    }));

    return NextResponse.json({
      success: true,
      data: { users, consultations },
    });
  } catch (error: any) {
    console.error("Patient lookup failed:", error);
    return NextResponse.json(
      { success: false, error: "Lookup failed." },
      { status: 500 }
    );
  }
}
