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
  category: "murabbajaat" | "arqiyat" | "oils-marham" | "herbs-seeds" | "teas-vitality" | "hair-skin" | string;
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

// Dynamic e-commerce: live data is served from database via /api/products and /api/categories.
// Fallback empty collections for types & safety.
export const CATEGORIES: CategoryInfo[] = [];
export const PRODUCTS: Product[] = [];

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
