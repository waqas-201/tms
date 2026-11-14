# Tameer-e-Sehat (TMS) Blueprint

## System Overview
Tameer-e-Sehat (TMS) is a full-stack Next.js healthcare and herbal apothecary platform providing online consultations, Hijama appointment scheduling, e-commerce order fulfillment, customer accounts, and role-based staff administration.

### Preserved Getting Started & Developer Notes
```bash
npm run dev
# or yarn dev / pnpm dev / bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

- [House Rules & Conventions](docs/conventions.md) — Coding conventions, form architecture (React Hook Form + draft persistence), data fetching (TanStack Query), and code standards.
- [Architecture Decision Records](docs/adr/) — Architectural decisions (e.g., [ADR 0001: Motion System](docs/adr/0001-motion-system.md)).

## Local Interface & Invariants
- `colorGuardConfig` in [eslint.color-guard.mjs:colorGuardConfig]
- `default` (default export) in [eslint.colors.config.mjs:default]
- `eslintConfig` (default export) in [eslint.config.mjs:eslintConfig]
- `nextConfig` (default export) in [next.config.ts:nextConfig]
- `defineConfig` (default export) in [playwright.config.ts:defineConfig]
- `config` (default export) in [postcss.config.mjs:config]
- `defineConfig` (default export) in [prisma.config.ts:defineConfig]
- CLI script routine in [shot-register.mjs:run]

## Subdirectories & System Boundaries
- [app](./app/README.md) - Next.js App Router page and layout route for `/`.
- [components](./components/README.md) - Shared design system UI components.
- [lib](./lib/README.md) - Core business logic, database client, auth, and backend domain utilities.
- [prisma](./prisma/README.md) - Prisma ORM schema models, migrations, and database seed scripts.
- [scripts](./scripts/README.md) - Operational scripts, standalone tests, and system verification routines.

## Global Invariants
- Role-Based Access Control (RBAC): Sensitive administrative routes enforce `ADMIN`, `EDITOR`, or `SUPER_ADMIN` roles via `requireRole` [lib/rbac.ts:requireRole].
- Verification Requirements: Customer accounts must maintain verified email status prior to order submission or clinical booking [app/api/orders/route.ts:emailVerified].
- Inventory Reservation Atomicity: Product stock must be verified and reserved atomically to prevent race conditions and overselling [lib/inventory.ts:reserveStockForOrder].

## Global Side Effects
- PostgreSQL Database: Persistent relational storage managed via Prisma Client [lib/prisma.ts:prisma].
- Email Dispatch: Outbound transactional notifications and order invoices sent via Resend API [lib/email.ts:email].
- Asset Storage: Prescription reports and product media stored via UploadThing [lib/uploadthing.ts:uploadthing].

## System Verification
- Run: `npm run build`
