/**
 * Authoritative Test Harness for Milestone M6: Referrals & Fraud Protection
 *
 * Verifies all Core Invariants and Anti-Fraud Guardrails:
 * 1. Suite 1: Referral Code Derivation & Idempotent Generation
 * 2. Suite 2: Anti-Fraud Guardrails (Self-referral, circular referral, duplicate customer with history)
 * 3. Suite 3: Referral Attribution on Signup (/join and membership registration)
 * 4. Suite 4: Qualifying Order Trigger (Min ₨ 1,000 subtotal, DELIVERED status, 100 points credit)
 * 5. Suite 5: Order Cancellation & Points Clawback (Negative balance support, idempotency)
 * 6. Suite 6: Pipeline Integration with transitionOrderStatus (Atomic execution with inventory & coupons)
 * 7. Suite 7: Member Referral Statistics & Telemetry
 */

import {
  getReferralCodeForMembership,
  ensureUserReferralCode,
  validateReferralCode,
  applyReferralAttribution,
  processReferralRewardOnDelivery,
  reverseReferralRewardOnCancellation,
  getUserReferralStats,
  REFERRAL_QUALIFYING_MIN_SUBTOTAL,
  REFERRER_REWARD_POINTS,
} from "../lib/referrals";
import {
  getUserLoyaltyBalance,
  getUserLoyaltyHistory,
} from "../lib/loyalty";
import { transitionOrderStatus } from "../lib/orders";
import { createOrRetrieveMembership } from "../lib/membership";
import { Prisma } from "@prisma/client";

// ANSI Terminal Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(` ${colors.green}✅ PASS${colors.reset}: ${testName}`);
    passed++;
  } else {
    console.error(` ${colors.red}❌ FAIL${colors.reset}: ${testName}`);
    if (detail) console.error(`    ${colors.yellow}Detail: ${detail}${colors.reset}`);
    failed++;
  }
}

