import React from "react";
import HeroSection from "@/app/components/HeroSection";
import TrustPillarsSection from "@/app/components/TrustPillarsSection";
import HakimIntroSection from "@/app/components/HakimIntroSection";
import FeaturedProductsSection from "@/app/components/FeaturedProductsSection";
import ConsultationProcessSection from "@/app/components/ConsultationProcessSection";
import TestimonialsSection from "@/app/components/TestimonialsSection";
import WhatsAppConsultationBanner from "@/app/components/WhatsAppConsultationBanner";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustPillarsSection />
      <HakimIntroSection />
      <FeaturedProductsSection />
      <ConsultationProcessSection />
      <TestimonialsSection />
      <WhatsAppConsultationBanner />
    </>
  );
}
