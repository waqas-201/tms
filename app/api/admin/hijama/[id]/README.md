# [id]

## Overview
Next.js API route endpoint for `/api/admin/hijama/[id]`.

## Interface
- `PATCH` handler in [route.ts:PATCH]
- `DELETE` handler in [route.ts:DELETE]

## Invariants
- Requires authenticated user session in [route.ts:getSession]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]

## Side Effects
- Mutates database records (update, delete) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
