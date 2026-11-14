# super-admin

## Overview
Next.js API route endpoint for `/api/setup/super-admin`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]

## Invariants
- Requires verified customer email address in [route.ts:emailVerified]

## Side Effects
- Mutates database records (update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
