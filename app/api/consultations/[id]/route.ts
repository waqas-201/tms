import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const consultation = await prisma.consultationRequest.findFirst({
      where: {
        OR: [{ id: id }, { ticketNumber: id }],
      },
    });

    if (!consultation) {
      return NextResponse.json(
        { success: false, error: "Consultation dossier not found." },
        { status: 404 }
      );
    }

    const userRole = (session?.user as any)?.role;

    if (
      consultation.userId &&
      session &&
      userRole !== ROLES.ADMIN &&
      session.user.id !== consultation.userId
    ) {
      return NextResponse.json(
        { success: false, error: "Access denied." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: consultation });
  } catch (error) {
    console.error("Error retrieving consultation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch consultation." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { status, hakimNotes, prescribedTreatment } = body;

    const existing = await prisma.consultationRequest.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Consultation dossier not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.consultationRequest.update({
      where: { id: existing.id },
      data: {
        ...(status && { status }),
        ...(hakimNotes !== undefined && { hakimNotes }),
        ...(prescribedTreatment !== undefined && { prescribedTreatment }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating consultation dossier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update consultation dossier." },
      { status: 500 }
    );
  }
}
