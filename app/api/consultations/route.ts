import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view consultations." },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;

    // Admin sees all consultations; regular users only see their own
    if (userRole !== ROLES.ADMIN) {
      where.userId = session.user.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { primarySymptoms: { contains: q, mode: "insensitive" } },
      ];
    }

    const consultations = await prisma.consultationRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: consultations });
  } catch (error) {
    console.error("Error fetching consultation requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve consultations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const body = await request.json();
    const {
      fullName,
      age,
      gender,
      phone,
      email,
      city,
      primarySymptoms,
      duration,
      previousTreatments,
      currentMedications,
      digestiveState,
      sleepEnergyState,
      preferredContact = "WHATSAPP",
    } = body;

    if (!fullName || !age || !gender || !phone || !city || !primarySymptoms || !duration) {
      return NextResponse.json(
        { success: false, error: "Please fill all mandatory diagnostic intake fields." },
        { status: 400 }
      );
    }

    // Generate ticket number: CON-YYYY-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `CON-${new Date().getFullYear()}-${randomSuffix}`;

    const consultation = await prisma.consultationRequest.create({
      data: {
        ticketNumber,
        fullName,
        age: Number(age),
        gender,
        phone,
        email: email || null,
        city,
        primarySymptoms,
        duration,
        previousTreatments: previousTreatments || null,
        currentMedications: currentMedications || null,
        digestiveState: digestiveState || null,
        sleepEnergyState: sleepEnergyState || null,
        preferredContact,
        status: "NEW",
        userId: session?.user?.id || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: consultation,
        message: "Consultation dossier submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating consultation request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit consultation dossier." },
      { status: 500 }
    );
  }
}
