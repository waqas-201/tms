/**
 * Comprehensive Test Harness for Milestone M2: Reliable Coupons
 *
 * Verifies:
 * 1. Test Suite 1: Cancellation Reversal & Reuse
 *    - Order placed with coupon -> usageCount = 1, redemption row created.
 *    - Order cancelled via transitionOrderStatus -> usageCount restored to 0, redemption row deleted.
 *    - Customer can immediately re-apply and redeem coupon on subsequent order.
 * 2. Test Suite 2: Atomic Concurrency & Last-Use Race Protection
 *    - Coupon with usageLimit = 1 subjected to simultaneous parallel redemption calls (Promise.all).
 *    - Exactly ONE transaction succeeds; concurrent attempt is rejected with
 *      "Coupon usage limit has been reached or coupon is inactive."
 *    - usageCount is exactly 1 (never 2).
 *    - High-concurrency stress test: 5 simultaneous transactions competing for 2 slots -> exactly 2 succeed, 3 fail.
 * 3. Test Suite 3: Atomic Rollback on Reversal Failure
 *    - When order cancellation fails midway, coupon reversal is rolled back atomically.
 *    - Order status and coupon usageCount remain unchanged.
 * 4. Test Suite 4: Hijama & Consultation Lifecycle & Boundary Guards
 *    - Hijama booking coupon reversal via hijamaBookingId.
 *    - Consultation voucher reversal via consultationId.
 *    - Zero floor guarantee: usageCount never drops below 0 (GREATEST(0, usageCount - 1)).
 *    - Graceful handling of empty or non-existent redemption queries.
 */

import {
  recordCouponRedemption,
  reverseCouponRedemption,
  RecordCouponRedemptionParams,
  ReverseCouponRedemptionParams,
} from "../lib/coupons";
import {
  transitionOrderStatus,
  OrderTransitionInput,
  OrderStatus,
  PaymentStatus,
} from "../lib/orders";
import { Prisma } from "@prisma/client";

// ANSI color palette for formatted terminal reports
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
// In-Memory Concurrent ACID Store with Row-Level Locking Simulator
// -----------------------------------------------------------------------------

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
  hijamaBookingId: string | null;
  consultationId: string | null;
  discountAmount: number;
  orderTotal: number | null;
  redeemedAt: Date;
}

interface MockOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string | null;
  city: string;
  address: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  trackingNote: string | null;
  deliveryNotes: string | null;
  deliveryFeeType: string;
  couponId: string | null;
  couponCode: string | null;
  items: any[];
}

interface MockStore {
  coupons: MockCoupon[];
  redemptions: MockCouponRedemption[];
  orders: MockOrder[];
  orderItems: any[];
  productSizes: any[];
  stockMovements: any[];
  // Mutex queues for simulating PostgreSQL row-level locks on UPDATE "coupon"
  couponLocks: Map<string, Promise<void>>;
}

function cloneStore(store: MockStore): MockStore {
  return {
    coupons: JSON.parse(JSON.stringify(store.coupons)),
    redemptions: JSON.parse(JSON.stringify(store.redemptions)),
    orders: JSON.parse(JSON.stringify(store.orders)),
    orderItems: JSON.parse(JSON.stringify(store.orderItems)),
    productSizes: JSON.parse(JSON.stringify(store.productSizes)),
    stockMovements: JSON.parse(JSON.stringify(store.stockMovements)),
    couponLocks: store.couponLocks, // reference preserved across clones
  };
}

class AsyncMutex {
  private queue: Promise<void> = Promise.resolve();

  async acquire(): Promise<() => void> {
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const current = this.queue;
    this.queue = this.queue.then(() => next);
    await current;
    return release!;
  }
}

const couponMutexes = new Map<string, AsyncMutex>();

function getCouponMutex(couponId: string): AsyncMutex {
  let mutex = couponMutexes.get(couponId);
  if (!mutex) {
    mutex = new AsyncMutex();
    couponMutexes.set(couponId, mutex);
  }
  return mutex;
}

