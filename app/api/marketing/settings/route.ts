import { NextResponse } from "next/server";
import { getMarketingSettings } from "@/lib/marketing-settings";

export async function GET() {
  try {
    const settings = await getMarketingSettings();

    return NextResponse.json({
      success: true,
      isReferralActive: settings.isReferralActive,
      isLoyaltyProgramActive: settings.isLoyaltyProgramActive,
      homeBannerActive: settings.homeBannerActive,
      homeBannerText: settings.homeBannerText,
      rules: {
        referrerRewardPoints: settings.referrerRewardPoints,
        refereeWelcomeDiscount: settings.refereeWelcomeDiscount,
        referralMinOrderSubtotal: settings.referralMinOrderSubtotal,
        apothecaryEarnPercent: settings.apothecaryEarnPercent,
        hijamaEarnPoints: settings.hijamaEarnPoints,
        consultationEarnPoints: settings.consultationEarnPoints,
        minRedemptionPoints: settings.minRedemptionPoints,
        maxRedemptionSubtotalCap: settings.maxRedemptionSubtotalCap,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/marketing/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch marketing settings." },
      { status: 500 }
    );
  }
}
