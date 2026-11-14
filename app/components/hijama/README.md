# hijama

## Overview
Client and server React UI components for hijama.

## Interface
- `CUPPING_REASONS` in [HijamaBookingModal.tsx:CUPPING_REASONS]
- `HijamaBookingModalProps` in [HijamaBookingModal.tsx:HijamaBookingModalProps]
- `HijamaBookingModal` (default export) in [HijamaBookingModal.tsx:HijamaBookingModal]
- `HijamaSunnahCalendarProps` in [HijamaSunnahCalendar.tsx:HijamaSunnahCalendarProps]
- `HijamaSunnahCalendar` (default export) in [HijamaSunnahCalendar.tsx:HijamaSunnahCalendar]

## Invariants
- Requires user session context in [HijamaBookingModal.tsx:session]
- Enforces staff separation from patient actions in [HijamaBookingModal.tsx:isStaffRole]

## Side Effects
- None

## Verification
- Run: `npm run build`
