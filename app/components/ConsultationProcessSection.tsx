"use client";

import React from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { useLanguage } from "@/app/context/LanguageContext";
import { ClipboardList, Stethoscope, PackageCheck, ArrowRight, MessageCircle } from "lucide-react";
import Reveal from "./motion/Reveal";

export default function ConsultationProcessSection() {
  const { t, isUrdu } = useLanguage();

  const steps = [
    {
      number: "01",
      icon: ClipboardList,
      title: t("step1Title"),
      urdu: "تفصیلات و علامات کا اندراج",
      description: t("step1Desc"),
    },
    {
      number: "02",
      icon: Stethoscope,
      title: t("step2Title"),
      urdu: "طبیبی تشخیص و مزاجی تجزیہ",
      description: t("step2Desc"),
    },
    {
      number: "03",
      icon: MessageCircle,
      title: t("step3Title"),
      urdu: "مفصل مشورہ و نسخہ",
      description: t("step3Desc"),
    },
    {
      number: "04",
      icon: PackageCheck,
      title: t("step4Title"),
      urdu: "مستند دوا و پرہیز کی ترسیل",
      description: t("step4Desc"),
    },
  ];

  return (
    <section className="py-16 bg-[#f4eee5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto space-y-2 mb-14">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            {t("processBadge")}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#123824]">
            {t("processHeading")}
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            {t("processSubtitle")}
          </p>
        </Reveal>

        {/* 4 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal
                key={step.number}
                delay={index * 0.06}
                className="h-full"
              >
              <div
                className="relative h-full bg-white rounded-xl p-6 border border-[#e6dfd5] shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-lg bg-[#123824] text-[#c59b27] flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-serif text-xl font-bold text-[#d7c9b8]">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-base font-bold text-[#123824]">
                    {step.title}
                  </h3>
                  <p className="font-urdu text-xs text-[#2a5a3d] font-semibold text-right" dir="rtl">
                    {step.urdu}
                  </p>
                  <p className="text-xs text-[#59534b] leading-relaxed pt-1">
                    {step.description}
                  </p>
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>

        {/* Action Callout Bar */}
        <Reveal className="mt-12 bg-white rounded-xl p-6 sm:p-8 border border-[#e6dfd5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#123824]">
              {isUrdu ? "کیا آپ اپنے مرض پر مستند طبیب سے تفصیلی گفتگو چاہتے ہیں؟" : "Ready to discuss your health with an established Hakim?"}
            </h4>
            <p className="text-xs text-[#6a6660]">
              {isUrdu ? "مفت ابتدائی علامات کا جائزہ · اوقاتِ کار میں فوری جواب" : "Free initial symptom review · Response within 2 to 4 hours on working days."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/consultation"
              className="w-full sm:w-auto text-center px-6 py-3 bg-[#123824] hover:bg-[#0c2719] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs"
            >
              {t("startIntakeBtn")}
            </Link>
            <a
              href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                "Assalam-o-Alaikum, I want to book an online consultation with the Hakim."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isUrdu ? "واٹس ایپ پر رابطہ کریں" : "Consult on WhatsApp"}</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
