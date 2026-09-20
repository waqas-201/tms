import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    // 1. Fetch Orders summary
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        total: true,
        paidAmount: true,
        dueAmount: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            productSize: {
              select: {
                costPrice: true,
                price: true,
              },
            },
          },
        },
      },
    });

    const nonCancelledOrders = orders.filter((o) => o.orderStatus !== "CANCELLED");
    const totalRevenue = nonCancelledOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalCollected = nonCancelledOrders.reduce((acc, o) => {
      const paid = o.paidAmount > 0 ? o.paidAmount : (o.paymentStatus === "PAID" ? o.total : 0);
      return acc + paid;
    }, 0);
    const totalReceivables = nonCancelledOrders.reduce((acc, o) => {
      const due = o.dueAmount > 0 ? o.dueAmount : (o.paymentStatus === "PAID" ? 0 : o.total - (o.paidAmount || 0));
      return acc + Math.max(0, due);
    }, 0);

    // 2. Fetch Vendors summary
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        name: true,
        currentBalance: true,
        totalPurchased: true,
        totalPaid: true,
      },
    });

    const totalPayables = vendors.reduce((acc, v) => acc + (v.currentBalance || 0), 0);
    const totalPurchased = vendors.reduce((acc, v) => acc + (v.totalPurchased || 0), 0);
    const totalVendorPaid = vendors.reduce((acc, v) => acc + (v.totalPaid || 0), 0);

    // 3. Inventory Stock Valuation
    const productSizes = await prisma.productSize.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        weight: true,
        price: true,
        costPrice: true,
        stockOnHand: true,
        stockReserved: true,
        lowStockThreshold: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let totalStockUnits = 0;
    let inventoryCostValuation = 0;
    let inventoryRetailValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const size of productSizes) {
      const onHand = size.stockOnHand || 0;
      totalStockUnits += onHand;
      const effectiveCost = size.costPrice && size.costPrice > 0 ? size.costPrice : size.price * 0.55; // estimated 55% COGS default
      inventoryCostValuation += onHand * effectiveCost;
      inventoryRetailValuation += onHand * size.price;

      if (onHand <= 0) {
        outOfStockCount += 1;
      } else if (onHand <= size.lowStockThreshold) {
        lowStockCount += 1;
      }
    }

    // 4. Calculate COGS and Gross Profit for delivered/active orders
    let totalCOGS = 0;
    for (const order of nonCancelledOrders) {
      for (const item of order.items) {
        const itemCost = item.productSize?.costPrice || (item.price * 0.55);
        totalCOGS += (itemCost * item.quantity);
      }
    }

    const estimatedGrossProfit = Math.max(0, totalRevenue - totalCOGS);
    const grossMarginPercent = totalRevenue > 0 ? ((estimatedGrossProfit / totalRevenue) * 100).toFixed(1) : "0";

    // 5. Payment method breakdown
    const paymentMethods: Record<string, { count: number; total: number }> = {};
    for (const order of nonCancelledOrders) {
      const method = order.paymentMethod || "COD";
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, total: 0 };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].total += order.total;
    }

    return NextResponse.json({
      success: true,
      data: {
        financials: {
          totalRevenue,
          totalCollected,
          totalReceivables,
          totalPayables,
          totalPurchased,
          totalVendorPaid,
          estimatedCOGS: totalCOGS,
          estimatedGrossProfit,
          grossMarginPercent,
        },
        inventory: {
          totalVariants: productSizes.length,
          totalStockUnits,
          inventoryCostValuation,
          inventoryRetailValuation,
          lowStockCount,
          outOfStockCount,
        },
        vendors: {
          totalVendors: vendors.length,
          topPayableVendors: vendors
            .filter((v) => v.currentBalance > 0)
            .sort((a, b) => b.currentBalance - a.currentBalance)
            .slice(0, 5),
        },
        paymentMethods,
      },
    });
  } catch (error: any) {
    console.error("Error fetching financial stats:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load financial statistics." },
      { status: 500 }
    );
  }
}
