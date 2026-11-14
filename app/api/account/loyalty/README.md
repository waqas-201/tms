# loyalty

## Overview
Next.js API route endpoint for `/api/account/loyalty`.

## Interface
- `GET` handler in [route.ts:GET]

## Invariants
- Requires authenticated user session in [route.ts:getSession]

## Side Effects
- Reads customer loyalty ledger records via Prisma in [route.ts:getUserLoyaltyBalance]

## Verification
- Run: `npm run build`
