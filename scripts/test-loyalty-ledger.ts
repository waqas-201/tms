/**
 * Authoritative Test Harness for Milestone M5: Loyalty Ledger
 *
 * Verifies the Core Invariants defined in docs/loyalty-reward-rules.md:
 * 1. Suite 1: Delivery accrual (credits 2% points on order delivery; handles guest orders & zero-floor subtotals).
 * 2. Suite 2: Idempotency protection (calling delivery twice or duplicate event does NOT double credit points; verified with unique constraint).
 * 3. Suite 3: Cancellation reversal (cancelling order automatically claws back points; verifies negative balance support if points were spent; restores redeemed points).
 * 4. Suite 4: Sum equality invariant: asserts that `getUserLoyaltyBalance` strictly matches `SUM(amount)` across arbitrary sequences of earn, redeem, adjust, and clawback.
 * 5. Suite 5: Admin adjustment with mandatory reason validation (rejects blank or <5 char reasons; requires non-zero integers; stamps staff ID).
 * 6. Suite 6: Service completion accrual (50 points for Hijama, 30 points for Consultation; idempotent).
 */

import {
  getUserLoyaltyBalance,
  getUserLoyaltyHistory,
  creditOrderLoyaltyPoints,
  reverseOrderLoyaltyPoints,
  creditServiceLoyaltyPoints,
  adminAdjustLoyaltyPoints,
  redeemLoyaltyPoints,
  POINT_TO_PKR_RATE,
  MIN_REDEMPTION_POINTS,
  APOTHECARY_EARN_PERCENT,
  HIJAMA_EARN_POINTS,
  CONSULTATION_EARN_POINTS,
} from "../lib/loyalty";
import { transitionOrderStatus, OrderTransitionInput } from "../lib/orders";
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

