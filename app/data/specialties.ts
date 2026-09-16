import {
  Activity,
  Shield,
  Sun,
  Sparkles,
  Wind,
  Heart,
  type LucideIcon,
} from "lucide-react";

export interface Specialty {
  id: string;
  title: string;
  urduTitle: string;
  tagline: string;
  icon: LucideIcon;
  symptoms: string[];
  treatmentCourse: string;
  recoveryTimeline: string;
  badge: string;
}

export const CLINICAL_SPECIALTIES: Specialty[] = [
  {
    id: "gastro-digestive",
    title: "Gastrointestinal & Acidity Clinic",
    urduTitle: "معدہ اور نظام انہضام",
    tagline: "Chronic acidity, heartburn, gas, constipation & IBS relief.",
    icon: Activity,
    symptoms: [
      "Stomach burning & acid reflux (GERD)",
      "Bloating & heavy digestion after meals",
      "IBS & chronic constipation",
    ],
    treatmentCourse: "Pure Hydro-Distillates (Arq Makoh & Kasni) + Harar Preserve",
    recoveryTimeline: "Relief in 7–14 days",
    badge: "Most Consulted",
  },
  {
    id: "joint-pain",
    title: "Joint, Knee & Spine Recovery",
    urduTitle: "جوڑوں، گھٹنوں اور کمر کا درد",
    tagline: "Natural pain relief & lubrication for stiff knees, back & joints.",
    icon: Shield,
    symptoms: [
      "Knee joint friction & stairs difficulty",
      "Lower backache & morning stiffness",
      "Sciatica & nerve inflammation",
    ],
    treatmentCourse: "Cold-Pressed JointZen Herbal Oil + Herbal Bone Formula",
    recoveryTimeline: "Relief in 3–5 days",
    badge: "Top Rated",
  },
  {
    id: "liver-metabolism",
    title: "Liver Health & Metabolic Detox",
    urduTitle: "جگر کی صفائی اور گرمی کا علاج",
    tagline: "Clear liver heat, improve appetite, and eliminate toxins.",
    icon: Sun,
    symptoms: [
      "Sluggish liver & fatty liver symptoms",
      "Excess body heat (Garam Mizaj) & burning soles",
      "Loss of natural appetite & dull skin",
    ],
    treatmentCourse: "Classical Steam Extracts (Arq Kasni & Makoh) + Blood Cleansers",
    recoveryTimeline: "21–30 Day Course",
    badge: "Tibbi Detox",
  },
  {
    id: "vitality-stamina",
    title: "Vitality, Energy & Brain Focus",
    urduTitle: "جسمانی توانائی اور دماغی طاقت",
    tagline: "Overcome chronic exhaustion, brain fog & low physical stamina.",
    icon: Sparkles,
    symptoms: [
      "Constant tiredness & afternoon crashes",
      "Brain fog & mental fatigue",
      "Post-illness physical recovery",
    ],
    treatmentCourse: "Shahi Dry Fruit & Vitality Mix + Amla Preserve",
    recoveryTimeline: "Stamina in 10–14 days",
    badge: "100% Herbal",
  },
  {
    id: "respiratory-allergies",
    title: "Chest, Cough & Seasonal Allergies",
    urduTitle: "نزلہ، زکام، کھانسی اور الرجی",
    tagline: "Clear chest congestion, dry coughs & allergy sensitivity.",
    icon: Wind,
    symptoms: [
      "Persistent dry cough & throat tickle",
      "Chest congestion & seasonal phlegm",
      "Morning sneezing & dust sensitivity",
    ],
    treatmentCourse: "Wild Herbal Tea Infusion + Soothing Chest Extracts",
    recoveryTimeline: "Comfort in 24–48 hrs",
    badge: "Non-Drowsy",
  },
  {
    id: "skin-hair-care",
    title: "Scalp, Hair Fall & Skin Health",
    urduTitle: "بالوں کا گرنا اور جلدی امراض",
    tagline: "Chemical-free herbal hair root strengthening & scalp care.",
    icon: Heart,
    symptoms: [
      "Excessive hair fall & weak roots",
      "Stubborn scalp dandruff & itching",
      "Dry skin patches & irritation",
    ],
    treatmentCourse: "Shikakai & Amla Wash (Herbo Silk) + Almond Scalp Oil",
    recoveryTimeline: "Strength in 3 weeks",
    badge: "Zero Chemicals",
  },
];
