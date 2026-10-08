"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Activity,
  Shield,
  Sun,
  Sparkles,
  Wind,
  Heart,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
  Zap,
  Clock,
  Star,
} from "lucide-react";
import { CLINIC_INFO, Product } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";

interface HealthGoal {
  id: string;
  emoji: string;
  title: string;
  urdu: string;
  subtitle: string;
  diagnosticInsight: {
    mild: string;
    chronic: string;
    severe: string;
  };
  bundle: {
    title: string;
    urduTitle: string;
    items: string[];
    price: number;
    originalPrice: number;
    timeline: string;
    image: string;
  };
  whatsappQuery: string;
}

const HEALTH_GOALS: HealthGoal[] = [
  {
    id: "gastro",
    emoji: "🔥",
    title: "Stomach, Acid & Gas",
    urdu: "معدہ اور تیزابیت",
    subtitle: "Heartburn, bloating, acid reflux & heavy digestion",
    diagnosticInsight: {
      mild: "Early gastric heat imbalance. A short course of steam-distilled botanicals will restore normal stomach pH naturally.",
      chronic: "Weakened gastric mucosal barrier. Requires gentle cooling extracts (Arq Makoh & Kasni) plus organic fruit fiber to heal stomach lining.",
      severe: "Chronic systemic gastritis & sluggish peristalsis. Needs an intensive 21-day botanical reset to stop acid regurgitation permanently without antacids.",
    },
    bundle: {
      title: "Complete Gastric & Acidity Reset Duo",
      urduTitle: "معدہ و تیزابیت مکمل کورس",
      items: ["Pure Arq Makoh & Kasni (Steam Distilled)", "Artisanal Harar Honey Murabba"],
      price: 950,
      originalPrice: 1250,
      timeline: "Relief within 5–7 days",
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
    },
    whatsappQuery: "Gastric Acidity and Stomach Burn Treatment",
  },
  {
    id: "joints",
    emoji: "🦵",
    title: "Joint, Knee & Back Mobility",
    urdu: "جوڑوں اور گھٹنوں کا درد",
    subtitle: "Stiff knees, stair difficulty, lumbar backache & sciatica",
    diagnosticInsight: {
      mild: "Mild synovial friction and muscle fatigue. Warm herbal oil massage will stimulate localized blood flow and loosen stiffness.",
      chronic: "Depleted natural joint lubrication & inflammation. Requires deep-penetrating unrefined herbal liniments to soothe nerve roots.",
      severe: "Advanced degenerative joint friction. Needs intensive dual therapy: external JointZen botanical oil massage and bone-nourishing herbal tonics.",
    },
    bundle: {
      title: "JointZen Rapid Mobility & Pain Oil Care",
      urduTitle: "جوائنٹ زین مکمل درد ریلیف پیکیج",
      items: ["Cold-Pressed JointZen Herbal Massage Oil", "Anti-Inflammatory Herbal Bone Complex"],
      price: 1350,
      originalPrice: 1750,
      timeline: "Noticeable comfort in 3–5 days",
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
    },
    whatsappQuery: "Joint Pain and Knee Stiffness Relief",
  },
  {
    id: "liver",
    emoji: "🌿",
    title: "Liver Heat & Metabolic Detox",
    urdu: "جگر کی گرمی اور صفائی",
    subtitle: "Burning feet soles, sluggish appetite, dull complexion",
    diagnosticInsight: {
      mild: "Mild hepatic heat accumulation (Garam Mizaj). Pure chicory (Kasni) steam water cleanses toxins rapidly.",
      chronic: "Sluggish hepatic filtration and elevated internal heat. Needs a standardized course of hydro-distilled botanical cleansers.",
      severe: "Systemic metabolic congestion and fatty liver tendency. Requires a structured 30-day Tibbi liver detox regimen.",
    },
    bundle: {
      title: "Triple-Filtered Pure Liver Detox Essence",
      urduTitle: "خالص جگر صفائی و فرحت بخش کورس",
      items: ["Concentrated Steam Arq Kasni (Chicory)", "Pure Arq Gulab & Makoh Blend"],
      price: 850,
      originalPrice: 1100,
      timeline: "Deep detox in 14–21 days",
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
    },
    whatsappQuery: "Liver Detox and Body Heat Treatment",
  },
  {
    id: "vitality",
    emoji: "⚡",
    title: "Fatigue, Brain Fog & Stamina",
    urdu: "جسمانی کمزوری اور تھکن",
    subtitle: "Low energy, afternoon crashes, general physical weakness",
    diagnosticInsight: {
      mild: "Nutrient depletion and stress fatigue. Raw mountain honey and organic amla restore essential bio-available iron and vitamin C.",
      chronic: "Sub-optimal vital organ energy (Zof-e-Aza-e-Raeesa). Traditional fruit preserves nourish both heart and brain stamina.",
      severe: "Deep physical exhaustion & nervous debility. Requires royal multi-seed and dry fruit revitalizing tonic.",
    },
    bundle: {
      title: "Royal Amla & Wild Mountain Honey Vitality Pack",
      urduTitle: "شاہی مقوی اعضاء و توانائی پیکیج",
      items: ["Wild Raw Honey Amla Murabba (500g)", "Organic Shahi Dry Fruit Energy Tonic"],
      price: 1450,
      originalPrice: 1900,
      timeline: "Renewed stamina in 7–10 days",
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
    },
    whatsappQuery: "Physical Stamina and Vitality Tonic",
  },
  {
    id: "hair",
    emoji: "💆",
    title: "Hair Fall, Roots & Scalp",
    urdu: "بالوں کا گرنا اور خشکی",
    subtitle: "Excessive shedding, dandruff, weak thinning roots",
    diagnosticInsight: {
      mild: "Superficial scalp irritation. A gentle chemical-free botanical wash balances sebum without stripping natural oils.",
      chronic: "Weakened hair follicles and scalp dryness. Needs nutrient-rich Shikakai, Amla and Reetha extracts to strengthen hair bulbs.",
      severe: "Chronic hair shedding and follicular miniaturization. Requires deep root botanical oil massage + internal blood-purifying tonic.",
    },
    bundle: {
      title: "HerboSilk Scalp Root Restoration Trio",
      urduTitle: "ہربل جڑی بوٹی روٹ تھراپی",
      items: ["HerboSilk Sulfate-Free Scalp Wash", "Pure Cold-Pressed Sweet Almond Hair Oil"],
      price: 1200,
      originalPrice: 1550,
      timeline: "Noticeable strength in 2–3 weeks",
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
    },
    whatsappQuery: "Hair Fall and Scalp Treatment",
  },
  {
    id: "respiratory",
    emoji: "🫁",
    title: "Cough & Seasonal Allergy",
    urdu: "کھانسی، نزلہ اور الرجی",
    subtitle: "Stubborn dry cough, throat irritation, chest phlegm",
    diagnosticInsight: {
      mild: "Acute seasonal throat tickle. Warm botanical decoctions soothe irritation instantly without drowsiness.",
      chronic: "Bronchial sensitivity and persistent mucus. Wild herbs clear airways and strengthen respiratory immunity.",
      severe: "Chronic allergic bronchitis and morning sneezing. Complete Unani chest detox and soothing botanical extracts.",
    },
    bundle: {
      title: "Wild Mountain Joshanda & Chest Soothing Kit",
      urduTitle: "قدرتی نباتاتی جوشاندہ و سینہ ریلیف",
      items: ["Artisanal Wild Herb Joshanda Tea Blend", "Soothing Pure Honey Herbal Syrup"],
      price: 850,
      originalPrice: 1100,
      timeline: "Comfort within 24–48 hours",
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
    },
    whatsappQuery: "Cough and Chest Congestion Relief",
  },
];

