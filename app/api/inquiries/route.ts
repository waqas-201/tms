import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.CONTRIBUTOR]);
    if (errorResponse) return errorResponse;

    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inquiries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, city, subject, message } = body;

    if (!name || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Please provide your name, phone number, subject, and message." },
        { status: 400 }
      );
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        phone,
        email: email || null,
        city: city || null,
        subject,
        message,
        status: "UNREAD",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: inquiry,
        message: "Your message has been received. Our clinical support team will respond promptly.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit message." },
      { status: 500 }
    );
  }
}
