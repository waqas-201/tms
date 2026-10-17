# Graph Report - tms  (2026-10-16)

## Corpus Check
- 157 files · ~3,710,959 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 83 file(s) not represented in the graph (top: .woff2 20, .ttf 20, .eot 18)

## Summary
- 777 nodes · 1766 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `468e2cb4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Reveal
- products.ts
- social-media-creator.md
- Design System Inspired by Tameere Sehat
- next
- uploadthing.ts
- app/layout.tsx
- isStaffRole
- voice/route.ts
- react
- dependencies
- auth-client.ts
- admin/page.tsx
- CLINIC_INFO
- package.json
- compilerOptions
- useConsultation
- lucide-react
- analyze-wc.ts
- import-wc-products.ts
- seed.js
- ProductFormModal.tsx
- devDependencies
- check-variations.ts
- ConsultationContext.tsx
- consultation/page.tsx
- Tameer-e-Sehat — Murabba Baans (Bamboo Preserve) Deliverable
- seed.ts
- google/route.ts
- scripts
- @playwright/test
- ClinicScheduleTab.tsx
- ProductsTab.tsx
- StockTab.tsx
- UnitsTab.tsx
- AGENTS.md
- eslint.config.mjs
- README.md
- pg
- react
- ref_path
- admin/layout.tsx
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `react` - 84 edges
2. `next` - 81 edges
3. `lucide-react` - 62 edges
4. `Reveal()` - 37 edges
5. `requireRole()` - 36 edges
6. `CLINIC_INFO` - 32 edges
7. `prisma` - 32 edges
8. `cn()` - 27 edges
9. `getSafeProductImage()` - 23 edges
10. `ROLES` - 22 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --indirect_call--> `formatProductRecord()`  [INFERRED]
  app/api/products/route.ts → lib/catalog.ts
- `AccountPage()` --calls--> `signOut`  [EXTRACTED]
  app/account/page.tsx → lib/auth-client.ts
- `AccountPage()` --calls--> `useSession`  [EXTRACTED]
  app/account/page.tsx → lib/auth-client.ts
- `AccountPage()` --calls--> `isStaffRole()`  [EXTRACTED]
  app/account/page.tsx → lib/rbac-base.ts
- `AdminDashboardPage()` --calls--> `signOut`  [EXTRACTED]
  app/admin/page.tsx → lib/auth-client.ts

## Import Cycles
- None detected.

## Communities (44 total, 5 thin omitted)

### Community 0 - "Reveal"
Cohesion: 0.12
Nodes (19): CaseStudy, CLINICAL_CASES, ClinicalOutcomesSection(), COMMUNITY_QA_DATA, CommunityQASection(), QAItem, ConsultationProcessSection(), HakimIntroSection() (+11 more)

### Community 1 - "products.ts"
Cohesion: 0.05
Nodes (68): AccountPage(), CheckoutPage(), PAKISTAN_CITIES, CartDrawer(), FeaturedProductsSection(), ProductCard(), ProductCardProps, ProductQuickViewModal() (+60 more)

### Community 2 - "social-media-creator.md"
Cohesion: 0.05
Nodes (39): 10. PSYCHOLOGY, 11. COPYWRITING, 12. COPY EDITING, 13. VISUAL STRATEGY, 14. IMAGE/POST PRODUCTION PROMPT, 15. FINAL DELIVERABLE, 16. ASSUMPTIONS, 17. QUALITY GATE (+31 more)

### Community 3 - "Design System Inspired by Tameere Sehat"
Cohesion: 0.06
Nodes (35): 10. CSS Custom Properties, 1. Visual Theme & Atmosphere, 2. Color Palette & Roles, 3. Typography Rules, 4. Component Stylings, 5. Layout Principles, 6. Depth & Elevation, 7. Do's and Don'ts (+27 more)

### Community 4 - "next"
Cohesion: 0.05
Nodes (66): POST(), GET(), POST(), GET(), GET(), DELETE(), PATCH(), GET() (+58 more)

### Community 5 - "uploadthing.ts"
Cohesion: 0.21
Nodes (9): f, OurFileRouter, GET, POST, UploadButton, uploadFiles, useUploadThing, uploadthing (+1 more)

### Community 6 - "app/layout.tsx"
Cohesion: 0.11
Nodes (21): BrandLogo(), BrandLogoProps, ConsultationModal(), Footer(), Header(), SHOP_SUBMENU_ITEMS, SearchModal(), LenisRouteSync() (+13 more)

### Community 7 - "isStaffRole"
Cohesion: 0.10
Nodes (28): DELETE(), GET(), POST(), PUT(), GET(), DELETE(), GET(), PATCH() (+20 more)

### Community 8 - "voice/route.ts"
Cohesion: 0.32
Nodes (6): ensureDirectory(), GET(), memoryAudioStore, POST(), renderAudioHtmlPlayer(), UPLOAD_DIR

### Community 9 - "react"
Cohesion: 0.07
Nodes (7): metadata, metadata, metadata, metadata, metadata, metadata, metadata

### Community 10 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, better-auth, class-variance-authority, clsx, dotenv, framer-motion, lenis, lucide-react (+19 more)

### Community 11 - "auth-client.ts"
Cohesion: 0.14
Nodes (17): LoginForm(), LoginPage(), RegisterForm(), RegisterPage(), ResetPasswordForm(), ResetPasswordPage(), VerifyEmailContent(), executeVerification() (+9 more)

### Community 12 - "admin/page.tsx"
Cohesion: 0.15
Nodes (14): AdminDashboardPage(), AdminTab, TABS, Consultation, ConsultationsTab(), STATUS_BADGES, AdjustStockModal(), AdjustStockModalProps (+6 more)

### Community 13 - "CLINIC_INFO"
Cohesion: 0.15
Nodes (6): metadata, metadata, metadata, CLINIC_INFO, TrackOrderContent(), TrackOrderPage()

### Community 14 - "package.json"
Cohesion: 0.09
Nodes (20): name, prisma, seed, private, version, clsx, postcss, prisma (+12 more)

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 16 - "useConsultation"
Cohesion: 0.19
Nodes (15): ClinicalSpecialtiesSection(), SYMPTOM_CHIPS, CATEGORIES, CommunityReviewsSection(), CURATED_PATIENT_STORIES, PatientStory, HakimAuthoritySection(), CONDITION_CARDS (+7 more)

### Community 17 - "lucide-react"
Cohesion: 0.12
Nodes (10): ReceiveStockModalProps, UnitItem, UnitsManagerModalProps, OrderInvoiceModalProps, FAQS, CLINICAL_SPECIALTIES, Specialty, metadata (+2 more)

### Community 18 - "analyze-wc.ts"
Cohesion: 0.15
Nodes (11): categories, catIdx, content, csvPath, headers, idIdx, imgIdx, nameIdx (+3 more)

### Community 19 - "import-wc-products.ts"
Cohesion: 0.27
Nodes (12): cleanEnglishTitle(), cleanHtml(), CsvProductRow, downloadImage(), extractListItems(), extractUrduName(), normalizeCategory(), parseCSV() (+4 more)

### Community 20 - "seed.js"
Cohesion: 0.17
Nodes (10): content, envPath, fs, adapter, { Pool }, prisma, path, { PrismaClient } (+2 more)

### Community 21 - "ProductFormModal.tsx"
Cohesion: 0.24
Nodes (8): CategoriesTab(), CategoryItem, PRESET_UNANI_CATEGORIES, CategoryItem, FormVariantItem, ProductFormModalProps, UnitItem, UploadDropzone

### Community 22 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, @playwright/test, tsx, @types/node, @types/pg, @types/react (+2 more)

### Community 23 - "check-variations.ts"
Cohesion: 0.20
Nodes (8): allVariations, content, csvPath, CsvRow, headers, parents, rows, variationsByParent

### Community 24 - "ConsultationContext.tsx"
Cohesion: 0.40
Nodes (5): ConsultationModalProps, QUICK_SYMPTOM_TAGS, ConsultationContext, ConsultationMode, react-dom

### Community 25 - "consultation/page.tsx"
Cohesion: 0.28
Nodes (7): QuickAppointmentBooking(), COMMON_CUSTOM_SUGGESTIONS, ConsultationPage(), SYMPTOM_CATEGORIES, SymptomCategory, TimeSlot, useSession

### Community 26 - "Tameer-e-Sehat — Murabba Baans (Bamboo Preserve) Deliverable"
Cohesion: 0.22
Nodes (8): 1. Strategy, 2. Final Post Copy, 3. Visual Direction, 4. Production Prompt, 5. Asset Instructions, 6. Research Notes, 7. Flagged Claims, Tameer-e-Sehat — Murabba Baans (Bamboo Preserve) Deliverable

### Community 27 - "seed.ts"
Cohesion: 0.25
Nodes (6): DEFAULT_UNITS, adapter, pool, prisma, @prisma/adapter-pg, @prisma/client

### Community 28 - "google/route.ts"
Cohesion: 0.38
Nodes (6): AVATAR_COLORS, formatRelativeDate(), GET(), getAvatarInitials(), GoogleReviewsResponse, LiveReviewItem

### Community 29 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, postinstall, start, test:e2e

### Community 31 - "ClinicScheduleTab.tsx"
Cohesion: 0.40
Nodes (4): ClinicScheduleTab(), DAY_NAMES, Holiday, ScheduleDay

### Community 32 - "ProductsTab.tsx"
Cohesion: 0.40
Nodes (4): ProductItem, ProductsTab(), ProductsTabProps, DEFAULT_CATEGORIES

### Community 33 - "StockTab.tsx"
Cohesion: 0.40
Nodes (4): InventoryItem, InventorySummary, StockTab(), StockTabProps

### Community 34 - "UnitsTab.tsx"
Cohesion: 0.40
Nodes (4): PRESET_UNITS, UNIT_KINDS, UnitItem, UnitsTab()

### Community 35 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_YwCeA5dV9PsH@ep-dawn-moon-ax47n6q9.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require", This is NOT the Next.js you know, uncomment next line if you use Prisma <5.10

### Community 36 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 37 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 39 - "react"
Cohesion: 0.17
Nodes (4): metadata, metadata, metadata, react

### Community 41 - "admin/layout.tsx"
Cohesion: 0.67
Nodes (3): AdminFallback(), AdminLayout(), metadata

## Knowledge Gaps
- **11 isolated node(s):** `@radix-ui/react-dropdown-menu`, `@tailwindcss/postcss`, `postcss`, `tailwindcss`, `@types/node` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 367 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `Reveal`, `products.ts`, `app/layout.tsx`, `isStaffRole`, `voice/route.ts`, `react`, `auth-client.ts`, `admin/page.tsx`, `CLINIC_INFO`, `package.json`, `useConsultation`, `lucide-react`, `ProductFormModal.tsx`, `consultation/page.tsx`, `google/route.ts`, `ProductsTab.tsx`, `StockTab.tsx`, `react`, `ref_path`, `admin/layout.tsx`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-dropdown-menu`, `@tailwindcss/postcss`, `postcss` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reveal` be split into smaller, more focused modules?**
  _Cohesion score 0.11954022988505747 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `ProductsTab.tsx`, `products.ts`, `StockTab.tsx`, `UnitsTab.tsx`, `Reveal`, `app/layout.tsx`, `react`, `admin/layout.tsx`, `auth-client.ts`, `admin/page.tsx`, `CLINIC_INFO`, `package.json`, `useConsultation`, `lucide-react`, `ProductFormModal.tsx`, `ConsultationContext.tsx`, `consultation/page.tsx`, `ClinicScheduleTab.tsx`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `products.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05273177232057872 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `ProductsTab.tsx`, `products.ts`, `StockTab.tsx`, `UnitsTab.tsx`, `Reveal`, `app/layout.tsx`, `admin/layout.tsx`, `auth-client.ts`, `admin/page.tsx`, `CLINIC_INFO`, `package.json`, `useConsultation`, `ProductFormModal.tsx`, `ConsultationContext.tsx`, `consultation/page.tsx`, `ClinicScheduleTab.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `social-media-creator.md` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._