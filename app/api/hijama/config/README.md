# config

## Overview
Next.js API route endpoint for `/api/hijama/config`.

## Interface
- `GET` handler in [route.ts:GET]
- `POST` handler in [route.ts:POST]
- `PATCH` handler in [route.ts:PATCH]
- `DELETE` handler in [route.ts:DELETE]

## Invariants
- Requires authenticated user session with roles [staff roles] in [route.ts:requireRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
