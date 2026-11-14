/**
 * Comprehensive Test Harness for Milestone M1: One Order Pipeline
 *
 * Verifies:
 * 1. Phone number canonical normalization (Pakistani 03xx -> 923xx, international, min lengths, null checks)
 * 2. Backward compatibility of re-exported normalizePhoneNumber in lib/coupons.ts
 * 3. Status transition to DISPATCHED commits inventory (atomic decrement, SALE movement)
 * 4. Status transition to CANCELLED releases inventory (atomic decrement, RELEASE movement)
 * 5. Status transition to CANCELLED after DISPATCHED returns stock (atomic increment, RECEIVE movement)
 * 6. Financial recalculation upon shippingFee update (subtotal, shippingFee, discount, total, dueAmount)
 * 7. 100% Atomic Rollback verification: any failure inside transitionOrderStatus reverts all changes
 * 8. Order Number resolution & downstream transactional composition (txClient)
 * 9. Finite State Machine (FSM) transition matrix: illegal transitions rejected (e.g. CANCELLED -> DISPATCHED)
 * 10. Financial consistency: automatic paymentStatus reconciliation & 2-decimal floating point rounding
 */

import { normalizePhoneNumber } from "../lib/phone";
import { normalizePhoneNumber as couponNormalizePhone } from "../lib/coupons";
import {
  transitionOrderStatus,
  OrderTransitionInput,
  OrderStatus,
  PaymentStatus,
  VALID_STATUS_TRANSITIONS,
  roundCurrency,
} from "../lib/orders";
import { Prisma } from "@prisma/client";

