# login

## Overview
Next.js App Router page and layout route for `/login`.

## Interface
- `metadata` in [layout.tsx:metadata]
- `LoginLayout` (default export) in [layout.tsx:LoginLayout]
- `LoginPage` (default export) in [page.tsx:LoginPage]

## Invariants
- Enforces staff separation from patient actions in [page.tsx:isStaffRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
