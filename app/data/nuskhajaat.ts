export interface NuskhaIngredientItem {
  id: string;
  name: string;
  urduName: string;
  role?: string; // e.g. "Juz-e-Azam (Primary Active Herb)", "Musleh (Balancing agent)", "Muqawwi (Tonic)"
  unit: "grams" | "tola" | "ml" | "pieces";
  defaultQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  step: number;
  pricePerUnit: number; // PKR per unit
  isOptional: boolean;
  notes?: string;
  orderIndex?: number;
}

export interface Nuskha {
  id: string;
  slug: string;
  title: string;
  urduTitle: string;
  category: "digestion" | "joints-arthritis" | "vitality" | "respiratory" | "brain-memory" | "liver-detox" | "skin-hair";
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  traditionalPurpose?: string;
  mizaj: string; // e.g. "Haar Yabis (Warm & Dry 2°)"
  dosageInstructions: string;
  howToPrepare?: string;
  preparationType: "Safoof" | "Majun" | "Joshanda" | "Roghan" | "Arq Mix";
  preparationTypeUrdu: string;
  preparationFee: number; // Compounding / grinding fee in PKR
  discountPercentage?: number;
  image: string;
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  badge?: string;
  ingredients: NuskhaIngredientItem[];
  benefits: string[];
  warnings?: string[];
  hakimAdvice: string;
}

export const NUSKHAJAAT_CATEGORIES = [
  { id: "all", name: "All Nuskhajaat", label: "All Nuskhajaat", urdu: "تمام مرکبات", urduName: "تمام مرکبات", count: 7 },
  { id: "digestion", name: "Stomach & Digestion", label: "Stomach & Digestion", urdu: "معدہ و ہاضمہ", urduName: "معدہ و ہاضمہ", count: 1 },
  { id: "joints-arthritis", name: "Joints & Arthritis", label: "Joints & Arthritis", urdu: "جوڑوں کا درد و نقرس", urduName: "جوڑوں کا درد و نقرس", count: 2 },
  { id: "brain-memory", name: "Brain & Nerves", label: "Brain & Nerves", urdu: "دماغ و اعصاب", urduName: "دماغ و اعصاب", count: 1 },
  { id: "respiratory", name: "Chest & Respiratory", label: "Chest & Respiratory", urdu: "سینہ، نزلہ و کھانسی", urduName: "سینہ، نزلہ و کھانسی", count: 1 },
  { id: "vitality", name: "Vitality & Strength", label: "Vitality & Strength", urdu: "مغلظ و مقوی اعضاء", urduName: "مغلظ و مقوی اعضاء", count: 1 },
  { id: "liver-detox", name: "Liver & Detox", label: "Liver & Detox", urdu: "جگر و صفرا", urduName: "جگر و صفرا", count: 1 },
];

export const NUSKHA_CATEGORIES = NUSKHAJAAT_CATEGORIES;

export const PREPARATION_TYPES = [
  { id: "all", name: "All Formats", label: "All Formats", urdu: "تمام تراکیب", urduLabel: "تمام تراکیب" },
  { id: "Safoof", name: "Ground Powder (سفوف)", label: "Ground Powder (سفوف)", urdu: "باریک پسائی شدہ سفوف", urduLabel: "باریک پسائی شدہ سفوف" },
  { id: "Majun", name: "Honey Paste (معجون)", label: "Honey Paste (معجون)", urdu: "شہد میں تیار شدہ معجون", urduLabel: "شہد میں تیار شدہ معجون" },
  { id: "Joshanda", name: "Herbal Decoction (جوشاندہ)", label: "Herbal Decoction (جوشاندہ)", urdu: "ثابت جڑی بوٹیاں جوشاندہ", urduLabel: "ثابت جڑی بوٹیاں جوشاندہ" },
  { id: "Roghan", name: "Medicinal Oil (روغن)", label: "Medicinal Oil (روغن)", urdu: "کشیدہ شدہ طبی روغن", urduLabel: "کشیدہ شدہ طبی روغن" },
];

export const NUSKHA_PREPARATION_TYPES = PREPARATION_TYPES;

export const COURSE_DURATIONS = [
  {
    id: "15_days",
    days: 15,
    label: "15 Days Supply",
    multiplier: 0.5,
    discountPercent: 0,
    discountBadge: null,
  },
  {
    id: "30_days",
    days: 30,
    label: "30 Days Standard",
    multiplier: 1.0,
    discountPercent: 0,
    discountBadge: "Standard Supply",
  },
  {
    id: "60_days",
    days: 60,
    label: "60 Days Extended",
    multiplier: 1.9,
    discountPercent: 10,
    discountBadge: "Save 10%",
  },
];

export const PREPARATION_FORMAT_OPTIONS = [
  {
    id: "safoof",
    format: "Safoof" as const,
    label: "Freshly Ground Safoof (سفوف)",
    description: "Finely milled into an 80-mesh powder for rapid stomach absorption.",
    priceAdjustment: 0,
  },
  {
    id: "majun",
    format: "Majun" as const,
    label: "Compounded Honey Majun (معجون)",
    description: "Compounded in a pure wild Sidr honey base for tonifying action.",
    priceAdjustment: 250,
  },
  {
    id: "raw",
    format: "Raw" as const,
    label: "Whole Unground Herbs (ثابت جڑی بوٹیاں)",
    description: "Raw unground classical botanicals for home preparation.",
    priceAdjustment: -50,
  },
];

