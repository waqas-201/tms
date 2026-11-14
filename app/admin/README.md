# admin

## Overview
Next.js App Router page and layout route for `/admin`.

## Interface
- `metadata` in [layout.tsx:metadata]
- `AdminLayout` (default export) in [layout.tsx:AdminLayout]
- `AdminDashboardPage` (default export) in [page.tsx:AdminDashboardPage]

## Invariants
- Enforces staff separation from patient actions in [page.tsx:isStaffRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
