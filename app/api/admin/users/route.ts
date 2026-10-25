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
    const roleFilter = searchParams.get("role")?.trim()?.toUpperCase();
    const statusFilter = searchParams.get("status")?.trim()?.toUpperCase() || "ALL";

    const where: Record<string, unknown> = {};

    // Status filtering
    if (statusFilter === "DELETED") {
      where.deletedAt = { not: null };
    } else if (statusFilter === "SUSPENDED") {
      where.deletedAt = null;
      where.isActive = false;
    } else if (statusFilter === "ACTIVE") {
      where.deletedAt = null;
      where.isActive = true;
    } else {
      // "ALL" active/suspended directory, hides soft-deleted by default
      where.deletedAt = null;
    }

    // Role filtering
    if (roleFilter === "STAFF") {
      where.role = { in: [ROLES.ADMIN, ROLES.HAKIM, ROLES.EDITOR, ROLES.CONTRIBUTOR] };
    } else if (roleFilter === "CUSTOMER") {
      where.role = ROLES.USER;
    } else if (roleFilter && roleFilter !== "ALL") {
      where.role = roleFilter.toLowerCase();
    }

    // Search query
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // Parallel fetch for users and aggregate counts
    const [users, totalCount, activeCount, staffCount, customerCount, suspendedCount, deletedCount] =
      await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            city: true,
            isActive: true,
            deletedAt: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                orders: true,
                consultations: true,
                hijamaBookings: true,
              },
            },
          },
        }),
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { deletedAt: null, isActive: true } }),
        prisma.user.count({
          where: {
            deletedAt: null,
            role: { in: [ROLES.ADMIN, ROLES.HAKIM, ROLES.EDITOR, ROLES.CONTRIBUTOR] },
          },
        }),
        prisma.user.count({ where: { deletedAt: null, role: ROLES.USER } }),
        prisma.user.count({ where: { deletedAt: null, isActive: false } }),
        prisma.user.count({ where: { deletedAt: { not: null } } }),
      ]);

    return NextResponse.json({
      success: true,
      data: users,
      counts: {
        total: totalCount,
        active: activeCount,
        staff: staffCount,
        customers: customerCount,
        suspended: suspendedCount,
        deleted: deletedCount,
      },
    });
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
    // Allow assigning staff roles (hakim, editor, contributor) or regular user
    if (![ROLES.HAKIM, ROLES.EDITOR, ROLES.CONTRIBUTOR, ROLES.USER].includes(targetRole as any)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role. Allowed roles for assignment are: 'hakim', 'editor', 'contributor', 'user'. Only one primary admin can exist.",
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
      if (existing.deletedAt) {
        return NextResponse.json(
          {
            success: false,
            error: "An archived/deleted account with this email exists. You can restore it from the 'Deleted Accounts' tab.",
          },
          { status: 400 }
        );
      }
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

    // Update role, phone, city, active status in Prisma
    const updatedUser = await prisma.user.update({
      where: { email: lowerEmail },
      data: {
        role: targetRole,
        phone: phone || null,
        city: city || "Karachi",
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        isActive: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: `Account for '${name}' registered successfully with role '${targetRole}'.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating staff user:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create user account." },
      { status: 500 }
    );
  }
}