function suiteHeader(title: string) {
  console.log(`\n${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ▶ ${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);
}

// -----------------------------------------------------------------------------
// In-Memory Transactional Store & Prisma Mock Client
// -----------------------------------------------------------------------------

interface MockStore {
  users: any[];
  orders: any[];
  orderItems: any[];
  coupons: any[];
  couponRedemptions: any[];
  loyaltyLedger: any[];
  consultations: any[];
  hijamaBookings: any[];
  productSizes: any[];
  stockMovements: any[];
}

function createInitialStore(): MockStore {
  const referrerUser = {
    id: "user_referrer_001",
    name: "Dr. Hamza Referrer",
    email: "hamza@example.com",
    phone: "923001111111",
    membershipId: "TMS-M-10001",
    referralCode: "REF-10001",
    role: "user",
    signupSource: "WEBSITE",
    referredById: null,
    isReferralRewardClaimed: false,
    isActive: true,
  };

  const refereeUser = {
    id: "user_referee_002",
    name: "Bilal Referee",
    email: "bilal@example.com",
    phone: "923002222222",
    membershipId: "TMS-M-10002",
    referralCode: "REF-10002",
    role: "user",
    signupSource: "REFERRAL",
    referredById: "user_referrer_001",
    isReferralRewardClaimed: false,
    isActive: true,
  };

  const existingCustomer = {
    id: "user_existing_003",
    name: "Existing Customer",
    email: "existing@example.com",
    phone: "923003333333",
    membershipId: "TMS-M-10003",
    referralCode: "REF-10003",
    role: "user",
    signupSource: "WEBSITE",
    referredById: null,
    isReferralRewardClaimed: false,
    isActive: true,
  };

  return {
    users: [referrerUser, refereeUser, existingCustomer],
    orders: [
      {
        id: "order_hist_999",
        orderNumber: "TMS-2026-9999",
        userId: "user_existing_003",
        customerName: "Existing Customer",
        phone: "923003333333",
        email: "existing@example.com",
        city: "Lahore",
        address: "Gulberg III",
        subtotal: 2500,
        shippingFee: 200,
        discountAmount: 0,
        total: 2700,
        paidAmount: 2700,
        dueAmount: 0,
        orderStatus: "DELIVERED",
        paymentStatus: "PAID",
      },
    ],
    orderItems: [],
    coupons: [],
    couponRedemptions: [],
    loyaltyLedger: [],
    consultations: [],
    hijamaBookings: [],
    productSizes: [
      {
        id: "psize_ajwa_01",
        productId: "prod_ajwa_paste",
        sizeName: "250g",
        stockOnHand: 100,
        stockReserved: 10,
        isActive: true,
      },
    ],
    stockMovements: [],
  };
}

function createMockPrismaClient(store: MockStore) {
  const client: any = {
    $executeRawUnsafe: async (_sql: string, ..._params: any[]) => {
      return 1;
    },
    user: {
      findUnique: async (args: any) => {
        if (args.where?.id) {
          return store.users.find((u) => u.id === args.where.id) || null;
        }
        if (args.where?.membershipId) {
          return store.users.find((u) => u.membershipId === args.where.membershipId) || null;
        }
        if (args.where?.referralCode) {
          return store.users.find((u) => u.referralCode === args.where.referralCode) || null;
        }
        return null;
      },
      findFirst: async (args: any) => {
        if (args.where?.OR) {
          for (const cond of args.where.OR) {
            if (cond.referralCode) {
              const u = store.users.find((usr) => usr.referralCode === cond.referralCode);
              if (u) return u;
            }
            if (cond.membershipId) {
              const u = store.users.find((usr) => usr.membershipId === cond.membershipId);
              if (u) return u;
            }
            if (cond.phone) {
              const u = store.users.find((usr) => {
                if (typeof cond.phone === "object" && cond.phone.in) {
                  return cond.phone.in.includes(usr.phone);
                }
                return usr.phone === cond.phone;
              });
              if (u) return u;
            }
            if (cond.email) {
              const u = store.users.find((usr) => usr.email === cond.email);
              if (u) return u;
            }
          }
          return null;
        }
        if (args.where?.phone) {
          return store.users.find((u) => u.phone === args.where.phone) || null;
        }
        if (args.where?.membershipId?.startsWith) {
          const prefix = args.where.membershipId.startsWith;
          const matches = store.users.filter((u) => u.membershipId?.startsWith(prefix));
          matches.sort((a, b) => (b.membershipId || "").localeCompare(a.membershipId || ""));
          return matches[0] || null;
        }
        return null;
      },
      findMany: async (args: any) => {
        if (args.where?.referredById) {
          return store.users.filter((u) => u.referredById === args.where.referredById);
        }
        return [...store.users];
      },
      count: async (args: any) => {
        if (args.where?.membershipId?.not !== undefined) {
          return store.users.filter((u) => u.membershipId !== null).length;
        }
        return store.users.length;
      },
      create: async (args: any) => {
        const id = args.data.id || `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const record = { id, ...args.data };
        store.users.push(record);
        return record;
      },
      update: async (args: any) => {
        const user = store.users.find((u) => u.id === args.where.id);
        if (!user) throw new Error(`User not found: ${args.where.id}`);
        Object.assign(user, args.data);
        return user;
      },
      updateMany: async (args: any) => {
        let count = 0;
        for (const u of store.users) {
          if (args.where?.id && u.id !== args.where.id) continue;
          if (
            args.where?.isReferralRewardClaimed !== undefined &&
            u.isReferralRewardClaimed !== args.where.isReferralRewardClaimed
          )
            continue;
          Object.assign(u, args.data);
          count++;
        }
        return { count };
      },
    },
    order: {
      findUnique: async (args: any) => {
        return store.orders.find((o) => o.id === args.where.id) || null;
      },
      findFirst: async (args: any) => {
        if (args.where?.OR) {
          for (const cond of args.where.OR) {
            if (cond.id) {
              const o = store.orders.find((ord) => ord.id === cond.id);
              if (o) return o;
            }
            if (cond.orderNumber) {
              const o = store.orders.find((ord) => ord.orderNumber === cond.orderNumber);
              if (o) return o;
            }
          }
          return null;
        }
        return null;
      },
      findMany: async (_args: any) => {
        return [...store.orders];
      },
      count: async (args: any) => {
        if (args.where?.OR) {
          let count = 0;
          for (const cond of args.where.OR) {
            if (cond.phone) count += store.orders.filter((o) => o.phone === cond.phone).length;
            if (cond.email) count += store.orders.filter((o) => o.email === cond.email).length;
            if (cond.userId) count += store.orders.filter((o) => o.userId === cond.userId).length;
          }
          return count;
        }
        return store.orders.length;
      },
      create: async (args: any) => {
        const id = args.data.id || `order_${Date.now()}`;
        const record = { id, ...args.data };
        store.orders.push(record);
        return record;
      },
      update: async (args: any) => {
        const o = store.orders.find((ord) => ord.id === args.where.id);
        if (!o) throw new Error(`Order not found: ${args.where.id}`);
        Object.assign(o, args.data);
        return o;
      },
    },
    orderItem: {
      findMany: async (args: any) => {
        return store.orderItems.filter((i) => i.orderId === args.where?.orderId);
      },
      update: async ({ where, data }: any) => {
        const idx = store.orderItems.findIndex((i) => i.id === where.id);
        if (idx !== -1) {
          store.orderItems[idx] = { ...store.orderItems[idx], ...data };
          return store.orderItems[idx];
        }
        return null;
      },
    },
    productSize: {
      findUnique: async (args: any) => {
        return store.productSizes.find((p) => p.id === args.where.id) || null;
      },
      update: async (args: any) => {
        const item = store.productSizes.find((p) => p.id === args.where.id);
        if (!item) throw new Error(`ProductSize not found: ${args.where.id}`);
        if (args.data.stockReserved?.decrement) {
          item.stockReserved -= args.data.stockReserved.decrement;
        }
        if (args.data.stockOnHand?.decrement) {
          item.stockOnHand -= args.data.stockOnHand.decrement;
        }
        return item;
      },
    },
    stockMovement: {
      create: async (args: any) => {
        const record = { id: `smov_${Date.now()}`, ...args.data };
        store.stockMovements.push(record);
        return record;
      },
    },
    coupon: {
      findUnique: async (args: any) => {
        return store.coupons.find((c) => c.id === args.where.id) || null;
      },
      findFirst: async (args: any) => {
        if (args.where?.code?.startsWith) {
          return store.coupons.find((c) => c.code.startsWith(args.where.code.startsWith)) || null;
        }
        return null;
      },
      create: async (args: any) => {
        const record = { id: `cpn_${Date.now()}`, ...args.data };
        store.coupons.push(record);
        return record;
      },
    },
    couponRedemption: {
      findMany: async (args: any) => {
        return store.couponRedemptions.filter((r) => r.orderId === args.where?.orderId);
      },
      deleteMany: async (args: any) => {
        const count = store.couponRedemptions.filter((r) => r.orderId === args.where?.orderId).length;
        store.couponRedemptions = store.couponRedemptions.filter((r) => r.orderId !== args.where?.orderId);
        return { count };
      },
    },
    loyaltyLedger: {
      aggregate: async (args: any) => {
        const entries = store.loyaltyLedger.filter((e) => e.userId === args.where.userId);
        const sum = entries.reduce((acc, curr) => acc + curr.amount, 0);
        return { _sum: { amount: sum } };
      },
      findFirst: async (args: any) => {
        return (
          store.loyaltyLedger.find((e) => {
            if (args.where.userId && e.userId !== args.where.userId) return false;
            if (args.where.source && e.source !== args.where.source) return false;
            if (args.where.referenceId && e.referenceId !== args.where.referenceId) return false;
            if (args.where.type && e.type !== args.where.type) return false;
            return true;
          }) || null
        );
      },
      findMany: async (args: any) => {
        let entries = store.loyaltyLedger.filter((e) => e.userId === args.where.userId);
        if (args.orderBy?.createdAt === "desc") {
          entries = [...entries].reverse();
        }
        return entries;
      },
      create: async (args: any) => {
        // Enforce unique constraint: @@unique([userId, source, referenceId, type])
        const existing = store.loyaltyLedger.find(
          (e) =>
            e.userId === args.data.userId &&
            e.source === args.data.source &&
            e.referenceId === args.data.referenceId &&
            e.type === args.data.type
        );
        if (existing) {
          const p2002: any = new Error("Unique constraint violation");
          p2002.code = "P2002";
          throw p2002;
        }
        const record = {
          id: `led_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date(),
          ...args.data,
        };
        store.loyaltyLedger.push(record);
        return record;
      },
    },
    consultationRequest: {
      count: async (args: any) => {
        if (args.where?.OR) {
          let count = 0;
          for (const cond of args.where.OR) {
            if (cond.patientPhone) count += store.consultations.filter((c) => c.patientPhone === cond.patientPhone).length;
            if (cond.patientEmail) count += store.consultations.filter((c) => c.patientEmail === cond.patientEmail).length;
            if (cond.userId) count += store.consultations.filter((c) => c.userId === cond.userId).length;
          }
          return count;
        }
        return store.consultations.length;
      },
    },
    hijamaBooking: {
      count: async (args: any) => {
        if (args.where?.OR) {
          let count = 0;
          for (const cond of args.where.OR) {
            if (cond.phone) count += store.hijamaBookings.filter((h) => h.phone === cond.phone).length;
            if (cond.email) count += store.hijamaBookings.filter((h) => h.email === cond.email).length;
            if (cond.userId) count += store.hijamaBookings.filter((h) => h.userId === cond.userId).length;
          }
          return count;
        }
        return store.hijamaBookings.length;
      },
    },
    $transaction: async (cb: any) => {
      return await cb(client);
    },
  };

  return client;
}

// -----------------------------------------------------------------------------
// Test Execution
// -----------------------------------------------------------------------------

async function runReferralTestSuite() {
  console.log(`\n${colors.bold}${colors.green}Starting Tameer-e-Sehat M6: Referral & Anti-Fraud Verification Engine${colors.reset}\n`);

  // ---------------------------------------------------------------------------
  // Suite 1: Referral Code Derivation & Idempotency
  // ---------------------------------------------------------------------------
  suiteHeader("Suite 1: Referral Code Derivation & Idempotent Generation");
  {
    assert(
      getReferralCodeForMembership("TMS-M-10001") === "REF-10001",
      "getReferralCodeForMembership derives REF-10001 from TMS-M-10001"
    );
    assert(
      getReferralCodeForMembership("10025") === "REF-10025",
      "getReferralCodeForMembership derives REF-10025 from raw digits"
    );

    let threwOnEmpty = false;
    try {
      getReferralCodeForMembership("TMS-M-ABC");
    } catch {
      threwOnEmpty = true;
    }
    assert(threwOnEmpty, "getReferralCodeForMembership rejects invalid non-numeric membership IDs");

    const store = createInitialStore();
    const client = createMockPrismaClient(store);

    // Existing user with code returns immediately
    const existingCode = await ensureUserReferralCode("user_referrer_001", client);
    assert(existingCode === "REF-10001", "ensureUserReferralCode returns existing referral code without changes");

    // New user without membership or code gets both generated
    const freshUser = {
      id: "user_fresh_999",
      name: "Fresh Member",
      email: "fresh@example.com",
      phone: "923009999999",
      membershipId: null,
      referralCode: null,
      role: "user",
      isActive: true,
    };
    store.users.push(freshUser);

    const generatedCode = await ensureUserReferralCode("user_fresh_999", client);
    assert(
      generatedCode.startsWith("REF-"),
      `ensureUserReferralCode generates canonical REF- code for unassigned user (Got: ${generatedCode})`
    );
    assert(
      freshUser.referralCode === generatedCode,
      "ensureUserReferralCode persists generated referral code on user record"
    );
    assert(
      Boolean(freshUser.membershipId),
      `ensureUserReferralCode also assigns membershipId if missing (Got: ${freshUser.membershipId})`
    );
  }

  // ---------------------------------------------------------------------------
  // Suite 2: Anti-Fraud Guardrails
  // ---------------------------------------------------------------------------
  suiteHeader("Suite 2: Anti-Fraud Guardrails & Attack Prevention");
  {
    const store = createInitialStore();
    const client = createMockPrismaClient(store);

    // 1. Self-referral via userId
    const selfUserCheck = await validateReferralCode(
      "REF-10001",
      { userId: "user_referrer_001", phone: "923000000000", email: "other@example.com" },
      client
    );
    assert(
      !selfUserCheck.valid && selfUserCheck.reason?.includes("own referral code"),
      "Blocks self-referral when userId matches referrer"
    );

    // 2. Self-referral via phone number (different format +92 vs 0300)
    const selfPhoneCheck = await validateReferralCode(
      "REF-10001",
      { userId: "user_different_id", phone: "0300 111 1111", email: "other@example.com" },
      client
    );
    assert(
      !selfPhoneCheck.valid && selfPhoneCheck.reason?.includes("matching phone number"),
      "Blocks self-referral when phone number matches referrer (normalized 0300 vs 92300)"
    );

    // 3. Self-referral via email (case insensitive)
    const selfEmailCheck = await validateReferralCode(
      "REF-10001",
      { userId: "user_different_id", phone: "923009998877", email: "HAMZA@EXAMPLE.COM" },
      client
    );
    assert(
      !selfEmailCheck.valid && selfEmailCheck.reason?.includes("matching email address"),
      "Blocks self-referral when email matches referrer (case-insensitive)"
    );

    // 4. Circular referral: Referrer was referred by Referee
    // In store: user_referee_002 is referred by user_referrer_001.
    // If user_referrer_001 attempts to use REF-10002 (referee's code):
    const circularCheck = await validateReferralCode(
      "REF-10002",
      { userId: "user_referrer_001", phone: "923001111111" },
      client
    );
    assert(
      !circularCheck.valid && circularCheck.reason?.includes("Circular referrals are not permitted"),
      "Blocks circular referral when referrer was previously referred by referee"
    );

    // 5. Existing customer with prior order history
    const existingCustomerCheck = await validateReferralCode(
      "REF-10001",
      { userId: "user_different_id", phone: "923003333333", email: "existing@example.com" },
      client
    );
    assert(
      !existingCustomerCheck.valid && existingCustomerCheck.reason?.includes("new customers without prior order history"),
      "Blocks referral benefit for existing customer with historical order in database"
    );

    // 6. Non-existent referral code
    const invalidCodeCheck = await validateReferralCode(
      "REF-99999",
      { userId: "user_stranger_111", phone: "923008888888" },
      client
    );
    assert(
      !invalidCodeCheck.valid && invalidCodeCheck.reason?.includes("does not exist"),
      "Rejects non-existent referral codes"
    );

    // 7. Legitimate genuine referral
    const genuineCheck = await validateReferralCode(
      "REF-10001",
      { userId: "user_stranger_111", phone: "923007777777", email: "newperson@example.com" },
      client
    );
    assert(
      genuineCheck.valid && genuineCheck.referrer?.id === "user_referrer_001",
      "Permits genuine new customer with valid referral code"
    );
  }

  // ---------------------------------------------------------------------------
  // Suite 3: Referral Attribution on Membership Registration
  // ---------------------------------------------------------------------------
  suiteHeader("Suite 3: Referral Attribution on Registration");
  {
    const store = createInitialStore();
    const client = createMockPrismaClient(store);

    const membership = await createOrRetrieveMembership(
      {
        name: "Usman Ghani",
        phone: "0300 444 4444",
        city: "Karachi",
        email: "usman@example.com",
        referralCode: "REF-10001",
      },
      client
    );

    assert(membership.isNew === true, "createOrRetrieveMembership registers new user");
    assert(membership.user.referredById === "user_referrer_001", "Attribution correctly binds to referrer ID");
    assert(membership.user.signupSource === "REFERRAL", "Signup source is set to REFERRAL");
    assert(
      membership.user.referralCode === `REF-${membership.membershipId.replace(/[^0-9]/g, "")}`,
      "Newly registered member receives their own canonical referral code"
    );
    assert(
      membership.coupon.discountValue === 200 && membership.coupon.minSubtotal === 1200,
      "Referee receives ₨ 200 welcome voucher (min spend ₨ 1,200)"
    );

    // Immutable attribution test: cannot overwrite referredById once established
    const reAttribution = await applyReferralAttribution(
      membership.user.id,
      "REF-10002",
      client
    );
    assert(
      !reAttribution.success && reAttribution.reason?.includes("already established"),
      "applyReferralAttribution prevents overwriting established referral attribution"
    );
  }

  // ---------------------------------------------------------------------------
  // Suite 4: Qualifying Order Delivery Trigger
  // ---------------------------------------------------------------------------
  suiteHeader("Suite 4: Qualifying Order Trigger (₨ 1,000 threshold & DELIVERED)");
  {
    const store = createInitialStore();
    const client = createMockPrismaClient(store);

    // Case A: Order subtotal below ₨ 1,000 (₨ 750) -> No referral reward
    const smallOrder = {
      id: "ord_small_001",
      orderNumber: "TMS-2026-0001",
      userId: "user_referee_002",
      phone: "923002222222",
      subtotal: 750,
      total: 950,
      orderStatus: "DELIVERED",
    };
    store.orders.push(smallOrder);

    const smallResult = await processReferralRewardOnDelivery(smallOrder.id, client);
    assert(
      !smallResult.rewarded && smallResult.reason?.includes("below qualifying threshold"),
      "Rejects referral reward for order subtotal below ₨ 1,000 (₨ 750)"
    );
    assert(
      (await getUserLoyaltyBalance("user_referrer_001", client)) === 0,
      "Referrer balance remains 0 for sub-threshold order"
    );

    // Case B: Qualifying Order (₨ 1,500) but status is PENDING / CONFIRMED -> No reward yet
    const pendingOrder = {
      id: "ord_pending_002",
      orderNumber: "TMS-2026-0002",
      userId: "user_referee_002",
      phone: "923002222222",
      subtotal: 1500,
      total: 1700,
      orderStatus: "CONFIRMED",
    };
    store.orders.push(pendingOrder);

    const pendingResult = await processReferralRewardOnDelivery(pendingOrder.id, client);
    assert(
      !pendingResult.rewarded && pendingResult.reason?.includes("only upon DELIVERED"),
      "Rejects referral reward for non-DELIVERED order (CONFIRMED)"
    );

    // Case C: Transition to DELIVERED -> Exactly 100 points credited
    pendingOrder.orderStatus = "DELIVERED";
    const deliverResult = await processReferralRewardOnDelivery(pendingOrder.id, client);
    assert(deliverResult.rewarded === true, "Awards referral reward when qualifying order is DELIVERED");
    assert(deliverResult.points === 100, "Exactly 100 points credited");
    assert(deliverResult.referrerId === "user_referrer_001", "Credited to correct referrer");

    const referrerBalance = await getUserLoyaltyBalance("user_referrer_001", client);
    assert(referrerBalance === 100, `Referrer loyalty ledger balance is exactly 100 points (Got: ${referrerBalance})`);

    const refereeUser = store.users.find((u) => u.id === "user_referee_002");
    assert(refereeUser.isReferralRewardClaimed === true, "Referee is marked isReferralRewardClaimed = true");

    // Case D: Idempotency protection (calling delivery reward again does NOT double-credit)
    const secondCall = await processReferralRewardOnDelivery(pendingOrder.id, client);
    assert(secondCall.rewarded === false, "Idempotency: duplicate delivery call does NOT credit points again");
    assert(
      (await getUserLoyaltyBalance("user_referrer_001", client)) === 100,
      "Referrer balance strictly remains 100 points after duplicate trigger"
    );

    // Case E: Second order from same referee -> One-time reward per referee
    const secondOrder = {
      id: "ord_qual_003",
      orderNumber: "TMS-2026-0003",
      userId: "user_referee_002",
      phone: "923002222222",
      subtotal: 2000,
      total: 2200,
      orderStatus: "DELIVERED",
    };
    store.orders.push(secondOrder);

    const secondOrderResult = await processReferralRewardOnDelivery(secondOrder.id, client);
    assert(
      !secondOrderResult.rewarded && secondOrderResult.reason?.includes("already been claimed"),
      "Only first qualifying order awards referral points; subsequent orders rejected"
    );
  }

  // ---------------------------------------------------------------------------
  // Suite 5: Order Cancellation & Points Clawback
  // ---------------------------------------------------------------------------
  suiteHeader("Suite 5: Order Cancellation & Points Clawback");
  {
    const store = createInitialStore();
    const client = createMockPrismaClient(store);

    // Qualifying order delivered
    const order = {
      id: "ord_cancel_001",
      orderNumber: "TMS-2026-0010",
      userId: "user_referee_002",
      phone: "923002222222",
      subtotal: 1800,
      total: 2000,
      orderStatus: "DELIVERED",
    };
    store.orders.push(order);

    await processReferralRewardOnDelivery(order.id, client);
    assert(
      (await getUserLoyaltyBalance("user_referrer_001", client)) === 100,
      "Referrer earned 100 points on delivery"
    );

    // Customer cancels or returns order
    order.orderStatus = "CANCELLED";
    const clawbackResult = await reverseReferralRewardOnCancellation(order.id, client);
    assert(clawbackResult.reversed === true, "Clawback succeeds on cancelled order");
    assert(clawbackResult.points === 100, "Clawed back exactly 100 points");

    const balanceAfterClawback = await getUserLoyaltyBalance("user_referrer_001", client);
    assert(
      balanceAfterClawback === 0,
      `Referrer balance reversed back to 0 points (Got: ${balanceAfterClawback})`
    );

    const refereeUser = store.users.find((u) => u.id === "user_referee_002");
    assert(
      refereeUser.isReferralRewardClaimed === false,
      "Referee isReferralRewardClaimed flag reset to false allowing future qualifying order"
    );

    // Duplicate cancellation test (idempotent clawback)
    const duplicateClawback = await reverseReferralRewardOnCancellation(order.id, client);
    assert(
      duplicateClawback.reversed === false && duplicateClawback.reason?.includes("already been clawed back"),
      "Duplicate cancellation does NOT double-clawback points"
    );
    assert(
      (await getUserLoyaltyBalance("user_referrer_001", client)) === 0,
      "Referrer balance strictly remains 0 after duplicate clawback"
    );

    // Negative balance support: Referrer had 0 balance, but earned and spent it elsewhere
    // If order cancelled, balance must drop to -100
    const store2 = createInitialStore();
    const client2 = createMockPrismaClient(store2);
    const order2 = {
      id: "ord_neg_001",
      orderNumber: "TMS-2026-0020",
      userId: "user_referee_002",
      phone: "923002222222",
      subtotal: 1200,
      total: 1400,
      orderStatus: "DELIVERED",
    };
    store2.orders.push(order2);
    await processReferralRewardOnDelivery(order2.id, client2);

    // Artificially simulate that referrer burned their 100 points:
    store2.loyaltyLedger.push({
      id: "burn_100",
      userId: "user_referrer_001",
      amount: -100,
      type: "REDEEM",
      source: "ORDER",
      referenceId: "order_some_spend",
      balanceAfter: 0,
      reason: "Burned points",
      createdAt: new Date(),
    });
    assert((await getUserLoyaltyBalance("user_referrer_001", client2)) === 0, "Referrer balance spent down to 0");

    // Now order cancelled -> Clawback should drop balance to -100
    await reverseReferralRewardOnCancellation(order2.id, client2);
    const negativeBalance = await getUserLoyaltyBalance("user_referrer_001", client2);
    assert(
      negativeBalance === -100,
      `Clawback supports negative balance if points were already spent (Got: ${negativeBalance})`
    );
  }

  // ---------------------------------------------------------------------------
  // Suite 6: Full Pipeline Integration with transitionOrderStatus
  // ---------------------------------------------------------------------------
  suiteHeader("Suite 6: Full Order Pipeline Integration (transitionOrderStatus)");
  {
    const store = createInitialStore();
    const client = createMockPrismaClient(store);

    const pipelineOrder = {
      id: "ord_pipe_001",
      orderNumber: "TMS-2026-7001",
      userId: "user_referee_002",
      customerName: "Bilal Referee",
      phone: "923002222222",
      email: "bilal@example.com",
      city: "Islamabad",
      address: "F-7/2",
      subtotal: 2000,
      shippingFee: 250,
      discountAmount: 0,
      total: 2250,
      paidAmount: 2250,
      dueAmount: 0,
      orderStatus: "CONFIRMED",
      paymentStatus: "PAID",
      items: [
        {
          id: "item_01",
          orderId: "ord_pipe_001",
          productId: "prod_ajwa_paste",
          productSizeId: "psize_ajwa_01",
          quantity: 2,
          unitPrice: 1000,
          totalPrice: 2000,
          productSize: {
            id: "psize_ajwa_01",
            stockReserved: 10,
            stockOnHand: 100,
          },
        },
      ],
    };
    store.orders.push(pipelineOrder);
    store.orderItems.push(...pipelineOrder.items);

    // 1. Transition CONFIRMED -> DELIVERED via transitionOrderStatus
    const deliveryTransition = await transitionOrderStatus(
      {
        orderId: pipelineOrder.id,
        orderStatus: "DELIVERED",
        staffUserId: "admin_001",
      },
      client
    );

    assert(
      deliveryTransition.order.orderStatus === "DELIVERED",
      "transitionOrderStatus transitions order to DELIVERED"
    );

    // Referrer earned 100 points
    const referrerBalance = await getUserLoyaltyBalance("user_referrer_001", client);
    assert(
      referrerBalance === 100,
      `Referral reward processed atomically during DELIVERED transition (Referrer points: ${referrerBalance})`
    );

    // Referee also earned their 2% normal loyalty points on ₨ 2,000 subtotal = 40 points
    const refereeBalance = await getUserLoyaltyBalance("user_referee_002", client);
    assert(
      refereeBalance === 40,
      `Referee also earned 2% M5 loyalty points (₨ 2,000 * 0.02 = 40 points, Got: ${refereeBalance})`
    );

    // 2. Transition DELIVERED -> CANCELLED via transitionOrderStatus
    const cancelTransition = await transitionOrderStatus(
      {
        orderId: pipelineOrder.id,
        orderStatus: "CANCELLED",
        staffUserId: "admin_001",
      },
      client
    );

    assert(
      cancelTransition.order.orderStatus === "CANCELLED",
      "transitionOrderStatus transitions order to CANCELLED"
    );

    // Both referral reward and normal order points reversed
    const referrerBalanceAfter = await getUserLoyaltyBalance("user_referrer_001", client);
    const refereeBalanceAfter = await getUserLoyaltyBalance("user_referee_002", client);

    assert(
      referrerBalanceAfter === 0,
      `Referrer 100 points clawed back on CANCELLED (Got: ${referrerBalanceAfter})`
    );
    assert(
      refereeBalanceAfter === 0,
      `Referee 40 order points clawed back on CANCELLED (Got: ${refereeBalanceAfter})`
    );
  }

  // ---------------------------------------------------------------------------
  // Suite 7: Member Referral Statistics & Telemetry
  // ---------------------------------------------------------------------------
  suiteHeader("Suite 7: Member Referral Statistics & Telemetry");
  {
    const store = createInitialStore();
    const client = createMockPrismaClient(store);

    // Currently user_referee_002 is referred by user_referrer_001, but has not completed order
    const statsBefore = await getUserReferralStats("user_referrer_001", "https://tameeresehat.com", client);
    assert(statsBefore.referralCode === "REF-10001", "Returns user referral code REF-10001");
    assert(
      statsBefore.shareUrl === "https://tameeresehat.com/join?ref=REF-10001",
      "Generates canonical share URL"
    );
    assert(statsBefore.totalReferred === 1, "Reports total referred: 1");
    assert(statsBefore.successfulReferrals === 0, "Reports successful referrals: 0");
    assert(statsBefore.pendingReferrals === 1, "Reports pending referrals: 1");
    assert(statsBefore.totalPointsEarned === 0, "Reports points earned: 0");

    // Add a qualifying completed order for referee
    const qualOrder = {
      id: "ord_stats_001",
      orderNumber: "TMS-2026-8001",
      userId: "user_referee_002",
      phone: "923002222222",
      subtotal: 1200,
      total: 1400,
      orderStatus: "DELIVERED",
    };
    store.orders.push(qualOrder);
    await processReferralRewardOnDelivery(qualOrder.id, client);

    const statsAfter = await getUserReferralStats("user_referrer_001", "https://tameeresehat.com", client);
    assert(statsAfter.totalReferred === 1, "Reports total referred: 1");
    assert(statsAfter.successfulReferrals === 1, "Reports successful referrals: 1");
    assert(statsAfter.pendingReferrals === 0, "Reports pending referrals: 0");
    assert(statsAfter.totalPointsEarned === 100, "Reports points earned: 100");
    assert(statsAfter.referrals[0].hasQualifyingOrder === true, "Referee listed with completed qualifying order");
    assert(
      statsAfter.referrals[0].name === "Bilal R.",
      `Referee legal name is privacy-masked (Expected: "Bilal R.", Got: "${statsAfter.referrals[0].name}")`
    );
    assert(
      !statsAfter.referrals[0].id.includes("user_"),
      "Internal database user ID is suppressed from public referrals payload"
    );
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}  Total Test Results: ${colors.green}${passed} Passed${colors.reset}, ${failed === 0 ? colors.green : colors.red}${failed} Failed${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runReferralTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
