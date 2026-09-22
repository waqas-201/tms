"use client";

import React, { useState, useEffect, useId } from "react";
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
  DollarSign,
  Scale,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Wand2,
  Leaf,
  Droplets,
  Heart,
  Eye,
  FileText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

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
  "Featured",
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
      shortDescription: "Classical Unani cardiac and digestive tonic prepared from fresh hand-picked Amla in natural syrup.",
      fullDescription: "Prepared according to traditional Unani pharmacopoeia guidelines. Amla (Emblica officinalis) is revered in Eastern medicine as a supreme rejuvenator (Rasayana), exceptionally rich in natural Vitamin C, polyphenols, and essential minerals to strengthen the heart, brain, and eyesight while soothing gastric acidity.",
      benefits: [
        "Rich in Natural Vitamin C & Bioflavonoids",
        "Strengthens Heart Muscles & Relieves Palpitations",
        "Nourishes Hair Roots & Promotes Lustrous Growth",
        "Soothes Stomach Heat & Hyperacidity",
        "Enhances Eye Vision & Daily Vitality",
      ],
      howToUse: "Take 1-2 pieces in the morning on an empty stomach. Rinse off excess syrup with plain water if preferred.",
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
      shortDescription: "Renowned 'King of Herbs' preserve formulated to restore sluggish digestion, relieve constipation, and clarify intellect.",
      fullDescription: "Harar Murabba is formulated using premium yellow Chebulic Myrobalans. Celebrated in Tibb-e-Unani for its gentle laxative and detoxifying properties, it clears stubborn intestinal stagnation, strengthens the stomach lining, and sharpens memory.",
      benefits: [
        "Gently Relieves Chronic Constipation & Bloating",
        "Improves Gastric Digestion & Nutrient Absorption",
        "Clears Brain Fog & Strengthens Memory Faculties",
        "Eliminates Metabolic Waste & Intestinal Toxins",
        "Protects Stomach Against Gas & Acidity",
      ],
      howToUse: "Chew 1 piece thoroughly at bedtime followed by a glass of lukewarm water or milk.",
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
      shortDescription: "Delicious restorative preserve made with fresh mountain apples to uplift mood, calm anxiety, and energize the heart.",
      fullDescription: "Saib Murabba (Apple Preserve) is a classical exhilarant (Mufarreh) that invigorates vital organs. It replenishes vital hemoglobin, alleviates mental tension, regulates heartbeat, and imparts natural radiance to the complexion.",
      benefits: [
        "Premier Cardiac Tonic for Weakness & Palpitations",
        "Elevates Mood & Calms Mental Stress/Anxiety",
        "Enriches Hemoglobin & Blood Formation",
        "Provides Instant Natural Energy & Vitality",
        "Safe & Nourishing for All Ages",
      ],
      howToUse: "Eat 1 slice early morning before breakfast, ideally wrapped in edible silver leaf (Warq-e-Nuqra).",
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
      shortDescription: "Wood-fired steam distillate of Cichorium intybus for liver detoxification, reducing body heat, and kidney health.",
      fullDescription: "Arq Kasni is steam-distilled from freshly harvested wild chicory herbs and roots. Revered across centuries of Unani therapeutics as the ultimate hepatoprotective tonic, it neutralizes excess hepatic bile, cools internal burning, and stimulates natural renal filtration.",
      benefits: [
        "Deeply Purifies the Liver & Stimulates Bile Flow",
        "Extinguishes Internal Body Heat & Bilious Jaundice",
        "Relieves Burning Sensation in Urination & Palms",
        "Reduces Liver & Abdominal Inflammation",
        "Supports Healthy Skin Clarity & Complexion",
      ],
      howToUse: "Mix half a cup with equal parts water or Arq Mako, and consume 30 minutes before meals.",
      dosage: "60ml (half cup) twice daily in morning and evening.",
      suggestedUnitCode: "ml",
      suggestedQty: "800",
      suggestedPrice: "450",
    };
  }

  // 5. Mako (Solanum Nigrum) Distillate
  if (t.includes("mako") || t.includes("solanum")) {
    return {
      urduName: "عرق مکو دافع ورم",
      categoryId: "arqiyat",
      categoryLabel: "Pure Herbal Distillates (Arq)",
      mizaj: "Barid Yabis (Cold & Dry)",
      badge: "Traditional Formula",
      shortDescription: "Pure botanical distillate formulated to soothe visceral swelling, stomach inflammation, and visceral heat.",
      fullDescription: "Arq Mako is prepared through fractional copper condensation of fresh black nightshade herbs. Its natural anti-inflammatory bio-alkaloids specifically resolve swelling in the liver, spleen, and intestinal tract.",
      benefits: [
        "Resolves Internal Visceral Inflammation & Swelling",
        "Soothes Gastritis & Stomach Lining Irritation",
        "Complements Arq Kasni for Complete Hepatic Relief",
        "Assists in Regulating Normal Liver Enzymes",
        "100% Steam Distilled with No Added Preservatives",
      ],
      howToUse: "Take half a cup before meals, often paired with Arq Kasni or plain water.",
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
      shortDescription: "Triple-distilled pure organic Damask rose essence for ocular comfort, facial glow, and cardiac soothing.",
      fullDescription: "Crafted from fresh Rosa damascena petals using traditional copper pot alembics. Provides instant cooling relief when used for tired eyes, tightens facial pores as a botanical toner, and calms palpitations when consumed with sharbat.",
      benefits: [
        "Refreshes & Soothes Tired, Irritated Eyes",
        "Natural Skin Toner & Pore Tightener",
        "Calms Palpitations & Cardiac Heat",
        "100% Food-Grade and Free from Alcohol/Fragrances",
        "Imparts Radiant Natural Complexion Glow",
      ],
      howToUse: "Drink 2 tablespoons with cold water, spray directly over face, or apply drops to eyes.",
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
      categoryLabel: t.includes("oil") || t.includes("roghan") ? "Pain Relief Oils & Balms" : "Whole Herbs & Seeds",
      mizaj: "Haar Yabis (Hot & Dry)",
      badge: "Best Seller",
      shortDescription: "Premium virgin cold-pressed Black Seed (Nigella sativa) oil rich in natural Thymoquinone for total immune & joint support.",
      fullDescription: "Cold-pressed from select non-GMO Ethiopian and indigenous Kalonji seeds at strictly controlled low temperatures to preserve volatile aromatic compounds. Delivers potent antioxidant, anti-inflammatory, and immune-modulating properties.",
      benefits: [
        "Rich in Active Thymoquinone (TQ) for Immune Defense",
        "Relieves Chronic Joint Stiffness & Muscular Aches",
        "Strengthens Hair Follicles & Prevents Hair Fall",
        "Supports Clear Respiratory Passages & Easy Breathing",
        "Promotes Healthy Blood Sugar & Lipid Balance",
      ],
      howToUse: "Take half teaspoon orally with warm milk/honey, or massage directly onto aching joints and scalp.",
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
      shortDescription: "100% pure cold-pressed Sweet Almond oil rich in Vitamin E for brain vitality, smooth digestion, and lustrous skin.",
      fullDescription: "Cold-pressed from premium sweet Gurbandi and Californian almonds. Contains abundant Vitamin E, natural squalene, and unsaturated fatty acids to nourish nerve cells, relieve constipation, and provide radiant skin hydration.",
      benefits: [
        "Nourishes Brain Cells & Enhances Intellectual Focus",
        "Gentle, Natural Lubrication for Smooth Bowels",
        "Deeply Hydrates Dry Skin & Reduces Under-Eye Circles",
        "Conditions Dry, Damaged Hair with Glossy Shine",
        "Safe for Infant Massage & Delicate Skin",
      ],
      howToUse: "Add 1 teaspoon to a glass of warm milk at night, or massage a few drops onto face and temples.",
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
      shortDescription: "Purified high-altitude Himalayan mineral pitch containing 84+ trace minerals and 70%+ Fulvic Acid for supreme vigor.",
      fullDescription: "Traditional water-purified Shilajit sourced directly from high-altitude Himalayan rock fissures. Contains rich fulvic and humic acids to drive cellular ATP energy production, combat chronic fatigue, and strengthen bones, ligaments, and stamina.",
      benefits: [
        "Packed with 84+ Ionic Minerals & 70%+ Fulvic Acid",
        "Dramatically Boosts Physical Stamina & Daily Energy",
        "Accelerates Muscle Recovery & Strengthens Joints",
        "Enhances Vital Vigor & Cellular Oxygenation",
        "Traditionally Purified & 100% Chemical-Free",
      ],
      howToUse: "Dissolve a pea-sized portion (300-500mg) in a glass of warm milk, green tea, or warm water once daily in the morning.",
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
      shortDescription: "Triple-cleaned, 100% natural pure white Psyllium husk for smooth digestive transit, cholesterol control, and cooling.",
      fullDescription: "High-purity soluble dietary fiber harvested from Plantago ovata. Swells gently in the intestinal tract to create comfortable bulk, gently eliminating waste while absorbing excess dietary lipids and cooling stomach heat.",
      benefits: [
        "100% Natural Soluble Fiber for Regular Bowels",
        "Provides Gentle Relief from Acidity & Constipation",
        "Aids in Lowering Excess Cholesterol Levels",
        "Supports Healthy Weight Management & Satiety",
        "Triple-Cleaned & Free from Dust or Residue",
      ],
      howToUse: "Stir 1-2 tablespoons into water, warm milk, or yogurt. Drink immediately followed by an extra glass of water.",
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
      shortDescription: "Premium Nagori Ashwagandha root powder to soothe stress, reduce cortisol, and build deep physical stamina.",
      fullDescription: "Pure unadulterated roots of Withania somnifera processed into micro-fine botanical powder. Renowned as the premier adaptogen in Eastern medicine to combat adrenal burnout, promote restorative sleep, and enhance muscular vitality.",
      benefits: [
        "Calms Mental Stress & Regulates Cortisol Levels",
        "Builds Musculoskeletal Strength & Stamina",
        "Promotes Deep, Restorative Nighttime Sleep",
        "Supports Hormonal Balance & Endurance",
        "100% Pure Nagori Root with No Additives",
      ],
      howToUse: "Mix half a teaspoon (3g) with a glass of warm milk and honey before bedtime.",
      dosage: "3g to 5g daily with warm milk.",
      suggestedUnitCode: "g",
      suggestedQty: "100",
      suggestedPrice: "750",
    };
  }

  // 12. Pain Relief / Dard Oil / Marham
  if (t.includes("dard") || t.includes("pain") || t.includes("marham") || t.includes("balm") || t.includes("joint")) {
    return {
      urduName: "مفید درد ورم کش جڑی بوٹی تیل",
      categoryId: "oils-marham",
      categoryLabel: "Pain Relief Oils & Balms",
      mizaj: "Haar Yabis (Hot & Dry)",
      badge: "Best Seller",
      shortDescription: "Fast-acting herbal transdermal oil infused with classical Unani warming herbs for knee, joint, and back relief.",
      fullDescription: "A synergistic blend of wintergreen, eucalyptus, camphor, and warming herbal extracts formulated to penetrate deep into joints, tendons, and muscles. Restores flexibility, improves micro-circulation, and relieves chronic stiffness.",
      benefits: [
        "Rapid Relief from Knee, Back & Shoulder Discomfort",
        "Soothes Stiff Joints & Restores Easy Mobility",
        "Deep Transdermal Herbal Penetration",
        "Reduces Muscular Swelling After Strain",
        "Non-Sticky Formulation with Pleasing Aroma",
      ],
      howToUse: "Apply 5-10 drops directly onto affected area and gently massage in circular motions for 3-5 minutes.",
      dosage: "Use 2-3 times daily or as needed.",
      suggestedUnitCode: "ml",
      suggestedQty: "60",
      suggestedPrice: "850",
    };
  }

  // 13. Ubtan / Skin Care / Hair
  if (t.includes("ubtan") || t.includes("skin") || t.includes("hair") || t.includes("face") || t.includes("husn")) {
    return {
      urduName: "خاص ہربل حسن ابٹن و فیس پیک",
      categoryId: "hair-skin",
      categoryLabel: "Hair & Skin Care",
      mizaj: "Mo'tadil (Balanced)",
      badge: "100% Pure & Organic",
      shortDescription: "Artisanal herbal formula with wild turmeric, sandalwood, and rose for spotless glowing skin.",
      fullDescription: "Hand-blended according to ancestral beauty formulations using Kasturi turmeric, red sandalwood, rose petals, and chickpea flour. Gently removes dead epidermal cells, fades sun tans, clears blemishes, and imparts natural luminosity.",
      benefits: [
        "Imparts Instant Golden Glow & Even Skin Tone",
        "Fades Sun Tan, Blemishes & Dark Spots",
        "Tightens Enlarged Pores & Smooths Texture",
        "100% Chemical-Free, Sulfate-Free & Paraben-Free",
        "Suitable for All Skin Types",
      ],
      howToUse: "Mix 1-2 spoons with pure Rose Water (or milk for dry skin) to make a smooth paste. Apply for 15 minutes and rinse gently.",
      dosage: "Use 2-3 times a week.",
      suggestedUnitCode: "g",
      suggestedQty: "150",
      suggestedPrice: "900",
    };
  }

  // 14. Fallback / Generic Category Synthesis
  const cat = DEFAULT_CATEGORIES.find((c) => c.id === currentCategoryId) || DEFAULT_CATEGORIES[0];
  const capitalizedTitle = title ? title.charAt(0).toUpperCase() + title.slice(1) : "Pure Herbal Formula";

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
    howToUse: "Consume or apply as directed by your physician or as indicated on the pack label.",
    dosage: "Standard adult dosage: Take 1 serving once or twice daily with fresh water or milk.",
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

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick vs Advanced toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoGenSparkle, setAutoGenSparkle] = useState(false);
  const [autoGenMessage, setAutoGenMessage] = useState<string | null>(null);

  // Inline Unit Creator State
  const [isInlineUnitOpen, setIsInlineUnitOpen] = useState(false);
  const [newUnitCode, setNewUnitCode] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitKind, setNewUnitKind] = useState("WEIGHT");
  const [addingUnit, setAddingUnit] = useState(false);
  const [unitSuccessToast, setUnitSuccessToast] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    urduName: "",
    slug: "",
    categoryId: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    badge: "",
    mizaj: "Mo'tadil (Balanced)",
    shortDescription: "",
    fullDescription: "",
    howToUse: "",
    dosage: "",
    featured: false,
  });

  // Multi-Image Gallery State
  const [gallery, setGallery] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [uploadSuccessCount, setUploadSuccessCount] = useState<number | null>(null);

  // Key Highlights / Benefits
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
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
      // Parse images from initial product
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
        Array.isArray(initialProduct.benefits) ? initialProduct.benefits : []
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
                s.stockOnHand !== undefined ? String(s.stockOnHand) : "20",
              lowStockThreshold: s.lowStockThreshold ? String(s.lowStockThreshold) : "5",
              sku: s.sku || undefined,
              isActive: s.isActive ?? true,
            }))
          : [
              {
                name: "Standard Pack",
                weight: "500g",
                quantityValue: "500",
                price: initialProduct.price ? String(initialProduct.price) : "1200",
                originalPrice: initialProduct.originalPrice ? String(initialProduct.originalPrice) : "",
                costPrice: "600",
                initialStock: "25",
                lowStockThreshold: "5",
                isActive: true,
              },
            ]
      );
      setShowAdvanced(true); // Open advanced if editing
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
      setShowAdvanced(false);
    }
    setError(null);
    setAutoGenMessage(null);
  }, [initialProduct, isOpen]);

  // Handle Name Input -> Auto-Generate URL Slug
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

    // If default primary variant is unset or standard, suggest unit and price
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

  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;
    setGallery((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Key Highlights / Benefits Handlers
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

      // Auto-update weight label if unit or quantityValue changed
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
      return;
    }

    if (gallery.length === 0) {
      setError("Please upload or add at least one product photo.");
      return;
    }

    if (variantsList.length === 0) {
      setError("Please add at least one packaging variant.");
      return;
    }

    for (let i = 0; i < variantsList.length; i++) {
      const v = variantsList[i];
      if (!v.price || isNaN(Number(v.price)) || Number(v.price) <= 0) {
        setError(`Pack Variant #${i + 1} (${v.name || "Unnamed"}) requires a valid selling price.`);
        return;
      }
    }

    const minVariantPrice = Math.min(...variantsList.map((v) => Number(v.price) || 999999));
    const effectiveBasePrice = minVariantPrice < 999999 ? minVariantPrice : Number(variantsList[0].price);

    // Primary cover image is always the first in gallery
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

  // Compute missing preset units for quick inline creation
  const existingUnitCodes = new Set(units.map((u) => u.code.toLowerCase()));
  const missingUnitPresets = PRESET_UNITS_CATALOG.filter(
    (p) => !existingUnitCodes.has(p.code.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[94vh] flex flex-col animate-fade-in text-[#1c1917]">
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-[#e6dfd5] bg-linear-to-r from-[#faf8f5] to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#22623a] text-[#c59b27] flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#22623a]">
                  {isEditing ? "Edit Herbal Product" : "Add Product (Quick Upload)"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  {isEditing ? "Catalog Item" : "Fast Form"}
                </span>
              </div>
              <p className="text-xs text-[#6a6660]">
                Fill in the 4 essentials below or use Smart Auto-Fill for instant herbal details.
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

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-3 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Unit Success Toast */}
          {unitSuccessToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{unitSuccessToast}</span>
            </div>
          )}

          {/* Auto-Gen Success Notice */}
          {autoGenMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{autoGenMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: Product Title, Category & Smart Generator */}
          {/* ========================================================= */}
          <div className="bg-[#faf8f5]/80 p-4 sm:p-5 rounded-2xl border border-[#e6dfd5] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#22623a] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#22623a]">
                  Product Title & Category
                </h3>
              </div>

              {/* 1-Click Auto Generate Button */}
              <button
                type="button"
                onClick={handleAutoGenerateHerbal}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  autoGenSparkle
                    ? "bg-[#c59b27] text-white scale-95"
                    : "bg-linear-to-r from-[#22623a] to-[#2d7648] hover:from-[#1a4d2e] hover:to-[#22623a] text-white hover:shadow-md"
                }`}
                title="Automatically writes descriptions, Urdu names, and health benefits based on herbal formula name."
              >
                <Sparkles className={`w-3.5 h-3.5 ${autoGenSparkle ? "animate-spin text-white" : "text-[#c59b27]"}`} />
                <span>⚡ Auto-Generate Herbal Info</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Product Title */}
              <div className="md:col-span-7 space-y-1">
                <label className="text-xs font-bold text-[#1c1917] flex items-center justify-between">
                  <span>Product Title (English) <span className="text-rose-600">*</span></span>
                  <span className="text-[11px] text-[#6a6660] font-normal">e.g. Pure Amla Murabba or Arq Kasni</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Pure Amla Murabba, Arq Kasni, Kalonji Oil"
                  className="w-full text-sm p-3 bg-white border border-[#e6dfd5] rounded-xl text-[#1c1917] font-medium focus:outline-none focus:ring-2 focus:ring-[#22623a] focus:border-transparent transition-all shadow-2xs"
                />
              </div>

              {/* Category */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-bold text-[#1c1917]">
                  Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  className="w-full text-sm p-3 bg-white border border-[#e6dfd5] rounded-xl text-[#1c1917] font-medium focus:outline-none focus:ring-2 focus:ring-[#22623a] focus:border-transparent transition-all shadow-2xs cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.urduName ? `(${cat.urduName})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* STEP 2: Packaging Pack, Unit & Live Stock */}
          {/* ========================================================= */}
          <div className="bg-[#faf8f5]/80 p-4 sm:p-5 rounded-2xl border border-[#e6dfd5] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#22623a] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#22623a]">
                  Pack Size, Price & Stock
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Add Inline Unit Button */}
                <button
                  type="button"
                  onClick={() => setIsInlineUnitOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#e6dfd5] text-[#22623a] hover:bg-[#faf8f5] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Unit</span>
                </button>

                {/* Add Another Variant */}
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#22623a] text-white hover:bg-[#1a4d2e] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Extra Size Variant</span>
                </button>
              </div>
            </div>

            {/* Inline Unit Creator Popover */}
            {isInlineUnitOpen && (
              <div className="bg-white p-4 rounded-xl border-2 border-[#22623a] shadow-lg space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#22623a]" />
                    <span className="text-xs font-bold text-[#22623a]">
                      Create New Measurement Unit (e.g. tola, sachet, jar, bottle)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsInlineUnitOpen(false)}
                    className="text-[#6a6660] hover:text-rose-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#4a4640] block mb-1">
                      Unit Code (e.g. tola, ml, sachet)
                    </label>
                    <input
                      type="text"
                      value={newUnitCode}
                      onChange={(e) => setNewUnitCode(e.target.value)}
                      placeholder="tola"
                      className="w-full text-xs p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#4a4640] block mb-1">
                      Display Name (e.g. Tola)
                    </label>
                    <input
                      type="text"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      placeholder="Tola"
                      className="w-full text-xs p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#4a4640] block mb-1">
                      Kind
                    </label>
                    <select
                      value={newUnitKind}
                      onChange={(e) => setNewUnitKind(e.target.value)}
                      className="w-full text-xs p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg cursor-pointer"
                    >
                      <option value="WEIGHT">Weight (g, kg, tola)</option>
                      <option value="VOLUME">Volume (ml, L, drop)</option>
                      <option value="PACK">Pack / Piece (jar, bottle, sachet)</option>
                      <option value="TRADITIONAL">Traditional (tola, masha)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#e6dfd5]">
                  {missingUnitPresets.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-[#6a6660] font-medium">Quick add:</span>
                      {missingUnitPresets.slice(0, 4).map((preset) => (
                        <button
                          key={preset.code}
                          type="button"
                          onClick={() => handleCreateInlineUnit(preset)}
                          disabled={addingUnit}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#faf8f5] border border-[#e6dfd5] hover:border-[#22623a] text-[#22623a] font-medium"
                        >
                          + {preset.name} ({preset.code})
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={addingUnit}
                    onClick={() => handleCreateInlineUnit()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22623a] text-white rounded-lg text-xs font-bold hover:bg-[#1a4d2e] disabled:opacity-50 ml-auto"
                  >
                    {addingUnit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Save & Use Unit</span>
                  </button>
                </div>
              </div>
            )}

            {/* Variants Grid */}
            <div className="space-y-3">
              {variantsList.map((variant, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl border border-[#e6dfd5] hover:border-[#c59b27] transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#22623a] text-white text-[11px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-xs text-[#22623a]">
                        {variant.name || `Pack Variant #${index + 1}`} ({variant.weight || "Standard"})
                      </span>
                    </div>

                    {variantsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 p-1"
                        title="Remove variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Size</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {/* Quantity Value & Unit */}
                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-[#1c1917]">
                        Pack Size & Unit <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={variant.quantityValue || ""}
                          onChange={(e) => handleVariantChange(index, "quantityValue", e.target.value)}
                          placeholder="500"
                          className="w-1/2 text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1c1917] font-semibold focus:outline-none focus:border-[#22623a]"
                        />
                        <select
                          value={variant.unitId || ""}
                          onChange={(e) => handleVariantChange(index, "unitId", e.target.value)}
                          className="w-1/2 text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1c1917] font-medium focus:outline-none focus:border-[#22623a] cursor-pointer"
                        >
                          <option value="">Unit (g/ml)...</option>
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Selling Price */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1c1917]">
                        Selling Price (PKR) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                        placeholder="1200"
                        className="w-full text-xs p-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-emerald-900 font-bold focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* Initial Stock */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1c1917]">
                        Opening Stock
                      </label>
                      <input
                        type="number"
                        value={variant.initialStock || "0"}
                        onChange={(e) => handleVariantChange(index, "initialStock", e.target.value)}
                        placeholder="25"
                        className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1c1917] font-semibold focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* Cost Price */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6a6660]">
                        Cost (Optional)
                      </label>
                      <input
                        type="number"
                        value={variant.costPrice || ""}
                        onChange={(e) => handleVariantChange(index, "costPrice", e.target.value)}
                        placeholder="600"
                        className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#6a6660] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* Regular / Strikethrough Price */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6a6660]">
                        MRP / List (Opt)
                      </label>
                      <input
                        type="number"
                        value={variant.originalPrice || ""}
                        onChange={(e) => handleVariantChange(index, "originalPrice", e.target.value)}
                        placeholder="1500"
                        className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#6a6660] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* STEP 3: Multi-Photo Gallery */}
          {/* ========================================================= */}
          <div className="bg-[#faf8f5]/80 p-4 sm:p-5 rounded-2xl border border-[#e6dfd5] space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#22623a] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#22623a]">
                  Product Photos ({gallery.length} added)
                </h3>
              </div>
              <span className="text-[11px] text-[#6a6660]">
                ⭐ First image is the Primary Cover
              </span>
            </div>

            {/* Gallery Thumbnails List */}
            {gallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {gallery.map((imgUrl, index) => {
                  const isCover = index === 0;
                  return (
                    <div
                      key={`${imgUrl}-${index}`}
                      className={`relative group rounded-2xl border-2 overflow-hidden bg-white aspect-square flex flex-col justify-between transition-all shadow-xs ${
                        isCover
                          ? "border-[#22623a] ring-3 ring-[#22623a]/15"
                          : "border-[#e6dfd5] hover:border-[#c59b27]"
                      }`}
                    >
                      <div className="relative w-full h-full p-2">
                        <Image
                          src={imgUrl}
                          alt={`Product photo ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 150px"
                          className="object-contain"
                        />
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                        {isCover ? (
                          <span className="bg-[#22623a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            ⭐ Cover
                          </span>
                        ) : (
                          <span className="bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xs">
                            #{index + 1}
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            title="Delete photo"
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          {!isCover ? (
                            <button
                              type="button"
                              onClick={() => makeCoverImage(index)}
                              className="text-[10px] font-bold bg-[#22623a] text-white px-2 py-1 rounded-lg hover:bg-[#1b502e] w-full text-center transition-colors"
                            >
                              Set as Cover
                            </button>
                          ) : (
                            <span className="text-[10px] text-white font-semibold text-center w-full">
                              Cover Photo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Multi-Image UploadDropzone & URL Fallback */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
              <div className="md:col-span-8 bg-white p-4 rounded-2xl border-2 border-dashed border-[#c59b27] text-center space-y-2">
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const newUrls = res.map((r: any) => r.url || r.ufsUrl).filter(Boolean);
                      setGallery((prev) => {
                        const unique = [...prev];
                        newUrls.forEach((url: string) => {
                          if (!unique.includes(url)) unique.push(url);
                        });
                        return unique;
                      });
                      setUploadSuccessCount(newUrls.length);
                      setTimeout(() => setUploadSuccessCount(null), 3500);
                      setError(null);
                    }
                  }}
                  onUploadError={(err: Error) => {
                    setError(`Upload error: ${err.message}`);
                  }}
                  appearance={{
                    button: "bg-[#22623a] hover:bg-[#1b502e] text-xs font-semibold py-2 px-4 rounded-xl shadow-xs",
                    container: "border-none p-1",
                    label: "text-xs font-semibold text-[#22623a]",
                    allowedContent: "text-[11px] text-[#6a6660]",
                  }}
                />
                {uploadSuccessCount !== null && (
                  <p className="text-emerald-700 font-bold flex items-center justify-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Added {uploadSuccessCount} photo(s) to gallery!
                  </p>
                )}
              </div>

              {/* URL or Sample Image Input */}
              <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-[#e6dfd5] space-y-2.5">
                <label className="text-xs font-bold text-[#1c1917] block">
                  Add via Image URL / Preset
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://... or /images/1-scaled.png"
                    className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1c1917] focus:outline-none focus:border-[#22623a]"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="w-full py-2 bg-white hover:bg-[#22623a] hover:text-white border border-[#22623a] text-[#22623a] font-bold rounded-xl transition-all flex items-center justify-center gap-1 text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Gallery</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#e6dfd5] space-y-1">
                  <span className="text-[10px] text-[#6a6660] font-medium block">Quick sample herbal photos:</span>
                  <div className="flex flex-wrap gap-1">
                    {["/images/1-scaled.png", "/images/2-scaled.png", "/images/3-scaled.png"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (!gallery.includes(preset)) {
                            setGallery((prev) => [...prev, preset]);
                          }
                        }}
                        className="text-[10px] px-2 py-0.5 bg-[#faf8f5] border border-[#e6dfd5] hover:border-[#c59b27] rounded-lg text-[#6a6660]"
                      >
                        {preset.replace("/images/", "")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* STEP 4: Collapsible "Advanced Details" Accordion */}
          {/* ========================================================= */}
          <div className="border border-[#e6dfd5] rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="w-full px-5 py-3.5 bg-[#faf8f5] hover:bg-[#f5f0e8] flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[#22623a]" />
                <span className="font-serif font-bold text-sm text-[#22623a]">
                  Advanced Details & Descriptions (SEO, Urdu Title, Mizaj, Benefits, Dosage)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6a6660]">
                <span>{showAdvanced ? "Collapse" : "Expand"}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showAdvanced && (
              <div className="p-5 sm:p-6 space-y-5 border-t border-[#e6dfd5] animate-fade-in text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Urdu Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1c1917] flex items-center justify-between">
                      <span>Urdu Script Name</span>
                      <span className="text-[11px] text-[#6a6660]">اردو نام</span>
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.urduName}
                      onChange={(e) => setFormData({ ...formData, urduName: e.target.value })}
                      placeholder="مثلاً: خالص آملہ کا مقوی مربہ"
                      className="w-full text-sm p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl font-serif text-right text-[#1c1917] focus:outline-none focus:border-[#22623a]"
                    />
                  </div>

                  {/* URL Slug */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1c1917]">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="pure-amla-murabba"
                      className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl font-mono text-[#1c1917] focus:outline-none focus:border-[#22623a]"
                    />
                  </div>

                  {/* Mizaj / Temperament */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1c1917]">
                      Mizaj (Unani Temperament)
                    </label>
                    <select
                      value={formData.mizaj}
                      onChange={(e) => setFormData({ ...formData, mizaj: e.target.value })}
                      className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl cursor-pointer focus:outline-none focus:border-[#22623a]"
                    >
                      {MIZAJ_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Badge */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c1917]">
                      Product Badge / Ribbon
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="e.g. Best Seller, 100% Organic"
                      className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl"
                    />
                    <div className="flex flex-wrap gap-1">
                      {PRESET_BADGES.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setFormData({ ...formData, badge: b })}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                            formData.badge === b
                              ? "bg-[#22623a] text-white border-[#22623a] font-bold"
                              : "bg-[#faf8f5] text-[#6a6660] border-[#e6dfd5] hover:border-[#c59b27]"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured checkbox */}
                  <div className="flex items-center">
                    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-[#faf8f5] p-3 rounded-xl border border-[#e6dfd5] hover:border-[#22623a] transition-all w-full">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-[#22623a] focus:ring-[#22623a] border-gray-300"
                      />
                      <span className="font-bold text-xs text-[#22623a] flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-[#c59b27] fill-[#c59b27]" />
                        Spotlight on Homepage Carousel
                      </span>
                    </label>
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1c1917]">
                    Short Summary (Catalog & Search Cards)
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Short one-line summary of botanical formulation..."
                    className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl"
                  />
                </div>

                {/* Full Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1c1917]">
                    Detailed Herbal Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    placeholder="Full therapeutic history, traditional preparation, and herbal quality..."
                    className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl"
                  />
                </div>

                {/* Key Benefits (Chips) */}
                <div className="space-y-2 bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5]">
                  <label className="text-xs font-bold text-[#1c1917] flex items-center justify-between">
                    <span>Key Health Highlights & Benefits ({benefitsList.length})</span>
                  </label>

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
                      placeholder="Type a health benefit & press Enter (e.g. Strengthens heart & improves memory)"
                      className="flex-1 text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-xl text-[#1c1917]"
                    />
                    <button
                      type="button"
                      onClick={() => addBenefit(newBenefitInput)}
                      className="px-3.5 py-2 bg-[#22623a] text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {benefitsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {benefitsList.map((b, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#22623a]/30 rounded-lg text-xs font-medium text-[#22623a] shadow-2xs"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{b}</span>
                          <button
                            type="button"
                            onClick={() => removeBenefit(i)}
                            className="text-[#6a6660] hover:text-rose-600 ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* How to Use / Dosage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1c1917]">
                      How to Use / Directions
                    </label>
                    <input
                      type="text"
                      value={formData.howToUse}
                      onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                      placeholder="e.g. Take 1 serving in morning on empty stomach with warm milk."
                      className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1c1917]">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g. 1 teaspoon (approx 5g) twice daily"
                      className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar with Dual Action Buttons */}
        <div className="px-5 sm:px-7 py-4 border-t border-[#e6dfd5] bg-linear-to-r from-[#faf8f5] to-white flex items-center justify-between shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-[#e6dfd5] text-[#4a4640] hover:bg-white font-semibold text-xs transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            {/* Save as Inactive / Draft */}
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#e6dfd5] bg-white hover:bg-[#faf8f5] text-[#4a4640] font-semibold text-xs transition-all disabled:opacity-50"
            >
              Save as Draft (Inactive)
            </button>

            {/* Save & Publish */}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-linear-to-r from-[#22623a] to-[#2d7648] hover:from-[#1a4d2e] hover:to-[#22623a] text-[#c59b27] font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="text-white">Saving Product...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Update & Publish" : "Save & Publish Product"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
