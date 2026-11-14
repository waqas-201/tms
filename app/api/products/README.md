# products

## Overview
Next.js API route endpoint for `/api/products`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/products/[id]`.

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- Executes transactional database operations via Prisma in [route.ts:prisma.$transaction]

## Verification
- Run: `npm run build`
