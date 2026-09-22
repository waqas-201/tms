"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  UploadCloud,
  ImageIcon,
  Plus,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Package,
  Layers,
  Star,
  Tag,
  FolderTree,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Leaf,
  Droplets,
  Heart,
  Zap,
  Eye,
  SlidersHorizontal,
  FileText,
  DollarSign,
  ShieldCheck,
  Power,
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import { PRESET_UNANI_CATEGORIES } from "@/app/components/admin/CategoriesTab";

export const DEFAULT_CATEGORIES = [
  { id: "murabbajaat", name: "Herbal Preserves (Murabba)", urdu: "مربہ جات", icon: Leaf },
  { id: "arqiyat", name: "Pure Herbal Distillates (Arq)", urdu: "عرقیات", icon: Droplets },
  { id: "oils-marham", name: "Pain Relief Oils & Balms", urdu: "روغنیات و مرہم", icon: Heart },
  { id: "herbs-seeds", name: "Whole Herbs & Seeds", urdu: "جڑی بوٹیاں و تخم", icon: Leaf },
  { id: "teas-vitality", name: "Wellness Teas & Energy Mixes", urdu: "قہوہ جات و معجون", icon: Zap },
  { id: "hair-skin", name: "Hair & Skin Care", urdu: "حسن و صحت بال و جلد", icon: Star },
];

const PRESET_BADGES = [
  "Best Seller",
  "100% Pure & Organic",
  "Apothecary Choice",
  "Traditional Formula",
  "Hot Deal",
  "Special Blend",
];

const MIZAJ_OPTIONS = [
  { value: "Mo'tadil (Balanced)", label: "Mo'tadil / معتدل (Balanced & Neutral)" },
  { value: "Haar Yabis (Hot & Dry)", label: "Haar Yabis / گرم خشک (Hot & Dry)" },
  { value: "Haar Ratab (Hot & Moist)", label: "Haar Ratab / گرم تر (Hot & Moist)" },
  { value: "Barid Yabis (Cold & Dry)", label: "Barid Yabis / سرد خشک (Cold & Dry)" },
  { value: "Barid Ratab (Cold & Wet)", label: "Barid Ratab / سرد تر (Cold & Wet)" },
];

const PRESET_UNITS_CATALOG = [
  { code: "g", name: "Gram", kind: "WEIGHT" },
  { code: "kg", name: "Kilogram", kind: "WEIGHT" },
  { code: "ml", name: "Millilitre", kind: "VOLUME" },
  { code: "l", name: "Litre", kind: "VOLUME" },
  { code: "tola", name: "Tola", kind: "TRADITIONAL" },
  { code: "masha", name: "Masha", kind: "TRADITIONAL" },
  { code: "jar", name: "Jar", kind: "PACK" },
  { code: "bottle", name: "Bottle", kind: "PACK" },
  { code: "sachet", name: "Sachet", kind: "PACK" },
  { code: "pack", name: "Pack", kind: "PACK" },
  { code: "piece", name: "Piece", kind: "PACK" },
];

interface UnitItem {
  id: string;
  code: string;
  name: string;
  kind: string;
}

interface CategoryItem {
  id: string;
  name: string;
  urduName?: string;
}

interface FormVariantItem {
  id?: string;
  name: string;
  weight: string;
  price: string;
  originalPrice?: string;
  costPrice?: string;
  unitId?: string;
  quantityValue?: string;
  initialStock?: string;
  lowStockThreshold?: string;
  sku?: string;
  isActive?: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProduct?: any | null;
}

/**
 * Intelligent Herbal Knowledge Base & Synthesizer
 * Generates authentic Unani/Tibbi descriptions, Urdu titles, mizaj, dosage & key benefits
 */
