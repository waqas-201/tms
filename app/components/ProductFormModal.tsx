"use client";

import React, { useState, useEffect } from "react";
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

const POPULAR_BENEFITS = [
  "100% Pure & Natural Botanical Formula",
  "Free from Artificial Chemicals & Preservatives",
  "Supports Natural Digestion & Gut Health",
  "Rich in Natural Bio-Antioxidants & Vitamins",
  "Strengthens Physical Stamina & Daily Vitality",
  "Promotes Heart, Brain & Memory Health",
  "Soothes Joint Stiffness & Aches",
  "Prepared under Qualified Supervision",
];

const PRESET_BADGES = [
  "Best Seller",
  "100% Organic",
  "Featured",
  "Hot Deal",
  "Pure Herbal",
  "Traditional Formula",
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

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    urduName: "",
    slug: "",
    categoryId: "murabbajaat",
    categoryLabel: "Herbal Preserves (Murabba)",
    badge: "",
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
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [unitsRes, catsRes] = await Promise.all([
          fetch("/api/units"),
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
    }

    if (isOpen) {
      loadMetadata();
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
        if (typeof initialProduct.image === "string" && (initialProduct.image.startsWith("[") || initialProduct.image.startsWith("{"))) {
          try {
            const parsed = JSON.parse(initialProduct.image);
            if (Array.isArray(parsed)) {
              initialGallery = parsed.filter(Boolean);
            }
          } catch {}
        }
        if (initialGallery.length === 0 && typeof initialProduct.image === "string" && initialProduct.image.trim()) {
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
              quantityValue: s.quantityValue !== undefined && s.quantityValue !== null ? String(s.quantityValue) : undefined,
              initialStock: s.stockOnHand !== undefined ? String(s.stockOnHand) : "20",
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
    } else {
      // New product defaults
      setFormData({
        name: "",
        urduName: "",
        slug: "",
        categoryId: "murabbajaat",
        categoryLabel: "Herbal Preserves (Murabba)",
        badge: "",
        shortDescription: "",
        fullDescription: "",
        howToUse: "Take 1 teaspoon (approx 5g) 1-2 times daily with warm water or milk.",
        dosage: "1 teaspoon (approx 5g)",
        featured: false,
      });
      setGallery([]);
      setBenefitsList([
        "100% Pure & Natural Botanical Formula",
        "Free from Artificial Chemicals & Preservatives",
        "Supports Natural Digestion & Gut Health",
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
    }
    setError(null);
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter the Product Title / Name.");
      return;
    }

    if (gallery.length === 0) {
      setError("Please upload or add at least one product photo for the gallery.");
      return;
    }

    if (variantsList.length === 0) {
      setError("Please add at least one packaging variant.");
      return;
    }

    for (let i = 0; i < variantsList.length; i++) {
      const v = variantsList[i];
      if (!v.price || isNaN(Number(v.price)) || Number(v.price) <= 0) {
        setError(`Variant #${i + 1} (${v.name || "Unnamed"}) requires a valid selling price.`);
        return;
      }
    }

    const minVariantPrice = Math.min(...variantsList.map((v) => Number(v.price) || 999999));
    const effectiveBasePrice = minVariantPrice < 999999 ? minVariantPrice : Number(variantsList[0].price);

    // Primary cover image is the first in the gallery
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
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim(),
        howToUse: formData.howToUse.trim(),
        dosage: formData.dosage.trim(),
        image: primaryImage,
        images: gallery,
        featured: formData.featured,
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
          isActive: v.isActive ?? true,
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
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in">
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#22623a]">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-xs text-[#6a6660]">
                Standard e-commerce product details, multi-image gallery, packaging units & stock.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-7 text-xs">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span className="font-medium text-xs leading-relaxed">{error}</span>
            </div>
          )}

          {/* SECTION 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e6dfd5] pb-2">
              <Layers className="w-4 h-4 text-[#22623a]" />
              <h3 className="font-bold text-[#22623a] text-sm">1. Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#1a1816] flex items-center justify-between">
                  <span>Product Title / Name <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-[#6a6660] font-normal">e.g. Pure Himalayan Shilajit</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter full product name in English"
                  className="w-full text-xs p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* Urdu Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1a1816] flex items-center justify-between">
                  <span>Urdu Title (Optional)</span>
                  <span className="text-[11px] text-[#6a6660] font-normal">اردو نام</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.urduName}
                  onChange={(e) => setFormData({ ...formData, urduName: e.target.value })}
                  placeholder="مثلاً: خالص سلاجیت پہاڑی"
                  className="w-full text-xs p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white font-serif transition-all shadow-xs text-right"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1a1816]">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  className="w-full text-xs p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all shadow-xs"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.urduName ? `(${cat.urduName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1a1816] flex items-center justify-between">
                  <span>URL Slug</span>
                  <span className="text-[10px] text-[#6a6660] font-mono">/products/[slug]</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-product-slug"
                  className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] font-mono focus:outline-none focus:border-[#22623a] focus:bg-white transition-all"
                />
              </div>

              {/* Product Badge / Ribbon */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1a1816] flex items-center justify-between">
                  <span>Badge / Ribbon (Optional)</span>
                  <span className="text-[10px] text-[#6a6660]">e.g. Best Seller, 100% Organic</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Custom badge text or click suggestion"
                    className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all"
                  />
                  <div className="flex flex-wrap gap-1">
                    {PRESET_BADGES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFormData({ ...formData, badge: b })}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                          formData.badge === b
                            ? "bg-[#22623a] text-white border-[#22623a] font-semibold"
                            : "bg-white text-[#6a6660] border-[#e6dfd5] hover:border-[#c59b27]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                    {formData.badge && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, badge: "" })}
                        className="text-[10px] px-1.5 py-0.5 text-red-600 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Product Checkbox */}
            <div className="pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-[#faf8f5] p-3 rounded-xl border border-[#e6dfd5] hover:border-[#22623a] transition-all">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#22623a] focus:ring-[#22623a] border-gray-300"
                />
                <span className="font-semibold text-xs text-[#22623a] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#c59b27] fill-[#c59b27]" />
                  Feature on Homepage & Spotlight Carousels
                </span>
              </label>
            </div>
          </div>

          {/* SECTION 2: Multi-Image Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#22623a]" />
                <h3 className="font-bold text-[#22623a] text-sm">2. Product Image Gallery</h3>
              </div>
              <span className="text-[11px] text-[#6a6660]">
                {gallery.length} image{gallery.length === 1 ? "" : "s"} added (first image is primary cover)
              </span>
            </div>

            {/* Gallery Thumbnails List */}
            {gallery.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {gallery.map((imgUrl, index) => {
                    const isCover = index === 0;
                    return (
                      <div
                        key={`${imgUrl}-${index}`}
                        className={`relative group rounded-xl border overflow-hidden bg-[#faf8f5] aspect-square flex flex-col justify-between transition-all ${
                          isCover
                            ? "border-2 border-[#22623a] ring-2 ring-[#22623a]/15 shadow-sm"
                            : "border-[#e6dfd5] hover:border-[#c59b27]"
                        }`}
                      >
                        {/* Image */}
                        <div className="relative w-full h-full">
                          <Image
                            src={imgUrl}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-contain p-1"
                          />
                        </div>

                        {/* Top Badge */}
                        <div className="absolute top-1 left-1 right-1 flex items-center justify-between pointer-events-none">
                          {isCover ? (
                            <span className="bg-[#22623a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                              ⭐ Cover
                            </span>
                          ) : (
                            <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs">
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
                              title="Delete image"
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() => makeCoverImage(index)}
                                className="text-[10px] font-bold bg-[#22623a] text-white px-2 py-1 rounded hover:bg-[#1b502e] w-full text-center transition-colors"
                              >
                                Set Cover
                              </button>
                            ) : (
                              <span className="text-[10px] text-white/90 text-center w-full font-medium">
                                Primary Cover
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* UploadDropzone (Multi-Image) & URL Input */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Dropzone */}
              <div className="md:col-span-8 bg-[#faf8f5] p-4 rounded-xl border border-dashed border-[#c59b27] text-center space-y-2">
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
                    button: "bg-[#22623a] hover:bg-[#1b502e] text-xs font-semibold py-2 px-4 rounded-lg shadow-xs",
                    container: "border-none p-1",
                    label: "text-xs font-medium text-[#22623a]",
                    allowedContent: "text-[10px] text-[#6a6660]",
                  }}
                />
                {uploadSuccessCount !== null && (
                  <p className="text-[#2d7648] font-semibold flex items-center justify-center gap-1 text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Added {uploadSuccessCount} image(s) to gallery!
                  </p>
                )}
              </div>

              {/* URL or Preset Input */}
              <div className="md:col-span-4 bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5] space-y-3">
                <label className="text-xs font-semibold text-[#1a1816] block">
                  Add via Image URL:
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://... or /images/1-scaled.png"
                    className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="w-full py-2 bg-white hover:bg-[#22623a] hover:text-white border border-[#22623a] text-[#22623a] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Gallery</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#e6dfd5] space-y-1">
                  <span className="text-[10px] text-[#6a6660] block font-medium">Quick sample images:</span>
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
                        className="text-[10px] px-2 py-0.5 bg-white border border-[#e6dfd5] hover:border-[#c59b27] rounded text-[#6a6660]"
                      >
                        {preset.replace("/images/", "")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Descriptions & Key Highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e6dfd5] pb-2">
              <Sparkles className="w-4 h-4 text-[#22623a]" />
              <h3 className="font-bold text-[#22623a] text-sm">3. Descriptions & Key Highlights</h3>
            </div>

            <div className="space-y-4">
              {/* Short Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1a1816] flex items-center justify-between">
                  <span>Short Summary / Subtitle</span>
                  <span className="text-[10px] text-[#6a6660]">Shown on catalog cards and product overview</span>
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="e.g. 100% pure steam distillate of fresh botanical flowers for liver and skin."
                  className="w-full text-xs p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1a1816]">
                  Full Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Describe the product formulation, natural ingredients, health benefits, and botanical qualities..."
                  className="w-full text-xs p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* Key Benefits (Chips) */}
              <div className="space-y-2 bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5]">
                <label className="text-xs font-semibold text-[#1a1816] flex items-center justify-between">
                  <span>Key Product Benefits & Highlights</span>
                  <span className="text-[10px] text-[#6a6660]">{benefitsList.length} highlights added</span>
                </label>

                {/* Input row */}
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
                    placeholder="Type a key benefit & press enter (e.g. Cleanses liver and flushes internal toxins)"
                    className="flex-1 text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                  />
                  <button
                    type="button"
                    onClick={() => addBenefit(newBenefitInput)}
                    className="px-4 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-xl text-xs flex items-center gap-1 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Current Chips */}
                {benefitsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {benefitsList.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#22623a]/30 rounded-lg text-xs font-medium text-[#22623a] shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-[#2d7648]" />
                        <span>{b}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(i)}
                          className="text-[#6a6660] hover:text-red-600 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Popular Benefit Suggestions */}
                <div className="pt-2 border-t border-[#e6dfd5] space-y-1">
                  <span className="text-[10px] text-[#6a6660] font-medium block">Click to add popular highlights:</span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_BENEFITS.filter((b) => !benefitsList.includes(b)).slice(0, 5).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => addBenefit(b)}
                        className="text-[10px] px-2 py-0.5 bg-white border border-[#e6dfd5] hover:border-[#c59b27] hover:text-[#22623a] rounded-md text-[#6a6660] transition-all flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* How to Use / Dosage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    How to Use / Directions
                  </label>
                  <input
                    type="text"
                    value={formData.howToUse}
                    onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                    placeholder="e.g. Take in the morning on empty stomach with lukewarm milk."
                    className="w-full text-xs p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 1 teaspoon (5g) twice daily"
                    className="w-full text-xs p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Packaging Variants & Live Stock */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#22623a]" />
                <h3 className="font-bold text-[#22623a] text-sm">
                  4. Packaging Variants & Live Stock
                </h3>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1.5 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <p className="text-[11px] text-[#6a6660]">
              Define size options (e.g. 250g, 500g, 1000ml) with selling prices, purchase costs, and initial stock quantities.
            </p>

            <div className="space-y-3">
              {variantsList.map((variant, index) => (
                <div
                  key={index}
                  className="bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5] hover:border-[#c59b27] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#22623a] text-white text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-xs text-[#22623a]">
                        {variant.name || `Variant #${index + 1}`} ({variant.weight || "Standard"})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {variantsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          title="Remove variant"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Variant Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Variant Name
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                        placeholder="e.g. Standard Jar, 500ml Bottle"
                        className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* Quantity & Unit Selection */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Quantity & Unit
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={variant.quantityValue || ""}
                          onChange={(e) => handleVariantChange(index, "quantityValue", e.target.value)}
                          placeholder="500"
                          className="w-1/2 text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                        />
                        <select
                          value={variant.unitId || ""}
                          onChange={(e) => handleVariantChange(index, "unitId", e.target.value)}
                          className="w-1/2 text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                        >
                          <option value="">Unit...</option>
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
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Selling Price (PKR) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                        placeholder="1200"
                        className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold text-[#22623a] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* Regular / Original Price */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#6a6660]">
                        Regular Price (PKR) (Optional)
                      </label>
                      <input
                        type="number"
                        value={variant.originalPrice || ""}
                        onChange={(e) => handleVariantChange(index, "originalPrice", e.target.value)}
                        placeholder="1500 (strikethrough)"
                        className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#6a6660] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* Cost Price */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#6a6660]">
                        Cost / Purchase Price (PKR)
                      </label>
                      <input
                        type="number"
                        value={variant.costPrice || ""}
                        onChange={(e) => handleVariantChange(index, "costPrice", e.target.value)}
                        placeholder="600 (for margin calculation)"
                        className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#6a6660] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* Initial Stock On Hand */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Initial Stock on Hand
                      </label>
                      <input
                        type="number"
                        value={variant.initialStock || "0"}
                        onChange={(e) => handleVariantChange(index, "initialStock", e.target.value)}
                        placeholder="25"
                        className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] font-semibold focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* Low Stock Alert */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Low-Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        value={variant.lowStockThreshold || "5"}
                        onChange={(e) => handleVariantChange(index, "lowStockThreshold", e.target.value)}
                        placeholder="5"
                        className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    {/* SKU */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#6a6660]">
                        SKU (Auto or Custom)
                      </label>
                      <input
                        type="text"
                        value={variant.sku || ""}
                        onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                        placeholder="e.g. TMS-SHIL-500G"
                        className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-lg text-[#6a6660] font-mono focus:outline-none focus:border-[#22623a]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-[#e6dfd5] text-[#1a1816] hover:bg-white font-semibold text-xs transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {gallery.length > 0 && variantsList.length > 0 && (
              <span className="text-[11px] text-[#6a6660] hidden sm:inline">
                {gallery.length} image{gallery.length === 1 ? "" : "s"} &bull; {variantsList.length} variant{variantsList.length === 1 ? "" : "s"}
              </span>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#22623a] hover:bg-[#1b502e] text-[#c59b27] font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Update Product" : "Save & Publish Product"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
