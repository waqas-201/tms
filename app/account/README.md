# account

## Overview
Next.js App Router page and layout route for `/account`.

## Interface
- `metadata` in [layout.tsx:metadata]
- `AccountLayout` (default export) in [layout.tsx:AccountLayout]
- `AccountPage` (default export) in [page.tsx:AccountPage]

## Invariants
- Requires verified customer email address in [page.tsx:emailVerified]
- Enforces staff separation from patient actions in [page.tsx:isStaffRole]

## Side Effects
- Dispatches external emails via Resend in [page.tsx:email]

## Verification
- Run: `npm run build`
