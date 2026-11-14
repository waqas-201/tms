# consultations

## Overview
Next.js API route endpoint for `/api/consultations`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/consultations/[id]`.
  - [availability](./availability/README.md) - Next.js API route endpoint for `/api/consultations/availability`.
  - [voice](./voice/README.md) - Next.js API route endpoint for `/api/consultations/voice`.

## Invariants
- Requires verified customer email address in [route.ts:emailVerified]
- Requires authenticated user session in [route.ts:getSession]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]
- Validates coupon scope, expiration, minimum subtotal, and usage limits in [route.ts:validateCoupon]

## Side Effects
- Mutates database records (create) via Prisma in [route.ts:prisma]
- Persists admin in-app notification in [route.ts:createAdminNotification]

## Verification
- Run: `npm run build`
