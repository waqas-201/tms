# checkout

## Overview
Next.js App Router page and layout route for `/checkout`.

## Interface
- `metadata` in [layout.tsx:metadata]
- `CheckoutLayout` (default export) in [layout.tsx:CheckoutLayout]
- `CheckoutPage` (default export) in [page.tsx:CheckoutPage]

## Invariants
- Requires verified customer email address in [page.tsx:emailVerified]
- Enforces staff separation from patient actions in [page.tsx:isStaffRole]

## Side Effects
- Dispatches external emails via Resend in [page.tsx:email]

## Verification
- Run: `npm run build`
