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
    const decodedId = decodeURIComponent(id);

    // Look for orders matching by phone or userId
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { phone: decodedId },
          { userId: decodedId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        items: true,
        payments: true,
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: "No account records found for this customer identifier." },
        { status: 404 }
      );
    }

    const customerName = orders[0]?.customerName || "Customer";
    const customerPhone = orders[0]?.phone || decodedId;
    const customerCity = orders[0]?.city || "";

    // Fetch explicit customer ledger entries if any
    const dbLedgers = await prisma.customerLedgerEntry.findMany({
      where: {
        OR: [
          { customerPhone: decodedId },
          { userId: decodedId },
        ],
      },
      orderBy: { date: "asc" },
    });

    // Synthesize chronological ledger if explicit ledger entries don't exist yet
    let statementEntries: any[] = [];

    if (dbLedgers.length > 0) {
      statementEntries = dbLedgers;
    } else {
      let runningBalance = 0;
      for (const order of orders) {
        if (order.orderStatus === "CANCELLED") continue;

        // 1. Order Debit (Billed to customer)
        runningBalance += order.total;
        statementEntries.push({
          id: `ord-${order.id}`,
          date: order.createdAt,
          type: "ORDER_INVOICE",
          reference: order.orderNumber,
          description: `Order #${order.orderNumber} placed (${order.items.length} items)`,
          debit: order.total,
          credit: 0,
          runningBalance,
        });

        // 2. Payments (Credit from customer)
        if (order.payments && order.payments.length > 0) {
          for (const payment of order.payments) {
            runningBalance -= payment.amount;
            statementEntries.push({
              id: `pay-${payment.id}`,
              date: payment.createdAt,
              type: "PAYMENT_RECEIVED",
              reference: payment.reference || order.orderNumber,
              description: `Payment received via ${payment.paymentMethod}${payment.notes ? ` - ${payment.notes}` : ""}`,
              debit: 0,
              credit: payment.amount,
              runningBalance,
            });
          }
        } else if (order.paidAmount > 0 || order.paymentStatus === "PAID") {
          const paid = order.paidAmount > 0 ? order.paidAmount : order.total;
          runningBalance -= paid;
          statementEntries.push({
            id: `pay-auto-${order.id}`,
            date: order.updatedAt,
            type: "PAYMENT_RECEIVED",
            reference: order.orderNumber,
            description: `Payment collected via ${order.paymentMethod}`,
            debit: 0,
            credit: paid,
            runningBalance,
          });
        }
      }
    }

    const totalBilled = statementEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalPaid = statementEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const currentDue = Math.max(0, totalBilled - totalPaid);

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          name: customerName,
          phone: customerPhone,
          city: customerCity,
          totalBilled,
          totalPaid,
          currentDue,
        },
        orders,
        statement: statementEntries.reverse(), // most recent first for display
      },
    });
  } catch (error: any) {
    console.error("Error fetching customer statement:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load customer statement." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    const body = await request.json();
    const {
      amount,
      paymentMethod = "COD",
      reference,
      notes,
      orderId,
      customerName,
      customerPhone,
    } = body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than 0." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let targetOrder: any = null;
      if (orderId) {
        targetOrder = await tx.order.findUnique({
          where: { id: orderId },
        });
      } else {
        // Find latest unpaid order for this customer
        targetOrder = await tx.order.findFirst({
          where: {
            OR: [{ phone: decodedId }, { userId: decodedId }],
            dueAmount: { gt: 0 },
          },
          orderBy: { createdAt: "desc" },
        });
      }

      // Create PaymentRecord
      const paymentRecord = await tx.paymentRecord.create({
        data: {
          orderId: targetOrder?.id || null,
          customerName: customerName || targetOrder?.customerName || "Customer",
          customerPhone: customerPhone || targetOrder?.phone || decodedId,
          amount: numAmount,
          paymentMethod,
          reference: reference?.trim() || null,
          notes: notes?.trim() || null,
          recordedBy: session?.user?.name || "Staff",
        },
      });

      // Update Order paid amount and due balance if target order exists
      if (targetOrder) {
        const newPaid = (targetOrder.paidAmount || 0) + numAmount;
        const newDue = Math.max(0, targetOrder.total - newPaid);
        const paymentStatus = newDue <= 0 ? "PAID" : "PARTIAL";

        await tx.order.update({
          where: { id: targetOrder.id },
          data: {
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus,
          },
        });
      }

      // Create Customer Ledger Entry
      await tx.customerLedgerEntry.create({
        data: {
          userId: targetOrder?.userId || null,
          customerPhone: customerPhone || targetOrder?.phone || decodedId,
          customerName: customerName || targetOrder?.customerName || "Customer",
          type: "PAYMENT_RECEIVED",
          reference: reference || targetOrder?.orderNumber || "RECEIPT",
          description: `Payment received of ₨ ${numAmount.toLocaleString()} via ${paymentMethod}${notes ? ` (${notes})` : ""}`,
          debit: 0,
          credit: numAmount,
          runningBalance: 0, // dynamic running balance
        },
      });

      return paymentRecord;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Payment of ₨ ${numAmount.toLocaleString()} recorded successfully.`,
    });
  } catch (error: any) {
    console.error("Error recording customer payment:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record payment." },
      { status: 500 }
    );
  }
}
