import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMarketingSettings } from "@/lib/marketing-settings";

export async function GET() {
  try {
    const now = new Date();
    const settings = await getMarketingSettings();

    // Fetch all currently active coupons within the valid promotion window
    const activeCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [{ startDate: null }, { startDate: { lte: now } }],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }],
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
      orderBy: [{ isFlashSale: "desc" }, { createdAt: "desc" }],
      take: 20,
    });

    // Loyalty Rewards Program information
    const loyaltyInfo = settings.isLoyaltyProgramActive
      ? {
          active: true,
          title: "TMS Sehat Loyalty Rewards (صحت لائلٹی پوائنٹس)",
          description: "Earn 2% cashback points on apothecary orders, ₨ 50 on Sunnah Hijama, and ₨ 30 on Physician Consultations. Every 1 point = ₨ 1 discount at checkout.",
          earnPercent: settings.apothecaryEarnPercent * 100,
          hijamaPoints: settings.hijamaEarnPoints,
          consultationPoints: settings.consultationEarnPoints,
          pointToPkr: 1,
          minRedeemPoints: settings.minRedemptionPoints,
        }
      : null;

    // Friend Referral Program information (Authoritatively null if admin disabled it)
    const referralInfo = settings.isReferralActive
      ? {
          active: true,
          title: "Friend Referral Program (دوستوں کو مدعو کریں)",
          description: `Give friends ₨ ${settings.refereeWelcomeDiscount} off their first order and earn ${settings.referrerRewardPoints} Loyalty Points (₨ ${settings.referrerRewardPoints}) for each delivered referral.`,
          rewardPoints: settings.referrerRewardPoints,
          welcomeDiscount: settings.refereeWelcomeDiscount,
          minSubtotal: settings.referralMinOrderSubtotal,
        }
      : null;

    const totalActiveOffers =
      activeCoupons.length + (loyaltyInfo ? 1 : 0) + (referralInfo ? 1 : 0);

    return NextResponse.json({
      success: true,
      data: activeCoupons, // Backwards-compatible for MarketingFlashBanner
      coupons: activeCoupons,
      loyalty: loyaltyInfo,
      referral: referralInfo,
      isReferralActive: settings.isReferralActive,
      isLoyaltyProgramActive: settings.isLoyaltyProgramActive,
      homeBannerActive: settings.homeBannerActive,
      homeBannerText: settings.homeBannerText,
      totalActiveOffers,
    });
  } catch (error) {
    console.error("Error fetching active promos:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promotions." },
      { status: 500 }
    );
  }
}
