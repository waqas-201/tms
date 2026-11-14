# inquiries

## Overview
Next.js API route endpoint for `/api/inquiries`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.CONTRIBUTOR] in [route.ts:requireRole]

## Side Effects
- Mutates database records (create) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
