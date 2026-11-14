# [id]

## Overview
Next.js API route endpoint for `/api/units/[id]`.

## Interface
- `PATCH` handler in [route.ts:PATCH]
- `DELETE` handler in [route.ts:DELETE]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN] in [route.ts:requireRole]

## Side Effects
- Mutates database records (update, delete) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
