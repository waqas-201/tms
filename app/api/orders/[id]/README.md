# [id]

## Overview
Next.js API route endpoint for `/api/orders/[id]`.

## Interface
- `GET` handler in [route.ts:GET]
- `PATCH` handler in [route.ts:PATCH]
- Subdirectories:
  - [send-invoice](./send-invoice/README.md) - Next.js API route endpoint for `/api/orders/[id]/send-invoice`.

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]
- Enforces cryptographic token or staff/owner access verification in [route.ts:verifyInvoiceToken]

## Side Effects
- Dispatches external emails via Resend in [route.ts:email]
- Mutates database records (update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
