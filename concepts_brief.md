# Transactional Order Pipeline & Race-Free Coupon Redemptions

* **Author:** waqas
* **Date:** 2026-11-13

## Overview

Centralize order state changes into a unified transactional service function (`lib/orders.ts`) and eliminate race conditions and leaked redemptions in the coupon lifecycle. Currently, order status transitions and inventory adjustments run sequentially in an uncoordinated manner in `app/api/orders/[id]/route.ts`. Cancelling an order releases inventory reservations but permanently burns the customer's coupon redemption, and coupon limits are verified prior to the database transaction, allowing concurrent checkouts to exceed redemption caps.

## Analysis

### Core Contradictions & Risks

1. **Prisma Read Committed vs Concurrent Usage Checks:**
   Checking `coupon.usageCount >= coupon.usageLimit` via `findUnique` inside a standard Prisma transaction does not lock the row against concurrent transactions in PostgreSQL's default `READ COMMITTED` isolation level. Two requests reading `usageCount = 9` (with limit 10) can both pass validation and increment to 11. Resolving this requires either raw SQL `SELECT ... FOR UPDATE` or an atomic conditional update (`UPDATE coupon SET usageCount = usageCount + 1 WHERE id = $1 AND usageCount < usageLimit`).

2. **Audit Retention vs Per-User Limit Accounting:**
   When an order is cancelled, reversing coupon redemption must restore both the coupon's global `usageCount` and the customer's eligibility under `perUserLimit`. If the `CouponRedemption` record is simply deleted, the audit trail of who attempted the redemption is destroyed. If the record is retained without schema changes, `prisma.couponRedemption.count(...)` continues to count it against `perUserLimit` unless an explicit status column or nullable cancellation timestamp is tracked.

3. **Side Effects Inside vs Outside the Transaction Seam:**
   The existing PATCH handler triggers non-transactional side effects, notably `sendOrderConfirmationEmail`. If email sending or notification creation is coupled inside `lib/orders.ts`, external network delays can exhaust the database connection pool or leave external messages dispatched even if a subsequent step fails. Side effects must execute strictly post-commit.

4. **Terminal Order State Invariants:**
   Current logic allows arbitrary status overrides. Moving to a single transactional function demands strict state machine validation (e.g. `PENDING` -> `CONFIRMED` -> `DISPATCHED` -> `DELIVERED`, or terminal `CANCELLED`). If an already cancelled order is patched to `CONFIRMED`, does it re-reserve stock and re-claim coupons? Re-opening cancelled orders introduces high risk of overselling depleted stock.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Extract a single transactional function in `lib/orders.ts` handling order status transitions, inventory commits/releases, and coupon reversal.
  * Guarantee full rollback: if inventory update, payment adjustment, or coupon reversal fails, the order status change must not persist.
  * Atomic, race-free coupon redemption and reversal preventing concurrent over-allocation.
  * Extract `normalizePhoneNumber` from `lib/coupons.ts` into a shared utility (`lib/phone.ts` or `lib/utils.ts`) consumed across orders, bookings, and user records.
  * Integration tests verifying status rollbacks, cancellation coupon release, and simultaneous last-use race conditions.

* **Out-of-Scope Non-Goals:**
  * Rewriting customer order creation (`POST /api/orders`) unless needed to share the coupon redemption lock.
  * External payment gateway integrations or automated refund processing.
  * Schema redesign for unrelated entities (hijama, consultations) beyond phone normalization.

## Alternatives Weighed

* **Prisma Read-Check-Write vs Atomic Conditional SQL:**
  * *Option A:* Reading `usageCount` in `prisma.$transaction`. Rejected due to PostgreSQL `READ COMMITTED` race vulnerabilities where concurrent transactions read stale counts.
  * *Option B:* Raw query `SELECT FOR UPDATE` or conditional `UPDATE ... WHERE usageCount < usageLimit`. Guarantees database-level serialization without race windows.
* **Hard Deletion vs Soft Cancellation of Coupon Redemptions:**
  * *Option A:* Delete `CouponRedemption` row where `orderId = id`. Preserves schema without migrations, but erases historical logs.
  * *Option B:* Add `status` or `cancelledAt` to `CouponRedemption` in `prisma/schema.prisma`. Preserves audit trail, but requires a database schema migration.

## Key Decisions & Staging for Next Steps

* Clarify whether `CouponRedemption` records should be deleted upon cancellation or if a schema migration is acceptable to mark them cancelled.
* Define whether terminal states (`CANCELLED`, `DELIVERED`) are strictly one-way or allow reinstatement.
* Establish whether order creation (`POST /api/orders`) shares the same transactional coupon reservation routine as status updates.
