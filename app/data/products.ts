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
  mizaj?: string;
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
    name: "Herbal Preserves (Murabba)",
    urduName: "",
    description: "Fresh fruit and herb preserves slowly cooked in pure honey or cane syrup for heart, stomach, and daily energy.",
    heroImage: "/images/Gemini_Generated_Image_353xgp353xgp353x-1.png",
    productCount: 7,
  },
  {
    id: "arqiyat",
    slug: "arqiyat",
    name: "Pure Herbal Distillates (Arq)",
    urduName: "",
    description: "Pure plant waters made through gentle steam distillation to cool the body, soothe the stomach, and support liver health.",
    heroImage: "/images/01aa3b4e-d943-4b9a-8c64-1fa2355d0f70-1769544818.png",
    productCount: 2,
  },
  {
    id: "oils-marham",
    slug: "oils-marham",
    name: "Pain Relief Oils & Balms",
    urduName: "",
    description: "Natural herbal oils and soothing balms for joint pain, backache, knee stiffness, and skin repair.",
    heroImage: "/images/72dc0d5f-2347-42f4-aef4-5052295325f4-1769544982.png",
    productCount: 2,
  },
  {
    id: "herbs-seeds",
    slug: "herbs-seeds",
    name: "Whole Herbs & Seeds",
    urduName: "",
    description: "Sun-dried natural herbs, clean seeds, and raw botanicals sourced fresh from trusted organic farms.",
    heroImage: "/images/Juniper-Berries-002.jpg.webp",
    productCount: 2,
  },
  {
    id: "teas-vitality",
    slug: "teas-vitality",
    name: "Wellness Teas & Energy Mixes",
    urduName: "",
    description: "Caffeine-free herbal teas and nutrient-rich dry fruit mixes for focus, memory, and everyday strength.",
    heroImage: "/images/Curry-Leaf-Tea_-A-Caffeine-Free-Herbal-Treasure.jpg",
    productCount: 2,
  },
  {
    id: "hair-skin",
    slug: "hair-skin",
    name: "Hair & Skin Care",
    urduName: "",
    description: "Gentle herbal shampoos and oils made without harmful chemicals, sulfates, or artificial fragrances.",
    heroImage: "/images/Herbalista-Viral-Herbal-Hair-Care-Bundle-E2-80-93-Shampoo-Conditioner-Set-1000ml-33_8-fl-oz-Each-E2-.jpg",
    productCount: 1,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "tahiri-marham",
    slug: "tahiri-marham",
    name: "Tahiri Marham – Herbal Healing Balm",
    urduName: "",
    category: "oils-marham",
    categoryLabel: "Pain Relief Oils & Balms",
    categoryUrdu: "",
    shortDescription: "A trusted home balm for cracked heels, minor kitchen burns, small cuts, dry skin, and insect bites.",
    fullDescription: "Tahiri Marham is our most popular healing balm. Hand-made using pure beeswax, natural camphor, and healing neem oil. It creates a gentle protective layer over broken skin to speed up natural healing without any burning sensation.",
    traditionalPurpose: "Used for generations to soothe cracked heels, everyday kitchen burns, cuts, and dry skin patches.",
    benefits: [
      "Quick, soothing relief for minor burns, scratches, and scrapes",
      "Softens deep, painful cracked heels and rough elbows",
      "Natural herbal protection without harsh chemicals or steroids",
      "Safe for the whole family to use daily"
    ],
    ingredients: [
      { name: "Camphor (Kafoor)", role: "Cooling & germ protection" },
      { name: "Pure Beeswax (Mom)", role: "Locks in moisture and protects skin" },
      { name: "Neem Seed Oil", role: "Natural skin purifier and soother" },
      { name: "Sesame Oil Base", role: "Nourishes dry skin deeply" }
    ],
    howToUse: "Wash the skin gently with warm water and pat dry. Apply a thin layer 2 to 3 times a day.",
    dosage: "Use a small pea-sized amount on the affected skin.",
    hakimAdvice: "For painful cracked heels in winter: soak feet in warm water with a pinch of salt for 10 minutes, dry well, rub Tahiri Marham generously, and wear soft cotton socks overnight.",
    price: 150,
    originalPrice: 200,
    discountPercentage: 25,
    image: "/images/44268fa2-979f-4ff2-9182-a54e785340d0-1769545022.png",
    sizes: [
      { name: "Small Jar", weight: "50g", price: 150, originalPrice: 200 },
      { name: "Family Pack", weight: "100g", price: 280, originalPrice: 350 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 48,
    badge: "Best Seller",
    mizaj: "Balanced & Gentle"
  },
  {
    id: "jointzen-oil",
    slug: "jointzen-oil",
    name: "JointZen Herbal Pain Relief Oil",
    urduName: "",
    category: "oils-marham",
    categoryLabel: "Pain Relief Oils & Balms",
    categoryUrdu: "",
    shortDescription: "A soothing herbal massage oil made with wintergreen and eucalyptus for knee pain, stiff joints, and backache.",
    fullDescription: "JointZen is made by slowly steeping warming herbs in pure olive oil for 3 full days. It absorbs quickly into the skin to bring fast warmth and comfort to sore knees, tight shoulders, and tired back muscles.",
    traditionalPurpose: "Relieves knee pain, morning joint stiffness, muscle strain from long sitting, and everyday body aches.",
    benefits: [
      "Provides comforting warmth to stiff knees and joints",
      "Eases lower back pain and tight neck muscles from office work",
      "Helps improve blood flow around sore joints",
      "Pleasant herbal aroma without lingering strong smell"
    ],
    ingredients: [
      { name: "Wintergreen Oil", role: "Natural pain-relieving warmth" },
      { name: "Pure Olive Oil", role: "Deeply penetrating carrier oil" },
      { name: "Menthol Crystals (Sat Podina)", role: "Cooling then soothing warm action" },
      { name: "Cinnamon Oil", role: "Improves blood circulation" }
    ],
    howToUse: "Pour 5 to 10 drops on your palms. Gently massage in circles over painful joints for 5 minutes until absorbed. Covering with a warm cloth feels great.",
    dosage: "Use twice a day, especially in the morning and before bed.",
    hakimAdvice: "Avoid direct cold air from AC or fans for 30 minutes after massage so the gentle warmth can work deeply.",
    price: 500,
    originalPrice: 580,
    discountPercentage: 14,
    image: "/images/72dc0d5f-2347-42f4-aef4-5052295325f4-1769544982.png",
    sizes: [
      { name: "Regular Bottle", weight: "60ml", price: 500, originalPrice: 580 },
      { name: "Value Bottle", weight: "120ml", price: 900, originalPrice: 1050 }
    ],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 39,
    badge: "Fast Relief",
    mizaj: "Warm & Soothing"
  },
  {
    id: "arq-makoh",
    slug: "arq-makoh",
    name: "Arq Makoh – Pure Herbal Distillate for Liver & Stomach",
    urduName: "",
    category: "arqiyat",
    categoryLabel: "Pure Herbal Distillates (Arq)",
    categoryUrdu: "",
    shortDescription: "A gentle plant water made from fresh Makoh to support liver health, calm stomach burning, and reduce swelling.",
    fullDescription: "Arq Makoh is prepared by carefully distilling fresh Makoh herbs with pure water. It is one of the most reliable traditional drinks in Pakistan to help soothe internal heat, reduce abdominal swelling, and keep the liver working smoothly.",
    traditionalPurpose: "Used to calm stomach irritation, support the liver, and reduce internal heat and heaviness after meals.",
    benefits: [
      "Natural liver tonic that supports healthy digestion",
      "Helps calm burning in the stomach and chest",
      "Reduces belly bloating and water heaviness",
      "100% natural water with 0% alcohol and no artificial flavors"
    ],
    ingredients: [
      { name: "Fresh Makoh Herb (Solanum Nigrum)", role: "Natural soothing botanical" },
      { name: "Pure Distilled Water", role: "Clean steam vehicle" }
    ],
    howToUse: "Drink half a cup (around 75ml) morning and evening, either on an empty stomach or as advised.",
    dosage: "Half a cup (75ml) once or twice daily.",
    hakimAdvice: "For the best liver and digestive care, mix half a cup of Arq Makoh with half a cup of Arq Kasni every morning before breakfast.",
    price: 200,
    originalPrice: 250,
    discountPercentage: 20,
    image: "/images/01aa3b4e-d943-4b9a-8c64-1fa2355d0f70-1769544818.png",
    sizes: [
      { name: "Single Bottle", weight: "800ml", price: 200, originalPrice: 250 },
      { name: "Pack of 3 Bottles", weight: "3 x 800ml", price: 550, originalPrice: 750 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 52,
    badge: "Traditional Distillate",
    mizaj: "Cooling & Gentle"
  },
  {
    id: "arq-kasni",
    slug: "arq-kasni",
    name: "Arq Kasni – Cooling Herbal Distillate for Liver & Kidneys",
    urduName: "",
    category: "arqiyat",
    categoryLabel: "Pure Herbal Distillates (Arq)",
    categoryUrdu: "",
    shortDescription: "Pure chicory water that naturally clears body heat, cools the liver, and supports healthy kidneys.",
    fullDescription: "Kasni (Chicory) is famous in Pakistani tradition as a natural cooling herb. We distill clean Kasni seeds and leaves to produce a crystal-clear herbal water that flushes out excess body heat and helps you feel refreshed throughout hot summer months.",
    traditionalPurpose: "Cools internal heat, supports normal liver function, and relieves burning during urination.",
    benefits: [
      "Naturally cools down excessive body heat and acidity",
      "Helps keep liver and kidney functions clean and clear",
      "Great for hot summer days to stay refreshed",
      "Mild, safe, and suitable for all adults"
    ],
    ingredients: [
      { name: "Kasni Herb & Seeds (Chicory)", role: "Natural cooling & liver support" },
      { name: "Pure Distilled Water", role: "Clean steam carrier" }
    ],
    howToUse: "Drink half a cup (around 75ml) in the morning on an empty stomach. You can add a spoonful of honey or sweet syrup if you like.",
    dosage: "Half a cup once or twice a day.",
    hakimAdvice: "Very helpful in hot Pakistani weather to beat the heat, stay hydrated, and protect your liver.",
    price: 200,
    originalPrice: 250,
    discountPercentage: 20,
    image: "/images/27bb50c8-4947-4c53-b6d1-74d791108619-1769545086.png",
    sizes: [
      { name: "Single Bottle", weight: "800ml", price: 200, originalPrice: 250 },
      { name: "Pack of 3 Bottles", weight: "3 x 800ml", price: 550, originalPrice: 750 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 64,
    badge: "Best Seller",
    mizaj: "Cooling & Hydrating"
  },
  {
    id: "amla-murabba",
    slug: "amla-murabba",
    name: "Amla Murabba – Vitamin C & Immunity Preserve",
    urduName: "",
    category: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    categoryUrdu: "",
    shortDescription: "Plump, juicy Indian gooseberries in sweet syrup with cardamom. Great for eyesight, hair strength, and everyday immunity.",
    fullDescription: "Our Amla Murabba is prepared from large, tender, fresh Amla fruits slowly cooked with sweet cardamom and saffron. It preserves all the natural Vitamin C of fresh amla, making it an easy, tasty morning treat for the whole family.",
    traditionalPurpose: "A time-tested daily sweet tonic for memory, eyesight clarity, strong hair roots, and reducing stomach acidity.",
    benefits: [
      "Full of natural Vitamin C to boost your daily immune defense",
      "Traditional food for sharp memory and bright eyesight",
      "Helps nourish hair roots and reduce hair fall",
      "Soothes stomach burning and indigestion"
    ],
    ingredients: [
      { name: "Fresh Amla Fruits", role: "Rich in natural Vitamin C & antioxidants" },
      { name: "Pure Cane Syrup", role: "Natural sweetness and preservation" },
      { name: "Green Cardamom (Ilaichi)", role: "Pleasant aroma and easy digestion" },
      { name: "Saffron (Zafran)", role: "Natural vitality touch" }
    ],
    howToUse: "Eat 1 to 2 pieces in the morning with breakfast. You can rinse off extra syrup with plain water if you prefer less sweetness.",
    dosage: "1 to 2 pieces daily.",
    hakimAdvice: "Lightly washing the fruit in water before eating reduces sweetness without losing any of its healthy herbal benefits.",
    price: 250,
    originalPrice: 320,
    discountPercentage: 22,
    image: "/images/ff8c7b8b-c34c-47db-a7aa-058f5e6b64e2-1769545152.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 320 },
      { name: "Medium Jar", weight: "500g", price: 480, originalPrice: 600 },
      { name: "Family Pack", weight: "1kg", price: 950, originalPrice: 1150 }
    ],
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 71,
    badge: "Family Favorite",
    mizaj: "Cooling & Nutritious"
  },
  {
    id: "carrot-murabba",
    slug: "carrot-murabba",
    name: "Carrot Murabba – Gajar ka Murabba",
    urduName: "",
    category: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    categoryUrdu: "",
    shortDescription: "Sweet winter red carrots simmered with cardamom. Highly recommended for heart energy, tired eyes, and daily vitality.",
    fullDescription: "Gajar ka Murabba is made from fresh deep-red winter carrots cooked slowly until soft and juicy. Carrots are packed with natural Vitamin A and nutrients that ease eye strain from phone screens and give natural energy to the heart.",
    traditionalPurpose: "Supports heart wellness, eases eye tiredness, and gives natural stamina for study and work.",
    benefits: [
      "Naturally supports heart energy and eases nervous restlessness",
      "Nourishes tired, dry eyes from screen time and reading",
      "Helps give skin a healthy, fresh glow",
      "Soft, delicious, and loved by kids and elders alike"
    ],
    ingredients: [
      { name: "Fresh Red Winter Carrots", role: "Rich in natural beta-carotene" },
      { name: "Pure Cane Syrup", role: "Natural preservation" },
      { name: "Green Cardamom", role: "Aromatic and stomach friendly" }
    ],
    howToUse: "Enjoy 2 to 3 pieces in the morning, ideally with a glass of warm milk.",
    dosage: "25g to 50g (2-3 pieces) every morning.",
    hakimAdvice: "Eating Carrot Murabba with a glass of warm milk makes an easy, energizing breakfast for students and busy professionals.",
    price: 250,
    originalPrice: 320,
    discountPercentage: 22,
    image: "/images/Gemini_Generated_Image_353xgp353xgp353x-1.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 320 },
      { name: "Medium Jar", weight: "500g", price: 470, originalPrice: 580 },
      { name: "Family Pack", weight: "1kg", price: 900, originalPrice: 1100 }
    ],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 33,
    badge: "Heart & Eye Care",
    mizaj: "Balanced & Energizing"
  },
  {
    id: "murabba-harr",
    slug: "murabba-harr",
    name: "Harar Murabba – Natural Digestion & Constipation Relief",
    urduName: "",
    category: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    categoryUrdu: "",
    shortDescription: "Hand-picked yellow Harar fruits in sweet herbal syrup. Pakistan's most famous natural remedy for chronic constipation and gas.",
    fullDescription: "Harar is known across Eastern medicine as the king of digestive herbs. Our Harar Murabba is prepared from tender yellow fruits that gently clear the stomach, relieve constipation without pain, and stop uncomfortable gas.",
    traditionalPurpose: "Relieves chronic constipation, stops bloating and gas, and keeps bowel movements easy and regular.",
    benefits: [
      "Gentle, natural relief for constipation without habit-forming drugs",
      "Clears out trapped gas and uncomfortable stomach heaviness",
      "Cleanses the intestines naturally for better appetite",
      "Safe and gentle for long-term everyday health"
    ],
    ingredients: [
      { name: "Yellow Harar (Chebulic Myrobalan)", role: "Natural digestive cleaner" },
      { name: "Rose Water Infusion", role: "Gentle intestinal soother" },
      { name: "Pure Cane Syrup", role: "Sweet base" }
    ],
    howToUse: "Eat 1 piece at night before sleeping, with a cup of warm water. Chew the fruit flesh well and discard the hard inner seed.",
    dosage: "1 piece every night.",
    hakimAdvice: "Always chew the soft outer fruit well and throw away the inner hard seed before swallowing.",
    price: 300,
    originalPrice: 380,
    discountPercentage: 21,
    image: "/images/e659f7b3-f3d2-46c9-8e26-89b51aafd1f8-1769554004.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 300, originalPrice: 380 },
      { name: "Medium Jar", weight: "500g", price: 580, originalPrice: 700 },
      { name: "Family Pack", weight: "1kg", price: 1100, originalPrice: 1350 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 57,
    badge: "Digestion King",
    mizaj: "Balanced & Cleansing"
  },
  {
    id: "murabba-belgiri",
    slug: "murabba-belgiri",
    name: "Belgiri Murabba – Bael Fruit for Loose Motions & Sensitive Gut",
    urduName: "",
    category: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    categoryUrdu: "",
    shortDescription: "Traditional Bael fruit slices in syrup, specially made for sensitive stomachs, loose motions, and gut cramps.",
    fullDescription: "Belgiri (Bael / Wood Apple) is celebrated for its soothing effect on an upset stomach. It naturally calms loose motions, soothes intestinal inflammation, and helps sensitive stomachs handle food comfortably.",
    traditionalPurpose: "Calms loose motions, soothes irritable bowel discomfort, and restores normal gut comfort.",
    benefits: [
      "Quickly calms loose motions and stomach cramping",
      "Soothes the delicate stomach lining naturally",
      "Great for summer stomach upsets and sensitive digestion",
      "Full of natural plant fibers"
    ],
    ingredients: [
      { name: "Fresh Belgiri Slices (Bael Fruit)", role: "Stomach soother & natural binder" },
      { name: "Cardamom & Pure Cane Syrup", role: "Cooling sweet base" }
    ],
    howToUse: "Eat 1 to 2 pieces twice a day between meals.",
    dosage: "1 to 2 slices daily.",
    hakimAdvice: "Very helpful for anyone who gets sudden stomach urgency or loose motions after eating oily food.",
    price: 250,
    originalPrice: 320,
    discountPercentage: 22,
    image: "/images/Gemini_Generated_Image_b3jbujb3jbujb3jb.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 320 },
      { name: "Medium Jar", weight: "500g", price: 480, originalPrice: 600 },
      { name: "Family Pack", weight: "1kg", price: 950, originalPrice: 1150 }
    ],
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 29,
    badge: "Gut Health",
    mizaj: "Cooling & Soothing"
  },
  {
    id: "apple-murabba",
    slug: "apple-murabba",
    name: "Apple Murabba – Kashmiri Apple Heart & Mood Tonic",
    urduName: "",
    category: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    categoryUrdu: "",
    shortDescription: "Whole crisp Kashmiri mountain apples cooked with cardamom and silver foil for heart freshness, calm nerves, and natural energy.",
    fullDescription: "Made from fresh mountain apples, Apple Murabba is one of the classic mood-lifting foods of traditional medicine. It comforts the heart, eases tension and worry, and restores natural energy after tiredness or fever.",
    traditionalPurpose: "Helps calm fast heartbeats (palpitations), relieves mental stress, and builds energy back after illness.",
    benefits: [
      "Naturally lifts your mood and comforts a racing heart",
      "Helps you bounce back quickly after feeling weak or sick",
      "Rich in natural fruit pectin and minerals",
      "Delicious and gentle for both children and elders"
    ],
    ingredients: [
      { name: "Crisp Kashmiri Apples", role: "Fresh heart tonic fruit" },
      { name: "Pure Edible Silver Foil (Warq)", role: "Traditional nerve support" },
      { name: "Cardamom & Rose Water", role: "Pleasant scent & digestion" }
    ],
    howToUse: "Eat 1 whole apple piece in the morning with your breakfast.",
    dosage: "1 piece daily.",
    hakimAdvice: "Taking Apple Murabba in the morning on an empty stomach gives wonderful freshness to both heart and mind.",
    price: 250,
    originalPrice: 320,
    discountPercentage: 22,
    image: "/images/Gemini_Generated_Image_5m6gwq5m6gwq5m6g-1.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 320 },
      { name: "Medium Jar", weight: "500g", price: 480, originalPrice: 600 },
      { name: "Family Pack", weight: "1kg", price: 900, originalPrice: 1100 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 42,
    badge: "Heart & Mood",
    mizaj: "Refreshing & Balanced"
  },
  {
    id: "behi-murabba",
    slug: "behi-murabba",
    name: "Behi Murabba – Quince Fruit Heart & Acidity Preserve",
    urduName: "",
    category: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    categoryUrdu: "",
    shortDescription: "A revered Quince fruit preserve (Safarjal) known for soothing chest heaviness, heart weakness, and stomach acid reflux.",
    fullDescription: "Quince (Behi / Safarjal) is praised across Eastern history as a special fruit for the heart. Our Behi Murabba forms a gentle coating over an irritated stomach to stop acid reflux and ease that uncomfortable burning feeling in your chest.",
    traditionalPurpose: "Supports heart strength, stops acid reflux and chest burning, and promotes gentle digestion.",
    benefits: [
      "Eases chest heaviness and gives natural comfort to the heart",
      "Creates a soothing shield over an acidic stomach lining",
      "A blessed traditional preserve with centuries of trust",
      "100% natural with no artificial food colors"
    ],
    ingredients: [
      { name: "Fresh Behi Fruit (Quince)", role: "Heart & stomach strengthening fruit" },
      { name: "Pure Saffron & Cardamom", role: "Gentle aromatic comfort" }
    ],
    howToUse: "Eat 1 to 2 slices 30 minutes before your morning breakfast.",
    dosage: "1 to 2 slices daily.",
    hakimAdvice: "Great for anyone who suffers from acid reflux or chest tightness during busy, stressful days.",
    price: 250,
    originalPrice: 340,
    discountPercentage: 26,
    image: "/images/Gemini_Generated_Image_1jlvon1jlvon1jlv-1.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 250, originalPrice: 340 },
      { name: "Medium Jar", weight: "500g", price: 490, originalPrice: 620 },
      { name: "Family Pack", weight: "1kg", price: 950, originalPrice: 1200 }
    ],
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 38,
    badge: "Trusted Tradition",
    mizaj: "Soothing & Cooling"
  },
  {
    id: "murabba-baans",
    slug: "murabba-baans",
    name: "Murabba Baans – Bamboo Shoot Bone & Growth Preserve",
    urduName: "",
    category: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    categoryUrdu: "",
    shortDescription: "Tender edible bamboo shoots rich in natural minerals, supporting bone strength, growing children, and joint flexibility.",
    fullDescription: "Bamboo shoots are naturally packed with silica, calcium, and plant fibers. We cook fresh young shoots until soft and sweet, creating a unique nutritional preserve for growing youngsters, strong bones, and healthy joints.",
    traditionalPurpose: "Recommended for growing teenagers, strong posture, bone density, and flexible joints.",
    benefits: [
      "Packed with natural silica and calcium for bones and joints",
      "Traditional nutrition for children and teenagers during growth spurts",
      "High natural fiber for smooth digestion",
      "Prepared in small, fresh hygienic batches"
    ],
    ingredients: [
      { name: "Tender Bamboo Shoots (Konpal Baans)", role: "Natural source of plant silica & minerals" },
      { name: "Pure Sweet Medium", role: "Clean preservation" }
    ],
    howToUse: "Eat 1 to 2 pieces in the morning with a cup of warm milk.",
    dosage: "1 to 2 pieces daily.",
    hakimAdvice: "Pairs wonderfully with light morning stretching and active play for growing children and teenagers.",
    price: 450,
    originalPrice: 500,
    discountPercentage: 11,
    image: "/images/Gemini_Generated_Image_jqpq4wjqpq4wjqpq-1.png",
    sizes: [
      { name: "Small Jar", weight: "250g", price: 450, originalPrice: 500 },
      { name: "Medium Jar", weight: "500g", price: 880, originalPrice: 980 },
      { name: "Family Pack", weight: "1kg", price: 1700, originalPrice: 1900 }
    ],
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 24,
    badge: "Bone & Growth",
    mizaj: "Balanced & Nutritious"
  },
  {
    id: "herbo-silk-shampoo",
    slug: "herbo-silk-shampoo",
    name: "Herbo Silk Shampoo – Pure Herbal Hair Cleanser",
    urduName: "",
    category: "hair-skin",
    categoryLabel: "Hair & Skin Care",
    categoryUrdu: "",
    shortDescription: "Chemical-free herbal hair wash made with Shikakai, Amla, Reetha, and Methi for strong roots, less hair fall, and natural shine.",
    fullDescription: "Herbo Silk Shampoo combines ancient herbal hair cleansers into a gentle everyday wash. Made without harsh sulfates (SLS/SLES), parabens, or artificial dyes, it cleans your scalp gently without drying it out, leaving hair soft, shiny, and strong.",
    traditionalPurpose: "Cleans the scalp, reduces dandruff, strengthens weak roots, and adds natural softness and shine.",
    benefits: [
      "100% Sulfate-free, Paraben-free, and Silicone-free",
      "Shikakai and Reetha create a gentle, natural herbal lather",
      "Amla and Methi nourish roots to reduce everyday hair fall",
      "Leaves hair bouncy, soft, and easy to comb"
    ],
    ingredients: [
      { name: "Amla Extract", role: "Nourishes roots with Vitamin C" },
      { name: "Shikakai", role: "Natural gentle cleanser and softener" },
      { name: "Reetha (Soapnut)", role: "Creates natural herbal foam" },
      { name: "Fenugreek Seeds (Methi)", role: "Locks in moisture and shines hair" }
    ],
    howToUse: "Wet hair thoroughly. Massage a small amount into scalp for 2 minutes, then rinse well with clean water.",
    dosage: "Use 2 to 3 times a week.",
    hakimAdvice: "For dry or frizzy hair, apply a few drops of pure almond or mustard oil to hair ends 1 hour before washing.",
    price: 300,
    originalPrice: 400,
    discountPercentage: 25,
    image: "/images/Herbalista-Viral-Herbal-Hair-Care-Bundle-E2-80-93-Shampoo-Conditioner-Set-1000ml-33_8-fl-oz-Each-E2-.jpg",
    sizes: [
      { name: "Standard Bottle", weight: "200ml", price: 300, originalPrice: 400 },
      { name: "Family Bottle", weight: "500ml", price: 650, originalPrice: 850 }
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 55,
    badge: "Chemical Free",
    mizaj: "Gentle & Nourishing"
  },
  {
    id: "juniper-berries",
    slug: "juniper-berries",
    name: "Juniper Berries – Whole Natural Berries (Hab-ul-Ar'ar)",
    urduName: "",
    category: "herbs-seeds",
    categoryLabel: "Whole Herbs & Seeds",
    categoryUrdu: "",
    shortDescription: "Aromatic whole dried Juniper berries for urinary comfort, clearing chest congestion, and making wellness teas.",
    fullDescription: "Known traditionally as Hab-ul-Ar'ar. Sourced from clean mountain harvests, these dried berries are rich in aromatic natural oils that help flush the urinary tract and bring soothing warmth to the chest.",
    traditionalPurpose: "Supports smooth urinary flow, reduces water retention, and eases chest tightness when brewed as tea.",
    benefits: [
      "Natural herbal support for healthy urine flow and kidney cleansing",
      "Aromatic oils help clear phlegm and chest tightness",
      "Can easily be brewed into a warm, pleasant herbal tea",
      "100% clean, pure, unadulterated whole berries"
    ],
    ingredients: [
      { name: "Whole Juniper Berries", role: "Pure single botanical" }
    ],
    howToUse: "Crush 5 to 7 berries lightly and steep in 1 cup of hot boiling water for 10 minutes. Strain and sip warm.",
    dosage: "1 cup of tea once daily.",
    hakimAdvice: "Consult with our Hakim before taking if you are pregnant or have severe kidney problems.",
    price: 250,
    originalPrice: 500,
    discountPercentage: 50,
    image: "/images/Juniper-Berries-002.jpg.webp",
    sizes: [
      { name: "Trial Pouch", weight: "100g", price: 250, originalPrice: 500 },
      { name: "Standard Pouch", weight: "250g", price: 550, originalPrice: 900 },
      { name: "Large Bag", weight: "500g", price: 1000, originalPrice: 1600 }
    ],
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 22,
    badge: "50% Off",
    mizaj: "Warm & Clearing"
  },
  {
    id: "absinthe-herb",
    slug: "absinthe-herb",
    name: "Afsanteen Herb – Whole Artemisia Leaf",
    urduName: "",
    category: "herbs-seeds",
    categoryLabel: "Whole Herbs & Seeds",
    categoryUrdu: "",
    shortDescription: "Pure dried Afsanteen herb for liver cleansing, better digestion, and expelling stomach worms.",
    fullDescription: "Afsanteen is famous for its bitter taste that naturally stimulates digestion. It triggers healthy digestive juices, supports a sluggish liver, and helps clear stomach parasites.",
    traditionalPurpose: "Traditional bitter herb for liver care, poor appetite, and intestinal detox.",
    benefits: [
      "Powerful bitter tonic for sluggish digestion and liver support",
      "Helps improve low appetite and food digestion",
      "Traditional help against stomach worms",
      "Cleaned and sun-dried carefully to retain potency"
    ],
    ingredients: [
      { name: "Afsanteen Herb (Artemisia)", role: "Pure organic bitter herb" }
    ],
    howToUse: "Boil 1 teaspoon in 1.5 cups of water until 1 cup remains. Strain and drink in the morning.",
    dosage: "1 small cup daily.",
    hakimAdvice: "Because of its strong bitter taste, you can add a spoon of honey or a splash of rose water before drinking.",
    price: 500,
    originalPrice: 1000,
    discountPercentage: 50,
    image: "/images/Gemini_Generated_Image_oeeza4oeeza4oeez.jpg",
    sizes: [
      { name: "Small Pouch", weight: "100g", price: 500, originalPrice: 1000 },
      { name: "Standard Pouch", weight: "250g", price: 1000, originalPrice: 1800 }
    ],
    inStock: true,
    featured: false,
    rating: 4.9,
    reviewCount: 19,
    badge: "Pure Raw Herb",
    mizaj: "Warm & Bitter"
  },
  {
    id: "curry-leaf-tea",
    slug: "curry-leaf-tea",
    name: "Curry Leaf Herbal Tea – Caffeine-Free Infusion",
    urduName: "",
    category: "teas-vitality",
    categoryLabel: "Wellness Teas & Energy Mixes",
    categoryUrdu: "",
    shortDescription: "A fresh, caffeine-free herbal tea rich in iron and antioxidants, supporting healthy sugar levels and light digestion.",
    fullDescription: "Hand-picked from organic curry leaf plants and dried gently to keep all the natural aroma and nutrients intact. A wonderful, soothing hot drink after heavy meals to ease digestion and stay light.",
    traditionalPurpose: "Helps maintain healthy blood sugar, aids easy digestion, and supports hemoglobin.",
    benefits: [
      "100% Caffeine-free – enjoy anytime day or night",
      "Rich in natural iron and healthy plant antioxidants",
      "Helps you feel light and comfortable after heavy meals",
      "Pleasant herbal aroma with a warm, mild taste"
    ],
    ingredients: [
      { name: "Dried Curry Leaves", role: "Natural antioxidant leaf" },
      { name: "Cinnamon Touch", role: "Gentle warmth and flavor" }
    ],
    howToUse: "Steep 1 tablespoon in a cup of boiling water for 5 minutes. Strain and sip warm.",
    dosage: "1 to 2 cups daily after meals.",
    hakimAdvice: "Drinking a warm cup 20 minutes after lunch or dinner helps avoid that heavy, sleepy feeling.",
    price: 350,
    originalPrice: 450,
    discountPercentage: 22,
    image: "/images/Curry-Leaf-Tea_-A-Caffeine-Free-Herbal-Treasure.jpg",
    sizes: [
      { name: "Small Pouch", weight: "100g", price: 350, originalPrice: 450 },
      { name: "Large Pouch", weight: "200g", price: 650, originalPrice: 850 }
    ],
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 28,
    badge: "Caffeine Free",
    mizaj: "Balanced & Refreshing"
  },
  {
    id: "shahi-maghaz-mix",
    slug: "shahi-maghaz-mix",
    name: "Shahi Dry Fruit & Super Seeds Vitality Mix",
    urduName: "",
    category: "teas-vitality",
    categoryLabel: "Wellness Teas & Energy Mixes",
    categoryUrdu: "",
    shortDescription: "A premium mix of almonds, walnuts, pumpkin seeds, chia, flaxseed, and Gond Kateera for brain power, stamina, and joints.",
    fullDescription: "A nutritious royal blend of the finest nuts and vitality seeds. Cleaned by hand and sealed airtight to keep every bite crisp and fresh. Perfect for students, working professionals, mothers, and elders looking for healthy daily energy.",
    traditionalPurpose: "Builds physical stamina, sharpens mental focus, and supports strong, well-lubricated joints.",
    benefits: [
      "Packed with natural plant protein, Omega-3s, and zinc",
      "Helps improve memory, mental alertness, and daily energy",
      "Gond Kateera and Chia help keep joints flexible and comfortable",
      "Zero added sugar, zero artificial preservatives, never fried"
    ],
    ingredients: [
      { name: "Sweet Kashmiri Almonds", role: "Brain and nerve nutrition" },
      { name: "Walnuts (Akhrot)", role: "Omega-3 for heart and brain" },
      { name: "Pumpkin & Flax Seeds", role: "Natural minerals & zinc" },
      { name: "Gond Kateera", role: "Hydration and stamina" }
    ],
    howToUse: "Eat 1 to 2 tablespoons in the morning with warm milk, or sprinkle over yogurt or oatmeal.",
    dosage: "2 tablespoons (around 30g) daily.",
    hakimAdvice: "Soaking 2 tablespoons in half a glass of milk or water overnight makes it super soft and easy to digest in the morning.",
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
    badge: "Super Energy",
    mizaj: "Nutrient Rich"
  }
];

export const CLINIC_INFO = {
  brandName: "Tameer-e-Sehat",
  clinicName: "Matab Tameer-e-sehat",
  brandUrdu: "",
  tagline: "35+ Years of Honest Herbal Care in Pakistan",
  taglineUrdu: "",
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
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Matab+Tameer-e-sehat+Plot+no+L+41+Korangi+Crossing+Rd+Karachi",
  googleShareUrl: "https://www.google.com/maps/search/?api=1&query=Matab+Tameer-e-sehat+Karachi",
  googleReviewUrl: "https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,",
  googleSearchUrl: "https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi",
};

export const TESTIMONIALS: Array<{
  id: number;
  name: string;
  city: string;
  text: string;
  concern: string;
  rating: number;
  verifiedPurchase: boolean;
}> = [];

export const CONSULTATION_AREAS = [
  {
    title: "Stomach, Gas & Liver Health",
    urduTitle: "",
    description: "Personal advice for indigestion, acid burning, fatty liver, bloating, and regular bowel movements through gentle herbal solutions.",
    icon: "Activity"
  },
  {
    title: "Joint, Knee & Back Pain",
    urduTitle: "",
    description: "Natural remedies and herbal oils to ease stiff knees, backache, morning joint stiffness, and muscle tiredness.",
    icon: "Shield"
  },
  {
    title: "Everyday Energy & Stamina",
    urduTitle: "",
    description: "Nutritious dry fruit blends and herbal tonics to beat tiredness, brain fog, and low energy naturally.",
    icon: "Sun"
  },
  {
    title: "Skin, Hair & Scalp Care",
    urduTitle: "",
    description: "Natural herbal care for hair fall, dandruff, dry skin, and stubborn acne without harsh chemicals.",
    icon: "Sparkles"
  },
  {
    title: "Cough, Chest & Seasonal Allergies",
    urduTitle: "",
    description: "Soothing herbal teas and natural extracts to clear chest phlegm, ease seasonal coughs, and stay healthy.",
    icon: "Wind"
  },
  {
    title: "Private Men's & Women's Health",
    urduTitle: "",
    description: "Completely private, confidential consultations with our experienced Hakim regarding your personal wellness.",
    icon: "Heart"
  }
];
