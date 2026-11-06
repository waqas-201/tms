# Comprehensive Marketing Coupon & Promotions Engine

**Tameer-e-Sehat Apothecary & Clinical Platform**  
*Architecture, Guardrails, and Super Admin Operations*

---

## 1. Overview & Multi-Service Scope Isolation

The Tameer-e-Sehat coupon engine provides an authoritative, server-validated promotional system spanning all three branches of the platform:
1. **Physical Products (Apothecary & Herbal Dispensary)**
2. **Clinical Hijama (Islamic Wet Cupping Appointments)**
3. **Clinical Consultations (Hakeem Telehealth & In-Person Visits)**

### Why Service Isolation Matters
Because herbal preserves (Murabbajaat) and steam distillates (Arqiyat) have physical raw material, bottling, and courier costs, profit margins on physical goods are much tighter than on service-based clinical appointments (Hijama & Consultations).

To protect business margins, the coupon engine strictly enforces scope boundaries at the database and API levels:
- A coupon configured for **`HIJAMA`** (e.g., `SUNNAH500`) will be **authoritatively rejected** if a customer enters it during physical product checkout.
- A coupon configured for **`PRODUCTS`** (e.g., `SEHAT10`) will be **rejected** on Hijama bookings.
- A coupon configured for **`CONSULTATION`** (e.g., `TIBBIFREE`) functions as a dedicated consultation voucher and cannot discount physical inventory.
- Global coupons (`ALL`) or category-specific coupons (`CATEGORY`) provide flexibility for platform-wide promotions when explicitly intended by the Super Admin.

```
                  ┌──────────────────────────────┐
                  │    Unified Coupon Engine     │
                  │   (/api/coupons/validate)    │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   [ PRODUCTS ]             [ HIJAMA ]            [ CONSULTATION ]
   Scope: PRODUCTS         Scope: HIJAMA         Scope: CONSULTATION
   • Min Subtotal Check    • Offsets Rs. 2,500   • Offsets Rs. 1,500
   • Max PKR Cap Check       Base Fee              Standard Fee
   • Free Shipping Flag    • Updates Payable     • Grants Free Voucher
   • Category Matching       Amount at Clinic
```

---

## 2. Database Schema Architecture

The Prisma schema integrates two dedicated models (`Coupon` and `CouponRedemption`) alongside relations in `Order`, `HijamaBooking`, `ConsultationRequest`, and `ConsultationSetting`.

### `Coupon`
```prisma
model Coupon {
  id                  String             @id @default(cuid())
  code                String             @unique // Stored UPPERCASE, e.g. "SEHAT10"
  description         String
  scope               String             @default("PRODUCTS") // "PRODUCTS" | "HIJAMA" | "CONSULTATION" | "ALL" | "CATEGORY"
  discountType        String             @default("PERCENTAGE") // "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "FREE_SERVICE"
  discountValue       Float              // e.g. 15 for 15%, 500 for 500 PKR
  minSubtotal         Float?             // Minimum order or booking subtotal required
  maxDiscountCap      Float?             // Max PKR cap for percentage discounts
  targetCategoryId    String?            // Target category ID if scope is CATEGORY
  targetProductIds    String?            // JSON string array of specific product IDs
  startDate           DateTime?
  endDate             DateTime?
  usageLimit          Int?               // Total allowed redemptions globally
  usageCount          Int                @default(0)
  perUserLimit        Int                @default(1) // Allowed redemptions per user / phone number
  isActive            Boolean            @default(true)
  isFlashSale         Boolean            @default(false)
  flashSaleBannerText String?            // e.g. "⚡ Flash Offer: 20% Off All Murabba Preserves!"
  flashSaleBadge      String?            // e.g. "FLASH 20% OFF"
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  redemptions         CouponRedemption[]
  orders              Order[]
  hijamaBookings      HijamaBooking[]
  consultations       ConsultationRequest[]

  @@map("coupon")
}
```

### `CouponRedemption` (Anti-Abuse Audit Log)
```prisma
model CouponRedemption {
  id              String               @id @default(cuid())
  couponId        String
  coupon          Coupon               @relation(fields: [couponId], references: [id], onDelete: Cascade)
  userId          String?
  user            User?                @relation(fields: [userId], references: [id], onDelete: SetNull)
  phone           String?              // Normalized phone / WhatsApp
  orderId         String?
  hijamaBookingId String?
  consultationId  String?
  discountAmount  Float
  orderTotal      Float?
  redeemedAt      DateTime             @default(now())

  @@index([couponId])
  @@index([userId])
  @@index([phone])
  @@map("coupon_redemption")
}
```

