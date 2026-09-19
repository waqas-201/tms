import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { getAvailableStock } from "@/lib/inventory";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
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
      allSizes,
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
      prisma.productSize.findMany({
        where: { isActive: true },
        include: { product: { select: { name: true, slug: true, image: true } } },
      }),
    ]);

    let totalOnHand = 0;
    let totalReserved = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockItems: Array<{
      id: string;
      productName: string;
      productSlug: string;
      packName: string;
      packWeight: string;
      available: number;
      lowStockThreshold: number;
    }> = [];

    for (const size of allSizes) {
      totalOnHand += size.stockOnHand;
      totalReserved += size.stockReserved;
      const available = getAvailableStock(size);
      const isLow = available <= (size.lowStockThreshold || 5);

      if (available === 0) {
        outOfStockCount++;
      }
      if (isLow) {
        lowStockCount++;
        lowStockItems.push({
          id: size.id,
          productName: size.product.name,
          productSlug: size.product.slug,
          packName: size.name,
          packWeight: size.weight,
          available,
          lowStockThreshold: size.lowStockThreshold || 5,
        });
      }
    }

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
        inventory: {
          totalPacks: allSizes.length,
          totalOnHand,
          totalReserved,
          totalAvailable: Math.max(0, totalOnHand - totalReserved),
          lowStockCount,
          outOfStockCount,
          lowStockItems: lowStockItems.slice(0, 5),
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
