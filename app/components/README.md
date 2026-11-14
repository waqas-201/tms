# components

## Overview
Client and server React UI components for shared.

## Interface
- `BotanicalEmblem` in [BrandLogo.tsx:BotanicalEmblem]
- `BrandLogoProps` in [BrandLogo.tsx:BrandLogoProps]
- `BrandLogo` (default export) in [BrandLogo.tsx:BrandLogo]
- `CartDrawer` (default export) in [CartDrawer.tsx:CartDrawer]
- `ClientModals` (default export) in [ClientModals.tsx:ClientModals]
- `ClinicCallCard` (default export) in [ClinicCallCard.tsx:ClinicCallCard]
- `ClinicVisitingSection` (default export) in [ClinicVisitingSection.tsx:ClinicVisitingSection]
- `CLINICAL_CASES` in [ClinicalOutcomesSection.tsx:CLINICAL_CASES]
- `CaseStudy` in [ClinicalOutcomesSection.tsx:CaseStudy]
- `ClinicalOutcomesSection` (default export) in [ClinicalOutcomesSection.tsx:ClinicalOutcomesSection]
- `ClinicalSpecialtiesSection` (default export) in [ClinicalSpecialtiesSection.tsx:ClinicalSpecialtiesSection]
- `CommunityQASection` (default export) in [CommunityQASection.tsx:CommunityQASection]
- `PatientStory` in [CommunityReviewsSection.tsx:PatientStory]
- `CommunityReviewsSection` (default export) in [CommunityReviewsSection.tsx:CommunityReviewsSection]
- `AttachedReportFile` in [ConsultationModal.tsx:AttachedReportFile]
- `ConsultationModalProps` in [ConsultationModal.tsx:ConsultationModalProps]
- `ConsultationModal` (default export) in [ConsultationModal.tsx:ConsultationModal]
- `ConsultationProcessSection` (default export) in [ConsultationProcessSection.tsx:ConsultationProcessSection]
- `FeaturedProductsSection` (default export) in [FeaturedProductsSection.tsx:FeaturedProductsSection]
- `Footer` (default export) in [Footer.tsx:Footer]
- `HakimAuthoritySection` (default export) in [HakimAuthoritySection.tsx:HakimAuthoritySection]
- `HakimIntroSection` (default export) in [HakimIntroSection.tsx:HakimIntroSection]
- `SHOP_SUBMENU_ITEMS` in [Header.tsx:SHOP_SUBMENU_ITEMS]
- `Header` (default export) in [Header.tsx:Header]
- `HeroSection` (default export) in [HeroSection.tsx:HeroSection]
- `HijamaCalendarSection` (default export) in [HijamaCalendarSection.tsx:HijamaCalendarSection]
- `HijamaHeroWidget` (default export) in [HijamaHeroWidget.tsx:HijamaHeroWidget]
- `HowItWorksSection` (default export) in [HowItWorksSection.tsx:HowItWorksSection]
- `InvoicePrintButton` (default export) in [InvoicePrintButton.tsx:InvoicePrintButton]
- `MarketingFlashBanner` (default export) in [MarketingFlashBanner.tsx:MarketingFlashBanner]
- `ObjectionHandlingSection` (default export) in [ObjectionHandlingSection.tsx:ObjectionHandlingSection]
- `OrderInvoiceModal` (default export) in [OrderInvoiceModal.tsx:OrderInvoiceModal]
- `PrescribedRemediesSection` (default export) in [PrescribedRemediesSection.tsx:PrescribedRemediesSection]
- `ProblemAgitationSection` (default export) in [ProblemAgitationSection.tsx:ProblemAgitationSection]
- `ProductCard` (default export) in [ProductCard.tsx:ProductCard]
- `DEFAULT_CATEGORIES` in [ProductFormModal.tsx:DEFAULT_CATEGORIES]
- `ProductFormModal` (default export) in [ProductFormModal.tsx:ProductFormModal]
- `ProductQuickViewModal` (default export) in [ProductQuickViewModal.tsx:ProductQuickViewModal]
- `QuickAppointmentBooking` (default export) in [QuickAppointmentBooking.tsx:QuickAppointmentBooking]
- `SearchModal` (default export) in [SearchModal.tsx:SearchModal]
- `SlotStripItem` in [SlotStrip.tsx:SlotStripItem]
- `SlotStripProps` in [SlotStrip.tsx:SlotStripProps]
- `SlotStrip` (default export) in [SlotStrip.tsx:SlotStrip]
- `useLenis` in [SmoothScroll.tsx:useLenis]
- `SmoothScroll` (default export) in [SmoothScroll.tsx:SmoothScroll]
- `TestimonialsSection` (default export) in [TestimonialsSection.tsx:TestimonialsSection]
- `Toast` (default export) in [Toast.tsx:Toast]
- `TrustPillarsSection` (default export) in [TrustPillarsSection.tsx:TrustPillarsSection]
- `WhatsAppConsultationBanner` (default export) in [WhatsAppConsultationBanner.tsx:WhatsAppConsultationBanner]
- `WhatsAppFloat` (default export) in [WhatsAppFloat.tsx:WhatsAppFloat]
- Subdirectories:
  - [admin](./admin/README.md) - Client and server React UI components for admin.
  - [hijama](./hijama/README.md) - Client and server React UI components for hijama.
  - [inventory](./inventory/README.md) - Client and server React UI components for inventory.
  - [motion](./motion/README.md) - Client and server React UI components for motion.
  - [sanity](./sanity/README.md) - Client and server React UI components for sanity.

## Invariants
- Requires user session context in [Header.tsx:session]
- Enforces staff separation from patient actions in [ConsultationModal.tsx:isStaffRole]
- Enforces staff separation from patient actions in [Header.tsx:isStaffRole]
- Requires user session context in [HijamaCalendarSection.tsx:session]

## Side Effects
- Uploads files or processes webhooks with UploadThing in [ProductFormModal.tsx:uploadthing]
- Uploads files or processes webhooks with UploadThing in [ConsultationModal.tsx:uploadthing]

## Verification
- Run: `npm run build`
