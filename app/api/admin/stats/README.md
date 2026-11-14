# stats

## Overview
Next.js API route endpoint for `/api/admin/stats`.

## Interface
- `GET` handler in [route.ts:GET]

## Invariants
- Enforces available stock sufficiency before reservation in [route.ts:getAvailableStock]
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
