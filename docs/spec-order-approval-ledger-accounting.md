# Technical Specification: Manual Order Approval, Auto-Invoice, and Unified Patient Ledger

**Target Project**: Tameer-e-Sehat (Unani Clinic & Apothecary)  
**Related ADR**: [0002-order-approval-ledger-and-accounting.md](file:///C:/Users/ALICOM4/projects/tms/docs/adr/0002-order-approval-ledger-and-accounting.md)  
**Vocabulary Reference**: [GLOSSARY.md](file:///C:/Users/ALICOM4/projects/tms/GLOSSARY.md)  

---

## 1. Executive Summary

This specification defines the implementation plan for:
1. **Deferred Delivery Calculation**: Removing automatic shipping estimates from the storefront checkout. Placed orders enter `PENDING_CONFIRMATION` with delivery fees marked as pending clinic confirmation.
2. **Admin Review & Freight Assignment**: An administrative review flow in `/admin` where staff inspect delivery addresses, enter the exact delivery charge, and confirm the order.
3. **Automated PDF Invoice Generation**: Programmatic generation of branded, printable PDF invoices (`INV-YYYY-XXXX`).
4. **Multi-Channel Dispatch (Email & WhatsApp)**:
   - Automated email dispatch with PDF attachment via Resend.
   - 1-click WhatsApp message generation with order recap and secure view/download invoice link.
5. **Unified Patient Ledger (`/account`)**: A consolidated patient statement displaying transaction history across E-Commerce Orders, Hijama Cupping appointments, and Hakeem Consultations, calculating total debits, credits, and balance due.
6. **Clinic Bookkeeping (`/admin`)**: Administrative tooling to log offline payments (Cash, COD, Bank, JazzCash, EasyPaisa), issue receipts, and manage account balances.

---

## 2. Domain & Data Architecture

### 2.1 Prisma Schema Enhancements

In [prisma/schema.prisma](file:///C:/Users/ALICOM4/projects/tms/prisma/schema.prisma):

```prisma
model Order {
  // Existing fields retained...
  orderStatus        String          @default("PENDING_CONFIRMATION") // "PENDING_CONFIRMATION" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED"
  deliveryFeeType    String          @default("MANUAL")               // "MANUAL" | "FLAT" | "FREE"
  shippingFee        Float           @default(0)                      // Populated upon admin confirmation
  invoiceNumber      String?         @unique                          // e.g. "INV-2026-1001"
  invoiceGeneratedAt DateTime?
  // User & Relations...
  userId             String?
  user               User?           @relation(fields: [userId], references: [id], onDelete: SetNull)
  items              OrderItem[]
  payments           PaymentRecord[]
}

model PaymentRecord {
  id            String   @id @default(cuid())
  orderId       String?
  order         Order?   @relation(fields: [orderId], references: [id], onDelete: SetNull)
  // Cross-domain linking to support clinic consultations & Hijama
  consultationId String?
  hijamaId      String?
  userId        String?
  customerName  String
  customerPhone String?
  amount        Float
  paymentMethod String   @default("COD") // "COD" | "CASH" | "BANK" | "JAZZCASH" | "EASYPAISA"
  reference     String?  // Transaction ID / Slip reference
  notes         String?  // Admin remarks
  recordedBy    String?  // Admin user ID
  createdAt     DateTime @default(now())
}
```

---

## 3. Component & Workflow Breakdown

### 3.1 Storefront Checkout (`app/checkout/page.tsx`)
- **Step 3 (Dispatch Speed & Courier Service)**:
  - Remove fixed PKR 200 / priority flat calculation.
  - Display informative badge: **"Delivery Fee: Assessed by Clinic upon Order Review"**.
  - Detail note explaining: *"Because herbal packages and glass murabba/arq bottles vary in weight and courier zones, our clinic staff will review your address and quote exact delivery charges before dispatch."*
- **Order Summary**:
  - Subtotal: calculated from items.
  - Delivery Fee: **"Pending Confirmation"** (₨ 0 at initial submission).
  - Total: Subtotal + ₨ 0.
  - Call-to-action button: **"Place Order (Pending Delivery Confirmation)"**.
- **Submission API (`POST /api/orders`)**:
  - Sets `orderStatus = "PENDING_CONFIRMATION"`.
  - Sets `deliveryFeeType = "MANUAL"`, `shippingFee = 0`, `total = subtotal`.
  - Sends immediate acknowledgement notification to user and admin.

---

### 3.2 Admin Order Review & Freight Input (`app/admin/page.tsx` & `/api/admin/orders/[id]/confirm`)
- **Order Detail Drawer / Modal**:
  - Visual status pill: `Pending Confirmation`.
  - Customer shipping address & city display with optional Google Maps pin link.
  - Delivery Fee Input: Number input (PKR) with quick presets (e.g. `₨ 150 (Karachi Local)`, `₨ 250 (Trax/Leopard City)`, `₨ 350 (Heavy/Remote)`).
  - Internal remarks/notes input.
- **Confirmation Action**:
  - Admin clicks **"Approve & Issue Invoice"**.
  - Server sets `shippingFee`, recalculates `total = subtotal + shippingFee`, `dueAmount = total - paidAmount`.
  - Assigns unique `invoiceNumber: "INV-" + currentYear + "-" + orderSequence`.
  - Updates status to `CONFIRMED`.
  - Renders invoice PDF data.

---

### 3.3 Automated PDF Invoice & Multi-Channel Sharing
- **Invoice Endpoint**: `GET /api/invoices/[invoiceNumber]` (or `GET /api/orders/[id]/invoice`)
  - Generates downloadable printable vector invoice containing:
    - Clinic header (Tameer-e-Sehat Matab, Korangi, Karachi, Contact & NTN details).
    - Invoice reference, date, and customer profile info.
    - Tabular item breakdown (Item, variant/size, unit price, quantity, total).
    - Subtotal, confirmed delivery fee, discounts (if any), total payable, and payment method.
    - Instructions for COD or online bank / JazzCash settlement.
- **Email Delivery (Resend API)**:
  - Endpoint `POST /api/admin/orders/[id]/send-invoice-email`.
  - Attaches generated PDF; sends HTML receipt with breakdown and payment instructions to customer email.
- **WhatsApp 1-Click Sharing**:
  - Dedicated admin button: **"Send Invoice via WhatsApp"**.
  - Opens `https://wa.me/{phone}?text={encodedMessage}`:
    ```
    السلام علیکم {CustomerName},
    آپ کا آرڈر {OrderNumber} تصدیق ہو گیا ہے۔

    📦 آرڈر کی تفصیل:
    مصنوعات کی رقم: ₨ {Subtotal}
    ڈلیوری چارجز: ₨ {ShippingFee}
    کل واجب الادا رقم: ₨ {Total} (Cash on Delivery)

    📄 انوائس دیکھنے اور ڈاؤن لوڈ کرنے کے لیے نیچے دیے گئے لنک پر کلک کریں:
    {InvoiceUrl}

    شکریہ،
    تعمیرِ صحت مطب و ہربل کلینک کراچی
    ```

---

### 3.4 Unified Patient Ledger (`app/account/page.tsx`)
- New tab navigation item: **"Ledger & Billing (کھاتہ و بلنگ)"**.
- **Financial Summary Cards**:
  - Total Billed (All time)
  - Total Paid (All time)
  - Current Balance Due (Outstanding)
- **Unified Transaction Table**:
  - Aggregates chronologically:
    1. **Orders**: Type = Apothecary Order, Ref = `INV-XXXX` or `TMS-XXXX`, Debit = Total, Credit = Paid, Status.
    2. **Hijama Sessions**: Type = Hijama Cupping, Ref = `HIJ-XXXX`, Debit = Fee (e.g. ₨ 2500), Credit = Clinic Paid, Status.
    3. **Consultations**: Type = Hakeem Consultation, Ref = `CON-XXXX`, Debit = Fee (if applicable), Credit = Paid.
  - Action button: **"Download Invoice / Receipt (PDF)"** for each confirmed record.

---

### 3.5 Admin Bookkeeping & Payment Tracking (`app/admin`)
- New sub-view: **"Accounting & Ledger"**.
- Features:
  - **Filter by Patient**: Search by phone or email to view complete account statement.
  - **Record Payment Modal**:
    - Select transaction (Order / Hijama / Consultation) or general account credit.
    - Enter amount (PKR).
    - Payment Method: Cash on Delivery, Clinic Cash, Bank Transfer, JazzCash, EasyPaisa.
    - Reference / Slip ID and admin audit notes.
    - Automatically updates `paidAmount`, `dueAmount`, and `paymentStatus` (`PAID` or `PARTIAL`).

---

## 4. Verification & Testing Plan
1. **Checkout Test**: Place an order from storefront. Verify shipping fee displays as pending confirmation and order is saved with `PENDING_CONFIRMATION` without default ₨ 200 charged.
2. **Admin Freight & Invoice Test**: Log into admin, locate order, input custom shipping fee (e.g. ₨ 220), click Approve. Verify total updates to Subtotal + 220, invoice number generated, and status set to `CONFIRMED`.
3. **PDF & WhatsApp Test**: Click WhatsApp link and verify pre-filled URL message; test invoice PDF download.
4. **Ledger Integration Test**: Log into user account, open "Ledger & Billing", verify orders, hijama bookings, and recorded payments reflect accurately with correct debit/credit arithmetic.
