import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac-base";
import {
  sendAppointmentStatusEmail,
  sendHakimPrescriptionEmail,
} from "@/lib/email";

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
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
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
      !session ||
      (!isStaffRole(userRole) && session.user.id !== consultation.userId)
    ) {
      return NextResponse.json(
        { success: false, error: "Access denied." },
        { status: 403 }
      );
    }

    const mapped = {
      ...consultation,
      fullName: consultation.patientName || consultation.user?.name || "Patient",
      phone: consultation.patientPhone || (consultation.user as any)?.phone || "Via Account",
      email: consultation.patientEmail || consultation.user?.email || null,
      city: (consultation.user as any)?.city || "Pakistan",
    };

    return NextResponse.json({ success: true, data: mapped });
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
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Staff credentials required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      appointmentDate,
      appointmentSlot,
      consultationType,
      primarySymptoms,
      hakimNotes,
      prescribedTreatment,
      userId,
    } = body;

    const existing = await prisma.consultationRequest.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }] },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Consultation dossier not found." },
        { status: 404 }
      );
    }

    const previousStatus = existing.status;
    const previousPrescription = existing.prescribedTreatment;

    let targetUserId = existing.userId;
    if (userId) {
      const linkedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!linkedUser) {
        return NextResponse.json(
          { success: false, error: "The selected patient account was not found." },
          { status: 400 }
        );
      }
      targetUserId = linkedUser.id;
    }

    const updated = await prisma.consultationRequest.update({
      where: { id: existing.id },
      data: {
        ...(status && { status }),
        ...(appointmentDate !== undefined && { appointmentDate }),
        ...(appointmentSlot !== undefined && { appointmentSlot }),
        ...(consultationType !== undefined && { consultationType }),
        ...(primarySymptoms !== undefined && { primarySymptoms }),
        ...(hakimNotes !== undefined && { hakimNotes }),
        ...(prescribedTreatment !== undefined && { prescribedTreatment }),
        ...(userId && { userId: targetUserId }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    const patientEmail = updated.patientEmail || updated.user?.email;
    const patientName = updated.patientName || updated.user?.name || "Valued Patient";

    // Email Triggers for Patient:
    if (patientEmail) {
      // 1. If status changed or rescheduled
      if (
        (status && status !== previousStatus) ||
        (appointmentDate && appointmentDate !== existing.appointmentDate)
      ) {
        sendAppointmentStatusEmail({
          to: patientEmail,
          fullName: patientName,
          ticketNumber: updated.ticketNumber,
          status: updated.status,
          appointmentDate: updated.appointmentDate,
          appointmentSlot: updated.appointmentSlot,
          hakimNotes: updated.hakimNotes,
        }).catch((err) => console.error("[Status Update Email Async Error]:", err));
      }

      // 2. If prescription was added/updated
      if (
        prescribedTreatment &&
        prescribedTreatment.trim() &&
        prescribedTreatment !== previousPrescription
      ) {
        sendHakimPrescriptionEmail({
          to: patientEmail,
          fullName: patientName,
          ticketNumber: updated.ticketNumber,
          prescribedTreatment: updated.prescribedTreatment || prescribedTreatment,
          hakimNotes: updated.hakimNotes,
        }).catch((err) => console.error("[Prescription Email Async Error]:", err));
      }
    }

    const mapped = {
      ...updated,
      fullName: updated.patientName || updated.user?.name || patientName,
      phone: updated.patientPhone || (updated.user as any)?.phone || "Via Account",
      email: updated.patientEmail || updated.user?.email || patientEmail,
      city: (updated.user as any)?.city || "Pakistan",
    };

    return NextResponse.json({
      success: true,
      data: mapped,
      message: "Consultation updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating consultation:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update consultation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Staff credentials required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.consultationRequest.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Consultation not found." },
        { status: 404 }
      );
    }

    await prisma.consultationRequest.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      message: "Consultation ticket deleted.",
    });
  } catch (error: any) {
    console.error("Error deleting consultation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete consultation." },
      { status: 500 }
    );
  }
}
