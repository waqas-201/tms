# [userId]

## Overview
Next.js API route endpoint for `/api/admin/loyalty/[userId]`.

## Interface
- `GET` handler in [route.ts:GET]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.SUPER_ADMIN] in [route.ts:requireRole]

## Side Effects
- None (read-only query)

## Verification
- Run: `npm run build`
