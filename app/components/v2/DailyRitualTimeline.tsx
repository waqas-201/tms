"use client";

import React from "react";
import { Sunrise, Sun, Moon, ArrowRight, Zap, CheckCircle2, Sparkles } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/app/data/products";

const RITUAL_STEPS = [
  {
    step: "01",
    time: "Morning (Nahar Moonh)",
    urduTime: "صبح نہار منہ",
    icon: Sunrise,
    remedy: "Hydro-Distilled Arqiyat",
    urduRemedy: "عرقیات خالص",
    action: "1 cup lukewarm water with pure Arq Kasni or Makoh",
    benefit: "Flushes overnight metabolic acidity, cleanses kidneys, and cools internal liver heat before food.",
  },
  {
    step: "02",
    time: "Midday / Afternoon",
    urduTime: "دوپہر کے وقت",
    icon: Sun,
    remedy: "Honey Fruit Preserve (Murabba)",
    urduRemedy: "مربہ آملہ و ہریڑ",
    action: "1 piece of organic Amla or Harar in wild mountain honey",
    benefit: "Provides bio-available iron and vitamin C for continuous stamina, sharper mental focus, and smooth digestion.",
  },
  {
    step: "03",
    time: "Evening / Bedtime",
    urduTime: "رات سونے سے پہلے",
    icon: Moon,
    remedy: "Herbal Oil / Decoction",
    urduRemedy: "روغن و جوشاندہ",
    action: "5-minute gentle JointZen massage on knees or lumbar spine",
    benefit: "Relieves day-long joint friction, reduces nerve stiffness, and promotes deep regenerative sleep.",
  },
];

export default function DailyRitualTimeline() {
  const { addToCart, setIsCartOpen } = useCart();

  const handleOrderRitualPack = () => {
    const ritualBundle: Product = {
      id: "bundle-daily-ritual-3step",
      slug: "juniper-berries-whole-european-grade",
      name: "3-Step Daily Healing Botanical Ritual (Complete 30-Day Care)",
      urduName: "مکمل ۳۰ روزہ قدرتی بحالی و شفا کورس",
      category: "herbs",
      categoryLabel: "Daily Ritual Care",
      categoryUrdu: "روزانہ کا کورس",
      shortDescription: "Morning Arq Kasni + Midday Honey Amla + Night JointZen Oil",
      fullDescription: "Complete daily holistic regimen formulated by Hakim Muhammad Tariq.",
      traditionalPurpose: "Restores vitality, resolves chronic acidity and lubricates joints.",
      benefits: ["Morning to Night Protection", "Pure Mountain Extracts", "30-Day Supply"],
      ingredients: [{ name: "Botanical Extracts", role: "Active" }],
      howToUse: "Follow morning, midday, and evening protocol.",
      dosage: "Daily 3-step routine",
      hakimAdvice: "Consistency is key to permanent herbal recovery.",
      price: 1950,
      originalPrice: 2600,
      discountPercentage: 25,
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
      sizes: [
        {
          name: "Full 30-Day Routine Box",
          weight: "3-Bottle Set",
          price: 1950,
          originalPrice: 2600,
          stockOnHand: 25,
          isActive: true,
        },
      ],
      inStock: true,
      featured: true,
      rating: 5,
      reviewCount: 56,
    };

    addToCart(ritualBundle, ritualBundle.sizes[0], 1);
    setIsCartOpen(true);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F5] border-b border-[#E5EDE5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">

        {/* Section Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F5F0] border border-[#D1DEC9] text-[#0F2E1E] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C86A4B]" />
            <span>Effortless Holistic Care</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2E1E]">
            The 3-Step Daily Healing Ritual
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6860]">
            Natural Unani healing is simple. 3 gentle daily touchpoints that restore your body without pills or harsh chemicals.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {RITUAL_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-3xl border border-[#E5EDE5] p-5 sm:p-6 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + Step */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#F0F5F0] text-[#0F2E1E] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#0F2E1E]" />
                    </div>
                    <span className="text-xs font-bold text-[#C86A4B] tracking-wider uppercase">
                      Step {item.step}
                    </span>
                  </div>

                  {/* Step Timing & Remedy */}
                  <div>
                    <div className="text-xs font-bold text-[#C86A4B] uppercase tracking-wide">
                      {item.time}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#0F2E1E]">
                      {item.remedy}
                    </h3>
                    <p className="text-xs text-[#C86A4B] font-serif">
                      {item.urduRemedy}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E5EDE5] text-xs font-semibold text-[#0F2E1E]">
                    👉 {item.action}
                  </div>

                  {/* Benefit */}
                  <p className="text-xs text-[#5A6860] leading-relaxed">
                    {item.benefit}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0F5F0] flex items-center gap-1.5 text-[11px] font-bold text-[#0F2E1E]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>100% Habit Forming & Safe</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 1-Tap Bundle Order Box */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#0F2E1E]/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86A4B]">
              Recommended Holistic Starter Kit:
            </span>
            <div className="text-base sm:text-xl font-serif font-bold text-[#0F2E1E]">
              Complete 30-Day Daily Healing Routine Pack
            </div>
            <p className="text-xs text-[#5A6860]">
              Includes Arq Kasni (1L) + Honey Amla Preserve (500g) + JointZen Herbal Oil (100ml).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <div className="text-center sm:text-right">
              <div className="text-xl font-bold text-[#0F2E1E]">₨ 1,950</div>
              <div className="text-xs text-[#5A6860] line-through">₨ 2,600 (Save 25%)</div>
            </div>

            <button
              onClick={handleOrderRitualPack}
              type="button"
              className="w-full sm:w-auto py-3.5 px-6 bg-[#0F2E1E] hover:bg-[#1E382B] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#E8AF57]" />
              <span>1-Tap Order Daily Kit (COD)</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
