import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
      },
    });
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch category." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { name, urduName, slug, description, heroImage } = body;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found." },
        { status: 404 }
      );
    }

    const cleanSlug = slug
      ? slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : undefined;

    // Check slug uniqueness if changed
    if (cleanSlug && cleanSlug !== existing.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: cleanSlug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { success: false, error: `Category slug '${cleanSlug}' is already in use.` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(urduName && { urduName: urduName.trim() }),
        ...(cleanSlug && { slug: cleanSlug }),
        ...(description !== undefined && { description: description.trim() }),
        ...(heroImage !== undefined && { heroImage: heroImage.trim() }),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        productCount: updated._count.products,
      },
    });
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found." },
        { status: 404 }
      );
    }

    const productCount = existing._count.products;
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category '${existing.name}': it currently has ${productCount} active product${
            productCount > 1 ? "s" : ""
          } assigned. Please reassign or delete these products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Category '${existing.name}' was deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete category." },
      { status: 500 }
    );
  }
}
