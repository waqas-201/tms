# adjust

## Overview
Next.js API route endpoint for `/api/admin/loyalty/adjust`.

## Interface
- `POST` handler in [route.ts:POST]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.SUPER_ADMIN] in [route.ts:requireRole]
- Mandatory non-empty reason of at least 5 characters for auditing

## Side Effects
- Creates `ADJUST` record in `loyalty_ledger` via [loyalty.ts:adminAdjustLoyaltyPoints]

## Verification
- Run: `npm run build`
