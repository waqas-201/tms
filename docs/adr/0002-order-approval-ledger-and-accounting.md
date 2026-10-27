# Manual Order Approval, Invoice Generation, and Unified Patient Ledger

Status: accepted

## Context & Problem

Previously, the storefront checkout applied a flat courier shipping fee (Rs. 200) automatically without verifying customer location or delivery feasibility. For a specialized Unani apothecary and clinic like Tameer-e-Sehat, shipping costs vary drastically depending on:
1. Local Karachi clinic rider dispatch (distance/weight-based).
2. Inter-city courier logistics (Trax, Leopard, Blue-Ex weight-tiered tariffs).
3. Bulky herbal orders (e.g. glass Murabba jars, Arq bottles).

Additionally, patients interact with Tameer-e-Sehat across three distinct service domains:
1. **E-Commerce Apothecary Orders** (herbal medicines and preserves).
2. **Clinical Consultations** (in-person and online visits with Hakeem Tahir Hameed).
3. **Hijama Cupping Appointments** (Sunnah days and routine clinic sessions).

Prior to this specification, there was no centralized billing statement or ledger for patients to review all transactions and download official PDF invoices, nor did clinic administrators have a basic bookkeeping interface to record offline cash, bank transfers, or mobile wallet payments against a patient's account.

## Decision

We establish an end-to-end order confirmation, manual freight assessment, auto-invoice issuance, and unified patient accounting architecture:

### 1. Checkout & Freight Assessment Flow
- **Pending Freight Status**: At checkout, order placement does not charge or promise an automated shipping fee. The shipping fee is marked as `Pending Clinic Confirmation` (stored as 0 with `deliveryFeeType = "MANUAL"`).
- **Order State Machine**:
  - `PENDING_CONFIRMATION`: Initial state upon placement. Cart is cleared; customer receives an initial order receipt acknowledging receipt and informing them that clinic administration is reviewing their delivery address.
  - `CONFIRMED`: Admin reviews address/city, inputs manual freight charges, and confirms order. Order total is locked, and an official Invoice Reference (`INV-YYYY-XXXX`) is assigned.
  - `DISPATCHED`: Courier tracking / rider assigned.
  - `DELIVERED`: Delivered and completed.
  - `CANCELLED`: Rejected or cancelled by user or admin.

### 2. PDF Invoice & Multi-Channel Delivery
- **Automated PDF Generation**: When an order is confirmed (or on-demand for consultations and Hijama bookings), a clean, printable vector PDF invoice is generated matching Tameer-e-Sehat branding.
- **Gmail / Resend Delivery**: Admin can trigger invoice delivery with one click, emailing the patient an itemized receipt with the PDF attached via Resend API.
- **WhatsApp Web Integration**: Admin can click "Share on WhatsApp" to open `https://wa.me/{phone}` with a pre-filled, professional Urdu/English message containing order breakdown, total with confirmed delivery charges, and a secure direct link for the patient to view/download their PDF.

### 3. Unified Patient Ledger & User Account Portal
- The user account portal (`/account`) introduces a **"My Ledger & Invoices"** tab.
- Unifies all financial interactions across:
  - Apothecary Orders (`Order`)
  - Hakeem Consultations (`ConsultationRequest`)
  - Hijama Sessions (`HijamaBooking`)
- Computes debit (charges), credit (payments), and live balance due per patient.
- Allows direct PDF downloads of all issued invoices and receipts.

### 4. Admin Bookkeeping & Payment Records
- The Admin Portal (`/admin`) introduces an **Accounting & Ledger** workspace:
  - View overall clinic receivables, outstanding balances, and daily collections.
  - Record offline manual payments (`PaymentRecord`) across Cash on Delivery, Clinic Cash, Bank Transfer, JazzCash, and EasyPaisa.
  - Update payment statuses (`PENDING`, `PARTIAL`, `PAID`, `REFUNDED`) with administrative remarks and adjustment notes.

## Consequences

- **Customer Clarity**: Customers are never misled by wrong shipping estimates, especially for rural areas or heavy parcels.
- **Auditability**: All patient payments across herbal dispensary and clinical services tie back to a single ledger.
- **Operational Speed**: Admin can quote delivery charges and send branded WhatsApp and email invoices in seconds without third-party accounting software.
