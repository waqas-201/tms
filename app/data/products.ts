export interface ProductSize {
  name: string;
  weight: string;
  price: number;
  originalPrice?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  urduName: string;
  category: "murabbajaat" | "arqiyat" | "oils-marham" | "herbs-seeds" | "teas-vitality" | "hair-skin";
  categoryLabel: string;
  categoryUrdu: string;
  shortDescription: string;
  fullDescription: string;
  traditionalPurpose: string;
  benefits: string[];
  ingredients: { name: string; urdu?: string; role: string }[];
  howToUse: string;
  dosage: string;
  hakimAdvice: string;
  warnings?: string[];
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  gallery?: string[];
  sizes: ProductSize[];
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  badge?: string;
  mizaj?: string; // Temperament in Unani medicine (e.g., Mo'tadil, Haar Yabis, Barid Ratab)
}

export interface CategoryInfo {
  id: string;
  slug: string;
  name: string;
  urduName: string;
  description: string;
  heroImage: string;
  productCount: number;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "murabbajaat",
    slug: "murabbajaat",
    name: "Murabbajaat (Herbal Preserves)",
    urduName: "مربہ جات",
    description: "Classical fruit & botanical preserves simmered slowly in organic honey or raw cane syrup for daily cardiac, hepatic, and digestive tonification.",
    heroImage: "/images/Gemini_Generated_Image_353xgp353xgp353x-1.png",
    productCount: 7,
  },
  {
    id: "arqiyat",
    slug: "arqiyat",
    name: "Arqiyat & Distillates",
    urduName: "عرق و کشیدات",
    description: "Pure steam-distilled floral and botanical essences providing rapid bioavailability and systemic detoxification without chemical preservatives.",
    heroImage: "/images/01aa3b4e-d943-4b9a-8c64-1fa2355d0f70-1769544818.png",
    productCount: 2,
  },
  {
    id: "oils-marham",
    slug: "oils-marham",
    name: "Herbal Oils & Marham",
    urduName: "روغنیات و مرہم",
    description: "Cold-pressed therapeutic botanical oils and time-honored herbal ointments for localized pain relief, joint ease, and dermal repair.",
    heroImage: "/images/72dc0d5f-2347-42f4-aef4-5052295325f4-1769544982.png",
    productCount: 2,
  },
  {
    id: "herbs-seeds",
    slug: "herbs-seeds",
    name: "Single Herbs & Pure Mufradat",
    urduName: "جڑی بوٹیاں و مفردات",
    description: "Carefully sourced, sun-dried pure herbs, medicinal seeds, and botanical treasures selected directly from verified organic harvests.",
    heroImage: "/images/Juniper-Berries-002.jpg.webp",
    productCount: 2,
  },
  {
    id: "teas-vitality",
    slug: "teas-vitality",
    name: "Teas & Vitality Blends",
    urduName: "قہوہ و شاہی مقویات",
    description: "Traditional herbal infusions, caffeine-free wellness teas, and invigorating nutrient-dense nuts and seed formulations.",
    heroImage: "/images/Curry-Leaf-Tea_-A-Caffeine-Free-Herbal-Treasure.jpg",
    productCount: 2,
  },
  {
    id: "hair-skin",
    slug: "hair-skin",
    name: "Hair & Dermal Care",
    urduName: "حفاظت بال و جلد",
    description: "Pure botanical formulations free from sulfates and parabens, restoring natural luster, root strength, and skin clarity.",
    heroImage: "/images/Herbalista-Viral-Herbal-Hair-Care-Bundle-E2-80-93-Shampoo-Conditioner-Set-1000ml-33_8-fl-oz-Each-E2-.jpg",
    productCount: 1,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "tahiri-marham",
    slug: "tahiri-marham",
    name: "Tahiri Marham – Herbal Healing Ointment",
    urduName: "طاہری مرہم – دافع سوزش و جلدی مرہم",
    category: "oils-marham",
    categoryLabel: "Herbal Oils & Marham",
    categoryUrdu: "روغنیات و مرہم",
    shortDescription: "A revered classical herbal ointment for soothing skin irritations, minor burns, cuts, insect stings, and cracked heels.",
    fullDescription: "Tahiri Marham is one of Tameer-e-Sehat's signature legacy formulations. Hand-crafted according to time-honored Tibbi principles using natural camphor (Kafoor), beeswax (Mom Zard), and anti-inflammatory herbal oils. It forms a protective barrier over compromised skin while stimulating natural cellular regeneration.",
    traditionalPurpose: "Traditionally applied to soothe acute dermal inflammation, burns, cracked heels, dry eczema patches, and minor cuts.",
    benefits: [
      "Provides rapid soothing relief for minor kitchen burns & abrasions",
      "Softens severely cracked heels and rough dry elbows",
      "Natural antiseptic barrier without synthetic antibiotics",
      "Free from steroids, artificial scents, and petro-chemicals"
    ],
    ingredients: [
      { name: "Kafoor (Camphor)", urdu: "کافور", role: "Cooling & natural antimicrobial" },
      { name: "Mom Zard (Natural Beeswax)", urdu: "موم زرد", role: "Protective lipid moisture barrier" },
      { name: "Roghan-e-Neem (Neem Seed Oil)", urdu: "روغنِ نیم", role: "Classical antiseptic & dermal purifier" },
      { name: "Roghan-e-Kunjad (Sesame Base)", urdu: "روغنِ کنجد", role: "Deep tissue nourishing carrier" }
    ],
    howToUse: "Clean the affected area gently with warm water. Apply a thin layer of Tahiri Marham 2 to 3 times daily. Can be lightly covered with clean gauze if needed.",
    dosage: "Apply a small pea-sized amount directly onto the target skin area.",
    hakimAdvice: "For severe heel cracks in winter, soak feet in lukewarm salt water for 10 minutes, dry thoroughly, apply Tahiri Marham generously, and wear cotton socks overnight.",
    price: 150,
    originalPrice: 200,
    discountPercentage: 25,
    image: "/images/44268fa2-979f-4ff2-9182-a54e785340d0-1769545022.png",
    sizes: [
      { name: "Standard Jar", weight: "50g", price: 150, originalPrice: 200 },
      { name: "Family Pack", weight: "100g", price: 280, originalPrice: 350 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 48,
    badge: "Hakim Signature",
    mizaj: "Mo'tadil (Balanced)"
  },
  {
    id: "jointzen-oil",
    slug: "jointzen-oil",
    name: "JointZen Herbal Pain Relief Oil",
    urduName: "جوائنٹ زن ہربل تیل – مسکن درد مفاصل",
    category: "oils-marham",
    categoryLabel: "Herbal Oils & Marham",
    categoryUrdu: "روغنیات و مرہم",
    shortDescription: "Therapeutic botanical massage oil infused with Wintergreen and Eucalyptus for joint comfort, back fatigue, and muscular ease.",
    fullDescription: "JointZen is formulated through an artisanal decoction process where warming herbs are slowly infused into pure cold-pressed botanical oils over 72 hours. Designed for fast absorption into deep connective tissues to reduce stiffness in knees, shoulders, and lower back.",
    traditionalPurpose: "Used in classical Unani practice to treat Waja-ul-Mafasil (joint pain), Niqras (gout discomfort), and seasonal muscular aches.",
    benefits: [
      "Warming relief for stiff knee joints and morning rigidity",
      "Alleviates lumbar back strain and neck tightness from desk work",
      "Improves local micro-circulation around joints",
      "Pleasant natural botanical aroma without lingering synthetic odors"
    ],
    ingredients: [
      { name: "Roghan-e-Gandhapura (Wintergreen)", urdu: "روغن گندھ پورہ", role: "Natural salicylate for pain relief" },
      { name: "Roghan-e-Zaitoon (Extra Virgin Olive Oil)", urdu: "روغن زیتون", role: "Deep penetrating base oil" },
      { name: "Sat-e-Podina (Menthol Crystals)", urdu: "ست پودینہ", role: "Instant cooling then warming action" },
      { name: "Roghan-e-Darcheeni (Cinnamon Bark Oil)", urdu: "روغن دارچینی", role: "Thermal circulatory stimulant" }
    ],
    howToUse: "Pour 5 to 10 drops onto palms. Gently massage clockwise over affected joints for 5 minutes until fully absorbed. Wrap in a warm cloth for enhanced benefit.",
    dosage: "Use twice daily, especially before bedtime and in the morning.",
    hakimAdvice: "Avoid direct exposure to cold air or icy water for at least 30 minutes following the massage to allow the herbal warmth to penetrate the joints.",
    price: 500,
    originalPrice: 580,
    discountPercentage: 14,
    image: "/images/72dc0d5f-2347-42f4-aef4-5052295325f4-1769544982.png",
    sizes: [
      { name: "Travel Bottle", weight: "60ml", price: 500, originalPrice: 580 },
      { name: "Clinical Bottle", weight: "120ml", price: 900, originalPrice: 1050 }
    ],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 39,
    badge: "Fast Relief",
    mizaj: "Haar Yabis (Warming)"
  },
  {
    id: "arq-makoh",
    slug: "arq-makoh",
    name: "Arq Makoh – Pure Distilled Black Nightshade",
    urduName: "عرق مکوہ – دافع ورم جگر و معدہ",
    category: "arqiyat",
    categoryLabel: "Arqiyat & Distillates",
    categoryUrdu: "عرق و کشیدات",
    shortDescription: "Traditional steam-distilled extract of Solanum Nigrum (Mako) for supporting liver function and calming internal visceral inflammation.",
    fullDescription: "Arq Makoh is prepared via classical deg-bhabka steam distillation using freshly harvested Solanum Nigrum herbs. In eastern medicine, Makoh is regarded as one of the preeminent agents for resolving visceral swelling (Warm-e-Ahsha) and supporting healthy hepatic detoxification.",
    traditionalPurpose: "Prescribed by Hakims to reduce liver and spleen congestion, soothe stomach inflammation, and support healthy urine output.",
    benefits: [
      "Natural hepatic tonic supporting liver function enzymes",
      "Helps calm internal inflammation and gastric burning",
      "Supports healthy fluid balance and reduces abdominal fullness",
      "Pure aqueous extract with 0% alcohol and 0% artificial flavors"
    ],
    ingredients: [
      { name: "Barg-e-Makoh Khushk & Taza (Solanum Nigrum)", urdu: "برگ مکوہ", role: "Active anti-inflammatory botanical" },
      { name: "Aab-e-Muqattar (Purified Distilled Water)", urdu: "آبِ مقطر", role: "Pure steam vehicle" }
    ],
    howToUse: "Take half a cup (60ml to 75ml) morning and evening, either on an empty stomach or as advised by your Hakim.",
    dosage: "60ml – 120ml daily. Often taken in equal proportion with Arq Kasni.",
    hakimAdvice: "For maximum liver detoxification and digestive harmony, combine half a cup of Arq Makoh with half a cup of Arq Kasni every morning before breakfast.",
    price: 200,
    originalPrice: 250,
    discountPercentage: 20,
    image: "/images/01aa3b4e-d943-4b9a-8c64-1fa2355d0f70-1769544818.png",
    sizes: [
      { name: "Single Bottle", weight: "800ml", price: 200, originalPrice: 250 },
      { name: "Trio Bundle (3 Bottles)", weight: "3 x 800ml", price: 550, originalPrice: 750 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 52,
    badge: "Classical Distillate",
    mizaj: "Barid Yabis (Cooling)"
  },
  {
    id: "arq-kasni",
    slug: "arq-kasni",
    name: "Arq Kasni – Pure Chicory Distillate & Liver Tonic",
    urduName: "عرق کاسنی – مقوی جگر، معدہ و مسکن حرارت",
    category: "arqiyat",
    categoryLabel: "Arqiyat & Distillates",
    categoryUrdu: "عرق و کشیدات",
    shortDescription: "Pure floral and seed distillate of Cichorium Intybus (Kasni) for balancing internal body heat, bilious disorders, and kidneys.",
    fullDescription: "Kasni (Chicory) is celebrated in Tibb-e-Nabawi and classical Greco-Arab medicine as a blessed cooling herb. Tameer-e-Sehat distills prime Kasni seeds and leaves to produce a crystal-clear distillate that cools excessive systemic heat (Hiddat-e-Khoon) and supports healthy urinary elimination.",
    traditionalPurpose: "Balances excessive bile, soothes jaundice-related sluggishness, cleanses the renal tract, and calms inner body heat.",
    benefits: [
      "Naturally clears excessive metabolic heat and acidity",
      "Supports liver cell rejuvenation and optimal bile secretion",
      "Assists in clearing toxins through healthy kidney filtration",
      "Gentle and suitable for all adult age groups"
    ],
    ingredients: [
      { name: "Tukhm-o-Barg Kasni (Cichorium Intybus)", urdu: "تخم و برگ کاسنی", role: "Primary cooling & hepatoprotective agent" },
      { name: "Aab-e-Muqattar (Purified Distilled Water)", urdu: "آبِ مقطر", role: "Pure steam vehicle" }
    ],
    howToUse: "Consume half a cup (75ml) early morning on an empty stomach. Can be sweetened with a teaspoon of pure Sharbat-e-Bazoori if desired.",
    dosage: "75ml to 120ml once or twice daily.",
    hakimAdvice: "Excellent in warm Pakistani summers to prevent heat exhaustion and dark, concentrated urine.",
    price: 200,
    originalPrice: 250,
    discountPercentage: 20,
    image: "/images/27bb50c8-4947-4c53-b6d1-74d791108619-1769545086.png",
    sizes: [
      { name: "Single Bottle", weight: "800ml", price: 200, originalPrice: 250 },
      { name: "Trio Bundle (3 Bottles)", weight: "3 x 800ml", price: 550, originalPrice: 750 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 64,
    badge: "Best Seller",
    mizaj: "Barid Ratab (Cool & Moist)"
  },
  {
    id: "amla-murabba",
    slug: "amla-murabba",
    name: "Amla Murabba – Traditional Vitamin C Preserve",
    urduName: "آملہ کا مربہ – مقوی دماغ، نظر و مدافعت",
    category: "murabbajaat",
    categoryLabel: "Murabbajaat (Herbal Preserves)",
    categoryUrdu: "مربہ جات",
    shortDescription: "Handcrafted fresh Indian Gooseberries steeped in herbal syrup. Revered for eyesight clarity, hair strength, and immune vigor.",
    fullDescription: "Our Amla Murabba is prepared from large, tender, unblemished Amla (Emblica officinalis) fruits simmered slowly with cardamom and saffron. It preserves the potent natural bioflavonoids and Vitamin C of the fresh fruit, creating a nourishing tonic for daily mental stamina and digestive vitality.",
    traditionalPurpose: "Classical tonic for Muqawwi-e-Dimagh (brain), Muqawwi-e-Chashm (vision), and reducing hyperacidity.",
    benefits: [
      "Concentrated natural Vitamin C for high immune resilience",
      "Traditional support for memory retention and ocular brightness",
      "Helps prevent premature graying and root weakness of hair",
      "Soothes hyperacidity and stomach lining irritation"
    ],
    ingredients: [
      { name: "Taaza Amla (Fresh Emblica Officinalis)", urdu: "تازہ آملہ", role: "Potent natural antioxidant fruit" },
      { name: "Sheera-e-Khaas (Pure Cane Infusion)", urdu: "شیرہ خاص", role: "Natural preservative matrix" },
      { name: "Ilaichi Sabz (Green Cardamom)", urdu: "الائچی سبز", role: "Digestive aroma & cardiac tonic" },
      { name: "Zafran (Pure Saffron strands)", urdu: "زعفران", role: "Vitality enhancer" }
    ],
    howToUse: "Eat 1 to 2 whole pieces in the morning with breakfast. Gently rinse excess syrup with a splash of water if preferred.",
    dosage: "1 – 2 pieces daily.",
    hakimAdvice: "Washing the fruit gently with water before eating reduces sweetness while retaining 100% of the active herbal alkaloids.",
    price: 250,
    originalPrice: 320,
    discountPercentage: 22,
    image: "/images/ff8c7b8b-c34c-47db-a7aa-058f5e6b64e2-1769545152.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 320 },
      { name: "Medium Jar", weight: "500g", price: 480, originalPrice: 600 },
      { name: "Value Pack", weight: "1kg", price: 950, originalPrice: 1150 }
    ],
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 71,
    badge: "Heritage Recipe",
    mizaj: "Barid Yabis (Cool & Tonic)"
  },
  {
    id: "carrot-murabba",
    slug: "carrot-murabba",
    name: "Carrot Murabba – Gajar ka Murabba",
    urduName: "گاجر کا مربہ – مقوی قلب، جگر و بینائی",
    category: "murabbajaat",
    categoryLabel: "Murabbajaat (Herbal Preserves)",
    categoryUrdu: "مربہ جات",
    shortDescription: "Sweet winter red carrots simmered with cardamom and saffron. Highly valued for heart vigor, eye fatigue, and stamina.",
    fullDescription: "Gajar ka Murabba is prepared from handpicked deep-red winter carrots, prized in Eastern herbal medicine for tonifying the heart muscle (Muqawwi-e-Qalb) and rejuvenating blood vitality. Its rich natural beta-carotene content nourishes ocular tissues and counters digital eye strain.",
    traditionalPurpose: "Prescribed in Tibb for heart palpitations (Khafqan), nervous debility, and sharpening cognitive alertness.",
    benefits: [
      "Tonifies heart energy and helps soothe nervousness",
      "Nourishes optic nerves and relieves dry, tired eyes",
      "Promotes radiant, clear complexion and natural blood production",
      "Delightful, tender texture and aromatic saffron finish"
    ],
    ingredients: [
      { name: "Surkh Gajar (Deep Red Winter Carrots)", urdu: "سرخ گاجر", role: "Rich source of carotenoids & cardiac energy" },
      { name: "Kewra Water (Pandanus Distillate)", urdu: "عرق کیوڑا", role: "Cardiac exhilarant" },
      { name: "Ilaichi (Cardamom)", urdu: "چھوٹی الائچی", role: "Cardiotonic" }
    ],
    howToUse: "Take 25g to 50g (2-3 pieces) in the morning with a cup of warm milk for best nutritional absorption.",
    dosage: "25g – 50g daily.",
    hakimAdvice: "Taking Carrot Murabba with a glass of lukewarm milk in the morning creates a potent revitalizing breakfast ritual for students and professionals.",
    price: 250,
    originalPrice: 320,
    discountPercentage: 22,
    image: "/images/Gemini_Generated_Image_353xgp353xgp353x-1.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 320 },
      { name: "Medium Jar", weight: "500g", price: 470, originalPrice: 580 },
      { name: "Value Pack", weight: "1kg", price: 900, originalPrice: 1100 }
    ],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 33,
    badge: "Heart Tonic",
    mizaj: "Mo'tadil (Balanced)"
  },
  {
    id: "murabba-harr",
    slug: "murabba-harr",
    name: "Murabba Harr – Harar Fruit Digestive Preserve",
    urduName: "مربہ ہڑ – شاہِ ادویہ معدہ و آنت",
    category: "murabbajaat",
    categoryLabel: "Murabbajaat (Herbal Preserves)",
    categoryUrdu: "مربہ جات",
    shortDescription: "Selected yellow Harar (Terminalia Chebula) fruits preserved in herbal syrup. The premier classical remedy for digestive sluggishness.",
    fullDescription: "Terminalia Chebula is hailed in classical Eastern pharmacopeia as 'King of Medicines'. Our Murabba Harr uses hand-selected mature yellow berries processed through multi-step soaking to remove astringency while unlocking deep digestive motility and colon cleansing virtues.",
    traditionalPurpose: "Regarded as the gold standard for chronic constipation, sluggish stomach, gas accumulation, and longevity.",
    benefits: [
      "Natural and gentle bowel regularity without habit-forming laxatives",
      "Eliminates trapped abdominal gas and flatulence",
      "Cleanses intestinal toxins and aids nutrient assimilation",
      "Supports cognitive longevity according to ancient Tibbi texts"
    ],
    ingredients: [
      { name: "Harar Zard (Yellow Chebulic Myrobalan)", urdu: "ہڑ زرد", role: "Premier digestive harmonizer" },
      { name: "Gulab Jal (Pure Rose Distillate)", urdu: "عرق گلاب", role: "Gentle intestinal relaxant" },
      { name: "Pure Herbal Cane Base", urdu: "شیرہ", role: "Preservation medium" }
    ],
    howToUse: "Consume 1 piece before bedtime with lukewarm water. Chew slowly.",
    dosage: "1 piece daily at night.",
    hakimAdvice: "Always chew the fruit flesh thoroughly and discard the inner hard stone seed before swallowing.",
    price: 300,
    originalPrice: 380,
    discountPercentage: 21,
    image: "/images/e659f7b3-f3d2-46c9-8e26-89b51aafd1f8-1769554004.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 300, originalPrice: 380 },
      { name: "Medium Jar", weight: "500g", price: 580, originalPrice: 700 },
      { name: "Value Pack", weight: "1kg", price: 1100, originalPrice: 1350 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 57,
    badge: "Digestive King",
    mizaj: "Mo'tadil (Digestive Tonic)"
  },
  {
    id: "murabba-belgiri",
    slug: "murabba-belgiri",
    name: "Murabba Belgiri – Aegle Marmelos (Bael) Gut Tonic",
    urduName: "مربہ بیل گری – مقوی امعاء و دافع پیچش",
    category: "murabbajaat",
    categoryLabel: "Murabbajaat (Herbal Preserves)",
    categoryUrdu: "مربہ جات",
    shortDescription: "Traditional Bael fruit preserve specifically prepared for irritable bowel discomfort, sensitive intestines, and chronic diarrhea.",
    fullDescription: "Belgiri (Aegle marmelos / Wood Apple) holds a revered status in traditional Ayurvedic and Unani disciplines for toning the intestinal lining. It possesses unique natural mucilage and tannins that firm loose stools, soothe colitis irritation, and restore harmonious digestive cadence.",
    traditionalPurpose: "Specifically indicated for chronic IBS symptoms, loose bowels, summer stomach upsets, and weak intestinal absorption.",
    benefits: [
      "Rapidly firms loose bowel movements and calms gut cramping",
      "Restores beneficial mucosal lining in irritated intestines",
      "Helps manage summer gastrointestinal sensitivities",
      "Rich in natural prebiotic fibers"
    ],
    ingredients: [
      { name: "Giri Belgiri (Fresh Bael Fruit Slices)", urdu: "بیل گری", role: "Digestive astringent & mucilage source" },
      { name: "Cardamom & Herbal Cane Medium", urdu: "شیرہ الائچی", role: "Cooling soothing medium" }
    ],
    howToUse: "Take 1 to 2 pieces twice daily between meals.",
    dosage: "30g to 50g daily.",
    hakimAdvice: "Particularly beneficial for individuals struggling with chronic post-meal intestinal urgency or amoebic bowel sensitivities.",
    price: 250,
    originalPrice: 320,
    discountPercentage: 22,
    image: "/images/Gemini_Generated_Image_b3jbujb3jbujb3jb.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 320 },
      { name: "Medium Jar", weight: "500g", price: 480, originalPrice: 600 },
      { name: "Value Pack", weight: "1kg", price: 950, originalPrice: 1150 }
    ],
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 29,
    badge: "Gut Health",
    mizaj: "Barid Yabis (Astringent Cooling)"
  },
  {
    id: "apple-murabba",
    slug: "apple-murabba",
    name: "Apple Murabba – Kashmiri Apple Vitality Preserve",
    urduName: "سیب کا مربہ – مفرّح قلب و مقوی اعصاب",
    category: "murabbajaat",
    categoryLabel: "Murabbajaat (Herbal Preserves)",
    categoryUrdu: "مربہ جات",
    shortDescription: "Whole Kashmiri crisp apples infused with silver leaf and cardamom for heart palpitations, vitality, and nervous calmness.",
    fullDescription: "Prepared from selected mountain apples, Apple Murabba is one of the classic 'Mufarrih' (mood exhilarants) of Unani medicine. It acts directly upon the heart and central nervous system to reduce anxiety, alleviate mental fatigue, and provide sustained natural energy.",
    traditionalPurpose: "Combats nervous exhaustion, cardiac palpitations, weakness after illness, and low appetite.",
    benefits: [
      "Natural exhilarant relieving palpitations and restlessness",
      "Provides rapid recovery after viral or seasonal exhaustion",
      "Rich in natural pectin and bio-available minerals",
      "Gentle and delicious for elderly individuals and children"
    ],
    ingredients: [
      { name: "Kashmiri Saib (Crisp Mountain Apples)", urdu: "کشمیری سیب", role: "Primary cardiotonic fruit" },
      { name: "Warq-e-Nuqra (Pure Edible Silver Foil)", urdu: "ورق نقرہ", role: "Nerve & cardiac rejuvenator" },
      { name: "Ilaichi & Rose Infusion", urdu: "الائچی و گلاب", role: "Aromatic exhilarants" }
    ],
    howToUse: "Consume 1 whole apple in the morning with breakfast.",
    dosage: "1 apple piece daily.",
    hakimAdvice: "Take on an empty stomach followed by fresh pomegranate juice or lukewarm water for maximum heart revitalization.",
    price: 250,
    originalPrice: 320,
    discountPercentage: 22,
    image: "/images/Gemini_Generated_Image_5m6gwq5m6gwq5m6g-1.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 320 },
      { name: "Medium Jar", weight: "500g", price: 480, originalPrice: 600 },
      { name: "Value Pack", weight: "1kg", price: 900, originalPrice: 1100 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 42,
    badge: "Exhilarant Tonic",
    mizaj: "Mo'tadil (Balanced Refreshing)"
  },
  {
    id: "behi-murabba",
    slug: "behi-murabba",
    name: "Behi Murabba – Quince Fruit Cardiac & Gastric Preserve",
    urduName: "سفرجل / بہی کا مربہ – مسکن معدہ و مصلح قلب",
    category: "murabbajaat",
    categoryLabel: "Murabbajaat (Herbal Preserves)",
    categoryUrdu: "مربہ جات",
    shortDescription: "Treasured Quince fruit preserve celebrated in Prophetic and classical traditions for chest comfort, cardiac vigor, and stomach soothing.",
    fullDescription: "Safarjal (Quince) holds a distinctive honor across traditional medical literature for imparting tranquility to the heart and halting gastric reflux. Our Behi Murabba retains the fruit's dense pectin and fragrant astringency, creating an exceptional preserve for chest lightness and gastric comfort.",
    traditionalPurpose: "Strengthening cardiac valves, reducing gastro-esophageal burning, and supporting maternal health.",
    benefits: [
      "Eases chest heaviness and strengthens heart vitality",
      "Forms a soothing coating over an acidic stomach lining",
      "A blessed traditional preserve with deep historical reverence",
      "Free from artificial colorants and chemical additives"
    ],
    ingredients: [
      { name: "Safarjal / Behi Fruit (Cydonia Oblonga)", urdu: "سفرجل / بہی دانہ", role: "Cardiac & gastric strengthening fruit" },
      { name: "Zafran (Saffron Infusion)", urdu: "زعفران", role: "Cardioprotective essence" }
    ],
    howToUse: "Eat 1 to 2 slices 30 minutes before breakfast.",
    dosage: "30g – 50g daily.",
    hakimAdvice: "Outstanding for individuals who experience acid reflux or chest tightness during periods of mental stress.",
    price: 250,
    originalPrice: 340,
    discountPercentage: 26,
    image: "/images/Gemini_Generated_Image_1jlvon1jlvon1jlv-1.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 340 },
      { name: "Medium Jar", weight: "500g", price: 490, originalPrice: 620 },
      { name: "Value Pack", weight: "1kg", price: 950, originalPrice: 1200 }
    ],
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 38,
    badge: "Prophetic Heritage",
    mizaj: "Barid Yabis (Soothing Astringent)"
  },
  {
    id: "murabba-baans",
    slug: "murabba-baans",
    name: "Murabba Baans – Bamboo Shoot Bone & Growth Preserve",
    urduName: "مربہ بانس – مقوی عظام و قامت",
    category: "murabbajaat",
    categoryLabel: "Murabbajaat (Herbal Preserves)",
    categoryUrdu: "مربہ جات",
    shortDescription: "Tender edible young bamboo shoots rich in organic silica, supporting bone density, adolescent growth, and posture strength.",
    fullDescription: "Bamboo shoots (Banslochan source plant) are exceptionally concentrated in natural bio-available silica, calcium, and plant fibers. Prepared through an elaborate traditional desiccation and simmering technique that softens the shoots into tender, mildly crisp, nutrient-dense morsels.",
    traditionalPurpose: "Traditionally recommended for growing adolescents, bone strength, spine alignment support, and flexibility.",
    benefits: [
      "Natural organic silica for cartilage, joints, and skeletal density",
      "Traditional dietary support for youth height and healthy posture",
      "High fiber content aiding gentle colon motility",
      "Handcrafted in small hygienic seasonal batches"
    ],
    ingredients: [
      { name: "Taza Konpal Baans (Tender Bamboo Shoots)", urdu: "بانس کی کونپلیں", role: "Rich source of natural bio-silica" },
      { name: "Natural Herbal Medium", urdu: "شیرہ مقوی", role: "Preservation medium" }
    ],
    howToUse: "Take 1 to 2 pieces in the morning with a cup of warm milk.",
    dosage: "30g daily.",
    hakimAdvice: "Combine with 15 minutes of morning stretching or light physical exercise for adolescents seeking optimal posture support.",
    price: 450,
    originalPrice: 500,
    discountPercentage: 11,
    image: "/images/Gemini_Generated_Image_jqpq4wjqpq4wjqpq-1.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 450, originalPrice: 500 },
      { name: "Medium Jar", weight: "500g", price: 880, originalPrice: 980 },
      { name: "Value Pack", weight: "1kg", price: 1700, originalPrice: 1900 }
    ],
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 24,
    badge: "Bone & Growth",
    mizaj: "Mo'tadil (Balanced)"
  },
  {
    id: "herbo-silk-shampoo",
    slug: "herbo-silk-shampoo",
    name: "Herbo Silk Shampoo – Pure Herbal Hair Cleanser",
    urduName: "ہربو سلک شیمپو – خالص جڑی بوٹیوں کا نکھار",
    category: "hair-skin",
    categoryLabel: "Hair & Dermal Care",
    categoryUrdu: "حفاظت بال و جلد",
    shortDescription: "Sulfate-free botanical hair cleanser formulated with Shikakai, Amla, Reetha, and Methi extracts for root strength and silky luster.",
    fullDescription: "Herbo Silk Shampoo combines ancient Ayurvedic and Tibbi hair cleansers in a modern, gentle foaming formulation. Free from harsh sulfates (SLS/SLES), silicones, and synthetic dyes, it cleanses without stripping natural scalp sebum, preventing breakage and premature shedding.",
    traditionalPurpose: "Root nourishment, clearing dry scalp dandruff, preventing breakage, and enhancing natural dark sheen.",
    benefits: [
      "100% Sulfate-free, Paraben-free, and Silicone-free formula",
      "Shikakai and Reetha create gentle, natural botanical lather",
      "Amla and Methi strengthen follicles to minimize hair fall",
      "Leaves hair conditioned, bouncy, and manageable"
    ],
    ingredients: [
      { name: "Amla Extract (Emblica Officinalis)", urdu: "عرق آملہ", role: "Follicle strengthening Vitamin C" },
      { name: "Shikakai (Acacia Concinna)", urdu: "شیکاکائی", role: "Natural gentle surfactant & pH balancer" },
      { name: "Reetha (Soapnut)", urdu: "ریٹھہ", role: "Herbal foam builder" },
      { name: "Tukhm Methi (Fenugreek Extract)", urdu: "میتھی دانہ", role: "Moisture & protein conditioning" }
    ],
    howToUse: "Wet hair thoroughly. Dispense a generous amount onto palms, massage into scalp for 2 minutes to allow botanicals to absorb, then rinse with cool water.",
    dosage: "Use 2 to 3 times weekly.",
    hakimAdvice: "For best results on brittle hair, apply pure Roghan-e-Badam (Sweet Almond Oil) to hair tips 1 hour before washing.",
    price: 300,
    originalPrice: 400,
    discountPercentage: 25,
    image: "/images/Herbalista-Viral-Herbal-Hair-Care-Bundle-E2-80-93-Shampoo-Conditioner-Set-1000ml-33_8-fl-oz-Each-E2-.jpg",
    sizes: [
      { name: "Standard Bottle", weight: "200ml", price: 300, originalPrice: 400 },
      { name: "Salon Economy", weight: "500ml", price: 650, originalPrice: 850 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 55,
    badge: "Chemical Free",
    mizaj: "Mo'tadil (Gentle)"
  },
  {
    id: "juniper-berries",
    slug: "juniper-berries",
    name: "Juniper Berries – Whole European Grade (ہوبر)",
    urduName: "ہوبر / جونیپر بیریز – مقوی گرود و مسالکِ بول",
    category: "herbs-seeds",
    categoryLabel: "Single Herbs & Pure Mufradat",
    categoryUrdu: "جڑی بوٹیاں و مفردات",
    shortDescription: "Aromatic wild-harvested whole European Juniper berries for urinary comfort, clearing respiratory congestion, and herbal teas.",
    fullDescription: "Known in classical Unani literature as Hab-ul-Ar'ar or Hoober. Sourced from pristine high-altitude European harvests, these whole berries are carefully dried to preserve their concentrated volatile pinene and juniperic oils.",
    traditionalPurpose: "Supports renal flushing, eliminates fluid retention, clears chest phlegm, and adds piney aroma to herbal infusions.",
    benefits: [
      "Natural botanical support for healthy urinary tract flow",
      "Rich in volatile terpene oils for respiratory ease",
      "Can be brewed into a stimulating aromatic herbal tea",
      "100% raw, unadulterated whole botanicals"
    ],
    ingredients: [
      { name: "Whole Juniper Berries (Juniperus Communis)", urdu: "ثمر العرعر / ہوبر", role: "Pure single botanical" }
    ],
    howToUse: "Crush 5 to 7 berries lightly and steep in 1 cup of boiling water for 10 minutes. Strain and sip warm.",
    dosage: "1 cup of infusion once daily.",
    hakimAdvice: "Consult with our Hakim before use if you have severe acute kidney inflammation or are pregnant.",
    price: 250,
    originalPrice: 500,
    discountPercentage: 50,
    image: "/images/Juniper-Berries-002.jpg.webp",
    sizes: [
      { name: "Pouch", weight: "100g", price: 250, originalPrice: 500 },
      { name: "Standard Pouch", weight: "250g", price: 550, originalPrice: 900 },
      { name: "Apothecary Bag", weight: "500g", price: 1000, originalPrice: 1600 }
    ],
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 22,
    badge: "50% Off",
    mizaj: "Haar Yabis (Warm & Dry)"
  },
  {
    id: "absinthe-herb",
    slug: "absinthe-herb",
    name: "Absinthe Herb / Afsanteen – Artemisia absinthium",
    urduName: "افسنتین – مصفی جگر و محرکِ ہاضمہ",
    category: "herbs-seeds",
    categoryLabel: "Single Herbs & Pure Mufradat",
    categoryUrdu: "جڑی بوٹیاں و مفردات",
    shortDescription: "High-grade wild Artemisia absinthium (Afsanteen) for liver cleansing, gallbladder bile stimulation, and clearing intestinal parasites.",
    fullDescription: "Afsanteen is one of the most revered bitter botanicals in Unani Tibb. Its intensely bitter sesquiterpene lactones trigger immediate digestive enzyme release, clear sluggish bile ducts, and assist in expelling internal parasites.",
    traditionalPurpose: "Prescribed for liver enlargement, jaundice convalescence, chronic loss of appetite, and intestinal detox.",
    benefits: [
      "Potent classical bitter tonic for sluggish liver & gallbladder",
      "Stimulates natural gastric digestive enzymes",
      "Traditional herbal support against intestinal worms",
      "Triple-sorted and sun-dried to preserve essential bioactives"
    ],
    ingredients: [
      { name: "Afsanteen Rumi (Artemisia Absinthium Herb)", urdu: "افسنتین رومی", role: "Pure organic bitter herb" }
    ],
    howToUse: "Boil 3g to 5g in 1.5 cups of water until 1 cup remains. Strain and drink once daily before breakfast.",
    dosage: "3g – 5g in decoction form.",
    hakimAdvice: "Because of its intense bitterness, it can be combined with a few drops of Arq Gulab or honey to ease consumption.",
    price: 500,
    originalPrice: 1000,
    discountPercentage: 50,
    image: "/images/Gemini_Generated_Image_oeeza4oeeza4oeez.jpg",
    sizes: [
      { name: "Herbal Pouch", weight: "100g", price: 500, originalPrice: 1000 },
      { name: "Pouch", weight: "250g", price: 1000, originalPrice: 1800 }
    ],
    inStock: true,
    featured: false,
    rating: 4.9,
    reviewCount: 19,
    badge: "Raw Herb",
    mizaj: "Haar Yabis (Warm Bitter)"
  },
  {
    id: "curry-leaf-tea",
    slug: "curry-leaf-tea",
    name: "Curry Leaf Herbal Tea – Caffeine-Free Infusion",
    urduName: "قہوہ کڑی پتہ – متوازن شکر و خون",
    category: "teas-vitality",
    categoryLabel: "Teas & Vitality Blends",
    categoryUrdu: "قہوہ و شاہی مقویات",
    shortDescription: "Aromatic caffeine-free whole leaf infusion rich in iron and antioxidants, supporting blood sugar equilibrium and healthy lipid metabolism.",
    fullDescription: "Harvested from organically nurtured Murraya koenigii shrubs. Sun-cured gently to preserve delicate essential oils, chlorophyll, and trace minerals. An uplifting after-meal beverage for metabolic balance and digestive comfort.",
    traditionalPurpose: "Supports healthy glucose balance, aids lipid metabolism, and promotes healthy hemoglobin levels.",
    benefits: [
      "100% Caffeine-free natural tea suitable for any hour",
      "Rich in natural iron, folic acid, and antioxidant polyphenols",
      "Supports balanced post-meal sugar spikes and digestion",
      "Refreshing herbal aroma with a subtle spicy note"
    ],
    ingredients: [
      { name: "Kari Patta (Pure Dried Curry Leaves)", urdu: "خشک کڑی پتہ", role: "Primary antioxidant leaf" },
      { name: "Darchini (Cinnamon bark hints)", urdu: "دارچینی", role: "Metabolic warmth & aroma" }
    ],
    howToUse: "Steep 1 tablespoon in boiling water for 5 to 7 minutes. Sip slowly after heavy meals.",
    dosage: "1 to 2 cups daily.",
    hakimAdvice: "Drink warm 20 minutes after lunch or dinner to prevent heaviness and assist natural carbohydrate digestion.",
    price: 350,
    originalPrice: 450,
    discountPercentage: 22,
    image: "/images/Curry-Leaf-Tea_-A-Caffeine-Free-Herbal-Treasure.jpg",
    sizes: [
      { name: "Pouch", weight: "100g", price: 350, originalPrice: 450 },
      { name: "Apothecary Pouch", weight: "200g", price: 650, originalPrice: 850 }
    ],
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 28,
    badge: "Caffeine Free",
    mizaj: "Mo'tadil (Balanced)"
  },
  {
    id: "shahi-maghaz-mix",
    slug: "shahi-maghaz-mix",
    name: "Shahi Muqawwi Dry Fruit & Super Seeds Mix",
    urduName: "شاہی مقوی بیج، مغزیات و گوند",
    category: "teas-vitality",
    categoryLabel: "Teas & Vitality Blends",
    categoryUrdu: "قہوہ و شاہی مقویات",
    shortDescription: "Curated blend of premium almonds, walnuts, pumpkin seeds, chia, flaxseed, and Gond Kateera for physical stamina and brain vitality.",
    fullDescription: "A premier royal formulation uniting the finest organic nuts and vitality seeds. Hand-sorted to remove all impurities and packaged airtight to maintain freshness. Ideal for students, working professionals, nursing mothers, and seniors seeking wholesome vitality.",
    traditionalPurpose: "Muqawwi-e-Aaza-e-Raeesa (vital organ strengthening), mental concentration, and joint lubrication.",
    benefits: [
      "Concentrated plant proteins, Omega-3 fatty acids, and zinc",
      "Enhances memory focus, cognitive endurance, and stamina",
      "Gond Kateera and Chia support joint flexibility and digestive ease",
      "Zero added sugars, artificial preservatives, or frying oils"
    ],
    ingredients: [
      { name: "Maghaz-e-Badam (Kashmiri Sweet Almonds)", urdu: "مغز بادام", role: "Brain & nerve nourishment" },
      { name: "Maghaz-e-Akhrot (Walnut Kernels)", urdu: "مغز اخروٹ", role: "Omega-3 cardiotonic" },
      { name: "Tukhm-e-Kadu & Alsi (Pumpkin & Flaxseeds)", urdu: "تخم کدو و السی", role: "Zinc & mineral support" },
      { name: "Gond Kateera (Tragacanth Gum)", urdu: "گوند کتیرا", role: "Deep cellular hydration & stamina" }
    ],
    howToUse: "Consume 1 to 2 tablespoons in the morning with warm milk, or sprinkle over fresh yogurt or oatmeal.",
    dosage: "30g daily.",
    hakimAdvice: "Soak 2 tablespoons in half a glass of water or milk overnight for maximum enzymatic absorption in the morning.",
    price: 650,
    originalPrice: 750,
    discountPercentage: 13,
    image: "/images/Mixed-Nuts-F0-9F-A5-9C_-Winter-Fruit-_-Warm-Winter-_-Good-Health-_-All-time-Favourites-_-Movie-Night.jpg",
    sizes: [
      { name: "Standard Jar", weight: "250g", price: 650, originalPrice: 750 },
      { name: "Family Pack", weight: "500g", price: 1200, originalPrice: 1450 }
    ],
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 68,
    badge: "Royal Vitality",
    mizaj: "Mo'tadil (Nutrient Dense)"
  }
];

export const CLINIC_INFO = {
  brandName: "Tameer-e-Sehat",
  brandUrdu: "تعمیرِ صحت",
  tagline: "Bridging 35+ Years of Classical Tibbi Wisdom with Modern Purity",
  taglineUrdu: "طبیب کا اعتماد، خالص قدرتی شفا",
  establishedYear: 1990,
  experienceYears: 35,
  botanicalsCount: "500+",
  patientsServed: "150,000+",
  address: "Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi, Karachi, Pakistan",
  city: "Karachi",
  country: "Pakistan",
  phone: "0318-2311310",
  phoneFormatted: "+92 318 2311310",
  whatsappNumber: "923182311310",
  whatsappDisplay: "+92 318 2311310",
  email: "hello@tameeresehat.com",
  timings: "Monday – Saturday: 10:00 AM – 9:00 PM (PKT)",
  fridayTimings: "Friday: 3:00 PM – 9:00 PM",
  freeShippingThreshold: 2000,
  flatShippingFee: 200,
};

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Tariq Mahmood",
    city: "Lahore",
    text: "I consulted for persistent digestive sluggishness and was prescribed Arq Makoh and Murabba Harr. Within three weeks, my bloating and heaviness vanished. The quality and purity are unlike anything bought from commercial stores.",
    concern: "Digestive Care",
    rating: 5,
    verifiedPurchase: true
  },
  {
    id: 2,
    name: "Dr. Samina Rizvi",
    city: "Karachi",
    text: "As a practicing physician, I respect authentic botanical medicine. Tameer-e-Sehat's steam distillates (Arqiyat) and Amla Murabba adhere to true pharmaceutical purity without artificial colors. Highly recommended.",
    concern: "Liver & Immunity",
    rating: 5,
    verifiedPurchase: true
  },
  {
    id: 3,
    name: "Muhammad Usman",
    city: "Islamabad",
    text: "JointZen oil has given my mother tremendous relief in her knees. The delivery to Islamabad arrived in 48 hours with cash on delivery. Excellent service and authentic herbal wisdom.",
    concern: "Joint & Mobility",
    rating: 5,
    verifiedPurchase: true
  },
  {
    id: 4,
    name: "Fatima Zehra",
    city: "Rawalpindi",
    text: "The consultation via WhatsApp was extremely thorough, respectful, and private. The Hakim listened patiently to my concerns and formulated a customized routine that genuinely worked.",
    concern: "Personalized Consultation",
    rating: 5,
    verifiedPurchase: true
  }
];

export const CONSULTATION_AREAS = [
  {
    title: "Digestive & Hepatic Health (معدہ و جگر)",
    description: "Holistic evaluation for chronic indigestion, acid reflux, sluggish liver, fatty liver concerns, and bowel regularity through time-tested Unani herbal therapies.",
    icon: "Activity"
  },
  {
    title: "Joint, Muscle & Spine Mobility (مفاصل و کمر درد)",
    description: "Specialized traditional protocols to relieve chronic joint stiffness, muscular fatigue, lumbar tightness, and promote cartilage lubrication naturally.",
    icon: "Shield"
  },
  {
    title: "Vitality, Stamina & Mental Alertness (مقویات و اعصاب)",
    description: "Natural restorative compounds formulated to combat chronic fatigue, brain fog, nervous exhaustion, and restore sustained vitality.",
    icon: "Sun"
  },
  {
    title: "Skin, Hair & Dermal Health (جلد و بال)",
    description: "Internal blood purification (Musaffi-e-Khoon) and external botanical formulations for stubborn acne, hair thinning, dandruff, and skin irritation.",
    icon: "Sparkles"
  },
  {
    title: "Seasonal Allergies & Respiratory Ease (نزلہ و سانس)",
    description: "Clearing accumulated phlegm (Balgham), soothing dry bronchial coughs, and bolstering baseline respiratory immunity across Pakistani seasons.",
    icon: "Wind"
  },
  {
    title: "Women's & Men's Holistic Wellness (خاندانی صحت)",
    description: "Completely private, confidential consultations addressing hormonal equilibrium, metabolic health, and stage-of-life vitality.",
    icon: "Heart"
  }
];