function createMockTransactionClient(
  store: MockStore,
  undoLog?: (() => void)[]
): Prisma.TransactionClient {
  return {
    $executeRaw: async (query: TemplateStringsArray | any, ...values: any[]) => {
      // Reconstruct query text for pattern matching
      let sql = "";
      if (Array.isArray(query) || (query && "raw" in query)) {
        const strings = query.raw || query;
        sql = strings.reduce((acc: string, str: string, i: number) => {
          return acc + str + (i < values.length ? String(values[i]) : "");
        }, "");
      } else {
        sql = String(query);
      }

      // Pattern 1: UPDATE "coupon" SET "usageCount" = "usageCount" + 1 ...
      if (sql.includes('UPDATE "coupon"') && sql.includes('"usageCount" + 1')) {
        const couponId = values[0] || (sql.match(/WHERE\s+"id"\s*=\s*'([^']+)'/) || [])[1] || "";
        const unlock = await getCouponMutex(couponId).acquire();
        try {
          // Interleave delay to simulate network/disk IO during atomic row update
          await new Promise((r) => setTimeout(r, 2));

          const coupon = store.coupons.find((c) => c.id === couponId);
          if (!coupon) return 0;
          if (!coupon.isActive) return 0;
          if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
            return 0; // Conditional WHERE failed: usageCount < usageLimit is FALSE
          }

          coupon.usageCount += 1;
          coupon.updatedAt = new Date();
          undoLog?.push(() => {
            coupon.usageCount -= 1;
          });
          return 1; // 1 row successfully updated
        } finally {
          unlock();
        }
      }

      // Pattern 2: UPDATE "coupon" SET "usageCount" = GREATEST(0, "usageCount" - 1) ...
      if (sql.includes('UPDATE "coupon"') && sql.includes("GREATEST(0")) {
        const couponId = values[0] || (sql.match(/WHERE\s+"id"\s*=\s*'([^']+)'/) || [])[1] || "";
        const unlock = await getCouponMutex(couponId).acquire();
        try {
          await new Promise((r) => setTimeout(r, 2));
          const coupon = store.coupons.find((c) => c.id === couponId);
          if (!coupon) return 0;

          const prevUsage = coupon.usageCount;
          coupon.usageCount = Math.max(0, coupon.usageCount - 1);
          coupon.updatedAt = new Date();
          undoLog?.push(() => {
            coupon.usageCount = prevUsage;
          });
          return 1;
        } finally {
          unlock();
        }
      }

      return 0;
    },

    coupon: {
      findUnique: async ({ where }: any) => {
        const coupon = store.coupons.find(
          (c) => (where.id && c.id === where.id) || (where.code && c.code === where.code)
        );
        return coupon ? JSON.parse(JSON.stringify(coupon)) : null;
      },
      update: async ({ where, data }: any) => {
        const idx = store.coupons.findIndex((c) => c.id === where.id);
        if (idx === -1) throw new Error("Coupon not found in mock store.");
        const prevUsage = store.coupons[idx].usageCount;
        if (data.usageCount?.increment) {
          store.coupons[idx].usageCount += data.usageCount.increment;
          undoLog?.push(() => {
            store.coupons[idx].usageCount = prevUsage;
          });
        }
        return JSON.parse(JSON.stringify(store.coupons[idx]));
      },
    },

    couponRedemption: {
      findFirst: async ({ where }: any) => {
        const item = store.redemptions.find((r) => {
          if (where.orderId && r.orderId !== where.orderId) return false;
          if (where.couponId && r.couponId !== where.couponId) return false;
          if (where.hijamaBookingId && r.hijamaBookingId !== where.hijamaBookingId) return false;
          if (where.consultationId && r.consultationId !== where.consultationId) return false;
          return true;
        });
        return item ? JSON.parse(JSON.stringify(item)) : null;
      },
      findMany: async ({ where }: any) => {
        const items = store.redemptions.filter((r) => {
          if (where.couponId && r.couponId !== where.couponId) return false;
          if (where.orderId && r.orderId !== where.orderId) return false;
          return true;
        });
        return JSON.parse(JSON.stringify(items));
      },
      create: async ({ data }: any) => {
        const newRecord: MockCouponRedemption = {
          id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          couponId: data.couponId,
          userId: data.userId || null,
          phone: data.phone || null,
          orderId: data.orderId || null,
          hijamaBookingId: data.hijamaBookingId || null,
          consultationId: data.consultationId || null,
          discountAmount: data.discountAmount,
          orderTotal: data.orderTotal || null,
          redeemedAt: new Date(),
        };
        store.redemptions.push(newRecord);
        undoLog?.push(() => {
          const idx = store.redemptions.findIndex((r) => r.id === newRecord.id);
          if (idx !== -1) store.redemptions.splice(idx, 1);
        });
        return JSON.parse(JSON.stringify(newRecord));
      },
      delete: async ({ where }: any) => {
        const idx = store.redemptions.findIndex((r) => r.id === where.id);
        if (idx === -1) throw new Error("CouponRedemption not found for deletion");
        const [deleted] = store.redemptions.splice(idx, 1);
        undoLog?.push(() => {
          store.redemptions.push(deleted);
        });
        return JSON.parse(JSON.stringify(deleted));
      },
    },

    order: {
      findFirst: async ({ where }: any) => {
        const order = store.orders.find((o) => {
          if (where.OR) {
            return where.OR.some(
              (cond: any) =>
                (cond.id && o.id === cond.id) ||
                (cond.orderNumber && o.orderNumber === cond.orderNumber)
            );
          }
          if (where.id) return o.id === where.id;
          if (where.orderNumber) return o.orderNumber === where.orderNumber;
          return true;
        });
        if (!order) return null;
        const res = JSON.parse(JSON.stringify(order));
        res.items = store.orderItems
          .filter((i) => i.orderId === order.id)
          .map((i) => ({
            ...i,
            productSize: store.productSizes.find((s) => s.id === i.productSizeId),
          }));
        return res;
      },
      findUnique: async ({ where }: any) => {
        const order = store.orders.find((o) => o.id === where.id);
        return order ? JSON.parse(JSON.stringify(order)) : null;
      },
      update: async ({ where, data }: any) => {
        const idx = store.orders.findIndex((o) => o.id === where.id);
        if (idx === -1) throw new Error("Order not found in mock store.");
        const prevOrder = JSON.parse(JSON.stringify(store.orders[idx]));
        store.orders[idx] = {
          ...store.orders[idx],
          ...data,
        };
        undoLog?.push(() => {
          store.orders[idx] = prevOrder;
        });
        const res = JSON.parse(JSON.stringify(store.orders[idx]));
        res.items = store.orderItems
          .filter((i) => i.orderId === where.id)
          .map((i) => ({
            ...i,
            productSize: store.productSizes.find((s) => s.id === i.productSizeId),
          }));
        return res;
      },
    },

    productSize: {
      findUnique: async ({ where }: any) => {
        const size = store.productSizes.find((s) => s.id === where.id);
        return size ? JSON.parse(JSON.stringify(size)) : null;
      },
      update: async ({ where, data }: any) => {
        const idx = store.productSizes.findIndex((s) => s.id === where.id);
        if (idx === -1) throw new Error("ProductSize not found in mock store.");
        const current = store.productSizes[idx];
        const prevSize = JSON.parse(JSON.stringify(current));
        let stockOnHand = current.stockOnHand;
        if (data.stockOnHand?.decrement) stockOnHand -= data.stockOnHand.decrement;
        if (data.stockOnHand?.increment) stockOnHand += data.stockOnHand.increment;

        let stockReserved = current.stockReserved;
        if (data.stockReserved?.decrement) stockReserved -= data.stockReserved.decrement;
        if (data.stockReserved?.increment) stockReserved += data.stockReserved.increment;

        store.productSizes[idx] = {
          ...current,
          ...data,
          stockOnHand,
          stockReserved,
        };
        undoLog?.push(() => {
          store.productSizes[idx] = prevSize;
        });
        return JSON.parse(JSON.stringify(store.productSizes[idx]));
      },
    },

    orderItem: {
      update: async ({ where, data }: any) => {
        const idx = store.orderItems.findIndex((i) => i.id === where.id);
        if (idx === -1) throw new Error("OrderItem not found in mock store.");
        const prevItem = JSON.parse(JSON.stringify(store.orderItems[idx]));
        store.orderItems[idx] = { ...store.orderItems[idx], ...data };
        undoLog?.push(() => {
          store.orderItems[idx] = prevItem;
        });
        return JSON.parse(JSON.stringify(store.orderItems[idx]));
      },
    },

    stockMovement: {
      create: async ({ data }: any) => {
        const mov = { id: `mov_${Date.now()}_${Math.random()}`, createdAt: new Date(), ...data };
        store.stockMovements.push(mov);
        undoLog?.push(() => {
          const idx = store.stockMovements.findIndex((m) => m.id === mov.id);
          if (idx !== -1) store.stockMovements.splice(idx, 1);
        });
        return JSON.parse(JSON.stringify(mov));
      },
      findMany: async ({ where }: any) => {
        let results = [...store.stockMovements];
        if (where?.orderId) results = results.filter((m) => m.orderId === where.orderId);
        return JSON.parse(JSON.stringify(results));
      },
    },
  } as unknown as Prisma.TransactionClient;
}

