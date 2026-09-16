import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const [
      totalOrders,
      pendingOrders,
      dispatchedOrders,
      deliveredOrders,
      ordersAgg,
      totalConsultations,
      newConsultations,
      totalProducts,
      unreadInquiries,
      totalUsers,
      recentOrders,
      recentConsultations,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: "PENDING" } }),
      prisma.order.count({ where: { orderStatus: "DISPATCHED" } }),
      prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.consultationRequest.count(),
      prisma.consultationRequest.count({ where: { status: "NEW" } }),
      prisma.product.count(),
      prisma.contactInquiry.count({ where: { status: "UNREAD" } }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.consultationRequest.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: ordersAgg._sum.total || 0,
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          dispatched: dispatchedOrders,
          delivered: deliveredOrders,
        },
        consultations: {
          total: totalConsultations,
          new: newConsultations,
        },
        products: {
          total: totalProducts,
        },
        inquiries: {
          unread: unreadInquiries,
        },
        users: {
          total: totalUsers,
        },
        recentOrders,
        recentConsultations,
      },
    });
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard metrics." },
      { status: 500 }
    );
  }
}
