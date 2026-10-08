import React from "react";
import type { Metadata } from "next";
import HeroSymptomTriage from "@/app/components/v2/HeroSymptomTriage";
import CuratedRemediesGrid from "@/app/components/v2/CuratedRemediesGrid";
import HakimTrustCard from "@/app/components/v2/HakimTrustCard";
import PatientStories from "@/app/components/v2/PatientStories";
import StickyMobileBar from "@/app/components/v2/StickyMobileBar";

export const metadata: Metadata = {
  title: "Tameer-e-Sehat | Mobile-First Herbal Care & Hakim Consultation",
  description:
    "Fast, empathetic, symptom-first Unani care by Hakim Muhammad Tariq. Pure steam-distilled Arqiyat and organic preserves with Cash on Delivery across Pakistan.",
};

export default function V2HomePage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pb-20 sm:pb-0">
      {/* 1. Hero & Symptom-First Empathy Triage */}
      <HeroSymptomTriage />

      {/* 2. Top Curated Natural Remedies Grid (2-Col Mobile) */}
      <CuratedRemediesGrid />

      {/* 3. Hakim Authority & Physical Karachi Clinic Card */}
      <HakimTrustCard />

      {/* 4. Patient Social Proof & Recovery Stories */}
      <PatientStories />

      {/* 5. Persistent Mobile Sticky Action Bar */}
      <StickyMobileBar />
    </main>
  );
}
