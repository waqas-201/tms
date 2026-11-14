# super-cell

## Overview
Next.js API route endpoint for `/api/admin/staff/super-cell`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- `dynamic` in [route.ts:dynamic]

## Invariants
- Requires authenticated user session with roles [ROLES.SUPER_ADMIN] in [route.ts:requireRole]

## Side Effects
- Executes transactional database operations via Prisma in [route.ts:prisma.$transaction]

## Verification
- Run: `npm run build`
