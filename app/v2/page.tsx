import React from "react";
import type { Metadata } from "next";
import HeroSymptomTriage from "@/app/components/v2/HeroSymptomTriage";
import ClinicalSpecialtiesV2 from "@/app/components/v2/ClinicalSpecialtiesV2";
import CuratedRemediesGrid from "@/app/components/v2/CuratedRemediesGrid";
import HakimTrustCard from "@/app/components/v2/HakimTrustCard";
import PatientStories from "@/app/components/v2/PatientStories";
import WhatsAppConsultationBanner from "@/app/components/WhatsAppConsultationBanner";
import StickyMobileBar from "@/app/components/v2/StickyMobileBar";

export const metadata: Metadata = {
  title: "Tameer-e-Sehat | Mobile-First Herbal Care & Hakim Consultation",
  description:
    "Fast, empathetic, symptom-first Unani care by Hakim Muhammad Tariq. Pure steam-distilled Arqiyat and organic preserves with Cash on Delivery across Pakistan.",
};

export default function V2HomePage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pb-20 sm:pb-0">
      {/* 1. Clinical Healthcare Hero with Symptom-First Smart Triage */}
      <HeroSymptomTriage />

      {/* 2. Clinical Specialties & What We Treat (Scannable Department Cards) */}
      <ClinicalSpecialtiesV2 />

      {/* 3. Physician-Formulated Apothecary Dispensary Grid */}
      <CuratedRemediesGrid />

      {/* 4. Hakim Authority & Karachi Clinic Pedigree Profile */}
      <HakimTrustCard />

      {/* 5. Patient Outcomes & Google Social Proof */}
      <PatientStories />

      {/* 6. High-Intent Direct WhatsApp Consultation Banner */}
      <WhatsAppConsultationBanner />

      {/* 7. Persistent Mobile Bottom Sticky Action Bar */}
      <StickyMobileBar />
    </main>
  );
}