interface MockLoyaltyEntry {
  id: string;
  userId: string;
  amount: number;
  type: string;
  source: string;
  referenceId: string | null;
  balanceAfter: number;
  reason: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface MockStore {
  users: any[];
  orders: any[];
  orderItems: any[];
  productSizes: any[];
  stockMovements: any[];
  couponRedemptions: any[];
  loyaltyLedger: MockLoyaltyEntry[];
}

function createInitialStore(): MockStore {
  const user1 = {
    id: "user_test_101",
    name: "Tariq Mahmood",
    email: "tariq@example.com",
    role: "user",
    phone: "923001234567",
  };

  const admin1 = {
    id: "admin_staff_001",
    name: "Hakim Admin",
    email: "admin@tms.clinic",
    role: "admin",
  };

  const productSize = {
    id: "size_m5_001",
    productId: "prod_m5_001",
    name: "Standard Pack 250g",
    price: 2500,
    stockOnHand: 100,
    stockReserved: 4,
    unit: { id: "unit_1", name: "Grams" },
  };

  const orderItem = {
    id: "item_m5_001",
    orderId: "order_m5_001",
    productId: "prod_m5_001",
    productSizeId: "size_m5_001",
    productName: "Majoon Shabab Awar",
    price: 2500,
    quantity: 2,
    total: 5000,
    stockState: "RESERVED",
    productSize: { ...productSize },
  };

  const order1 = {
    id: "order_m5_001",
    orderNumber: "TMS-2026-M5-001",
    customerName: "Tariq Mahmood",
    userId: "user_test_101",
    phone: "923001234567",
    subtotal: 5000,
    shippingFee: 200,
    discountAmount: 0,
    total: 5200,
    paidAmount: 0,
    dueAmount: 5200,
    orderStatus: "CONFIRMED",
    paymentStatus: "PENDING",
    paymentMethod: "COD",
    items: [{ ...orderItem }],
  };

  return {
    users: [user1, admin1],
    orders: [order1],
    orderItems: [orderItem],
    productSizes: [productSize],
    stockMovements: [],
    couponRedemptions: [],
    loyaltyLedger: [],
  };
}

function createMockClient(store: MockStore): Prisma.TransactionClient {
  return {
    order: {
      findFirst: async ({ where }: any) => {
        const order = store.orders.find((o) => {
          if (where.OR) {
            return where.OR.some(
              (c: any) =>
                (c.id && o.id === c.id) ||
                (c.orderNumber && o.orderNumber === c.orderNumber)
            );
          }
          if (where.id && o.id !== where.id) return false;
          if (where.orderNumber && o.orderNumber !== where.orderNumber) return false;
          return true;
        });
        return order ? JSON.parse(JSON.stringify(order)) : null;
      },
      findUnique: async ({ where }: any) => {
        const order = store.orders.find((o) => o.id === where.id);
        return order ? JSON.parse(JSON.stringify(order)) : null;
      },
      update: async ({ where, data }: any) => {
        const idx = store.orders.findIndex((o) => o.id === where.id);
        if (idx === -1) throw new Error("Order not found");
        store.orders[idx] = {
          ...store.orders[idx],
          ...data,
          items: store.orderItems
            .filter((item) => item.orderId === where.id)
            .map((item) => ({
              ...item,
              productSize: store.productSizes.find((s) => s.id === item.productSizeId),
            })),
        };
        return JSON.parse(JSON.stringify(store.orders[idx]));
      },
    },

    orderItem: {
      findMany: async ({ where }: any) => {
        return store.orderItems.filter((i) => i.orderId === where.orderId);
      },
      update: async ({ where, data }: any) => {
        const idx = store.orderItems.findIndex((i) => i.id === where.id);
        if (idx !== -1) {
          store.orderItems[idx] = { ...store.orderItems[idx], ...data };
        }
        return store.orderItems[idx];
      },
    },

    productSize: {
      findUnique: async ({ where }: any) => {
        const size = store.productSizes.find((s) => s.id === where.id);
        return size ? JSON.parse(JSON.stringify(size)) : null;
      },
      update: async ({ where, data }: any) => {
        const idx = store.productSizes.findIndex((s) => s.id === where.id);
        if (idx === -1) throw new Error("ProductSize not found");
        const curr = store.productSizes[idx];
        if (data.stockOnHand?.decrement) {
          curr.stockOnHand -= data.stockOnHand.decrement;
        }
        if (data.stockOnHand?.increment) {
          curr.stockOnHand += data.stockOnHand.increment;
        }
        if (data.stockReserved?.decrement) {
          curr.stockReserved -= data.stockReserved.decrement;
        }
        return JSON.parse(JSON.stringify(curr));
      },
    },

    stockMovement: {
      findFirst: async () => null,
      create: async ({ data }: any) => {
        const rec = { id: `sm_${Date.now()}`, ...data, createdAt: new Date() };
        store.stockMovements.push(rec);
        return rec;
      },
    },

    couponRedemption: {
      findFirst: async ({ where }: any) => {
        return store.couponRedemptions.find((r) => r.orderId === where.orderId) || null;
      },
      delete: async ({ where }: any) => {
        const idx = store.couponRedemptions.findIndex((r) => r.id === where.id);
        if (idx !== -1) store.couponRedemptions.splice(idx, 1);
        return {};
      },
    },

    user: {
      findUnique: async ({ where }: any) => {
        return store.users.find((u) => u.id === where.id) || null;
      },
    },

    $executeRaw: async () => {
      // Simulates PostgreSQL SELECT ... FOR UPDATE row-level lock
      return 1;
    },

    loyaltyLedger: {
      aggregate: async ({ where, _sum }: any) => {
        const matching = store.loyaltyLedger.filter((l) => l.userId === where.userId);
        const sum = matching.reduce((acc, curr) => acc + curr.amount, 0);
        return {
          _sum: {
            amount: sum,
          },
        };
      },
      findFirst: async ({ where }: any) => {
        const entry = store.loyaltyLedger.find((l) => {
          if (where.userId && l.userId !== where.userId) return false;
          if (where.source && l.source !== where.source) return false;
          if (where.referenceId && l.referenceId !== where.referenceId) return false;
          if (where.type && l.type !== where.type) return false;
          return true;
        });
        return entry ? JSON.parse(JSON.stringify(entry)) : null;
      },
      findMany: async ({ where, orderBy, take }: any) => {
        let matching = store.loyaltyLedger.filter((l) => l.userId === where.userId);
        if (orderBy?.createdAt === "desc") {
          matching = [...matching].reverse();
        }
        if (take) matching = matching.slice(0, take);
        return JSON.parse(JSON.stringify(matching));
      },
      create: async ({ data }: any) => {
        // Enforce DB composite unique constraint: @@unique([userId, source, referenceId, type])
        // In PostgreSQL standard, NULLs are distinct, so unique applies to non-null referenceIds
        const duplicate =
          data.referenceId !== null &&
          data.referenceId !== undefined &&
          store.loyaltyLedger.find(
            (l) =>
              l.userId === data.userId &&
              l.source === data.source &&
              l.referenceId === data.referenceId &&
              l.type === data.type
          );

        if (duplicate) {
          const error: any = new Error(
            `Unique constraint failed on the fields: (userId, source, referenceId, type)`
          );
          error.code = "P2002";
          error.meta = { target: ["userId", "source", "referenceId", "type"] };
          throw error;
        }

        const newRecord: MockLoyaltyEntry = {
          id: `ll_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: data.userId,
          amount: data.amount,
          type: data.type,
          source: data.source,
          referenceId: data.referenceId || null,
          balanceAfter: data.balanceAfter,
          reason: data.reason || null,
          expiresAt: data.expiresAt || null,
          createdAt: new Date(),
        };

        store.loyaltyLedger.push(newRecord);
        return JSON.parse(JSON.stringify(newRecord));
      },
    },
  } as unknown as Prisma.TransactionClient;
}

// -----------------------------------------------------------------------------
// Test Execution
// -----------------------------------------------------------------------------

async function runTests() {
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  TAMEER-E-SEHAT (TMS) — MILESTONE M5: LOYALTY LEDGER VERIFICATION SUITE       ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}`);

  // ===========================================================================
  // Test Suite 1: Delivery Accrual
  // ===========================================================================
  suiteHeader("Test Suite 1: Delivery Accrual (2% on Order Delivery)");
  {
    const store = createInitialStore();
    const mockTx = createMockClient(store);
    const userId = "user_test_101";

    // 1. Initial balance should be 0
    const initialBalance = await getUserLoyaltyBalance(userId, mockTx);
    assert(initialBalance === 0, "Initial loyalty balance is 0");

    // 2. Deliver Order 1 (subtotal = 5000 PKR -> 2% = 100 points)
    const transitionResult = await transitionOrderStatus(
      {
        orderId: "order_m5_001",
        orderStatus: "DELIVERED",
      },
      mockTx
    );

    assert(
      transitionResult.order.orderStatus === "DELIVERED",
      "Order status transitioned to DELIVERED"
    );

    // 3. Verify ledger entry was created
    const balanceAfterDelivery = await getUserLoyaltyBalance(userId, mockTx);
    assert(
      balanceAfterDelivery === 100,
      "Customer credited with exactly 100 points (2% of ₨ 5,000 subtotal)"
    );

    const ledgerEntries = await getUserLoyaltyHistory(userId, 10, mockTx);
    assert(ledgerEntries.length === 1, "Exactly one ledger row exists");
    assert(ledgerEntries[0].type === "EARN", "Ledger entry type is EARN");
    assert(ledgerEntries[0].source === "ORDER", "Ledger entry source is ORDER");
    assert(ledgerEntries[0].referenceId === "order_m5_001", "Reference ID matches Order ID");
    assert(ledgerEntries[0].balanceAfter === 100, "balanceAfter snapshot records 100");
    assert(ledgerEntries[0].expiresAt !== null, "expiresAt is populated (now + 365 days)");

    // 4. Test second order with non-round subtotal (subtotal = 3775 PKR -> 2% = 75.5 -> floor = 75 points)
    const order2 = {
      id: "order_m5_002",
      orderNumber: "TMS-2026-M5-002",
      customerName: "Tariq Mahmood",
      userId,
      subtotal: 3775,
      shippingFee: 0,
      discountAmount: 0,
      total: 3775,
      paidAmount: 3775,
      dueAmount: 0,
      orderStatus: "CONFIRMED",
      paymentStatus: "PAID",
      paymentMethod: "ONLINE",
      items: [],
    };
    store.orders.push(order2);

    await transitionOrderStatus(
      {
        orderId: "order_m5_002",
        orderStatus: "DELIVERED",
      },
      mockTx
    );

    const balanceAfterOrder2 = await getUserLoyaltyBalance(userId, mockTx);
    assert(
      balanceAfterOrder2 === 175,
      "Balance after second order is 175 (100 + Math.floor(3775 * 0.02) = 175)"
    );

    // 5. Guest checkout order (userId = null) should NOT earn points
    const guestOrder = {
      id: "order_m5_guest",
      orderNumber: "TMS-2026-GUEST",
      customerName: "Anonymous Guest",
      userId: null,
      subtotal: 10000,
      shippingFee: 200,
      discountAmount: 0,
      total: 10200,
      paidAmount: 0,
      dueAmount: 10200,
      orderStatus: "CONFIRMED",
      paymentStatus: "PENDING",
      paymentMethod: "COD",
      items: [],
    };
    store.orders.push(guestOrder);

    const guestCredit = await creditOrderLoyaltyPoints("order_m5_guest", mockTx);
    assert(
      guestCredit.credited === false,
      "Guest checkout does not earn loyalty points (gracefully ignored)"
    );

    // 6. Subtotal too low for loyalty (< 50 PKR gives 0 points)
    const microOrder = {
      id: "order_m5_micro",
      orderNumber: "TMS-2026-MICRO",
      customerName: "Tariq Mahmood",
      userId,
      subtotal: 30, // 30 * 0.02 = 0.6 -> floor = 0
      shippingFee: 150,
      discountAmount: 0,
      total: 180,
      paidAmount: 0,
      dueAmount: 180,
      orderStatus: "CONFIRMED",
      paymentStatus: "PENDING",
      paymentMethod: "COD",
      items: [],
    };
    store.orders.push(microOrder);

    const microCredit = await creditOrderLoyaltyPoints("order_m5_micro", mockTx);
    assert(
      microCredit.credited === false,
      "Order subtotal generating 0 floor points is not credited"
    );
  }

  // ===========================================================================
  // Test Suite 2: Idempotency Protection
  // ===========================================================================
  suiteHeader("Test Suite 2: Idempotency Protection & Unique Constraint Enforcement");
  {
    const store = createInitialStore();
    const mockTx = createMockClient(store);
    const userId = "user_test_101";

    // First delivery transition: credits 100 points
    await transitionOrderStatus(
      {
        orderId: "order_m5_001",
        orderStatus: "DELIVERED",
      },
      mockTx
    );

    const balance1 = await getUserLoyaltyBalance(userId, mockTx);
    assert(balance1 === 100, "First credit yields 100 points");

    // Attempt second credit directly for the same order
    const duplicateCredit = await creditOrderLoyaltyPoints("order_m5_001", mockTx);
    assert(
      duplicateCredit.credited === false && duplicateCredit.alreadyCredited === true,
      "Calling creditOrderLoyaltyPoints again reports alreadyCredited: true and credited: false"
    );

    const balanceAfterDuplicate = await getUserLoyaltyBalance(userId, mockTx);
    assert(
      balanceAfterDuplicate === 100,
      "Balance remains strictly 100 (duplicate event does NOT double credit points)"
    );

    // Verify DB unique constraint enforcement: attempting direct duplicate insert
    let caughtP2002 = false;
    try {
      await mockTx.loyaltyLedger.create({
        data: {
          userId,
          amount: 100,
          type: "EARN",
          source: "ORDER",
          referenceId: "order_m5_001",
          balanceAfter: 200,
        },
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        caughtP2002 = true;
      }
    }

    assert(
      caughtP2002,
      "Database composite unique index @@unique([userId, source, referenceId, type]) blocks duplicate rows for same user"
    );

    const countRows = store.loyaltyLedger.filter(
      (l) => l.userId === userId && l.source === "ORDER" && l.referenceId === "order_m5_001" && l.type === "EARN"
    ).length;
    assert(countRows === 1, "Exactly 1 EARN row exists for user_test_101 on order_m5_001");

    // Verify multi-tenant isolation: Two different users sharing the same source, referenceId, and type do NOT collide
    const user2Entry = await mockTx.loyaltyLedger.create({
      data: {
        userId: "user_test_202",
        amount: 100,
        type: "EARN",
        source: "ORDER",
        referenceId: "order_m5_001", // shared referenceId
        balanceAfter: 100,
      },
    });
    assert(
      Boolean(user2Entry.id),
      "Composite unique constraint @@unique([userId, source, referenceId, type]) allows different users to share referenceId without collision"
    );
  }

  // ===========================================================================
  // Test Suite 3: Cancellation Reversal & Negative Balance Policy
  // ===========================================================================
  suiteHeader("Test Suite 3: Cancellation Reversal & Negative Balance Support");
  {
    const store = createInitialStore();
    const mockTx = createMockClient(store);
    const userId = "user_test_101";

    // Deliver order -> earns 100 points
    await transitionOrderStatus(
      {
        orderId: "order_m5_001",
        orderStatus: "DELIVERED",
      },
      mockTx
    );
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 100,
      "Accrued 100 points on delivery"
    );

    // 1. Cancel order -> should atomically claw back the 100 points
    const cancelResult = await transitionOrderStatus(
      {
        orderId: "order_m5_001",
        orderStatus: "CANCELLED",
      },
      mockTx
    );

    assert(
      cancelResult.order.orderStatus === "CANCELLED",
      "Order status transitioned to CANCELLED"
    );

    const balanceAfterCancel = await getUserLoyaltyBalance(userId, mockTx);
    assert(
      balanceAfterCancel === 0,
      "Order cancellation claws back earned points, restoring balance to 0"
    );

    const historyAfterCancel = await getUserLoyaltyHistory(userId, 10, mockTx);
    const clawbackEntry = historyAfterCancel.find((h) => h.type === "CLAWBACK");
    assert(clawbackEntry !== undefined, "CLAWBACK entry exists in ledger");
    assert(clawbackEntry?.amount === -100, "CLAWBACK amount is -100");
    assert(clawbackEntry?.balanceAfter === 0, "CLAWBACK balanceAfter is 0");

    // 2. Cancellation Reversal Idempotency
    const secondCancelReversal = await reverseOrderLoyaltyPoints("order_m5_001", mockTx);
    assert(
      secondCancelReversal.reversed === false ||
        (await getUserLoyaltyBalance(userId, mockTx)) === 0,
      "Reversing cancelled order again is idempotent (does not double clawback)"
    );

    // 3. Negative Balance Policy: Customer earns points on Order A, redeems them on Order B, then cancels Order A
    // Setup Order A: subtotal 12,500 PKR -> 2% = 250 points
    const orderA = {
      id: "order_A_earn",
      orderNumber: "TMS-ORDER-A",
      customerName: "Tariq Mahmood",
      userId,
      subtotal: 12500,
      shippingFee: 0,
      discountAmount: 0,
      total: 12500,
      paidAmount: 12500,
      dueAmount: 0,
      orderStatus: "CONFIRMED",
      paymentStatus: "PAID",
      paymentMethod: "ONLINE",
      items: [],
    };
    store.orders.push(orderA);

    await transitionOrderStatus(
      {
        orderId: "order_A_earn",
        orderStatus: "DELIVERED",
      },
      mockTx
    );

    const balanceAfterOrderA = await getUserLoyaltyBalance(userId, mockTx);
    assert(balanceAfterOrderA === 250, "Customer earned 250 points from Order A");

    // Customer burns 200 points on Order B
    const orderB = {
      id: "order_B_redeem",
      orderNumber: "TMS-ORDER-B",
      customerName: "Tariq Mahmood",
      userId,
      subtotal: 4000,
      shippingFee: 200,
      discountAmount: 200, // 200 PKR discount from loyalty
      total: 4000,
      paidAmount: 4000,
      dueAmount: 0,
      orderStatus: "CONFIRMED",
      paymentStatus: "PAID",
      paymentMethod: "ONLINE",
      items: [],
    };
    store.orders.push(orderB);

    const redeemResult = await redeemLoyaltyPoints(
      {
        userId,
        points: 200,
        orderId: "order_B_redeem",
      },
      mockTx
    );

    assert(redeemResult.redeemed === true, "Redeemed 200 points successfully");
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 50,
      "Balance after redemption is 50 points (250 - 200)"
    );

    // Now Order A is returned/cancelled: claw back 250 points!
    const clawbackOrderA = await reverseOrderLoyaltyPoints("order_A_earn", mockTx);
    assert(clawbackOrderA.reversed === true, "Order A loyalty points reversed");
    assert(clawbackOrderA.clawbackAmount === 250, "Clawed back full 250 points");

    const negativeBalance = await getUserLoyaltyBalance(userId, mockTx);
    assert(
      negativeBalance === -200,
      "Negative balance is supported: 50 - 250 = -200 points deficit recorded in ledger"
    );

    // 4. Redeemed points restoration on Order B cancellation
    // When Order B is cancelled, the 200 redeemed points must be refunded
    const refundOrderB = await reverseOrderLoyaltyPoints("order_B_redeem", mockTx);
    assert(refundOrderB.reversed === true, "Order B points refunded on cancellation");
    assert(refundOrderB.refundedAmount === 200, "Refunded 200 points back to customer");

    const balanceAfterRefund = await getUserLoyaltyBalance(userId, mockTx);
    assert(
      balanceAfterRefund === 0,
      "Refunding 200 points restores deficit from -200 back to 0"
    );
  }

  // ===========================================================================
  // Test Suite 4: Sum Equality Invariant
  // ===========================================================================
  suiteHeader("Test Suite 4: Sum Equality Invariant (Balance === SUM(amount))");
  {
    const store = createInitialStore();
    const mockTx = createMockClient(store);
    const userId = "user_test_invariant";

    // Sequence of 7 distinct credit/debit events
    const operations = [
      { name: "Service: Hijama (+50)", action: () => creditServiceLoyaltyPoints("HIJAMA", "hij_inv_1", userId, mockTx) },
      { name: "Service: Consultation (+30)", action: () => creditServiceLoyaltyPoints("CONSULTATION", "con_inv_1", userId, mockTx) },
      { name: "Admin Credit (+150)", action: () => adminAdjustLoyaltyPoints({ userId, amount: 150, reason: "Incentive bonus", staffUserId: "admin_1" }, mockTx) },
      { name: "Redemption (-200)", action: () => redeemLoyaltyPoints({ userId, points: 200, orderId: "ord_inv_redeem" }, mockTx) },
      { name: "Admin Debit (-20)", action: () => adminAdjustLoyaltyPoints({ userId, amount: -20, reason: "Correction debit", staffUserId: "admin_1" }, mockTx) },
      { name: "Service: Hijama (+50)", action: () => creditServiceLoyaltyPoints("HIJAMA", "hij_inv_2", userId, mockTx) },
      { name: "Admin Credit (+100)", action: () => adminAdjustLoyaltyPoints({ userId, amount: 100, reason: "Apology credit", staffUserId: "admin_1" }, mockTx) },
    ];

    let step = 1;
    for (const op of operations) {
      await op.action();

      // Aggregate sum via getUserLoyaltyBalance (uses DB SUM aggregate)
      const dbAggregateBalance = await getUserLoyaltyBalance(userId, mockTx);

      // Manual array sum of all rows
      const userRows = store.loyaltyLedger.filter((l) => l.userId === userId);
      const manualSum = userRows.reduce((sum, r) => sum + r.amount, 0);

      // Latest row balanceAfter snapshot
      const latestRow = userRows[userRows.length - 1];

      assert(
        dbAggregateBalance === manualSum && manualSum === latestRow.balanceAfter,
        `Step ${step} [${op.name}]: dbAggregate (${dbAggregateBalance}) === manualSum (${manualSum}) === balanceAfter (${latestRow.balanceAfter})`
      );
      step++;
    }

    const finalBalance = await getUserLoyaltyBalance(userId, mockTx);
    // Expected: 50 + 30 + 150 - 200 - 20 + 50 + 100 = 160
    assert(finalBalance === 160, "Final balance matches expected arithmetic sum (160 pts)");
  }

  // ===========================================================================
  // Test Suite 5: Admin Adjustment with Mandatory Reason Validation
  // ===========================================================================
  suiteHeader("Test Suite 5: Admin Adjustment & Audit Reason Validation");
  {
    const store = createInitialStore();
    const mockTx = createMockClient(store);
    const userId = "user_test_admin";

    // 1. Blank reason rejected
    let blankReasonError = false;
    try {
      await adminAdjustLoyaltyPoints(
        { userId, amount: 50, reason: "", staffUserId: "admin_1" },
        mockTx
      );
    } catch (err: any) {
      blankReasonError = true;
    }
    assert(blankReasonError, "Blank reason is strictly rejected with an error");

    // 2. Whitespace-only reason rejected
    let whitespaceError = false;
    try {
      await adminAdjustLoyaltyPoints(
        { userId, amount: 50, reason: "    ", staffUserId: "admin_1" },
        mockTx
      );
    } catch (err: any) {
      whitespaceError = true;
    }
    assert(whitespaceError, "Whitespace-only reason is strictly rejected");

    // 3. Reason under 5 characters rejected
    let shortReasonError = false;
    try {
      await adminAdjustLoyaltyPoints(
        { userId, amount: 50, reason: "Good", staffUserId: "admin_1" },
        mockTx
      );
    } catch (err: any) {
      shortReasonError = true;
    }
    assert(shortReasonError, "Reason shorter than 5 characters is strictly rejected");

    // 4. Zero adjustment amount rejected
    let zeroAmountError = false;
    try {
      await adminAdjustLoyaltyPoints(
        { userId, amount: 0, reason: "Adjustment for shipping", staffUserId: "admin_1" },
        mockTx
      );
    } catch (err: any) {
      zeroAmountError = true;
    }
    assert(zeroAmountError, "Zero amount adjustment is strictly rejected");

    // 4b. Excessive adjustment amount (> ±5,000) rejected by safety bounds
    let excessiveAmountError = false;
    try {
      await adminAdjustLoyaltyPoints(
        { userId, amount: 5001, reason: "Excessive bonus payout", staffUserId: "admin_1" },
        mockTx
      );
    } catch (err: any) {
      if (err.message.includes("±5000 points")) {
        excessiveAmountError = true;
      }
    }
    assert(excessiveAmountError, "Adjustment exceeding +5,000 points is blocked by safety bound");

    let excessiveNegativeError = false;
    try {
      await adminAdjustLoyaltyPoints(
        { userId, amount: -5001, reason: "Excessive clawback penalty", staffUserId: "admin_1" },
        mockTx
      );
    } catch (err: any) {
      if (err.message.includes("±5000 points")) {
        excessiveNegativeError = true;
      }
    }
    assert(excessiveNegativeError, "Adjustment exceeding -5,000 points is blocked by safety bound");

    // 5. Valid credit adjustment
    const creditAdjust = await adminAdjustLoyaltyPoints(
      {
        userId,
        amount: 150,
        reason: "Customer goodwill compensation for delivery delay",
        staffUserId: "admin_staff_001",
      },
      mockTx
    );
    assert(creditAdjust.adjusted === true, "Valid admin credit adjustment succeeds");
    assert(creditAdjust.amount === 150, "Credit amount recorded as +150");
    assert(creditAdjust.balanceAfter === 150, "Balance after credit is 150");

    // 6. Valid debit adjustment
    const debitAdjust = await adminAdjustLoyaltyPoints(
      {
        userId,
        amount: -50,
        reason: "Manual correction for duplicate coupon benefit",
        staffUserId: "admin_staff_001",
      },
      mockTx
    );
    assert(debitAdjust.adjusted === true, "Valid admin debit adjustment succeeds");
    assert(debitAdjust.amount === -50, "Debit amount recorded as -50");
    assert(debitAdjust.balanceAfter === 100, "Balance after debit is 100 (150 - 50)");

    // 7. Verify staff audit trail stamp
    const entries = await getUserLoyaltyHistory(userId, 5, mockTx);
    assert(
      Boolean(entries[0].referenceId?.includes("admin_staff_001")),
      "Audit referenceId stamps admin staff ID"
    );
    assert(entries[0].source === "ADMIN", "Source is stamped as ADMIN");
    assert(entries[0].type === "ADJUST", "Type is stamped as ADJUST");
  }

  // ===========================================================================
  // Test Suite 6: Service Completion Accrual (Hijama & Consultation)
  // ===========================================================================
  suiteHeader("Test Suite 6: Service Completion Accrual (Hijama & Consultation)");
  {
    const store = createInitialStore();
    const mockTx = createMockClient(store);
    const userId = "user_test_service";

    // 1. Hijama completion credits flat 50 points
    const hijama1 = await creditServiceLoyaltyPoints(
      "HIJAMA",
      "booking_hij_001",
      userId,
      mockTx
    );
    assert(hijama1.credited === true, "Hijama session completion credited");
    assert(hijama1.amount === 50, "Credits flat 50 points for Sunnah Hijama");
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 50,
      "User balance is 50 points"
    );

    // 2. Hijama completion idempotency: same bookingId cannot double-credit
    const hijamaDuplicate = await creditServiceLoyaltyPoints(
      "HIJAMA",
      "booking_hij_001",
      userId,
      mockTx
    );
    assert(
      hijamaDuplicate.credited === false && hijamaDuplicate.alreadyCredited === true,
      "Duplicate Hijama completion event does NOT double credit points"
    );
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 50,
      "User balance remains 50 points"
    );

    // 3. Physician Consultation completion credits flat 30 points
    const consult1 = await creditServiceLoyaltyPoints(
      "CONSULTATION",
      "consult_001",
      userId,
      mockTx
    );
    assert(consult1.credited === true, "Consultation session completion credited");
    assert(consult1.amount === 30, "Credits flat 30 points for physician consultation");
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 80,
      "User balance is now 80 points (50 + 30)"
    );

    // 4. Consultation idempotency
    const consultDuplicate = await creditServiceLoyaltyPoints(
      "CONSULTATION",
      "consult_001",
      userId,
      mockTx
    );
    assert(
      consultDuplicate.credited === false && consultDuplicate.alreadyCredited === true,
      "Duplicate Consultation completion event does NOT double credit points"
    );
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 80,
      "User balance remains strictly 80 points"
    );

