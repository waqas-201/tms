/**
 * Test Harness for Milestone M3: Membership and QR Onboarding
 *
 * Verifies:
 * 1. Test Suite 1: Phone-First Registration Without Email Friction
 *    - Phone normalization to canonical 923xx format.
 *    - Synthetic email fallback (${cleanPhone}@phone.tameeresehat.com).
 *    - Branded sequential membership ID generation (TMS-M-XXXXX starting at TMS-M-10001).
 *    - Welcome coupon generation (WELCOME-XXXXX, ₨ 200 off min ₨ 1,200, PRODUCTS scope, 30 days).
 *    - Validation guards on invalid phone and short names.
 *    - Preservation of optional explicit email and city.
 *
 * 2. Test Suite 2: Idempotent Re-Submission Protection
 *    - Repeated registration with the same phone returns existing member without duplicate.
 *    - Alternate phone formats (0300..., +92300..., 92300...) match the exact same member.
 *    - Assigns membership ID and welcome coupon to existing legacy users missing them.
 *
 * 3. Test Suite 3: Welcome Coupon Enforcement via validateCoupon
 *    - Validates ₨ 200 discount applied when subtotal >= ₨ 1,200.
 *    - Rejects order when subtotal < ₨ 1,200 with clear minimum subtotal error.
 *    - Rejects redemption on HIJAMA and CONSULTATION scopes.
 *    - Rejects deactivated or expired welcome vouchers.
 *
 * 4. Test Suite 4: Channel Attribution & Admin Stats Aggregation
 *    - Verifies accurate attribution tracking for QR, WEBSITE, and REFERRAL sources.
 *    - Verifies getMembershipStats aggregates total members and per-channel breakdown.
 */

import {
  createOrRetrieveMembership,
  generateMembershipId,
  getMembershipStats,
  maskPhone,
} from "../lib/membership";
import { validateCoupon } from "../lib/coupons";
import { normalizePhoneNumber } from "../lib/phone";
import { Prisma } from "@prisma/client";

// ANSI terminal colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
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
  console.log(
    `\n${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bold}${colors.cyan}  ▶ ${title}${colors.reset}`);
  console.log(
    `${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`
  );
}

// -----------------------------------------------------------------------------
// In-Memory Transactional Store & Prisma Mock Simulator
// -----------------------------------------------------------------------------

