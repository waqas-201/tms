import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { receivePurchaseOrderStock } from "@/lib/inventory";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: {
          include: {
            productSize: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!po) {
      return NextResponse.json(
        { success: false, error: "Purchase order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: po,
    });
  } catch (error: any) {
    console.error("Error fetching purchase order:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load purchase order." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { action, status, vendorInvoiceNo, dueDate, notes } = body;

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      return NextResponse.json(
        { success: false, error: "Purchase order not found." },
        { status: 404 }
      );
    }

    // Action 1: Receive physical stock
    if (action === "RECEIVE_STOCK" || (status === "RECEIVED" && !po.stockReceived)) {
      if (po.stockReceived) {
        return NextResponse.json(
          { success: false, error: "Stock for this order has already been received." },
          { status: 400 }
        );
      }

      const updated = await receivePurchaseOrderStock(po.id, session?.user?.id);

      return NextResponse.json({
        success: true,
        data: updated,
        message: `Stock for PO #${po.poNumber} has been successfully received into inventory.`,
      });
    }

    // Action 2: Update status or metadata
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(vendorInvoiceNo !== undefined && { vendorInvoiceNo }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        vendor: true,
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Purchase order updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update purchase order." },
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

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!po) {
      return NextResponse.json(
        { success: false, error: "Purchase order not found." },
        { status: 404 }
      );
    }

    if (po.stockReceived) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete a purchase order whose stock has already been received into inventory.",
        },
        { status: 400 }
      );
    }

    if (po.payments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete a purchase order with recorded payments. Reverse payments first.",
        },
        { status: 400 }
      );
    }

    // Adjust vendor balance and ledger before deletion
    await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({
        where: { id: po.vendorId },
      });

      if (vendor) {
        const newBalance = Math.max(0, (vendor.currentBalance || 0) - po.totalAmount);
        const newPurchased = Math.max(0, (vendor.totalPurchased || 0) - po.totalAmount);

        await tx.vendor.update({
          where: { id: vendor.id },
          data: {
            currentBalance: newBalance,
            totalPurchased: newPurchased,
          },
        });

        await tx.vendorLedgerEntry.create({
          data: {
            vendorId: vendor.id,
            type: "ADJUSTMENT",
            reference: po.poNumber,
            description: `Reversal of deleted PO #${po.poNumber}`,
            debit: po.totalAmount,
            credit: 0,
            runningBalance: newBalance,
          },
        });
      }

      await tx.purchaseOrder.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Purchase order ${po.poNumber} cancelled and removed.`,
    });
  } catch (error: any) {
    console.error("Error deleting purchase order:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete purchase order." },
      { status: 500 }
    );
  }
}
