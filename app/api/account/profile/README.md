# profile

## Overview
Next.js API route endpoint for `/api/account/profile`.

## Interface
- `GET` handler in [route.ts:GET]
- `PATCH` handler in [route.ts:PATCH]

## Invariants
- Requires verified customer email address in [route.ts:emailVerified]
- Requires authenticated user session in [route.ts:getSession]

## Side Effects
- Mutates database records (update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