function synthesizeHerbalData(title: string, currentCategoryId: string) {
  const t = title.toLowerCase().trim();

  // 1. Amla / Emblica
  if (t.includes("amla") || t.includes("aonla") || t.includes("emblic")) {
    return {
      urduName: "خالص آملہ کا مقوی مربہ",
      categoryId: "murabbajaat",
      categoryLabel: "Herbal Preserves (Murabba)",
      mizaj: "Barid Yabis (Cold & Dry)",
      badge: "Best Seller",
      shortDescription:
        "Classical Unani cardiac and digestive tonic prepared from fresh hand-picked Amla in natural syrup.",
      fullDescription:
        "Prepared according to traditional Unani pharmacopoeia guidelines. Amla (Emblica officinalis) is revered in Eastern medicine as a supreme rejuvenator (Rasayana), exceptionally rich in natural Vitamin C, polyphenols, and essential minerals to strengthen the heart, brain, and eyesight while soothing gastric acidity.",
      benefits: [
        "Rich in Natural Vitamin C & Bioflavonoids",
        "Strengthens Heart Muscles & Relieves Palpitations",
        "Nourishes Hair Roots & Promotes Lustrous Growth",
        "Soothes Stomach Heat & Hyperacidity",
        "Enhances Eye Vision & Daily Vitality",
      ],
      howToUse:
        "Take 1-2 pieces in the morning on an empty stomach. Rinse off excess syrup with plain water if preferred.",
      dosage: "1-2 pieces (approx 25-50g) daily with water or lukewarm milk.",
      suggestedUnitCode: "g",
      suggestedQty: "500",
      suggestedPrice: "1200",
    };
  }

  // 2. Harar / Haritaki
  if (t.includes("harar") || t.includes("harad") || t.includes("haritaki")) {
    return {
      urduName: "مربہ ہرڑ اکسیر ہاضم",
      categoryId: "murabbajaat",
      categoryLabel: "Herbal Preserves (Murabba)",
      mizaj: "Haar Yabis (Hot & Dry)",
      badge: "Traditional Formula",
      shortDescription:
        "Renowned 'King of Herbs' preserve formulated to restore sluggish digestion, relieve constipation, and clarify intellect.",
      fullDescription:
        "Harar Murabba is formulated using premium yellow Chebulic Myrobalans. Celebrated in Tibb-e-Unani for its gentle laxative and detoxifying properties, it clears stubborn intestinal stagnation, strengthens the stomach lining, and sharpens memory.",
      benefits: [
        "Gently Relieves Chronic Constipation & Bloating",
        "Improves Gastric Digestion & Nutrient Absorption",
        "Clears Brain Fog & Strengthens Memory Faculties",
        "Eliminates Metabolic Waste & Intestinal Toxins",
        "Protects Stomach Against Gas & Acidity",
      ],
      howToUse:
        "Chew 1 piece thoroughly at bedtime followed by a glass of lukewarm water or milk.",
      dosage: "1 piece (approx 20-30g) daily before sleep.",
      suggestedUnitCode: "g",
      suggestedQty: "500",
      suggestedPrice: "1150",
    };
  }

  // 3. Apple / Saib Murabba
  if (t.includes("saib") || t.includes("apple") || t.includes("seb")) {
    return {
      urduName: "سیب کا مقوی دل مربہ",
      categoryId: "murabbajaat",
      categoryLabel: "Herbal Preserves (Murabba)",
      mizaj: "Mo'tadil (Balanced)",
      badge: "100% Pure & Organic",
      shortDescription:
        "Delicious restorative preserve made with fresh mountain apples to uplift mood, calm anxiety, and energize the heart.",
      fullDescription:
        "Saib Murabba (Apple Preserve) is a classical exhilarant (Mufarreh) that invigorates vital organs. It replenishes vital hemoglobin, alleviates mental tension, regulates heartbeat, and imparts natural radiance to the complexion.",
      benefits: [
        "Premier Cardiac Tonic for Weakness & Palpitations",
        "Elevates Mood & Calms Mental Stress/Anxiety",
        "Enriches Hemoglobin & Blood Formation",
        "Provides Instant Natural Energy & Vitality",
        "Safe & Nourishing for All Ages",
      ],
      howToUse:
        "Eat 1 slice early morning before breakfast, ideally wrapped in edible silver leaf (Warq-e-Nuqra).",
      dosage: "1-2 slices (approx 40g) every morning.",
      suggestedUnitCode: "g",
      suggestedQty: "500",
      suggestedPrice: "1350",
    };
  }

  // 4. Kasni (Chicory) Distillate
  if (t.includes("kasni") || t.includes("chicory")) {
    return {
      urduName: "عرق کاسنی مصفی جگر",
      categoryId: "arqiyat",
      categoryLabel: "Pure Herbal Distillates (Arq)",
      mizaj: "Barid Ratab (Cold & Wet)",
      badge: "Best Seller",
      shortDescription:
        "Wood-fired steam distillate of Cichorium intybus for liver detoxification, reducing body heat, and kidney health.",
      fullDescription:
        "Arq Kasni is steam-distilled from freshly harvested wild chicory herbs and roots. Revered across centuries of Unani therapeutics as the ultimate hepatoprotective tonic, it neutralizes excess hepatic bile, cools internal burning, and stimulates natural renal filtration.",
      benefits: [
        "Deeply Purifies the Liver & Stimulates Bile Flow",
        "Extinguishes Internal Body Heat & Bilious Jaundice",
        "Relieves Burning Sensation in Urination & Palms",
        "Reduces Liver & Abdominal Inflammation",
        "Supports Healthy Skin Clarity & Complexion",
      ],
      howToUse:
        "Mix half a cup with equal parts water or Arq Mako, and consume 30 minutes before meals.",
      dosage: "60ml (half cup) twice daily in morning and evening.",
      suggestedUnitCode: "ml",
      suggestedQty: "800",
      suggestedPrice: "450",
    };
  }

  // 5. Mako Distillate
  if (t.includes("mako") || t.includes("solanum")) {
    return {
      urduName: "عرق مکو دافع ورم",
      categoryId: "arqiyat",
      categoryLabel: "Pure Herbal Distillates (Arq)",
      mizaj: "Barid Yabis (Cold & Dry)",
      badge: "Traditional Formula",
      shortDescription:
        "Pure botanical distillate formulated to soothe visceral swelling, stomach inflammation, and visceral heat.",
      fullDescription:
        "Arq Mako is prepared through fractional copper condensation of fresh black nightshade herbs. Its natural anti-inflammatory bio-alkaloids specifically resolve swelling in the liver, spleen, and intestinal tract.",
      benefits: [
        "Resolves Internal Visceral Inflammation & Swelling",
        "Soothes Gastritis & Stomach Lining Irritation",
        "Complements Arq Kasni for Complete Hepatic Relief",
        "Assists in Regulating Normal Liver Enzymes",
        "100% Steam Distilled with No Added Preservatives",
      ],
      howToUse:
        "Take half a cup before meals, often paired with Arq Kasni or plain water.",
      dosage: "60ml (half cup) 2 times daily.",
      suggestedUnitCode: "ml",
      suggestedQty: "800",
      suggestedPrice: "450",
    };
  }

  // 6. Arq Gulab / Rose Water
  if (t.includes("gulab") || t.includes("rose")) {
    return {
      urduName: "خالص عرق گلاب سہ آتشہ",
      categoryId: "arqiyat",
      categoryLabel: "Pure Herbal Distillates (Arq)",
      mizaj: "Mo'tadil (Balanced)",
      badge: "100% Pure & Organic",
      shortDescription:
        "Triple-distilled pure organic Damask rose essence for ocular comfort, facial glow, and cardiac soothing.",
      fullDescription:
        "Crafted from fresh Rosa damascena petals using traditional copper pot alembics. Provides instant cooling relief when used for tired eyes, tightens facial pores as a botanical toner, and calms palpitations when consumed with sharbat.",
      benefits: [
        "Refreshes & Soothes Tired, Irritated Eyes",
        "Natural Skin Toner & Pore Tightener",
        "Calms Palpitations & Cardiac Heat",
        "100% Food-Grade and Free from Alcohol/Fragrances",
        "Imparts Radiant Natural Complexion Glow",
      ],
      howToUse:
        "Drink 2 tablespoons with cold water, spray directly over face, or apply drops to eyes.",
      dosage: "20-30ml orally or as needed topically.",
      suggestedUnitCode: "ml",
      suggestedQty: "500",
      suggestedPrice: "380",
    };
  }

  // 7. Kalonji / Black Seed Oil or Seed
  if (t.includes("kalonji") || t.includes("black seed") || t.includes("nigella")) {
    return {
      urduName: "روغن کلونجی خالص کولڈ پریسڈ",
      categoryId: t.includes("oil") || t.includes("roghan") ? "oils-marham" : "herbs-seeds",
      categoryLabel:
        t.includes("oil") || t.includes("roghan")
          ? "Pain Relief Oils & Balms"
          : "Whole Herbs & Seeds",
      mizaj: "Haar Yabis (Hot & Dry)",
      badge: "Best Seller",
      shortDescription:
        "Premium virgin cold-pressed Black Seed (Nigella sativa) oil rich in natural Thymoquinone for total immune & joint support.",
      fullDescription:
        "Cold-pressed from select non-GMO Ethiopian and indigenous Kalonji seeds at strictly controlled low temperatures to preserve volatile aromatic compounds. Delivers potent antioxidant, anti-inflammatory, and immune-modulating properties.",
      benefits: [
        "Rich in Active Thymoquinone (TQ) for Immune Defense",
        "Relieves Chronic Joint Stiffness & Muscular Aches",
        "Strengthens Hair Follicles & Prevents Hair Fall",
        "Supports Clear Respiratory Passages & Easy Breathing",
        "Promotes Healthy Blood Sugar & Lipid Balance",
      ],
      howToUse:
        "Take half teaspoon orally with warm milk/honey, or massage directly onto aching joints and scalp.",
      dosage: "2.5ml to 5ml (half to one teaspoon) once daily.",
      suggestedUnitCode: "ml",
      suggestedQty: "120",
      suggestedPrice: "950",
    };
  }

  // 8. Badam / Almond Oil
  if (t.includes("badam") || t.includes("almond")) {
    return {
      urduName: "روغن بادام شیریں خالص",
      categoryId: "oils-marham",
      categoryLabel: "Pain Relief Oils & Balms",
      mizaj: "Haar Ratab (Hot & Moist)",
      badge: "100% Pure & Organic",
      shortDescription:
        "100% pure cold-pressed Sweet Almond oil rich in Vitamin E for brain vitality, smooth digestion, and lustrous skin.",
      fullDescription:
        "Cold-pressed from premium sweet Gurbandi and Californian almonds. Contains abundant Vitamin E, natural squalene, and unsaturated fatty acids to nourish nerve cells, relieve constipation, and provide radiant skin hydration.",
      benefits: [
        "Nourishes Brain Cells & Enhances Intellectual Focus",
        "Gentle, Natural Lubrication for Smooth Bowels",
        "Deeply Hydrates Dry Skin & Reduces Under-Eye Circles",
        "Conditions Dry, Damaged Hair with Glossy Shine",
        "Safe for Infant Massage & Delicate Skin",
      ],
      howToUse:
        "Add 1 teaspoon to a glass of warm milk at night, or massage a few drops onto face and temples.",
      dosage: "5ml (1 teaspoon) daily.",
      suggestedUnitCode: "ml",
      suggestedQty: "100",
      suggestedPrice: "1400",
    };
  }

  // 9. Shilajit / Salajeet
  if (t.includes("shilajit") || t.includes("salajeet") || t.includes("mumijo")) {
    return {
      urduName: "خالص ہمالیائی سلاجیت سنیاسی",
      categoryId: "teas-vitality",
      categoryLabel: "Wellness Teas & Energy Mixes",
      mizaj: "Haar Yabis (Hot & Dry)",
      badge: "Apothecary Choice",
      shortDescription:
        "Purified high-altitude Himalayan mineral pitch containing 84+ trace minerals and 70%+ Fulvic Acid for supreme vigor.",
      fullDescription:
        "Traditional water-purified Shilajit sourced directly from high-altitude Himalayan rock fissures. Contains rich fulvic and humic acids to drive cellular ATP energy production, combat chronic fatigue, and strengthen bones, ligaments, and stamina.",
      benefits: [
        "Packed with 84+ Ionic Minerals & 70%+ Fulvic Acid",
        "Dramatically Boosts Physical Stamina & Daily Energy",
        "Accelerates Muscle Recovery & Strengthens Joints",
        "Enhances Vital Vigor & Cellular Oxygenation",
        "Traditionally Purified & 100% Chemical-Free",
      ],
      howToUse:
        "Dissolve a pea-sized portion (300-500mg) in a glass of warm milk, green tea, or warm water once daily in the morning.",
      dosage: "Pea-sized portion (300-500mg) once daily.",
      suggestedUnitCode: "g",
      suggestedQty: "30",
      suggestedPrice: "2400",
    };
  }

  // 10. Ispaghol / Psyllium Husk
  if (t.includes("ispaghol") || t.includes("psyllium") || t.includes("husk")) {
    return {
      urduName: "خالص اسپغول مسلم و بھوسی",
      categoryId: "herbs-seeds",
      categoryLabel: "Whole Herbs & Seeds",
      mizaj: "Barid Ratab (Cold & Wet)",
      badge: "Best Seller",
      shortDescription:
        "Triple-cleaned, 100% natural pure white Psyllium husk for smooth digestive transit, cholesterol control, and cooling.",
      fullDescription:
        "High-purity soluble dietary fiber harvested from Plantago ovata. Swells gently in the intestinal tract to create comfortable bulk, gently eliminating waste while absorbing excess dietary lipids and cooling stomach heat.",
      benefits: [
        "100% Natural Soluble Fiber for Regular Bowels",
        "Provides Gentle Relief from Acidity & Constipation",
        "Aids in Lowering Excess Cholesterol Levels",
        "Supports Healthy Weight Management & Satiety",
        "Triple-Cleaned & Free from Dust or Residue",
      ],
      howToUse:
        "Stir 1-2 tablespoons into water, warm milk, or yogurt. Drink immediately followed by an extra glass of water.",
      dosage: "1-2 tablespoons (approx 7-14g) 1-2 times daily.",
      suggestedUnitCode: "g",
      suggestedQty: "100",
      suggestedPrice: "650",
    };
  }

  // 11. Ashwagandha / Asgandh
  if (t.includes("asgandh") || t.includes("ashwagandha") || t.includes("withania")) {
    return {
      urduName: "اسگندھ ناگوری خالص اکسیر",
      categoryId: "herbs-seeds",
      categoryLabel: "Whole Herbs & Seeds",
      mizaj: "Haar Yabis (Hot & Dry)",
      badge: "Apothecary Choice",
      shortDescription:
        "Premium Nagori Ashwagandha root powder to soothe stress, reduce cortisol, and build deep physical stamina.",
      fullDescription:
        "Pure unadulterated roots of Withania somnifera processed into micro-fine botanical powder. Renowned as the premier adaptogen in Eastern medicine to combat adrenal burnout, promote restorative sleep, and enhance muscular vitality.",
      benefits: [
        "Calms Mental Stress & Regulates Cortisol Levels",
        "Builds Musculoskeletal Strength & Stamina",
        "Promotes Deep, Restorative Nighttime Sleep",
        "Supports Hormonal Balance & Endurance",
        "100% Pure Nagori Root with No Additives",
      ],
      howToUse:
        "Mix half a teaspoon (3g) with a glass of warm milk and honey before bedtime.",
      dosage: "3g to 5g daily with warm milk.",
      suggestedUnitCode: "g",
      suggestedQty: "100",
      suggestedPrice: "750",
    };
  }

  // 12. Pain Relief / Dard Oil / Marham
  if (
    t.includes("dard") ||
    t.includes("pain") ||
    t.includes("marham") ||
    t.includes("balm") ||
    t.includes("joint")
  ) {
    return {
      urduName: "مفید درد ورم کش جڑی بوٹی تیل",
      categoryId: "oils-marham",
      categoryLabel: "Pain Relief Oils & Balms",
      mizaj: "Haar Yabis (Hot & Dry)",
      badge: "Best Seller",
      shortDescription:
        "Fast-acting herbal transdermal oil infused with classical Unani warming herbs for knee, joint, and back relief.",
      fullDescription:
        "A synergistic blend of wintergreen, eucalyptus, camphor, and warming herbal extracts formulated to penetrate deep into joints, tendons, and muscles. Restores flexibility, improves micro-circulation, and relieves chronic stiffness.",
      benefits: [
        "Rapid Relief from Knee, Back & Shoulder Discomfort",
        "Soothes Stiff Joints & Restores Easy Mobility",
        "Deep Transdermal Herbal Penetration",
        "Reduces Muscular Swelling After Strain",
        "Non-Sticky Formulation with Pleasing Aroma",
      ],
      howToUse:
        "Apply 5-10 drops directly onto affected area and gently massage in circular motions for 3-5 minutes.",
      dosage: "Use 2-3 times daily or as needed.",
      suggestedUnitCode: "ml",
      suggestedQty: "60",
      suggestedPrice: "850",
    };
  }

  // 13. Ubtan / Skin Care / Hair
  if (
    t.includes("ubtan") ||
    t.includes("skin") ||
    t.includes("hair") ||
    t.includes("face") ||
    t.includes("husn")
  ) {
    return {
      urduName: "خاص ہربل حسن ابٹن و فیس پیک",
      categoryId: "hair-skin",
      categoryLabel: "Hair & Skin Care",
      mizaj: "Mo'tadil (Balanced)",
      badge: "100% Pure & Organic",
      shortDescription:
        "Artisanal herbal formula with wild turmeric, sandalwood, and rose for spotless glowing skin.",
      fullDescription:
        "Hand-blended according to ancestral beauty formulations using Kasturi turmeric, red sandalwood, rose petals, and chickpea flour. Gently removes dead epidermal cells, fades sun tans, clears blemishes, and imparts natural luminosity.",
      benefits: [
        "Imparts Instant Golden Glow & Even Skin Tone",
        "Fades Sun Tan, Blemishes & Dark Spots",
        "Tightens Enlarged Pores & Smooths Texture",
        "100% Chemical-Free, Sulfate-Free & Paraben-Free",
        "Suitable for All Skin Types",
      ],
      howToUse:
        "Mix 1-2 spoons with pure Rose Water (or milk for dry skin) to make a smooth paste. Apply for 15 minutes and rinse gently.",
      dosage: "Use 2-3 times a week.",
      suggestedUnitCode: "g",
      suggestedQty: "150",
      suggestedPrice: "900",
    };
  }

  // 14. Fallback / Generic
  const cat =
    DEFAULT_CATEGORIES.find((c) => c.id === currentCategoryId) || DEFAULT_CATEGORIES[0];
  const capitalizedTitle = title
    ? title.charAt(0).toUpperCase() + title.slice(1)
    : "Pure Herbal Formula";

  return {
    urduName: `خالص ${title || "ہربل دوا"}`,
    categoryId: cat.id,
    categoryLabel: cat.name,
    mizaj: "Mo'tadil (Balanced)",
    badge: "100% Pure & Organic",
    shortDescription: `Authentic Unani formulation of ${capitalizedTitle} prepared with natural herbs for vitality and wellbeing.`,
    fullDescription: `${capitalizedTitle} is prepared according to traditional Eastern apothecary standards. Carefully processed using authentic botanical ingredients to support your natural vitality, balance, and general wellness without synthetic chemicals or artificial additives.`,
    benefits: [
      "100% Pure & Unadulterated Botanical Formula",
      "Free from Artificial Chemicals & Harmful Preservatives",
      "Supports Natural Vitality, Stamina & Balance",
      "Prepared under Experienced Apothecary Supervision",
      "Packaged in Hygienic, Food-Grade Containers",
    ],
    howToUse:
      "Consume or apply as directed by your physician or as indicated on the pack label.",
    dosage:
      "Standard adult dosage: Take 1 serving once or twice daily with fresh water or milk.",
    suggestedUnitCode: "g",
    suggestedQty: "250",
    suggestedPrice: "950",
  };
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
}: ProductFormModalProps) {
  const isEditing = Boolean(initialProduct);

  // Stepper State (1: Basics, 2: Price & Stock, 3: Photos & Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sparkle feedback
  const [autoGenSparkle, setAutoGenSparkle] = useState(false);
  const [autoGenMessage, setAutoGenMessage] = useState<string | null>(null);

  // Inline Category Creator State
  const [isInlineCategoryOpen, setIsInlineCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryUrdu, setNewCategoryUrdu] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categorySuccessToast, setCategorySuccessToast] = useState<string | null>(null);

  // Inline Unit Creator State
  const [isInlineUnitOpen, setIsInlineUnitOpen] = useState(false);
  const [newUnitCode, setNewUnitCode] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitKind, setNewUnitKind] = useState("WEIGHT");
  const [addingUnit, setAddingUnit] = useState(false);
  const [unitSuccessToast, setUnitSuccessToast] = useState<string | null>(null);

  // Accordion for herbal details in Step 3
  const [isHerbalDetailsOpen, setIsHerbalDetailsOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    urduName: "",
    slug: "",
    categoryId: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    badge: "100% Pure & Organic",
    mizaj: "Mo'tadil (Balanced)",
    shortDescription: "",
    fullDescription: "",
    howToUse: "Take 1 serving daily with lukewarm water or milk.",
    dosage: "1 serving (approx 5-10g) daily",
    featured: false,
  });

  // Multi-Image Gallery State
  const [gallery, setGallery] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");

  // Key Highlights / Benefits
  const [benefitsList, setBenefitsList] = useState<string[]>([
    "100% Pure & Natural Botanical Formula",
    "Free from Artificial Chemicals & Preservatives",
    "Supports Natural Digestion & Internal Vitality",
  ]);
  const [newBenefitInput, setNewBenefitInput] = useState("");

  // Variants & Stock State
  const [variantsList, setVariantsList] = useState<FormVariantItem[]>([
    {
      name: "Standard Pack",
      weight: "500g",
      quantityValue: "500",
      price: "1200",
      originalPrice: "",
      costPrice: "600",
      initialStock: "25",
      lowStockThreshold: "5",
      isActive: true,
    },
  ]);

  // Fetch available units and categories
  const fetchMetadata = async () => {
    try {
      const [unitsRes, catsRes] = await Promise.all([
        fetch("/api/units?all=true"),
        fetch("/api/categories"),
      ]);

      if (unitsRes.ok) {
        const uData = await unitsRes.json();
        if (uData.success && Array.isArray(uData.data)) {
          setUnits(uData.data);
        }
      }

      if (catsRes.ok) {
        const cData = await catsRes.json();
        if (cData.success && Array.isArray(cData.data) && cData.data.length > 0) {
          setCategories(cData.data);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      console.error("Failed to load metadata:", err);
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen]);

  // Initialize or reset form
  useEffect(() => {
    if (initialProduct) {
      let initialGallery: string[] = [];
      if (Array.isArray(initialProduct.gallery) && initialProduct.gallery.length > 0) {
        initialGallery = initialProduct.gallery.filter(Boolean);
      } else if (initialProduct.image) {
        if (
          typeof initialProduct.image === "string" &&
          (initialProduct.image.startsWith("[") || initialProduct.image.startsWith("{"))
        ) {
          try {
            const parsed = JSON.parse(initialProduct.image);
            if (Array.isArray(parsed)) {
              initialGallery = parsed.filter(Boolean);
            }
          } catch {}
        }
        if (
          initialGallery.length === 0 &&
          typeof initialProduct.image === "string" &&
          initialProduct.image.trim()
        ) {
          initialGallery = [initialProduct.image.trim()];
        }
      }

      setFormData({
        name: initialProduct.name || "",
        urduName: initialProduct.urduName || "",
        slug: initialProduct.slug || "",
        categoryId: initialProduct.categoryId || "murabbajaat",
        categoryLabel:
          initialProduct.categoryLabel ||
          DEFAULT_CATEGORIES.find((c) => c.id === initialProduct.categoryId)?.name ||
          "Herbal Preserves (Murabba)",
        badge: initialProduct.badge || "",
        mizaj: initialProduct.mizaj || "Mo'tadil (Balanced)",
        shortDescription: initialProduct.shortDescription || "",
        fullDescription: initialProduct.fullDescription || "",
        howToUse: initialProduct.howToUse || "",
        dosage: initialProduct.dosage || "",
        featured: initialProduct.featured ?? false,
      });

      setGallery(initialGallery);

      setBenefitsList(
        Array.isArray(initialProduct.benefits) && initialProduct.benefits.length > 0
          ? initialProduct.benefits
          : [
              "100% Pure & Natural Botanical Formula",
              "Free from Artificial Chemicals & Preservatives",
              "Supports Natural Digestion & Internal Vitality",
            ]
      );

      setVariantsList(
        Array.isArray(initialProduct.sizes) && initialProduct.sizes.length > 0
          ? initialProduct.sizes.map((s: any) => ({
              id: s.id,
              name: s.name || "Standard Pack",
              weight: s.weight || "",
              price: s.price ? String(s.price) : "",
              originalPrice: s.originalPrice ? String(s.originalPrice) : "",
              costPrice: s.costPrice ? String(s.costPrice) : "",
              unitId: s.unitId || undefined,
              quantityValue:
                s.quantityValue !== undefined && s.quantityValue !== null
                  ? String(s.quantityValue)
                  : undefined,
              initialStock:
                s.stockOnHand !== undefined ? String(s.stockOnHand) : "25",
              lowStockThreshold:
                s.lowStockThreshold ? String(s.lowStockThreshold) : "5",
              sku: s.sku || undefined,
              isActive: s.isActive ?? true,
            }))
          : [
              {
                name: "Standard Pack",
                weight: "500g",
                quantityValue: "500",
                price: initialProduct.price ? String(initialProduct.price) : "1200",
                originalPrice: initialProduct.originalPrice
                  ? String(initialProduct.originalPrice)
                  : "",
                costPrice: "600",
                initialStock: "25",
                lowStockThreshold: "5",
                isActive: true,
              },
            ]
      );
      setIsHerbalDetailsOpen(true);
    } else {
      // New product defaults
      setFormData({
        name: "",
        urduName: "",
        slug: "",
        categoryId: "murabbajaat",
        categoryLabel: "Herbal Preserves (Murabba)",
        badge: "100% Pure & Organic",
        mizaj: "Mo'tadil (Balanced)",
        shortDescription: "",
        fullDescription: "",
        howToUse: "Take 1 serving daily with lukewarm water or milk.",
        dosage: "1 serving (approx 5-10g) daily",
        featured: false,
      });
      setGallery([]);
      setBenefitsList([
        "100% Pure & Natural Botanical Formula",
        "Free from Artificial Chemicals & Preservatives",
        "Supports Natural Digestion & Internal Vitality",
      ]);
      setVariantsList([
        {
          name: "Standard Pack",
          weight: "500g",
          quantityValue: "500",
          price: "1200",
          originalPrice: "",
          costPrice: "600",
          initialStock: "25",
          lowStockThreshold: "5",
          isActive: true,
        },
      ]);
      setIsHerbalDetailsOpen(false);
    }
    setCurrentStep(1);
    setError(null);
    setAutoGenMessage(null);
  }, [initialProduct, isOpen]);

  // Scroll to top of modal content whenever step changes
  const goToStep = (step: 1 | 2 | 3) => {
    // Soft validation when advancing
    if (step > currentStep) {
      if (currentStep === 1 && !formData.name.trim()) {
        setError("Please enter a Product Title before continuing.");
        return;
      }
      if (currentStep === 2) {
        const primary = variantsList[0];
        if (!primary?.price || isNaN(Number(primary.price)) || Number(primary.price) <= 0) {
          setError("Please enter a valid Selling Price in PKR for the pack.");
          return;
        }
      }
    }
    setError(null);
    setCurrentStep(step);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Name Input -> Auto-Generate URL Slug
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

  // Category change handler
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    const selected = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      categoryLabel: selected ? selected.name : catId,
    }));
  };

  // 1-Click Smart Herbal Synthesizer Trigger
  const handleAutoGenerateHerbal = () => {
    if (!formData.name.trim()) {
      setError("Please enter a Product Title first (e.g. 'Pure Amla Murabba' or 'Arq Kasni').");
      return;
    }

    setAutoGenSparkle(true);
    const synth = synthesizeHerbalData(formData.name, formData.categoryId);

    setFormData((prev) => ({
      ...prev,
      urduName: synth.urduName,
      categoryId: synth.categoryId,
      categoryLabel: synth.categoryLabel,
      badge: synth.badge,
      mizaj: synth.mizaj,
      shortDescription: synth.shortDescription,
      fullDescription: synth.fullDescription,
      howToUse: synth.howToUse,
      dosage: synth.dosage,
    }));

    setBenefitsList(synth.benefits);

    // If default primary variant has default price or empty, suggest unit and price
    if (variantsList.length === 1 && (!variantsList[0].price || variantsList[0].price === "1200")) {
      const matchedUnit = units.find((u) => u.code === synth.suggestedUnitCode);
      setVariantsList([
        {
          ...variantsList[0],
          name: `${synth.suggestedQty}${synth.suggestedUnitCode} Pack`,
          weight: `${synth.suggestedQty}${synth.suggestedUnitCode}`,
          quantityValue: synth.suggestedQty,
          unitId: matchedUnit?.id || variantsList[0].unitId,
          price: synth.suggestedPrice,
        },
      ]);
    }

    setAutoGenMessage("✨ Herbal details, Urdu title, benefits & dosage auto-filled!");
    setTimeout(() => setAutoGenSparkle(false), 800);
    setTimeout(() => setAutoGenMessage(null), 4000);
    setError(null);
  };

  // Inline Category Creation Handler
  const handleCreateInlineCategory = async (preset?: {
    id: string;
    name: string;
    urduName: string;
    description?: string;
  }) => {
    const name = (preset ? preset.name : newCategoryName).trim();
    const urduName = (preset ? preset.urduName : newCategoryUrdu).trim();
    const cleanSlug = (preset
      ? preset.id
      : newCategorySlug.trim() || name
    )
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const description = preset?.description || newCategoryDesc.trim();

    if (!name) {
      setError("Category name (English) is required.");
      return;
    }
    if (!urduName) {
      setError("Category name in Urdu (اردو نام) is required.");
      return;
    }

    setAddingCategory(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cleanSlug,
          slug: cleanSlug,
          name,
          urduName,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create category.");
      }

      const createdCat: CategoryItem = data.data;
      setCategories((prev) => {
        const filtered = prev.filter((c) => c.id !== createdCat.id);
        return [...filtered, createdCat];
      });

      // Automatically select this new category
      setFormData((prev) => ({
        ...prev,
        categoryId: createdCat.id,
        categoryLabel: createdCat.name,
      }));

      setCategorySuccessToast(`Category '${createdCat.name}' created & selected!`);
      setTimeout(() => setCategorySuccessToast(null), 3500);
      setNewCategoryName("");
      setNewCategoryUrdu("");
      setNewCategorySlug("");
      setNewCategoryDesc("");
      setIsInlineCategoryOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to add category.");
    } finally {
      setAddingCategory(false);
    }
  };

  // Inline Unit Creation Handler
  const handleCreateInlineUnit = async (preset?: { code: string; name: string; kind: string }) => {
    const code = preset ? preset.code : newUnitCode.trim().toLowerCase();
    const name = preset ? preset.name : newUnitName.trim();
    const kind = preset ? preset.kind : newUnitKind;

    if (!code || !name) {
      setError("Please provide both a unit code (e.g. 'tola') and display name.");
      return;
    }

    setAddingUnit(true);
    setError(null);
    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, kind }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create unit.");
      }

      const createdUnit: UnitItem = data.data;
      setUnits((prev) => {
        const filtered = prev.filter((u) => u.id !== createdUnit.id);
        return [...filtered, createdUnit];
      });

      // Automatically select this new unit for the first variant
      if (variantsList.length > 0) {
        handleVariantChange(0, "unitId", createdUnit.id);
      }

      setUnitSuccessToast(`Unit '${createdUnit.name}' (${createdUnit.code}) created & selected!`);
      setTimeout(() => setUnitSuccessToast(null), 3000);
      setNewUnitCode("");
      setNewUnitName("");
      setIsInlineUnitOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to add unit.");
    } finally {
      setAddingUnit(false);
    }
  };

  // Image Management Handlers
  const addImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    if (gallery.includes(trimmed)) {
      setError("This image URL is already in the gallery.");
      return;
    }
    setGallery((prev) => [...prev, trimmed]);
    setCustomImageUrl("");
    setError(null);
  };

  const removeImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const makeCoverImage = (index: number) => {
    if (index === 0 || index >= gallery.length) return;
    setGallery((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
  };

  // Benefits Tag Handlers
  const addBenefit = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !benefitsList.includes(trimmed)) {
      setBenefitsList((prev) => [...prev, trimmed]);
      setNewBenefitInput("");
    }
  };

  const removeBenefit = (index: number) => {
    setBenefitsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant & Stock Management Handlers
  const handleVariantChange = (index: number, field: keyof FormVariantItem, value: any) => {
    setVariantsList((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === "unitId" || field === "quantityValue") {
        const uId = field === "unitId" ? value : item.unitId;
        const qVal = field === "quantityValue" ? value : item.quantityValue;
        const selectedUnit = units.find((u) => u.id === uId);
        if (selectedUnit && qVal) {
          item.weight = `${qVal}${selectedUnit.code}`;
          if (!item.name || item.name.includes("Pack")) {
            item.name = `${qVal}${selectedUnit.code} Pack`;
          }
        } else if (qVal) {
          item.weight = `${qVal}g`;
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  const addVariant = () => {
    const defaultUnit = units.find((u) => u.code === "g") || units[0];
    setVariantsList((prev) => [
      ...prev,
      {
        name: `Pack ${prev.length + 1}`,
        weight: "250g",
        quantityValue: "250",
        unitId: defaultUnit?.id,
        price: "",
        originalPrice: "",
        costPrice: "",
        initialStock: "20",
        lowStockThreshold: "5",
        isActive: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variantsList.length <= 1) {
      setError("Product must have at least one packaging variant.");
      return;
    }
    setVariantsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler (Supports Dual "Save & Publish" vs "Save as Draft")
  const handleSubmit = async (publishLive: boolean = true) => {
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter the Product Title.");
      setCurrentStep(1);
      return;
    }

    if (gallery.length === 0) {
      setError("Please upload or add at least one product photo in Step 3.");
      setCurrentStep(3);
      return;
    }

    if (variantsList.length === 0) {
      setError("Please add at least one packaging variant in Step 2.");
      setCurrentStep(2);
      return;
    }

    for (let i = 0; i < variantsList.length; i++) {
      const v = variantsList[i];
      if (!v.price || isNaN(Number(v.price)) || Number(v.price) <= 0) {
        setError(`Pack Variant #${i + 1} (${v.name || "Unnamed"}) requires a valid selling price.`);
        setCurrentStep(2);
        return;
      }
    }

    const minVariantPrice = Math.min(...variantsList.map((v) => Number(v.price) || 999999));
    const effectiveBasePrice =
      minVariantPrice < 999999 ? minVariantPrice : Number(variantsList[0].price);

    const primaryImage = gallery[0];
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        urduName: formData.urduName.trim() || null,
        slug: formData.slug.trim(),
        categoryId: formData.categoryId,
        categoryLabel: formData.categoryLabel,
        price: effectiveBasePrice,
        badge: formData.badge.trim() || null,
        mizaj: formData.mizaj.trim() || null,
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim(),
        howToUse: formData.howToUse.trim(),
        dosage: formData.dosage.trim(),
        image: primaryImage,
        images: gallery,
        featured: formData.featured,
        inStock: publishLive,
        benefits: benefitsList,
        sizes: variantsList.map((v) => ({
          ...(v.id && { id: v.id }),
          name: v.name.trim() || "Standard Pack",
          weight: v.weight.trim() || "Standard",
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
          costPrice: v.costPrice ? Number(v.costPrice) : null,
          unitId: v.unitId || null,
          quantityValue: v.quantityValue ? Number(v.quantityValue) : null,
          initialStock: v.initialStock ? Math.max(0, Number(v.initialStock)) : 20,
          lowStockThreshold: v.lowStockThreshold ? Number(v.lowStockThreshold) : 5,
          sku: v.sku?.trim() || undefined,
          isActive: publishLive ? (v.isActive ?? true) : false,
        })),
      };

      const url = isEditing ? `/api/products/${initialProduct.id}` : "/api/products";
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

  // Compute missing preset units & categories for quick inline creation
  const existingUnitCodes = new Set(units.map((u) => u.code.toLowerCase()));
  const missingUnitPresets = PRESET_UNITS_CATALOG.filter(
    (p) => !existingUnitCodes.has(p.code.toLowerCase())
  );

  const existingCategoryIds = new Set(categories.map((c) => c.id.toLowerCase()));
  const missingCategoryPresets = PRESET_UNANI_CATEGORIES.filter(
    (p) => !existingCategoryIds.has(p.id.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Centered Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in text-[#1c1917]">
        {/* Header with Title & Step Progress */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#e6dfd5] bg-gradient-to-r from-[#faf8f5] to-white shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center shadow-xs">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#22623a]">
                  {isEditing ? "Edit Herbal Product" : "Add New Product"}
                </h2>
                <p className="text-[11px] text-[#6a6660]">
                  Step {currentStep} of 3 —{" "}
                  {currentStep === 1
                    ? "Basics & Title"
                    : currentStep === 2
                    ? "Pricing & Stock"
                    : "Photos & Review"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/60 transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Pills Navigation */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                currentStep === 1
                  ? "bg-[#22623a] text-white shadow-xs"
                  : currentStep > 1
                  ? "bg-emerald-50 text-[#22623a] border border-emerald-200"
                  : "bg-[#faf8f5] text-[#6a6660] border border-[#e6dfd5]"
              }`}
            >
              {currentStep > 1 ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">
                  1
                </span>
              )}
              <span className="truncate">Basics</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(2)}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                currentStep === 2
                  ? "bg-[#22623a] text-white shadow-xs"
                  : currentStep > 2
                  ? "bg-emerald-50 text-[#22623a] border border-emerald-200"
                  : "bg-[#faf8f5] text-[#6a6660] border border-[#e6dfd5]"
              }`}
            >
              {currentStep > 2 ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                    currentStep === 2 ? "bg-white/20" : "bg-black/10"
                  }`}
                >
                  2
                </span>
              )}
              <span className="truncate">Price & Stock</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(3)}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                currentStep === 3
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-[#faf8f5] text-[#6a6660] border border-[#e6dfd5]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                  currentStep === 3 ? "bg-white/20" : "bg-black/10"
                }`}
              >
                3
              </span>
              <span className="truncate">Photos & Review</span>
            </button>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-[#e6dfd5] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#22623a] to-[#c59b27] h-full transition-all duration-300 rounded-full"
              style={{
                width: currentStep === 1 ? "33.3%" : currentStep === 2 ? "66.6%" : "100%",
              }}
            />
          </div>
        </div>

        {/* Scrollable Wizard Body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-2.5 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Category Creation Success Toast */}
          {categorySuccessToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{categorySuccessToast}</span>
            </div>
          )}

          {/* Unit Creation Success Toast */}
          {unitSuccessToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{unitSuccessToast}</span>
            </div>
          )}

          {/* Auto-Gen Sparkle Success Notice */}
          {autoGenMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{autoGenMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: BASICS & HERBAL INTELLIGENCE ================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              {/* Herbal Intelligence Hero Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#faf8f5] to-emerald-50/50 border border-[#e6dfd5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#c59b27]" />
                    <span className="font-serif text-sm font-bold text-[#22623a]">
                      Tibbi & Unani Auto-Fill
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6a6660] max-w-sm leading-relaxed">
                    Type a title like &quot;Pure Amla Murabba&quot; or &quot;Arq Kasni&quot; and click to auto-generate Urdu names, benefits & dosage directions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoGenerateHerbal}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
                    autoGenSparkle
                      ? "bg-amber-400 text-amber-950 scale-105"
                      : "bg-[#22623a] text-white hover:bg-[#1a4d2e]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>⚡ Auto-Fill Herbal Info</span>
                </button>
              </div>

              {/* Product Title (English) */}
              <div>
                <label className="block text-xs font-bold text-[#4a4640] mb-1.5">
                  Product Title (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Pure Amla Murabba, Arq Kasni, Roghan Kalonji"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white font-medium text-[#1c1917] transition-all"
                />
              </div>

              {/* Urdu Name */}
              <div>
                <label className="block text-xs font-bold text-[#4a4640] mb-1.5 flex items-center justify-between">
                  <span>Urdu Title (اردو نام)</span>
                  <span className="text-[10px] text-[#6a6660] font-normal">
                    Displays in Pakistani script
                  </span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.urduName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, urduName: e.target.value }))}
                  placeholder="مثلاً خالص آملہ کا مقوی مربہ"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white font-serif text-[#1c1917] text-right"
                />
              </div>

              {/* Category Dropdown + Inline Creator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#4a4640]">
                    Apothecary Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsInlineCategoryOpen((prev) => !prev)}
                    className="text-xs text-[#22623a] hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    {isInlineCategoryOpen ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        + New Category
                      </>
                    )}
                  </button>
                </div>
                <select
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] appearance-none cursor-pointer text-[#1c1917] font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.urduName ? `(${c.urduName})` : ""}
                    </option>
                  ))}
                </select>

                {isInlineCategoryOpen && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-3 animate-fade-in">
                    <div className="flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-[#22623a]" />
                      <span className="text-xs font-bold text-[#22623a]">
                        Quick-create a new apothecary category
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-[#4a4640] mb-1">
                          English Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => {
                            const name = e.target.value;
                            const generatedSlug = name
                              .toLowerCase()
                              .trim()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-+|-+$/g, "");
                            setNewCategoryName(name);
                            setNewCategorySlug(generatedSlug);
                          }}
                          placeholder="e.g. Majoon & Khamira"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#4a4640] mb-1">
                          Urdu Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={newCategoryUrdu}
                          onChange={(e) => setNewCategoryUrdu(e.target.value)}
                          placeholder="معجون و خمیرہ"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg text-right font-serif"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#4a4640] mb-1">
                        URL Slug
                        {newCategorySlug && (
                          <span className="ml-1.5 font-mono text-[#6a6660] font-normal">
                            /{newCategorySlug}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={newCategorySlug}
                        onChange={(e) =>
                          setNewCategorySlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "")
                          )
                        }
                        placeholder="majoon-khamira"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#4a4640] mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                        placeholder="Traditional Unani electuaries for vitality…"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                      <button
                        type="button"
                        disabled={addingCategory}
                        onClick={() => handleCreateInlineCategory()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                      >
                        {addingCategory ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        Save & Select
                      </button>

                      {missingCategoryPresets.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-[#6a6660]">Unani presets:</span>
                          {missingCategoryPresets.slice(0, 5).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              disabled={addingCategory}
                              onClick={() => handleCreateInlineCategory(p)}
                              className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#e6dfd5] text-[#22623a] font-medium hover:border-[#22623a] disabled:opacity-50"
                              title={p.urduName}
                            >
                              +{p.name.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Highlight Badges */}
              <div>
                <label className="block text-xs font-bold text-[#4a4640] mb-2 flex items-center justify-between">
                  <span>Product Badge / Highlight Pill</span>
                  <span className="text-[10px] text-[#6a6660] font-normal">Optional tag</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_BADGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, badge: prev.badge === b ? "" : b }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        formData.badge === b
                          ? "bg-[#22623a] text-white border-[#22623a]"
                          : "bg-[#faf8f5] text-[#4a4640] border-[#e6dfd5] hover:border-[#22623a]"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="Or enter custom badge text (e.g. 100% Wild Crafted)"
                  className="w-full px-3 py-1.5 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white text-[#1c1917]"
                />
              </div>

              {/* Homepage Featured Toggle & URL Slug */}
              <div className="pt-2 border-t border-[#e6dfd5] grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] cursor-pointer hover:bg-emerald-50/50 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="rounded border-[#e6dfd5] text-[#22623a] focus:ring-[#22623a] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1c1917] block">
                      Feature on Homepage
                    </span>
                    <span className="text-[10px] text-[#6a6660]">
                      Highlight in Top Remedies strip
                    </span>
                  </div>
                </label>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6a6660] mb-1">
                    Store URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="amla-murabba"
                    className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-xl font-mono text-[#4a4640] focus:outline-hidden focus:ring-2 focus:ring-[#22623a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PACK SIZES, PRICING & STOCK ================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              {/* Inline Unit Creator Popover */}
              {isInlineUnitOpen && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-[#22623a]" />
                      <span className="text-xs font-bold text-[#22623a]">
                        Create New Measurement Unit
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInlineUnitOpen(false)}
                      className="text-xs text-[#6a6660] hover:text-rose-600 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#4a4640] mb-1">
                        Code (e.g. tola)
                      </label>
                      <input
                        type="text"
                        value={newUnitCode}
                        onChange={(e) => setNewUnitCode(e.target.value)}
                        placeholder="tola, sachet, pouch"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#4a4640] mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={newUnitName}
                        onChange={(e) => setNewUnitName(e.target.value)}
                        placeholder="Tola (تولہ)"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#4a4640] mb-1">
                        Kind
                      </label>
                      <select
                        value={newUnitKind}
                        onChange={(e) => setNewUnitKind(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg cursor-pointer"
                      >
                        <option value="WEIGHT">Weight (g, kg, tola)</option>
                        <option value="VOLUME">Volume (ml, L)</option>
                        <option value="PACK">Pack / Piece (jar, bottle)</option>
                        <option value="TRADITIONAL">Traditional (masha, ratti)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={addingUnit}
                      onClick={() => handleCreateInlineUnit()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      {addingUnit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Save Unit
                    </button>

                    {missingUnitPresets.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-[#6a6660]">Quick presets:</span>
                        {missingUnitPresets.slice(0, 4).map((p) => (
                          <button
                            key={p.code}
                            type="button"
                            onClick={() => handleCreateInlineUnit(p)}
                            className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#e6dfd5] text-[#22623a] font-medium hover:border-[#22623a]"
                          >
                            +{p.code}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Primary Pack Card */}
              <div className="p-4 rounded-2xl border-2 border-[#22623a]/30 bg-[#faf8f5]/60 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#22623a] text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="font-serif text-sm font-bold text-[#22623a]">
                      Primary Pack Size & Pricing
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Default Pack
                    </span>
                  </div>

                  {!isInlineUnitOpen && (
                    <button
                      type="button"
                      onClick={() => setIsInlineUnitOpen(true)}
                      className="text-xs text-[#22623a] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Add New Unit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4a4640] mb-1">
                      Quantity (Size)
                    </label>
                    <input
                      type="number"
                      value={variantsList[0]?.quantityValue || ""}
                      onChange={(e) => handleVariantChange(0, "quantityValue", e.target.value)}
                      placeholder="500"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4a4640] mb-1">
                      Measurement Unit
                    </label>
                    <select
                      value={variantsList[0]?.unitId || ""}
                      onChange={(e) => handleVariantChange(0, "unitId", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] cursor-pointer"
                    >
                      <option value="">Default (g / Gram)</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4a4640] mb-1">
                      Selling Price (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={variantsList[0]?.price || ""}
                      onChange={(e) => handleVariantChange(0, "price", e.target.value)}
                      placeholder="1200"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] font-bold text-[#22623a]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4a4640] mb-1">
                      Opening Stock (Packs)
                    </label>
                    <input
                      type="number"
                      value={variantsList[0]?.initialStock || ""}
                      onChange={(e) => handleVariantChange(0, "initialStock", e.target.value)}
                      placeholder="25"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] font-mono"
                    />
                  </div>
                </div>

                {/* Optional Financial & SKU Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6a6660] mb-1">
                      Original / Strike Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={variantsList[0]?.originalPrice || ""}
                      onChange={(e) => handleVariantChange(0, "originalPrice", e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6a6660] mb-1">
                      Cost Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={variantsList[0]?.costPrice || ""}
                      onChange={(e) => handleVariantChange(0, "costPrice", e.target.value)}
                      placeholder="e.g. 600"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-[#6a6660] mb-1">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      value={variantsList[0]?.lowStockThreshold || ""}
                      onChange={(e) => handleVariantChange(0, "lowStockThreshold", e.target.value)}
                      placeholder="5"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Pack Sizes List */}
              {variantsList.length > 1 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[#4a4640] block">
                    Additional Pack Sizes ({variantsList.length - 1})
                  </span>
                  {variantsList.slice(1).map((v, i) => {
                    const actualIdx = i + 1;
                    return (
                      <div
                        key={actualIdx}
                        className="p-3.5 rounded-xl border border-[#e6dfd5] bg-white space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#22623a]">
                            Pack Size #{actualIdx + 1} ({v.name || `${v.quantityValue || ""}g`})
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariant(actualIdx)}
                            className="text-xs text-rose-600 hover:text-rose-800 p-1 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <input
                              type="number"
                              value={v.quantityValue || ""}
                              onChange={(e) =>
                                handleVariantChange(actualIdx, "quantityValue", e.target.value)
                              }
                              placeholder="Qty (e.g. 1000)"
                              className="w-full px-2.5 py-1.5 text-xs border border-[#e6dfd5] rounded-lg"
                            />
                          </div>
                          <div>
                            <select
                              value={v.unitId || ""}
                              onChange={(e) =>
                                handleVariantChange(actualIdx, "unitId", e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-[#e6dfd5] rounded-lg"
                            >
                              <option value="">Default (g / Gram)</option>
                              {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.code})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={v.price || ""}
                              onChange={(e) =>
                                handleVariantChange(actualIdx, "price", e.target.value)
                              }
                              placeholder="Price (PKR)"
                              className="w-full px-2.5 py-1.5 text-xs border border-[#e6dfd5] rounded-lg font-bold text-[#22623a]"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={v.initialStock || ""}
                              onChange={(e) =>
                                handleVariantChange(actualIdx, "initialStock", e.target.value)
                              }
                              placeholder="Stock"
                              className="w-full px-2.5 py-1.5 text-xs border border-[#e6dfd5] rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Variant Button */}
              <button
                type="button"
                onClick={addVariant}
                className="w-full py-2.5 px-4 border-2 border-dashed border-[#e6dfd5] hover:border-[#22623a] text-[#22623a] bg-[#faf8f5] hover:bg-emerald-50/50 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Extra Size Variant (e.g. 1kg, 250g, 100ml)</span>
              </button>
            </div>
          )}

          {/* ================= STEP 3: PHOTOS & LIVE CATALOG REVIEW ================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              {/* Photo Upload & Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#4a4640] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#22623a]" />
                    <span>Product Photos ({gallery.length})</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#6a6660]">
                    First image is your store cover photo
                  </span>
                </div>

                {/* UploadDropzone */}
                <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5]">
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res.length > 0) {
                        const newUrls = res.map((f: any) => f.url).filter(Boolean);
                        setGallery((prev) => [...prev, ...newUrls]);
                        setError(null);
                      }
                    }}
                    onUploadError={(err: Error) => {
                      setError(err.message || "Failed to upload photo.");
                    }}
                    appearance={{
                      container: "border-2 border-dashed border-[#22623a]/40 bg-white py-4 rounded-xl",
                      button: "bg-[#22623a] text-white text-xs font-semibold px-4 py-2 rounded-lg",
                      label: "text-xs text-[#4a4640]",
                    }}
                  />
                </div>

                {/* Manual Image URL Paste Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste direct image URL (https://...)"
                    className="flex-1 px-3 py-2 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] text-[#1c1917]"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-3.5 py-2 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-xs font-semibold transition-all shrink-0"
                  >
                    Add URL
                  </button>
                </div>

                {/* Gallery Thumbnails List */}
                {gallery.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                    {gallery.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-square bg-[#faf8f5] ${
                          idx === 0 ? "border-[#22623a] shadow-md" : "border-[#e6dfd5]"
                        }`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Photo ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-[#22623a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            COVER
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => makeCoverImage(idx)}
                              className="p-1 rounded bg-white text-[#22623a] hover:bg-emerald-50 text-[10px] font-bold"
                              title="Set as cover image"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1 rounded bg-white text-rose-600 hover:bg-rose-50"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Storefront Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#faf8f5] to-emerald-50/40 border border-[#e6dfd5] space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6a6660] block">
                  Customer Storefront Live Preview
                </span>
                <div className="p-3 bg-white rounded-2xl border border-[#e6dfd5] flex items-center gap-3.5 shadow-xs">
                  <div className="w-16 h-16 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] overflow-hidden relative shrink-0">
                    {gallery.length > 0 ? (
                      <Image
                        src={gallery[0]}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6a6660]">
                        <ImageIcon className="w-6 h-6 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {formData.badge || formData.categoryLabel}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-[#1c1917] truncate mt-0.5">
                      {formData.name || "Product Title"}
                    </h4>
                    {formData.urduName && (
                      <p className="text-xs font-serif text-[#22623a] truncate">
                        {formData.urduName}
                      </p>
                    )}
                    <p className="text-xs font-bold text-[#22623a] mt-1 font-mono">
                      PKR {variantsList[0]?.price || "1,200"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expandable Review & Tweak Herbal Details Accordion */}
              <div className="rounded-2xl border border-[#e6dfd5] bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsHerbalDetailsOpen(!isHerbalDetailsOpen)}
                  className="w-full px-4 py-3 bg-[#faf8f5] flex items-center justify-between text-left hover:bg-[#f3ede3] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#22623a]" />
                    <span className="font-serif text-xs font-bold text-[#22623a]">
                      Review & Tweak Herbal Details (Mizaj, Benefits, Dosage)
                    </span>
                  </div>
                  {isHerbalDetailsOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#6a6660]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6a6660]" />
                  )}
                </button>

                {isHerbalDetailsOpen && (
                  <div className="p-4 space-y-4 border-t border-[#e6dfd5] text-xs">
                    {/* Mizaj */}
                    <div>
                      <label className="block font-bold text-[#4a4640] mb-1">
                        Mizaj / Temperament
                      </label>
                      <select
                        value={formData.mizaj}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, mizaj: e.target.value }))
                        }
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs cursor-pointer"
                      >
                        {MIZAJ_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Benefits Tags */}
                    <div>
                      <label className="block font-bold text-[#4a4640] mb-1.5">
                        Key Health Benefits ({benefitsList.length})
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {benefitsList.map((b, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium"
                          >
                            <span>{b}</span>
                            <button
                              type="button"
                              onClick={() => removeBenefit(i)}
                              className="text-emerald-700 hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBenefitInput}
                          onChange={(e) => setNewBenefitInput(e.target.value)}
                          placeholder="Type benefit & click Add (e.g. Relieves acidity)"
                          className="flex-1 px-3 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addBenefit(newBenefitInput);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addBenefit(newBenefitInput)}
                          className="px-3 py-1.5 bg-[#22623a] text-white rounded-lg text-xs font-semibold"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Short Description */}
                    <div>
                      <label className="block font-bold text-[#4a4640] mb-1">
                        Short Therapeutic Summary
                      </label>
                      <textarea
                        rows={2}
                        value={formData.shortDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
                        }
                        placeholder="Brief 1-2 sentence description for product cards..."
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs"
                      />
                    </div>

                    {/* Dosage & How To Use */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#4a4640] mb-1">
                          Dosage Instructions
                        </label>
                        <input
                          type="text"
                          value={formData.dosage}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, dosage: e.target.value }))
                          }
                          placeholder="1-2 pieces (approx 25-50g) daily"
                          className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#4a4640] mb-1">
                          How To Use / Tarika Istamal
                        </label>
                        <input
                          type="text"
                          value={formData.howToUse}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, howToUse: e.target.value }))
                          }
                          placeholder="Take in morning on empty stomach with milk"
                          className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Navigation Dock */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => goToStep((currentStep - 1) as 1 | 2)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#4a4640] hover:bg-white border border-[#e6dfd5] transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6a6660] hover:bg-white border border-transparent transition-all"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => goToStep((currentStep + 1) as 2 | 3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSubmit(false)}
                  className="px-3.5 py-2.5 bg-white hover:bg-gray-100 text-[#4a4640] border border-[#e6dfd5] rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSubmit(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-[#c59b27]" />
                  )}
                  <span>{isEditing ? "Update Product" : "🚀 Save & Publish"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
