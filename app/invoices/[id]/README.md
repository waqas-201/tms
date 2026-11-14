# [id]

## Overview
Next.js App Router page and layout route for `/invoices/[id]`.

## Interface
- `async` (default export) in [page.tsx:async]

## Invariants
- Requires authenticated user session in [page.tsx:getSession]
- Enforces cryptographic token or staff/owner access verification in [page.tsx:verifyInvoiceToken]
- Enforces staff separation from patient actions in [page.tsx:isStaffRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
