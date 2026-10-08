"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CLINIC_INFO, Product } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";

export interface SymptomDetail {
  id: string;
  icon: any;
  emoji: string;
  title: string;
  urduTitle: string;
  hakimInsight: string;
  recommendedRemedy: {
    name: string;
    urduName: string;
    description: string;
    price: number;
    image: string;
    slug: string;
    id: string;
  };
  recoveryTimeline: string;
  whatsappTopic: string;
}

interface EmpathyDrawerProps {
  symptom: SymptomDetail | null;
  onClose: () => void;
}

export default function EmpathyDrawer({ symptom, onClose }: EmpathyDrawerProps) {
  const { addToCart, showToast } = useCart();

  if (!symptom) return null;

  const whatsAppUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    `Assalam-o-Alaikum Hakim Sahib! I am experiencing "${symptom.title}" (${symptom.urduTitle}). Please guide me on treatment options.`
  )}`;

  const handleQuickAdd = () => {
    // Construct minimal product object for CartContext
    const minimalProduct: Product = {
      id: symptom.recommendedRemedy.id,
      slug: symptom.recommendedRemedy.slug,
      name: symptom.recommendedRemedy.name,
      urduName: symptom.recommendedRemedy.urduName,
      category: "herbs",
      categoryLabel: "Herbal Remedies",
      categoryUrdu: "قدرتی ادویات",
      shortDescription: symptom.recommendedRemedy.description,
      fullDescription: symptom.recommendedRemedy.description,
      traditionalPurpose: symptom.hakimInsight,
      benefits: ["Pure Unani Formulation", "Chemical Free", "No Side Effects"],
      ingredients: [{ name: "Botanical Extracts", role: "Primary Active" }],
      howToUse: "Take as directed on packaging with water.",
      dosage: "1-2 times daily",
      hakimAdvice: "Drink plenty of lukewarm water and avoid excessively oily foods.",
      price: symptom.recommendedRemedy.price,
      image: symptom.recommendedRemedy.image,
      sizes: [
        {
          name: "Standard Bottle",
          weight: "Standard",
          price: symptom.recommendedRemedy.price,
          stockOnHand: 25,
          isActive: true,
        },
      ],
      inStock: true,
      featured: true,
      rating: 5,
      reviewCount: 38,
    };

    addToCart(minimalProduct, minimalProduct.sizes[0], 1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Bottom Sheet Modal Container */}
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-[#e6dfd5] p-5 sm:p-7 space-y-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#f4eee5] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eef7f1] border border-[#cde4d6] flex items-center justify-center text-2xl shrink-0">
              {symptom.emoji}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#fcf6e6] text-[#8c6a15] text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#c59b27]" />
                <span>Hakim Consultation Triage</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#22623a]">
                {symptom.title}
              </h3>
              <p className="text-xs text-[#8c6a15] font-serif">
                {symptom.urduTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6a6660] hover:text-[#1e1c19] hover:bg-[#faf8f5] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hakim's Root-Cause Insight */}
        <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#22623a] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22623a]" />
              Hakim&apos;s Clinical Assessment
            </span>
            <span className="text-[10px] text-[#8c6a15] font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {symptom.recoveryTimeline}
            </span>
          </div>
          <p className="text-xs text-[#59534b] leading-relaxed">
            {symptom.hakimInsight}
          </p>
        </div>

        {/* Recommended Botanical Remedy Card */}
        <div className="border border-[#cde4d6] rounded-2xl p-4 bg-[#f4f9f5] space-y-3">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#22623a]">
            Primary Recommended Formulation:
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-serif text-sm font-bold text-[#22623a]">
                {symptom.recommendedRemedy.name}
              </h4>
              <p className="text-xs text-[#8c6a15] font-serif">
                {symptom.recommendedRemedy.urduName}
              </p>
              <p className="text-[11px] text-[#59534b] mt-1 line-clamp-2">
                {symptom.recommendedRemedy.description}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-bold text-[#22623a]">
                ₨ {symptom.recommendedRemedy.price.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#8c6a15]">Pure Batch</div>
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            type="button"
            className="w-full py-2.5 px-4 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-[0.99]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add Recommended Remedy to Bag</span>
          </button>
        </div>

        {/* Direct WhatsApp Consultation CTA */}
        <div className="space-y-2 pt-1">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Discuss &ldquo;{symptom.title}&rdquo; with Hakim on WhatsApp</span>
          </a>

          <p className="text-[10px] text-center text-[#6a6660]">
            Confidential · Direct response by Hakim Muhammad Tariq · Free advice
          </p>
        </div>
      </div>
    </div>
  );
}
