"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  Leaf,
  Info,
  Scale,
  DollarSign,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import { NUSKHA_CATEGORIES } from "@/app/data/nuskhajaat";

const PREPARATION_TYPES = [
  { id: "Safoof", name: "Safoof (Finely Ground Herbal Powder)" },
  { id: "Majun", name: "Majun (Traditional Pure Honey Paste)" },
  { id: "Khamira", name: "Khamira (Electuary / Cardiac Tonic)" },
  { id: "Itrifal", name: "Itrifal (Triphala-Based Compound)" },
  { id: "Joshanda", name: "Joshanda (Herbal Decoction Mix)" },
  { id: "Hab/Qurs", name: "Hab / Qurs (Herbal Tablets/Pills)" },
  { id: "Lauq", name: "Lauq (Linctus / Cough Compound)" },
];

const PRESET_HERBS = [
  { name: "Ajwain Desi (Carom Seeds)", urduName: "اجوائن دیسی", role: "Digestion & Gas Relief", unit: "grams", defaultQuantity: 50, pricePerUnit: 1.8 },
  { name: "Sonf (Fennel Seeds)", urduName: "سونف", role: "Cooling & Bloating Relief", unit: "grams", defaultQuantity: 50, pricePerUnit: 1.6 },
  { name: "Zanjabeel (Dry Ginger / Sonth)", urduName: "سونٹھ", role: "Metabolism & Digestion", unit: "grams", defaultQuantity: 30, pricePerUnit: 2.8 },
  { name: "Zeera Safaid (White Cumin)", urduName: "سفید زیرہ", role: "Appetite Stimulant", unit: "grams", defaultQuantity: 40, pricePerUnit: 2.2 },
  { name: "Mulethi (Licorice Root)", urduName: "ملٹھی", role: "Stomach Soother & Throat", unit: "grams", defaultQuantity: 30, pricePerUnit: 3.2 },
  { name: "Asgandh Nagori (Ashwagandha)", urduName: "اسگندھ ناگوری", role: "Strength & Vitality Tonic", unit: "grams", defaultQuantity: 50, pricePerUnit: 4.5 },
  { name: "Gond Katira (Tragacanth Gum)", urduName: "گوند کتیرا", role: "Cooling Agent & Stamina", unit: "grams", defaultQuantity: 40, pricePerUnit: 3.8 },
  { name: "Salab Misri (Orchis Mascula)", urduName: "ثعلب مصری", role: "Potent Restorative Herb", unit: "grams", defaultQuantity: 20, pricePerUnit: 16.0 },
  { name: "Kalonji (Black Seed)", urduName: "کلونجی", role: "General Health & Immunity", unit: "grams", defaultQuantity: 25, pricePerUnit: 2.5 },
  { name: "Isabgol Musallam (Psyllium Husk)", urduName: "اسبغول مسلم", role: "Digestive Regularity", unit: "grams", defaultQuantity: 50, pricePerUnit: 3.0 },
  { name: "Pudina Khushk (Dry Peppermint)", urduName: "پودینہ خشک", role: "Anti-Spasmodic & Freshness", unit: "grams", defaultQuantity: 25, pricePerUnit: 2.0 },
  { name: "Filfil Siyah (Black Pepper)", urduName: "فلفل سیاہ", role: "Bio-Availability Booster", unit: "grams", defaultQuantity: 15, pricePerUnit: 3.5 },
  { name: "Zafran (Pure Kashmir Saffron)", urduName: "زعفران خالص", role: "Heart & Vitality Catalyst", unit: "grams", defaultQuantity: 2, pricePerUnit: 350.0 },
];

const PRESET_BENEFITS = [
  "100% pure apothecary herbs freshly compounded per order",
  "Zero chemical preservatives, binders, or artificial colors",
  "Classical Unani balance supporting innate bodily humors",
  "Alleviates chronic gastrointestinal distress and indigestion",
  "Strengthens natural vitality, stamina, and nervous tone",
  "Safe and gentle for long-term clinical recovery courses",
];

