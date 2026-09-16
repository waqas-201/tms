import React from "react";
import HeroSection from "@/app/components/HeroSection";
import ProblemAgitationSection from "@/app/components/ProblemAgitationSection";
import TrustPillarsSection from "@/app/components/TrustPillarsSection";
import ClinicalSpecialtiesSection from "@/app/components/ClinicalSpecialtiesSection";
import HowItWorksSection from "@/app/components/HowItWorksSection";
import HakimAuthoritySection from "@/app/components/HakimAuthoritySection";
// import ClinicalOutcomesSection from "@/app/components/ClinicalOutcomesSection"; // A/B Test Variant: Case Studies
import CommunityReviewsSection from "@/app/components/CommunityReviewsSection";
// import ObjectionHandlingSection from "@/app/components/ObjectionHandlingSection"; // A/B Test Variant: FAQ Accordion
// import CommunityQASection from "@/app/components/CommunityQASection"; // A/B Test Variant: Q&A Forum
// import PrescribedRemediesSection from "@/app/components/PrescribedRemediesSection"; // A/B Test Variant: Apothecary Remedies Grid
// import ClinicVisitingSection from "@/app/components/ClinicVisitingSection"; // A/B Test Variant: In-Person Karachi Clinic Card
import WhatsAppConsultationBanner from "@/app/components/WhatsAppConsultationBanner";

export default function Home() {
  return (
    <>
      {/* 1. Clinical Healthcare Hero with Dual Online / Clinic Booking Card (Active) */}
      <HeroSection />

      {/* 2. Problem & Agitation — why conventional treatment keeps failing (Active) */}
      <ProblemAgitationSection />

      {/* 3. Clinical Standards & Trust Credentials (Trust Bar) (Active) */}
      <TrustPillarsSection />

      {/* 4. The 6 Core Clinical Specializations & What We Treat (Active) */}
      <ClinicalSpecialtiesSection />

      {/* 5. How It Works — simple 3-step healing process (Active) */}
      <HowItWorksSection />

      {/* 6. Hakim Clinical Authority, Pedigree & Roots (Active) */}
      <HakimAuthoritySection />

      {/* [A/B Test Variant] 7. Documented Patient Recoveries & Case Studies (Commented Out for Testing) */}
      {/* <ClinicalOutcomesSection /> */}

      {/* 7. Verified Google Reviews & Patient Community Social Proof (Active) */}
      <CommunityReviewsSection />

      {/* [A/B Test Variant] 9. Objection Handling — FAQ answering common doubts (Commented Out for Testing) */}
      {/* <ObjectionHandlingSection /> */}

      {/* [A/B Test Variant] 10. Community Health Knowledge Base & Hakim Q&A Forum (Commented Out for Testing) */}
      {/* <CommunityQASection /> */}

      {/* [A/B Test Variant] 11. Physician-Formulated Apothecary Remedies (Commented Out for Testing) */}
      {/* <PrescribedRemediesSection /> */}

      {/* [A/B Test Variant] 12. Physical Karachi Clinic Visit, Hours & Map Directions (Commented Out for Testing) */}
      {/* <ClinicVisitingSection /> */}

      {/* 8. Final CTA — Direct WhatsApp Urgent Consultation Helpline (Active) */}
      <WhatsAppConsultationBanner />
    </>
  );
}