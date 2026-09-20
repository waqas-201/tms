import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");

    const where: any = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            purchases: true,
            payments: true,
            ledgers: true,
          },
        },
      },
    });

    const summary = {
      totalVendors: vendors.length,
      totalPayableBalance: vendors.reduce((acc, v) => acc + (v.currentBalance || 0), 0),
      totalPurchased: vendors.reduce((acc, v) => acc + (v.totalPurchased || 0), 0),
      totalPaid: vendors.reduce((acc, v) => acc + (v.totalPaid || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: vendors,
      summary,
    });
  } catch (error: any) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load vendors." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

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
      openingBalance = 0,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Vendor name is required." },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Vendor contact phone is required." },
        { status: 400 }
      );
    }

    const numOpeningBalance = Number(openingBalance) || 0;

    const vendor = await prisma.$transaction(async (tx) => {
      const created = await tx.vendor.create({
        data: {
          name: name.trim(),
          company: company?.trim() || null,
          phone: phone.trim(),
          email: email?.trim() || null,
          city: city?.trim() || null,
          address: address?.trim() || null,
          category: category?.trim() || "Raw Herbs",
          paymentTerms: paymentTerms?.trim() || "Net 30",
          currentBalance: numOpeningBalance,
          totalPurchased: numOpeningBalance > 0 ? numOpeningBalance : 0,
          totalPaid: 0,
        },
      });

      if (numOpeningBalance > 0) {
        await tx.vendorLedgerEntry.create({
          data: {
            vendorId: created.id,
            type: "OPENING_BALANCE",
            reference: "INITIAL",
            description: "Opening balance payable recorded",
            debit: 0,
            credit: numOpeningBalance,
            runningBalance: numOpeningBalance,
          },
        });
      }

      return created;
    });

    return NextResponse.json({
      success: true,
      data: vendor,
      message: `Vendor '${vendor.name}' added successfully.`,
    });
  } catch (error: any) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create vendor." },
      { status: 500 }
    );
  }
}
