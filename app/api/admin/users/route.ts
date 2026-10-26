import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const roleFilter = searchParams.get("role")?.trim()?.toUpperCase();
    const statusFilter = searchParams.get("status")?.trim()?.toUpperCase() || "ALL";
    // The dashboard banner only needs the aggregate counters, not the full directory.
    const summaryOnly = searchParams.get("summary") === "1";

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
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    // Parallel fetch for users and aggregate counts
    const [users, totalCount, activeCount, staffCount, customerCount, suspendedCount, deletedCount] =
      await Promise.all([
        summaryOnly
          ? Promise.resolve([])
          : prisma.user.findMany({
              where,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                city: true,
                address: true,
                latitude: true,
                longitude: true,
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
  } catch (error: unknown) {
    console.error("Error fetching users in admin route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve users." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, email, password, role, phone, city, address, latitude, longitude } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    const targetRole = role.toLowerCase().trim();
    // Allow assigning staff roles (hakim, editor, contributor) or regular user
    const allowedRoles = [ROLES.HAKIM, ROLES.EDITOR, ROLES.CONTRIBUTOR, ROLES.USER];
    if (!allowedRoles.includes(targetRole as (typeof allowedRoles)[number])) {
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
    } catch (authErr: unknown) {
      const authMsg = authErr instanceof Error ? authErr.message : "Failed to create authentication account.";
      return NextResponse.json(
        { success: false, error: authMsg },
        { status: 400 }
      );
    }

    const parsedLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : null;
    const parsedLng = typeof longitude === "number" && !isNaN(longitude) ? longitude : null;

    // Update role, phone, city, address, coordinates, active status in Prisma
    const updatedUser = await prisma.user.update({
      where: { email: lowerEmail },
      data: {
        role: targetRole,
        phone: phone || null,
        city: city || "Karachi",
        address: address?.trim() || null,
        latitude: parsedLat,
        longitude: parsedLng,
        isActive: true,
        deletedAt: null,
        // The admin is creating this account on the person's behalf, so treat
        // the address as vouched-for; otherwise email verification would block
        // their very first login.
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        address: true,
        latitude: true,
        longitude: true,
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
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to create user account.";
    console.error("Error creating staff user:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