/**
 * Executes a simulated ACID transaction over the MockStore with 100% atomic rollback guarantee
 * using an undo log per transaction.
 */
async function executeMockTx<T>(
  store: MockStore,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const undoLog: (() => void)[] = [];
  const tx = createMockTransactionClient(store, undoLog);
  try {
    const result = await fn(tx);
    return result;
  } catch (err) {
    // Replay undo log in reverse order to revert ONLY changes made by this transaction
    for (let i = undoLog.length - 1; i >= 0; i--) {
      undoLog[i]();
    }
    throw err;
  }
}

// -----------------------------------------------------------------------------
// Helper to seed initial store state
// -----------------------------------------------------------------------------

function seedStore(): MockStore {
  const defaultProductSize = {
    id: "size_ps_001",
    productId: "prod_p_001",
    name: "Standard Pack",
    weight: "250g",
    price: 1500,
    stockOnHand: 50,
    stockReserved: 2,
    costPrice: 800,
    isActive: true,
    unit: { id: "unit_1", name: "Grams", abbreviation: "g" },
  };

  const defaultOrderItem = {
    id: "item_oi_001",
    orderId: "order_ord_001",
    productId: "prod_p_001",
    productSizeId: "size_ps_001",
    productName: "Majoon Shabab Awar",
    sizeName: "Standard Pack",
    sizeWeight: "250g",
    price: 1500,
    quantity: 2,
    total: 3000,
    stockState: "RESERVED",
    productSize: { ...defaultProductSize },
  };

  const defaultOrder: MockOrder = {
    id: "order_ord_001",
    orderNumber: "TMS-2026-9001",
    customerName: "Tariq Mahmood",
    phone: "923001234567",
    email: "tariq@example.com",
    city: "Lahore",
    address: "Model Town Block B",
    orderStatus: "PENDING_CONFIRMATION",
    paymentStatus: "PENDING",
    paymentMethod: "COD",
    subtotal: 3000,
    shippingFee: 200,
    discountAmount: 300,
    total: 2900,
    paidAmount: 0,
    dueAmount: 2900,
    trackingNote: null,
    deliveryNotes: null,
    deliveryFeeType: "MANUAL",
    couponId: "cpn_rev_001",
    couponCode: "SEHAT300",
    items: [{ ...defaultOrderItem }],
  };

  const defaultCoupon: MockCoupon = {
    id: "cpn_rev_001",
    code: "SEHAT300",
    description: "Flat ₨ 300 Off for Herbal Orders",
    scope: "PRODUCTS",
    discountType: "FIXED",
    discountValue: 300,
    minSubtotal: 1000,
    maxDiscountCap: null,
    targetCategoryId: null,
    targetProductIds: null,
    startDate: null,
    endDate: null,
    usageLimit: 5,
    usageCount: 0,
    perUserLimit: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    coupons: [defaultCoupon],
    redemptions: [],
    orders: [defaultOrder],
    orderItems: [defaultOrderItem],
    productSizes: [defaultProductSize],
    stockMovements: [],
    couponLocks: new Map(),
  };
}

