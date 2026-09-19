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
  Scale,
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

interface UnitItem {
  id: string;
  code: string;
  name: string;
  kind: string;
}

interface FormSizeItem {
  id?: string;
  name: string;
  weight: string;
  price: string;
  originalPrice?: string;
  unitId?: string;
  quantityValue?: string;
  initialStock?: string;
  lowStockThreshold?: string;
  sku?: string;
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

  const [units, setUnits] = useState<UnitItem[]>([]);
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
    featured: false,
  });

  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState("");

  const [ingredientsList, setIngredientsList] = useState<
    { name: string; role: string }[]
  >([]);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientRole, setNewIngredientRole] = useState("");

  const [sizesList, setSizesList] = useState<FormSizeItem[]>([]);
  const [newSizeName, setNewSizeName] = useState("Standard Pack");
  const [newSizeUnitId, setNewSizeUnitId] = useState("");
  const [newSizeQtyVal, setNewSizeQtyVal] = useState("500");
  const [newSizeWeight, setNewSizeWeight] = useState("500g");
  const [newSizePrice, setNewSizePrice] = useState("");
  const [newSizeOriginalPrice, setNewSizeOriginalPrice] = useState("");
  const [newSizeInitialStock, setNewSizeInitialStock] = useState("20");
  const [newSizeLowThreshold, setNewSizeLowThreshold] = useState("5");

  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Fetch available units catalog
  useEffect(() => {
    async function loadUnits() {
      try {
        const res = await fetch("/api/units");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setUnits(data.data);
            if (data.data.length > 0 && !newSizeUnitId) {
              const defaultUnit = data.data.find((u: UnitItem) => u.code === "g") || data.data[0];
              setNewSizeUnitId(defaultUnit.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load units:", err);
      }
    }
    if (isOpen) {
      loadUnits();
    }
  }, [isOpen]);

  // Sync weight text when unit or qty value changes
  useEffect(() => {
    if (newSizeUnitId && units.length > 0) {
      const selectedUnit = units.find((u) => u.id === newSizeUnitId);
      if (selectedUnit) {
        const val = newSizeQtyVal.trim();
        setNewSizeWeight(val ? `${val}${selectedUnit.code}` : selectedUnit.code);
      }
    }
  }, [newSizeUnitId, newSizeQtyVal, units]);

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
              id: s.id,
              name: s.name,
              weight: s.weight,
              price: String(s.price),
              originalPrice: s.originalPrice ? String(s.originalPrice) : "",
              unitId: s.unitId || s.unit?.id || "",
              quantityValue: s.quantityValue !== null && s.quantityValue !== undefined ? String(s.quantityValue) : "",
              initialStock: String(s.stockOnHand ?? s.available ?? 0),
              lowStockThreshold: String(s.lowStockThreshold || 5),
              sku: s.sku || "",
            }))
          : [
              {
                name: "Standard Pack",
                weight: "500g",
                price: initialProduct.price ? String(initialProduct.price) : "1200",
                initialStock: "20",
                lowStockThreshold: "5",
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
        {
          name: "Standard Pack",
          weight: "500g",
          price: "",
          quantityValue: "500",
          initialStock: "25",
          lowStockThreshold: "5",
        },
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
    if (!newSizePrice.trim() || isNaN(Number(newSizePrice))) {
      setError("Please specify a valid price for the packaging variant.");
      return;
    }

    const sizeName = newSizeName.trim() || "Standard Pack";
    const selectedUnit = units.find((u) => u.id === newSizeUnitId);
    const weightLabel =
      newSizeWeight.trim() ||
      (selectedUnit && newSizeQtyVal
        ? `${newSizeQtyVal}${selectedUnit.code}`
        : sizeName);

    setSizesList([
      ...sizesList,
      {
        name: sizeName,
        weight: weightLabel,
        price: newSizePrice.trim(),
        originalPrice: newSizeOriginalPrice.trim() || undefined,
        unitId: newSizeUnitId || undefined,
        quantityValue: newSizeQtyVal.trim() || undefined,
        initialStock: newSizeInitialStock.trim() || "20",
        lowStockThreshold: newSizeLowThreshold.trim() || "5",
      },
    ]);

    // If main price is empty, prefill from first size
    if (!formData.price) {
      setFormData((prev) => ({ ...prev, price: newSizePrice.trim() }));
    }

    setNewSizeName("Standard Pack");
    setNewSizeQtyVal("500");
    setNewSizePrice("");
    setNewSizeOriginalPrice("");
    setNewSizeInitialStock("20");
    setError(null);
  };

  const removeSize = (index: number) => {
    if (sizesList.length <= 1) {
      setError("A product must have at least one packaging size/variant.");
      return;
    }
    setSizesList(sizesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Please enter the product name.");
      return;
    }
    if (sizesList.length === 0) {
      setError("Please add at least one packaging size variant with pricing.");
      return;
    }
    if (!formData.image) {
      setError("Please upload an image or provide an image URL.");
      return;
    }

    // Auto calculate lowest size price as base price
    const minSizePrice = Math.min(...sizesList.map((s) => Number(s.price) || 999999));
    const effectiveBasePrice = !isNaN(minSizePrice) && minSizePrice < 999999 ? minSizePrice : Number(formData.price) || 0;

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        categoryId: formData.categoryId,
        categoryLabel: formData.categoryLabel,
        price: effectiveBasePrice,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        discountPercentage:
          formData.originalPrice && Number(formData.originalPrice) > effectiveBasePrice
            ? Math.round(
                ((Number(formData.originalPrice) - effectiveBasePrice) /
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
        featured: formData.featured,
        benefits: benefitsList,
        ingredients: ingredientsList,
        sizes: sizesList.map((s) => ({
          ...(s.id && { id: s.id }),
          name: s.name,
          weight: s.weight,
          price: Number(s.price),
          originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
          unitId: s.unitId || null,
          quantityValue: s.quantityValue ? Number(s.quantityValue) : null,
          initialStock: s.initialStock ? Number(s.initialStock) : 20,
          lowStockThreshold: s.lowStockThreshold ? Number(s.lowStockThreshold) : 5,
          sku: s.sku || undefined,
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
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-10 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#22623a]">
                {isEditing ? "Edit Product & Stock Variants" : "Upload New Product & Inventory"}
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                {isEditing
                  ? "Modify product details, packaging units, and live inventory variants."
                  : "Add a new natural remedy with unit pricing, initial stock, and herbal benefits."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
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
              <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                <ImageIcon className="w-4 h-4 text-[#c59b27]" />
                <span>Product Image</span>
              </h3>
              <div className="flex gap-1 bg-white p-0.5 rounded-md border border-[#e6dfd5]">
                <button
                  type="button"
                  onClick={() => setImageTab("upload")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    imageTab === "upload"
                      ? "bg-[#22623a] text-white font-semibold"
                      : "text-[#6a6660] hover:text-[#22623a]"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("url")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    imageTab === "url"
                      ? "bg-[#22623a] text-white font-semibold"
                      : "text-[#6a6660] hover:text-[#22623a]"
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
                        button: "bg-[#22623a] hover:bg-[#1b502e] text-xs font-semibold py-2 px-4 rounded-md",
                        container: "border-none p-2",
                        label: "text-xs font-medium text-[#22623a]",
                        allowedContent: "text-[10px] text-[#6a6660]",
                      }}
                    />
                    {uploadSuccess && (
                      <p className="text-[#2d7648] font-semibold flex items-center justify-center gap-1">
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
                      className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
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
                          className="text-[10px] px-2 py-0.5 bg-[#faf8f5] hover:bg-[#e6dfd5] rounded text-[#22623a] border border-[#e6dfd5]"
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

          {/* Section 2: Core Details */}
          <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] space-y-4">
            <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm border-b border-[#f4eee5] pb-2">
              <Layers className="w-4 h-4 text-[#22623a]" />
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
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] font-medium"
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

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-[#1a1816]">
                  Traditional Purpose
                </label>
                <input
                  type="text"
                  value={formData.traditionalPurpose}
                  onChange={(e) =>
                    setFormData({ ...formData, traditionalPurpose: e.target.value })
                  }
                  placeholder="e.g. Heart & Brain Tonic, Digestive Health, Immune Support"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Packaging Units & Inventory Variants */}
          <div className="bg-white p-5 rounded-xl border border-[#c59b27]/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f4eee5] pb-2">
              <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                <Scale className="w-4 h-4 text-[#c59b27]" />
                <span>Packaging Sizes, Units & Physical Stock</span>
              </h3>
              <span className="text-[11px] text-[#6a6660]">
                Live on website immediately upon save
              </span>
            </div>

            {/* Sizes Input Form */}
            <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="font-semibold text-[11px] text-[#1a1816]">
                    Pack Name
                  </label>
                  <input
                    type="text"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    placeholder="e.g. Standard Jar / Small Pack"
                    className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[11px] text-[#1a1816]">
                    Unit Type
                  </label>
                  <select
                    value={newSizeUnitId}
                    onChange={(e) => setNewSizeUnitId(e.target.value)}
                    className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} ({u.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[11px] text-[#1a1816]">
                    Qty Value
                  </label>
                  <input
                    type="number"
                    value={newSizeQtyVal}
                    onChange={(e) => setNewSizeQtyVal(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[11px] text-[#1a1816]">
                    Pack Price (PKR) *
                  </label>
                  <input
                    type="number"
                    value={newSizePrice}
                    onChange={(e) => setNewSizePrice(e.target.value)}
                    placeholder="e.g. 1400"
                    className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[11px] text-[#1a1816]">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newSizeInitialStock}
                    onChange={(e) => setNewSizeInitialStock(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#6a6660]">
                  Calculated Label: <strong className="text-[#22623a]">{newSizeWeight}</strong>
                </span>
                <button
                  type="button"
                  onClick={addSize}
                  className="py-1.5 px-4 bg-[#22623a] hover:bg-[#1b502e] text-white rounded-lg font-semibold flex items-center gap-1 text-xs shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pack Variant</span>
                </button>
              </div>
            </div>

            {/* Sizes List Table */}
            <div className="border border-[#e6dfd5] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf8f5] border-b border-[#e6dfd5] text-[#6a6660] font-semibold">
                    <th className="p-2.5">Variant Name</th>
                    <th className="p-2.5">Weight / Unit</th>
                    <th className="p-2.5">Price</th>
                    <th className="p-2.5">Initial Stock</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4eee5]">
                  {sizesList.map((s, i) => (
                    <tr key={i} className="hover:bg-[#faf8f5]/60 transition-colors">
                      <td className="p-2.5 font-bold text-[#22623a]">{s.name}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-[#f4eee5] text-[#22623a] font-mono text-[11px]">
                          {s.weight}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-[#2d7648]">
                        ₨ {Number(s.price).toLocaleString()}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] font-semibold">
                          {s.initialStock || 0} units
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeSize(i)}
                          className="text-[#6a6660] hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Remove size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#c59b27] rounded"
                />
                <span className="font-semibold text-[#22623a]">
                  Feature on Homepage Showcase
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Descriptions & Usage Guidance */}
          <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] space-y-4">
            <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm border-b border-[#f4eee5] pb-2">
              <Info className="w-4 h-4 text-[#c59b27]" />
              <span>Descriptions & Hakim Guidance</span>
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

          {/* Section 5: Benefits & Ingredients List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Health Benefits */}
            <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e6dfd5] space-y-3">
              <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
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
                  className="px-3 py-2 bg-[#22623a] text-white rounded-lg font-semibold shrink-0"
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
                    className="text-[10px] px-2 py-0.5 bg-white border border-[#e6dfd5] rounded-full text-[#22623a] hover:bg-[#22623a] hover:text-white transition-colors"
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
                    <span className="text-[#22623a]">{b}</span>
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
              <h3 className="font-bold text-[#22623a] flex items-center gap-1.5 text-sm">
                <Leaf className="w-4 h-4 text-[#2d7648]" />
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
                    className="px-3 py-2 bg-[#22623a] text-white rounded-lg font-semibold shrink-0"
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
                      <span className="font-bold text-[#22623a]">{ing.name}</span>
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
              className="px-6 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
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
