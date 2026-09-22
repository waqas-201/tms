import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const units = await prisma.unit.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { sizes: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: units });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch units." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { code, name, kind } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Unit code (e.g. 'g', 'ml', 'jar') and name are required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanKind = (kind || "PACK").toUpperCase();

    const existing = await prisma.unit.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate
        const reactivated = await prisma.unit.update({
          where: { id: existing.id },
          data: { name: cleanName, kind: cleanKind, isActive: true },
        });
        return NextResponse.json({ success: true, data: reactivated }, { status: 200 });
      }
      return NextResponse.json(
        { success: false, error: `Unit code '${cleanCode}' already exists.` },
        { status: 409 }
      );
    }

    const unit = await prisma.unit.create({
      data: {
        code: cleanCode,
        name: cleanName,
        kind: cleanKind,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: unit }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create unit." },
      { status: 500 }
    );
  }
}