export const INITIAL_NUSKHAJAAT: Nuskha[] = [
  {
    id: "nuskha-muqawwi-meda",
    slug: "nuskha-muqawwi-meda",
    title: "Nuskha Muqawwi-e-Meda wa Hazim",
    urduTitle: "نسخہ مقوی معدہ و ہاضم مرکب",
    category: "digestion",
    categoryLabel: "Stomach & Digestion",
    shortDescription:
      "Classical 8-herb Unani digestant formulation that eliminates stubborn bloating, gastric acidity, and restores natural digestive fire.",
    fullDescription:
      "Formulated according to classical Tibb-e-Unani pharmacopoeia, this compound blends high-potency carminatives, carminative salts, and gastric tonics. It regulates gastric motility, dissolves flatulence, soothes esophageal burn, and enhances digestive enzyme secretion without creating chemical dependency.",
    traditionalPurpose:
      "Strengthening the stomach (Taqwiyat-e-Meda), expelling morbid gas (Riyah), and balancing digestive heat.",
    mizaj: "Haar Yabis (Warm & Dry 2°)",
    dosageInstructions: "3g to 5g (approx. 1/2 to 1 teaspoon) twice daily with fresh water 15 minutes after main meals.",
    howToPrepare:
      "Herbs are sun-dried, cleaned of chaff, individually ground to a fine 80-mesh powder (Safoof), and blended homogenously.",
    preparationType: "Safoof",
    preparationTypeUrdu: "باریک سفوف (پاؤڈر)",
    preparationFee: 120,
    discountPercentage: 10,
    image: "/images/products/hazim-churna.png",
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 48,
    badge: "Hakim's #1 Digestion Formula",
    benefits: [
      "Provides rapid relief from gastric bloating and abdominal distension",
      "Relieves hyperacidity, sour burps, and heartburn naturally",
      "Enhances intestinal nutrient absorption and healthy appetite",
      "Gentle carminative action safe for daily long-term wellness",
      "Balances internal digestive sluggishness and heavy stomach feel",
    ],
    warnings: [
      "Patients with severe active stomach ulcers should consume with milk instead of water.",
      "Black salt quantity can be reduced for hypertensive patients.",
    ],
    hakimAdvice:
      "Avoid ice-cold drinks immediately following oily meals. Drink a glass of lukewarm water 30 minutes after taking this Safoof.",
    ingredients: [
      {
        id: "ing-1",
        name: "Saunf Shirin (Fennel Seeds)",
        urduName: "سونف شیریں",
        role: "Juz-e-Azam (Primary Carminative)",
        unit: "grams",
        defaultQuantity: 50,
        minQuantity: 20,
        maxQuantity: 200,
        step: 10,
        pricePerUnit: 1.5,
        isOptional: false,
        notes: "Certified pesticide-free sweet fennel from Punjab farms.",
      },
      {
        id: "ing-2",
        name: "Zeera Safaid (White Cumin Seeds)",
        urduName: "زیرہ سفید",
        role: "Muqawwi Hazim (Gastric Stimulant)",
        unit: "grams",
        defaultQuantity: 50,
        minQuantity: 20,
        maxQuantity: 200,
        step: 10,
        pricePerUnit: 2.2,
        isOptional: false,
        notes: "High-essential-oil fragrant cumin seeds.",
      },
      {
        id: "ing-3",
        name: "Zanjabeel (Sun-Dried Ginger / Sonth)",
        urduName: "سونٹھ / زنجبیل",
        role: "Muftah Riyah (Gas Expeller)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 10,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 3.5,
        isOptional: false,
        notes: "Sun-dried Zingiber officinale rhizomes with deep warming potency.",
      },
      {
        id: "ing-4",
        name: "Filfil Siah (Whole Black Pepper)",
        urduName: "فلفل سیاہ",
        role: "Hazim wa Muharrik (Digestive Accelerator)",
        unit: "grams",
        defaultQuantity: 20,
        minQuantity: 10,
        maxQuantity: 80,
        step: 5,
        pricePerUnit: 4.0,
        isOptional: false,
        notes: "Stimulates stomach hydrochloric acid secretion naturally.",
      },
      {
        id: "ing-5",
        name: "Pudina Khushk (Dried Mountain Mint)",
        urduName: "پودینہ خشک پہاڑی",
        role: "Musakkin Alam (Spasm Soother)",
        unit: "grams",
        defaultQuantity: 35,
        minQuantity: 15,
        maxQuantity: 150,
        step: 5,
        pricePerUnit: 2.5,
        isOptional: false,
        notes: "Hand-picked wild mint leaves with strong menthol aroma.",
      },
      {
        id: "ing-6",
        name: "Namak Siah (Rock Black Salt / Kala Namak)",
        urduName: "نمک سیاہ معدنی",
        role: "Hazim-e-Taam (Flavor & Digestion Catalyst)",
        unit: "grams",
        defaultQuantity: 25,
        minQuantity: 0,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 1.0,
        isOptional: true,
        notes: "Natural sulfurous mineral salt; can be omitted for low-sodium diets.",
      },
      {
        id: "ing-7",
        name: "Badiyan Khatai (Star Anise)",
        urduName: "بادیان خطائی",
        role: "Musleh (Aromatic Harmonizer)",
        unit: "grams",
        defaultQuantity: 25,
        minQuantity: 10,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 3.2,
        isOptional: true,
        notes: "Imparts pleasant aroma and relives colic cramps.",
      },
      {
        id: "ing-8",
        name: "Naushadar Desi (Purified Sal Ammoniac)",
        urduName: "نوشادر دیسی مصفی",
        role: "Muftit (Liver & Spleen Decongestant)",
        unit: "grams",
        defaultQuantity: 15,
        minQuantity: 0,
        maxQuantity: 50,
        step: 5,
        pricePerUnit: 4.5,
        isOptional: true,
        notes: "Purified according to Unani Shifakhana methods.",
      },
    ],
  },
  {
    id: "nuskha-dard-mafasil",
    slug: "nuskha-dard-mafasil",
    title: "Nuskha Dard-e-Mafasil wa Niqras",
    urduTitle: "نسخہ درد مفاصل و عرق النساء",
    category: "joints-arthritis",
    categoryLabel: "Joints & Arthritis",
    shortDescription:
      "Potent anti-inflammatory compound featuring Suranjan Shireen & Asgandh Nagori for chronic joint pain, sciatica, arthritis, and uric acid flush.",
    fullDescription:
      "This time-honored Unani herbal recipe addresses joint stiffness and chronic inflammation at its root. Suranjan (Colchicum) is renowned for eliminating excess uric acid crystals from joint synovium, while Asgandh Nagori strengthens periarticular ligaments and calms radiating nerve pain.",
    traditionalPurpose:
      "Tanqiya-e-Uric Acid (Purification of joint fluids), Musakkin-e-Waja (Pain soothing), and strengthening joint cartilage.",
    mizaj: "Haar Yabis (Warm & Dry 3°)",
    dosageInstructions: "5g (1 full teaspoon) twice daily with warm milk or lukewarm water morning and night.",
    howToPrepare:
      "Guggul is carefully purified in Triphala decoction (Mudabbar), then all dry roots are powdered together into fine medicinal Safoof.",
    preparationType: "Safoof",
    preparationTypeUrdu: "باریک سفوف (پاؤڈر)",
    preparationFee: 150,
    discountPercentage: 12,
    image: "/images/products/roghan-surkh.png",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 62,
    badge: "Top Rated for Knee Pain",
    benefits: [
      "Flushes accumulated uric acid crystals from knees, toes, and wrists",
      "Relieves intense morning joint stiffness and knee cracking sounds",
      "Soothes deep radiating sciatica (Irq-un-Nisa) and lower back discomfort",
      "Strengthens ligaments, tendons, and weight-bearing joints",
      "100% steroid-free and safe for long-term cartilage support",
    ],
    warnings: [
      "Not recommended during pregnancy.",
      "Drink at least 8 to 10 glasses of water daily while on this course to facilitate uric acid clearance.",
    ],
    hakimAdvice:
      "Avoid red meat, lentils (daal mash), spinach, and sour curd (khatta dahi) for optimal 30-day therapeutic outcomes.",
    ingredients: [
      {
        id: "ing-j1",
        name: "Suranjan Shireen (Sweet Autumn Crocus)",
        urduName: "سرنجان شیریں",
        role: "Juz-e-Azam (Specific Anti-Uric Acid Root)",
        unit: "grams",
        defaultQuantity: 50,
        minQuantity: 20,
        maxQuantity: 150,
        step: 10,
        pricePerUnit: 6.5,
        isOptional: false,
        notes: "Supreme classical Unani remedy for gout and arthritis.",
      },
      {
        id: "ing-j2",
        name: "Asgandh Nagori (Withania Somnifera / Ashwagandha)",
        urduName: "اسگندھ ناگوری",
        role: "Muqawwi Aasaab (Nerve & Cartilage Restorer)",
        unit: "grams",
        defaultQuantity: 50,
        minQuantity: 25,
        maxQuantity: 200,
        step: 10,
        pricePerUnit: 4.2,
        isOptional: false,
        notes: "Grade-A Nagori roots high in withanolides.",
      },
      {
        id: "ing-j3",
        name: "Gond Chuniya / Palas (Butea Gum)",
        urduName: "گوند چنیا",
        role: "Muqawwi Mafasil (Joint Lubricant)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 5.0,
        isOptional: false,
        notes: "Rich in natural botanical mucilage for joint cushioning.",
      },
      {
        id: "ing-j4",
        name: "Chob Chini (Smilax China Root)",
        urduName: "چوب چینی",
        role: "Musaffi Khoon (Blood & Fluid Purifier)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 120,
        step: 10,
        pricePerUnit: 5.5,
        isOptional: false,
        notes: "Detoxifies systemic inflammatory markers.",
      },
      {
        id: "ing-j5",
        name: "Khulanjan (Alpinia Galangal Root)",
        urduName: "خولنجان / پان کی جڑ",
        role: "Muhallil Auram (Anti-Inflammatory Catalyst)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 4.0,
        isOptional: false,
        notes: "Warm restorative root that dissipates phlegmatic joint blockages.",
      },
      {
        id: "ing-j6",
        name: "Zanjabeel (Sun-Dried Ginger)",
        urduName: "زنجبیل / سونٹھ",
        role: "Musleh (Digestive & Absorption Carrier)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 3.5,
        isOptional: false,
        notes: "Enhances systemic bioavailability of Suranjan.",
      },
      {
        id: "ing-j7",
        name: "Guggul Mudabbar (Purified Commiphora Mukul)",
        urduName: "مقل مصفی / گوند گوگل",
        role: "Mujaffif Rutoobaat (Deep Anti-Rheumatic Resin)",
        unit: "grams",
        defaultQuantity: 25,
        minQuantity: 0,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 8.5,
        isOptional: true,
        notes: "Purified in herbal Triphala decoction for maximum anti-inflammatory action.",
      },
    ],
  },
  {
    id: "nuskha-dimagh-asab",
    slug: "nuskha-dimagh-asab",
    title: "Nuskha Dimagh-o-Asab Muqawwi",
    urduTitle: "نسخہ تقویتِ دماغ و اعصاب (شاہی معجون)",
    category: "brain-memory",
    categoryLabel: "Brain & Nerves",
    shortDescription:
      "Noble brain tonic with Sweet Almonds, Kashmiri Walnuts, Ustukhuddus (French Lavender), and Brahmi for memory power, deep sleep, and nerve vitality.",
    fullDescription:
      "Celebrated as the 'Broom of the Brain' (Jaroob-e-Dimagh) in traditional texts, Ustukhuddus clears sluggish morbid humors from cerebral pathways. When combined with rich sweet almond oil, walnut kernels, and soothing Brahmi, it replenishes depleted mental neurotransmitters and dispels mental exhaustion.",
    traditionalPurpose:
      "Taqwiyat-e-Dimagh (Cerebral Fortification), Hifz-e-Yaddasht (Memory Retention), and balancing nervous tension.",
    mizaj: "Mo'tadil Haar (Mild Warm & Moist 1°)",
    dosageInstructions: "6g to 10g (1 dessert spoon) before bedtime with warm milk or green tea.",
    howToPrepare:
      "Nut kernels and brain herbs are crushed fine and compounded with pure wild bee honey (Asl-e-Khalis) into a rich, aromatic Majun.",
    preparationType: "Majun",
    preparationTypeUrdu: "شہد کی معجون (حلوہ مرکب)",
    preparationFee: 200,
    discountPercentage: 15,
    image: "/images/products/khamira-gaozaban.png",
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 39,
    badge: "Best for Students & Mental Workers",
    benefits: [
      "Sharpen focus, retention, and quick recall during high-demand mental work",
      "Clears chronic tension headaches and brain fog caused by screen fatigue",
      "Promotes tranquil, rejuvenating sleep without pharmaceutical grogginess",
      "Strengthens optic nerves and relieves eye strain",
      "Soothes palpitating nervous anxiety and emotional distress",
    ],
    warnings: [
      "Diabetic patients should request the Safoof (sugar-free powder) version without honey.",
    ],
    hakimAdvice:
      "Massage a few drops of pure Almond Oil (Roghan Badam) onto your temples at night for amplified benefit.",
    ingredients: [
      {
        id: "ing-b1",
        name: "Maghz Badam Shireen (Sweet Almond Kernels)",
        urduName: "مغز بادام شیریں",
        role: "Muqawwi Dimagh (Cerebral Nutrient)",
        unit: "grams",
        defaultQuantity: 60,
        minQuantity: 30,
        maxQuantity: 250,
        step: 10,
        pricePerUnit: 4.8,
        isOptional: false,
        notes: "Hand-shelled sweet desi almonds rich in natural Vitamin E.",
      },
      {
        id: "ing-b2",
        name: "Maghz Akhrot (Kashmiri Walnut Kernels)",
        urduName: "مغز اخروٹ کشمیری",
        role: "Ghidha-e-Dimagh (Omega Rich Brain Fuel)",
        unit: "grams",
        defaultQuantity: 50,
        minQuantity: 20,
        maxQuantity: 200,
        step: 10,
        pricePerUnit: 5.2,
        isOptional: false,
        notes: "Fresh mountain walnut kernels packed with neuroprotective oils.",
      },
      {
        id: "ing-b3",
        name: "Ustukhuddus (French Lavender Herb)",
        urduName: "اسطخودوس (جاروب دماغ)",
        role: "Juz-e-Azam (Cerebral Decongestant & Memory Herb)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 4.0,
        isOptional: false,
        notes: "Classical Jaroob-e-Dimagh that cleanses nervous pathways.",
      },
      {
        id: "ing-b4",
        name: "Brahmi Booti (Bacopa Monnieri)",
        urduName: "برہمی بوٹی",
        role: "Mudrik-e-Hifz (Synaptic Memory Booster)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 5.0,
        isOptional: false,
        notes: "Stimulates neuron dendrite proliferation and calmness.",
      },
      {
        id: "ing-b5",
        name: "Kishneez Khushk (Coriander Seed Kernels)",
        urduName: "دھنیا مغز مصفی",
        role: "Musakkin Hararat (Cooling Neurological Balancer)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 150,
        step: 10,
        pricePerUnit: 2.0,
        isOptional: false,
        notes: "Cools excess heat ascending from the stomach to the head.",
      },
      {
        id: "ing-b6",
        name: "Tukhm Kahu (Wild Lettuce Seeds)",
        urduName: "تخم کاہو",
        role: "Munawwim (Natural Sleep Induction)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 10,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 3.2,
        isOptional: true,
        notes: "Natural sedative herb that induces deep, restorative REM sleep.",
      },
      {
        id: "ing-b7",
        name: "Zafran Irani (Pure Grade-A Saffron)",
        urduName: "خالص زعفران ایرانی",
        role: "Muffareh Qalb (Exhilarant & Tonic)",
        unit: "grams",
        defaultQuantity: 1,
        minQuantity: 0,
        maxQuantity: 5,
        step: 1,
        pricePerUnit: 450.0,
        isOptional: true,
        notes: "Original Persian Negin saffron threads; adds supreme vitality and mood boost.",
      },
      {
        id: "ing-b8",
        name: "Chandi Ke Warq (Pure Silver Foil / Vark)",
        urduName: "چاندی کے خالص ورق",
        role: "Muqawwi Asab (Nerve Tonic)",
        unit: "pieces",
        defaultQuantity: 5,
        minQuantity: 0,
        maxQuantity: 20,
        step: 5,
        pricePerUnit: 30.0,
        isOptional: true,
        notes: "99.9% pure edible silver leaves for classical royal presentation.",
      },
    ],
  },
  {
    id: "nuskha-joshanda-respiratory",
    slug: "nuskha-joshanda-respiratory",
    title: "Nuskha Joshanda Nazla wa Khansi",
    urduTitle: "نسخہ خاص جوشاندہ نزلہ، زکام و سینہ",
    category: "respiratory",
    categoryLabel: "Chest & Respiratory",
    shortDescription:
      "Classical whole herb decoction blend of Banafsha, Licorice, Jujube, and Borage for chest congestion, sore throat, and seasonal cough.",
    fullDescription:
      "A comforting, highly aromatic whole-herb decoction formula used for generations across the subcontinent. Boiling these 7 botanical flowers and roots releases demulcent mucilage, soothing inflamed mucous membranes, liquefying stubborn phlegm, and opening restricted bronchial passages.",
    traditionalPurpose:
      "Munaffis-e-Balgham (Expectorant), Musakkin-e-Sual (Cough Soothing), and clearing chest constriction.",
    mizaj: "Haar Ratab (Warm & Moist 2°)",
    dosageInstructions:
      "Boil 15g (approx. 2 tablespoons) in 2 cups of clean water until 1 cup remains. Strain through cloth and drink warm with 1 teaspoon honey.",
    howToPrepare:
      "Packaged as whole, cleaned herbs and dried botanical blossoms. Ready for home boiling without any chemical additives.",
    preparationType: "Joshanda",
    preparationTypeUrdu: "ثابت جوشاندہ جڑی بوٹیاں",
    preparationFee: 80,
    discountPercentage: 0,
    image: "/images/products/joshanda-mix.png",
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 52,
    badge: "Winter Essential",
    benefits: [
      "Quickly breaks down and expels thick bronchial mucus",
      "Soothes dry, scratchy throat and chronic seasonal coughing fits",
      "Relieves sinus headache and nasal congestion within minutes of inhaling steam",
      "Gentle and 100% natural, safe for children and elders alike",
      "Boosts upper respiratory immunity against environmental smog and dust",
    ],
    warnings: ["Store in a cool dry airtight tin to preserve floral oils."],
    hakimAdvice:
      "Inhale the fragrant herbal steam for 2 minutes while the Joshanda is boiling before drinking.",
    ingredients: [
      {
        id: "ing-r1",
        name: "Gul-e-Banafsha (Sweet Violet Flowers)",
        urduName: "گل بنفشہ",
        role: "Juz-e-Azam (Primary Respiratory Flower)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 150,
        step: 5,
        pricePerUnit: 6.0,
        isOptional: false,
        notes: "Hand-collected purple Himalayan violet flowers.",
      },
      {
        id: "ing-r2",
        name: "Mulethi / Asl-us-Soos (Licorice Root)",
        urduName: "ملٹھی مقشر (اصل السوس)",
        role: "MulaYYin Halaq (Throat Demulcent)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 200,
        step: 10,
        pricePerUnit: 3.0,
        isOptional: false,
        notes: "Peeled sweet licorice roots rich in natural glycyrrhizin.",
      },
      {
        id: "ing-r3",
        name: "Sapistan / Lasoora (Cordia Fruit)",
        urduName: "سپستان / لسوڑا خشک",
        role: "Munaffis Balgham (Mucilage Expectorant)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 150,
        step: 5,
        pricePerUnit: 2.5,
        isOptional: false,
        notes: "Natural botanical demulcent berry.",
      },
      {
        id: "ing-r4",
        name: "Unnab (Jujube / Red Date Berries)",
        urduName: "عناب ولایتی",
        role: "Musaffi Sadr (Chest Calmer)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 200,
        step: 10,
        pricePerUnit: 3.5,
        isOptional: false,
        notes: "Plump Iranian red jujube berries.",
      },
      {
        id: "ing-r5",
        name: "Khatmi & Khubbazi Seeds (Marshmallow Seeds)",
        urduName: "تخم خطمی و خبازی",
        role: "Murattib Sadr (Bronchial Hydrator)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 150,
        step: 5,
        pricePerUnit: 3.0,
        isOptional: false,
        notes: "Soothes irritated vocal cords and airways.",
      },
      {
        id: "ing-r6",
        name: "Barg-e-Gaozaban (Borage Leaves)",
        urduName: "برگ گاؤزبان",
        role: "Muffareh wa Muharrik (Lung Exhilarant)",
        unit: "grams",
        defaultQuantity: 25,
        minQuantity: 10,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 4.0,
        isOptional: false,
        notes: "Strengthens heart and lungs against influenza fatigue.",
      },
      {
        id: "ing-r7",
        name: "Kakra Singhi (Pistacia Galls)",
        urduName: "کاکڑا سینگی",
        role: "Qati Sual (Persistent Cough Terminator)",
        unit: "grams",
        defaultQuantity: 15,
        minQuantity: 0,
        maxQuantity: 60,
        step: 5,
        pricePerUnit: 6.5,
        isOptional: true,
        notes: "Highly recommended for chronic smoker's cough or stubborn dry hacking.",
      },
    ],
  },
  {
    id: "nuskha-akseer-jigar",
    slug: "nuskha-akseer-jigar",
    title: "Nuskha Akseer-e-Jigar wa Yarqan",
    urduTitle: "نسخہ اکسیرِ جگر و صفرا مرکب",
    category: "liver-detox",
    categoryLabel: "Liver & Detox",
    shortDescription:
      "Potent cooling and decongestant formulation with Chicory, Rhubarb root, and Dodder seeds to flush excess bile, cleanse fatty liver, and revitalize energy.",
    fullDescription:
      "The liver is the primary metabolic furnace (Matbakh-e-Badan) in Unani medicine. When bile overheats, symptoms like yellow urine, burning feet, sluggish digestion, and fatigue emerge. This formula cleanses hepatic micro-channels, normalizes AST/ALT markers, and promotes clear, radiant skin.",
    traditionalPurpose:
      "Tasfiyah-e-Jigar (Hepatic Detoxification), Idrar-e-Safra (Bile Regulation), and cooling systemic morbid heat.",
    mizaj: "Barid Ratab (Cooling & Moistening 2°)",
    dosageInstructions: "3g to 4g twice daily before meals with Arq Kasni or room temperature water.",
    howToPrepare: "Herbs are finely pulverized and passed through silk mesh to yield an ultra-fine, easily absorbed powder.",
    preparationType: "Safoof",
    preparationTypeUrdu: "باریک سفوف (پاؤڈر)",
    preparationFee: 120,
    discountPercentage: 10,
    image: "/images/products/sharbat-bazoori.png",
    inStock: true,
    featured: false,
    rating: 4.9,
    reviewCount: 31,
    badge: "Detox & Liver Care",
    benefits: [
      "Assists recovery from fatty liver grade 1 & 2 naturally",
      "Eliminates internal body heat, burning palms, and burning soles",
      "Relieves jaundice symptoms, bitter mouth taste, and bile buildup",
      "Clears acne breakouts caused by sluggish hepatic elimination",
      "Improves natural energy levels and metabolic vitality",
    ],
    warnings: ["Reduce dosage if loose stools occur."],
    hakimAdvice:
      "Pair with 1/2 cup of chilled Arq Kasni or Arq Mako for accelerated hepatic regeneration.",
    ingredients: [
      {
        id: "ing-l1",
        name: "Tukhm Kasni (Chicory Seeds)",
        urduName: "تخم کاسنی",
        role: "Juz-e-Azam (Supreme Liver Tonic)",
        unit: "grams",
        defaultQuantity: 50,
        minQuantity: 25,
        maxQuantity: 200,
        step: 10,
        pricePerUnit: 2.5,
        isOptional: false,
        notes: "Unmatched Unani botanical for hepatocyte regeneration.",
      },
      {
        id: "ing-l2",
        name: "Revand Chini (Rhubarb Root)",
        urduName: "ریوند چینی خالص",
        role: "Mufattih Sudad (Hepatic Channel Opener)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 5.2,
        isOptional: false,
        notes: "High-grade medicinal rheum root with bitter detoxifying potency.",
      },
      {
        id: "ing-l3",
        name: "Tukhm Kasoos (Dodder Seeds / Aftimoon)",
        urduName: "تخم کثوث",
        role: "Mukhrij-e-Safra (Bile Eliminator)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 3.5,
        isOptional: false,
        notes: "Flushes stagnant bile humors from gall passages.",
      },
      {
        id: "ing-l4",
        name: "Mako Khushk (Black Nightshade Berries)",
        urduName: "مکو دانہ خشک",
        role: "Muhallil Auram Jigar (Hepatic Swelling Soother)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 150,
        step: 10,
        pricePerUnit: 2.2,
        isOptional: false,
        notes: "Reduces inflammatory congestion in liver and spleen.",
      },
      {
        id: "ing-l5",
        name: "Zarishk Shireen (Seedless Barberry Fruit)",
        urduName: "زرشک شیریں",
        role: "Muqawwi Jigar (Liver Nutrient & Antioxidant)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 150,
        step: 10,
        pricePerUnit: 4.5,
        isOptional: false,
        notes: "Rich in berberine and dark anthocyanins.",
      },
      {
        id: "ing-l6",
        name: "Tabasheer Asli (Bamboo Manna Crystals)",
        urduName: "طباشیر اصلی معدنی",
        role: "Mubarrid (Deep Systemic Coolant)",
        unit: "grams",
        defaultQuantity: 20,
        minQuantity: 0,
        maxQuantity: 80,
        step: 5,
        pricePerUnit: 8.0,
        isOptional: true,
        notes: "Natural organic silica crystals from bamboo joints; deeply soothes visceral heat.",
      },
    ],
  },
  {
    id: "nuskha-shahi-muqawwi",
    slug: "nuskha-shahi-muqawwi",
    title: "Nuskha Shahi Muqawwi-e-Aaza-e-Raeesa",
    urduTitle: "نسخہ شاہی مغلظ و مقوی اعضاء رئیسہ",
    category: "vitality",
    categoryLabel: "Vitality & Strength",
    shortDescription:
      "Royal vitality compound featuring Salab Misri, Safaid Musli, Indian Ginseng, and Himalayan Pine Kernels for endurance, physical vigor, and vitality recovery.",
    fullDescription:
      "A revered classical Unani formulation traditionally prepared for nobility. It combines legendary tonic roots with natural adaptogens and precious botanical mucilage. It strengthens the body's three vital organs (Heart, Brain, Liver - Aaza-e-Raeesa), restores depleted physical stamina, and replenishes natural vitality.",
    traditionalPurpose:
      "Taqwiyat-e-Kulli (Holistic Vitality), Taghleez-e-Mani (Vital Fluid Thickening), and restoring core physical power.",
    mizaj: "Haar Ratab (Warm & Moist 2°)",
    dosageInstructions: "6g (1 teaspoon) twice daily with 1 cup lukewarm sweetened milk on an empty stomach.",
    howToPrepare:
      "The rare roots are finely ground, sifted through dense silk, and compounded with rich dry fruit kernels and organic Sidr honey.",
    preparationType: "Majun",
    preparationTypeUrdu: "شاہی معجون (حلوہ مرکب)",
    preparationFee: 300,
    discountPercentage: 15,
    image: "/images/products/majun-shabab.png",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 74,
    badge: "Royal Compound Formula",
    benefits: [
      "Restores physical energy, stamina, and combats chronic lethargy",
      "Strengthens pelvic floor muscles and nerve control naturally",
      "Improves vitality markers and natural reproductive strength",
      "Nutritive restorative for individuals recovering from prolonged illness",
      "100% pure herbal formulation without harmful synthetic additives",
    ],
    warnings: [
      "Diabetic patients should opt for the un-sweetened powder (Safoof) version.",
    ],
    hakimAdvice:
      "Consume with whole cow or buffalo milk. Practice light daily walks to assist complete assimilation of these dense tonic herbs.",
    ingredients: [
      {
        id: "ing-v1",
        name: "Salab Misri (Orchis Latifolia Root)",
        urduName: "ثعلب مصری اصلی",
        role: "Juz-e-Azam (Supreme Royal Restorative)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 18.0,
        isOptional: false,
        notes: "Imported genuine Mediterranean salep orchids.",
      },
      {
        id: "ing-v2",
        name: "Safaid Musli (Chlorophytum Borivilianum)",
        urduName: "سفید موصلی ہندوستانی",
        role: "Muqawwi Bah wa Mughalliz (Vitality Root)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 150,
        step: 10,
        pricePerUnit: 12.0,
        isOptional: false,
        notes: "Grade-1 thick white roots with high saponin content.",
      },
      {
        id: "ing-v3",
        name: "Siyah Musli (Curculigo Orchioides)",
        urduName: "سیاہ موصلی",
        role: "Muqawwi Aasaab (Nerve Tonic)",
        unit: "grams",
        defaultQuantity: 30,
        minQuantity: 15,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 8.0,
        isOptional: false,
        notes: "Classical tonic root for strengthening the back and loins.",
      },
      {
        id: "ing-v4",
        name: "Asgandh Nagori (Ashwagandha)",
        urduName: "اسگندھ ناگوری",
        role: "Muharrik Quwat (Adaptogenic Power)",
        unit: "grams",
        defaultQuantity: 50,
        minQuantity: 25,
        maxQuantity: 200,
        step: 10,
        pricePerUnit: 4.2,
        isOptional: false,
        notes: "Supreme stress reducer and physical energizer.",
      },
      {
        id: "ing-v5",
        name: "Gond Kateera (Tragacanth Gum)",
        urduName: "گوند کتیرا",
        role: "Mughalliz wa Musakkin (Cooling Thickener)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 150,
        step: 10,
        pricePerUnit: 3.5,
        isOptional: false,
        notes: "Pure white ribbons of gum tragacanth.",
      },
      {
        id: "ing-v6",
        name: "Maghz Chilgoza & Pista (Pine Nut & Pistachio)",
        urduName: "مغز چلغوزہ و پستہ",
        role: "Ghidha-e-Khas (Lipid Rich Vital Fuel)",
        unit: "grams",
        defaultQuantity: 40,
        minQuantity: 20,
        maxQuantity: 150,
        step: 10,
        pricePerUnit: 9.5,
        isOptional: false,
        notes: "Himalayan pine nuts and Iranian green pistachios.",
      },
      {
        id: "ing-v7",
        name: "Zafran Kashmiri (Pure Kashmiri Saffron)",
        urduName: "خالص زعفران کشمیری",
        role: "Muffareh wa Muqawwi (Heart & Mood Elixir)",
        unit: "grams",
        defaultQuantity: 2,
        minQuantity: 0,
        maxQuantity: 6,
        step: 1,
        pricePerUnit: 450.0,
        isOptional: true,
        notes: "Original Mongra Kashmiri saffron for maximum aroma and therapeutic impact.",
      },
      {
        id: "ing-v8",
        name: "Kushta Nuqra Mumsik (Purified Silver Calx)",
        urduName: "کشتہ نقرہ ممسک مصفی",
        role: "Muqawwi Asab-e-Raeesa (Cardiac & Nerve Fortifier)",
        unit: "grams",
        defaultQuantity: 5,
        minQuantity: 0,
        maxQuantity: 15,
        step: 1,
        pricePerUnit: 70.0,
        isOptional: true,
        notes: "Purified classical incinerated silver preparation for elite vitality.",
      },
    ],
  },
  {
    id: "nuskha-roghan-dard",
    slug: "nuskha-roghan-dard",
    title: "Nuskha Roghan-e-Khaas Baraye Dard",
    urduTitle: "نسخہ خاص طبی روغن برائے جوڑوں کا درد",
    category: "joints-arthritis",
    categoryLabel: "Joints & Arthritis",
    shortDescription:
      "Deep penetrating medicinal herbal oil blend infused with Malkangni, Clove, Camphor, and Sesame oil for instant topical relief from joint stiffness and muscle spasms.",
    fullDescription:
      "Unlike modern synthetic analgesic sprays, this classical Unani oil is slowly simmered over low heat with potent rubefacient herbs. The active volatile compounds penetrate deep through dermal layers to stimulate local micro-circulation, melt cold phlegmatic congestion in joints, and ease stiffness.",
    traditionalPurpose:
      "Tadheen-e-Muzmin (Topical Penetration), Tahleel-e-Riyah (Dispersing localized wind/pain), and warming numb limbs.",
    mizaj: "Haar Yabis (Warm & Penetrating 3°)",
    dosageInstructions: "Gently massage 10 to 15 drops warm onto the painful joint or lower back for 5 minutes before bed. Wrap with warm cloth.",
    howToPrepare: "Herbs are infused in pure wood-pressed sesame oil through classical slow decoction (Kashida Roghan).",
    preparationType: "Roghan",
    preparationTypeUrdu: "کشیدہ طبی تیل (روغن)",
    preparationFee: 150,
    discountPercentage: 0,
    image: "/images/products/roghan-surkh.png",
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 29,
    badge: "Fast Acting Topical Oil",
    benefits: [
      "Provides quick warmth and relief to aching knee and shoulder joints",
      "Relieves stiff morning back spasms and muscular tightness",
      "Helps warm cold, numb extremities and improves peripheral circulation",
      "Non-sticky, easily absorbed aromatic herbal formula",
      "100% natural, no synthetic mineral oils or artificial fragrances",
    ],
    warnings: [
      "For external topical massage only. Do not apply on open wounds or broken skin.",
    ],
    hakimAdvice:
      "Warm the required quantity slightly in a spoon over a candle before applying for enhanced dermal absorption.",
    ingredients: [
      {
        id: "ing-o1",
        name: "Roghan Kunjad (Pure Wood-Pressed Sesame Oil)",
        urduName: "روغن تل لکڑی کے کولہو کا",
        role: "Asas (Base Therapeutic Oil)",
        unit: "ml",
        defaultQuantity: 150,
        minQuantity: 50,
        maxQuantity: 500,
        step: 25,
        pricePerUnit: 2.0,
        isOptional: false,
        notes: "Rich in natural sesamol antioxidants with unmatched skin penetration.",
      },
      {
        id: "ing-o2",
        name: "Roghan Malkangni (Celastrus Paniculatus Oil)",
        urduName: "روغن مالکنگنی خالص",
        role: "Juz-e-Azam (Deep Rubefacient Nerve Oil)",
        unit: "ml",
        defaultQuantity: 50,
        minQuantity: 25,
        maxQuantity: 200,
        step: 25,
        pricePerUnit: 6.0,
        isOptional: false,
        notes: "The premier Unani topical stimulant for numbness and joint ache.",
      },
      {
        id: "ing-o3",
        name: "Ratanjot (Alkanna Tinctoria)",
        urduName: "رتن جوت",
        role: "Muhallil Auram (Anti-Inflammatory Color Root)",
        unit: "grams",
        defaultQuantity: 20,
        minQuantity: 10,
        maxQuantity: 100,
        step: 5,
        pricePerUnit: 4.0,
        isOptional: false,
        notes: "Gives characteristic deep ruby red color and calms nerve heat.",
      },
      {
        id: "ing-o4",
        name: "Kafoor Desi (Natural Bhimseni Camphor)",
        urduName: "کافور دیسی بھیم سینی",
        role: "Musakkin Alam (Instant Cool-Warm Analgesic)",
        unit: "grams",
        defaultQuantity: 15,
        minQuantity: 5,
        maxQuantity: 50,
        step: 5,
        pricePerUnit: 4.0,
        isOptional: false,
        notes: "Natural crystalline camphor that promotes rapid skin penetration.",
      },
      {
        id: "ing-o5",
        name: "Kuchla Mudabbar (Purified Strychnos Nux-Vomica)",
        urduName: "کچلہ مدبر مصفی",
        role: "Muqawwi Aasaab (Topical Nerve Stimulant)",
        unit: "grams",
        defaultQuantity: 15,
        minQuantity: 5,
        maxQuantity: 50,
        step: 5,
        pricePerUnit: 5.5,
        isOptional: false,
        notes: "Strictly purified in milk for topical neural stimulation.",
      },
      {
        id: "ing-o6",
        name: "Roghan Qaranfal (Pure Clove Essential Oil)",
        urduName: "روغن لونگ خالص",
        role: "Musakkin-e-Fawri (Rapid Anesthetic Essential Oil)",
        unit: "ml",
        defaultQuantity: 15,
        minQuantity: 0,
        maxQuantity: 50,
        step: 5,
        pricePerUnit: 12.0,
        isOptional: true,
        notes: "Rich in natural eugenol for rapid topical comfort.",
      },
    ],
  },
];

