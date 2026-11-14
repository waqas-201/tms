import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { normalizePhoneNumber } from "@/lib/phone";
import crypto from "crypto";

export interface CreateOrRetrieveMembershipParams {
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  signupSource?: string;
}

export interface MembershipResult {
  user: any;
  membershipId: string;
  coupon: any;
  isNew: boolean;
}

/**
 * Masks a phone number to protect customer privacy against directory enumeration.
 * (e.g. 923001234567 -> 92300****567)
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 7) return "***";
  const start = digits.slice(0, Math.min(5, digits.length - 3));
  const end = digits.slice(-3);
  return `${start}${"*".repeat(Math.max(3, digits.length - start.length - end.length))}${end}`;
}

export interface MembershipStats {
  totalMembers: number;
  bySource: {
    QR: number;
    WEBSITE: number;
    REFERRAL: number;
    [key: string]: number;
  };
  sources: Array<{ source: string; count: number }>;
}

/**
 * Generates a branded sequential Membership ID in TMS-M-XXXXX format.
 * Base sequence starts at 10001 (TMS-M-10001) and increments sequentially.
 * Verifies uniqueness against database to guarantee zero collisions.
 */
export async function generateMembershipId(
  tx?: Prisma.TransactionClient
): Promise<string> {
  const db = (tx || prisma) as Prisma.TransactionClient;

  // Retrieve the latest member with a TMS-M- prefix
  const lastMember = await db.user.findFirst({
    where: {
      membershipId: {
        startsWith: "TMS-M-",
      },
    },
    orderBy: {
      membershipId: "desc",
    },
    select: {
      membershipId: true,
    },
  });

  let nextSequence = 10001;

  if (lastMember?.membershipId) {
    const match = lastMember.membershipId.match(/^TMS-M-(\d+)$/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed >= 10000) {
        nextSequence = parsed + 1;
      }
    }
  } else {
    // If no existing TMS-M- formatted IDs found, count all existing members
    const count = await db.user.count({
      where: {
        membershipId: { not: null },
      },
    });
    nextSequence = 10001 + count;
  }

  // Defensively ensure collision-free generation
  let candidate = `TMS-M-${nextSequence}`;
  let exists = await db.user.findUnique({
    where: { membershipId: candidate },
    select: { id: true },
  });

  while (exists) {
    nextSequence++;
    candidate = `TMS-M-${nextSequence}`;
    exists = await db.user.findUnique({
      where: { membershipId: candidate },
      select: { id: true },
    });
  }

  return candidate;
}

/**
 * Creates or retrieves a member account phone-first with an attached welcome coupon.
 * Idempotent: Subsequent scans or registrations return existing membership and coupon
 * without duplicating users or creating conflicting welcome vouchers.
 */
