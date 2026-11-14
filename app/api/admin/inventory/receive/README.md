# receive

## Overview
Next.js API route endpoint for `/api/admin/inventory/receive`.

## Interface
- `POST` handler in [route.ts:POST]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