/**
 * Calculates the exact dynamic price of a customized Nuskha
 */
export function calculateNuskhaPrice(
  nuskha: Nuskha,
  selectedIngredients:
    | { [ingredientId: string]: number }
    | { [ingredientId: string]: { enabled?: boolean; quantity?: number } } = {},
  courseMultiplier: number = 1.0, // 0.5 for 15-day, 1.0 for 30-day, 1.9 or 2.0 for 60-day
  preparationFormat: "Safoof" | "Raw" | "Majun" = "Safoof"
): {
  baseHerbsTotal: number;
  ingredientsCost: number;
  preparationFee: number;
  formatFee: number;
  subtotal: number;
  subtotalBeforeDiscount: number;
  discountAmount: number;
  durationDiscount: number;
  finalPrice: number;
  totalWeightGrams: number;
  ingredientsBreakdown: Array<{
    id: string;
    name: string;
    urduName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;
} {
  let baseHerbsTotal = 0;
  let totalWeightGrams = 0;
  const ingredientsBreakdown: Array<{
    id: string;
    name: string;
    urduName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }> = [];

  nuskha.ingredients.forEach((ing) => {
    const sel = (selectedIngredients as any)[ing.id];
    let isEnabled = true;
    let qty = ing.defaultQuantity;

    if (typeof sel === "number") {
      qty = sel;
      isEnabled = sel > 0;
    } else if (typeof sel === "object" && sel !== null) {
      if (sel.enabled !== undefined) isEnabled = Boolean(sel.enabled);
      if (sel.quantity !== undefined) qty = Number(sel.quantity);
      if (qty <= 0) isEnabled = false;
    }

    if (isEnabled && qty > 0) {
      const lineCost = qty * ing.pricePerUnit;
      baseHerbsTotal += lineCost;

      if (ing.unit === "grams" || ing.unit === "ml") {
        totalWeightGrams += qty;
      } else if (ing.unit === "tola") {
        totalWeightGrams += qty * 11.66;
      }

      ingredientsBreakdown.push({
        id: ing.id,
        name: ing.name,
        urduName: ing.urduName,
        quantity: Math.round(qty * courseMultiplier),
        unit: ing.unit,
        unitPrice: ing.pricePerUnit,
        totalPrice: Math.round(lineCost * courseMultiplier),
      });
    }
  });

  // Apply course duration multiplier to herbs
  baseHerbsTotal = Math.round(baseHerbsTotal * courseMultiplier);
  totalWeightGrams = Math.round(totalWeightGrams * courseMultiplier);

  // Preparation fee
  let preparationFee = nuskha.preparationFee;
  if (preparationFormat === "Raw") {
    // Raw herbs require no grinding
    preparationFee = 0;
  } else if (courseMultiplier > 1.0) {
    preparationFee = Math.round(preparationFee * 1.5);
  }

  // Format fee (e.g. pure honey compound for Majun adds honey cost)
  let formatFee = 0;
  if (preparationFormat === "Majun") {
    formatFee = Math.round(250 * courseMultiplier); // Cost of pure Sidr honey carrier
  }

  const subtotal = baseHerbsTotal + preparationFee + formatFee;

  let discountAmount = 0;
  if (courseMultiplier >= 1.8) {
    // 60-day supply gets 10% course discount
    discountAmount = Math.round(subtotal * 0.1);
  } else if (nuskha.discountPercentage && nuskha.discountPercentage > 0) {
    discountAmount = Math.round((subtotal * nuskha.discountPercentage) / 100);
  }

  const finalPrice = Math.max(0, subtotal - discountAmount);

  return {
    baseHerbsTotal,
    ingredientsCost: baseHerbsTotal,
    preparationFee,
    formatFee,
    subtotal,
    subtotalBeforeDiscount: subtotal,
    discountAmount,
    durationDiscount: discountAmount,
    finalPrice,
    totalWeightGrams,
    ingredientsBreakdown,
  };
}