---

## 3. Profit Margin Guardrails & Safeguards

To prevent loss-making promotions, the coupon engine supports three critical safeguards:

1. **Maximum Discount Cap (`maxDiscountCap` in PKR)**:
   - For percentage discounts (e.g., `20% OFF`), a huge cart of ₨ 25,000 would otherwise take ₨ 5,000 off. With `maxDiscountCap: 750`, the maximum savings is strictly capped at ₨ 750 regardless of cart size.
2. **Minimum Subtotal Spend (`minSubtotal` in PKR)**:
   - Prevents micro-orders where shipping or product cost outweighs margin (e.g., requiring ₨ 1,500 minimum basket subtotal).
3. **Category Scope Locking (`targetCategoryId`)**:
   - Allows marketing promotions for high-margin remedy collections while excluding price-sensitive lines.

---

## 4. Anti-Abuse System (Phone & Account Tracking)

In Pakistani e-commerce and clinical booking, users often place orders via Cash on Delivery (COD) or booking forms without necessarily logging into a password account. Fraudulent users might create disposable accounts to game single-use promos.

The anti-abuse engine prevents this by:
1. Normalizing Pakistani phone numbers (e.g., `0300-1234567` $\rightarrow$ `923001234567`).
2. Querying `CouponRedemption` by **both** `userId` and normalized `phone`.
3. Blocking redemption if `priorUses >= perUserLimit` across either identity vector.

---

## 5. Marketing Urgency & Flash Sale Ticker

When a promotional coupon is marked with `isFlashSale: true`:
- The top header component (`MarketingFlashBanner.tsx`) automatically mounts across the entire storefront.
- Displays:
  - **Flash Badge**: e.g., `⚡ FLASH 20% OFF`
  - **Live Countdown Timer**: Automatically counts down days, hours, minutes, and seconds until the coupon's `endDate`.
  - **One-Click Copy & Apply**: Clicking the coupon chip copies the code to the user's clipboard and automatically applies it to active carts.

---

## 6. Super Admin Management Guide

Super Admins can manage all promotions from the Admin Dashboard:
- Navigate to **Admin Dashboard $\rightarrow$ Coupons & Flash Promos** tab (`/admin?tab=coupons`).
- **Real-Time Metrics**:
  - Active Promotions count
  - Total Redemptions counter
  - Total Discounts Granted (₨)
  - Influenced Revenue (₨)
- **Actions Available**:
  - **Create Coupon**: Custom or auto-generated code, scope selection, margin cap, start/end dates, and flash sale ticker config.
  - **Instant Pause/Activate**: Toggle active status with a single click.
  - **Inspect Redemptions**: View the audit drawer showing which orders/patients redeemed the coupon and the exact discount distributed.
  - **Safe Deletion**: Deactivates coupons with redemption history to preserve financial audit logs while allowing deletion of unused stubs.

---

## 7. Seeded Default Coupons

| Coupon Code | Scope | Discount Type | Discount Value | Margin Safeguards | Intended Purpose |
|:---|:---|:---|:---|:---|:---|
| **`SEHAT10`** | `PRODUCTS` | Percentage | 10% Off | Min: ₨ 1,000 · Cap: ₨ 500 | Everyday apothecary promotion |
| **`FREESHIP`** | `PRODUCTS` | Free Shipping | Free Delivery | Min: ₨ 2,000 | Nationwide shipping incentive |
| **`SUNNAH500`** | `HIJAMA` | Fixed | Flat ₨ 500 Off | Standard ₨ 2,500 $\rightarrow$ ₨ 2,000 | Sunnah cupping clinic promotion |
| **`TIBBIFREE`** | `CONSULTATION` | Free Service | 100% Free | Standard ₨ 1,500 $\rightarrow$ ₨ 0 | Complimentary Hakeem voucher |
| **`FLASH20`** | `PRODUCTS` | Percentage | 20% Off | Min: ₨ 1,500 · Cap: ₨ 750 | Active 7-day urgent flash sale |
