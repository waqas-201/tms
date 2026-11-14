import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { normalizePhoneNumber } from "@/lib/phone";
import { generateMembershipId } from "@/lib/membership";
import { getUserLoyaltyBalance, POINT_EXPIRY_DAYS } from "@/lib/loyalty";

/**
 * Referral Engine Policy Constants (Governed by approved Milestone M6 specification)
 */
export const REFERRAL_QUALIFYING_MIN_SUBTOTAL = 1000; // Referee must spend min ₨ 1,000 subtotal on first order
export const REFERRER_REWARD_POINTS = 100; // Flat 100 points (₨ 100 value) awarded to referrer
export const REFEREE_WELCOME_VOUCHER_DISCOUNT = 200; // ₨ 200 off
export const REFEREE_WELCOME_VOUCHER_MIN_SUBTOTAL = 1200; // on orders of min ₨ 1,200

export interface ReferralValidationResult {
  valid: boolean;
  reason?: string;
  referrer?: {
    id: string;
    name: string;
    membershipId: string | null;
    referralCode: string | null;
    phone: string | null;
  };
}

export interface UserReferralStats {
  referralCode: string;
  shareUrl: string;
  totalReferred: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
  referrals: Array<{
    id: string;
    name: string;
    joinedAt: Date;
    hasQualifyingOrder: boolean;
  }>;
}

/**
 * Helper to mask customer names for public privacy protection.
 * (e.g. "Muhammad Waqas" -> "Muhammad W.", "Tariq" -> "Ta***")
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return "Member";
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    const single = parts[0];
    return single.length <= 2 ? `${single[0]}*` : `${single.slice(0, 2)}${"*".repeat(single.length - 2)}`;
  }
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/**
 * Derives the canonical referral code from a membership ID.
 * (e.g. "TMS-M-10001" -> "REF-10001", "10001" -> "REF-10001")
 */
export function getReferralCodeForMembership(membershipId: string): string {
  const digits = membershipId.replace(/[^0-9]/g, "");
  if (!digits) {
    throw new Error(`Invalid membership ID for referral code derivation: ${membershipId}`);
  }
  return `REF-${digits}`;
}

/**
 * Ensures a user has an active membershipId and referralCode.
 * If user does not have a referralCode, derives and persists it idempotently.
 */
