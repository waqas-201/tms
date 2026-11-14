# 0_init

## Overview
Prisma ORM schema models, migrations, and database seed scripts.

## Interface
- `user` table DDL in [migration.sql:user]
- `session` table DDL in [migration.sql:session]
- `account` table DDL in [migration.sql:account]
- `verification` table DDL in [migration.sql:verification]
- `bootstrap_key` table DDL in [migration.sql:bootstrap_key]
- `Category` table DDL in [migration.sql:Category]
- `Product` table DDL in [migration.sql:Product]
- `Unit` table DDL in [migration.sql:Unit]
- `StockMovement` table DDL in [migration.sql:StockMovement]
- `ProductSize` table DDL in [migration.sql:ProductSize]
- `Order` table DDL in [migration.sql:Order]
- `OrderItem` table DDL in [migration.sql:OrderItem]
- `consultation_setting` table DDL in [migration.sql:consultation_setting]
- `ConsultationRequest` table DDL in [migration.sql:ConsultationRequest]
- `clinic_schedule` table DDL in [migration.sql:clinic_schedule]
- `clinic_holiday` table DDL in [migration.sql:clinic_holiday]
- `ContactInquiry` table DDL in [migration.sql:ContactInquiry]
- `Review` table DDL in [migration.sql:Review]
- `PaymentRecord` table DDL in [migration.sql:PaymentRecord]
- `hijama_booking` table DDL in [migration.sql:hijama_booking]
- `hijama_schedule_config` table DDL in [migration.sql:hijama_schedule_config]
- `hijama_setting` table DDL in [migration.sql:hijama_setting]
- `delivery_setting` table DDL in [migration.sql:delivery_setting]
- `coupon` table DDL in [migration.sql:coupon]
- `coupon_redemption` table DDL in [migration.sql:coupon_redemption]
- `admin_notification` table DDL in [migration.sql:admin_notification]
- `hijama_date_override` table DDL in [migration.sql:hijama_date_override]
- `user_email_key` unique index DDL in [migration.sql:user_email_key]
- `session_token_key` unique index DDL in [migration.sql:session_token_key]
- `bootstrap_key_keyHash_key` unique index DDL in [migration.sql:bootstrap_key_keyHash_key]
- `Category_slug_key` unique index DDL in [migration.sql:Category_slug_key]
- `Product_slug_key` unique index DDL in [migration.sql:Product_slug_key]
- `Unit_code_key` unique index DDL in [migration.sql:Unit_code_key]
- `ProductSize_sku_key` unique index DDL in [migration.sql:ProductSize_sku_key]
- `Order_orderNumber_key` unique index DDL in [migration.sql:Order_orderNumber_key]
- `ConsultationRequest_ticketNumber_key` unique index DDL in [migration.sql:ConsultationRequest_ticketNumber_key]
- `clinic_schedule_dayOfWeek_key` unique index DDL in [migration.sql:clinic_schedule_dayOfWeek_key]
- `clinic_holiday_date_key` unique index DDL in [migration.sql:clinic_holiday_date_key]
- `hijama_booking_ticketNumber_key` unique index DDL in [migration.sql:hijama_booking_ticketNumber_key]
- `hijama_schedule_config_dayOfWeek_key` unique index DDL in [migration.sql:hijama_schedule_config_dayOfWeek_key]
- `coupon_code_key` unique index DDL in [migration.sql:coupon_code_key]
- `hijama_date_override_date_key` unique index DDL in [migration.sql:hijama_date_override_date_key]

## Invariants
- Relational database schema migration in [migration.sql:DDL]

## Side Effects
- Applies DDL schema changes to PostgreSQL in [migration.sql:DDL]

## Verification
- Run: `npm run build`
