# reviews

## Overview
Next.js API route endpoint for `/api/reviews`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- Subdirectories:
  - [google](./google/README.md) - Next.js API route endpoint for `/api/reviews/google`.

## Invariants
- None

## Side Effects
- Mutates database records (create, update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
