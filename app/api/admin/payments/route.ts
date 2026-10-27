import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac-base";
import { createAdminNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access payments." },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (!isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Staff permissions required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const method = searchParams.get("method")?.trim();
    const orderId = searchParams.get("orderId")?.trim();
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 100));

    const where: Record<string, unknown> = {};

    if (orderId) {
      where.orderId = orderId;
    }

    if (method && method !== "ALL") {
      where.paymentMethod = method;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { reference: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [payments, totalCount, allRecords] = await Promise.all([
      prisma.paymentRecord.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              paidAmount: true,
              dueAmount: true,
              paymentStatus: true,
              orderStatus: true,
            },
          },
        },
      }),
      prisma.paymentRecord.count({ where }),
      prisma.paymentRecord.findMany({
        select: {
          amount: true,
          paymentMethod: true,
          createdAt: true,
        },
      }),
    ]);

    // Financial KPI Aggregations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let totalCollected = 0;
    let todayCollected = 0;
    const byMethod: Record<string, number> = {
      COD: 0,
      CASH: 0,
      BANK: 0,
      JAZZCASH: 0,
      EASYPAISA: 0,
      ONLINE: 0,
    };

    allRecords.forEach((r) => {
      totalCollected += r.amount;
      if (new Date(r.createdAt) >= startOfToday) {
        todayCollected += r.amount;
      }
      if (byMethod[r.paymentMethod] !== undefined) {
        byMethod[r.paymentMethod] += r.amount;
      } else {
        byMethod[r.paymentMethod] = r.amount;
      }
    });

    return NextResponse.json({
      success: true,
      data: payments,
      total: totalCount,
      summary: {
        totalCollected,
        todayCollected,
        byMethod,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payment records:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load payment records." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to record payments." },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (!isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Staff permissions required." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const {
      orderId,
      hijamaTicket,
      customerName,
      customerPhone,
      amount,
      paymentMethod = "CASH",
      reference,
      notes,
    } = body;

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive payment amount is required." },
        { status: 400 }
      );
    }

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json(
        { success: false, error: "Customer or patient name is required." },
        { status: 400 }
      );
    }

    const recordedBy = session.user.name || session.user.email || "Clinic Staff";

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment Record
      const newPayment = await tx.paymentRecord.create({
        data: {
          orderId: orderId || null,
          customerName: customerName.trim(),
          customerPhone: customerPhone ? String(customerPhone).trim() : null,
          amount: parsedAmount,
          paymentMethod,
          reference: reference ? String(reference).trim() : null,
          notes: notes ? String(notes).trim() : null,
          recordedBy,
        },
      });

      // 2. If orderId provided, update Order balances and status
      let updatedOrder = null;
      if (orderId) {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });

        if (order) {
          const newPaidAmount = (order.paidAmount || 0) + parsedAmount;
          const newDueAmount = Math.max(0, order.total - newPaidAmount);
          const newPaymentStatus = newDueAmount === 0 ? "PAID" : "PARTIAL";

          updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              paymentStatus: newPaymentStatus,
            },
          });
        }
      }

      // 3. If hijamaTicket provided, mark booking paid
      let updatedHijama = null;
      if (hijamaTicket) {
        const booking = await tx.hijamaBooking.findUnique({
          where: { ticketNumber: String(hijamaTicket).trim() },
        });

        if (booking) {
          updatedHijama = await tx.hijamaBooking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: "PAID_AT_CLINIC",
            },
          });
        }
      }

      return { payment: newPayment, order: updatedOrder, hijama: updatedHijama };
    });

    // Alert staff
    createAdminNotification({
      type: "ORDER",
      title: `Payment Recorded: ₨ ${parsedAmount.toLocaleString()}`,
      message: `Recorded for ${customerName} (${paymentMethod}) by ${recordedBy}.`,
      link: `/admin?tab=accounting`,
      entityId: result.payment.id,
    }).catch((err) => console.error("Notification creation error:", err));

    return NextResponse.json({
      success: true,
      data: result.payment,
      order: result.order,
      hijama: result.hijama,
      message: `Payment of ₨ ${parsedAmount.toLocaleString()} recorded successfully.`,
    });
  } catch (error: any) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record payment." },
      { status: 500 }
    );
  }
}
