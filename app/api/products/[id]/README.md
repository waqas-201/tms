# [id]

## Overview
Next.js API route endpoint for `/api/products/[id]`.

## Interface
- `GET` handler in [route.ts:GET]
- `PUT` handler in [route.ts:PUT]
- `DELETE` handler in [route.ts:DELETE]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- Executes transactional database operations via Prisma in [route.ts:prisma.$transaction]

## Verification
- Run: `npm run build`