const SEVERITY_LEVELS = [
  { id: "mild", label: "Recent (< 1 month)", badge: "Early Stage" },
  { id: "chronic", label: "Chronic (1–6 months)", badge: "Most Common" },
  { id: "severe", label: "Long-Standing (6+ months)", badge: "Intensive Care" },
];

export default function InteractiveDiagnosticHero() {
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("chronic");
  const [step, setStep] = useState<"select_goal" | "select_severity" | "result">("select_goal");

  const { addToCart, setIsCartOpen } = useCart();

  const handleGoalClick = (goal: HealthGoal) => {
    setSelectedGoal(goal);
    setStep("select_severity");
  };

  const handleSeveritySelect = (severityId: string) => {
    setSelectedSeverity(severityId);
    setStep("result");
  };

  const handleReset = () => {
    setSelectedGoal(null);
    setSelectedSeverity("chronic");
    setStep("select_goal");
  };

  const handle1TapCOD = () => {
    if (!selectedGoal) return;
    const dummyProduct: Product = {
      id: `bundle-${selectedGoal.id}`,
      slug: "juniper-berries-whole-european-grade",
      name: selectedGoal.bundle.title,
      urduName: selectedGoal.bundle.urduTitle,
      category: "herbs",
      categoryLabel: "Complete Herbal Care Bundle",
      categoryUrdu: "مکمل پیکیج",
      shortDescription: selectedGoal.bundle.items.join(" + "),
      fullDescription: selectedGoal.bundle.items.join(" + "),
      traditionalPurpose: selectedGoal.subtitle,
      benefits: ["100% Pure Formulation", "Steroid Free", "Clinically Formulated"],
      ingredients: [{ name: "Botanical Extracts", role: "Active" }],
      howToUse: "Follow usage instructions on each bottle.",
      dosage: "Daily prescribed course",
      hakimAdvice: "Drink plenty of warm water.",
      price: selectedGoal.bundle.price,
      originalPrice: selectedGoal.bundle.originalPrice,
      discountPercentage: Math.round(
        ((selectedGoal.bundle.originalPrice - selectedGoal.bundle.price) /
          selectedGoal.bundle.originalPrice) *
          100
      ),
      image: selectedGoal.bundle.image,
      sizes: [
        {
          name: "Complete Course Pack",
          weight: "Full Pack",
          price: selectedGoal.bundle.price,
          originalPrice: selectedGoal.bundle.originalPrice,
          stockOnHand: 30,
          isActive: true,
        },
      ],
      inStock: true,
      featured: true,
      rating: 5,
      reviewCount: 42,
    };

    addToCart(dummyProduct, dummyProduct.sizes[0], 1);
    setIsCartOpen(true);
  };

  const whatsAppBundleUrl = selectedGoal
    ? `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
        `Assalam-o-Alaikum Hakim Sahib! I used the online diagnostic tool for "${selectedGoal.title}" (${
          SEVERITY_LEVELS.find((s) => s.id === selectedSeverity)?.label
        }). I would like to confirm the "${selectedGoal.bundle.title}" for COD delivery.`
      )}`
    : `https://wa.me/${CLINIC_INFO.whatsappNumber}`;

  return (
    <section className="relative bg-[#FAF9F5] border-b border-[#E5EDE5] pt-6 pb-12 sm:py-16 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#0F2E1E]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#C86A4B]/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-8">

        {/* Minimal Brand & Trust Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E5EDE5] text-[#0F2E1E] text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Matab Tameer-e-Sehat · Est. 1990</span>
            <span className="text-[#E5EDE5]">|</span>
            <span className="text-[#C86A4B] font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#C86A4B]" /> 5.0★ Google Verified
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#0F2E1E] leading-[1.18] tracking-tight">
            Target Your Symptoms. <br className="hidden sm:inline" />
            Heal at the Root Naturally.
          </h1>
          <p className="text-xs sm:text-base text-[#5A6860] max-w-lg mx-auto leading-relaxed">
            Personalized Unani botanical solutions formulated by Hakim Muhammad Tariq. 100% steroid-free.
          </p>
        </div>

        {/* ─── The Interactive 60-Second Diagnostic Card ─── */}
        <div className="bg-white rounded-3xl border-2 border-[#E5EDE5] shadow-xl p-4 sm:p-7 space-y-5 transition-all">

          {/* Diagnostic Progress Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F5F0]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0F2E1E] text-white text-xs font-bold flex items-center justify-center">
                {step === "select_goal" ? "1" : step === "select_severity" ? "2" : "✓"}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#0F2E1E] uppercase tracking-wide">
                {step === "select_goal" && "Step 1: What is your primary health concern?"}
                {step === "select_severity" && "Step 2: How long have you felt these symptoms?"}
                {step === "result" && "Your Personalized Herbal Prescription"}
              </span>
            </div>

            {step !== "select_goal" && (
              <button
                onClick={handleReset}
                type="button"
                className="text-xs text-[#C86A4B] font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Over</span>
              </button>
            )}
          </div>

          {/* STEP 1: Select Health Goal (6 Interactive Cards) */}
          {step === "select_goal" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {HEALTH_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalClick(goal)}
                  type="button"
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF9F5] hover:bg-[#F0F5F0] active:bg-[#E5EDE5] border border-[#E5EDE5] hover:border-[#0F2E1E]/50 text-left transition-all duration-200 flex flex-col justify-between gap-3 group cursor-pointer shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{goal.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86A4B] opacity-0 group-hover:opacity-100 transition-opacity">
                      Select →
                    </span>
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0F2E1E] group-hover:text-[#0F2E1E]">
                      {goal.title}
                    </div>
                    <div className="text-[11px] text-[#C86A4B] font-serif pt-0.5">
                      {goal.urdu}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: Duration / Severity */}
          {step === "select_severity" && selectedGoal && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E5EDE5] flex items-center gap-3">
                <span className="text-2xl">{selectedGoal.emoji}</span>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#0F2E1E]">
                    {selectedGoal.title} ({selectedGoal.urdu})
                  </div>
                  <div className="text-[11px] text-[#5A6860]">{selectedGoal.subtitle}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SEVERITY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleSeveritySelect(level.id)}
                    type="button"
                    className="p-4 rounded-2xl bg-[#FAF9F5] hover:bg-[#F0F5F0] border-2 border-[#E5EDE5] hover:border-[#0F2E1E] text-left transition-all group cursor-pointer space-y-1 shadow-2xs"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded-md border border-[#E5EDE5] text-[#C86A4B] uppercase tracking-wider">
                      {level.badge}
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-[#0F2E1E] pt-1">
                      {level.label}
                    </div>
                    <div className="text-[10px] text-[#5A6860] group-hover:text-[#0F2E1E] font-medium">
                      Tap to formulate plan →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Instant Prescription Result Card */}
          {step === "result" && selectedGoal && (
            <div className="space-y-5 animate-in fade-in duration-300">

              {/* Diagnosis Box */}
              <div className="p-4 bg-[#F0F5F0] rounded-2xl border border-[#D1DEC9] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2E1E]">
                    <CheckCircle2 className="w-4 h-4 text-[#0F2E1E]" />
                    <span>Hakim&apos;s Clinical Assessment</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#C86A4B] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedGoal.bundle.timeline}
                  </span>
                </div>
                <p className="text-xs text-[#2D3A32] leading-relaxed">
                  {
                    selectedGoal.diagnosticInsight[
                      selectedSeverity as keyof typeof selectedGoal.diagnosticInsight
                    ]
                  }
                </p>
              </div>

              {/* Prescribed Botanical Bundle Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border-2 border-[#0F2E1E]/20 space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86A4B]">
                      Recommended 2-Item Botanical Regimen:
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F2E1E]">
                      {selectedGoal.bundle.title}
                    </h3>
                    <p className="text-xs text-[#C86A4B] font-serif">
                      {selectedGoal.bundle.urduTitle}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg sm:text-xl font-bold text-[#0F2E1E]">
                      ₨ {selectedGoal.bundle.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#5A6860] line-through">
                      ₨ {selectedGoal.bundle.originalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Items included */}
                <div className="p-3 bg-white rounded-xl border border-[#E5EDE5] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#5A6860] tracking-wider block">
                    Kit Includes:
                  </span>
                  <ul className="space-y-1">
                    {selectedGoal.bundle.items.map((item, i) => (
                      <li key={i} className="text-xs text-[#2D3A32] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F2E1E]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* High-Converting Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* 1-Tap COD */}
                  <button
                    onClick={handle1TapCOD}
                    type="button"
                    className="w-full py-3.5 px-4 bg-[#0F2E1E] hover:bg-[#1E382B] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-[#E8AF57]" />
                    <span>1-Tap Cash on Delivery</span>
                  </button>

                  {/* WhatsApp Verify */}
                  <a
                    href={whatsAppBundleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Order via WhatsApp</span>
                  </a>
                </div>

                <div className="text-[10px] text-center text-[#5A6860] flex items-center justify-center gap-2">
                  <span>✓ Free Nationwide Shipping</span>
                  <span>•</span>
                  <span>✓ 100% Money-Back Purity Guarantee</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
