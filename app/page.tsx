import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/app/components/HeroSection";
import ClinicalSpecialtiesSection from "@/app/components/ClinicalSpecialtiesSection";
import HijamaCalendarSection from "@/app/components/HijamaCalendarSection";
import PrescribedRemediesSection from "@/app/components/PrescribedRemediesSection";
import HakimAuthoritySection from "@/app/components/HakimAuthoritySection";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};

export default function Home() {
  return (
    <>
      {/* 1. Clinical Healthcare Hero (Goal-focused, fast triage, proof badge) */}
      <HeroSection />

      {/* 2. Clinical Specialties & What We Treat (6 core conditions, Unani root causes) */}
      <ClinicalSpecialtiesSection />

      {/* 3. Sunnah Hijama Calendar — emphasized booking section with countdown, calendar, & live slots */}
      <HijamaCalendarSection />

      {/* 4. Curated Physician-Formulated Remedies (Live apothecary dispensary grid) */}
      <PrescribedRemediesSection />

      {/* 5. Hakeem Authority & Physical Karachi Clinic Visit (Lineage, standards & Matab details) */}
      <HakimAuthoritySection />
    </>
  );
}