export async function ensureUserReferralCode(
  userId: string,
  txClient?: Prisma.TransactionClient
): Promise<string> {
  const db = (txClient || prisma) as Prisma.TransactionClient;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, membershipId: true, referralCode: true },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      if (user.referralCode) {
        return user.referralCode;
      }

      let membershipId = user.membershipId;
      if (!membershipId) {
        membershipId = await generateMembershipId(db);
      }

      const referralCode = getReferralCodeForMembership(membershipId);

      await db.user.update({
        where: { id: userId },
        data: {
          membershipId,
          referralCode,
        },
      });

      return referralCode;
    } catch (err: any) {
      if (err?.code === "P2002" && attempts < maxAttempts) {
        // Wait briefly and retry in case of concurrent assignment
        await new Promise((r) => setTimeout(r, 50 * attempts));
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Failed to assign referral code for user ${userId} after ${maxAttempts} attempts.`);
}

/**
 * Validates a referral code against anti-fraud rules:
 * 1. Existence: Referrer must exist with this referralCode (or membershipId).
 * 2. Self-referral protection: Referee cannot refer themselves by userId, phone, or email.
 * 3. Circular referral protection: A cannot refer B if B already referred A.
 * 4. Duplicate/Existing customer protection: Referee must NOT have prior orders, bookings, or consultations.
 */
export async function validateReferralCode(
  rawCode: string,
  referee: {
    userId?: string | null;
    phone?: string | null;
    email?: string | null;
  },
  txClient?: Prisma.TransactionClient
): Promise<ReferralValidationResult> {
  const db = (txClient || prisma) as Prisma.TransactionClient;
  const cleanCode = (rawCode || "").trim().toUpperCase();

  if (!cleanCode) {
    return { valid: false, reason: "Referral code is required." };
  }

  // 1. Look up referrer by referralCode, or fallback to membershipId
  const referrer = await db.user.findFirst({
    where: {
      OR: [
        { referralCode: cleanCode },
        { membershipId: cleanCode },
      ],
    },
    select: {
      id: true,
      name: true,
      membershipId: true,
      referralCode: true,
      phone: true,
      email: true,
      referredById: true,
      isActive: true,
    },
  });

  if (!referrer || !referrer.isActive) {
    return { valid: false, reason: "The provided referral code does not exist or is inactive." };
  }

  // 2. Anti-Fraud Rule: Self-referral protection
  if (referee.userId && referee.userId === referrer.id) {
    return { valid: false, reason: "You cannot use your own referral code." };
  }

  const cleanRefereePhone = referee.phone ? normalizePhoneNumber(referee.phone) : null;
  const cleanReferrerPhone = referrer.phone ? normalizePhoneNumber(referrer.phone) : null;
  if (cleanRefereePhone && cleanReferrerPhone && cleanRefereePhone === cleanReferrerPhone) {
    return { valid: false, reason: "You cannot refer yourself (matching phone number)." };
  }

  const cleanRefereeEmail = referee.email ? referee.email.trim().toLowerCase() : null;
  const cleanReferrerEmail = referrer.email ? referrer.email.trim().toLowerCase() : null;
  if (cleanRefereeEmail && cleanReferrerEmail && cleanRefereeEmail === cleanReferrerEmail) {
    return { valid: false, reason: "You cannot refer yourself (matching email address)." };
  }

  // 3. Anti-Fraud Rule: Circular referral protection
  if (referee.userId && referrer.referredById === referee.userId) {
    return { valid: false, reason: "Circular referrals are not permitted." };
  }

  // 4. Anti-Fraud Rule: Duplicate / Existing customer protection
  // Referee must be a new customer with zero historical transactions
  const phoneSearch = cleanRefereePhone || (referee.phone ? referee.phone.trim() : null);
  const emailSearch = cleanRefereeEmail;
  const userSearch = referee.userId || null;

  if (phoneSearch || emailSearch || userSearch) {
    // Check prior orders
    if (db.order?.count) {
      const orderOr: any[] = [];
      if (userSearch) orderOr.push({ userId: userSearch });
      if (phoneSearch) orderOr.push({ phone: phoneSearch });
      if (emailSearch) orderOr.push({ email: emailSearch });

      if (orderOr.length > 0) {
        const priorOrders = await db.order.count({
          where: { OR: orderOr },
        });
        if (priorOrders > 0) {
          return {
            valid: false,
            reason: "Referral benefits are exclusively for new customers without prior order history.",
          };
        }
      }
    }

    // Check prior consultations (using actual schema fields patientPhone & patientEmail)
    if (db.consultationRequest?.count) {
      const consultOr: any[] = [];
      if (userSearch) consultOr.push({ userId: userSearch });
      if (phoneSearch) consultOr.push({ patientPhone: phoneSearch });
      if (emailSearch) consultOr.push({ patientEmail: emailSearch });

      if (consultOr.length > 0) {
        const priorConsultations = await db.consultationRequest.count({
          where: { OR: consultOr },
        });
        if (priorConsultations > 0) {
          return {
            valid: false,
            reason: "Referral benefits are exclusively for new patients without prior clinic history.",
          };
        }
      }
    }

    // Check prior Hijama bookings
    if (db.hijamaBooking?.count) {
      const hijamaOr: any[] = [];
      if (userSearch) hijamaOr.push({ userId: userSearch });
      if (phoneSearch) hijamaOr.push({ phone: phoneSearch });
      if (emailSearch) hijamaOr.push({ email: emailSearch });

      if (hijamaOr.length > 0) {
        const priorHijama = await db.hijamaBooking.count({
          where: { OR: hijamaOr },
        });
        if (priorHijama > 0) {
          return {
            valid: false,
            reason: "Referral benefits are exclusively for new patients without prior Hijama bookings.",
          };
        }
      }
    }
  }

  return {
    valid: true,
    referrer: {
      id: referrer.id,
      name: referrer.name,
      membershipId: referrer.membershipId,
      referralCode: referrer.referralCode,
      phone: referrer.phone,
    },
  };
}

/**
 * Binds referral attribution to a referee user record.
 * Immutable: If user already has `referredById` populated, attribution is locked.
 */
export async function applyReferralAttribution(
  refereeUserId: string,
  rawCode: string,
  txClient?: Prisma.TransactionClient
): Promise<{ success: boolean; reason?: string; referrerId?: string }> {
  const db = (txClient || prisma) as Prisma.TransactionClient;

  const referee = await db.user.findUnique({
    where: { id: refereeUserId },
    select: { id: true, phone: true, email: true, referredById: true },
  });

  if (!referee) {
    return { success: false, reason: "Referee user not found." };
  }

  if (referee.referredById) {
    return {
      success: false,
      reason: "Referral attribution is already established and cannot be overwritten.",
    };
  }

  const validation = await validateReferralCode(
    rawCode,
    {
      userId: referee.id,
      phone: referee.phone,
      email: referee.email,
    },
    db
  );

  if (!validation.valid || !validation.referrer) {
    return { success: false, reason: validation.reason || "Invalid referral code." };
  }

  await db.user.update({
    where: { id: refereeUserId },
    data: {
      referredById: validation.referrer.id,
      signupSource: "REFERRAL",
    },
  });

  return { success: true, referrerId: validation.referrer.id };
}

/**
 * Evaluates and awards 100 loyalty points to the referrer when referee's
 * first qualifying order reaches DELIVERED status (subtotal >= ₨ 1,000).
 * Fully transactional and idempotent.
 */
export async function processReferralRewardOnDelivery(
  orderId: string,
  txClient?: Prisma.TransactionClient,
  targetStatus?: string
): Promise<{
  rewarded: boolean;
  reason?: string;
  points?: number;
  referrerId?: string;
}> {
  const db = (txClient || prisma) as Prisma.TransactionClient;

  // 1. Fetch order
  const order = await db.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
    select: {
      id: true,
      orderNumber: true,
      subtotal: true,
      discountAmount: true,
      orderStatus: true,
      userId: true,
      phone: true,
    },
  });

  if (!order) {
    return { rewarded: false, reason: `Order not found: ${orderId}` };
  }

  // 2. Validate status and qualification threshold (net settled subtotal >= ₨ 1,000)
  const effectiveStatus = targetStatus || order.orderStatus;
  if (effectiveStatus !== "DELIVERED") {
    return {
      rewarded: false,
      reason: `Order status is ${effectiveStatus}, referral rewards trigger only upon DELIVERED.`,
    };
  }

  const netSubtotal = Number(order.subtotal) - (Number(order.discountAmount) || 0);
  if (netSubtotal < REFERRAL_QUALIFYING_MIN_SUBTOTAL) {
    return {
      rewarded: false,
      reason: `Order net subtotal ₨ ${netSubtotal} is below qualifying threshold of ₨ ${REFERRAL_QUALIFYING_MIN_SUBTOTAL}.`,
    };
  }

  // 3. Resolve referee user record
  let referee = null;
  if (order.userId) {
    referee = await db.user.findUnique({
      where: { id: order.userId },
      select: { id: true, referredById: true, isReferralRewardClaimed: true },
    });
  } else if (order.phone) {
    const cleanPhone = normalizePhoneNumber(order.phone);
    if (cleanPhone) {
      referee = await db.user.findFirst({
        where: { phone: cleanPhone },
        select: { id: true, referredById: true, isReferralRewardClaimed: true },
      });
    }
  }

  if (!referee || !referee.referredById) {
    return { rewarded: false, reason: "Order customer was not referred by another member." };
  }

  if (referee.isReferralRewardClaimed) {
    return {
      rewarded: false,
      reason: "Referral reward has already been claimed for this referee's first qualifying order.",
    };
  }

  const referrerId = referee.referredById;

  // 4. Atomically claim referral reward flag on referee user
  // This atomic check eliminates TOCTOU races between concurrent orders
  const claimUpdate = await db.user.updateMany({
    where: {
      id: referee.id,
      isReferralRewardClaimed: false,
    },
    data: {
      isReferralRewardClaimed: true,
    },
  });

  if (claimUpdate.count === 0) {
    return {
      rewarded: false,
      reason: "Referral reward has already been claimed for this referee's first qualifying order.",
    };
  }

  // 5. Check ledger idempotency
  if (db.loyaltyLedger?.findFirst) {
    const existingEarn = await db.loyaltyLedger.findFirst({
      where: {
        userId: referrerId,
        source: "REFERRAL",
        referenceId: order.id,
        type: "EARN",
      },
    });

    if (existingEarn) {
      return {
        rewarded: false,
        reason: "Referral reward points already credited for this order.",
        referrerId,
        points: existingEarn.amount,
      };
    }
  }

  // 6. Calculate new balance and credit points
  const currentBalance = await getUserLoyaltyBalance(referrerId, db);
  const balanceAfter = currentBalance + REFERRER_REWARD_POINTS;
  const expiresAt = new Date(Date.now() + POINT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  try {
    if (db.loyaltyLedger?.create) {
      await db.loyaltyLedger.create({
        data: {
          userId: referrerId,
          amount: REFERRER_REWARD_POINTS,
          type: "EARN",
          source: "REFERRAL",
          referenceId: order.id,
          balanceAfter,
          expiresAt,
          reason: `Referral reward for referee qualifying order #${order.orderNumber || order.id}`,
        },
      });
    }

    return {
      rewarded: true,
      points: REFERRER_REWARD_POINTS,
      referrerId,
    };
  } catch (err: any) {
    // If ledger insert failed, rollback referee claim flag
    await db.user.update({
      where: { id: referee.id },
      data: { isReferralRewardClaimed: false },
    }).catch(() => null);

    // Unique constraint idempotency protection
    if (err?.code === "P2002") {
      return {
        rewarded: false,
        reason: "Referral reward already credited via concurrent execution.",
        referrerId,
      };
    }
    throw err;
  }
}

