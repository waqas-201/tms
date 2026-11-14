# notifications

## Overview
Next.js API route endpoint for `/api/admin/notifications`.

## Interface
- `GET` handler in [route.ts:GET]
- `PATCH` handler in [route.ts:PATCH]

## Invariants
- Requires authenticated user session with roles [staff roles] in [route.ts:requireRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
