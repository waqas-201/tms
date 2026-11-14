# context

## Overview
Next.js App Router page and layout route for `/context`.

## Interface
- `CartProvider` in [CartContext.tsx:CartProvider]
- `useCart` in [CartContext.tsx:useCart]
- `CartItem` in [CartContext.tsx:CartItem]
- `AppliedCoupon` in [CartContext.tsx:AppliedCoupon]
- `ConsultationProvider` in [ConsultationContext.tsx:ConsultationProvider]
- `useConsultation` in [ConsultationContext.tsx:useConsultation]
- `ConsultationContext` in [ConsultationContext.tsx:ConsultationContext]
- `ConsultationMode` in [ConsultationContext.tsx:ConsultationMode]
- `OpenConsultationOptions` in [ConsultationContext.tsx:OpenConsultationOptions]
- `ConsultationContextType` in [ConsultationContext.tsx:ConsultationContextType]
- `ConsultationContext` (default export) in [ConsultationContext.tsx:ConsultationContext]

## Invariants
- Enforces staff separation from patient actions in [CartContext.tsx:isStaffRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
