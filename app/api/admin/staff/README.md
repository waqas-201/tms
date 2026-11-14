# staff

## Overview
Next.js API route endpoint for `/api/admin/staff`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- `dynamic` in [route.ts:dynamic]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/admin/staff/[id]`.
  - [super-cell](./super-cell/README.md) - Next.js API route endpoint for `/api/admin/staff/super-cell`.

## Invariants
- Requires verified customer email address in [route.ts:emailVerified]
- Requires authenticated user session with roles [ROLES.SUPER_ADMIN] in [route.ts:requireRole]

## Side Effects
- Mutates database records (update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
