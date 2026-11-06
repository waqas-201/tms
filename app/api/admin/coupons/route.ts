import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { normalizeCouponCode } from "@/lib/coupons";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const scopeFilter = searchParams.get("scope");
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const where: Record<string, unknown> = {};

    if (scopeFilter && scopeFilter !== "ALL") {
      where.scope = scopeFilter;
    }

    if (statusFilter === "ACTIVE") {
      where.isActive = true;
    } else if (statusFilter === "INACTIVE") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        redemptions: {
          select: {
            id: true,
            discountAmount: true,
            orderTotal: true,
            orderId: true,
            hijamaBookingId: true,
            consultationId: true,
            redeemedAt: true,
          },
        },
        _count: {
          select: {
            redemptions: true,
            orders: true,
            hijamaBookings: true,
            consultations: true,
          },
        },
      },
    });

    // Compute aggregated metrics for each coupon
    const enrichedCoupons = coupons.map((c) => {
      const totalDiscountGiven = c.redemptions.reduce(
        (sum, r) => sum + (r.discountAmount || 0),
        0
      );
      const totalRevenueGenerated = c.redemptions.reduce(
        (sum, r) => sum + (r.orderTotal || 0),
        0
      );

      return {
        ...c,
        totalDiscountGiven,
        totalRevenueGenerated,
      };
    });

    // Summary statistics across all coupons
    const totalCouponsCount = await prisma.coupon.count();
    const activeCouponsCount = await prisma.coupon.count({ where: { isActive: true } });
    const allRedemptions = await prisma.couponRedemption.aggregate({
      _sum: {
        discountAmount: true,
        orderTotal: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: enrichedCoupons,
      summary: {
        totalCoupons: totalCouponsCount,
        activeCoupons: activeCouponsCount,
        totalRedemptions: allRedemptions._count.id || 0,
        totalDiscountsGiven: allRedemptions._sum.discountAmount || 0,
        totalRevenueInfluenced: allRedemptions._sum.orderTotal || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons." },
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
      code,
      description,
      scope = "PRODUCTS",
      discountType = "PERCENTAGE",
      discountValue,
      minSubtotal,
      maxDiscountCap,
      targetCategoryId,
      targetProductIds,
      startDate,
      endDate,
      usageLimit,
      perUserLimit = 1,
      isActive = true,
      isFlashSale = false,
      flashSaleBannerText,
      flashSaleBadge,
    } = body;

    const cleanCode = normalizeCouponCode(code);
    if (!cleanCode) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { success: false, error: "Coupon description is required." },
        { status: 400 }
      );
    }

    const numDiscountValue = Number(discountValue);
    if (isNaN(numDiscountValue) || numDiscountValue < 0) {
      return NextResponse.json(
        { success: false, error: "Valid discount value is required." },
        { status: 400 }
      );
    }

    // Check code uniqueness
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Coupon code "${cleanCode}" already exists.` },
        { status: 409 }
      );
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description.trim(),
        scope: String(scope).toUpperCase(),
        discountType: String(discountType).toUpperCase(),
        discountValue: numDiscountValue,
        minSubtotal: minSubtotal !== undefined && minSubtotal !== null && minSubtotal !== "" ? Number(minSubtotal) : null,
        maxDiscountCap: maxDiscountCap !== undefined && maxDiscountCap !== null && maxDiscountCap !== "" ? Number(maxDiscountCap) : null,
        targetCategoryId: targetCategoryId || null,
        targetProductIds: targetProductIds ? JSON.stringify(targetProductIds) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit !== undefined && usageLimit !== null && usageLimit !== "" ? Number(usageLimit) : null,
        perUserLimit: Number(perUserLimit) || 1,
        isActive: Boolean(isActive),
        isFlashSale: Boolean(isFlashSale),
        flashSaleBannerText: flashSaleBannerText?.trim() || null,
        flashSaleBadge: flashSaleBadge?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newCoupon,
      message: `Coupon "${newCoupon.code}" created successfully.`,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create coupon." },
      { status: 500 }
    );
  }
}
