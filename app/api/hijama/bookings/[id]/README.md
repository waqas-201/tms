# [id]

## Overview
Next.js API route endpoint for `/api/hijama/bookings/[id]`.

## Interface
- `GET` handler in [route.ts:GET]
- `PATCH` handler in [route.ts:PATCH]

## Invariants
- Enforces staff separation from patient actions in [route.ts:isStaffRole]
- Requires authenticated user session with roles [staff roles] in [route.ts:requireRole]

## Side Effects
- Mutates database records (update) via Prisma in [route.ts:prisma]

## Verification
- Run: `npm run build`
