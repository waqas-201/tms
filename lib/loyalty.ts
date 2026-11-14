import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Economic & Ledger Constants (Governed by docs/loyalty-reward-rules.md)
 */
export const POINT_TO_PKR_RATE = 1; // 1 Point = ₨ 1.00 PKR
export const MIN_REDEMPTION_POINTS = 200; // Minimum 200 Points to burn
export const APOTHECARY_EARN_PERCENT = 0.02; // 2% of product subtotal
export const HIJAMA_EARN_POINTS = 50; // Flat 50 points upon completion
export const CONSULTATION_EARN_POINTS = 30; // Flat 30 points upon completion
export const MAX_SUBTOTAL_CAP_PERCENT = 0.25; // Points can discount at most 25% of subtotal
export const POINT_EXPIRY_DAYS = 365; // Points expire after 365 days
export const MAX_ADMIN_ADJUSTMENT_POINTS = 5000; // ±5,000 maximum manual adjustment safety bound

export type LoyaltyLedgerType =
  | "EARN"
  | "REDEEM"
  | "CLAWBACK"
  | "REFUND"
  | "ADJUST"
  | "EXPIRE";

export type LoyaltyLedgerSource =
  | "ORDER"
  | "HIJAMA"
  | "CONSULTATION"
  | "ADMIN"
  | "EXPIRY"
  | "REFERRAL";

/**
 * Calculates current active points balance by aggregating SUM(amount) of all ledger rows.
 * Guarantees the fundamental invariant: Balance === SUM(amount).
 */
export async function getUserLoyaltyBalance(
  userId: string,
  txClient?: Prisma.TransactionClient
): Promise<number> {
  const db = (txClient || prisma) as Prisma.TransactionClient;
  if (!db.loyaltyLedger?.aggregate) {
    return 0;
  }
  const result = await db.loyaltyLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  return result._sum.amount ?? 0;
}

/**
 * Fetches user's loyalty ledger history ordered newest first.
 */
export async function getUserLoyaltyHistory(
  userId: string,
  limit = 50,
  txClient?: Prisma.TransactionClient
) {
  const db = (txClient || prisma) as Prisma.TransactionClient;
  if (!db.loyaltyLedger?.findMany) {
    return [];
  }
  return await db.loyaltyLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Accrues 2% loyalty points on order delivery: Math.floor(order.subtotal * 0.02).
 * Fully idempotent: prevents duplicate events or double-crediting via check and unique constraint.
 */
export async function creditOrderLoyaltyPoints(
  orderId: string,
  txClient?: Prisma.TransactionClient
): Promise<{
  credited: boolean;
  amount?: number;
  newBalance?: number;
  reason?: string;
  entry?: any;
  alreadyCredited?: boolean;
}> {
  const db = (txClient || prisma) as Prisma.TransactionClient;
  if (!db.loyaltyLedger?.findFirst || !db.loyaltyLedger?.create) {
    return { credited: false, reason: "Loyalty ledger model not available on database client." };
  }

  // 1. Fetch order
  const order = await db.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
  });

  if (!order) {
    return { credited: false, reason: `Order not found: ${orderId}` };
  }

  // Guest orders without a linked customer account do not earn loyalty points
  if (!order.userId) {
    return { credited: false, reason: "Guest checkout has no registered user ID." };
  }

  // 2. 2% points calculation on subtotal (integer floor)
  const amount = Math.floor(order.subtotal * APOTHECARY_EARN_PERCENT);
  if (amount <= 0) {
    return { credited: false, reason: "Subtotal too low for loyalty accrual." };
  }

  // 3. Idempotency Check: prevent duplicate credit for the same order
  const existingEntry = await db.loyaltyLedger.findFirst({
    where: {
      userId: order.userId,
      source: "ORDER",
      referenceId: order.id,
      type: "EARN",
    },
  });

  if (existingEntry) {
    return {
      credited: false,
      alreadyCredited: true,
      amount: existingEntry.amount,
      entry: existingEntry,
    };
  }

  // 4. Calculate new running balance snapshot
  const currentBalance = await getUserLoyaltyBalance(order.userId, db);
  const newBalance = currentBalance + amount;
  const expiresAt = new Date(Date.now() + POINT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // 5. Atomic ledger insert
  try {
    const entry = await db.loyaltyLedger.create({
      data: {
        userId: order.userId,
        amount,
        type: "EARN",
        source: "ORDER",
        referenceId: order.id,
        balanceAfter: newBalance,
        expiresAt,
        reason: `Earned 2% points on Order #${order.orderNumber || order.id}`,
      },
    });

    return {
      credited: true,
      amount,
      newBalance,
      entry,
    };
  } catch (err: any) {
    // Graceful handling of concurrent race hitting unique constraint @@unique([userId, source, referenceId, type])
    if (err?.code === "P2002") {
      const duplicate = await db.loyaltyLedger.findFirst({
        where: {
          userId: order.userId,
          source: "ORDER",
          referenceId: order.id,
          type: "EARN",
        },
      });
      return {
        credited: false,
        alreadyCredited: true,
        entry: duplicate,
      };
    }
    throw err;
  }
}

