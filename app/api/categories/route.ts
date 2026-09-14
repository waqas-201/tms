import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
      description: c.description,
      heroImage: c.heroImage,
      productCount: c._count.products,
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
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, slug, name, urduName, description, heroImage } = body;

    if (!id || !slug || !name || !urduName) {
      return NextResponse.json(
        { success: false, error: "Missing required category fields." },
        { status: 400 }
      );
    }

    const category = await prisma.category.upsert({
      where: { id },
      update: { slug, name, urduName, description: description || "", heroImage: heroImage || "" },
      create: { id, slug, name, urduName, description: description || "", heroImage: heroImage || "" },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save category." },
      { status: 500 }
    );
  }
}
