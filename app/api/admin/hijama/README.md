# hijama

## Overview
Next.js API route endpoint for `/api/admin/hijama`.

## Interface
- `GET` handler in [route.ts:GET]
- `PUT` handler in [route.ts:PUT]
- Subdirectories:
  - [[id]](./[id]/README.md) - Next.js API route endpoint for `/api/admin/hijama/[id]`.

## Invariants
- Requires authenticated user session in [route.ts:getSession]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
