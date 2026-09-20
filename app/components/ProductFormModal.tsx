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
  Package,
  Layers,
  Leaf,
  Info,
  Scale,
  ArrowRight,
  ArrowLeft,
  Eye,
  CheckCircle2,
  BookOpen,
  DollarSign,
  TrendingUp,
  Tag,
  ShieldCheck,
  Star,
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

export const DEFAULT_CATEGORIES = [
  { id: "murabbajaat", name: "Herbal Preserves (Murabba)", urdu: "مربہ جات" },
  { id: "arqiyat", name: "Pure Herbal Distillates (Arq)", urdu: "عرقیات" },
  { id: "oils-marham", name: "Pain Relief Oils & Balms", urdu: "روغنیات و مرہم" },
  { id: "herbs-seeds", name: "Whole Herbs & Seeds", urdu: "جڑی بوٹیاں و تخم" },
  { id: "teas-vitality", name: "Wellness Teas & Energy Mixes", urdu: "قہوہ جات و معجون" },
  { id: "hair-skin", name: "Hair & Skin Care", urdu: "حسن و صحت بال و جلد" },
];

export const UNANI_PRESETS = [
  {
    id: "majun",
    name: "Majun (معجون)",
    category: "teas-vitality",
    categoryLabel: "Wellness Teas & Energy Mixes",
    mizaj: "Hot & Dry (Warming & Invigorating)",
    traditionalPurpose: "General Vitality, Brain & Nervous System Strength",
    badge: "Hakim's Special Formula",
    dosage: "5g to 10g twice daily with lukewarm milk",
    howToUse: "Take in the morning on an empty stomach and before bedtime.",
    hakimAdvice: "Avoid sour, spicy, and excessive tea intake during the course.",
    shortDescription: "Traditional semi-solid herbal confection enriched with natural honey and adaptogenic roots.",
    fullDescription: "Prepared using centuries-old Tibb-e-Unani methodologies. Slow-cooked herbs in pure honey base provide sustained stamina, mental clarity, and deep physical nourishment.",
    benefits: [
      "Boosts physical stamina and natural vigor",
      "Strengthens brain, memory, and nervous system",
      "Improves digestion and metabolic absorption",
      "100% natural formula without synthetic stimulants",
    ],
    ingredients: [
      { name: "Asgand Nagori (Ashwagandha)", role: "Vitality & Strength Adaptogen" },
      { name: "Salab Misri", role: "Nervous Tonic & Nourishment" },
      { name: "Zafran (Pure Saffron)", role: "Heart & Brain Refreshing Agent" },
      { name: "Pure Honey (Shehed)", role: "Natural Base & Bioavailability Enhancer" },
    ],
    suggestedSizes: [
      { name: "Standard Jar", qty: "250", unit: "g", price: "1850", cost: "950", stock: "30" },
      { name: "Family Pack", qty: "500", unit: "g", price: "3400", cost: "1750", stock: "15" },
    ],
  },
  {
    id: "safoof",
    name: "Safoof (سفوف / پاؤڈر)",
    category: "herbs-seeds",
    categoryLabel: "Whole Herbs & Seeds",
    mizaj: "Balanced & Cooling",
    traditionalPurpose: "Digestive Balance, Acidity, Gas & Bloating Relief",
    badge: "100% Herbal Powder",
    dosage: "1 teaspoon (3-5g) after meals with normal water",
    howToUse: "Mix with a glass of water or swallow directly followed by water.",
    hakimAdvice: "Chew food thoroughly and reduce intake of deep-fried foods.",
    shortDescription: "Finely ground organic digestive herbs for instant gastrointestinal comfort.",
    fullDescription: "Micro-pulverized natural herbs designed to quickly normalize gastric acid, prevent indigestion, relieve gas, and detoxify the intestine.",
    benefits: [
      "Relieves acidity, heartburn, and sour burps",
      "Alleviates bloating and abdominal heaviness",
      "Normalizes bowel movements naturally",
      "Safe for long-term daily digestive care",
    ],
    ingredients: [
      { name: "Sonf (Fennel Seeds)", role: "Digestive Carminative" },
      { name: "Zeera Safaid (Cumin)", role: "Enzyme Activator" },
      { name: "Pudina Khushk (Mint)", role: "Cooling & Antispasmodic" },
      { name: "Kala Namak (Black Salt)", role: "Appetite Stimulant" },
    ],
    suggestedSizes: [
      { name: "Pocket Pack", qty: "100", unit: "g", price: "650", cost: "280", stock: "50" },
      { name: "Economy Pack", qty: "250", unit: "g", price: "1400", cost: "600", stock: "30" },
    ],
  },
  {
    id: "khamira",
    name: "Khamira (خمیرہ)",
    category: "teas-vitality",
    categoryLabel: "Wellness Teas & Energy Mixes",
    mizaj: "Cooling & Heart-Soothing",
    traditionalPurpose: "Heart Palpitation, Anxiety, Memory & Brain Tonic",
    badge: "Royal Unani Tonic",
    dosage: "5g (half teaspoon) morning on empty stomach",
    howToUse: "Lick directly or dissolve in a small cup of Arq Gulab (Rose Water).",
    hakimAdvice: "Take regular morning walks and practice calm deep breathing.",
    shortDescription: "Aerated herbal confection with silver foil and precious cardamoms for heart & brain.",
    fullDescription: "Expertly whipped to a light cloudy consistency. Enriched with Warq Nuqra (Pure Silver Foil) and floral essences to calm racing thoughts, soothe palpitations, and enhance mental focus.",
    benefits: [
      "Strengthens cardiac muscles and relieves palpitations",
      "Reduces mental stress, anxiety, and restlessness",
      "Enhances memory recall and cognitive focus",
      "Infused with authentic silver foil (Warq Nuqra)",
    ],
    ingredients: [
      { name: "Warq Nuqra (Silver Foil)", role: "Heart & Brain Refresher" },
      { name: "Marwareed (Purified Pearl)", role: "Cooling Tonic" },
      { name: "Gul-e-Gaozaban", role: "Cardiac Calming Herb" },
      { name: "Elaichi Khurd (Cardamom)", role: "Aromatic Stomachic" },
    ],
    suggestedSizes: [
      { name: "Glass Jar", qty: "150", unit: "g", price: "1650", cost: "800", stock: "25" },
      { name: "Large Jar", qty: "300", unit: "g", price: "2950", cost: "1450", stock: "15" },
    ],
  },
  {
    id: "arq",
    name: "Arq Distillate (عرق)",
    category: "arqiyat",
    categoryLabel: "Pure Herbal Distillates (Arq)",
    mizaj: "Cool & Moist",
    traditionalPurpose: "Liver Detox, Internal Heat & Blood Purification",
    badge: "Triple Steam Distilled",
    dosage: "Half cup (60ml) twice daily before meals",
    howToUse: "Drink directly or dilute with equal parts fresh water or Sharbat.",
    hakimAdvice: "Avoid direct afternoon sun exposure and stay well hydrated.",
    shortDescription: "100% pure steam distillate of fresh botanical flowers and active cooling herbs.",
    fullDescription: "Produced using traditional copper still distillation without artificial essences or chemical preservatives. Gently flushes hepatic toxins and clears skin complexion.",
    benefits: [
      "Cleanses liver and flushes internal body toxins",
      "Relieves internal heat (Jigar ki Garmi)",
      "Promotes natural skin radiance and clarity",
      "Gentle and quickly absorbed floral hydrosol",
    ],
    ingredients: [
      { name: "Gulab Taaza (Fresh Rose)", role: "Cardiotonic & Complexion" },
      { name: "Kasni (Chicory)", role: "Hepatic & Renal Detox" },
      { name: "Mako", role: "Anti-inflammatory for Liver" },
    ],
    suggestedSizes: [
      { name: "Standard Bottle", qty: "500", unit: "ml", price: "450", cost: "180", stock: "60" },
      { name: "Economy Bottle", qty: "800", unit: "ml", price: "750", cost: "310", stock: "40" },
    ],
  },
  {
    id: "roghan",
    name: "Roghan / Oil (روغن)",
    category: "oils-marham",
    categoryLabel: "Pain Relief Oils & Balms",
    mizaj: "Warming & Penetrating",
    traditionalPurpose: "Joint Relief, Muscle Stiffness, Sciatica & Hair Growth",
    badge: "Cold-Pressed Herb Infusion",
    dosage: "Apply 5-10ml to target area and gently massage for 5 minutes",
    howToUse: "Warm slightly before application for maximum transdermal absorption.",
    hakimAdvice: "Avoid direct cold air / fan exposure immediately after massage.",
    shortDescription: "Cold-pressed herbal massage oil infused with 14 analgesic and anti-inflammatory roots.",
    fullDescription: "Deeply penetrating botanical oil formulated to relieve knee arthritis, lower back aches, stiff neck, and post-exertion muscular spasms.",
    benefits: [
      "Quickly soothes joint stiffness and knee aches",
      "Improves localized blood circulation in joints",
      "Deep transdermal absorption without sticky residue",
      "Crafted with pure sesame and mustard oil base",
    ],
    ingredients: [
      { name: "Roghan Til (Sesame Oil Base)", role: "Deep Penetrating Carrier" },
      { name: "Suranjan Shirin (Colchicum)", role: "Classic Unani Joint Specific" },
      { name: "Kuchla Mudabbar", role: "Nerve Stimulant & Pain Killer" },
      { name: "Kalonji Oil", role: "Anti-inflammatory" },
    ],
    suggestedSizes: [
      { name: "Dropper Bottle", qty: "60", unit: "ml", price: "750", cost: "320", stock: "45" },
      { name: "Massage Pack", qty: "120", unit: "ml", price: "1350", cost: "580", stock: "30" },
    ],
  },
  {
    id: "sharbat",
    name: "Sharbat (شربت)",
    category: "teas-vitality",
    categoryLabel: "Wellness Teas & Energy Mixes",
    mizaj: "Cooling & Hydrating",
    traditionalPurpose: "Throat Soothing, Cough, Thirst & Chest Relief",
    badge: "Herbal Syrup",
    dosage: "2 tablespoons (20ml) mixed in warm or cold water",
    howToUse: "Drink 2 to 3 times daily as needed.",
    hakimAdvice: "Gargle with warm salt water for throat irritation.",
    shortDescription: "Soothing floral and herbal syrup prepared from time-tested lung and cooling botanicals.",
    fullDescription: "Sweetened herbal syrup created to coat the throat, relieve dry or productive coughs, reduce chest congestion, and soothe burning sensations.",
    benefits: [
      "Eases dry cough, sore throat, and hoarseness",
      "Provides rapid cooling comfort during hot weather",
      "Safe and tasty for both adults and children",
      "Free from artificial sweeteners or sedatives",
    ],
    ingredients: [
      { name: "Banafsha (Sweet Violet)", role: "Bronchial Soother" },
      { name: "Mulethi (Licorice Root)", role: "Throat Coating Expectorant" },
      { name: "Unnab (Jujube Fruit)", role: "Lung Clarifier" },
    ],
    suggestedSizes: [
      { name: "Small Bottle", qty: "250", unit: "ml", price: "400", cost: "160", stock: "50" },
      { name: "Large Bottle", qty: "500", unit: "ml", price: "750", cost: "300", stock: "35" },
    ],
  },
  {
    id: "murabba",
    name: "Murabba (مربہ)",
    category: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    mizaj: "Balanced & Nourishing",
    traditionalPurpose: "Digestive Longevity, Vitamin C, Eyesight & Heart Tonic",
    badge: "Natural Preserved Fruit",
    dosage: "1 to 2 whole pieces in the morning before breakfast",
    howToUse: "Wash off excess sugar syrup if diabetic, or eat with a cup of warm milk.",
    hakimAdvice: "Chew slowly to allow natural fruit fibers and minerals to absorb.",
    shortDescription: "Whole hand-picked fruits preserved in pure crystal syrup or wild forest honey.",
    fullDescription: "Packed with active bioflavonoids, natural vitamin C, and dietary fiber. Strengthens the gastrointestinal tract, supports eye clarity, and boosts immune resilience.",
    benefits: [
      "Rich in natural antioxidants and Vitamin C",
      "Soothes stomach heat, gas, and chronic acidity",
      "Strengthens eyesight, heart, and memory vitality",
      "100% whole fruits without synthetic colorings",
    ],
    ingredients: [
      { name: "Fresh Amla / Apple / Harar", role: "Primary Botanical Fruit" },
      { name: "Pure Cane Sugar / Honey", role: "Natural Preservative Medium" },
      { name: "Choti Elaichi", role: "Digestive Fragrance" },
    ],
    suggestedSizes: [
      { name: "Standard Jar", qty: "500", unit: "g", price: "1250", cost: "520", stock: "40" },
      { name: "Family Pack", qty: "1000", unit: "g", price: "2200", cost: "980", stock: "20" },
    ],
  },
  {
    id: "hab-qurs",
    name: "Hab / Qurs Tablet (حب و قرص)",
    category: "teas-vitality",
    categoryLabel: "Wellness Teas & Energy Mixes",
    mizaj: "Balanced",
    traditionalPurpose: "Targeted Symptom Relief, Joint & Digestive Action",
    badge: "Concentrated Tablets",
    dosage: "1 to 2 tablets twice daily with water after meals",
    howToUse: "Swallow whole with fresh water.",
    hakimAdvice: "Maintain regular meal timings and drink plenty of water.",
    shortDescription: "Compressed herbal tablets containing concentrated Unani extracts.",
    fullDescription: "Traditional herbal pills formulated without chemical binders. Delivers precise herbal dosages for targeted, convenient therapeutic use.",
    benefits: [
      "Convenient travel-friendly dosage form",
      "High concentration of active botanical extracts",
      "Quick disintegration and digestive absorption",
      "Pure herbal powders without chemical binders",
    ],
    ingredients: [
      { name: "Gond Keekar (Gum Acacia)", role: "Natural Tablet Binder" },
      { name: "Active Herbal Extract", role: "Therapeutic Core" },
    ],
    suggestedSizes: [
      { name: "Bottle (30 Tabs)", qty: "30", unit: "tabs", price: "850", cost: "340", stock: "50" },
      { name: "Bottle (60 Tabs)", qty: "60", unit: "tabs", price: "1550", cost: "620", stock: "35" },
    ],
  },
];

