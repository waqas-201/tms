"use client";

import React from "react";
import { Leaf, ShieldCheck, UserCheck, Truck } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import Reveal from "./motion/Reveal";

export default function TrustPillarsSection() {
  const { t, isUrdu } = useLanguage();

  const pillars = [
    {
      icon: Leaf,
      title: t("pillar1Title"),
      urdu: t("pillar1Urdu"),
      description: t("pillar1Desc"),
    },
    {
      icon: UserCheck,
      title: t("pillar2Title"),
      urdu: t("pillar2Urdu"),
      description: t("pillar2Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("pillar3Title"),
      urdu: t("pillar3Urdu"),
      description: t("pillar3Desc"),
    },
    {
      icon: Truck,
      title: t("pillar4Title"),
      urdu: t("pillar4Urdu"),
      description: t("pillar4Desc"),
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            {isUrdu ? "طبی معیار و اعتماد" : "Trust & Heritage · اعتماد و میراث"}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#123824]">
            {isUrdu ? "ہماری قدرتی شفا پر بھروسے کی وجوہات" : "Why Families Across Pakistan Trust Us"}
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            {isUrdu
              ? "خالص یونانی حکمت، علمی بصیرت اور دیانتداری پر مبنی صدیوں پرانا طریقۂ علاج۔"
              : "Honest herbal medicine requires uncompromising integrity, scientific hygiene, and respect for tradition."}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Reveal
                key={pillar.title}
                delay={index * 0.07}
                className="h-full"
              >
              <div
                className="h-full p-6 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] space-y-3 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-lg bg-[#123824] text-[#c59b27] flex items-center justify-center shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif text-base font-bold text-[#123824]">
                    {pillar.title}
                  </h3>
                  <p className="font-urdu text-xs text-[#2a5a3d] font-semibold text-right" dir="rtl">
                    {pillar.urdu}
                  </p>
                  <p className="text-xs text-[#59534b] leading-relaxed pt-1">
                    {pillar.description}
                  </p>
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
