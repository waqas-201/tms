import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const activePromos = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { isFlashSale: true },
          { flashSaleBannerText: { not: null } },
        ],
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      select: {
        id: true,
        code: true,
        description: true,
        scope: true,
        discountType: true,
        discountValue: true,
        minSubtotal: true,
        maxDiscountCap: true,
        endDate: true,
        isFlashSale: true,
        flashSaleBannerText: true,
        flashSaleBadge: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: activePromos,
    });
  } catch (error) {
    console.error("Error fetching active promos:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promotions." },
      { status: 500 }
    );
  }
}