interface IngredientRow {
  name: string;
  urduName: string;
  role: string;
  unit: string;
  defaultQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  step: number;
  pricePerUnit: number;
  isOptional: boolean;
  notes?: string;
}

interface NuskhaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialNuskha?: any | null;
}

export default function NuskhaFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialNuskha,
}: NuskhaFormModalProps) {
  const isEditing = Boolean(initialNuskha);

  const [formData, setFormData] = useState({
    title: "",
    urduTitle: "",
    slug: "",
    category: "digestion",
    categoryLabel: "Stomach & Digestion (ہاضمہ و معدہ)",
    preparationType: "Safoof",
    preparationFee: "120",
    discountPercentage: "0",
    badge: "Hakim's Choice",
    mizaj: "Balanced & Harmonious (معتدل)",
    shortDescription: "",
    traditionalPurpose: "",
    fullDescription: "",
    dosageInstructions: "Take half a teaspoon (approx. 3g to 5g) twice daily with fresh lukewarm water after meals.",
    howToPrepare: "Sieve all raw herbs to remove dust. Grind in an iron mortar or low-heat herbal pulverizer into a fine powder. Store in an airtight amber jar away from moisture.",
    hakimAdvice: "Avoid fried, stale, or excessively oily foods during this herbal course. Drink plenty of lukewarm water and maintain regular sleep cycles.",
    image: "/images/product/tms-01.png",
    inStock: true,
    featured: false,
    rating: "5.0",
  });

  const [ingredientsList, setIngredientsList] = useState<IngredientRow[]>([]);
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState("");
  const [warningsList, setWarningsList] = useState<string[]>([]);
  const [newWarningInput, setNewWarningInput] = useState("");

  const [imageTab, setImageTab] = useState<"upload" | "url">("url");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (initialNuskha) {
      setFormData({
        title: initialNuskha.title || "",
        urduTitle: initialNuskha.urduTitle || "",
        slug: initialNuskha.slug || "",
        category: initialNuskha.category || "digestion",
        categoryLabel: initialNuskha.categoryLabel || "Stomach & Digestion (ہاضمہ و معدہ)",
        preparationType: initialNuskha.preparationType || "Safoof",
        preparationFee: String(initialNuskha.preparationFee ?? 120),
        discountPercentage: String(initialNuskha.discountPercentage ?? 0),
        badge: initialNuskha.badge || "",
        mizaj: initialNuskha.mizaj || "Balanced (معتدل)",
        shortDescription: initialNuskha.shortDescription || "",
        traditionalPurpose: initialNuskha.traditionalPurpose || "",
        fullDescription: initialNuskha.fullDescription || "",
        dosageInstructions: initialNuskha.dosageInstructions || "",
        howToPrepare: initialNuskha.howToPrepare || "",
        hakimAdvice: initialNuskha.hakimAdvice || "",
        image: initialNuskha.image || "/images/product/tms-01.png",
        inStock: initialNuskha.inStock ?? true,
        featured: initialNuskha.featured ?? false,
        rating: String(initialNuskha.rating ?? 5.0),
      });

      const parsedBenefits = Array.isArray(initialNuskha.benefits)
        ? initialNuskha.benefits
        : typeof initialNuskha.benefits === "string"
        ? JSON.parse(initialNuskha.benefits || "[]")
        : [];
      setBenefitsList(parsedBenefits);

      const parsedWarnings = Array.isArray(initialNuskha.warnings)
        ? initialNuskha.warnings
        : typeof initialNuskha.warnings === "string"
        ? JSON.parse(initialNuskha.warnings || "[]")
        : [];
      setWarningsList(parsedWarnings);

      if (initialNuskha.ingredients && Array.isArray(initialNuskha.ingredients)) {
        setIngredientsList(
          initialNuskha.ingredients.map((ing: any) => ({
            name: ing.name,
            urduName: ing.urduName || "",
            role: ing.role || "",
            unit: ing.unit || "grams",
            defaultQuantity: Number(ing.defaultQuantity) || 50,
            minQuantity: Number(ing.minQuantity) || 10,
            maxQuantity: Number(ing.maxQuantity) || 500,
            step: Number(ing.step) || 5,
            pricePerUnit: Number(ing.pricePerUnit) || 2.0,
            isOptional: Boolean(ing.isOptional),
            notes: ing.notes || "",
          }))
        );
      } else {
        setIngredientsList([]);
      }
    } else {
      // Default new nuskha template with 3 starter herbs
      setFormData({
        title: "",
        urduTitle: "",
        slug: "",
        category: "digestion",
        categoryLabel: "Stomach & Digestion (ہاضمہ و معدہ)",
        preparationType: "Safoof",
        preparationFee: "120",
        discountPercentage: "0",
        badge: "Classical Formula",
        mizaj: "Warm & Dry 2° (گرم خشک درجہ دوم)",
        shortDescription: "",
        traditionalPurpose: "",
        fullDescription: "",
        dosageInstructions: "Take half a teaspoon (approx. 3g to 5g) twice daily with fresh lukewarm water after meals.",
        howToPrepare: "Sieve all raw herbs to remove dust. Grind in an iron mortar or low-heat herbal pulverizer into a fine powder. Store in an airtight amber jar away from moisture.",
        hakimAdvice: "Avoid fried, stale, or excessively oily foods during this herbal course. Maintain hydration and gentle daily walking.",
        image: "/images/product/tms-01.png",
        inStock: true,
        featured: false,
        rating: "5.0",
      });

      setBenefitsList([
        "100% pure apothecary herbs freshly compounded per order",
        "Classical Unani formula prepared under supervision of qualified Hakim",
        "Zero chemical preservatives, binders, or artificial colors",
      ]);
      setWarningsList([
        "Consult your physician if pregnant, nursing, or suffering from acute renal disorder.",
      ]);
      setIngredientsList([
        {
          name: "Sonf (Fennel Seeds)",
          urduName: "سونف",
          role: "Gastric Soother",
          unit: "grams",
          defaultQuantity: 50,
          minQuantity: 10,
          maxQuantity: 250,
          step: 5,
          pricePerUnit: 1.6,
          isOptional: false,
        },
        {
          name: "Ajwain Desi (Carom Seeds)",
          urduName: "اجوائن دیسی",
          role: "Gas & Bloating Relief",
          unit: "grams",
          defaultQuantity: 50,
          minQuantity: 10,
          maxQuantity: 250,
          step: 5,
          pricePerUnit: 1.8,
          isOptional: false,
        },
        {
          name: "Zanjabeel (Dry Ginger / Sonth)",
          urduName: "سونٹھ",
          role: "Digestive Fire Activator",
          unit: "grams",
          defaultQuantity: 30,
          minQuantity: 5,
          maxQuantity: 150,
          step: 5,
          pricePerUnit: 2.8,
          isOptional: true,
        },
      ]);
    }
    setError(null);
    setUploadSuccess(false);
  }, [initialNuskha, isOpen]);

  if (!isOpen) return null;

  // Auto-slug generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      ...(!isEditing
        ? {
            slug: val
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          }
        : {}),
    }));
  };

  const handleCategoryChange = (catId: string) => {
    const found = NUSKHA_CATEGORIES.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      category: catId,
      categoryLabel: found ? `${found.name} (${found.urduName})` : catId,
    }));
  };

  // Ingredient Helpers
  const addIngredientRow = (preset?: typeof PRESET_HERBS[0]) => {
    if (preset) {
      setIngredientsList((prev) => [
        ...prev,
        {
          name: preset.name,
          urduName: preset.urduName,
          role: preset.role,
          unit: preset.unit,
          defaultQuantity: preset.defaultQuantity,
          minQuantity: 5,
          maxQuantity: preset.defaultQuantity * 5,
          step: preset.unit === "grams" ? 5 : 1,
          pricePerUnit: preset.pricePerUnit,
          isOptional: false,
          notes: "",
        },
      ]);
    } else {
      setIngredientsList((prev) => [
        ...prev,
        {
          name: "",
          urduName: "",
          role: "Active Herb",
          unit: "grams",
          defaultQuantity: 50,
          minQuantity: 10,
          maxQuantity: 500,
          step: 5,
          pricePerUnit: 2.5,
          isOptional: false,
          notes: "",
        },
      ]);
    }
  };

  const updateIngredient = (index: number, field: keyof IngredientRow, value: any) => {
    setIngredientsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeIngredient = (index: number) => {
    setIngredientsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculated compound metrics
  const totalBaseWeight = ingredientsList.reduce(
    (sum, ing) => sum + (ing.unit === "grams" ? Number(ing.defaultQuantity || 0) : 0),
    0
  );
  const totalBaseCost = ingredientsList.reduce(
    (sum, ing) => sum + Number(ing.defaultQuantity || 0) * Number(ing.pricePerUnit || 0),
    0
  );
  const totalBasePrice = Math.round(totalBaseCost + Number(formData.preparationFee || 0));

  // Benefit Helpers
  const addBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setBenefitsList((prev) => [...prev, newBenefitInput.trim()]);
    setNewBenefitInput("");
  };

  const removeBenefit = (idx: number) => {
    setBenefitsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Warning Helpers
  const addWarning = () => {
    if (!newWarningInput.trim()) return;
    setWarningsList((prev) => [...prev, newWarningInput.trim()]);
    setNewWarningInput("");
  };

  const removeWarning = (idx: number) => {
    setWarningsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error("Formula title is required.");
      }
      if (ingredientsList.length === 0) {
        throw new Error("Please add at least one ingredient herb to the compound.");
      }
      for (const ing of ingredientsList) {
        if (!ing.name.trim()) {
          throw new Error("All ingredient herbs must have a name.");
        }
      }

      const payload = {
        title: formData.title,
        urduTitle: formData.urduTitle,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: formData.category,
        categoryLabel: formData.categoryLabel,
        preparationType: formData.preparationType,
        preparationFee: Number(formData.preparationFee) || 120,
        discountPercentage: Number(formData.discountPercentage) || 0,
        badge: formData.badge,
        mizaj: formData.mizaj,
        shortDescription: formData.shortDescription,
        traditionalPurpose: formData.traditionalPurpose,
        fullDescription: formData.fullDescription,
        dosageInstructions: formData.dosageInstructions,
        howToPrepare: formData.howToPrepare,
        hakimAdvice: formData.hakimAdvice,
        image: formData.image,
        inStock: formData.inStock,
        featured: formData.featured,
        rating: Number(formData.rating) || 5.0,
        benefits: benefitsList,
        warnings: warningsList,
        ingredients: ingredientsList,
      };

      const url = isEditing
        ? `/api/nuskhajaat/${initialNuskha.id || initialNuskha.slug}`
        : "/api/nuskhajaat";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save Nuskha formula.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e6dfd5] flex flex-col max-h-[92vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22623a] text-white flex items-center justify-center font-serif font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#c59b27]" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#22623a]">
                {isEditing ? "Edit Compounded Nuskha" : "Create New Unani Nuskha"}
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Configure herb proportions, prices per gram, and compounding rules for live price calculation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#59534b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Identity & Urdu Names */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f4eee5] text-[#22623a] font-bold text-sm">
              <FileText className="w-4 h-4 text-[#c59b27]" />
              <span>1. Basic Clinical Formula Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Formula Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nuskha Hazim Khas"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Formula Name (Urdu / Arabic)
                </label>
                <input
                  type="text"
                  placeholder="e.g. نسخہ ہاضم خاص و مروق"
                  dir="rtl"
                  value={formData.urduTitle}
                  onChange={(e) => setFormData({ ...formData, urduTitle: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-arabic text-sm focus:border-[#22623a] focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  URL Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  placeholder="nuskha-hazim-khas"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#59534b] font-mono text-[11px] focus:border-[#22623a] focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Clinical Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none font-medium"
                >
                  {NUSKHA_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.urduName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Primary Preparation Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.preparationType}
                  onChange={(e) => setFormData({ ...formData, preparationType: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none font-medium"
                >
                  {PREPARATION_TYPES.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Mizaj / Temperament
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warm & Dry 2° (گرم خشک درجہ دوم)"
                  value={formData.mizaj}
                  onChange={(e) => setFormData({ ...formData, mizaj: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Base Compounding Fee (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.preparationFee}
                  onChange={(e) => setFormData({ ...formData, preparationFee: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold text-[#22623a] focus:border-[#22623a] focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Badge / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hakim's Choice / Top Seller"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">
                Short Clinical Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Briefly describe what this compound treats and its key botanical actions..."
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">
                Traditional Unani Purpose & Indications
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Classical carminative for burning indigestion, gas, and poor liver appetite..."
                value={formData.traditionalPurpose}
                onChange={(e) => setFormData({ ...formData, traditionalPurpose: e.target.value })}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Section 2: DYNAMIC MULTI-HERB INGREDIENTS BUILDER */}
          <div className="space-y-4 pt-4 border-t border-[#e6dfd5]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#f4eee5]">
              <div className="flex items-center gap-2 text-[#22623a] font-bold text-sm">
                <Leaf className="w-4 h-4 text-[#c59b27]" />
                <span>2. Dynamic Compound Herbal Formula ({ingredientsList.length} herbs)</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#59534b]">
                  Total Weight: <strong className="text-[#22623a] font-bold">{totalBaseWeight}g</strong>
                </span>
                <span className="text-[#59534b]">
                  Base Price: <strong className="text-[#22623a] font-bold">₨ {totalBasePrice.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Quick Add Presets Row */}
            <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] space-y-2">
              <span className="text-[11px] font-bold text-[#22623a] block">
                Quick-Add Classical Dispensary Herbs:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HERBS.map((herb) => (
                  <button
                    key={herb.name}
                    type="button"
                    onClick={() => addIngredientRow(herb)}
                    className="px-2 py-1 bg-white hover:bg-[#22623a] text-[#22623a] hover:text-white border border-[#e6dfd5] hover:border-[#22623a] rounded-md text-[10px] font-semibold transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{herb.name.split(" ")[0]}</span>
                    <span className="text-[9px] opacity-70">({herb.urduName})</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addIngredientRow()}
                  className="px-2.5 py-1 bg-[#22623a] text-white hover:bg-[#1b502e] rounded-md text-[10px] font-bold transition-colors shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom Herb</span>
                </button>
              </div>
            </div>

            {/* Ingredient Rows List */}
            <div className="space-y-3">
              {ingredientsList.map((ing, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white rounded-xl border border-[#e6dfd5] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#f4eee5] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#22623a]/10 text-[#22623a] font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#22623a] text-xs">
                        {ing.name || "Unnamed Herb Row"}
                      </span>
                      {ing.urduName && (
                        <span className="text-[11px] text-[#8c6a15] font-arabic">
                          ({ing.urduName})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] text-[#59534b] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ing.isOptional}
                          onChange={(e) => updateIngredient(idx, "isOptional", e.target.checked)}
                          className="rounded text-[#22623a] focus:ring-[#22623a]"
                        />
                        <span>Optional Herb</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Remove Herb"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
                    <div className="col-span-2 space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Herb Botanical/English Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mulethi (Licorice Root)"
                        value={ing.name}
                        onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] text-[#1a1816] outline-none focus:border-[#22623a]"
                      />
                    </div>

                    <div className="col-span-2 space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Urdu Name</label>
                      <input
                        type="text"
                        placeholder="e.g. ملٹھی"
                        dir="rtl"
                        value={ing.urduName}
                        onChange={(e) => updateIngredient(idx, "urduName", e.target.value)}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] font-arabic text-[#1a1816] outline-none focus:border-[#22623a]"
                      />
                    </div>

                    <div className="col-span-2 space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Therapeutic Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Gastric Mucosa Soother"
                        value={ing.role}
                        onChange={(e) => updateIngredient(idx, "role", e.target.value)}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] text-[#1a1816] outline-none focus:border-[#22623a]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Unit</label>
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] text-[#1a1816] outline-none focus:border-[#22623a]"
                      >
                        <option value="grams">grams (g)</option>
                        <option value="tola">tola</option>
                        <option value="masha">masha</option>
                        <option value="ml">ml</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Default Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={ing.defaultQuantity}
                        onChange={(e) => updateIngredient(idx, "defaultQuantity", Number(e.target.value))}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] font-bold text-[#22623a] outline-none focus:border-[#22623a]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Min Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={ing.minQuantity}
                        onChange={(e) => updateIngredient(idx, "minQuantity", Number(e.target.value))}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] text-[#59534b] outline-none focus:border-[#22623a]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Max Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={ing.maxQuantity}
                        onChange={(e) => updateIngredient(idx, "maxQuantity", Number(e.target.value))}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] text-[#59534b] outline-none focus:border-[#22623a]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Step</label>
                      <input
                        type="number"
                        min="1"
                        value={ing.step}
                        onChange={(e) => updateIngredient(idx, "step", Number(e.target.value))}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] text-[#59534b] outline-none focus:border-[#22623a]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-[#6a6660]">Price/Unit (₨)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={ing.pricePerUnit}
                        onChange={(e) => updateIngredient(idx, "pricePerUnit", Number(e.target.value))}
                        className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] font-bold text-[#8c6a15] outline-none focus:border-[#22623a]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-[#7a7268] pt-1">
                    <span>
                      Herb Cost in Base Formula:{" "}
                      <strong className="text-[#1a1816]">
                        ₨ {(Number(ing.defaultQuantity || 0) * Number(ing.pricePerUnit || 0)).toFixed(0)}
                      </strong>
                    </span>
                    {ing.isOptional && (
                      <span className="text-[#8c6a15] font-semibold">
                        ★ Patient can toggle or exclude this herb
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Clinical Monograph (Dosage, Preparation, Advice) */}
          <div className="space-y-4 pt-4 border-t border-[#e6dfd5]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f4eee5] text-[#22623a] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#c59b27]" />
              <span>3. Clinical Dosage, Preparation Method &amp; Hakim Guidance</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">
                Dosage Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Half teaspoon (3g) twice daily with lukewarm water after meals..."
                value={formData.dosageInstructions}
                onChange={(e) => setFormData({ ...formData, dosageInstructions: e.target.value })}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">
                Preparation &amp; Grinding Method
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Sieve herbs to remove dust, grind on low heat herbal pulverizer to prevent loss of volatile oils..."
                value={formData.howToPrepare}
                onChange={(e) => setFormData({ ...formData, howToPrepare: e.target.value })}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">
                Hakim Clinical Advice &amp; Dietary Parhez
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Avoid sour, fried, and carbonated beverages during this herbal course..."
                value={formData.hakimAdvice}
                onChange={(e) => setFormData({ ...formData, hakimAdvice: e.target.value })}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:border-[#22623a] focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Section 4: Benefits & Precautions */}
          <div className="space-y-4 pt-4 border-t border-[#e6dfd5]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f4eee5] text-[#22623a] font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#c59b27]" />
              <span>4. Key Botanical Benefits &amp; Safety Warnings</span>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-[#1a1816]">Benefits Bullets</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a key health benefit..."
                  value={newBenefitInput}
                  onChange={(e) => setNewBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBenefit();
                    }
                  }}
                  className="flex-1 p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-4 py-2 bg-[#22623a] text-white rounded-lg font-bold hover:bg-[#1b502e]"
                >
                  Add
                </button>
              </div>

              {/* Preset benefits clickables */}
              <div className="flex flex-wrap gap-1 pt-1">
                {PRESET_BENEFITS.map((pBen) => (
                  <button
                    key={pBen}
                    type="button"
                    onClick={() => {
                      if (!benefitsList.includes(pBen)) {
                        setBenefitsList((prev) => [...prev, pBen]);
                      }
                    }}
                    className="text-[10px] px-2 py-0.5 bg-[#faf8f5] border border-[#e6dfd5] text-[#59534b] hover:text-[#22623a] hover:border-[#22623a] rounded-md transition-colors"
                  >
                    + {pBen.slice(0, 35)}...
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                {benefitsList.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-[#f4f9f5] border border-[#d8ecde] rounded-lg text-[#22623a]"
                  >
                    <span className="font-medium">• {b}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(i)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="font-semibold text-[#1a1816]">Safety Warnings &amp; Precautions</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Not recommended for pregnant women or children under 5..."
                  value={newWarningInput}
                  onChange={(e) => setNewWarningInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addWarning();
                    }
                  }}
                  className="flex-1 p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={addWarning}
                  className="px-4 py-2 bg-[#c59b27] text-[#22623a] rounded-lg font-bold hover:bg-[#aa821c]"
                >
                  Add Warning
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                {warningsList.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900"
                  >
                    <span>⚠ {w}</span>
                    <button
                      type="button"
                      onClick={() => removeWarning(i)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Image & Publishing Controls */}
          <div className="space-y-4 pt-4 border-t border-[#e6dfd5]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f4eee5] text-[#22623a] font-bold text-sm">
              <ImageIcon className="w-4 h-4 text-[#c59b27]" />
              <span>5. Product Imagery &amp; Store Visibility</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setImageTab("url")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    imageTab === "url"
                      ? "bg-[#22623a] text-white"
                      : "bg-[#faf8f5] text-[#59534b] border border-[#e6dfd5]"
                  }`}
                >
                  Image URL / Asset Path
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("upload")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    imageTab === "upload"
                      ? "bg-[#22623a] text-white"
                      : "bg-[#faf8f5] text-[#59534b] border border-[#e6dfd5]"
                  }`}
                >
                  Upload New Photo
                </button>
              </div>

              {imageTab === "url" ? (
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="/images/product/tms-01.png or https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs"
                  />
                  {formData.image && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#e6dfd5] bg-white shrink-0">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as any).src = "/images/product/tms-01.png";
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[#faf8f5] rounded-xl border border-dashed border-[#e6dfd5]">
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setFormData((prev) => ({ ...prev, image: res[0].url }));
                        setUploadSuccess(true);
                      }
                    }}
                    onUploadError={(err: Error) => {
                      setError(`Image upload error: ${err.message}`);
                    }}
                  />
                  {uploadSuccess && (
                    <p className="text-[#2d7648] text-center font-bold text-xs mt-2">
                      ✓ Image uploaded successfully!
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="rounded text-[#22623a] focus:ring-[#22623a]"
                />
                <span className="font-semibold text-[#1a1816]">Formula Available in Stock</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-[#22623a] focus:ring-[#22623a]"
                />
                <span className="font-semibold text-[#1a1816]">Feature on Nuskhajaat Showcase</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-[#e6dfd5] hover:bg-[#faf8f5] text-[#59534b] font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Formula...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? "Update Formula" : "Publish Nuskha Formula"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
