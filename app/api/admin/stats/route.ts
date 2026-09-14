import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!session || (session.user.role !== "admin" && session.user.role !== "hakim"))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or Hakim credentials required." },
        { status: 403 }
      );
    }

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
