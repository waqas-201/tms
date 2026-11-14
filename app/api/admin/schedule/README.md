# schedule

## Overview
Next.js API route endpoint for `/api/admin/schedule`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- `PUT` handler in [route.ts:PUT]
- `DELETE` handler in [route.ts:DELETE]

## Invariants
- Requires authenticated user session in [route.ts:getSession]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]

## Side Effects
- Mutates database records (delete, upsert) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
