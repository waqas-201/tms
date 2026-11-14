# prisma

## Overview
Prisma ORM schema models, migrations, and database seed scripts.

## Interface
- `User` model in [schema.prisma:User]
- `Session` model in [schema.prisma:Session]
- `Account` model in [schema.prisma:Account]
- `Verification` model in [schema.prisma:Verification]
- `BootstrapKey` model in [schema.prisma:BootstrapKey]
- `Category` model in [schema.prisma:Category]
- `Product` model in [schema.prisma:Product]
- `Unit` model in [schema.prisma:Unit]
- `StockMovement` model in [schema.prisma:StockMovement]
- `ProductSize` model in [schema.prisma:ProductSize]
- `Order` model in [schema.prisma:Order]
- `OrderItem` model in [schema.prisma:OrderItem]
- `ConsultationSetting` model in [schema.prisma:ConsultationSetting]
- `ConsultationRequest` model in [schema.prisma:ConsultationRequest]
- `ClinicSchedule` model in [schema.prisma:ClinicSchedule]
- `ClinicHoliday` model in [schema.prisma:ClinicHoliday]
- `ContactInquiry` model in [schema.prisma:ContactInquiry]
- `Review` model in [schema.prisma:Review]
- `PaymentRecord` model in [schema.prisma:PaymentRecord]
- `HijamaBooking` model in [schema.prisma:HijamaBooking]
- `HijamaScheduleConfig` model in [schema.prisma:HijamaScheduleConfig]
- `HijamaSetting` model in [schema.prisma:HijamaSetting]
- `DeliverySetting` model in [schema.prisma:DeliverySetting]
- `Coupon` model in [schema.prisma:Coupon]
- `CouponRedemption` model in [schema.prisma:CouponRedemption]
- `AdminNotification` model in [schema.prisma:AdminNotification]
- `HijamaDateOverride` model in [schema.prisma:HijamaDateOverride]
- `run` script function in [seed.js:run]
- `main` script function in [seed.ts:main]
- Subdirectories:
  - [migrations](./migrations/README.md) - Prisma ORM schema models, migrations, and database seed scripts.

## Invariants
- Requires verified customer email address in [schema.prisma:emailVerified]

## Side Effects
- Mutates database records (upsert) via Prisma in [seed.js:prisma]
- Mutates database records (upsert) via Prisma in [seed.ts:prisma]

## Verification
- Run: `npm run build`
