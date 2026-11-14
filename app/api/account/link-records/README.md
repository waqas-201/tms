# link-records

## Overview
Next.js API route endpoint for `/api/account/link-records`.

## Interface
- `POST` handler in [route.ts:POST]

## Invariants
- Requires verified customer email address in [route.ts:emailVerified]
- Requires authenticated user session in [route.ts:getSession]

## Side Effects
- None

## Verification
- Run: `npm run build`
