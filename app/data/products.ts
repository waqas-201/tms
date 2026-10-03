import migratedProductsData from "./migrated-products.json";

export interface ProductSize {
  id?: string;
  name: string;
  weight: string;
  price: number;
  originalPrice?: number;
  unitId?: string | null;
  unit?: { id: string; code: string; name: string; kind: string } | null;
  quantityValue?: number | null;
  sku?: string | null;
  stockOnHand?: number;
  stockReserved?: number;
  available?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  urduName: string;
  category: "murabbajaat" | "arqiyat" | "oils-marham" | "herbs-seeds" | "teas-vitality" | "hair-skin" | "herbs" | string;
  categoryId?: string;
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
  tags?: string[];
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
    id: "herbs",
    slug: "herbs",
    name: "Herbs & Botanicals",
    urduName: "جڑی بوٹیاں",
    description: "Authentic single herbs, wild-crafted roots, barks, and therapeutic botanicals.",
    heroImage: "/images/products/8669_0_Gemini_Generated_Image_jihhirjihhirjihh-1.png",
    productCount: 150,
  },
  {
    id: "herbs-seeds",
    slug: "herbs-seeds",
    name: "Herbal Seeds & Kernels",
    urduName: "تخم و بیج",
    description: "Pure medicinal seeds, carom seeds, flax seeds, and aromatic culinary spices.",
    heroImage: "/images/products/8683_0_ajwain.jpg",
    productCount: 85,
  },
  {
    id: "murabbajaat",
    slug: "murabbajaat",
    name: "Murabbajaat (Preserves)",
    urduName: "مربہ جات",
    description: "Traditional Unani preserves cooked in pure raw honey and organic syrups.",
    heroImage: "/images/products/8697_0_22872588-58f4-46b3-ae27-879248c546d6_0.jpg",
    productCount: 45,
  },
  {
    id: "oils-marham",
    slug: "oils-marham",
    name: "Pure Oils & Balms",
    urduName: "روغنیات و مرہم",
    description: "Cold-pressed pure herbal oils, therapeutic massage liniments, and soothing balms.",
    heroImage: "/images/products/8669_1_Juniper-Berries-002.jpg.webp",
    productCount: 40,
  },
  {
    id: "arqiyat",
    slug: "arqiyat",
    name: "Arqiyat (Distillates)",
    urduName: "عرقیات خالص",
    description: "Triple-distilled therapeutic botanical waters and calming floral extracts.",
    heroImage: "/images/products/8677_0_Gemini_Generated_Image_oeeza4oeeza4oeez.jpg",
    productCount: 30,
  },
  {
    id: "teas-vitality",
    slug: "teas-vitality",
    name: "Vitality & Dry Fruits",
    urduName: "خشک میوہ جات و مقویات",
    description: "Premium dry fruit tonics, herbal vitality teas, and rejuvenative blends.",
    heroImage: "/images/products/8690_0_Gemini_Generated_Image_itgvutitgvutitgv.jpg",
    productCount: 35,
  },
];

export const PRODUCTS: Product[] = (migratedProductsData as unknown) as Product[];

export const CLINIC_INFO = {
  brandName: "Tameer-e-Sehat",
  clinicName: "Matab Tameer-e-sehat",
  brandUrdu: "تعمیرِ صحت مطب و دواخانہ",
  tagline: "35+ Years of Honest Herbal Care in Pakistan",
  taglineUrdu: "پاکستان میں ۳۵ سال سے مخلص اور مستند حکمت",
  establishedYear: 1990,
  experienceYears: 35,
  botanicalsCount: "500+",
  patientsServed: "150,000+",
  address: "Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi, Karachi, Pakistan",
  city: "Karachi",
  country: "Pakistan",
  phone: "0318-2311310",
  phoneFormatted: "+92 318 2311310",
  whatsappNumber: "923353547888",
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

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Muhammad Usman",
    city: "Karachi",
    text: "Ordered Juniper Berries and Ajwain Desi. The purity, aroma, and packaging quality are exceptional. Received COD delivery within 24 hours.",
    concern: "Digestive Care",
    rating: 5,
    verifiedPurchase: true,
  },
  {
    id: 2,
    name: "Syeda Fatima",
    city: "Lahore",
    text: "Amaltas pulp worked wonders for chronic constipation where commercial syrups failed. Genuine unadulterated herbs.",
    concern: "Constipation Relief",
    rating: 5,
    verifiedPurchase: true,
  },
];

export const CONSULTATION_AREAS = [
  {
    title: "Stomach, Gas & Liver Health",
    urduTitle: "معدہ، گیس اور جگر کے امراض",
    description: "Personal advice for indigestion, acid burning, fatty liver, bloating, and regular bowel movements through gentle herbal solutions.",
    icon: "Activity"
  },
  {
    title: "Joint, Knee & Back Pain",
    urduTitle: "جوڑوں، گھٹنوں اور کمر کا درد",
    description: "Natural remedies and herbal oils to ease stiff knees, backache, morning joint stiffness, and muscle tiredness.",
    icon: "Shield"
  },
  {
    title: "Everyday Energy & Stamina",
    urduTitle: "جسمانی کمزوری اور قوتِ مدافعت",
    description: "Nutritious dry fruit blends and herbal tonics to beat tiredness, brain fog, and low energy naturally.",
    icon: "Sun"
  },
  {
    title: "Skin, Hair & Scalp Care",
    urduTitle: "جلد اور بالوں کی حفاظت",
    description: "Natural herbal care for hair fall, dandruff, dry skin, and stubborn acne without harsh chemicals.",
    icon: "Sparkles"
  },
  {
    title: "Cough, Chest & Seasonal Allergies",
    urduTitle: "کھانسی، نزلہ اور موسمی الرجیز",
    description: "Soothing herbal teas and natural extracts to clear chest phlegm, ease seasonal coughs, and stay healthy.",
    icon: "Wind"
  },
  {
    title: "Private Men's & Women's Health",
    urduTitle: "مردانہ و نسوانی پوشیدہ مسائل",
    description: "Completely private, confidential consultations with our experienced Hakim regarding your personal wellness.",
    icon: "Heart"
  }
];