/**
 * Reverses loyalty points when an order is cancelled or refunded:
 * 1. Claws back any points earned on this order (type: "CLAWBACK", amount: -earnedAmount).
 * 2. Restores any points redeemed on this order (type: "REFUND", amount: +redeemedAmount).
 * Supports negative customer balances per spec (e.g. if customer already spent earned points).
 */
export async function reverseOrderLoyaltyPoints(
  orderId: string,
  txClient?: Prisma.TransactionClient
): Promise<{
  reversed: boolean;
  clawbackAmount: number;
  refundedAmount: number;
  clawbackEntry?: any;
  refundEntry?: any;
}> {
  const db = (txClient || prisma) as Prisma.TransactionClient;
  if (!db.loyaltyLedger?.findFirst || !db.loyaltyLedger?.create) {
    return { reversed: false, clawbackAmount: 0, refundedAmount: 0 };
  }

  // Resolve canonical order ID
  const order = await db.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
  });

  const canonicalOrderId = order ? order.id : orderId;
  let clawbackAmount = 0;
  let refundedAmount = 0;
  let clawbackEntry: any = null;
  let refundEntry: any = null;

  // 1. Check for points earned on this order
  const earnEntry = await db.loyaltyLedger.findFirst({
    where: {
      source: "ORDER",
      referenceId: canonicalOrderId,
      type: "EARN",
    },
  });

  if (earnEntry) {
    // Idempotency: verify not already clawed back
    const existingClawback = await db.loyaltyLedger.findFirst({
      where: {
        source: "ORDER",
        referenceId: canonicalOrderId,
        type: "CLAWBACK",
      },
    });

    if (!existingClawback) {
      clawbackAmount = earnEntry.amount;
      const currentBalance = await getUserLoyaltyBalance(earnEntry.userId, db);
      const balanceAfter = currentBalance - clawbackAmount;

      try {
        clawbackEntry = await db.loyaltyLedger.create({
          data: {
            userId: earnEntry.userId,
            amount: -clawbackAmount,
            type: "CLAWBACK",
            source: "ORDER",
            referenceId: canonicalOrderId,
            balanceAfter,
            reason: `Clawback of points from cancelled order #${order?.orderNumber || canonicalOrderId}`,
          },
        });
      } catch (err: any) {
        if (err?.code !== "P2002") throw err;
      }
    } else {
      clawbackEntry = existingClawback;
      clawbackAmount = Math.abs(existingClawback.amount);
    }
  }

  // 2. Check for points redeemed on this order
  const redeemEntry = await db.loyaltyLedger.findFirst({
    where: {
      source: "ORDER",
      referenceId: canonicalOrderId,
      type: "REDEEM",
    },
  });

  if (redeemEntry) {
    // Idempotency: verify not already refunded
    const existingRefund = await db.loyaltyLedger.findFirst({
      where: {
        source: "ORDER",
        referenceId: canonicalOrderId,
        type: "REFUND",
      },
    });

    if (!existingRefund) {
      refundedAmount = Math.abs(redeemEntry.amount);
      const currentBalance = await getUserLoyaltyBalance(redeemEntry.userId, db);
      const balanceAfter = currentBalance + refundedAmount;

      try {
        refundEntry = await db.loyaltyLedger.create({
          data: {
            userId: redeemEntry.userId,
            amount: refundedAmount,
            type: "REFUND",
            source: "ORDER",
            referenceId: canonicalOrderId,
            balanceAfter,
            reason: `Refund of redeemed points from cancelled order #${order?.orderNumber || canonicalOrderId}`,
          },
        });
      } catch (err: any) {
        if (err?.code !== "P2002") throw err;
      }
    } else {
      refundEntry = existingRefund;
      refundedAmount = existingRefund.amount;
    }
  }

  return {
    reversed: Boolean(clawbackEntry || refundEntry),
    clawbackAmount,
    refundedAmount,
    clawbackEntry,
    refundEntry,
  };
}

