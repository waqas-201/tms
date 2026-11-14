# orders

## Overview
Next.js API route endpoint for `/api/orders`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/orders/[id]`.

## Invariants
- Enforces available stock sufficiency before reservation in [route.ts:getAvailableStock]
- Validates coupon scope, expiration, minimum subtotal, and usage limits in [route.ts:validateCoupon]
- Requires verified customer email address in [route.ts:emailVerified]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]
- Requires authenticated user session in [route.ts:getSession]

## Side Effects
- Executes transactional database operations via Prisma in [route.ts:prisma.$transaction]
- Dispatches external emails via Resend in [route.ts:email]
- Persists admin in-app notification in [route.ts:createAdminNotification]

## Verification
- Run: `npm run build`