// -----------------------------------------------------------------------------
// Test Execution Suite
// -----------------------------------------------------------------------------

async function runCouponConcurrencyTestSuite() {
  console.log("================================================================================");
  console.log(" 🎟️  TAMEER-E-SEHAT (TMS) - MILESTONE M2: RELIABLE COUPONS TEST HARNESS");
  console.log("================================================================================\n");

  // ===========================================================================
  // TEST SUITE 1: Cancellation Reversal & Reuse
  // ===========================================================================
  suiteHeader("TEST SUITE 1: Cancellation Reversal & Immediate Coupon Reuse");

  const store1 = seedStore();
  const tx1 = createMockTransactionClient(store1);

  // 1. Initial State: usageCount = 0, no redemptions
  const couponBefore = store1.coupons.find((c) => c.id === "cpn_rev_001");
  assert(couponBefore?.usageCount === 0, "Initial coupon usageCount is 0");
  assert(store1.redemptions.length === 0, "Initial couponRedemptions table is empty");

  // 2. Order 1 applies coupon: call recordCouponRedemption
  await recordCouponRedemption(
    {
      couponId: "cpn_rev_001",
      orderId: "order_ord_001",
      phone: "03001234567",
      discountAmount: 300,
      orderTotal: 2900,
    },
    tx1
  );

  const couponAfterOrder1 = store1.coupons.find((c) => c.id === "cpn_rev_001");
  assert(couponAfterOrder1?.usageCount === 1, "After placing Order 1, usageCount is atomically incremented to 1");
  assert(store1.redemptions.length === 1, "Audit row created in couponRedemption table");
  assert(store1.redemptions[0].orderId === "order_ord_001", "CouponRedemption references Order 1");
  assert(store1.redemptions[0].discountAmount === 300, "CouponRedemption records discountAmount ₨ 300");

  // 3. Customer cancels Order 1 via transitionOrderStatus
  console.log(`\n ${colors.dim}--> Transitioning Order 1 from PENDING_CONFIRMATION to CANCELLED...${colors.reset}`);
  const cancelResult = await transitionOrderStatus(
    {
      orderId: "order_ord_001",
      orderStatus: "CANCELLED",
    },
    tx1
  );

  assert(cancelResult.order.orderStatus === "CANCELLED", "Order status successfully transitioned to CANCELLED");

  // 4. Verify Automatic Reversal: usageCount restored to 0, redemption row removed
  const couponAfterCancel = store1.coupons.find((c) => c.id === "cpn_rev_001");
  assert(couponAfterCancel?.usageCount === 0, "Coupon usageCount restored from 1 back to 0 upon order cancellation");
  assert(store1.redemptions.length === 0, "CouponRedemption audit record completely deleted upon cancellation");

  // 5. Subsequent Order Reuse: Customer places Order 2 with the same coupon
  console.log(`\n ${colors.dim}--> Placing subsequent Order 2 with freed coupon...${colors.reset}`);
  const order2: MockOrder = {
    id: "order_ord_002",
    orderNumber: "TMS-2026-9002",
    customerName: "Tariq Mahmood",
    phone: "923001234567",
    email: "tariq@example.com",
    city: "Lahore",
    address: "Model Town Block B",
    orderStatus: "PENDING_CONFIRMATION",
    paymentStatus: "PENDING",
    paymentMethod: "COD",
    subtotal: 3000,
    shippingFee: 200,
    discountAmount: 300,
    total: 2900,
    paidAmount: 0,
    dueAmount: 2900,
    trackingNote: null,
    deliveryNotes: null,
    deliveryFeeType: "MANUAL",
    couponId: "cpn_rev_001",
    couponCode: "SEHAT300",
    items: [],
  };
  store1.orders.push(order2);

  const reuseRedemption = await recordCouponRedemption(
    {
      couponId: "cpn_rev_001",
      orderId: "order_ord_002",
      phone: "03001234567",
      discountAmount: 300,
      orderTotal: 2900,
    },
    tx1
  );

  const couponAfterOrder2 = store1.coupons.find((c) => c.id === "cpn_rev_001");
  assert(Boolean(reuseRedemption?.id), "Subsequent order redemption succeeded without error");
  assert(couponAfterOrder2?.usageCount === 1, "Coupon usageCount incremented back to 1 for Order 2");
  assert(store1.redemptions.length === 1, "Single active CouponRedemption row now references Order 2");
  assert(store1.redemptions[0].orderId === "order_ord_002", "CouponRedemption correctly associated with Order 2");


  // ===========================================================================
  // TEST SUITE 2: Atomic Concurrency & Last-Use Race Protection
  // ===========================================================================
  suiteHeader("TEST SUITE 2: Atomic Concurrency & Last-Use Race Protection");

  const store2 = seedStore();
  // Create a coupon with usageLimit = 1 and usageCount = 0
  const limitedCoupon: MockCoupon = {
    id: "cpn_race_last_001",
    code: "FLASH1ONLY",
    description: "Exclusive Single-Use Flash Voucher",
    scope: "PRODUCTS",
    discountType: "FIXED",
    discountValue: 500,
    minSubtotal: 1000,
    maxDiscountCap: null,
    targetCategoryId: null,
    targetProductIds: null,
    startDate: null,
    endDate: null,
    usageLimit: 1, // Only 1 total redemption allowed across the entire store!
    usageCount: 0,
    perUserLimit: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store2.coupons.push(limitedCoupon);

  console.log(` ${colors.dim}--> Spawning 2 simultaneous parallel transactions competing for the last use...${colors.reset}`);

  // Two simultaneous orders attempting to grab the single last use concurrently
  const parallelAttempts = await Promise.allSettled([
    executeMockTx(store2, async (tx) => {
      return await recordCouponRedemption(
        {
          couponId: "cpn_race_last_001",
          orderId: "order_concurrent_A",
          phone: "03001111111",
          discountAmount: 500,
          orderTotal: 2500,
        },
        tx
      );
    }),
    executeMockTx(store2, async (tx) => {
      return await recordCouponRedemption(
        {
          couponId: "cpn_race_last_001",
          orderId: "order_concurrent_B",
          phone: "03002222222",
          discountAmount: 500,
          orderTotal: 2500,
        },
        tx
      );
    }),
  ]);

  const fulfilledAttempts = parallelAttempts.filter((r) => r.status === "fulfilled");
  const rejectedAttempts = parallelAttempts.filter((r) => r.status === "rejected");

  assert(
    fulfilledAttempts.length === 1,
    `Race Condition Blocked: Exactly ONE concurrent transaction succeeded (Got ${fulfilledAttempts.length})`
  );
  assert(
    rejectedAttempts.length === 1,
    `Race Condition Blocked: Exactly ONE concurrent transaction failed (Got ${rejectedAttempts.length})`
  );

  const rejectionError = (rejectedAttempts[0] as PromiseRejectedResult).reason;
  assert(
    rejectionError instanceof Error &&
      rejectionError.message.includes("Coupon usage limit has been reached"),
    "Rejected attempt threw authoritative error: 'Coupon usage limit has been reached or coupon is inactive.'"
  );

  const raceCoupon = store2.coupons.find((c) => c.id === "cpn_race_last_001");
  assert(
    raceCoupon?.usageCount === 1,
    `Atomic Integrity: Coupon usageCount is exactly 1 (Got ${raceCoupon?.usageCount}) — Never over-redeemed to 2!`
  );

  const totalRedemptionsForRaceCoupon = store2.redemptions.filter(
    (r) => r.couponId === "cpn_race_last_001"
  );
  assert(
    totalRedemptionsForRaceCoupon.length === 1,
    "Exactly 1 redemption audit record was persisted in database"
  );

  // ---------------------------------------------------------------------------
  // Sub-Test 2B: High-Concurrency Burst (5 threads competing for 2 slots)
  // ---------------------------------------------------------------------------
  console.log(`\n ${colors.dim}--> Stress Test: 5 simultaneous transactions competing for usageLimit = 2...${colors.reset}`);
  const multiCoupon: MockCoupon = {
    id: "cpn_race_multi_002",
    code: "BURST2SLOTS",
    description: "2 slots available for 5 customers",
    scope: "PRODUCTS",
    discountType: "FIXED",
    discountValue: 100,
    minSubtotal: 500,
    maxDiscountCap: null,
    targetCategoryId: null,
    targetProductIds: null,
    startDate: null,
    endDate: null,
    usageLimit: 2, // Exactly 2 slots available
    usageCount: 0,
    perUserLimit: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store2.coupons.push(multiCoupon);

  const burstResults = await Promise.allSettled(
    [1, 2, 3, 4, 5].map((i) =>
      executeMockTx(store2, async (tx) => {
        return await recordCouponRedemption(
          {
            couponId: "cpn_race_multi_002",
            orderId: `order_burst_${i}`,
            phone: `0300999000${i}`,
            discountAmount: 100,
            orderTotal: 1000,
          },
          tx
        );
      })
    )
  );

  const burstFulfilled = burstResults.filter((r) => r.status === "fulfilled");
  const burstRejected = burstResults.filter((r) => r.status === "rejected");

  assert(
    burstFulfilled.length === 2,
    `Burst concurrency: Exactly 2 out of 5 succeeded (Got ${burstFulfilled.length})`
  );
  assert(
    burstRejected.length === 3,
    `Burst concurrency: Exactly 3 out of 5 rejected with limit error (Got ${burstRejected.length})`
  );

  const burstCoupon = store2.coupons.find((c) => c.id === "cpn_race_multi_002");
  assert(
    burstCoupon?.usageCount === 2,
    `Burst concurrency: Final usageCount matches exact usageLimit of 2 (Got ${burstCoupon?.usageCount})`
  );

  // ---------------------------------------------------------------------------
  // Sub-Test 2C: Inactive Coupon Immediately Blocked by Atomic WHERE Clause
  // ---------------------------------------------------------------------------
  const inactiveCoupon: MockCoupon = {
    id: "cpn_inactive_003",
    code: "INACTIVE99",
    description: "Deactivated coupon",
    scope: "PRODUCTS",
    discountType: "FIXED",
    discountValue: 100,
    minSubtotal: 500,
    maxDiscountCap: null,
    targetCategoryId: null,
    targetProductIds: null,
    startDate: null,
    endDate: null,
    usageLimit: 10,
    usageCount: 0,
    perUserLimit: 1,
    isActive: false, // Inactive!
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store2.coupons.push(inactiveCoupon);

  let inactiveCaught = false;
  try {
    await recordCouponRedemption(
      {
        couponId: "cpn_inactive_003",
        orderId: "order_inactive_attempt",
        discountAmount: 100,
      },
      createMockTransactionClient(store2)
    );
  } catch (err: any) {
    inactiveCaught = true;
    assert(
      err.message.includes("Coupon usage limit has been reached or coupon is inactive"),
      "Inactive coupon rejected by atomic update conditional WHERE"
    );
  }
  assert(inactiveCaught, "Redemption on deactivated coupon threw expected error");


  // ===========================================================================
  // TEST SUITE 3: Atomic Rollback on Reversal Failure
  // ===========================================================================
  suiteHeader("TEST SUITE 3: 100% Atomic Rollback on Downstream Reversal Failure");

  const store3 = seedStore();
  const tx3 = createMockTransactionClient(store3);

  // Seed active order with redeemed coupon
  await recordCouponRedemption(
    {
      couponId: "cpn_rev_001",
      orderId: "order_ord_001",
      phone: "03001234567",
      discountAmount: 300,
      orderTotal: 2900,
    },
    tx3
  );

  const initialCoupon = store3.coupons.find((c) => c.id === "cpn_rev_001");
  assert(initialCoupon?.usageCount === 1, "Order 1 coupon redemption active: usageCount = 1");
  assert(store3.redemptions.length === 1, "Order 1 coupon redemption record active in database");

  // Attempt order cancellation inside a transaction that encounters a catastrophic downstream failure
  console.log(`\n ${colors.dim}--> Triggering cancellation transaction with injected downstream failure...${colors.reset}`);
  let rollbackCaught = false;
  try {
    await executeMockTx(store3, async (tx) => {
      // 1. Order status transitions to CANCELLED (which calls reverseCouponRedemption)
      await transitionOrderStatus(
        {
          orderId: "order_ord_001",
          orderStatus: "CANCELLED",
          onTransition: async () => {
            // Simulated downstream external API failure (e.g., payment refund gateway timeout)
            throw new Error("Payment Gateway Timeout: Refund Webhook Failed 504 Gateway Error");
          },
        },
        tx
      );
    });
  } catch (err: any) {
    rollbackCaught = true;
    assert(
      err.message.includes("Payment Gateway Timeout"),
      "Downstream cancellation error was caught and propagated"
    );
  }

  assert(rollbackCaught, "Transaction aborted as expected");

  // Verify that ALL database modifications were reverted 100%:
  const rolledBackOrder = store3.orders.find((o) => o.id === "order_ord_001");
  const rolledBackCoupon = store3.coupons.find((c) => c.id === "cpn_rev_001");

  assert(
    rolledBackOrder?.orderStatus === "PENDING_CONFIRMATION",
    "Atomic Rollback: Order status was NOT changed to CANCELLED (reverted to PENDING_CONFIRMATION)"
  );
  assert(
    rolledBackCoupon?.usageCount === 1,
    "Atomic Rollback: Coupon usageCount was NOT decremented (reverted to 1)"
  );
  assert(
    store3.redemptions.length === 1,
    "Atomic Rollback: CouponRedemption record was NOT deleted (restored to database)"
  );
  assert(
    store3.redemptions[0].orderId === "order_ord_001",
    "Atomic Rollback: Redemption row remains fully bound to Order 1"
  );


  // ===========================================================================
  // TEST SUITE 4: Hijama, Consultation & Lifecycle Guards
  // ===========================================================================
  suiteHeader("TEST SUITE 4: Hijama, Consultation & Lifecycle Guards");

  const store4 = seedStore();
  const tx4 = createMockTransactionClient(store4);

  // 1. Hijama Booking Redemption & Reversal
  const hijamaCoupon: MockCoupon = {
    id: "cpn_hijama_001",
    code: "SUNNAH500",
    description: "Flat ₨ 500 off Hijama",
    scope: "HIJAMA",
    discountType: "FIXED",
    discountValue: 500,
    minSubtotal: null,
    maxDiscountCap: null,
    targetCategoryId: null,
    targetProductIds: null,
    startDate: null,
    endDate: null,
    usageLimit: 10,
    usageCount: 0,
    perUserLimit: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store4.coupons.push(hijamaCoupon);

  await recordCouponRedemption(
    {
      couponId: "cpn_hijama_001",
      hijamaBookingId: "hij_booking_777",
      phone: "03211234567",
      discountAmount: 500,
      orderTotal: 2000,
    },
    tx4
  );

  const hijamaCouponAfter = store4.coupons.find((c) => c.id === "cpn_hijama_001");
  assert(hijamaCouponAfter?.usageCount === 1, "Hijama coupon redemption recorded: usageCount = 1");

  const hijamaReversal = await reverseCouponRedemption(
    { hijamaBookingId: "hij_booking_777" },
    tx4
  );
  assert(hijamaReversal.reversed === true, "Hijama booking coupon reversal succeeded");
  assert(hijamaReversal.couponId === "cpn_hijama_001", "Hijama reversal returned correct couponId");
  assert(hijamaReversal.discountAmount === 500, "Hijama reversal returned correct discountAmount");

  const hijamaCouponFinal = store4.coupons.find((c) => c.id === "cpn_hijama_001");
  assert(hijamaCouponFinal?.usageCount === 0, "Hijama coupon usageCount restored to 0");

  // 2. Consultation Voucher Redemption & Reversal
  const consultCoupon: MockCoupon = {
    id: "cpn_consult_001",
    code: "TIBBIFREE",
    description: "100% Free Consultation",
    scope: "CONSULTATION",
    discountType: "FREE_SERVICE",
    discountValue: 1500,
    minSubtotal: null,
    maxDiscountCap: null,
    targetCategoryId: null,
    targetProductIds: null,
    startDate: null,
    endDate: null,
    usageLimit: 10,
    usageCount: 0,
    perUserLimit: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store4.coupons.push(consultCoupon);

  await recordCouponRedemption(
    {
      couponId: "cpn_consult_001",
      consultationId: "con_request_888",
      phone: "03219876543",
      discountAmount: 1500,
      orderTotal: 0,
    },
    tx4
  );

  const consultCouponAfter = store4.coupons.find((c) => c.id === "cpn_consult_001");
  assert(consultCouponAfter?.usageCount === 1, "Consultation voucher redemption recorded: usageCount = 1");

  const consultReversal = await reverseCouponRedemption(
    { consultationId: "con_request_888" },
    tx4
  );
  assert(consultReversal.reversed === true, "Consultation coupon reversal succeeded");
  assert(consultReversal.couponId === "cpn_consult_001", "Consultation reversal returned correct couponId");

  const consultCouponFinal = store4.coupons.find((c) => c.id === "cpn_consult_001");
  assert(consultCouponFinal?.usageCount === 0, "Consultation coupon usageCount restored to 0");

  // 3. Reversal Zero Floor Guarantee (GREATEST(0, usageCount - 1))
  console.log(`\n ${colors.dim}--> Testing zero-floor guarantee (decrementing 0 never yields negative)...${colors.reset}`);
  await tx4.$executeRaw`
    UPDATE "coupon"
    SET "usageCount" = GREATEST(0, "usageCount" - 1)
    WHERE "id" = 'cpn_consult_001'
  `;
  const zeroFloorCoupon = store4.coupons.find((c) => c.id === "cpn_consult_001");
  assert(zeroFloorCoupon?.usageCount === 0, "Zero Floor: usageCount remains 0 (does not become -1)");

  // 4. Graceful handling of empty or non-existent reverseCouponRedemption calls
  const emptyReversal = await reverseCouponRedemption({}, tx4);
  assert(emptyReversal.reversed === false, "Empty parameters safely return { reversed: false } without throwing");

  const nonExistentReversal = await reverseCouponRedemption({ orderId: "non_existent_ord_999" }, tx4);
  assert(nonExistentReversal.reversed === false, "Non-existent orderId safely returns { reversed: false } without throwing");

  // ===========================================================================
  // Summary & Final Verdict
  // ===========================================================================
  console.log("\n================================================================================");
  console.log(` ${colors.bold}📊 TEST RESULTS: ${colors.green}${passed} Passed${colors.reset}, ${failed > 0 ? `${colors.red}${failed} Failed` : `${colors.green}0 Failed`}${colors.reset}`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runCouponConcurrencyTestSuite().catch((err) => {
  console.error("Test execution failed with fatal error:", err);
  process.exit(1);
});