/**
 * Reverses (claws back) the 100 referral points credited to the referrer if
 * the referee's qualifying order transitions to CANCELLED.
 * Transactional and idempotent. Allows negative balance if referrer already spent.
 */
export async function reverseReferralRewardOnCancellation(
  orderId: string,
  txClient?: Prisma.TransactionClient
): Promise<{
  reversed: boolean;
  reason?: string;
  points?: number;
  referrerId?: string;
}> {
  const db = (txClient || prisma) as Prisma.TransactionClient;

  // 1. Fetch order
  const order = await db.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      phone: true,
    },
  });

  if (!order) {
    return { reversed: false, reason: `Order not found: ${orderId}` };
  }

  if (!db.loyaltyLedger?.findFirst || !db.loyaltyLedger?.create) {
    return { reversed: false, reason: "Loyalty ledger model not available." };
  }

  // 2. Find the referral EARN entry for this order
  const earnEntry = await db.loyaltyLedger.findFirst({
    where: {
      source: "REFERRAL",
      referenceId: order.id,
      type: "EARN",
    },
  });

  if (!earnEntry) {
    return {
      reversed: false,
      reason: "No referral points were earned on this order, nothing to claw back.",
    };
  }

  // 3. Check if already clawed back
  const existingClawback = await db.loyaltyLedger.findFirst({
    where: {
      userId: earnEntry.userId,
      source: "REFERRAL",
      referenceId: order.id,
      type: "CLAWBACK",
    },
  });

  if (existingClawback) {
    return {
      reversed: false,
      reason: "Referral points for this order have already been clawed back.",
      referrerId: earnEntry.userId,
    };
  }

  // 4. Create CLAWBACK entry (-100 points)
  const currentBalance = await getUserLoyaltyBalance(earnEntry.userId, db);
  const balanceAfter = currentBalance - REFERRER_REWARD_POINTS;

  try {
    await db.loyaltyLedger.create({
      data: {
        userId: earnEntry.userId,
        amount: -REFERRER_REWARD_POINTS,
        type: "CLAWBACK",
        source: "REFERRAL",
        referenceId: order.id,
        balanceAfter,
        reason: `Clawback of referral reward due to cancelled order #${order.orderNumber || order.id}`,
      },
    });

    // 5. Reset referee's isReferralRewardClaimed flag
    let refereeId: string | null = order.userId;
    if (!refereeId && order.phone) {
      const cleanPhone = normalizePhoneNumber(order.phone);
      if (cleanPhone) {
        const found = await db.user.findFirst({
          where: { phone: cleanPhone },
          select: { id: true },
        });
        refereeId = found ? found.id : null;
      }
    }

    if (refereeId) {
      await db.user.update({
        where: { id: refereeId },
        data: { isReferralRewardClaimed: false },
      });
    }

    return {
      reversed: true,
      points: REFERRER_REWARD_POINTS,
      referrerId: earnEntry.userId,
    };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return {
        reversed: false,
        reason: "Referral clawback already processed via concurrent execution.",
        referrerId: earnEntry.userId,
      };
    }
    throw err;
  }
}