const PRESET_BENEFITS = [
  "Rich in natural vitamins & bio-antioxidants",
  "Soothes stomach heat, gas, and chronic acidity",
  "Strengthens heart, memory, and cognitive vitality",
  "Relieves joint pain, stiffness, and inflammation",
  "Supports natural liver detoxification & clean blood",
  "Boosts daily immune strength and physical stamina",
  "100% pure herbal formulation without harmful chemicals",
  "Prepared hygienically under qualified Hakim supervision",
];

interface UnitItem {
  id: string;
  code: string;
  name: string;
  kind: string;
}

interface FormSizeItem {
  id?: string;
  name: string;
  weight: string;
  price: string;
  costPrice?: string;
  originalPrice?: string;
  unitId?: string;
  quantityValue?: string;
  initialStock?: string;
  lowStockThreshold?: string;
  sku?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProduct?: any | null;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
}: ProductFormModalProps) {
  const isEditing = Boolean(initialProduct);

  // 4-Step Wizard Navigation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [units, setUnits] = useState<UnitItem[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    urduName: "",
    slug: "",
    categoryId: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    price: "",
    originalPrice: "",
    badge: "",
    mizaj: "Balanced & Cooling",
    shortDescription: "",
    traditionalPurpose: "",
    fullDescription: "",
    howToUse: "",
    dosage: "",
    hakimAdvice: "",
    image: "",
    featured: false,
  });

  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState("");

  const [ingredientsList, setIngredientsList] = useState<
    { name: string; role: string }[]
  >([]);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientRole, setNewIngredientRole] = useState("");

  const [sizesList, setSizesList] = useState<FormSizeItem[]>([]);
  const [newSizeName, setNewSizeName] = useState("Standard Pack");
  const [newSizeUnitId, setNewSizeUnitId] = useState("");
  const [newSizeQtyVal, setNewSizeQtyVal] = useState("500");
  const [newSizeWeight, setNewSizeWeight] = useState("500g");
  const [newSizePrice, setNewSizePrice] = useState("");
  const [newSizeCostPrice, setNewSizeCostPrice] = useState("");
  const [newSizeOriginalPrice, setNewSizeOriginalPrice] = useState("");
  const [newSizeInitialStock, setNewSizeInitialStock] = useState("20");
  const [newSizeLowThreshold, setNewSizeLowThreshold] = useState("5");

  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Fetch available units
  useEffect(() => {
    async function loadUnits() {
      try {
        const res = await fetch("/api/units");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setUnits(data.data);
            if (data.data.length > 0 && !newSizeUnitId) {
              const defaultUnit = data.data.find((u: UnitItem) => u.code === "g") || data.data[0];
              setNewSizeUnitId(defaultUnit.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load units:", err);
      }
    }
    if (isOpen) {
      loadUnits();
    }
  }, [isOpen]);

  // Sync weight text when unit or qty value changes
  useEffect(() => {
    if (newSizeUnitId && units.length > 0) {
      const selectedUnit = units.find((u) => u.id === newSizeUnitId);
      if (selectedUnit) {
        const val = newSizeQtyVal.trim();
        setNewSizeWeight(val ? `${val}${selectedUnit.code}` : selectedUnit.code);
      }
    }
  }, [newSizeUnitId, newSizeQtyVal, units]);

  // Initialize or reset form
  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || "",
        urduName: initialProduct.urduName || "",
        slug: initialProduct.slug || "",
        categoryId: initialProduct.categoryId || "murabbajaat",
        categoryLabel:
          initialProduct.categoryLabel ||
          DEFAULT_CATEGORIES.find((c) => c.id === initialProduct.categoryId)?.name ||
          "Herbal Preserves (Murabba)",
        price: initialProduct.price ? String(initialProduct.price) : "",
        originalPrice: initialProduct.originalPrice ? String(initialProduct.originalPrice) : "",
        badge: initialProduct.badge || "",
        mizaj: initialProduct.mizaj || "Balanced & Cooling",
        shortDescription: initialProduct.shortDescription || "",
        traditionalPurpose: initialProduct.traditionalPurpose || "",
        fullDescription: initialProduct.fullDescription || "",
        howToUse: initialProduct.howToUse || "",
        dosage: initialProduct.dosage || "",
        hakimAdvice: initialProduct.hakimAdvice || "",
        image: initialProduct.image || "",
        featured: initialProduct.featured ?? false,
      });

      setBenefitsList(
        Array.isArray(initialProduct.benefits) ? initialProduct.benefits : []
      );

      setIngredientsList(
        Array.isArray(initialProduct.ingredients)
          ? initialProduct.ingredients.map((ing: any) => ({
              name: typeof ing === "string" ? ing : ing.name,
              role: typeof ing === "string" ? "Active herbal ingredient" : ing.role || "",
            }))
          : []
      );

      setSizesList(
        Array.isArray(initialProduct.sizes) && initialProduct.sizes.length > 0
          ? initialProduct.sizes.map((s: any) => ({
              id: s.id,
              name: s.name,
              weight: s.weight,
              price: String(s.price),
              costPrice: s.costPrice ? String(s.costPrice) : "",
              originalPrice: s.originalPrice ? String(s.originalPrice) : "",
              unitId: s.unitId || undefined,
              quantityValue: s.quantityValue ? String(s.quantityValue) : undefined,
              initialStock: s.stockOnHand !== undefined ? String(s.stockOnHand) : "20",
              lowStockThreshold: s.lowStockThreshold ? String(s.lowStockThreshold) : "5",
              sku: s.sku || undefined,
            }))
          : [
              {
                name: "Standard Pack",
                weight: "500g",
                price: initialProduct.price ? String(initialProduct.price) : "1200",
                costPrice: "600",
                initialStock: "25",
                lowStockThreshold: "5",
              },
            ]
      );
      setCurrentStep(1);
    } else {
      // New product defaults
      setFormData({
        name: "",
        urduName: "",
        slug: "",
        categoryId: "murabbajaat",
        categoryLabel: "Herbal Preserves (Murabba)",
        price: "",
        originalPrice: "",
        badge: "Pure Unani Herbal",
        mizaj: "Balanced & Cooling",
        shortDescription: "",
        traditionalPurpose: "",
        fullDescription: "",
        howToUse: "Take 1-2 times daily with warm water or milk as advised.",
        dosage: "1 teaspoon (approx 5g)",
        hakimAdvice: "Avoid sour and deep-fried oily foods during treatment.",
        image: "/images/1-scaled.png",
        featured: false,
      });
      setBenefitsList([
        "Rich in natural vitamins & bio-antioxidants",
        "Soothes stomach heat and supports digestion",
        "100% pure herbal formulation without chemicals",
      ]);
      setIngredientsList([]);
      setSizesList([
        {
          name: "Standard Jar",
          weight: "500g",
          price: "1200",
          costPrice: "600",
          initialStock: "25",
          lowStockThreshold: "5",
        },
      ]);
      setCurrentStep(1);
    }
  }, [initialProduct, isOpen]);

  // Handle 1-Click Unani Formulation Template selection
  const applyUnaniPreset = (preset: typeof UNANI_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: preset.category,
      categoryLabel: preset.categoryLabel,
      mizaj: preset.mizaj,
      traditionalPurpose: preset.traditionalPurpose,
      badge: preset.badge,
      dosage: preset.dosage,
      howToUse: preset.howToUse,
      hakimAdvice: preset.hakimAdvice,
      shortDescription: preset.shortDescription,
      fullDescription: preset.fullDescription,
    }));

    setBenefitsList([...preset.benefits]);
    setIngredientsList([...preset.ingredients]);

    // Build suggested packaging variants
    const newSizes: FormSizeItem[] = preset.suggestedSizes.map((s) => {
      const matchingUnit = units.find((u) => u.code.toLowerCase() === s.unit.toLowerCase());
      return {
        name: s.name,
        weight: `${s.qty}${s.unit}`,
        price: s.price,
        costPrice: s.cost,
        unitId: matchingUnit?.id || undefined,
        quantityValue: s.qty,
        initialStock: s.stock,
        lowStockThreshold: "5",
      };
    });

    if (newSizes.length > 0) {
      setSizesList(newSizes);
      setFormData((prev) => ({ ...prev, price: newSizes[0].price }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === "" || !isEditing ? generatedSlug : prev.slug,
    }));
  };

  const addBenefit = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !benefitsList.includes(trimmed)) {
      setBenefitsList([...benefitsList, trimmed]);
      setNewBenefitInput("");
    }
  };

  const removeBenefit = (index: number) => {
    setBenefitsList(benefitsList.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    if (newIngredientName.trim()) {
      setIngredientsList([
        ...ingredientsList,
        {
          name: newIngredientName.trim(),
          role: newIngredientRole.trim() || "Active herbal botanical",
        },
      ]);
      setNewIngredientName("");
      setNewIngredientRole("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (!newSizePrice.trim() || isNaN(Number(newSizePrice))) {
      setError("Please specify a valid selling price for this pack variant.");
      return;
    }

    const sizeName = newSizeName.trim() || "Standard Pack";
    const selectedUnit = units.find((u) => u.id === newSizeUnitId);
    const weightLabel =
      newSizeWeight.trim() ||
      (selectedUnit && newSizeQtyVal
        ? `${newSizeQtyVal}${selectedUnit.code}`
        : sizeName);

    setSizesList([
      ...sizesList,
      {
        name: sizeName,
        weight: weightLabel,
        price: newSizePrice.trim(),
        costPrice: newSizeCostPrice.trim() || undefined,
        originalPrice: newSizeOriginalPrice.trim() || undefined,
        unitId: newSizeUnitId || undefined,
        quantityValue: newSizeQtyVal.trim() || undefined,
        initialStock: newSizeInitialStock.trim() || "20",
        lowStockThreshold: newSizeLowThreshold.trim() || "5",
      },
    ]);

    if (!formData.price) {
      setFormData((prev) => ({ ...prev, price: newSizePrice.trim() }));
    }

    setNewSizeName("Standard Pack");
    setNewSizeQtyVal("500");
    setNewSizePrice("");
    setNewSizeCostPrice("");
    setNewSizeOriginalPrice("");
    setNewSizeInitialStock("20");
    setError(null);
  };

  const removeSize = (index: number) => {
    if (sizesList.length <= 1) {
      setError("A product must have at least one packaging size/variant.");
      return;
    }
    setSizesList(sizesList.filter((_, i) => i !== index));
  };

  const validateStep = (step: number) => {
    setError(null);
    if (step === 1) {
      if (!formData.categoryId) {
        setError("Please select a primary product category.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.name.trim()) {
        setError("Please enter the product name in English.");
        return false;
      }
      if (!formData.slug.trim()) {
        setError("Please provide a valid URL slug.");
        return false;
      }
      if (!formData.image.trim()) {
        setError("Please upload an image or provide an image URL.");
        return false;
      }
    } else if (step === 3) {
      if (sizesList.length === 0) {
        setError("Please add at least one packaging variant with pricing and stock.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1) as any);
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Please enter the product name.");
      return;
    }
    if (sizesList.length === 0) {
      setError("Please add at least one packaging size variant with pricing.");
      return;
    }
    if (!formData.image) {
      setError("Please upload an image or provide an image URL.");
      return;
    }

    const minSizePrice = Math.min(...sizesList.map((s) => Number(s.price) || 999999));
    const effectiveBasePrice =
      !isNaN(minSizePrice) && minSizePrice < 999999
        ? minSizePrice
        : Number(formData.price) || 0;

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        urduName: formData.urduName.trim() || null,
        slug: formData.slug.trim(),
        categoryId: formData.categoryId,
        categoryLabel: formData.categoryLabel,
        price: effectiveBasePrice,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        discountPercentage:
          formData.originalPrice && Number(formData.originalPrice) > effectiveBasePrice
            ? Math.round(
                ((Number(formData.originalPrice) - effectiveBasePrice) /
                  Number(formData.originalPrice)) *
                  100
              )
            : null,
        badge: formData.badge.trim() || null,
        mizaj: formData.mizaj.trim() || null,
        shortDescription: formData.shortDescription.trim(),
        traditionalPurpose: formData.traditionalPurpose.trim(),
        fullDescription: formData.fullDescription.trim(),
        howToUse: formData.howToUse.trim(),
        dosage: formData.dosage.trim(),
        hakimAdvice: formData.hakimAdvice.trim(),
        image: formData.image,
        featured: formData.featured,
        benefits: benefitsList,
        ingredients: ingredientsList,
        sizes: sizesList.map((s) => ({
          ...(s.id && { id: s.id }),
          name: s.name,
          weight: s.weight,
          price: Number(s.price),
          costPrice: s.costPrice ? Number(s.costPrice) : null,
          originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
          unitId: s.unitId || null,
          quantityValue: s.quantityValue ? Number(s.quantityValue) : null,
          initialStock: s.initialStock ? Number(s.initialStock) : 20,
          lowStockThreshold: s.lowStockThreshold ? Number(s.lowStockThreshold) : 5,
          sku: s.sku || undefined,
        })),
      };

      const url = isEditing
        ? `/api/products/${initialProduct.id}`
        : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-8 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in">
        {/* Header with Wizard Step Indicator */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#22623a]">
                  {isEditing ? "Edit Product & Stock Variants" : "4-Step Product & Stock Wizard"}
                </h2>
                <p className="text-[11px] text-[#6a6660]">
                  Step-by-step layman setup with 1-click Unani formulation templates and live stock sync.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Step Progress Pills */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { num: 1, title: "1. Formulation", icon: BookOpen },
              { num: 2, title: "2. Info & Image", icon: Layers },
              { num: 3, title: "3. Stock & Cost", icon: Scale },
              { num: 4, title: "4. Card Preview", icon: Eye },
            ].map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep || validateStep(currentStep)) {
                      setCurrentStep(step.num as any);
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-[#22623a] text-white border-[#22623a] shadow-xs"
                      : isDone
                      ? "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]"
                      : "bg-white text-[#6a6660] border-[#e6dfd5] hover:bg-[#faf8f5]"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Formulation & 1-Click Unani Presets */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Category Selector */}
              <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e6dfd5] space-y-3">
                <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-2">
                  <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-[#c59b27]" />
                    <span>Select Product Category</span>
                  </h3>
                  <span className="text-[11px] text-[#6a6660]">Essential for storefront navigation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {DEFAULT_CATEGORIES.map((cat) => {
                    const isSelected = formData.categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: cat.id,
                            categoryLabel: cat.name,
                          }));
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#22623a] text-white border-[#22623a] shadow-xs"
                            : "bg-white text-[#1a1816] border-[#e6dfd5] hover:border-[#c59b27]"
                        }`}
                      >
                        <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-[#22623a]"}`}>
                          {cat.name}
                        </span>
                        <span
                          dir="rtl"
                          className={`text-[11px] font-serif pt-1 ${
                            isSelected ? "text-[#e6dfd5]" : "text-[#6a6660]"
                          }`}
                        >
                          {cat.urdu}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1-Click Unani Formulation Presets */}
              <div className="bg-white p-5 rounded-xl border border-[#c59b27]/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#f4eee5] pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c59b27]" />
                    <h3 className="font-bold text-[#22623a] text-sm">
                      1-Click Layman Unani Formulation Templates
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b27] bg-[#faf8f5] px-2 py-0.5 rounded border border-[#e6dfd5]">
                    Auto-Fill Properties
                  </span>
                </div>
                <p className="text-[11px] text-[#6a6660]">
                  Clicking any preset below will automatically pre-populate the Mizaj, Dosage, Hakim Advice, Botanicals, Health Benefits, and Suggested Packaging Sizes.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {UNANI_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyUnaniPreset(preset)}
                      className="p-3 bg-[#faf8f5] hover:bg-[#e8f5e9] border border-[#e6dfd5] hover:border-[#2e7d32] rounded-xl text-left transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div>
                        <span className="font-bold text-[#22623a] text-xs group-hover:text-[#2e7d32] block">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-[#6a6660] line-clamp-1 block">
                          {preset.traditionalPurpose}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#c59b27] group-hover:underline flex items-center gap-1">
                        <span>Apply Template</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Info, Image & Urdu Translation */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Image Showcase & Upload */}
              <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e6dfd5] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                    <ImageIcon className="w-4 h-4 text-[#c59b27]" />
                    <span>Product Image Showcase</span>
                  </h3>
                  <div className="flex gap-1 bg-white p-0.5 rounded-md border border-[#e6dfd5]">
                    <button
                      type="button"
                      onClick={() => setImageTab("upload")}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        imageTab === "upload"
                          ? "bg-[#22623a] text-white font-semibold"
                          : "text-[#6a6660] hover:text-[#22623a]"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab("url")}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        imageTab === "url"
                          ? "bg-[#22623a] text-white font-semibold"
                          : "text-[#6a6660] hover:text-[#22623a]"
                      }`}
                    >
                      Image URL / Preset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-[#e6dfd5] aspect-square relative overflow-hidden">
                    {formData.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={formData.image}
                          alt="Product preview"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-[#6a6660] space-y-1">
                        <UploadCloud className="w-8 h-8 mx-auto text-[#c59b27] opacity-60" />
                        <p className="text-[11px]">No image selected</p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    {imageTab === "upload" ? (
                      <div className="bg-white p-4 rounded-xl border border-dashed border-[#c59b27] text-center space-y-2">
                        <UploadDropzone
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              setFormData((prev) => ({ ...prev, image: res[0].url }));
                              setUploadSuccess(true);
                              setTimeout(() => setUploadSuccess(false), 3000);
                            }
                          }}
                          onUploadError={(err: Error) => {
                            setError(`Upload error: ${err.message}`);
                          }}
                          appearance={{
                            button: "bg-[#22623a] hover:bg-[#1b502e] text-xs font-semibold py-2 px-4 rounded-md",
                            container: "border-none p-2",
                            label: "text-xs font-medium text-[#22623a]",
                            allowedContent: "text-[10px] text-[#6a6660]",
                          }}
                        />
                        {uploadSuccess && (
                          <p className="text-[#2d7648] font-semibold flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Image uploaded successfully!
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 bg-white p-4 rounded-xl border border-[#e6dfd5]">
                        <label className="text-xs font-semibold text-[#1a1816] block">
                          Image Path or URL:
                        </label>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                          placeholder="/images/1-scaled.png or https://..."
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] text-[#6a6660]">Sample presets:</span>
                          {[
                            "/images/1-scaled.png",
                            "/images/3-scaled.png",
                            "/images/Gemini_Generated_Image_353xgp353xgp353x-1.png",
                            "/images/01aa3b4e-d943-4b9a-8c64-1fa2355d0f70-1769544818.png",
                            "/images/72dc0d5f-2347-42f4-aef4-5052295325f4-1769544982.png",
                          ].map((sample) => (
                            <button
                              key={sample}
                              type="button"
                              onClick={() => setFormData({ ...formData, image: sample })}
                              className="text-[10px] px-2 py-0.5 bg-[#faf8f5] hover:bg-[#e6dfd5] rounded text-[#22623a] border border-[#e6dfd5]"
                            >
                              {sample.split("/").pop()?.slice(0, 15)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* General Info Grid */}
              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] space-y-4">
                <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm border-b border-[#f4eee5] pb-2">
                  <Layers className="w-4 h-4 text-[#22623a]" />
                  <span>General Identification & Urdu Translation</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-[#1a1816]">
                      Product Name (English) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="e.g. Kashmiri Amla Murabba in Honey"
                      className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#1a1816]">
                      Product Name (Urdu / اردو نام)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.urduName}
                      onChange={(e) => setFormData({ ...formData, urduName: e.target.value })}
                      placeholder="مثلاً: کشمیری مربہ آملہ شہد والا"
                      className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-serif text-sm focus:outline-none focus:border-[#22623a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#1a1816]">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. amla-murabba-honey"
                      className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-mono text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#1a1816]">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="e.g. Best Seller, Pure Unani Formula"
                      className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#1a1816]">
                      Herbal Mizaj (Temperament)
                    </label>
                    <input
                      type="text"
                      value={formData.mizaj}
                      onChange={(e) => setFormData({ ...formData, mizaj: e.target.value })}
                      placeholder="e.g. Cooling & Refreshing, Balanced"
                      className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="font-semibold text-[#1a1816]">
                      Traditional Purpose / Indication
                    </label>
                    <input
                      type="text"
                      value={formData.traditionalPurpose}
                      onChange={(e) =>
                        setFormData({ ...formData, traditionalPurpose: e.target.value })
                      }
                      placeholder="e.g. Heart & Brain Tonic, Acidity & Digestion, Joint Vitality"
                      className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e6dfd5] space-y-3">
                <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                  <Info className="w-4 h-4 text-[#c59b27]" />
                  <span>Descriptions & Dosage Instructions</span>
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1a1816]">
                      Short Summary (Appears on Store Cards)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.shortDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, shortDescription: e.target.value })
                      }
                      placeholder="1-2 sentences highlighting key herbal benefits..."
                      className="w-full p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1a1816]">How to Use</label>
                      <input
                        type="text"
                        value={formData.howToUse}
                        onChange={(e) =>
                          setFormData({ ...formData, howToUse: e.target.value })
                        }
                        placeholder="e.g. Take with warm water"
                        className="w-full p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1a1816]">Recommended Dosage</label>
                      <input
                        type="text"
                        value={formData.dosage}
                        onChange={(e) =>
                          setFormData({ ...formData, dosage: e.target.value })
                        }
                        placeholder="e.g. 1 teaspoon twice daily"
                        className="w-full p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1a1816]">Hakim's Lifestyle Advice</label>
                      <input
                        type="text"
                        value={formData.hakimAdvice}
                        onChange={(e) =>
                          setFormData({ ...formData, hakimAdvice: e.target.value })
                        }
                        placeholder="e.g. Avoid sour foods during course"
                        className="w-full p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Packaging Sizes, Cost & Physical Stock */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-5 rounded-xl border border-[#c59b27]/40 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#f4eee5] pb-2">
                  <div>
                    <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                      <Scale className="w-4 h-4 text-[#c59b27]" />
                      <span>Packaging Sizes, Cost & Live Inventory</span>
                    </h3>
                    <p className="text-[11px] text-[#6a6660]">
                      Define physical pack sizes, manufacturing cost price (for gross profit margin), and initial stock on hand.
                    </p>
                  </div>
                </div>

                {/* Add Variant Form */}
                <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="font-semibold text-[11px] text-[#1a1816]">
                        Pack Name
                      </label>
                      <input
                        type="text"
                        value={newSizeName}
                        onChange={(e) => setNewSizeName(e.target.value)}
                        placeholder="e.g. Standard Jar / Small"
                        className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[11px] text-[#1a1816]">
                        Unit
                      </label>
                      <select
                        value={newSizeUnitId}
                        onChange={(e) => setNewSizeUnitId(e.target.value)}
                        className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.code} ({u.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[11px] text-[#1a1816]">
                        Qty Value
                      </label>
                      <input
                        type="number"
                        value={newSizeQtyVal}
                        onChange={(e) => setNewSizeQtyVal(e.target.value)}
                        placeholder="500"
                        className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[11px] text-[#1a1816]">
                        Cost (PKR)
                      </label>
                      <input
                        type="number"
                        value={newSizeCostPrice}
                        onChange={(e) => setNewSizeCostPrice(e.target.value)}
                        placeholder="600"
                        className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] text-[#c59b27] font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[11px] text-[#1a1816]">
                        Retail (PKR) *
                      </label>
                      <input
                        type="number"
                        value={newSizePrice}
                        onChange={(e) => setNewSizePrice(e.target.value)}
                        placeholder="1200"
                        className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold text-[#2d7648]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[11px] text-[#1a1816]">
                        Initial Stock
                      </label>
                      <input
                        type="number"
                        value={newSizeInitialStock}
                        onChange={(e) => setNewSizeInitialStock(e.target.value)}
                        placeholder="25"
                        className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#6a6660]">
                      Pack Label Preview: <strong className="text-[#22623a]">{newSizeWeight}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={addSize}
                      className="py-1.5 px-4 bg-[#22623a] hover:bg-[#1b502e] text-white rounded-lg font-semibold flex items-center gap-1 text-xs shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Pack Variant</span>
                    </button>
                  </div>
                </div>

                {/* Sizes List Table */}
                <div className="border border-[#e6dfd5] rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#faf8f5] border-b border-[#e6dfd5] text-[#6a6660] font-semibold">
                        <th className="p-2.5">Variant Name</th>
                        <th className="p-2.5">Weight / Unit</th>
                        <th className="p-2.5">Cost Price</th>
                        <th className="p-2.5">Selling Price</th>
                        <th className="p-2.5">Est. Margin</th>
                        <th className="p-2.5">Stock On Hand</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4eee5]">
                      {sizesList.map((s, i) => {
                        const cost = Number(s.costPrice) || (Number(s.price) * 0.55);
                        const price = Number(s.price) || 0;
                        const marginPercent = price > 0 ? (((price - cost) / price) * 100).toFixed(0) : "0";

                        return (
                          <tr key={i} className="hover:bg-[#faf8f5]/60 transition-colors">
                            <td className="p-2.5 font-bold text-[#22623a]">{s.name}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded bg-[#f4eee5] text-[#22623a] font-mono text-[11px]">
                                {s.weight}
                              </span>
                            </td>
                            <td className="p-2.5 text-[#6a6660]">
                              ₨ {cost.toLocaleString()}
                            </td>
                            <td className="p-2.5 font-bold text-[#2d7648]">
                              ₨ {price.toLocaleString()}
                            </td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                                {marginPercent}% margin
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] font-semibold">
                                {s.initialStock || 0} units
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => removeSize(i)}
                                className="text-[#6a6660] hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Remove size"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#c59b27] rounded"
                    />
                    <span className="font-semibold text-[#22623a]">
                      Feature this product on the Homepage Showcase
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Benefits, Botanicals & Live Storefront Card Preview */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              {/* Health Benefits & Ingredients Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Health Benefits */}
                <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5] space-y-3">
                  <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-[#c59b27]" />
                    <span>Health Benefits List</span>
                  </h3>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBenefitInput}
                      onChange={(e) => setNewBenefitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addBenefit(newBenefitInput);
                        }
                      }}
                      placeholder="Type a benefit & press Enter"
                      className="flex-1 p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                    />
                    <button
                      type="button"
                      onClick={() => addBenefit(newBenefitInput)}
                      className="px-3 py-2 bg-[#22623a] text-white rounded-lg font-semibold shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {PRESET_BENEFITS.slice(0, 3).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => addBenefit(p)}
                        className="text-[10px] px-2 py-0.5 bg-white border border-[#e6dfd5] rounded-full text-[#22623a] hover:bg-[#22623a] hover:text-white transition-colors"
                      >
                        + {p.slice(0, 22)}...
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {benefitsList.map((b, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 bg-white rounded-lg border border-[#e6dfd5]"
                      >
                        <span className="text-[#22623a] leading-tight">{b}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(i)}
                          className="text-[#6a6660] hover:text-red-600 p-0.5 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5] space-y-3">
                  <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                    <Leaf className="w-4 h-4 text-[#2d7648]" />
                    <span>Botanicals & Ingredients</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newIngredientName}
                      onChange={(e) => setNewIngredientName(e.target.value)}
                      placeholder="Botanical name (e.g. Asgand)"
                      className="p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newIngredientRole}
                        onChange={(e) => setNewIngredientRole(e.target.value)}
                        placeholder="Role / Purpose"
                        className="flex-1 p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                      />
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="px-3 py-2 bg-[#22623a] text-white rounded-lg font-semibold shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {ingredientsList.map((ing, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 bg-white rounded-lg border border-[#e6dfd5]"
                      >
                        <div>
                          <span className="font-bold text-[#22623a]">{ing.name}</span>
                          <span className="text-[#6a6660] text-[10px] block">{ing.role}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeIngredient(i)}
                          className="text-[#6a6660] hover:text-red-600 p-0.5 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Customer Storefront Preview Card */}
              <div className="bg-white p-5 rounded-xl border border-[#c59b27]/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#f4eee5] pb-2">
                  <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                    <Eye className="w-4 h-4 text-[#c59b27]" />
                    <span>Live Customer-Facing Storefront Preview</span>
                  </h3>
                  <span className="text-[11px] text-[#2d7648] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ready for Live Store
                  </span>
                </div>

                <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#e6dfd5] shadow-lg overflow-hidden flex flex-col">
                  {/* Card Image Banner */}
                  <div className="relative aspect-4/3 bg-[#faf8f5] overflow-hidden flex items-center justify-center p-4">
                    {formData.image ? (
                      <Image
                        src={formData.image}
                        alt={formData.name || "Product"}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-[#c59b27]/40" />
                    )}
                    {formData.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#22623a] text-[#c59b27] text-[10px] font-bold rounded-md shadow-xs">
                        {formData.badge}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      In Stock
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 space-y-2.5 text-left">
                    <div className="flex items-center justify-between text-[11px] text-[#c59b27] font-semibold">
                      <span>{formData.categoryLabel}</span>
                      {formData.mizaj && <span className="text-[#6a6660] italic">{formData.mizaj}</span>}
                    </div>

                    <div>
                      <h4 className="font-serif text-base font-bold text-[#22623a]">
                        {formData.name || "Product Title"}
                      </h4>
                      {formData.urduName && (
                        <p dir="rtl" className="font-serif text-xs text-[#6a6660]">
                          {formData.urduName}
                        </p>
                      )}
                    </div>

                    <p className="text-[11px] text-[#59534b] line-clamp-2">
                      {formData.shortDescription || "Natural pure Unani formulation prepared with herbal remedies."}
                    </p>

                    {/* Sizes Selection Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sizesList.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#faf8f5] border border-[#e6dfd5] rounded-md text-[11px] font-semibold text-[#22623a]"
                        >
                          {s.weight} — ₨ {Number(s.price).toLocaleString()}
                        </span>
                      ))}
                    </div>

                    {/* Price and Cart Simulation */}
                    <div className="pt-2 border-t border-[#f4eee5] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#6a6660] block">Starting from</span>
                        <span className="text-base font-bold text-[#22623a]">
                          ₨ {Number(sizesList[0]?.price || formData.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="px-4 py-2 bg-[#22623a] text-white rounded-xl text-xs font-semibold shadow-xs">
                        Add to Cart
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#e6dfd5]">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#59534b] font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#6a6660] hover:text-[#1a1816] font-semibold rounded-lg"
              >
                Cancel
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-5 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isEditing ? "Update Product" : "Publish & Sync Stock"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
