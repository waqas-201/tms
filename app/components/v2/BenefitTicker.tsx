"use client";

import React from "react";
import { Leaf, Droplet, ShieldCheck, Truck } from "lucide-react";

export default function BenefitTicker() {
  const benefits = [
    { icon: Leaf, title: "100% Wild Botanicals", subtitle: "Chemical & steroid-free extracts" },
    { icon: Droplet, title: "Pure Steam Distillation", subtitle: "Triple-filtered Arqiyat" },
    { icon: ShieldCheck, title: "35+ Years Verified Matab", subtitle: "Hakim Muhammad Tariq" },
    { icon: Truck, title: "Cash on Delivery (COD)", subtitle: "Fast 24–48h delivery across Pakistan" },
  ];

  return (
    <section className="bg-white border-b border-[#E5EDE5] py-4 sm:py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5EDE5]/80 shadow-2xs"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E5EDE5] text-[#0F2E1E] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F2E1E]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[#0F2E1E] truncate">
                    {b.title}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#5A6860] truncate">
                    {b.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