/**
 * Credits verified clinical completion points:
 * - HIJAMA: Flat 50 points
 * - CONSULTATION: Flat 30 points
 */
export async function creditServiceLoyaltyPoints(
  serviceType: "HIJAMA" | "CONSULTATION",
  referenceId: string,
  userId: string,
  txClient?: Prisma.TransactionClient
): Promise<{
  credited: boolean;
  amount: number;
  newBalance?: number;
  entry?: any;
  alreadyCredited?: boolean;
}> {
  const db = (txClient || prisma) as Prisma.TransactionClient;
  const amount = serviceType === "HIJAMA" ? HIJAMA_EARN_POINTS : CONSULTATION_EARN_POINTS;

  // Idempotency check
  const existing = await db.loyaltyLedger.findFirst({
    where: {
      source: serviceType,
      referenceId,
      type: "EARN",
    },
  });

  if (existing) {
    return {
      credited: false,
      alreadyCredited: true,
      amount: existing.amount,
      entry: existing,
    };
  }

  const currentBalance = await getUserLoyaltyBalance(userId, db);
  const newBalance = currentBalance + amount;
  const expiresAt = new Date(Date.now() + POINT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  try {
    const entry = await db.loyaltyLedger.create({
      data: {
        userId,
        amount,
        type: "EARN",
        source: serviceType,
        referenceId,
        balanceAfter: newBalance,
        expiresAt,
        reason: `Completed ${serviceType === "HIJAMA" ? "Sunnah Hijama Session" : "Physician Consultation"}`,
      },
    });

    return {
      credited: true,
      amount,
      newBalance,
      entry,
    };
  } catch (err: any) {
    if (err?.code === "P2002") {
      const duplicate = await db.loyaltyLedger.findFirst({
        where: {
          userId,
          source: serviceType,
          referenceId,
          type: "EARN",
        },
      });
      return {
        credited: false,
        alreadyCredited: true,
        amount: duplicate?.amount || amount,
        entry: duplicate,
      };
    }
    throw err;
  }
}

/**
 * Performs manual point adjustment by clinic administrator.
 * Mandates a clear justification reason (minimum 5 characters) for audit trail.
 */
export async function adminAdjustLoyaltyPoints(
  params: {
    userId: string;
    amount: number;
    reason: string;
    staffUserId: string;
    referenceId?: string;
  },
  txClient?: Prisma.TransactionClient
): Promise<{
  adjusted: boolean;
  amount: number;
  balanceAfter: number;
  entry: any;
}> {
  const db = (txClient || prisma) as Prisma.TransactionClient;

  // Validation: mandatory reason with minimum 5 characters
  const trimmedReason = (params.reason || "").trim();
  if (trimmedReason.length < 5) {
    throw new Error("A reason of at least 5 characters is mandatory for manual loyalty adjustments.");
  }

  // Validation: non-zero integer amount within safety bound (±5,000)
  if (!Number.isInteger(params.amount) || params.amount === 0) {
    throw new Error("Adjustment amount must be a non-zero integer.");
  }
  if (Math.abs(params.amount) > MAX_ADMIN_ADJUSTMENT_POINTS) {
    throw new Error(
      `Adjustment amount cannot exceed ±${MAX_ADMIN_ADJUSTMENT_POINTS} points without executive override.`
    );
  }

  const currentBalance = await getUserLoyaltyBalance(params.userId, db);
  const balanceAfter = currentBalance + params.amount;

  // Use provided referenceId or generate a unique Admin Session/Adjustment ID
  const refId =
    params.referenceId ||
    `adj_${params.staffUserId || "admin"}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const entry = await db.loyaltyLedger.create({
    data: {
      userId: params.userId,
      amount: params.amount,
      type: "ADJUST",
      source: "ADMIN",
      referenceId: refId,
      balanceAfter,
      reason: trimmedReason,
    },
  });

  return {
    adjusted: true,
    amount: params.amount,
    balanceAfter,
    entry,
  };
}

/**
 * Burns loyalty points at checkout to discount an order.
 * Enforces minimum 200 points rule, 25% order subtotal cap, and uses
 * pessimistic row locking (`SELECT ... FOR UPDATE`) to prevent TOCTOU double-redemptions.
 */
export async function redeemLoyaltyPoints(
  params: {
    userId: string;
    points: number;
    orderId?: string;
    orderSubtotal?: number;
  },
  txClient?: Prisma.TransactionClient
): Promise<{
  redeemed: boolean;
  pointsRedeemed: number;
  balanceAfter: number;
  entry: any;
  alreadyRedeemed?: boolean;
}> {
  if (!Number.isInteger(params.points) || params.points <= 0) {
    throw new Error("Redemption points must be a positive integer.");
  }

  // Rule: Minimum 200 points required to burn
  if (params.points < MIN_REDEMPTION_POINTS) {
    throw new Error(`Minimum redemption threshold is ${MIN_REDEMPTION_POINTS} points.`);
  }

  // Rule: Enforce 25% order subtotal cap if orderSubtotal is provided
  if (params.orderSubtotal !== undefined && params.orderSubtotal !== null) {
    const numSubtotal = Number(params.orderSubtotal);
    if (Number.isFinite(numSubtotal) && numSubtotal > 0) {
      const maxAllowed = Math.floor(numSubtotal * MAX_SUBTOTAL_CAP_PERCENT);
      if (params.points > maxAllowed) {
        throw new Error(
          `Points redemption cannot exceed 25% of order subtotal (max ${maxAllowed} points).`
        );
      }
    }
  }

  const execute = async (tx: Prisma.TransactionClient) => {
    // Pessimistic Row Lock: serialize concurrent redemptions for this user and prevent TOCTOU double-spend
    if (typeof (tx as any).$executeRaw === "function") {
      await (tx as any).$executeRaw`SELECT id FROM "user" WHERE id = ${params.userId} FOR UPDATE`;
    }

    // Check current balance inside transaction after acquiring row lock
    const currentBalance = await getUserLoyaltyBalance(params.userId, tx);
    if (currentBalance < params.points) {
      throw new Error("Insufficient points balance.");
    }

    // Idempotency if orderId provided
    if (params.orderId) {
      const existing = await tx.loyaltyLedger.findFirst({
        where: {
          userId: params.userId,
          source: "ORDER",
          referenceId: params.orderId,
          type: "REDEEM",
        },
      });

      if (existing) {
        return {
          redeemed: false,
          alreadyRedeemed: true,
          pointsRedeemed: Math.abs(existing.amount),
          balanceAfter: existing.balanceAfter,
          entry: existing,
        };
      }
    }

    const balanceAfter = currentBalance - params.points;

    const entry = await tx.loyaltyLedger.create({
      data: {
        userId: params.userId,
        amount: -params.points,
        type: "REDEEM",
        source: "ORDER",
        referenceId: params.orderId || null,
        balanceAfter,
        reason: params.orderId
          ? `Points redeemed on Order #${params.orderId}`
          : "Points redeemed at checkout",
      },
    });

    return {
      redeemed: true,
      pointsRedeemed: params.points,
      balanceAfter,
      entry,
    };
  };

  if (txClient) {
    return await execute(txClient);
  }

  return await prisma.$transaction(execute);
}
