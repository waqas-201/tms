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
  MessageCircle,
  Sparkles,
} from "lucide-react";
import ConsultationModal from "@/app/components/ConsultationModal";

export default function PractitionerStamp() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trustMetrics = [
    { value: "35+ Years", label: "Karachi Matab Lineage", icon: Award },
    { value: "150,000+", label: "Patients Evaluated", icon: Users },
    { value: "0% Steroids", label: "100% Botanical Guarantee", icon: ShieldCheck },
  ];

  const whatsAppDirectUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Hakim Sahib! I would like to seek direct consultation regarding my health."
  )}`;

  return (
    <>
      <section className="py-12 sm:py-16 bg-white border-b border-[#E5EDE5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">

          {/* Practitioner Stamp Container */}
          <div className="bg-[#FAF9F5] rounded-3xl border border-[#E5EDE5] p-5 sm:p-8 shadow-xs space-y-6">

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Portrait */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#0F2E1E]/20 shadow-md shrink-0 bg-[#E5EDE5]">
                <Image
                  src="/images/2-scaled.png"
                  alt="Hakim Muhammad Tariq"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Verified Badge & Bio Reassurance */}
              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E5EDE5] text-[#0F2E1E] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#C86A4B]" />
                  <span>Master Herbalist · Certified Tibbi Lineage</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F2E1E]">
                  Hakim Muhammad Tariq
                </h3>

                <p className="text-xs sm:text-sm text-[#5A6860] leading-relaxed">
                  &ldquo;In Unani medicine, we never mask symptoms with chemicals. We balance your body&apos;s natural temperature and heal chronic ailments with pure, unadulterated botanical steam extracts.&rdquo;
                </p>
              </div>
            </div>

            {/* 3 Numerical Counters */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 border-y border-[#E5EDE5] text-center">
              {trustMetrics.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="text-base sm:text-xl font-bold text-[#0F2E1E]">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#5A6860]">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Physical Karachi Matab Digital Pass */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5EDE5] space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0F2E1E] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-[#0F2E1E] sm:text-sm">
                    Matab Tameer-e-Sehat (Karachi Clinic & Dispensary)
                  </div>
                  <p className="text-[#5A6860] text-xs leading-relaxed">
                    {CLINIC_INFO.address}
                  </p>
                  <div className="text-[11px] text-[#C86A4B] font-semibold flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{CLINIC_INFO.timings}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#F0F5F0]">
                <a
                  href={CLINIC_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#FAF9F5] hover:bg-[#F0F5F0] border border-[#E5EDE5] text-[#0F2E1E] rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C86A4B]" />
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3 text-[#5A6860]" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-2.5 px-3 bg-white hover:bg-[#FAF9F5] border border-[#E5EDE5] text-[#0F2E1E] rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#C86A4B]" />
                  <span>Book In-Person Visit</span>
                </button>

                <a
                  href={whatsAppDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Direct WhatsApp Chat</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Booking Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
