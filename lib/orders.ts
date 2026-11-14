import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { commitShipmentForOrder, releaseReservationForOrder } from "@/lib/inventory";
import { reverseCouponRedemption } from "@/lib/coupons";
import { creditOrderLoyaltyPoints, reverseOrderLoyaltyPoints } from "@/lib/loyalty";
import {
  processReferralRewardOnDelivery,
  reverseReferralRewardOnCancellation,
} from "@/lib/referrals";

export type OrderStatus =
  | "PENDING"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID"
  | "REFUNDED";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        productSize: {
          include: { unit: true };
        };
      };
    };
  };
}>;

/**
 * Finite State Machine (FSM) defining valid order status transitions.
 * - Terminal states: CANCELLED has no outgoing transitions.
 * - Post-fulfillment: DELIVERED can only transition to CANCELLED (refund/return).
 */
export const VALID_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING: ["PENDING_CONFIRMATION", "CONFIRMED", "DISPATCHED", "CANCELLED"],
  PENDING_CONFIRMATION: ["CONFIRMED", "DISPATCHED", "CANCELLED"],
  CONFIRMED: ["DISPATCHED", "DELIVERED", "CANCELLED"],
  DISPATCHED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["CANCELLED"],
  CANCELLED: [],
};

/**
 * Rounds monetary values to 2 decimal places to avoid floating point drift.
 */
export function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export interface OrderTransitionInput {
  orderId: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNote?: string | null;
  shippingFee?: number | null;
  deliveryNotes?: string | null;
  staffUserId?: string | null;
  /**
   * Optional lifecycle hook executed inside the same transaction
   * before commit. Allows downstream modules (M2 coupon reversal, M5 loyalty)
   * to attach transactional state changes that roll back atomically on failure.
   */
  onTransition?: (ctx: {
    tx: Prisma.TransactionClient;
    orderBefore: OrderWithItems;
    orderAfter: OrderWithItems;
  }) => Promise<void>;
}

export interface OrderTransitionResult {
  order: OrderWithItems;
  previousStatus: string;
  statusChanged: boolean;
}

/**
 * Authoritative single entry-point for all order status and financial transitions.
 *
 * Guarantees:
 * 1. Single database transaction wrapping all order updates and inventory movements.
 * 2. Strict Finite State Machine (FSM) validation:
 *    - Rejects invalid transitions with descriptive error:
 *      `Illegal state transition from ${from} to ${to}`.
 *    - CANCELLED is terminal (no transitions allowed).
 *    - DELIVERED cannot transition backward to PENDING/CONFIRMED/DISPATCHED (only CANCELLED).
 * 3. Automatic inventory synchronization:
 *    - DISPATCHED or DELIVERED commits physical inventory deductions atomically.
 *    - CANCELLED releases reservations or returns stock atomically.
 * 4. Financial consistency & 2-decimal floating point rounding:
 *    - Validates shippingFee is finite and non-negative.
 *    - Recalculates total and dueAmount using roundCurrency().
 *    - Reconciles paymentStatus (PAID if dueAmount == 0 & paidAmount >= total;
 *      PARTIAL if dueAmount > 0 & paidAmount > 0; PENDING if paidAmount == 0).
 * 5. Atomic rollback: Any failure in inventory, validation, hooks, or persistence
 *    reverts all changes in full.
 * 6. Transactional composition: Accepts an optional `tx` client so external workflows
 *    can nest this inside larger parent transactions.
 */