/**
 * Returns comprehensive referral telemetry and stats for a member's dashboard.
 */
export async function getUserReferralStats(
  userId: string,
  originUrl = "https://tameeresehat.com",
  txClient?: Prisma.TransactionClient
): Promise<UserReferralStats> {
  const db = (txClient || prisma) as Prisma.TransactionClient;

  const referralCode = await ensureUserReferralCode(userId, db);
  const shareUrl = `${originUrl.replace(/\/$/, "")}/join?ref=${referralCode}`;

  // Fetch all users who registered through this user's referral code
  const referredUsers = await db.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      isReferralRewardClaimed: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReferred = referredUsers.length;
  const successfulReferrals = referredUsers.filter((u) => u.isReferralRewardClaimed).length;
  const pendingReferrals = totalReferred - successfulReferrals;
  const totalPointsEarned = successfulReferrals * REFERRER_REWARD_POINTS;

  return {
    referralCode,
    shareUrl,
    totalReferred,
    successfulReferrals,
    pendingReferrals,
    totalPointsEarned,
    referrals: referredUsers.map((u, idx) => ({
      id: `ref_${idx + 1}`,
      name: maskName(u.name),
      joinedAt: u.createdAt,
      hasQualifyingOrder: u.isReferralRewardClaimed,
    })),
  };
}