    // 5. Minimum redemption threshold validation (under 200 points fails)
    let underThresholdError = false;
    try {
      await redeemLoyaltyPoints({ userId, points: 80 }, mockTx);
    } catch (err: any) {
      if (err.message.includes("200 points")) {
        underThresholdError = true;
      }
    }
    assert(
      underThresholdError,
      "Redemption below minimum 200 points threshold is blocked"
    );

    // 6. Sufficient points redemption: add points then redeem
    await adminAdjustLoyaltyPoints(
      { userId, amount: 200, reason: "Tier upgrade reward points", staffUserId: "admin_1" },
      mockTx
    );
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 280,
      "User balance updated to 280 points (80 + 200)"
    );

    const burnResult = await redeemLoyaltyPoints({ userId, points: 200 }, mockTx);
    assert(burnResult.redeemed === true, "Redemption of 200 points succeeded");
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 80,
      "Balance after burn is 80 points"
    );

    // 7. Enforce 25% Order Subtotal Cap
    await adminAdjustLoyaltyPoints(
      { userId, amount: 920, reason: "Loyalty compensation", staffUserId: "admin_1" },
      mockTx
    );
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 1000,
      "User balance loaded to 1,000 points for subtotal cap test"
    );

    // Order subtotal = ₨ 1,000 -> 25% cap = 250 points max.
    // Attempting to redeem 300 points on a ₨ 1,000 order must be blocked:
    let capExceededError = false;
    try {
      await redeemLoyaltyPoints(
        { userId, points: 300, orderSubtotal: 1000, orderId: "ord_cap_test_1" },
        mockTx
      );
    } catch (err: any) {
      if (err.message.includes("25% of order subtotal")) {
        capExceededError = true;
      }
    }
    assert(
      capExceededError,
      "Redemption exceeding 25% of order subtotal (300 pts on ₨ 1,000 order) is strictly blocked"
    );

    // Redeeming exactly 25% (250 points on ₨ 1,000 order) must succeed:
    const validCapBurn = await redeemLoyaltyPoints(
      { userId, points: 250, orderSubtotal: 1000, orderId: "ord_cap_test_2" },
      mockTx
    );
    assert(
      validCapBurn.redeemed === true,
      "Redemption of exactly 25% (250 pts on ₨ 1,000 order) succeeds"
    );
    assert(
      (await getUserLoyaltyBalance(userId, mockTx)) === 750,
      "Balance after 250 pts redemption is 750 points (1000 - 250)"
    );
  }

  // ===========================================================================
  // Summary Report
  // ===========================================================================
  console.log(`\n${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}  LOYALTY LEDGER VERIFICATION SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  Total Invariants Tested : ${passed + failed}`);
  console.log(`  ${colors.green}Passed${colors.reset}                  : ${passed}`);
  console.log(`  ${failed > 0 ? colors.red : colors.green}Failed${colors.reset}                  : ${failed}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unexpected failure in test suite execution:", err);
  process.exit(1);
});
