import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const filter = searchParams.get("filter"); // "all" | "due_only" | "cleared"

    // Fetch all orders with customer info
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        email: true,
        city: true,
        total: true,
        paidAmount: true,
        dueAmount: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
        userId: true,
      },
    });

    // Aggregate by normalized phone number
    const customerMap = new Map<string, any>();

    for (const order of orders) {
      const phone = order.phone?.trim() || "Unknown";
      const key = phone;

      // Effective order totals (only non-cancelled orders count towards financial totals)
      const isCancelled = order.orderStatus === "CANCELLED";
      const orderTotal = isCancelled ? 0 : (order.total || 0);
      const paid = isCancelled ? 0 : (order.paidAmount || (order.paymentStatus === "PAID" ? order.total : 0));
      const due = isCancelled ? 0 : (order.dueAmount || Math.max(0, orderTotal - paid));

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: order.userId || key,
          phone,
          customerName: order.customerName || "Customer",
          email: order.email || null,
          city: order.city || null,
          totalOrders: 1,
          totalSpent: orderTotal,
          totalPaid: paid,
          totalDue: due,
          lastOrderDate: order.createdAt,
          orders: [order],
        });
      } else {
        const existing = customerMap.get(key);
        existing.totalOrders += 1;
        existing.totalSpent += orderTotal;
        existing.totalPaid += paid;
        existing.totalDue += due;
        if (!existing.email && order.email) existing.email = order.email;
        if (!existing.city && order.city) existing.city = order.city;
        existing.orders.push(order);
      }
    }

    let customers = Array.from(customerMap.values());

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.customerName.toLowerCase().includes(searchLower) ||
          c.phone.toLowerCase().includes(searchLower) ||
          (c.city && c.city.toLowerCase().includes(searchLower)) ||
          (c.email && c.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filter === "due_only") {
      customers = customers.filter((c) => c.totalDue > 0);
    } else if (filter === "cleared") {
      customers = customers.filter((c) => c.totalDue <= 0);
    }

    // Sort by totalDue desc, then totalSpent desc
    customers.sort((a, b) => b.totalDue - a.totalDue || b.totalSpent - a.totalSpent);

    const summary = {
      totalCustomers: customerMap.size,
      totalReceivables: Array.from(customerMap.values()).reduce((sum, c) => sum + c.totalDue, 0),
      totalBilled: Array.from(customerMap.values()).reduce((sum, c) => sum + c.totalSpent, 0),
      totalCollected: Array.from(customerMap.values()).reduce((sum, c) => sum + c.totalPaid, 0),
      customersWithDue: Array.from(customerMap.values()).filter((c) => c.totalDue > 0).length,
    };

    return NextResponse.json({
      success: true,
      data: customers,
      summary,
    });
  } catch (error: any) {
    console.error("Error fetching customer accounts:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load customer accounts." },
      { status: 500 }
    );
  }
}
