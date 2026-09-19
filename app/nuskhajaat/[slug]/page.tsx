"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  INITIAL_NUSKHAJAAT,
  Nuskha,
  COURSE_DURATIONS,
  PREPARATION_FORMAT_OPTIONS,
  calculateNuskhaPrice,
} from "@/app/data/nuskhajaat";
import { useCart } from "@/app/context/CartContext";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Sparkles,
  Leaf,
  Scale,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  RotateCcw,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Clock,
  HelpCircle,
  ChevronRight,
  Info,
  Check,
  Flame,
  Droplet,
  Sun,
  Award,
  Heart,
} from "lucide-react";

export default function NuskhaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addNuskhaToCart, setIsCartOpen, toggleWishlist, isInWishlist } = useCart();

  const [nuskha, setNuskha] = useState<Nuskha | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Customization State
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({});
  const [selectedCourseDuration, setSelectedCourseDuration] = useState<string>("30_days");
  const [selectedPrepFormat, setSelectedPrepFormat] = useState<string>("safoof");
  const [packageQuantity, setPackageQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"overview" | "ingredients" | "dosage" | "advice">("overview");

  // Load Nuskha data
  useEffect(() => {
    async function loadNuskha() {
      try {
        const res = await fetch(`/api/nuskhajaat`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const found = json.data.find((n: Nuskha) => n.slug === slug);
            if (found) {
              setNuskha(found);
              // Initialize default quantities
              const initialQty: Record<string, number> = {};
              found.ingredients.forEach((ing: any) => {
                initialQty[ing.id] = ing.defaultQuantity;
              });
              setIngredientQuantities(initialQty);
              // Initialize default preparation format
              if (found.preparationType === "Majun") {
                setSelectedPrepFormat("majun");
              } else {
                setSelectedPrepFormat("safoof");
              }
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("API fetch failed, checking static data:", e);
      }

      // Static fallback
      const foundStatic = INITIAL_NUSKHAJAAT.find((n) => n.slug === slug);
      if (foundStatic) {
        setNuskha(foundStatic);
        const initialQty: Record<string, number> = {};
        foundStatic.ingredients.forEach((ing) => {
          initialQty[ing.id] = ing.defaultQuantity;
        });
        setIngredientQuantities(initialQty);
        if (foundStatic.preparationType === "Majun") {
          setSelectedPrepFormat("majun");
        } else {
          setSelectedPrepFormat("safoof");
        }
      }
      setIsLoading(false);
    }

    if (slug) {
      loadNuskha();
    }
  }, [slug]);

  // Selected duration configuration
  const currentDurationConfig = useMemo(() => {
    return (
      COURSE_DURATIONS.find((d) => d.id === selectedCourseDuration) ||
      COURSE_DURATIONS[1]
    );
  }, [selectedCourseDuration]);

  // Selected format configuration
  const currentFormatConfig = useMemo(() => {
    return (
      PREPARATION_FORMAT_OPTIONS.find((f) => f.id === selectedPrepFormat) ||
      PREPARATION_FORMAT_OPTIONS[0]
    );
  }, [selectedPrepFormat]);

  // Calculate live dynamic price
  const livePricing = useMemo(() => {
    if (!nuskha) {
      return {
        ingredientsCost: 0,
        preparationFee: 0,
        subtotalBeforeDiscount: 0,
        durationDiscount: 0,
        finalPrice: 0,
        totalWeightGrams: 0,
        ingredientsBreakdown: [],
      };
    }

    return calculateNuskhaPrice(
      nuskha,
      ingredientQuantities,
      currentDurationConfig.multiplier,
      currentFormatConfig.format
    );
  }, [nuskha, ingredientQuantities, currentDurationConfig, currentFormatConfig]);

  // Handlers for adjusting ingredient weights
  const handleQuantityChange = (ingredientId: string, delta: number) => {
    if (!nuskha) return;
    const ing = nuskha.ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;

    setIngredientQuantities((prev) => {
      const current = prev[ingredientId] !== undefined ? prev[ingredientId] : ing.defaultQuantity;
      const next = Math.max(
        ing.minQuantity,
        Math.min(ing.maxQuantity, current + delta)
      );
      return { ...prev, [ingredientId]: next };
    });
  };

  const handleToggleOptionalIngredient = (ingredientId: string) => {
    if (!nuskha) return;
    const ing = nuskha.ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;

    setIngredientQuantities((prev) => {
      const current = prev[ingredientId] !== undefined ? prev[ingredientId] : ing.defaultQuantity;
      if (current > 0) {
        return { ...prev, [ingredientId]: 0 };
      } else {
        return { ...prev, [ingredientId]: ing.defaultQuantity };
      }
    });
  };

  const handleResetToDefault = () => {
    if (!nuskha) return;
    const initialQty: Record<string, number> = {};
    nuskha.ingredients.forEach((ing) => {
      initialQty[ing.id] = ing.defaultQuantity;
    });
    setIngredientQuantities(initialQty);
    setSelectedCourseDuration("30_days");
    setSelectedPrepFormat(nuskha.preparationType === "Majun" ? "majun" : "safoof");
    setPackageQuantity(1);
  };

  // Build ingredients summary string for cart/WhatsApp
  const ingredientsSummary = useMemo(() => {
    if (!nuskha) return "";
    return nuskha.ingredients
      .filter((ing) => {
        const qty = ingredientQuantities[ing.id] !== undefined ? ingredientQuantities[ing.id] : ing.defaultQuantity;
        return qty > 0;
      })
      .map((ing) => {
        const baseQty = ingredientQuantities[ing.id] !== undefined ? ingredientQuantities[ing.id] : ing.defaultQuantity;
        const totalQty = Math.round(baseQty * currentDurationConfig.multiplier);
        return `${ing.name} (${totalQty}${ing.unit === "grams" ? "g" : ing.unit})`;
      })
      .join(", ");
  }, [nuskha, ingredientQuantities, currentDurationConfig]);

  // Add to cart action
  const handleAddToCart = () => {
    if (!nuskha) return;

    addNuskhaToCart(nuskha, {
      courseDuration: currentDurationConfig.label,
      preparationFormat: currentFormatConfig.label,
      finalPrice: livePricing.finalPrice,
      totalWeightGrams: livePricing.totalWeightGrams,
      ingredientsSummary,
      quantity: packageQuantity,
    });
    setIsCartOpen(true);
  };

  // Generate WhatsApp custom order URL
  const generateWhatsAppDirectUrl = () => {
    if (!nuskha) return "";

    const message = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to order a Custom Compounded Nuskha:\n\n*Formulation:* ${nuskha.title} (${nuskha.urduTitle})\n*Course Duration:* ${currentDurationConfig.label}\n*Preparation Format:* ${currentFormatConfig.label}\n*Total Compound Weight:* ~${livePricing.totalWeightGrams}g\n\n*Custom Herbs & Quantities:*\n${ingredientsSummary}\n\n*Quantity of Packages:* ${packageQuantity}\n*Total Price:* ₨ ${(livePricing.finalPrice * packageQuantity).toLocaleString()} (Cash on Delivery)\n\nPlease confirm preparation and delivery to my address. JazakAllah!`;

    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#22623a] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#22623a] uppercase tracking-wider">
            Loading Formulation &amp; Ingredients...
          </p>
        </div>
      </div>
    );
  }

  if (!nuskha) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-8">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-serif font-bold text-[#22623a]">
            Formulation Not Found
          </h2>
          <p className="text-xs text-[#59534b]">
            The compound nuskha you are looking for may have been archived or renamed.
          </p>
          <Link
            href="/nuskhajaat"
            className="inline-block px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase rounded-xl transition-colors"
          >
            Browse All Nuskhajaat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-16">
      {/* ─── BREADCRUMBS ─── */}
      <div className="bg-white border-b border-[#e6dfd5] py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#7a7268]">
            <Link href="/" className="hover:text-[#22623a]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/nuskhajaat" className="hover:text-[#22623a]">
              Nuskhajaat (Compounds)
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-[#22623a] truncate max-w-xs">
              {nuskha.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ─── MAIN CUSTOMIZER GRID ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ════════ LEFT COLUMN (7 SPANS): FORMULATION DETAILS & INGREDIENT STEPPERS ════════ */}
          <div className="lg:col-span-7 space-y-8">

            {/* 1. Nuskha Header Card */}
            <div className="bg-white rounded-2xl border border-[#e6dfd5] p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#22623a] text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                      {nuskha.categoryLabel}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#f4f9f5] border border-[#d8ecde] text-[#22623a] text-[10px] font-bold uppercase tracking-wider rounded-md">
                      {nuskha.preparationType}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#faf8f5] border border-[#e6dfd5] text-[#8c6a15] text-[10px] font-bold rounded-md">
                      Mizaj: {nuskha.mizaj}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#22623a]">
                    {nuskha.title}
                  </h1>

                  <p className="font-serif text-lg text-[#8c6a15] font-semibold" dir="rtl">
                    {nuskha.urduTitle}
                  </p>
                </div>

                {/* Thumbnail Image with Wishlist Button */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#faf8f5] border border-[#e6dfd5] shrink-0 group">
                  <Image
                    src={nuskha.image}
                    alt={nuskha.title}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => toggleWishlist(nuskha.id)}
                    aria-label={isInWishlist(nuskha.id) ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
                      isInWishlist(nuskha.id)
                        ? "bg-white text-red-500 shadow-sm"
                        : "bg-white/85 text-gray-700 hover:bg-white hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isInWishlist(nuskha.id) ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                {nuskha.fullDescription}
              </p>

              {/* Hakim Advice Callout */}
              {nuskha.hakimAdvice && (
                <div className="p-3.5 bg-[#f4f9f5] rounded-xl border border-[#d8ecde] flex items-start gap-3">
                  <HeartHandshake className="w-5 h-5 text-[#22623a] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <strong className="text-[#22623a] block font-serif">
                      Hakim&apos;s Clinical Guidance:
                    </strong>
                    <p className="text-[#59534b] leading-relaxed">
                      {nuskha.hakimAdvice}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Interactive Herb Stepper Section */}
            <div className="bg-white rounded-2xl border border-[#e6dfd5] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e6dfd5]">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#22623a]" />
                    <h2 className="text-lg font-serif font-bold text-[#22623a]">
                      Customize Individual Herb Weights
                    </h2>
                  </div>
                  <p className="text-xs text-[#7a7268] mt-0.5">
                    Adjust exact gram weights for each herb. Pricing recalculates automatically on-the-go.
                  </p>
                </div>

                <button
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8c6a15] hover:text-[#22623a] font-semibold self-start sm:self-auto py-1 px-2.5 rounded-lg hover:bg-[#faf8f5] transition-colors border border-transparent hover:border-[#e6dfd5]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default Recipe</span>
                </button>
              </div>

              {/* Ingredients Stepper Rows */}
              <div className="space-y-4">
                {nuskha.ingredients.map((ing) => {
                  const currentQty =
                    ingredientQuantities[ing.id] !== undefined
                      ? ingredientQuantities[ing.id]
                      : ing.defaultQuantity;

                  const isOmitted = currentQty === 0;

                  // Herb cost calculation
                  const herbCost = Math.round(
                    ing.pricePerUnit * currentQty * currentDurationConfig.multiplier
                  );

                  return (
                    <div
                      key={ing.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isOmitted
                          ? "bg-[#faf8f5] border-[#e6dfd5] opacity-60"
                          : "bg-white border-[#e6dfd5] hover:border-[#22623a]/40 shadow-2xs"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Herb Name, Role, & Monograph */}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#22623a]">
                              {ing.name}
                            </span>
                            <span className="text-xs text-[#8c6a15] font-serif font-semibold" dir="rtl">
                              ({ing.urduName})
                            </span>
                            {ing.isOptional && (
                              <span className="px-1.5 py-0.2 bg-[#f4f9f5] border border-[#d8ecde] text-[#22623a] rounded text-[9px] font-bold uppercase tracking-wider">
                                Optional
                              </span>
                            )}
                          </div>

                          {ing.role && (
                            <p className="text-xs text-[#7a7268]">
                              <strong className="text-[#59534b]">Role:</strong> {ing.role}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-[#7a7268]">
                            <span>
                              Rate: ₨ {ing.pricePerUnit} per {ing.unit === "grams" ? "g" : ing.unit}
                            </span>
                            <span>·</span>
                            <span>
                              Range: {ing.minQuantity}{ing.unit === "grams" ? "g" : ing.unit} – {ing.maxQuantity}{ing.unit === "grams" ? "g" : ing.unit}
                            </span>
                          </div>
                        </div>

                        {/* Stepper Controls & Subtotal */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-[#e6dfd5] rounded-xl bg-[#faf8f5] p-1">
                            <button
                              onClick={() => handleQuantityChange(ing.id, -(ing.step || 5))}
                              disabled={currentQty <= ing.minQuantity}
                              className="w-8 h-8 rounded-lg bg-white border border-[#e6dfd5] flex items-center justify-center text-[#59534b] hover:text-[#22623a] hover:bg-[#f4f9f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title={`Decrease ${ing.step || 5}${ing.unit === "grams" ? "g" : ing.unit}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-16 text-center">
                              <span className="text-sm font-bold text-[#1a1816] block">
                                {currentQty}
                                <span className="text-[10px] font-normal text-[#7a7268] ml-0.5">
                                  {ing.unit === "grams" ? "g" : ing.unit}
                                </span>
                              </span>
                            </div>

                            <button
                              onClick={() => handleQuantityChange(ing.id, ing.step || 5)}
                              disabled={currentQty >= ing.maxQuantity}
                              className="w-8 h-8 rounded-lg bg-white border border-[#e6dfd5] flex items-center justify-center text-[#59534b] hover:text-[#22623a] hover:bg-[#f4f9f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title={`Increase ${ing.step || 5}${ing.unit === "grams" ? "g" : ing.unit}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Calculated Herb Subtotal */}
                          <div className="w-20 text-right">
                            <span className="text-xs font-bold text-[#22623a] block">
                              ₨ {herbCost.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#7a7268]">
                              {Math.round(currentQty * currentDurationConfig.multiplier)}g total
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Deep Clinical Accordions / Tabs */}
            <div className="bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden shadow-xs">
              {/* Tab Navigation */}
              <div className="flex border-b border-[#e6dfd5] bg-[#faf8f5] overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-5 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === "overview"
                      ? "border-[#22623a] text-[#22623a] bg-white"
                      : "border-transparent text-[#7a7268] hover:text-[#22623a]"
                  }`}
                >
                  Clinical Benefits &amp; Purpose
                </button>
                <button
                  onClick={() => setActiveTab("dosage")}
                  className={`px-5 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === "dosage"
                      ? "border-[#22623a] text-[#22623a] bg-white"
                      : "border-transparent text-[#7a7268] hover:text-[#22623a]"
                  }`}
                >
                  Dosage &amp; How to Use
                </button>
                <button
                  onClick={() => setActiveTab("advice")}
                  className={`px-5 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === "advice"
                      ? "border-[#22623a] text-[#22623a] bg-white"
                      : "border-transparent text-[#7a7268] hover:text-[#22623a]"
                  }`}
                >
                  Diet &amp; Parhaiz (Precautions)
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 text-xs sm:text-sm leading-relaxed text-[#59534b]">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-[#22623a] text-sm mb-1">
                        Traditional Indications (افعال و خواص)
                      </h4>
                      <p>{nuskha.traditionalPurpose}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#22623a] text-sm mb-2">
                        Key Health Benefits
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {nuskha.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#2d7648] shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "dosage" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#22623a] text-sm">
                      Recommended Administration &amp; Anupana (طریقہ استعمال)
                    </h4>
                    <p className="bg-[#f4f9f5] p-4 rounded-xl border border-[#d8ecde] text-[#22623a] font-medium">
                      {nuskha.dosageInstructions}
                    </p>
                    <p className="text-xs text-[#7a7268]">
                      Note: In Unani medicine, taking remedies with warm water, lukewarm milk, or pure Arq (such as Arq Mako or Arq Kasni) enhances systemic absorption.
                    </p>
                  </div>
                )}

                {activeTab === "advice" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#22623a] text-sm">
                      Hakim&apos;s Dietary Advice &amp; Lifestyle Precautions (پرہیز)
                    </h4>
                    <p>{nuskha.hakimAdvice || "Avoid excessive cold drinks, deeply fried foods, and highly processed spices during the course of medication for optimal results."}</p>
                    <div className="p-3.5 bg-[#fff8e6] rounded-xl border border-[#f5e2a8] text-[#8c6a15] text-xs">
                      <strong>Safety Reminder:</strong> Keep all compounded herbal remedies tightly sealed in a dry place away from moisture and direct sunlight.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ════════ RIGHT COLUMN (5 SPANS): STICKY FORMULATION CALCULATOR & ORDER SUMMARY ════════ */}
          <div className="lg:col-span-5 sticky top-[76px] space-y-6">

            {/* 1. Configuration & Live Pricing Card */}
            <div className="bg-white rounded-2xl border border-[#e6dfd5] p-6 space-y-6 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd5]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c59b27]" />
                  <h3 className="font-serif font-bold text-base text-[#22623a]">
                    Formulation Summary
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-[#2d7648] bg-[#f4f9f5] px-2 py-0.5 rounded-full border border-[#d8ecde]">
                  Live Calculation
                </span>
              </div>

              {/* ── Duration Selector ── */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#22623a] block">
                  1. Select Course Duration:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COURSE_DURATIONS.map((dur) => {
                    const isSelected = selectedCourseDuration === dur.id;
                    return (
                      <button
                        key={dur.id}
                        type="button"
                        onClick={() => setSelectedCourseDuration(dur.id)}
                        className={`p-2.5 rounded-xl text-center border transition-all ${
                          isSelected
                            ? "bg-[#22623a] text-white border-[#22623a] shadow-xs"
                            : "bg-[#faf8f5] text-[#59534b] border-[#e6dfd5] hover:bg-[#ede6dc]"
                        }`}
                      >
                        <span className="text-xs font-bold block">{dur.label.split(" ")[0]} {dur.label.split(" ")[1]}</span>
                        {dur.discountPercent > 0 ? (
                          <span
                            className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                              isSelected ? "bg-[#c59b27] text-[#22623a]" : "text-[#2d7648]"
                            }`}
                          >
                            Save {dur.discountPercent}%
                          </span>
                        ) : (
                          <span className="text-[9px] opacity-70">Standard</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Preparation Format Selector ── */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#22623a] block">
                  2. Choose Compounding Format:
                </label>
                <div className="space-y-2">
                  {PREPARATION_FORMAT_OPTIONS.map((format) => {
                    const isSelected = selectedPrepFormat === format.id;
                    return (
                      <div
                        key={format.id}
                        onClick={() => setSelectedPrepFormat(format.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#f4f9f5] border-[#22623a] ring-1 ring-[#22623a]"
                            : "bg-white border-[#e6dfd5] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-[#22623a] bg-[#22623a] text-white"
                                : "border-[#7a7268]"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#22623a] block">
                              {format.label}
                            </span>
                            <span className="text-[10px] text-[#7a7268]">
                              {format.description}
                            </span>
                          </div>
                        </div>

                        {format.priceAdjustment !== 0 && (
                          <span className="text-[11px] font-semibold text-[#8c6a15]">
                            {format.priceAdjustment > 0 ? `+₨ ${format.priceAdjustment}` : `-₨ ${Math.abs(format.priceAdjustment)}`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Live Cost Breakdown ── */}
              <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5] space-y-2 text-xs">
                <div className="flex justify-between text-[#59534b]">
                  <span>Pure Herbal Ingredients ({livePricing.totalWeightGrams}g):</span>
                  <span className="font-semibold text-[#1a1816]">
                    ₨ {livePricing.ingredientsCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[#59534b]">
                  <span>Apothecary Grinding &amp; Prep Fee:</span>
                  <span className="font-semibold text-[#1a1816]">
                    ₨ {livePricing.preparationFee.toLocaleString()}
                  </span>
                </div>

                {livePricing.durationDiscount > 0 && (
                  <div className="flex justify-between text-[#2d7648] font-semibold">
                    <span>Course Discount ({currentDurationConfig.discountPercent}% Off):</span>
                    <span>- ₨ {livePricing.durationDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-[#22623a] pt-2 border-t border-[#e6dfd5]">
                  <span>Total (per package):</span>
                  <span>₨ {livePricing.finalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* ── Package Quantity Stepper ── */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-[#59534b]">Quantity:</span>
                <div className="flex items-center border border-[#e6dfd5] rounded-xl bg-[#faf8f5] p-1">
                  <button
                    onClick={() => setPackageQuantity((q) => Math.max(1, q - 1))}
                    disabled={packageQuantity <= 1}
                    className="w-7 h-7 rounded-lg bg-white border border-[#e6dfd5] flex items-center justify-center text-[#59534b] hover:text-[#22623a] disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-[#1a1816]">
                    {packageQuantity}
                  </span>
                  <button
                    onClick={() => setPackageQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#e6dfd5] flex items-center justify-center text-[#59534b] hover:text-[#22623a] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* ── Action Buttons ── */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                  <span>
                    Add to Cart · ₨ {(livePricing.finalPrice * packageQuantity).toLocaleString()}
                  </span>
                </button>

                <div className="grid grid-cols-5 gap-2">
                  <a
                    href={generateWhatsAppDirectUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-4 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold tracking-wide rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>Order Directly on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(nuskha.id)}
                    aria-label={isInWishlist(nuskha.id) ? "Remove from wishlist" : "Add to wishlist"}
                    title={isInWishlist(nuskha.id) ? "In your Saved Remedies" : "Save to Wishlist"}
                    className={`col-span-1 py-3 rounded-xl border flex items-center justify-center transition-all ${
                      isInWishlist(nuskha.id)
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-[#faf8f5] hover:bg-[#f0ebe1] border-[#e6dfd5] text-[#59534b] hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isInWishlist(nuskha.id) ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Guarantee badges */}
              <div className="pt-2 border-t border-[#f4eee5] space-y-2 text-[11px] text-[#7a7268]">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#2d7648]" />
                  <span>Free Courier Delivery over ₨ {CLINIC_INFO.freeShippingThreshold.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2d7648]" />
                  <span>100% Pure Herbs Guarantee · Hand-Compounded</span>
                </div>
              </div>
            </div>

            {/* 2. Need Custom Formulation Advice Card */}
            <div className="bg-[#11351e] text-[#f4eee5] rounded-2xl p-5 border border-[#143e23] space-y-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#c59b27]" />
                <h4 className="text-xs font-bold text-white font-serif">
                  Need a Personalized Hakim Nuskha?
                </h4>
              </div>
              <p className="text-[11px] text-[#ded8ce] leading-relaxed">
                If you suffer from chronic conditions or multiple symptoms, our Hakim can design a custom formulation tailored to your exact pulse and temperament.
              </p>
              <Link
                href="/consultation"
                className="inline-flex items-center gap-1.5 text-xs text-[#c59b27] hover:underline font-semibold"
              >
                <span>Book Free Online Consultation →</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
