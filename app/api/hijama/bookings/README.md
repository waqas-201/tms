# bookings

## Overview
Next.js API route endpoint for `/api/hijama/bookings`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/hijama/bookings/[id]`.

## Invariants
- Requires verified customer email address in [route.ts:emailVerified]
- Requires authenticated user session in [route.ts:getSession]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]

## Side Effects
- Persists admin in-app notification in [route.ts:createAdminNotification]

## Verification
- Run: `npm run build`
