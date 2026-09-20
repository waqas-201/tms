import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { orderDate: "desc" },
          include: {
            items: true,
            payments: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        ledgers: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error: any) {
    console.error("Error fetching vendor details:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch vendor details." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      company,
      phone,
      email,
      city,
      address,
      category,
      paymentTerms,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Vendor name is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data: {
        name: name.trim(),
        company: company?.trim() || null,
        phone: phone?.trim() || "",
        email: email?.trim() || null,
        city: city?.trim() || null,
        address: address?.trim() || null,
        category: category?.trim() || "Raw Herbs",
        paymentTerms: paymentTerms?.trim() || "Net 30",
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Vendor updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update vendor." },
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

    const purchaseCount = await prisma.purchaseOrder.count({
      where: { vendorId: id },
    });

    if (purchaseCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete vendor with associated purchase orders. Settle balances first.",
        },
        { status: 400 }
      );
    }

    await prisma.vendor.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete vendor." },
      { status: 500 }
    );
  }
}
