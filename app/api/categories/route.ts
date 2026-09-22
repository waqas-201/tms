import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      urduName: c.urduName,
      description: c.description || "",
      heroImage: c.heroImage || "",
      productCount: c._count.products,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { id, slug, name, urduName, description, heroImage } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name in English is required." },
        { status: 400 }
      );
    }

    if (!urduName || !urduName.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name in Urdu is required." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanUrdu = urduName.trim();
    const cleanSlug = (slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const targetId = (id || cleanSlug).trim();

    if (!targetId || !cleanSlug) {
      return NextResponse.json(
        { success: false, error: "Invalid category slug or identifier." },
        { status: 400 }
      );
    }

    // Check if ID or Slug already exists
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ id: targetId }, { slug: cleanSlug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A category with identifier/slug '${cleanSlug}' already exists (${existing.name}).`,
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        id: targetId,
        slug: cleanSlug,
        name: cleanName,
        urduName: cleanUrdu,
        description: (description || "").trim(),
        heroImage: (heroImage || "").trim(),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...category,
          productCount: category._count?.products || 0,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create category." },
      { status: 500 }
    );
  }
}