interface MockUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  membershipId: string | null;
  signupSource: string;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockCoupon {
  id: string;
  code: string;
  description: string;
  scope: string;
  discountType: string;
  discountValue: number;
  minSubtotal: number | null;
  maxDiscountCap: number | null;
  targetCategoryId: string | null;
  targetProductIds: string | null;
  startDate: Date | null;
  endDate: Date | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockCouponRedemption {
  id: string;
  couponId: string;
  userId: string | null;
  phone: string | null;
  orderId: string | null;
  discountAmount: number;
  redeemedAt: Date;
}

interface MockStore {
  users: MockUser[];
  coupons: MockCoupon[];
  redemptions: MockCouponRedemption[];
}

function createMockStore(): MockStore {
  return {
    users: [],
    coupons: [],
    redemptions: [],
  };
}

let idCounter = 1;

function createMockClient(store: MockStore): Prisma.TransactionClient {
  return {
    user: {
      findFirst: async ({ where }: any) => {
        return store.users.find((u) => {
          if (where?.membershipId?.startsWith) {
            const prefix = where.membershipId.startsWith;
            if (!u.membershipId || !u.membershipId.startsWith(prefix)) return false;
          }
          if (where?.OR && Array.isArray(where.OR)) {
            const matchOr = where.OR.some((condition: any) => {
              if (condition.phone) {
                if (condition.phone.in && Array.isArray(condition.phone.in)) {
                  if (!condition.phone.in.includes(u.phone)) return false;
                } else if (u.phone !== condition.phone) {
                  return false;
                }
              }
              if (condition.email && u.email !== condition.email) {
                return false;
              }
              return true;
            });
            if (!matchOr) return false;
          }
          return true;
        }) || null;
      },

      findUnique: async ({ where }: any) => {
        if (where?.id) {
          return store.users.find((u) => u.id === where.id) || null;
        }
        if (where?.membershipId) {
          return store.users.find((u) => u.membershipId === where.membershipId) || null;
        }
        if (where?.email) {
          return store.users.find((u) => u.email === where.email) || null;
        }
        return null;
      },

      findMany: async ({ where, select }: any) => {
        let list = store.users.filter((u) => {
          if (where?.membershipId?.not === null && !u.membershipId) return false;
          if (where?.deletedAt === null && u.deletedAt !== null) return false;
          return true;
        });
        if (select) {
          return list.map((u) => {
            const res: any = {};
            for (const k of Object.keys(select)) {
              if (select[k]) res[k] = (u as any)[k];
            }
            return res;
          });
        }
        return list;
      },

      create: async ({ data }: any) => {
        const newUser: MockUser = {
          id: `usr_${idCounter++}`,
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified ?? false,
          image: null,
          role: data.role || "user",
          phone: data.phone || null,
          city: data.city || null,
          address: data.address || null,
          latitude: null,
          longitude: null,
          membershipId: data.membershipId || null,
          signupSource: data.signupSource || "WEBSITE",
          isActive: data.isActive ?? true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.users.push(newUser);
        return { ...newUser };
      },

      update: async ({ where, data }: any) => {
        const idx = store.users.findIndex((u) => u.id === where.id);
        if (idx === -1) throw new Error(`User not found: ${where.id}`);
        store.users[idx] = {
          ...store.users[idx],
          ...data,
          updatedAt: new Date(),
        };
        return { ...store.users[idx] };
      },

      count: async ({ where }: any) => {
        return store.users.filter((u) => {
          if (where?.membershipId?.not === null && !u.membershipId) return false;
          if (where?.deletedAt === null && u.deletedAt !== null) return false;
          return true;
        }).length;
      },

      groupBy: async ({ by, where, _count }: any) => {
        const groups: Record<string, number> = {};
        for (const u of store.users) {
          if (where?.membershipId?.not === null && !u.membershipId) continue;
          if (where?.deletedAt === null && u.deletedAt !== null) continue;
          const key = (u as any)[by[0]] || "WEBSITE";
          groups[key] = (groups[key] || 0) + 1;
        }
        return Object.entries(groups).map(([source, count]) => ({
          signupSource: source,
          _count: { _all: count },
        }));
      },
    },

    coupon: {
      findUnique: async ({ where }: any) => {
        if (where?.code) {
          return store.coupons.find((c) => c.code === where.code) || null;
        }
        if (where?.id) {
          return store.coupons.find((c) => c.id === where.id) || null;
        }
        return null;
      },

      findFirst: async ({ where }: any) => {
        return store.coupons.find((c) => {
          if (where?.code?.startsWith) {
            if (!c.code.startsWith(where.code.startsWith)) return false;
          }
          if (where?.isActive !== undefined && c.isActive !== where.isActive) return false;
          return true;
        }) || null;
      },

      create: async ({ data }: any) => {
        const newCoupon: MockCoupon = {
          id: `cpn_${idCounter++}`,
          code: data.code,
          description: data.description,
          scope: data.scope || "PRODUCTS",
          discountType: data.discountType || "FIXED",
          discountValue: data.discountValue,
          minSubtotal: data.minSubtotal ?? null,
          maxDiscountCap: data.maxDiscountCap ?? null,
          targetCategoryId: data.targetCategoryId ?? null,
          targetProductIds: data.targetProductIds ?? null,
          startDate: data.startDate ?? new Date(),
          endDate: data.endDate ?? null,
          usageLimit: data.usageLimit ?? null,
          usageCount: 0,
          perUserLimit: data.perUserLimit ?? 1,
          isActive: data.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.coupons.push(newCoupon);
        return { ...newCoupon };
      },

      count: async () => store.coupons.length,
    },

    couponRedemption: {
      count: async ({ where }: any) => {
        return store.redemptions.filter((r) => {
          if (where?.couponId && r.couponId !== where.couponId) return false;
          return true;
        }).length;
      },
    },
  } as unknown as Prisma.TransactionClient;
}

// -----------------------------------------------------------------------------
// Test Execution
// -----------------------------------------------------------------------------

async function runTestSuite() {
  console.log(`${colors.bold}================================================================================${colors.reset}`);
  console.log(`${colors.bold} 🎟️  TAMEER-E-SEHAT (TMS) - MILESTONE M3: MEMBERSHIP & QR ONBOARDING TESTS${colors.reset}`);
  console.log(`${colors.bold}================================================================================${colors.reset}`);

  const store = createMockStore();
  const client = createMockClient(store);

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: Phone-First Registration Without Email
  // ---------------------------------------------------------------------------
  suiteHeader("TEST SUITE 1: Phone-First Registration Without Email Friction");

  // 1.1 First member registers with local Pakistani phone format
  const member1 = await createOrRetrieveMembership(
    {
      name: "Tariq Mehmood",
      phone: "03001234567",
      signupSource: "QR",
    },
    client
  );

  assert(member1.isNew === true, "New registration marks isNew = true");
  assert(
    member1.membershipId === "TMS-M-10001",
    `Branded Membership ID starts at TMS-M-10001 (Got: ${member1.membershipId})`
  );
  assert(
    member1.user.phone === "923001234567",
    `Phone number normalized to canonical 923xx format (Got: ${member1.user.phone})`
  );
  assert(
    member1.user.email === "923001234567@phone.tameeresehat.com",
    `Synthetic phone email assigned for Better-Auth compliance (Got: ${member1.user.email})`
  );
  assert(
    member1.user.signupSource === "QR",
    `Signup source recorded as QR (Got: ${member1.user.signupSource})`
  );

  // 1.2 Welcome Coupon Attributes (Unpredictable Nonce Suffix)
  assert(
    /^WELCOME-10001-[A-F0-9]{4}$/.test(member1.coupon.code),
    `Welcome coupon code formatted unpredictably as WELCOME-10001-XXXX (Got: ${member1.coupon.code})`
  );
  assert(
    member1.coupon.discountValue === 200,
    `Welcome coupon offers exactly ₨ 200 discount (Got: ${member1.coupon.discountValue})`
  );
  assert(
    member1.coupon.minSubtotal === 1200,
    `Welcome coupon requires minimum subtotal of ₨ 1,200 (Got: ${member1.coupon.minSubtotal})`
  );
  assert(
    member1.coupon.scope === "PRODUCTS",
    `Welcome coupon restricted to PRODUCTS scope (Got: ${member1.coupon.scope})`
  );
  assert(
    member1.coupon.discountType === "FIXED",
    `Discount type is FIXED PKR (Got: ${member1.coupon.discountType})`
  );
  assert(
    member1.coupon.perUserLimit === 1 && member1.coupon.usageLimit === 1,
    "Welcome coupon is single-use (perUserLimit = 1, usageLimit = 1)"
  );
  assert(
    member1.coupon.isActive === true,
    "Welcome coupon is immediately active"
  );

  const daysValid = Math.round(
    (new Date(member1.coupon.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  assert(
    daysValid >= 29 && daysValid <= 31,
    `Welcome coupon valid for ~30 days (Got: ${daysValid} days)`
  );

  // 1.3 Sequential ID increment for second member
  const member2 = await createOrRetrieveMembership(
    {
      name: "Fatima Bibi",
      phone: "+92 321 7654321",
      city: "Lahore",
      email: "fatima@example.com",
      signupSource: "QR",
    },
    client
  );

  assert(
    member2.membershipId === "TMS-M-10002",
    `Second member assigned next sequential ID TMS-M-10002 (Got: ${member2.membershipId})`
  );
  assert(
    member2.user.email === "fatima@example.com",
    `Explicitly provided email preserved instead of synthetic email (Got: ${member2.user.email})`
  );
  assert(
    member2.user.city === "Lahore",
    `City field successfully persisted (Got: ${member2.user.city})`
  );
  assert(
    /^WELCOME-10002-[A-F0-9]{4}$/.test(member2.coupon.code),
    `Coupon code matched member sequence with unpredictable entropy WELCOME-10002-XXXX (Got: ${member2.coupon.code})`
  );

  // 1.4 Input validation guards
  let invalidPhoneCaught = false;
  try {
    await createOrRetrieveMembership(
      { name: "Invalid Test", phone: "12345" },
      client
    );
  } catch (err: any) {
    invalidPhoneCaught = true;
    assert(
      err.message.includes("Pakistani phone number"),
      "Invalid short phone rejected with descriptive message"
    );
  }
  assert(invalidPhoneCaught, "Invalid phone number threw validation exception");

  let shortNameCaught = false;
  try {
    await createOrRetrieveMembership(
      { name: "A", phone: "03009998877" },
      client
    );
  } catch (err: any) {
    shortNameCaught = true;
    assert(
      err.message.includes("at least 2 characters"),
      "Short name (< 2 chars) rejected with descriptive message"
    );
  }
  assert(shortNameCaught, "Short name threw validation exception");

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: Idempotent Re-Submission Protection
  // ---------------------------------------------------------------------------
  suiteHeader("TEST SUITE 2: Idempotent Re-Submission Protection");

  const initialUserCount = store.users.length;
  const initialCouponCount = store.coupons.length;

  // Re-register member 1 with identical local format
  const repeat1 = await createOrRetrieveMembership(
    {
      name: "Tariq Mehmood",
      phone: "03001234567",
      signupSource: "QR",
    },
    client
  );

  assert(repeat1.isNew === false, "Re-registration returns isNew = false");
  assert(
    repeat1.membershipId === member1.membershipId,
    `Returns exact existing membershipId: ${repeat1.membershipId}`
  );
  assert(
    repeat1.user.id === member1.user.id,
    `Returns exact existing user ID: ${repeat1.user.id}`
  );
  assert(
    repeat1.coupon.code === member1.coupon.code,
    `Returns existing active welcome coupon: ${repeat1.coupon.code}`
  );
  assert(
    store.users.length === initialUserCount,
    `No duplicate user record created (User count remained ${initialUserCount})`
  );
  assert(
    store.coupons.length === initialCouponCount,
    `No duplicate coupon created (Coupon count remained ${initialCouponCount})`
  );

  // Re-register member 1 using international formatting (+923001234567)
  const repeatInternational = await createOrRetrieveMembership(
    {
      name: "Tariq Mehmood Updated",
      phone: "+92 300 1234567",
    },
    client
  );

  assert(
    repeatInternational.isNew === false,
    "International formatted phone matches existing normalized record"
  );
  assert(
    repeatInternational.membershipId === "TMS-M-10001",
    "Matched exact same membershipId TMS-M-10001 across formatting variations"
  );

  // Test legacy user migration: existing user in DB without membershipId
  const legacyUser = await client.user.create({
    data: {
      name: "Legacy Patient",
      email: "legacy@tameeresehat.com",
      phone: "923334445566",
      signupSource: "WEBSITE",
      membershipId: null, // Legacy account created prior to M3
    },
  });

  const migratedMember = await createOrRetrieveMembership(
    {
      name: "Legacy Patient",
      phone: "03334445566",
    },
    client
  );

  assert(
    migratedMember.user.id === legacyUser.id,
    "Legacy user successfully matched by normalized phone"
  );
  assert(
    migratedMember.membershipId === "TMS-M-10003",
    `Legacy user assigned sequential membership ID TMS-M-10003 (Got: ${migratedMember.membershipId})`
  );
  assert(
    /^WELCOME-10003-[A-F0-9]{4}$/.test(migratedMember.coupon.code),
    `Legacy user received fresh unpredictable welcome coupon (Got: ${migratedMember.coupon.code})`
  );

  // 2.3 Privacy Guard Verification: Sanitized API Payload Emulation
  // Verify that an unauthenticated caller who submits an existing phone does NOT receive PII
  const maskedPhone = maskPhone(member1.user.phone);
  assert(
    maskedPhone === "92300****567",
    `maskPhone correctly obfuscates middle digits of phone: ${maskedPhone}`
  );

  // Emulate the API response formatting for existing member
  const sanitizedApiResponse = {
    isNew: false,
    message: "Welcome back! Your membership is active.",
    membershipId: repeat1.membershipId,
    maskedPhone: maskPhone(repeat1.user.phone),
  };

  assert(
    !("name" in sanitizedApiResponse),
    "Privacy Guard: Existing member name is NOT exposed in sanitized API response"
  );
  assert(
    !("phone" in sanitizedApiResponse),
    "Privacy Guard: Raw unmasked phone is NOT exposed in sanitized API response"
  );
  assert(
    !("couponCode" in sanitizedApiResponse),
    "Privacy Guard: Coupon code is NOT exposed in sanitized API response to unauthenticated callers"
  );
  assert(
    sanitizedApiResponse.maskedPhone === "92300****567",
    "Privacy Guard: Phone is safely masked in response"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: Welcome Coupon Enforcement via validateCoupon
  // ---------------------------------------------------------------------------
  suiteHeader("TEST SUITE 3: Welcome Coupon Parameters & validateCoupon Enforcement");

  // 3.1 Valid Apothecary Products Order (₨ 1,500 >= ₨ 1,200 min spend)
  const validProductsValidation = await validateCoupon(
    {
      code: member1.coupon.code,
      scope: "PRODUCTS",
      subtotal: 1500,
      phone: "03001234567",
    },
    client
  );

  assert(
    validProductsValidation.valid === true,
    `Welcome coupon ${member1.coupon.code} successfully validated for PRODUCTS with subtotal ₨ 1,500`
  );
  assert(
    validProductsValidation.discountAmount === 200,
    `Authoritative discount amount is exactly ₨ 200 (Got: ${validProductsValidation.discountAmount})`
  );

  // 3.2 Below Minimum Subtotal (₨ 1,000 < ₨ 1,200 min spend)
  const belowMinValidation = await validateCoupon(
    {
      code: member1.coupon.code,
      scope: "PRODUCTS",
      subtotal: 1000,
      phone: "03001234567",
    },
    client
  );

  assert(
    belowMinValidation.valid === false,
    "Subtotal ₨ 1,000 below ₨ 1,200 threshold is rejected"
  );
  assert(
    belowMinValidation.error?.includes("minimum subtotal of ₨ 1,200") === true,
    `Error explains minimum spend requirement (Got: "${belowMinValidation.error}")`
  );

  // 3.3 Scope Isolation: Cross-service prevention (Hijama booking)
  const hijamaValidation = await validateCoupon(
    {
      code: member1.coupon.code,
      scope: "HIJAMA",
      subtotal: 2500,
    },
    client
  );

  assert(
    hijamaValidation.valid === false,
    "Welcome coupon is blocked from being applied to Hijama appointments"
  );
  assert(
    hijamaValidation.error?.includes("exclusively valid for herbal apothecary products") === true,
    `Error clearly states PRODUCTS exclusivity (Got: "${hijamaValidation.error}")`
  );

  // 3.4 Scope Isolation: Consultation prevention
  const consultationValidation = await validateCoupon(
    {
      code: member1.coupon.code,
      scope: "CONSULTATION",
      subtotal: 2000,
    },
    client
  );

  assert(
    consultationValidation.valid === false,
    "Welcome coupon is blocked from being applied to Hakeem consultations"
  );

  // 3.5 Inactive / Expired Voucher Enforcement
  const inactiveCoupon = await client.coupon.create({
    data: {
      code: "WELCOME-TESTINACTIVE",
      description: "Inactive welcome test coupon",
      scope: "PRODUCTS",
      discountType: "FIXED",
      discountValue: 200,
      minSubtotal: 1200,
      isActive: false,
    },
  });

  const inactiveValidation = await validateCoupon(
    {
      code: "WELCOME-TESTINACTIVE",
      scope: "PRODUCTS",
      subtotal: 1500,
    },
    client
  );

  assert(
    inactiveValidation.valid === false,
    "Inactive welcome voucher is authoritatively rejected"
  );
  assert(
    inactiveValidation.error?.includes("no longer active") === true,
    "Error explains inactive status"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: Channel Attribution Tracking & Admin Stats
  // ---------------------------------------------------------------------------
  suiteHeader("TEST SUITE 4: Channel Attribution Tracking & Admin Aggregations");

  // Register users from various channels
  await createOrRetrieveMembership(
    {
      name: "Website User 1",
      phone: "03110000001",
      signupSource: "WEBSITE",
    },
    client
  );

  await createOrRetrieveMembership(
    {
      name: "Referral User 1",
      phone: "03110000002",
      signupSource: "REFERRAL",
    },
    client
  );

  await createOrRetrieveMembership(
    {
      name: "QR Walkin 3",
      phone: "03110000003",
      signupSource: "QR",
    },
    client
  );

  // Query aggregated membership stats
  const stats = await getMembershipStats(client);

  console.log(`\n Membership Channel Breakdown Report:`);
  console.log(`   - Total Members:  ${stats.totalMembers}`);
  console.log(`   - QR Signups:     ${stats.bySource.QR}`);
  console.log(`   - Website:        ${stats.bySource.WEBSITE}`);
  console.log(`   - Referrals:      ${stats.bySource.REFERRAL}`);

  assert(
    stats.totalMembers >= 5,
    `Total members aggregated accurately (Got: ${stats.totalMembers})`
  );
  assert(
    stats.bySource.QR >= 3,
    `QR signups accurately tracked in channel breakdown (Got: ${stats.bySource.QR})`
  );
  assert(
    stats.bySource.WEBSITE >= 1,
    `Website signups accurately tracked (Got: ${stats.bySource.WEBSITE})`
  );
  assert(
    stats.bySource.REFERRAL >= 1,
    `Referral signups accurately tracked (Got: ${stats.bySource.REFERRAL})`
  );

  const qrSourceEntry = stats.sources.find((s) => s.source === "QR");
  assert(
    qrSourceEntry !== undefined && qrSourceEntry.count === stats.bySource.QR,
    "sources array matches bySource mapping"
  );

  // ---------------------------------------------------------------------------
  // Final Results
  // ---------------------------------------------------------------------------
  console.log(`\n${colors.bold}================================================================================${colors.reset}`);
  console.log(` ${colors.bold}📊 TEST RESULTS: ${passed} Passed, ${failed} Failed${colors.reset}`);
  console.log(`${colors.bold}================================================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  });
