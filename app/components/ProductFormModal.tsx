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
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

const DEFAULT_CATEGORIES = [
  { id: "murabbajaat", name: "Herbal Preserves (Murabba)" },
  { id: "arqiyat", name: "Pure Herbal Distillates (Arq)" },
  { id: "oils-marham", name: "Pain Relief Oils & Balms" },
  { id: "herbs-seeds", name: "Whole Herbs & Seeds" },
  { id: "teas-vitality", name: "Wellness Teas & Energy Mixes" },
  { id: "hair-skin", name: "Hair & Skin Care" },
];

const PRESET_BENEFITS = [
  "Rich in natural vitamins & antioxidants",
  "Soothes stomach heat, gas & acidity",
  "Strengthens heart and memory vitality",
  "Relieves joint pain and muscle stiffness",
  "Supports natural liver detoxification",
  "Boosts daily immune strength and energy",
  "100% pure herbal formulation without chemicals",
];

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

  const [formData, setFormData] = useState({
    name: "",
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
    inStock: true,
    featured: false,
  });

  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState("");

  const [ingredientsList, setIngredientsList] = useState<
    { name: string; role: string }[]
  >([]);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientRole, setNewIngredientRole] = useState("");

  const [sizesList, setSizesList] = useState<
    { name: string; weight: string; price: string; originalPrice?: string }[]
  >([]);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeWeight, setNewSizeWeight] = useState("");
  const [newSizePrice, setNewSizePrice] = useState("");

  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || "",
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
        inStock: initialProduct.inStock ?? true,
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
              name: s.name,
              weight: s.weight,
              price: String(s.price),
              originalPrice: s.originalPrice ? String(s.originalPrice) : "",
            }))
          : [
              {
                name: "Standard Pack",
                weight: "500g",
                price: initialProduct.price ? String(initialProduct.price) : "1200",
              },
            ]
      );
    } else {
      // Default initial state for new product
      setFormData({
        name: "",
        slug: "",
        categoryId: "murabbajaat",
        categoryLabel: "Herbal Preserves (Murabba)",
        price: "",
        originalPrice: "",
        badge: "100% Pure Herbs",
        mizaj: "Balanced & Cooling",
        shortDescription: "",
        traditionalPurpose: "",
        fullDescription: "",
        howToUse: "Take 1-2 tablespoons with water or warm milk daily.",
        dosage: "1-2 tablespoons once or twice daily after meals.",
        hakimAdvice: "Store in a cool, dry place. Keep container tightly sealed.",
        image: "/images/1-scaled.png",
        inStock: true,
        featured: false,
      });

      setBenefitsList([
        "Prepared with fresh natural ingredients",
        "Supports healthy digestion and vitality",
      ]);

      setIngredientsList([
        { name: "Pure Natural Herbs", role: "Primary active constituent" },
      ]);

      setSizesList([
        { name: "Standard Pack", weight: "500g", price: "" },
      ]);
    }

    setError(null);
    setUploadSuccess(false);
  }, [initialProduct, isOpen]);

  // Auto-generate slug when typing product name (if not editing an existing slug)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: isEditing
        ? prev.slug
        : val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      categoryLabel: cat?.name || catId,
    }));
  };

  const addBenefit = (text: string) => {
    const clean = text.trim();
    if (clean && !benefitsList.includes(clean)) {
      setBenefitsList([...benefitsList, clean]);
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
          role: newIngredientRole.trim() || "Natural botanical component",
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
    if (newSizeName.trim() && newSizePrice.trim()) {
      setSizesList([
        ...sizesList,
        {
          name: newSizeName.trim(),
          weight: newSizeWeight.trim() || newSizeName.trim(),
          price: newSizePrice.trim(),
        },
      ]);
      setNewSizeName("");
      setNewSizeWeight("");
      setNewSizePrice("");
    }
  };

  const removeSize = (index: number) => {
    setSizesList(sizesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Please enter the product name.");
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      setError("Please enter a valid base price in PKR.");
      return;
    }
    if (!formData.image) {
      setError("Please upload an image or provide an image URL.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        categoryId: formData.categoryId,
        categoryLabel: formData.categoryLabel,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        discountPercentage:
          formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
            ? Math.round(
                ((Number(formData.originalPrice) - Number(formData.price)) /
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
        inStock: formData.inStock,
        featured: formData.featured,
        benefits: benefitsList,
        ingredients: ingredientsList,
        sizes:
          sizesList.length > 0
            ? sizesList.map((s) => ({
                name: s.name,
                weight: s.weight,
                price: Number(s.price),
                originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
              }))
            : [
                {
                  name: "Standard Pack",
                  weight: "500g",
                  price: Number(formData.price),
                },
              ],
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
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-10 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#138833]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#138833] text-[#c59b27] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#138833]">
                {isEditing ? "Edit Product" : "Upload New Product"}
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                {isEditing
                  ? "Modify product details, pricing, stock, and descriptions."
                  : "Add a new natural remedy with images, sizes, and benefits."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#6a6660] hover:text-[#138833] hover:bg-[#e6dfd5]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Image Upload & Showcase */}
          <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e6dfd5] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#138833] flex items-center gap-1.5 text-sm">
                <ImageIcon className="w-4 h-4 text-[#c59b27]" />
                <span>Product Image</span>
              </h3>
              <div className="flex gap-1 bg-white p-0.5 rounded-md border border-[#e6dfd5]">
                <button
                  type="button"
                  onClick={() => setImageTab("upload")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    imageTab === "upload"
                      ? "bg-[#138833] text-white font-semibold"
                      : "text-[#6a6660] hover:text-[#138833]"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("url")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    imageTab === "url"
                      ? "bg-[#138833] text-white font-semibold"
                      : "text-[#6a6660] hover:text-[#138833]"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Preview Box */}
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

              {/* Upload Dropzone / URL Input */}
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
                        button: "bg-[#138833] hover:bg-[#0f7229] text-xs font-semibold py-2 px-4 rounded-md",
                        container: "border-none p-2",
                        label: "text-xs font-medium text-[#138833]",
                        allowedContent: "text-[10px] text-[#6a6660]",
                      }}
                    />
                    {uploadSuccess && (
                      <p className="text-[#1b993e] font-semibold flex items-center justify-center gap-1">
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
                      className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833]"
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
                          className="text-[10px] px-2 py-0.5 bg-[#faf8f5] hover:bg-[#e6dfd5] rounded text-[#138833] border border-[#e6dfd5]"
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

          {/* Section 2: Core Details & Pricing */}
          <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] space-y-4">
            <h3 className="font-bold text-[#138833] flex items-center gap-1.5 text-sm border-b border-[#f4eee5] pb-2">
              <Layers className="w-4 h-4 text-[#138833]" />
              <span>General Information & Category</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#1a1816]">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Kashmiri Amla Murabba in Honey"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833] font-medium"
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
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-medium"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Base Price (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 1200"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Original Price (PKR / Optional)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                  placeholder="e.g. 1500 (for discount)"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Badge / Label
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Best Seller, Seasonal Harvest"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Traditional Purpose
                </label>
                <input
                  type="text"
                  value={formData.traditionalPurpose}
                  onChange={(e) =>
                    setFormData({ ...formData, traditionalPurpose: e.target.value })
                  }
                  placeholder="e.g. Heart & Brain Tonic, Digestive Health"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Herbal Quality / Mizaj
                </label>
                <input
                  type="text"
                  value={formData.mizaj}
                  onChange={(e) => setFormData({ ...formData, mizaj: e.target.value })}
                  placeholder="e.g. Cooling & Refreshing, Balanced"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Descriptions & Hakim Advice */}
          <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] space-y-4">
            <h3 className="font-bold text-[#138833] flex items-center gap-1.5 text-sm border-b border-[#f4eee5] pb-2">
              <Info className="w-4 h-4 text-[#c59b27]" />
              <span>Descriptions & Usage Guidance</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Short Summary (Appears on product cards)
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescription: e.target.value })
                  }
                  placeholder="A short, engaging 1-2 line summary of what this remedy does..."
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">
                  Full Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, fullDescription: e.target.value })
                  }
                  placeholder="Full background on preparation method, herbal properties, and who it helps..."
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
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
                    placeholder="e.g. Take with warm water in morning"
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
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
                    placeholder="e.g. 1-2 tablespoons daily"
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
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
                    placeholder="e.g. Avoid sour and oily foods during course"
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Benefits & Ingredients List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Health Benefits */}
            <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e6dfd5] space-y-3">
              <h3 className="font-bold text-[#138833] flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-[#c59b27]" />
                <span>Health Benefits</span>
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
                  className="px-3 py-2 bg-[#138833] text-white rounded-lg font-semibold shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-[#6a6660]">Presets:</span>
                {PRESET_BENEFITS.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => addBenefit(p)}
                    className="text-[10px] px-2 py-0.5 bg-white border border-[#e6dfd5] rounded-full text-[#138833] hover:bg-[#138833] hover:text-white transition-colors"
                  >
                    + {p.slice(0, 24)}...
                  </button>
                ))}
              </div>

              {/* Added Benefits List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {benefitsList.map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 bg-white rounded-lg border border-[#e6dfd5]"
                  >
                    <span className="text-[#138833]">{b}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(i)}
                      className="text-[#6a6660] hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e6dfd5] space-y-3">
              <h3 className="font-bold text-[#138833] flex items-center gap-1.5 text-sm">
                <Leaf className="w-4 h-4 text-[#1b993e]" />
                <span>Ingredients & Botanicals</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  placeholder="Ingredient name (e.g. Amla)"
                  className="p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredientRole}
                    onChange={(e) => setNewIngredientRole(e.target.value)}
                    placeholder="Role (e.g. Vitamin C)"
                    className="flex-1 p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                  />
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="px-3 py-2 bg-[#138833] text-white rounded-lg font-semibold shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Added Ingredients List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {ingredientsList.map((ing, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 bg-white rounded-lg border border-[#e6dfd5]"
                  >
                    <div>
                      <span className="font-bold text-[#138833]">{ing.name}</span>
                      <span className="text-[#6a6660] text-[11px] block">{ing.role}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="text-[#6a6660] hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Sizes / Variants & Inventory Flags */}
          <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] space-y-4">
            <h3 className="font-bold text-[#138833] flex items-center gap-1.5 text-sm border-b border-[#f4eee5] pb-2">
              <Package className="w-4 h-4 text-[#138833]" />
              <span>Packaging Sizes & Inventory Flags</span>
            </h3>

            {/* Sizes Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
              <input
                type="text"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                placeholder="Size Name (e.g. Jar)"
                className="p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
              />
              <input
                type="text"
                value={newSizeWeight}
                onChange={(e) => setNewSizeWeight(e.target.value)}
                placeholder="Weight (e.g. 500g)"
                className="p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
              />
              <input
                type="number"
                value={newSizePrice}
                onChange={(e) => setNewSizePrice(e.target.value)}
                placeholder="Price (PKR)"
                className="p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
              />
              <button
                type="button"
                onClick={addSize}
                className="py-2 px-3 bg-[#138833] hover:bg-[#0f7229] text-white rounded-lg font-semibold flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Size</span>
              </button>
            </div>

            {/* Sizes Table */}
            <div className="space-y-1.5">
              {sizesList.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2.5 bg-[#faf8f5] rounded-lg border border-[#e6dfd5]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#138833]">{s.name}</span>
                    <span className="text-[#6a6660]">({s.weight})</span>
                    <span className="font-bold text-[#1b993e]">₨ {Number(s.price).toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSize(i)}
                    className="text-[#6a6660] hover:text-red-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-6 pt-3 border-t border-[#f4eee5]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) =>
                    setFormData({ ...formData, inStock: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#138833] rounded"
                />
                <span className="font-semibold text-[#138833]">Available in Stock</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#c59b27] rounded"
                />
                <span className="font-semibold text-[#138833]">
                  Feature on Homepage Showcase
                </span>
              </label>
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6dfd5]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#59534b] font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#138833] hover:bg-[#0f7229] text-white font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Update Product" : "Publish Product"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
