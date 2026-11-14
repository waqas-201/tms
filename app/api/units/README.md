# units

## Overview
Next.js API route endpoint for `/api/units`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/units/[id]`.

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- Mutates database records (create, update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
