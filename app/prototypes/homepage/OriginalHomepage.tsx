import React from "react";
import HeroSection from "@/app/components/HeroSection";
import ClinicalSpecialtiesSection from "@/app/components/ClinicalSpecialtiesSection";
import HijamaCalendarSection from "@/app/components/HijamaCalendarSection";
import PrescribedRemediesSection from "@/app/components/PrescribedRemediesSection";
import HakimAuthoritySection from "@/app/components/HakimAuthoritySection";

/**
 * Original baseline homepage components
 */
export default function OriginalHomepage() {
  return (
    <>
      {/* 1. Clinical Healthcare Hero */}
      <HeroSection />

      {/* 2. Clinical Specialties & What We Treat */}
      <ClinicalSpecialtiesSection />

      {/* 3. Sunnah Hijama Calendar */}
      <HijamaCalendarSection />

      {/* 4. Curated Physician-Formulated Remedies */}
      <PrescribedRemediesSection />

      {/* 5. Hakeem Authority & Physical Karachi Clinic Visit */}
      <HakimAuthoritySection />
    </>
  );
}