export async function createOrRetrieveMembership(
  params: CreateOrRetrieveMembershipParams,
  txClient?: Prisma.TransactionClient
): Promise<MembershipResult> {
  const cleanPhone = normalizePhoneNumber(params.phone);
  if (!cleanPhone) {
    throw new Error(
      "A valid Pakistani phone number is required (e.g. 03001234567 or +923001234567)."
    );
  }

  const cleanName = (params.name || "").trim();
  if (!cleanName || cleanName.length < 2) {
    throw new Error("A valid full name (at least 2 characters) is required.");
  }

  // Fallback to synthetic phone email if customer did not provide an email address
  const providedEmail = params.email?.trim().toLowerCase();
  const userEmail =
    providedEmail && providedEmail.length > 0
      ? providedEmail
      : `${cleanPhone}@phone.tameeresehat.com`;

  const source = (params.signupSource || "QR").toUpperCase().trim();

  // Internal worker executed inside the transactional client
  async function execute(db: Prisma.TransactionClient): Promise<MembershipResult> {
    // Check if user already exists by phone or email
    const rawDigits = params.phone.replace(/\D/g, "");
    const searchPhones: string[] = Array.from(
      new Set([cleanPhone, rawDigits, params.phone.trim()])
    ).filter((s): s is string => typeof s === "string" && s.length > 0);

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ phone: { in: searchPhones } }, { email: userEmail }],
      },
    });

    if (existingUser) {
      let membershipId = existingUser.membershipId;
      let currentUser = existingUser;

      // Assign membership ID if user was registered previously without one
      if (!membershipId) {
        membershipId = await generateMembershipId(db);
        currentUser = await db.user.update({
          where: { id: existingUser.id },
          data: { membershipId },
        });
      }

      // Find or create active welcome coupon for this member with unpredictable entropy
      const membershipDigits = membershipId.replace(/[^0-9]/g, "");
      const couponPrefix = `WELCOME-${membershipDigits}`;
      let coupon = await db.coupon.findFirst({
        where: {
          code: { startsWith: couponPrefix },
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!coupon) {
        const randomEntropy = crypto.randomBytes(2).toString("hex").toUpperCase();
        const unpredictableCode = `${couponPrefix}-${randomEntropy}`;
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        coupon = await db.coupon.create({
          data: {
            code: unpredictableCode,
            scope: "PRODUCTS",
            discountType: "FIXED",
            discountValue: 200,
            minSubtotal: 1200,
            perUserLimit: 1,
            usageLimit: 1,
            startDate: new Date(),
            endDate,
            isActive: true,
            description: `Welcome ₨ 200 off min ₨ 1,200 for member ${membershipId}`,
          },
        });
      }

      return {
        user: currentUser,
        membershipId,
        coupon,
        isNew: false,
      };
    }

    // New member registration
    const membershipId = await generateMembershipId(db);

    const newUser = await db.user.create({
      data: {
        name: cleanName,
        email: userEmail,
        phone: cleanPhone,
        city: params.city?.trim() || null,
        membershipId,
        signupSource: source,
        role: "user",
        emailVerified: false,
        isActive: true,
      },
    });

    const membershipDigits = membershipId.replace(/[^0-9]/g, "");
    const randomEntropy = crypto.randomBytes(2).toString("hex").toUpperCase();
    const couponCode = `WELCOME-${membershipDigits}-${randomEntropy}`;
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const coupon = await db.coupon.create({
      data: {
        code: couponCode,
        scope: "PRODUCTS",
        discountType: "FIXED",
        discountValue: 200,
        minSubtotal: 1200,
        perUserLimit: 1,
        usageLimit: 1,
        startDate: new Date(),
        endDate,
        isActive: true,
        description: `Welcome ₨ 200 off min ₨ 1,200 for member ${membershipId}`,
      },
    });

    return {
      user: newUser,
      membershipId,
      coupon,
      isNew: true,
    };
  }

  // Concurrency collision retry loop (handles P2002 unique constraint violations)
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;

      // If a transaction client was explicitly supplied, run directly in that context
      if (txClient) {
        return await execute(txClient);
      }

      // Otherwise, wrap in an atomic transaction if supported
      if (typeof (prisma as any).$transaction === "function") {
        return await (prisma as any).$transaction(async (tx: Prisma.TransactionClient) => {
          return execute(tx);
        });
      }

      return await execute(prisma as unknown as Prisma.TransactionClient);
    } catch (err: any) {
      const isUniqueConstraint =
        err?.code === "P2002" ||
        String(err?.message || "").includes("Unique constraint") ||
        String(err?.message || "").includes("P2002");

      if (isUniqueConstraint && attempts < maxAttempts) {
        // Exponential backoff with jitter to resolve simultaneous counter collision
        await new Promise((resolve) => setTimeout(resolve, attempts * 25));
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to process membership registration due to heavy concurrency. Please retry.");
}

/**
 * Aggregates membership statistics by signup source and total count.
 */
export async function getMembershipStats(
  txClient?: Prisma.TransactionClient
): Promise<MembershipStats> {
  const db = (txClient || prisma) as any;

  // Count total members who possess a membership ID and are active
  const totalMembers = await db.user.count({
    where: {
      membershipId: { not: null },
      deletedAt: null,
    },
  });

  const bySource: {
    QR: number;
    WEBSITE: number;
    REFERRAL: number;
    [key: string]: number;
  } = {
    QR: 0,
    WEBSITE: 0,
    REFERRAL: 0,
  };

  // Group by signupSource
  if (typeof db.user.groupBy === "function") {
    try {
      const grouped = await db.user.groupBy({
        by: ["signupSource"],
        where: {
          membershipId: { not: null },
          deletedAt: null,
        },
        _count: {
          _all: true,
        },
      });

      for (const item of grouped) {
        const key = String(item.signupSource || "WEBSITE").toUpperCase();
        bySource[key] = (bySource[key] || 0) + (item._count?._all ?? item._count ?? 0);
      }
    } catch {
      // Fallback if groupBy is not supported
      const members = await db.user.findMany({
        where: { membershipId: { not: null }, deletedAt: null },
        select: { signupSource: true },
      });
      for (const m of members) {
        const key = String(m.signupSource || "WEBSITE").toUpperCase();
        bySource[key] = (bySource[key] || 0) + 1;
      }
    }
  } else {
    const members = await db.user.findMany({
      where: { membershipId: { not: null }, deletedAt: null },
      select: { signupSource: true },
    });
    for (const m of members) {
      const key = String(m.signupSource || "WEBSITE").toUpperCase();
      bySource[key] = (bySource[key] || 0) + 1;
    }
  }

  const sources = Object.entries(bySource).map(([source, count]) => ({
    source,
    count,
  }));

  return {
    totalMembers,
    bySource,
    sources,
  };
}
