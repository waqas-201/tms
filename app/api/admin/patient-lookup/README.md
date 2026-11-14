# patient-lookup

## Overview
Next.js API route endpoint for `/api/admin/patient-lookup`.

## Interface
- `GET` handler in [route.ts:GET]

## Invariants
- Requires authenticated user session in [route.ts:getSession]
- Enforces staff separation from patient actions in [route.ts:isStaffRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
