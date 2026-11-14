# movements

## Overview
Next.js API route endpoint for `/api/admin/inventory/movements`.

## Interface
- `GET` handler in [route.ts:GET]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
