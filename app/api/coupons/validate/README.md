# validate

## Overview
Next.js API route endpoint for `/api/coupons/validate`.

## Interface
- `POST` handler in [route.ts:POST]

## Invariants
- Requires authenticated user session in [route.ts:getSession]
- Validates coupon scope, expiration, minimum subtotal, and usage limits in [route.ts:validateCoupon]

## Side Effects
- None

## Verification
- Run: `npm run build`
