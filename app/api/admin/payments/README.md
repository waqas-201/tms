# payments

## Overview
Next.js API route endpoint for `/api/admin/payments`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]

## Invariants
- Requires authenticated user session in [route.ts:getSession]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]

## Side Effects
- Executes transactional database operations via Prisma in [route.ts:prisma.$transaction]
- Persists admin in-app notification in [route.ts:createAdminNotification]

## Verification
- Run: `npm run build`
