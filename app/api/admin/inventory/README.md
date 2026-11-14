# inventory

## Overview
Next.js API route endpoint for `/api/admin/inventory`.

## Interface
- `GET` handler in [route.ts:GET]
- Subdirectories:
  - [adjust](./adjust/README.md) - Next.js API route endpoint for `/api/admin/inventory/adjust`.
  - [movements](./movements/README.md) - Next.js API route endpoint for `/api/admin/inventory/movements`.
  - [receive](./receive/README.md) - Next.js API route endpoint for `/api/admin/inventory/receive`.

## Invariants
- Enforces available stock sufficiency before reservation in [route.ts:getAvailableStock]
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
