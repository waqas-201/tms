import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

/**
 * Staff-only patient lookup used by the admin consultation tools.
 * Returns matching registered accounts plus existing consultation tickets
 * so staff can link a booking to an account or edit an existing record
 * instead of creating a duplicate.
 */
export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [
      ROLES.ADMIN,
      ROLES.EDITOR,
      ROLES.CONTRIBUTOR,
    ]);
    if (errorResponse) return errorResponse;

    const q = new URL(request.url).searchParams.get("q")?.trim();

    if (!q || q.length < 3) {
      return NextResponse.json({
        success: true,
        data: { users: [], consultations: [] },
      });
    }

    const [users, consultations] = await Promise.all([
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
            { phone: { contains: q, mode: "insensitive" } },
            { fullName: { contains: q, mode: "insensitive" } },
            { ticketNumber: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketNumber: true,
          fullName: true,
          phone: true,
          status: true,
          appointmentDate: true,
          appointmentSlot: true,
          createdAt: true,
          userId: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { users, consultations },
    });
  } catch (error: any) {
    console.error("Error searching patients:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search patients." },
      { status: 500 }
    );
  }
}
