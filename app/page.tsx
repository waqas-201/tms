import React from "react";
import HeroSection from "@/app/components/HeroSection";
import ClinicalSpecialtiesSection from "@/app/components/ClinicalSpecialtiesSection";
import PrescribedRemediesSection from "@/app/components/PrescribedRemediesSection";
import HakimAuthoritySection from "@/app/components/HakimAuthoritySection";
import CommunityReviewsSection from "@/app/components/CommunityReviewsSection";
import WhatsAppConsultationBanner from "@/app/components/WhatsAppConsultationBanner";

export default function Home() {
  return (
    <>
      {/* 1. Clinical Healthcare Hero (Goal-focused, fast triage, proof badge) */}
      <HeroSection />

      {/* 2. Clinical Specialties & What We Treat (6 core conditions, Unani root causes) */}
      <ClinicalSpecialtiesSection />

      {/* 3. Curated Physician-Formulated Remedies (Live apothecary dispensary grid) */}
      <PrescribedRemediesSection />

      {/* 4. Hakim Authority & Physical Karachi Clinic Visit (Lineage, standards & Matab details) */}
      <HakimAuthoritySection />

      {/* 5. Patient Social Proof (5.0★ Google reviews & community recovery stories) */}
      <CommunityReviewsSection />

      {/* 6. Final High-Intent WhatsApp Consultation Triage Banner */}
      <WhatsAppConsultationBanner />
    </>
  );
}
