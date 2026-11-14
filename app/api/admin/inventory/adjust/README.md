# adjust

## Overview
Next.js API route endpoint for `/api/admin/inventory/adjust`.

## Interface
- `POST` handler in [route.ts:POST]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN] in [route.ts:requireRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