export async function transitionOrderStatus(
  input: OrderTransitionInput,
  txClient?: Prisma.TransactionClient
): Promise<OrderTransitionResult> {
  const execute = async (tx: Prisma.TransactionClient): Promise<OrderTransitionResult> => {
    // a. Fetch order with items and product sizes
    const orderBefore = await tx.order.findFirst({
      where: {
        OR: [{ id: input.orderId }, { orderNumber: input.orderId }],
      },
      include: {
        items: {
          include: {
            productSize: {
              include: { unit: true },
            },
          },
        },
      },
    });

    if (!orderBefore) {
      throw new Error(`Order not found: ${input.orderId}`);
    }

    const previousStatus = orderBefore.orderStatus;
    const statusChanged =
      Boolean(input.orderStatus) && input.orderStatus !== previousStatus;

    // b. State Machine Validation (FSM)
    if (statusChanged && input.orderStatus) {
      const allowedNext = VALID_STATUS_TRANSITIONS[previousStatus] || [];
      if (!allowedNext.includes(input.orderStatus)) {
        throw new Error(
          `Illegal state transition from ${previousStatus} to ${input.orderStatus}`
        );
      }

      // Inventory and rewards transitions tied strictly to validated status change
      if (input.orderStatus === "DISPATCHED") {
        await commitShipmentForOrder(orderBefore.id, input.staffUserId, tx);
      } else if (input.orderStatus === "DELIVERED") {
        await commitShipmentForOrder(orderBefore.id, input.staffUserId, tx);
        await creditOrderLoyaltyPoints(orderBefore.id, tx);
        await processReferralRewardOnDelivery(orderBefore.id, tx, input.orderStatus);
      } else if (input.orderStatus === "CANCELLED") {
        await releaseReservationForOrder(orderBefore.id, input.staffUserId, tx);
        await reverseCouponRedemption({ orderId: orderBefore.id }, tx);
        await reverseOrderLoyaltyPoints(orderBefore.id, tx);
        await reverseReferralRewardOnCancellation(orderBefore.id, tx);
      }
    }

    // c. Recalculate totals and round monetary values if shipping fee or payment is updated
    let calculatedShippingFee = roundCurrency(orderBefore.shippingFee);
    let calculatedTotal = roundCurrency(orderBefore.total);
    let calculatedPaidAmount = roundCurrency(orderBefore.paidAmount);
    let calculatedDueAmount = roundCurrency(
      Math.max(0, calculatedTotal - calculatedPaidAmount)
    );
    let hasShippingFeeUpdate = false;
    let hasFinancialUpdate = false;

    if (input.shippingFee !== undefined && input.shippingFee !== null) {
      const numericShippingFee = Number(input.shippingFee);
      if (!Number.isFinite(numericShippingFee) || numericShippingFee < 0) {
        throw new Error("Invalid shippingFee: must be a non-negative finite number.");
      }
      hasShippingFeeUpdate = true;
      hasFinancialUpdate = true;
      calculatedShippingFee = roundCurrency(numericShippingFee);
      calculatedTotal = roundCurrency(
        Math.max(
          0,
          orderBefore.subtotal - (orderBefore.discountAmount || 0) + calculatedShippingFee
        )
      );
      calculatedDueAmount = roundCurrency(
        Math.max(0, calculatedTotal - calculatedPaidAmount)
      );
    }

    // Financial consistency: reconcile paymentStatus & due amounts
    let resolvedPaymentStatus = input.paymentStatus || orderBefore.paymentStatus;

    if (input.paymentStatus === "PAID") {
      calculatedPaidAmount = Math.max(calculatedPaidAmount, calculatedTotal);
      calculatedDueAmount = 0;
      resolvedPaymentStatus = "PAID";
      hasFinancialUpdate = true;
    } else if (hasShippingFeeUpdate || calculatedPaidAmount !== orderBefore.paidAmount) {
      if (calculatedDueAmount === 0 && calculatedPaidAmount >= calculatedTotal) {
        resolvedPaymentStatus = "PAID";
      } else if (calculatedDueAmount > 0 && calculatedPaidAmount > 0) {
        resolvedPaymentStatus = "PARTIAL";
      } else if (calculatedPaidAmount === 0 && resolvedPaymentStatus !== "REFUNDED") {
        resolvedPaymentStatus = "PENDING";
      }
    } else if (input.paymentStatus) {
      resolvedPaymentStatus = input.paymentStatus;
    }

    // d. Persist order updates
    const orderAfter = await tx.order.update({
      where: { id: orderBefore.id },
      data: {
        ...(input.orderStatus && { orderStatus: input.orderStatus }),
        ...(resolvedPaymentStatus && { paymentStatus: resolvedPaymentStatus }),
        ...(input.trackingNote !== undefined && { trackingNote: input.trackingNote }),
        ...(input.deliveryNotes !== undefined && { deliveryNotes: input.deliveryNotes }),
        ...(hasFinancialUpdate && {
          shippingFee: calculatedShippingFee,
          total: calculatedTotal,
          paidAmount: calculatedPaidAmount,
          dueAmount: calculatedDueAmount,
          ...(hasShippingFeeUpdate ? { deliveryFeeType: "MANUAL" } : {}),
        }),
      },
      include: {
        items: {
          include: {
            productSize: {
              include: { unit: true },
            },
          },
        },
      },
    });

    // Optional downstream lifecycle hook (M2 Coupon Reversal, M5 Loyalty Ledger)
    if (input.onTransition) {
      await input.onTransition({
        tx,
        orderBefore,
        orderAfter,
      });
    }

    return {
      order: orderAfter,
      previousStatus,
      statusChanged,
    };
  };

  if (txClient) {
    return await execute(txClient);
  }

  return await prisma.$transaction(execute, {
    maxWait: 20000,
    timeout: 30000,
  });
}
