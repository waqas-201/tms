# send-invoice

## Overview
Next.js API route endpoint for `/api/orders/[id]/send-invoice`.

## Interface
- `POST` handler in [route.ts:POST]

## Invariants
- Requires authenticated user session with roles [ROLES.ADMIN, ROLES.EDITOR] in [route.ts:requireRole]

## Side Effects
- Dispatches external emails via Resend in [route.ts:email]

## Verification
- Run: `npm run build`
