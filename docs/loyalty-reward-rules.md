# Tameer-e-Sehat (TMS) Loyalty & Rewards System Specification

**Document Version:** 1.0.0  
**Status:** Approved by Business Owner (November 14, 2026)  
**Governing Milestone:** M4 (Business Data for Reward Rules) → Implementation Foundation for M5 (Loyalty Ledger)

---

## 1. Executive Summary & Economics

The Tameer-e-Sehat Loyalty Program is designed as a sustainable, margin-protected retention engine for the herbal apothecary and clinic. The program operates on an integer-based points economy with a fixed 1:1 monetary valuation, eliminating floating-point reconciliation errors and providing intuitive transparency to patients and customers.

---

## 2. Core Economic Parameters

| Parameter | Value | Rationale & Protection |
| :--- | :--- | :--- |
| **Point Value** | **1 Point = ₨ 1.00 PKR** | 1:1 parity is completely transparent to customers and keeps database ledger math strictly integer-clean. |
| **Apothecary Earn Rate** | **2% (2 Points per ₨ 100)** | Calculated as `Math.floor(subtotal * 0.02)`. Protects herbal medicine margins (typically 25%–40% gross). |
| **Hijama Earn Rate** | **Flat 50 Points** | Equivalent to 2% on the standard ₨ 2,500 clinical cupping fee upon verified completion. |
| **Consultation Earn Rate** | **Flat 30 Points** | Equivalent to 2% on the standard ₨ 1,500 physician consultation fee upon verified completion. |
| **Minimum Redemption (Burn)** | **200 Points (₨ 200)** | Blocks high-frequency micro-redemptions; ensures repeat customer engagement before first cash-out. |
| **Maximum Subtotal Cap** | **10% of Order Subtotal** | Guarantees every sale generates at least 90% cash revenue, preventing discount margin erosion. |
| **Shipping Exclusion** | **Points cannot discount shipping** | Customers must pay third-party courier / logistics costs in cash. |
| **Point Expiry** | **365 Days (12 Months)** | Clears inactive reward liabilities from the clinic balance sheet annually. |

---

## 3. Lifecycle & Integration Rules

### 3.1 Point Accrual (Credit)
1. **Apothecary Orders**:
   - Points are awarded **only when an order reaches `orderStatus: "DELIVERED"`**.
   - Accrual hooks directly into the M1 transactional pipeline `transitionOrderStatus({ onTransition })`.
   - Idempotency constraint prevents re-transitioning or dual deliveries from double-crediting.
2. **Clinical Services (Hijama & Consultations)**:
   - Points are credited when staff mark an appointment `status: "COMPLETED"`.

### 3.2 Point Redemption (Burn)
- At checkout (`/checkout`), eligible members with $\ge 200$ points can choose to apply points in increments of 10 up to the 10% subtotal cap.
- Points redemption is recorded as an atomic negative ledger entry (`type: "REDEEM"`).
- Redemptions reduce the order `dueAmount` by ₨ 1 per point redeemed.

### 3.3 Clawbacks & Cancellations (Reversal)
- **Order Cancellation / Return**:
  - If an order is transitioned to `CANCELLED`, any points credited for that order are atomically debited (`type: "REFUND"`).
  - If points were redeemed to discount the cancelled order, those points are atomically credited back to the customer.
- **Negative Balance Policy**:
  - If Customer earns 100 points on Order A, redeems them on Order B, and subsequently returns Order A, the ledger records a debit of 100 points, resulting in a **negative balance** (e.g. `-100`).
  - Subsequent purchases automatically credit towards clearing the deficit before redeemable points accumulate.

---

## 4. Milestone M5 Engineering Contract (Loyalty Ledger Schema)

The approved rules dictate the following relational database schema for Milestone M5:

```prisma
model LoyaltyLedger {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount       Int       // Positive for credits (+50), negative for debits (-200)
  type         String    // "EARN" | "REDEEM" | "CLAWBACK" | "REFUND" | "ADJUST" | "EXPIRE"
  source       String    // "ORDER" | "HIJAMA" | "CONSULTATION" | "ADMIN" | "EXPIRY"
  referenceId  String?   // Order ID, Booking ID, or Admin Session ID
  balanceAfter Int       // Running balance snapshot after mutation
  reason       String?   // Mandatory for manual ADMIN adjustments
  expiresAt    DateTime? // Set for EARN entries (now + 365 days)
  createdAt    DateTime  @default(now())

  // Idempotency: Prevents duplicate events from double-crediting
  @@unique([source, referenceId, type])
  @@index([userId])
  @@index([createdAt])
  @@map("loyalty_ledger")
}
```

### Invariants for Milestone M5 Verification:
1. **Sum Equality**: A user's active balance must **always equal** `SUM(amount)` of their ledger rows.
2. **Idempotency**: A duplicate `DELIVERED` event cannot insert a second `EARN` entry for the same `referenceId`.
3. **Reversal Completeness**: A cancelled order completely reverses its net points effect.
