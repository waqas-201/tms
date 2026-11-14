# book

## Overview
Next.js API route endpoint for `/api/hijama/book`.

## Interface
- `POST` handler in [route.ts:POST]

## Invariants
- Requires verified customer email address in [route.ts:emailVerified]
- Requires authenticated user session in [route.ts:getSession]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]
- Validates coupon scope, expiration, minimum subtotal, and usage limits in [route.ts:validateCoupon]

## Side Effects
- Persists admin in-app notification in [route.ts:createAdminNotification]

## Verification
- Run: `npm run build`
