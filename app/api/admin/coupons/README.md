# coupons

## Overview
Next.js API route endpoint for `/api/admin/coupons`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/admin/coupons/[id]`.

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN] in [route.ts:requireRole]

## Side Effects
- Mutates database records (create) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
