"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Award,
  Users,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Clock,
  ExternalLink,
  Calendar,
  Phone,
  MessageCircle,
  Quote,
  HeartHandshake,
} from "lucide-react";
import Reveal from "@/app/components/motion/Reveal";
import ConsultationModal from "@/app/components/ConsultationModal";

export default function HakimTrustCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clinicalMetrics = [
    { value: "35+", label: "Years Clinical Experience in Karachi", icon: Award },
    {
      value: "150K+",
      label: "Patients Evaluated & Treated",
      icon: Users,
      href: CLINIC_INFO.googleMapsUrl,
    },
    { value: "100%", label: "Pure Botanical Herbal Extracts", icon: ShieldCheck },
    { value: "0%", label: "Steroids, Chemicals or Additives", icon: Stethoscope },
  ];

  return (
    <>
      <section
        id="hakim-authority"
        className="py-12 sm:py-16 lg:py-20 bg-[#faf8f5] border-b border-[#e6dfd5]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">

          {/* ─── 1. Hakim Clinical Pedigree & Editorial Profile ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left: Hakim Portrait (5 cols) */}
            <Reveal className="lg:col-span-5 relative">
              <div className="relative aspect-[4/4.8] rounded-3xl overflow-hidden shadow-xl border-2 border-[#e6dfd5] bg-[#f6f2ea]">
                <Image
                  src="/images/2-scaled.png"
                  alt="Hakim Muhammad Tariq - Tameer-e-Sehat"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#22623a]/90 via-[#22623a]/25 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c59b27] text-white text-[10px] font-bold uppercase tracking-wider">
                    <Award className="w-3 h-3" />
                    <span>Certified Tibbi Lineage</span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold">
                    Hakim Muhammad Tariq
                  </h3>
                  <p className="text-xs text-[#f4eee5]/90 leading-snug">
                    Senior Tibbi Consultant & Master Herbalist · Serving Karachi Since 1990
                  </p>
                </div>
              </div>

              {/* Overlapping Floating Trust Seal */}
              <div className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-4 bg-white p-3.5 rounded-2xl border border-[#cde4d6] shadow-xl max-w-[210px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#eef7f1] text-[#22623a] flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#22623a] block">
                      Honest Herbalism
                    </span>
                    <span className="text-[10px] text-[#6a6660] block leading-tight">
                      Zero adulteration guarantee
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right: Pedigree & Clinical Standards (7 cols) */}
            <Reveal delay={0.1} className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Practitioner Authority</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                  Classical Wisdom, Root-Cause Diagnosis
                </h2>

                <div className="relative pl-4 border-l-2 border-[#c59b27] py-1 my-3 bg-[#fdfbf3] rounded-r-xl pr-3">
                  <Quote className="w-4 h-4 text-[#c59b27] mb-1 opacity-75" />
                  <p className="text-xs sm:text-sm text-[#59534b] italic leading-relaxed">
                    &ldquo;In Tibb-e-Unani, we do not suppress symptoms with harsh chemicals. We identify the temperament imbalance (Mizaj) and gently restore the organ&apos;s natural vitality through pure botanical extracts.&rdquo;
                  </p>
                  <p className="text-[11px] font-bold text-[#22623a] mt-1.5">
                    — Hakim Muhammad Tariq (Matab Tameer-e-Sehat)
                  </p>
                </div>
              </div>

              {/* 4 Quantified Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {clinicalMetrics.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-[#e6dfd5] text-center space-y-1 shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#eef7f1] text-[#22623a] flex items-center justify-center mx-auto">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-base sm:text-lg font-serif font-bold text-[#22623a]">
                        {item.value}
                      </div>
                      <div className="text-[10px] text-[#6a6660] leading-tight">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Physical Karachi Matab Strip */}
              <div className="p-4 rounded-2xl bg-white border border-[#e6dfd5] space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#22623a] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-[#22623a] sm:text-sm">
                      Matab Tameer-e-Sehat (Karachi Dispensary & Clinic)
                    </div>
                    <p className="text-[#59534b] text-xs leading-relaxed">
                      {CLINIC_INFO.address}
                    </p>
                    <div className="text-[11px] text-[#8c6a15] font-semibold flex items-center gap-1.5 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{CLINIC_INFO.timings}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f4eee5]">
                  <a
                    href={CLINIC_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-[#faf8f5] hover:bg-[#eef7f1] border border-[#e6dfd5] text-[#22623a] rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#8c6a15]" />
                    <span>Google Maps Directions</span>
                    <ExternalLink className="w-3 h-3 text-[#6a6660]" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="py-2.5 px-3 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book In-Person Visit</span>
                  </button>
                </div>
              </div>
            </Reveal>

          </div>

        </div>
      </section>

      {/* In-Person Clinic Booking Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