// ANSI colors for clean test output
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
  console.log(`\n${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ▶ ${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);
}

// -----------------------------------------------------------------------------
// In-Memory Transactional Store & Prisma Transaction Client Simulator
// -----------------------------------------------------------------------------
interface MockStore {
  orders: any[];
  orderItems: any[];
  productSizes: any[];
  stockMovements: any[];
}

function createInitialStore(): MockStore {
  const initialProductSize = {
    id: "size_test_001",
    productId: "prod_test_001",
    name: "Standard Pack",
    weight: "250g",
    price: 1500,
    stockOnHand: 50,
    stockReserved: 2, // 2 units already reserved for this order
    costPrice: 800,
    isActive: true,
    unit: { id: "unit_1", name: "Grams", abbreviation: "g" },
  };

  const initialOrderItem = {
    id: "item_test_001",
    orderId: "order_test_001",
    productId: "prod_test_001",
    productSizeId: "size_test_001",
    productName: "Majoon Shabab Awar",
    sizeName: "Standard Pack",
    sizeWeight: "250g",
    price: 1500,
    quantity: 2,
    total: 3000,
    stockState: "RESERVED",
    productSize: { ...initialProductSize },
  };

  const initialOrder = {
    id: "order_test_001",
    orderNumber: "TMS-2026-1001",
    customerName: "Ahmad Raza",
    phone: "923001234567",
    email: "ahmad@example.com",
    city: "Lahore",
    address: "Gulberg III",
    orderStatus: "PENDING_CONFIRMATION",
    paymentStatus: "PENDING",
    paymentMethod: "COD",
    subtotal: 3000,
    shippingFee: 0,
    discountAmount: 200, // Coupon discount of ₨ 200
    total: 2800, // 3000 - 200
    paidAmount: 0,
    dueAmount: 2800,
    trackingNote: null,
    deliveryNotes: null,
    deliveryFeeType: "MANUAL",
    items: [{ ...initialOrderItem }],
  };

  return {
    orders: [initialOrder],
    orderItems: [initialOrderItem],
    productSizes: [initialProductSize],
    stockMovements: [],
  };
}

function createMockTransactionClient(store: MockStore): Prisma.TransactionClient {
  return {
    order: {
      findFirst: async ({ where }: any) => {
        return store.orders.find((o) => {
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
        })
          ? JSON.parse(
              JSON.stringify(
                store.orders.find((o) => {
                  if (where.OR) {
                    return where.OR.some(
                      (cond: any) =>
                        (cond.id && o.id === cond.id) ||
                        (cond.orderNumber && o.orderNumber === cond.orderNumber)
                    );
                  }
                  return true;
                })
              )
            )
          : null;
      },
      findUnique: async ({ where }: any) => {
        const order = store.orders.find((o) => o.id === where.id);
        return order ? JSON.parse(JSON.stringify(order)) : null;
      },
      update: async ({ where, data }: any) => {
        const idx = store.orders.findIndex((o) => o.id === where.id);
        if (idx === -1) throw new Error("Order not found in mock store.");
        const updated = {
          ...store.orders[idx],
          ...data,
          items: store.orderItems
            .filter((item) => item.orderId === where.id)
            .map((item) => ({
              ...item,
              productSize: store.productSizes.find((s) => s.id === item.productSizeId),
            })),
        };
        store.orders[idx] = updated;
        return JSON.parse(JSON.stringify(updated));
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

        let stockOnHand = current.stockOnHand;
        if (data.stockOnHand !== undefined) {
          if (typeof data.stockOnHand === "object" && data.stockOnHand !== null) {
            if ("decrement" in data.stockOnHand) {
              stockOnHand = (stockOnHand || 0) - (data.stockOnHand.decrement || 0);
            } else if ("increment" in data.stockOnHand) {
              stockOnHand = (stockOnHand || 0) + (data.stockOnHand.increment || 0);
            }
          } else {
            stockOnHand = data.stockOnHand;
          }
        }

        let stockReserved = current.stockReserved;
        if (data.stockReserved !== undefined) {
          if (typeof data.stockReserved === "object" && data.stockReserved !== null) {
            if ("decrement" in data.stockReserved) {
              stockReserved = (stockReserved || 0) - (data.stockReserved.decrement || 0);
            } else if ("increment" in data.stockReserved) {
              stockReserved = (stockReserved || 0) + (data.stockReserved.increment || 0);
            }
          } else {
            stockReserved = data.stockReserved;
          }
        }

        store.productSizes[idx] = {
          ...current,
          ...data,
          stockOnHand,
          stockReserved,
        };
        return JSON.parse(JSON.stringify(store.productSizes[idx]));
      },
    },
    orderItem: {
      update: async ({ where, data }: any) => {
        const idx = store.orderItems.findIndex((i) => i.id === where.id);
        if (idx === -1) throw new Error("OrderItem not found in mock store.");
        store.orderItems[idx] = { ...store.orderItems[idx], ...data };
        return JSON.parse(JSON.stringify(store.orderItems[idx]));
      },
    },
    stockMovement: {
      create: async ({ data }: any) => {
        const movement = {
          id: `mov_${Date.now()}_${Math.random()}`,
          createdAt: new Date(),
          ...data,
        };
        store.stockMovements.push(movement);
        return JSON.parse(JSON.stringify(movement));
      },
      findMany: async ({ where }: any) => {
        let results = [...store.stockMovements];
        if (where?.orderId) results = results.filter((m) => m.orderId === where.orderId);
        if (where?.type) results = results.filter((m) => m.type === where.type);
        return JSON.parse(JSON.stringify(results));
      },
    },
  } as unknown as Prisma.TransactionClient;
}

/**
 * Executes a simulated ACID transaction over MockStore with automatic rollback on error.
 */
async function executeMockTransaction<T>(
  store: MockStore,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const snapshot: MockStore = JSON.parse(JSON.stringify(store));
  const tx = createMockTransactionClient(store);
  try {
    const result = await fn(tx);
    return result;
  } catch (error) {
    // 100% Atomic Rollback
    store.orders = snapshot.orders;
    store.orderItems = snapshot.orderItems;
    store.productSizes = snapshot.productSizes;
    store.stockMovements = snapshot.stockMovements;
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Test Execution Suite
// -----------------------------------------------------------------------------
async function runOrderPipelineTestSuite() {
  console.log("================================================================================");
  console.log(" 📦 TAMEER-E-SEHAT (TMS) - MILESTONE M1: ONE ORDER PIPELINE TEST HARNESS");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // SUITE 1: Phone Normalization Utility
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 1: Phone Normalization (lib/phone.ts & lib/coupons.ts re-export)");

  // 1. Pakistani local mobile format (03xx -> 923xx)
  assert(
    normalizePhoneNumber("03001234567") === "923001234567",
    "Pakistani local 11-digit (03001234567) normalizes to international code 923001234567"
  );
  assert(
    normalizePhoneNumber("03219876543") === "923219876543",
    "Pakistani local 11-digit (03219876543) normalizes to international code 923219876543"
  );

  // 2. Formatted with dashes, spaces, and punctuation
  assert(
    normalizePhoneNumber("0300-1234567") === "923001234567",
    "Dashes stripped: 0300-1234567 -> 923001234567"
  );
  assert(
    normalizePhoneNumber(" 0300 123 4567 ") === "923001234567",
    "Spaces stripped and trimmed: ' 0300 123 4567 ' -> 923001234567"
  );

  // 3. International with plus or already prefixed
  assert(
    normalizePhoneNumber("+923001234567") === "923001234567",
    "Plus prefix stripped: +923001234567 -> 923001234567"
  );
  assert(
    normalizePhoneNumber("+92 300 1234567") === "923001234567",
    "Formatted international: +92 300 1234567 -> 923001234567"
  );
  assert(
    normalizePhoneNumber("923001234567") === "923001234567",
    "Canonical digits preserved: 923001234567 -> 923001234567"
  );

  // 4. Other valid international numbers
  assert(
    normalizePhoneNumber("+1 (555) 234-5678") === "15552345678",
    "Valid US number normalized to digits: +1 (555) 234-5678 -> 15552345678"
  );

  // 5. Invalid lengths and non-digit inputs
  assert(
    normalizePhoneNumber("12345") === null,
    "Rejects numbers with fewer than 7 digits (12345 -> null)"
  );
  assert(
    normalizePhoneNumber("") === null,
    "Rejects empty string ('' -> null)"
  );
  assert(
    normalizePhoneNumber("   ") === null,
    "Rejects whitespace-only string -> null"
  );
  assert(
    normalizePhoneNumber(null) === null,
    "Rejects null -> null"
  );
  assert(
    normalizePhoneNumber(undefined) === null,
    "Rejects undefined -> null"
  );
  assert(
    normalizePhoneNumber("phone-abc") === null,
    "Rejects purely alphabetic string -> null"
  );

  // 6. Backward compatibility re-export in lib/coupons.ts
  assert(
    couponNormalizePhone("03001234567") === "923001234567",
    "Re-exported normalizePhoneNumber in lib/coupons produces identical result to lib/phone"
  );
  assert(
    couponNormalizePhone(null) === null,
    "Re-exported normalizePhoneNumber handles null identically"
  );

  // ---------------------------------------------------------------------------
  // SUITE 2: Status Transition to CONFIRMED & Shipping Fee Recalculation
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 2: Transition to CONFIRMED with Shipping Fee Recalculation");

  const store2 = createInitialStore();
  const tx2 = createMockTransactionClient(store2);

  // Transition to CONFIRMED and add ₨ 250 shipping fee
  const resultConfirmed = await transitionOrderStatus(
    {
      orderId: "order_test_001",
      orderStatus: "CONFIRMED",
      shippingFee: 250,
      deliveryNotes: "Call customer before dispatch",
      staffUserId: "staff_admin_1",
    },
    tx2
  );

  assert(
    resultConfirmed.order.orderStatus === "CONFIRMED",
    "Order status updated to CONFIRMED"
  );
  assert(
    resultConfirmed.previousStatus === "PENDING_CONFIRMATION",
    "Previous order status correctly reported as PENDING_CONFIRMATION"
  );
  assert(
    resultConfirmed.statusChanged === true,
    "statusChanged flag reported as true"
  );
  assert(
    resultConfirmed.order.shippingFee === 250,
    "Shipping fee updated to ₨ 250",
    `shippingFee = ${resultConfirmed.order.shippingFee}`
  );
  assert(
    resultConfirmed.order.total === 3050,
    "Total correctly recalculated: subtotal (3000) - coupon (200) + shippingFee (250) = 3050",
    `total = ${resultConfirmed.order.total}`
  );
  assert(
    resultConfirmed.order.dueAmount === 3050,
    "Due amount recalculated to match total for unpaid COD order",
    `dueAmount = ${resultConfirmed.order.dueAmount}`
  );
  assert(
    store2.productSizes[0].stockOnHand === 50 && store2.productSizes[0].stockReserved === 2,
    "Stock remains in reserved state (not committed on CONFIRMED)"
  );
  assert(
    store2.stockMovements.length === 0,
    "No stock movement created during CONFIRMED transition"
  );

  // ---------------------------------------------------------------------------
  // SUITE 3: Status Transition to DISPATCHED (Physical Stock Commitment)
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 3: Transition to DISPATCHED (Physical Stock Commitment)");

  const store3 = createInitialStore();
  const tx3 = createMockTransactionClient(store3);

  // Transition from PENDING_CONFIRMATION -> DISPATCHED
  const resultDispatched = await transitionOrderStatus(
    {
      orderId: "order_test_001",
      orderStatus: "DISPATCHED",
      trackingNote: "TCS-TRACKING-987654",
      staffUserId: "staff_admin_1",
    },
    tx3
  );

  assert(
    resultDispatched.order.orderStatus === "DISPATCHED",
    "Order status transitioned to DISPATCHED"
  );
  assert(
    resultDispatched.order.trackingNote === "TCS-TRACKING-987654",
    "Tracking note stored on order"
  );

  // Verify physical inventory reduction (atomic decrement)
  const sizeAfterDispatch = store3.productSizes[0];
  assert(
    sizeAfterDispatch.stockOnHand === 48,
    "stockOnHand physically decremented from 50 to 48 (50 - 2)",
    `stockOnHand = ${sizeAfterDispatch.stockOnHand}`
  );
  assert(
    sizeAfterDispatch.stockReserved === 0,
    "stockReserved decremented from 2 to 0 (reservation consumed)",
    `stockReserved = ${sizeAfterDispatch.stockReserved}`
  );

  // Verify OrderItem state changed to COMMITTED
  const orderItemAfterDispatch = store3.orderItems[0];
  assert(
    orderItemAfterDispatch.stockState === "COMMITTED",
    "OrderItem stockState updated from RESERVED to COMMITTED"
  );

  // Verify StockMovement audit log
  assert(
    store3.stockMovements.length === 1,
    "StockMovement audit entry created in ledger"
  );
  const dispatchMovement = store3.stockMovements[0];
  assert(
    dispatchMovement.type === "SALE",
    "StockMovement type is SALE"
  );
  assert(
    dispatchMovement.quantity === -2,
    "StockMovement quantity is -2",
    `quantity = ${dispatchMovement.quantity}`
  );
  assert(
    dispatchMovement.orderId === "order_test_001",
    "StockMovement references the dispatched orderId"
  );
  assert(
    dispatchMovement.onHandAfter === 48 && dispatchMovement.reservedAfter === 0,
    "StockMovement accurately captures post-dispatch onHand and reserved levels"
  );

  // Idempotency: Repeating DISPATCHED transition should not double-deduct stock
  await transitionOrderStatus(
    {
      orderId: "order_test_001",
      orderStatus: "DISPATCHED",
      staffUserId: "staff_admin_1",
    },
    tx3
  );
  assert(
    store3.productSizes[0].stockOnHand === 48,
    "Idempotency verified: re-transitioning to DISPATCHED does not double-deduct stockOnHand"
  );

  // ---------------------------------------------------------------------------
  // SUITE 4: Status Transition to CANCELLED (Reservation Release)
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 4: Transition to CANCELLED (Reservation Release)");

  const store4 = createInitialStore();
  const tx4 = createMockTransactionClient(store4);

  // Transition from PENDING_CONFIRMATION -> CANCELLED
  const resultCancelled = await transitionOrderStatus(
    {
      orderId: "order_test_001",
      orderStatus: "CANCELLED",
      staffUserId: "staff_admin_1",
    },
    tx4
  );

  assert(
    resultCancelled.order.orderStatus === "CANCELLED",
    "Order status updated to CANCELLED"
  );

  const sizeAfterCancel = store4.productSizes[0];
  assert(
    sizeAfterCancel.stockOnHand === 50,
    "stockOnHand remains intact at 50 (reservation cancelled before dispatch)",
    `stockOnHand = ${sizeAfterCancel.stockOnHand}`
  );
  assert(
    sizeAfterCancel.stockReserved === 0,
    "stockReserved released back to 0 (2 -> 0)",
    `stockReserved = ${sizeAfterCancel.stockReserved}`
  );

  const orderItemAfterCancel = store4.orderItems[0];
  assert(
    orderItemAfterCancel.stockState === "RELEASED",
    "OrderItem stockState updated from RESERVED to RELEASED"
  );

  assert(
    store4.stockMovements.length === 1,
    "StockMovement audit entry created for release"
  );
  const releaseMovement = store4.stockMovements[0];
  assert(
    releaseMovement.type === "RELEASE",
    "StockMovement type is RELEASE"
  );
  assert(
    releaseMovement.quantity === 2,
    "StockMovement quantity is +2 for reservation release"
  );

  // ---------------------------------------------------------------------------
  // SUITE 5: Status Transition to CANCELLED After DISPATCHED (Restock Return)
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 5: Transition to CANCELLED After DISPATCHED (Restock Return)");

  const store5 = createInitialStore();
  const tx5 = createMockTransactionClient(store5);

  // First dispatch
  await transitionOrderStatus(
    {
      orderId: "order_test_001",
      orderStatus: "DISPATCHED",
      staffUserId: "staff_admin_1",
    },
    tx5
  );
  assert(
    store5.productSizes[0].stockOnHand === 48,
    "Baseline: stockOnHand reduced to 48 on dispatch"
  );

  // Now cancel the already dispatched order (e.g. shipment returned)
  await transitionOrderStatus(
    {
      orderId: "order_test_001",
      orderStatus: "CANCELLED",
      staffUserId: "staff_admin_1",
    },
    tx5
  );

  assert(
    store5.productSizes[0].stockOnHand === 50,
    "Returned shipment restocked: stockOnHand restored from 48 back to 50",
    `stockOnHand = ${store5.productSizes[0].stockOnHand}`
  );
  assert(
    store5.orderItems[0].stockState === "RELEASED",
    "OrderItem stockState updated to RELEASED upon return"
  );

  const restockMovement = store5.stockMovements.find((m) => m.type === "RECEIVE");
  assert(
    restockMovement !== undefined && restockMovement.quantity === 2,
    "RECEIVE stock movement logged in ledger for returned order restocking"
  );

  // ---------------------------------------------------------------------------
  // SUITE 6: 100% Atomic Rollback on Failure
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 6: 100% Atomic Rollback on Failure");

  const store6 = createInitialStore();

  // Test 1: Simulated failure inside onTransition lifecycle hook
  let hookErrorCaught = false;
  try {
    await executeMockTransaction(store6, async (tx) => {
      return await transitionOrderStatus(
        {
          orderId: "order_test_001",
          orderStatus: "DISPATCHED",
          staffUserId: "staff_admin_1",
          onTransition: async () => {
            throw new Error("Simulated failure in downstream coupon reversal or ledger hook");
          },
        },
        tx
      );
    });
  } catch (err: any) {
    hookErrorCaught = true;
    assert(
      err.message.includes("Simulated failure"),
      "Transaction aborted when downstream hook threw error",
      err.message
    );
  }

  assert(hookErrorCaught, "Expected downstream hook failure was thrown and intercepted");

  // Verify that rollback is 100% COMPLETE
  assert(
    store6.orders[0].orderStatus === "PENDING_CONFIRMATION",
    "Atomic Rollback: Order status was NOT changed to DISPATCHED (reverted to PENDING_CONFIRMATION)",
    `orderStatus = ${store6.orders[0].orderStatus}`
  );
  assert(
    store6.productSizes[0].stockOnHand === 50,
    "Atomic Rollback: stockOnHand was NOT decremented (reverted to 50)",
    `stockOnHand = ${store6.productSizes[0].stockOnHand}`
  );
  assert(
    store6.productSizes[0].stockReserved === 2,
    "Atomic Rollback: stockReserved was NOT cleared (reverted to 2)",
    `stockReserved = ${store6.productSizes[0].stockReserved}`
  );
  assert(
    store6.orderItems[0].stockState === "RESERVED",
    "Atomic Rollback: OrderItem stockState was NOT changed to COMMITTED (reverted to RESERVED)",
    `stockState = ${store6.orderItems[0].stockState}`
  );
  assert(
    store6.stockMovements.length === 0,
    "Atomic Rollback: Zero StockMovement audit rows persisted (all rolled back)",
    `stockMovements count = ${store6.stockMovements.length}`
  );

  // Test 2: Order Not Found Error Rollback
  let notFoundErrorCaught = false;
  try {
    await executeMockTransaction(store6, async (tx) => {
      return await transitionOrderStatus(
        {
          orderId: "non_existent_order_cuid",
          orderStatus: "DISPATCHED",
        },
        tx
      );
    });
  } catch (err: any) {
    notFoundErrorCaught = true;
    assert(
      err.message.includes("Order not found"),
      "transitionOrderStatus rejects non-existent order with descriptive error",
      err.message
    );
  }
  assert(notFoundErrorCaught, "Non-existent order threw expected error");

  // ---------------------------------------------------------------------------
  // SUITE 7: Order Number Identifier Resolution & Downstream Interface Contract
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 7: Order Number Resolution & Downstream Contract");

  const store7 = createInitialStore();
  const tx7 = createMockTransactionClient(store7);

  // Transition using readable orderNumber "TMS-2026-1001" instead of cuid "order_test_001"
  const resultByNumber = await transitionOrderStatus(
    {
      orderId: "TMS-2026-1001",
      orderStatus: "CONFIRMED",
      paymentStatus: "PAID",
      staffUserId: "staff_admin_1",
    },
    tx7
  );

  assert(
    resultByNumber.order.id === "order_test_001",
    "Order successfully resolved by readable orderNumber (TMS-2026-1001)"
  );
  assert(
    resultByNumber.order.paymentStatus === "PAID",
    "PaymentStatus updated to PAID"
  );

  // ---------------------------------------------------------------------------
  // SUITE 8: State Machine (FSM) Validation & Illegal Transitions
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 8: State Machine (FSM) Validation & Illegal Transitions");

  // 1. CANCELLED is terminal: CANCELLED -> DISPATCHED rejected
  const storeFsm1 = createInitialStore();
  storeFsm1.orders[0].orderStatus = "CANCELLED";
  const txFsm1 = createMockTransactionClient(storeFsm1);

  let errCancelledToDispatched = false;
  try {
    await transitionOrderStatus(
      { orderId: "order_test_001", orderStatus: "DISPATCHED" },
      txFsm1
    );
  } catch (err: any) {
    errCancelledToDispatched = true;
    assert(
      err.message === "Illegal state transition from CANCELLED to DISPATCHED",
      "CANCELLED -> DISPATCHED correctly throws 'Illegal state transition from CANCELLED to DISPATCHED'",
      err.message
    );
  }
  assert(errCancelledToDispatched, "CANCELLED -> DISPATCHED was prevented");

  // 2. CANCELLED -> CONFIRMED rejected
  let errCancelledToConfirmed = false;
  try {
    await transitionOrderStatus(
      { orderId: "order_test_001", orderStatus: "CONFIRMED" },
      txFsm1
    );
  } catch (err: any) {
    errCancelledToConfirmed = true;
    assert(
      err.message === "Illegal state transition from CANCELLED to CONFIRMED",
      "CANCELLED -> CONFIRMED correctly throws 'Illegal state transition from CANCELLED to CONFIRMED'",
      err.message
    );
  }
  assert(errCancelledToConfirmed, "CANCELLED -> CONFIRMED was prevented");

  // 3. DELIVERED backward transitions rejected
  const storeFsm2 = createInitialStore();
  storeFsm2.orders[0].orderStatus = "DELIVERED";
  const txFsm2 = createMockTransactionClient(storeFsm2);

  let errDeliveredToPending = false;
  try {
    await transitionOrderStatus(
      { orderId: "order_test_001", orderStatus: "PENDING_CONFIRMATION" },
      txFsm2
    );
  } catch (err: any) {
    errDeliveredToPending = true;
    assert(
      err.message === "Illegal state transition from DELIVERED to PENDING_CONFIRMATION",
      "DELIVERED -> PENDING_CONFIRMATION throws illegal transition error",
      err.message
    );
  }
  assert(errDeliveredToPending, "DELIVERED -> PENDING_CONFIRMATION was prevented");

  let errDeliveredToDispatched = false;
  try {
    await transitionOrderStatus(
      { orderId: "order_test_001", orderStatus: "DISPATCHED" },
      txFsm2
    );
  } catch (err: any) {
    errDeliveredToDispatched = true;
    assert(
      err.message === "Illegal state transition from DELIVERED to DISPATCHED",
      "DELIVERED -> DISPATCHED throws illegal transition error",
      err.message
    );
  }
  assert(errDeliveredToDispatched, "DELIVERED -> DISPATCHED was prevented");

  // 4. DELIVERED -> CANCELLED allowed (e.g. customer return / refund)
  const resultDeliveredToCancelled = await transitionOrderStatus(
    { orderId: "order_test_001", orderStatus: "CANCELLED" },
    txFsm2
  );
  assert(
    resultDeliveredToCancelled.order.orderStatus === "CANCELLED",
    "DELIVERED -> CANCELLED is allowed for post-delivery returns/refunds"
  );

  // ---------------------------------------------------------------------------
  // SUITE 9: Financial Consistency, Reconciliation & Floating Point Rounding
  // ---------------------------------------------------------------------------
  suiteHeader("SUITE 9: Financial Consistency & Floating Point Rounding");

  // 1. Automatic PaymentStatus Reconciliation: Shipping fee increase turns PAID into PARTIAL
  const storeFin1 = createInitialStore();
  // Set up an order that is fully paid
  storeFin1.orders[0].subtotal = 2500;
  storeFin1.orders[0].discountAmount = 0;
  storeFin1.orders[0].shippingFee = 0;
  storeFin1.orders[0].total = 2500;
  storeFin1.orders[0].paidAmount = 2500;
  storeFin1.orders[0].dueAmount = 0;
  storeFin1.orders[0].paymentStatus = "PAID";
  const txFin1 = createMockTransactionClient(storeFin1);

  // Admin updates shippingFee to ₨ 350
  const resultShippingIncrease = await transitionOrderStatus(
    {
      orderId: "order_test_001",
      shippingFee: 350,
    },
    txFin1
  );

  assert(
    resultShippingIncrease.order.shippingFee === 350,
    "Shipping fee updated to 350"
  );
  assert(
    resultShippingIncrease.order.total === 2850,
    "Total increased to 2850 (2500 + 350)"
  );
  assert(
    resultShippingIncrease.order.dueAmount === 350,
    "dueAmount increased to 350 (2850 - 2500 paid)"
  );
  assert(
    resultShippingIncrease.order.paymentStatus === "PARTIAL",
    "Financial Reconciliation: Order paymentStatus automatically updated from PAID to PARTIAL",
    `paymentStatus = ${resultShippingIncrease.order.paymentStatus}`
  );

  // 2. Full payment reconciliation
  storeFin1.orders[0].paidAmount = 2850; // Customer pays the 350 balance
  const resultFullPayment = await transitionOrderStatus(
    {
      orderId: "order_test_001",
      paymentStatus: "PAID",
    },
    txFin1
  );
  assert(
    resultFullPayment.order.dueAmount === 0,
    "dueAmount is 0 when fully paid"
  );
  assert(
    resultFullPayment.order.paymentStatus === "PAID",
    "Financial Reconciliation: Order paymentStatus set to PAID when fully settled"
  );

  // 3. Negative & non-finite shipping fee validation
  let errNegativeShipping = false;
  try {
    await transitionOrderStatus(
      { orderId: "order_test_001", shippingFee: -50 },
      txFin1
    );
  } catch (err: any) {
    errNegativeShipping = true;
    assert(
      err.message.includes("Invalid shippingFee: must be a non-negative finite number"),
      "Negative shippingFee (-50) correctly throws validation error",
      err.message
    );
  }
  assert(errNegativeShipping, "Negative shipping fee rejected");

  let errNanShipping = false;
  try {
    await transitionOrderStatus(
      { orderId: "order_test_001", shippingFee: NaN },
      txFin1
    );
  } catch (err: any) {
    errNanShipping = true;
    assert(
      err.message.includes("Invalid shippingFee: must be a non-negative finite number"),
      "NaN shippingFee correctly throws validation error",
      err.message
    );
  }
  assert(errNanShipping, "NaN shipping fee rejected");

  // 4. Floating Point Rounding Accuracy
  assert(
    roundCurrency(0.1 + 0.2) === 0.3,
    "roundCurrency(0.1 + 0.2) returns exactly 0.3 (avoids 0.30000000000000004)"
  );
  assert(
    roundCurrency(14.555) === 14.56,
    "roundCurrency(14.555) rounds to 2 decimal places: 14.56"
  );
  assert(
    roundCurrency(100.105) === 100.11,
    "roundCurrency(100.105) rounds to 2 decimal places: 100.11"
  );

  // Fractional cent addition in order transition
  storeFin1.orders[0].subtotal = 100.10;
  storeFin1.orders[0].discountAmount = 0;
  storeFin1.orders[0].paidAmount = 0;
  const resultFloatOrder = await transitionOrderStatus(
    {
      orderId: "order_test_001",
      shippingFee: 200.20,
    },
    txFin1
  );
  assert(
    resultFloatOrder.order.total === 300.30,
    "Float addition: 100.10 + 200.20 accurately rounds to 300.30",
    `total = ${resultFloatOrder.order.total}`
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(` 📊 SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runOrderPipelineTestSuite().catch((err) => {
  console.error("Unhandled test harness exception:", err);
  process.exit(1);
});
