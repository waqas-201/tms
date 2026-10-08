"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Award,
  Users,
  ShieldCheck,
  MapPin,
  Clock,
  ExternalLink,
  Calendar,
  Phone,
} from "lucide-react";
import ConsultationModal from "@/app/components/ConsultationModal";

export default function HakimTrustCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trustStats = [
    { label: "Clinical Lineage", value: "35+ Years", icon: Award },
    { label: "Treated Patients", value: "150,000+", icon: Users },
    { label: "Purity Standard", value: "100% Herbal", icon: ShieldCheck },
  ];

  return (
    <>
      <section className="py-10 sm:py-16 bg-[#faf8f5] border-b border-[#e6dfd5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

          {/* Main Card Container */}
          <div className="bg-white rounded-3xl border border-[#e6dfd5] p-5 sm:p-8 shadow-xs space-y-6">

            {/* Practitioner Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Portrait */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#22623a]/20 shadow-md shrink-0 bg-[#f4eee5]">
                <Image
                  src="/images/2-scaled.png"
                  alt="Hakim Muhammad Tariq"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Bio Details */}
              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f4eee5] text-[#22623a] text-[10px] font-bold uppercase tracking-wider">
                  <Award className="w-3 h-3 text-[#c59b27]" />
                  <span>Master Herbalist · Est. 1990</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                  Hakim Muhammad Tariq
                </h3>

                <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                  Senior Unani practitioner specializing in chronic gastrointestinal, joint recovery, and metabolic detox. Practicing in Karachi with unadulterated botanical medicine.
                </p>
              </div>
            </div>

            {/* 3 Metric Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 border-y border-[#f4eee5] text-center">
              {trustStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="text-base sm:text-xl font-bold text-[#22623a]">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#6a6660]">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Physical Karachi Matab Strip */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-[#22623a]">
                    Matab Tameer-e-Sehat (Karachi Clinic)
                  </div>
                  <p className="text-[#59534b] text-[11px] leading-relaxed">
                    {CLINIC_INFO.address}
                  </p>
                  <div className="text-[10px] text-[#8c6a15] font-medium pt-1">
                    ⏱ {CLINIC_INFO.timings}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={CLINIC_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-white hover:bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#8c6a15]" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#6a6660]" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-2.5 px-3 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Clinic Visit</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Karachi Clinic Booking Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
