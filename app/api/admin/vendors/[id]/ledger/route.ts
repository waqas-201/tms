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
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        currentBalance: true,
        totalPurchased: true,
        totalPaid: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found." },
        { status: 404 }
      );
    }

    const ledgers = await prisma.vendorLedgerEntry.findMany({
      where: { vendorId: id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        vendor,
        ledgers,
      },
    });
  } catch (error: any) {
    console.error("Error fetching vendor ledger:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch vendor ledger." },
      { status: 500 }
    );
  }
}
