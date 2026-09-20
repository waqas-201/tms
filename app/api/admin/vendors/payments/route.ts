import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");
    const limit = Number(searchParams.get("limit")) || 50;

    const where: any = {};
    if (vendorId) {
      where.vendorId = vendorId;
    }

    const payments = await prisma.vendorPayment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      take: limit,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            company: true,
            phone: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            totalAmount: true,
          },
        },
      },
    });

    const totalDisbursed = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: payments,
      summary: {
        totalDisbursed,
        count: payments.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching vendor payments:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load vendor payments." },
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
      vendorId,
      purchaseOrderId,
      amount,
      paymentDate,
      paymentMethod = "BANK",
      referenceNumber,
      notes,
    } = body;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: "Vendor ID is required." },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than 0." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        throw new Error("Vendor not found.");
      }

      // Generate payment number: VPAY-YYYY-XXXX
      const year = new Date().getFullYear();
      const count = await tx.vendorPayment.count();
      const paymentNumber = `VPAY-${year}-${String(count + 1).padStart(4, "0")}`;

      const createdPayment = await tx.vendorPayment.create({
        data: {
          paymentNumber,
          vendorId,
          purchaseOrderId: purchaseOrderId || null,
          amount: numAmount,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMethod,
          referenceNumber: referenceNumber?.trim() || null,
          notes: notes?.trim() || null,
          recordedBy: session?.user?.name || "Admin",
        },
      });

      // Update vendor balance: debit reduces payable balance
      const newBalance = (vendor.currentBalance || 0) - numAmount;
      const newTotalPaid = (vendor.totalPaid || 0) + numAmount;

      await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          currentBalance: newBalance,
          totalPaid: newTotalPaid,
        },
      });

      // Create vendor ledger entry
      await tx.vendorLedgerEntry.create({
        data: {
          vendorId: vendor.id,
          date: paymentDate ? new Date(paymentDate) : new Date(),
          type: "PAYMENT",
          reference: paymentNumber,
          description: notes?.trim() || `Payment made via ${paymentMethod}${referenceNumber ? ` (Ref: ${referenceNumber})` : ""}`,
          debit: numAmount,
          credit: 0,
          runningBalance: newBalance,
        },
      });

      // If linked to specific PO, update PO paid and due amounts
      if (purchaseOrderId) {
        const po = await tx.purchaseOrder.findUnique({
          where: { id: purchaseOrderId },
        });

        if (po) {
          const poPaid = (po.paidAmount || 0) + numAmount;
          const poDue = Math.max(0, po.totalAmount - poPaid);
          const paymentStatus = poDue <= 0 ? "PAID" : "PARTIAL";

          await tx.purchaseOrder.update({
            where: { id: po.id },
            data: {
              paidAmount: poPaid,
              dueAmount: poDue,
              paymentStatus,
            },
          });
        }
      }

      return createdPayment;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Payment ${result.paymentNumber} of ₨ ${numAmount.toLocaleString()} recorded successfully.`,
    });
  } catch (error: any) {
    console.error("Error creating vendor payment:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process vendor payment." },
      { status: 500 }
    );
  }
}
