# users

## Overview
Next.js API route endpoint for `/api/admin/users`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/admin/users/[id]`.

## Invariants
- Requires verified customer email address in [route.ts:emailVerified]
- Requires authenticated user session with roles [ROLES.ADMIN] in [route.ts:requireRole]

## Side Effects
- Mutates database records (update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
