import React from "react";
import type { Metadata } from "next";
import InteractiveDiagnosticHero from "@/app/components/v2/InteractiveDiagnosticHero";
import BenefitTicker from "@/app/components/v2/BenefitTicker";
import TacticalRemediesGrid from "@/app/components/v2/TacticalRemediesGrid";
import DailyRitualTimeline from "@/app/components/v2/DailyRitualTimeline";
import PractitionerStamp from "@/app/components/v2/PractitionerStamp";
import PatientProofReel from "@/app/components/v2/PatientProofReel";
import StickyMobileBar from "@/app/components/v2/StickyMobileBar";

export const metadata: Metadata = {
  title: "Tameer-e-Sehat | Personalized Herbal Care & 60-Second Diagnostic",
  description:
    "Instant Unani diagnostic finder, steam-distilled Arqiyat, and raw honey preserves by Hakim Muhammad Tariq. 1-Tap Cash on Delivery across Pakistan.",
};

export default function V2RebootPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F5] pb-20 sm:pb-0">
      {/* 1. Interactive 60-Second Herbal Diagnostic Hero */}
      <InteractiveDiagnosticHero />

      {/* 2. Sensory Credibility & Benefit Ticker */}
      <BenefitTicker />

      {/* 3. Tactical Shoppable Remedies with Inline Weight Selectors & 1-Tap COD */}
      <TacticalRemediesGrid />

      {/* 4. The 3-Step Daily Healing Ritual (Morning / Midday / Night) */}
      <DailyRitualTimeline />

      {/* 5. Verified Practitioner Stamp & Karachi Matab Digital Pass */}
      <PractitionerStamp />

      {/* 6. Real Patient Recoveries & Google Proof */}
      <PatientProofReel />

      {/* 7. Persistent Mobile Bottom Action Bar */}
      <StickyMobileBar />
    </main>
  );
}
