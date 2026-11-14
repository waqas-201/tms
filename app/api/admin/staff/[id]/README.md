# [id]

## Overview
Next.js API route endpoint for `/api/admin/staff/[id]`.

## Interface
- `PATCH` handler in [route.ts:PATCH]
- `DELETE` handler in [route.ts:DELETE]
- `dynamic` in [route.ts:dynamic]

## Invariants
- Requires authenticated user session with roles [ROLES.SUPER_ADMIN] in [route.ts:requireRole]

## Side Effects
- Mutates database records (update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
