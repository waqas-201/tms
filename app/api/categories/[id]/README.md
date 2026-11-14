# [id]

## Overview
Next.js API route endpoint for `/api/categories/[id]`.

## Interface
- `GET` handler in [route.ts:GET]
- `PATCH` handler in [route.ts:PATCH]
- `DELETE` handler in [route.ts:DELETE]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- Mutates database records (update, delete) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
