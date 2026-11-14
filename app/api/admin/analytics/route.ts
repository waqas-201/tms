import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isStaffRole } from "@/lib/rbac-base";
import { POINT_TO_PKR_RATE } from "@/lib/loyalty";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role || "user";
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Access denied: Staff privileges required." },
        { status: 403 }
      );
    }

    // 1. Acquisition Funnel by Source
    const totalMembers = await prisma.user.count({
      where: { membershipId: { not: null } },
    });

    const sourceCounts = await prisma.user.groupBy({
      by: ["signupSource"],
      _count: { _all: true },
    });

    const bySource: Record<string, number> = {
      QR: 0,
      WEBSITE: 0,
      REFERRAL: 0,
    };

    sourceCounts.forEach((item) => {
      const src = item.signupSource?.toUpperCase() || "WEBSITE";
      bySource[src] = (bySource[src] || 0) + item._count._all;
    });

    const acquisition = {
      totalMembers,
      bySource,
      qrPercentage: totalMembers > 0 ? Math.round(((bySource.QR || 0) / totalMembers) * 100) : 0,
      websitePercentage: totalMembers > 0 ? Math.round(((bySource.WEBSITE || 0) / totalMembers) * 100) : 0,
      referralPercentage: totalMembers > 0 ? Math.round(((bySource.REFERRAL || 0) / totalMembers) * 100) : 0,
    };

    // 2. Referral Conversion Funnel
    const totalReferrers = await prisma.user.count({
      where: { referralCode: { not: null } },
    });

    const totalReferred = await prisma.user.count({
      where: { referredById: { not: null } },
    });

    const successfulReferrals = await prisma.user.count({
      where: {
        referredById: { not: null },
        isReferralRewardClaimed: true,
      },
    });

    const pendingReferrals = Math.max(0, totalReferred - successfulReferrals);
    const referralConversionRate =
      totalReferred > 0 ? Math.round((successfulReferrals / totalReferred) * 100) : 0;
    const totalReferralPointsAwarded = successfulReferrals * 100;

    const referrals = {
      totalReferrers,
      totalReferred,
      successfulReferrals,
      pendingReferrals,
      conversionRate: referralConversionRate,
      pointsAwarded: totalReferralPointsAwarded,
      pkrValueAwarded: totalReferralPointsAwarded * POINT_TO_PKR_RATE,
    };

    // 3. Loyalty Ledger Balance Sheet & Financial Liabilities
    let loyaltyStats = {
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      totalPointsClawedBack: 0,
      outstandingPointsLiability: 0,
      outstandingCashLiabilityPkr: 0,
    };

    if (prisma.loyaltyLedger?.aggregate) {
      const earnSum = await prisma.loyaltyLedger.aggregate({
        where: { type: "EARN" },
        _sum: { amount: true },
      });

      const redeemSum = await prisma.loyaltyLedger.aggregate({
        where: { type: "REDEEM" },
        _sum: { amount: true },
      });

      const clawbackSum = await prisma.loyaltyLedger.aggregate({
        where: { type: "CLAWBACK" },
        _sum: { amount: true },
      });

      const totalBalanceSum = await prisma.loyaltyLedger.aggregate({
        _sum: { amount: true },
      });

      const issued = earnSum._sum.amount ?? 0;
      const redeemed = Math.abs(redeemSum._sum.amount ?? 0);
      const clawedBack = Math.abs(clawbackSum._sum.amount ?? 0);
      const netLiability = totalBalanceSum._sum.amount ?? 0;

      loyaltyStats = {
        totalPointsIssued: issued,
        totalPointsRedeemed: redeemed,
        totalPointsClawedBack: clawedBack,
        outstandingPointsLiability: Math.max(0, netLiability),
        outstandingCashLiabilityPkr: Math.max(0, netLiability) * POINT_TO_PKR_RATE,
      };
    }

    // 4. Order Commerce & Revenue Health
    const totalOrders = await prisma.order.count();

    const ordersByStatus = await prisma.order.groupBy({
      by: ["orderStatus"],
      _count: { _all: true },
    });

    const statusCounts: Record<string, number> = {
      DELIVERED: 0,
      CANCELLED: 0,
      CONFIRMED: 0,
      DISPATCHED: 0,
      PENDING: 0,
    };

    ordersByStatus.forEach((s) => {
      statusCounts[s.orderStatus] = s._count._all;
    });

    const financialAggregates = await prisma.order.aggregate({
      _sum: {
        subtotal: true,
        discountAmount: true,
        paidAmount: true,
        total: true,
      },
    });

    const gmv = financialAggregates._sum.subtotal ?? 0;
    const totalDiscountBurn = financialAggregates._sum.discountAmount ?? 0;
    const netRevenue = financialAggregates._sum.paidAmount ?? 0;
    const deliveredCount = statusCounts.DELIVERED || 0;
    const cancelledCount = statusCounts.CANCELLED || 0;

    const deliveredFinancials = await prisma.order.aggregate({
      where: { orderStatus: "DELIVERED" },
      _sum: { total: true },
      _count: { _all: true },
    });

    const deliveredTotal = deliveredFinancials._sum.total ?? 0;
    const aov = deliveredCount > 0 ? Math.round(deliveredTotal / deliveredCount) : 0;
    const fulfillmentRate =
      totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;
    const cancellationRate =
      totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100) : 0;

    const orders = {
      totalOrders,
      statusCounts,
      gmv,
      netRevenue,
      totalDiscountBurn,
      aov,
      fulfillmentRate,
      cancellationRate,
    };

    return NextResponse.json({
      success: true,
      data: {
        acquisition,
        referrals,
        loyalty: loyaltyStats,
        orders,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/analytics] Error computing analytics:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate business analytics." },
      { status: 500 }
    );
  }
}
