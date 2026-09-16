import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const roleFilter = searchParams.get("role")?.trim();

    const where: Record<string, unknown> = {};

    if (roleFilter && roleFilter !== "ALL") {
      where.role = roleFilter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            consultations: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("Error fetching users in admin route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve users." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, email, password, role, phone, city } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    const targetRole = role.toLowerCase().trim();
    // Only allow assigning staff roles (editor, contributor) or regular user
    if (![ROLES.EDITOR, ROLES.CONTRIBUTOR, ROLES.USER].includes(targetRole as any)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role. Allowed roles for staff assignment are: 'editor', 'contributor', 'user'. Only one admin can exist.",
        },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    // Create user via Better-Auth API
    try {
      await auth.api.signUpEmail({
        body: {
          name,
          email: lowerEmail,
          password,
        },
      });
    } catch (authErr: any) {
      return NextResponse.json(
        { success: false, error: authErr.message || "Failed to create authentication account." },
        { status: 400 }
      );
    }

    // Update role, phone, city in Prisma
    const updatedUser = await prisma.user.update({
      where: { email: lowerEmail },
      data: {
        role: targetRole,
        phone: phone || null,
        city: city || "Karachi",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: `Staff member '${name}' registered successfully with role '${targetRole}'.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating staff user:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create staff member." },
      { status: 500 }
    );
  }
}
