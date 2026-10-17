# Graph Report - app  (2026-10-16)

## Corpus Check
- 109 files · ~188,284 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: .ico 1, .css 1)

## Summary
- 449 nodes · 1069 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Storefront UI Components
- Product Catalog & Cart Context
- Entity CRUD API Routes
- Admin Dashboard & Operations
- Route Layouts & Metadata
- Consultation & Auth API
- Global Overlays & Scroll Sync
- User Authentication Pages
- Voice Consultation Audio Handler
- Google Reviews API Integration
- Product Detail Layout Handler
- Inventory Units Manager Modal

## God Nodes (most connected - your core abstractions)
1. `Reveal()` - 37 edges
2. `CLINIC_INFO` - 31 edges
3. `useCart()` - 19 edges
4. `useConsultation()` - 17 edges
5. `Product` - 16 edges
6. `ProductCard()` - 13 edges
7. `AdminDashboardPage()` - 11 edges
8. `RootLayout()` - 10 edges
9. `Header()` - 8 edges
10. `ProductSize` - 8 edges

## Surprising Connections (you probably didn't know these)
- `CheckoutPage()` --calls--> `useCart()`  [EXTRACTED]
  checkout/page.tsx → context/CartContext.tsx
- `CartDrawer()` --calls--> `useCart()`  [EXTRACTED]
  components/CartDrawer.tsx → context/CartContext.tsx
- `RootLayout()` --calls--> `Footer()`  [EXTRACTED]
  layout.tsx → components/Footer.tsx
- `Header()` --calls--> `useCart()`  [EXTRACTED]
  components/Header.tsx → context/CartContext.tsx
- `RootLayout()` --calls--> `Header()`  [EXTRACTED]
  layout.tsx → components/Header.tsx

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "Storefront UI Components"
Cohesion: 0.06
Nodes (48): metadata, BrandLogo(), BrandLogoProps, CaseStudy, CLINICAL_CASES, ClinicalOutcomesSection(), ClinicalSpecialtiesSection(), SYMPTOM_CHIPS (+40 more)

### Community 1 - "Product Catalog & Cart Context"
Cohesion: 0.06
Nodes (29): AccountPage(), CheckoutPage(), PAKISTAN_CITIES, FeaturedProductsSection(), ProductCard(), ProductCardProps, ProductQuickViewModal(), ProductQuickViewModalProps (+21 more)

### Community 3 - "Admin Dashboard & Operations"
Cohesion: 0.05
Nodes (38): AdminDashboardPage(), AdminTab, TABS, CategoriesTab(), CategoryItem, PRESET_UNANI_CATEGORIES, ClinicScheduleTab(), DAY_NAMES (+30 more)

### Community 4 - "Route Layouts & Metadata"
Cohesion: 0.05
Nodes (17): metadata, AdminFallback(), AdminLayout(), metadata, metadata, metadata, metadata, metadata (+9 more)

### Community 5 - "Consultation & Auth API"
Cohesion: 0.06
Nodes (8): GET, POST, f, OurFileRouter, GET, POST, LoginForm(), LoginPage()

### Community 6 - "Global Overlays & Scroll Sync"
Cohesion: 0.11
Nodes (18): CartDrawer(), ConsultationModal(), ConsultationModalProps, QUICK_SYMPTOM_TAGS, LenisRouteSync(), SmoothScroll(), SmoothScrollProps, WhatsAppFloat() (+10 more)

### Community 7 - "User Authentication Pages"
Cohesion: 0.09
Nodes (10): COMMON_CUSTOM_SUGGESTIONS, SYMPTOM_CATEGORIES, SymptomCategory, TimeSlot, RegisterForm(), RegisterPage(), ResetPasswordForm(), ResetPasswordPage() (+2 more)

### Community 8 - "Voice Consultation Audio Handler"
Cohesion: 0.28
Nodes (6): ensureDirectory(), GET(), memoryAudioStore, POST(), renderAudioHtmlPlayer(), UPLOAD_DIR

### Community 9 - "Google Reviews API Integration"
Cohesion: 0.38
Nodes (6): AVATAR_COLORS, formatRelativeDate(), GET(), getAvatarInitials(), GoogleReviewsResponse, LiveReviewItem

### Community 10 - "Product Detail Layout Handler"
Cohesion: 0.60
Nodes (4): generateMetadata(), getProductBySlugOrId(), ProductDetailLayout(), Props

## Knowledge Gaps
- **1 isolated node(s):** `DEFAULT_CATEGORIES`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 200 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reveal()` connect `Storefront UI Components` to `Product Catalog & Cart Context`, `User Authentication Pages`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `DEFAULT_CATEGORIES` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Storefront UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05942571785268414 - nodes in this community are weakly interconnected._
- **Why does `CLINIC_INFO` connect `Storefront UI Components` to `Product Catalog & Cart Context`, `Admin Dashboard & Operations`, `Route Layouts & Metadata`, `Global Overlays & Scroll Sync`, `User Authentication Pages`, `Google Reviews API Integration`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Should `Product Catalog & Cart Context` be split into smaller, more focused modules?**
  _Cohesion score 0.061458718992965566 - nodes in this community are weakly interconnected._
- **Should `Entity CRUD API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.056051587301587304 - nodes in this community are weakly interconnected._
- **Should `Admin Dashboard & Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.0531986531986532 - nodes in this community are weakly interconnected._