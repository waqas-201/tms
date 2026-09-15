import React from "react";
import HeroSection from "@/app/components/HeroSection";
import TrustPillarsSection from "@/app/components/TrustPillarsSection";
import ClinicalSpecialtiesSection from "@/app/components/ClinicalSpecialtiesSection";
import QuickAppointmentBooking from "@/app/components/QuickAppointmentBooking";
import HakimAuthoritySection from "@/app/components/HakimAuthoritySection";
import ClinicalOutcomesSection from "@/app/components/ClinicalOutcomesSection";
import PrescribedRemediesSection from "@/app/components/PrescribedRemediesSection";
import ClinicVisitingSection from "@/app/components/ClinicVisitingSection";
import WhatsAppConsultationBanner from "@/app/components/WhatsAppConsultationBanner";

export default function Home() {
  return (
    <>
      {/* 1. Clinical Healthcare Hero with Dual Online / Clinic Booking Card */}
      <HeroSection />

      {/* 2. Clinical Standards & Trust Credentials */}
      <TrustPillarsSection />

      {/* 3. The 6 Core Clinical Specializations & What We Treat */}
      <ClinicalSpecialtiesSection />

      {/* 4. Interactive 2-Minute Consultation & Appointment Booking Widget */}
      <QuickAppointmentBooking />

      {/* 5. Hakim Clinical Authority, Pedigree & 4-Step Patient Journey */}
      <HakimAuthoritySection />

      {/* 6. Documented Patient Recoveries & Verified Case Studies */}
      <ClinicalOutcomesSection />

      {/* 7. Physician-Formulated Apothecary Remedies (30% Secondary Dispensary) */}
      <PrescribedRemediesSection />

      {/* 8. Physical Karachi Clinic Visit, Hours & Map Directions */}
      <ClinicVisitingSection />

      {/* 9. Direct WhatsApp Urgent Consultation Helpline Banner */}
      <WhatsAppConsultationBanner />
    </>
  );
}
