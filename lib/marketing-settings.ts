import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export interface MarketingSettings {
  isReferralActive: boolean;
  referrerRewardPoints: number;
  refereeWelcomeDiscount: number;
  referralMinOrderSubtotal: number;
  isLoyaltyProgramActive: boolean;
  apothecaryEarnPercent: number;
  hijamaEarnPoints: number;
  consultationEarnPoints: number;
  minRedemptionPoints: number;
  maxRedemptionSubtotalCap: number;
  homeBannerText: string | null;
  homeBannerActive: boolean;
}

export const DEFAULT_MARKETING_SETTINGS: MarketingSettings = {
  isReferralActive: false, // Default to false: Admin explicitly deleted/disabled referrals
  referrerRewardPoints: 100, // 100 points = ₨ 100
  refereeWelcomeDiscount: 200, // ₨ 200 off
  referralMinOrderSubtotal: 1000, // ₨ 1,000 minimum spend
  isLoyaltyProgramActive: true,
  apothecaryEarnPercent: 0.02, // 2% cashback
  hijamaEarnPoints: 50, // 50 pts
  consultationEarnPoints: 30, // 30 pts
  minRedemptionPoints: 200, // 200 pts minimum to burn
  maxRedemptionSubtotalCap: 0.10, // Max 10% of subtotal
  homeBannerText: "Special Offers & Rewards: Save with active coupons & earn loyalty perks on every order!",
  homeBannerActive: true,
};

const FALLBACK_FILE_PATH = path.resolve(process.cwd(), "app/data/marketing-settings.json");

// In-memory cache for fast SSR and serverless executions
let memoryCache: MarketingSettings | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds

function readFallbackFile(): MarketingSettings | null {
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const raw = fs.readFileSync(FALLBACK_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    // Non-fatal fallback
  }
  return null;
}

function writeFallbackFile(data: MarketingSettings) {
  try {
    const dir = path.dirname(FALLBACK_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // Non-fatal write failure (e.g. read-only filesystem on Vercel)
  }
}

/**
 * Returns current marketing and promotion settings.
 * Priority: DB (marketing_setting table) -> Fallback File -> In-Memory -> Default Settings
 */
export async function getMarketingSettings(): Promise<MarketingSettings> {
  const now = Date.now();
  if (memoryCache && now - lastCacheTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  // 1. Try reading from database
  try {
    if ((prisma as any).marketingSetting?.findUnique) {
      const dbRecord = await (prisma as any).marketingSetting.findUnique({
        where: { id: "default" },
      });
      if (dbRecord) {
        const merged: MarketingSettings = {
          isReferralActive: Boolean(dbRecord.isReferralActive),
          referrerRewardPoints: Number(dbRecord.referrerRewardPoints) || 100,
          refereeWelcomeDiscount: Number(dbRecord.refereeWelcomeDiscount) || 200,
          referralMinOrderSubtotal: Number(dbRecord.referralMinOrderSubtotal) || 1000,
          isLoyaltyProgramActive: Boolean(dbRecord.isLoyaltyProgramActive),
          apothecaryEarnPercent: Number(dbRecord.apothecaryEarnPercent) || 0.02,
          hijamaEarnPoints: Number(dbRecord.hijamaEarnPoints) || 50,
          consultationEarnPoints: Number(dbRecord.consultationEarnPoints) || 30,
          minRedemptionPoints: Number(dbRecord.minRedemptionPoints) || 200,
          maxRedemptionSubtotalCap: Number(dbRecord.maxRedemptionSubtotalCap) || 0.10,
          homeBannerText: dbRecord.homeBannerText || DEFAULT_MARKETING_SETTINGS.homeBannerText,
          homeBannerActive: Boolean(dbRecord.homeBannerActive),
        };
        memoryCache = merged;
        lastCacheTime = now;
        return merged;
      }
    }
  } catch (err) {
    // If table does not exist or db connection is unavailable, continue to file fallback
  }

  // 2. Try reading from fallback file
  const fileSettings = readFallbackFile();
  if (fileSettings) {
    memoryCache = { ...DEFAULT_MARKETING_SETTINGS, ...fileSettings };
    lastCacheTime = now;
    return memoryCache;
  }

  // 3. Fallback to default
  memoryCache = { ...DEFAULT_MARKETING_SETTINGS };
  lastCacheTime = now;
  return memoryCache;
}

/**
 * Updates marketing and promotion settings with authoritative persistence.
 */
export async function updateMarketingSettings(
  updates: Partial<MarketingSettings>
): Promise<MarketingSettings> {
  const current = await getMarketingSettings();
  const next: MarketingSettings = {
    ...current,
    ...updates,
  };

  // 1. Write to DB if model available
  try {
    if ((prisma as any).marketingSetting?.upsert) {
      await (prisma as any).marketingSetting.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          isReferralActive: next.isReferralActive,
          referrerRewardPoints: next.referrerRewardPoints,
          refereeWelcomeDiscount: next.refereeWelcomeDiscount,
          referralMinOrderSubtotal: next.referralMinOrderSubtotal,
          isLoyaltyProgramActive: next.isLoyaltyProgramActive,
          apothecaryEarnPercent: next.apothecaryEarnPercent,
          hijamaEarnPoints: next.hijamaEarnPoints,
          consultationEarnPoints: next.consultationEarnPoints,
          minRedemptionPoints: next.minRedemptionPoints,
          maxRedemptionSubtotalCap: next.maxRedemptionSubtotalCap,
          homeBannerText: next.homeBannerText,
          homeBannerActive: next.homeBannerActive,
        },
        update: {
          isReferralActive: next.isReferralActive,
          referrerRewardPoints: next.referrerRewardPoints,
          refereeWelcomeDiscount: next.refereeWelcomeDiscount,
          referralMinOrderSubtotal: next.referralMinOrderSubtotal,
          isLoyaltyProgramActive: next.isLoyaltyProgramActive,
          apothecaryEarnPercent: next.apothecaryEarnPercent,
          hijamaEarnPoints: next.hijamaEarnPoints,
          consultationEarnPoints: next.consultationEarnPoints,
          minRedemptionPoints: next.minRedemptionPoints,
          maxRedemptionSubtotalCap: next.maxRedemptionSubtotalCap,
          homeBannerText: next.homeBannerText,
          homeBannerActive: next.homeBannerActive,
        },
      });
    }
  } catch (err) {
    console.warn("[updateMarketingSettings] DB upsert failed, relying on file cache:", err);
  }

  // 2. Persist to file fallback
  writeFallbackFile(next);

  // 3. Update memory cache
  memoryCache = next;
  lastCacheTime = Date.now();

  return next;
}
