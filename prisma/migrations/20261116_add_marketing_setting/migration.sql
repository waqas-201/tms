-- CreateTable
CREATE TABLE IF NOT EXISTS "marketing_setting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isReferralActive" BOOLEAN NOT NULL DEFAULT false,
    "referrerRewardPoints" INTEGER NOT NULL DEFAULT 100,
    "refereeWelcomeDiscount" DOUBLE PRECISION NOT NULL DEFAULT 200.0,
    "referralMinOrderSubtotal" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    "isLoyaltyProgramActive" BOOLEAN NOT NULL DEFAULT true,
    "apothecaryEarnPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "hijamaEarnPoints" INTEGER NOT NULL DEFAULT 50,
    "consultationEarnPoints" INTEGER NOT NULL DEFAULT 30,
    "minRedemptionPoints" INTEGER NOT NULL DEFAULT 200,
    "maxRedemptionSubtotalCap" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "homeBannerText" TEXT,
    "homeBannerActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_setting_pkey" PRIMARY KEY ("id")
);
