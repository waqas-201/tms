"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Search,
  Edit3,
  Trash2,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Leaf,
  Droplets,
  Heart,
  Zap,
  Star,
  RefreshCw,
  Image as ImageIcon,
  X,
  Upload,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  urduName: string;
  description: string;
  heroImage: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const PRESET_UNANI_CATEGORIES = [
  {
    id: "murabbajaat",
    slug: "murabbajaat",
    name: "Herbal Preserves (Murabba)",
    urduName: "مربہ جات",
    description: "Traditional unani fruit preserves in pure sugar syrup or raw honey base for vitality and digestion.",
    heroImage: "/images/categories/murabba.jpg",
  },
  {
    id: "arqiyat",
    slug: "arqiyat",
    name: "Pure Distillates (Arq)",
    urduName: "عرقیات",
    description: "Hydro-distilled botanical waters extracted via steam distillation of unani medicinal herbs.",
    heroImage: "/images/categories/arq.jpg",
  },
  {
    id: "majoon-khamira",
    slug: "majoon-khamira",
    name: "Majoon & Khamira",
    urduName: "معجون و خمیرہ",
    description: "Compound herbal electuaries and fermented heart-strengthening herbal pastes for vitality.",
    heroImage: "/images/categories/majoon.jpg",
  },
  {
    id: "joshanda-teas",
    slug: "joshanda-teas",
    name: "Joshanda & Herbal Teas",
    urduName: "جوشاندہ و قہوہ جات",
    description: "Soothing medicinal decoctions, cold relief blends, and wellness green teas.",
    heroImage: "/images/categories/teas.jpg",
  },
  {
    id: "oils-marham",
    slug: "oils-marham",
    name: "Pain Relief Oils & Balms",
    urduName: "روغنیات و مرہم",
    description: "Pure cold-pressed therapeutic oils, joint ache liniments, and soothing botanical balms.",
    heroImage: "/images/categories/oils.jpg",
  },
  {
    id: "herbs-seeds",
    slug: "herbs-seeds",
    name: "Whole Herbs & Seeds",
    urduName: "جڑی بوٹیاں و تخم",
    description: "Pristine wild-harvested roots, seeds, barks, and whole apothecary herbs.",
    heroImage: "/images/categories/herbs.jpg",
  },
  {
    id: "sofoof-kushta",
    slug: "sofoof-kushta",
    name: "Sofoof & Kushta Powders",
    urduName: "سفوف و کشتہ جات",
    description: "Finely ground single and polyherbal powders, digestive churnas, and traditional calces.",
    heroImage: "/images/categories/sofoof.jpg",
  },
  {
    id: "hair-skin",
    slug: "hair-skin",
    name: "Hair & Skin Care",
    urduName: "حسن و صحت بال و جلد",
    description: "Ayurvedic ubtans, herbal hair regrowth oils, botanical washes, and natural beauty serums.",
    heroImage: "/images/categories/skincare.jpg",
  },
  {
    id: "syrups-sharbat",
    slug: "syrups-sharbat",
    name: "Herbal Syrups (Sharbat)",
    urduName: "شربت و معجون",
    description: "Cooling summer cordials, cough syrups, and liver-protective unani tonics.",
    heroImage: "/images/categories/syrup.jpg",
  },
];

export default function CategoriesTab() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [urduName, setUrduName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Delete Block Modal State
  const [deleteWarning, setDeleteWarning] = useState<{
    isOpen: boolean;
    categoryName: string;
    productCount: number;
  }>({
    isOpen: false,
    categoryName: "",
    productCount: 0,
  });

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } else {
        setError("Failed to load categories.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(autoSlug);
    }
  };

  const handleResetForm = () => {
    setIsEditing(false);
    setEditCategoryId(null);
    setName("");
    setUrduName("");
    setSlug("");
    setDescription("");
    setHeroImage("");
    setCustomImageUrl("");
    setShowImagePicker(false);
  };

  const handleStartEdit = (category: CategoryItem) => {
    setIsEditing(true);
    setEditCategoryId(category.id);
    setName(category.name);
    setUrduName(category.urduName);
    setSlug(category.slug);
    setDescription(category.description || "");
    setHeroImage(category.heroImage || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim() || !urduName.trim()) {
      setError("Please provide both an English name and an Urdu name for the category.");
      return;
    }

    setSavingCategory(true);
    try {
      if (isEditing && editCategoryId) {
        const res = await fetch(`/api/categories/${editCategoryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            urduName: urduName.trim(),
            slug: slug.trim(),
            description: description.trim(),
            heroImage: heroImage.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update category.");
        }

        setSuccessMsg(`Category '${data.data.name}' updated successfully.`);
        handleResetForm();
        fetchCategories();
      } else {
        const cleanSlug = (slug || name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: cleanSlug,
            slug: cleanSlug,
            name: name.trim(),
            urduName: urduName.trim(),
            description: description.trim(),
            heroImage: heroImage.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create category.");
        }

        setSuccessMsg(`Category '${data.data.name}' (${data.data.slug}) created.`);
        handleResetForm();
        fetchCategories();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleQuickAddPreset = async (preset: (typeof PRESET_UNANI_CATEGORIES)[0]) => {
    setError(null);
    setSuccessMsg(null);
    setSavingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to add preset ${preset.name}.`);
      }
      setSuccessMsg(`Preset category '${data.data.name}' added.`);
      fetchCategories();
    } catch (err: any) {
      setError(err?.message || "Failed to add preset category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDelete = async (category: CategoryItem) => {
    if ((category.productCount ?? 0) > 0) {
      setDeleteWarning({
        isOpen: true,
        categoryName: category.name,
        productCount: category.productCount || 0,
      });
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete category '${category.name}' (${category.urduName})?`
      )
    ) {
      return;
    }

    setBusyId(category.id);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete category.");
      }
      setSuccessMsg(data.message || `Category '${category.name}' deleted.`);
      fetchCategories();
    } catch (err: any) {
      setError(err?.message || "Failed to delete category.");
    } finally {
      setBusyId(null);
    }
  };

  const existingSlugs = new Set(categories.map((c) => c.slug.toLowerCase()));
  const missingPresets = PRESET_UNANI_CATEGORIES.filter(
    (p) => !existingSlugs.has(p.slug.toLowerCase())
  );

  const filteredCategories = categories.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.urduName.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const totalProductsAssigned = categories.reduce(
    (sum, c) => sum + (c.productCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Notification Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#e6dfd5] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#22623a]/10 text-[#22623a] flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6a6660]">
              Total Categories
            </p>
            <p className="text-xl font-serif font-bold text-[#1c1917]">
              {categories.length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e6dfd5] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#c59b27]/10 text-[#c59b27] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6a6660]">
              Catalog Products
            </p>
            <p className="text-xl font-serif font-bold text-[#1c1917]">
              {totalProductsAssigned}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e6dfd5] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#22623a] flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6a6660]">
              Taxonomy Structure
            </p>
            <p className="text-sm font-semibold text-[#22623a]">
              Unani & Apothecary
            </p>
          </div>
        </div>
      </div>

      {/* Category Creation / Edit Form Card */}
      <div className="bg-white rounded-3xl border border-[#e6dfd5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                {isEditing ? `Edit Category: ${name || "Untitled"}` : "Add New Category"}
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Organize herbal medicines and products into clean storefront taxonomy.
              </p>
            </div>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6a6660] hover:text-[#1c1917] bg-white border border-[#e6dfd5] transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Editing</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* English Title */}
            <div>
              <label className="block text-xs font-bold text-[#4a4640] mb-1.5">
                Category Name (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Herbal Syrups & Cordials"
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white transition-all text-[#1c1917]"
              />
            </div>

            {/* Urdu Title */}
            <div>
              <label className="block text-xs font-bold text-[#4a4640] mb-1.5">
                Urdu Title (اردو نام) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                dir="rtl"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                placeholder="مثال: شربت و معجون جات"
                className="w-full px-3.5 py-2.5 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white font-serif transition-all text-[#1c1917]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* URL Slug */}
            <div>
              <label className="block text-xs font-bold text-[#4a4640] mb-1.5">
                URL Identifier / Slug
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="herbal-syrups"
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white text-[#4a4640]"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-[#6a6660]">
                  /products?category={slug || "slug"}
                </span>
              </div>
            </div>

            {/* Hero Image */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#4a4640]">
                  Banner / Hero Artwork
                </label>
                <button
                  type="button"
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className="text-[11px] font-semibold text-[#22623a] hover:underline"
                >
                  {showImagePicker ? "Hide image uploader" : "Upload or set image"}
                </button>
              </div>
              <input
                type="text"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="/images/categories/syrup.jpg or https://..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white font-mono text-[#4a4640]"
              />
            </div>
          </div>

          {/* Collapsible Image Upload Zone */}
          {showImagePicker && (
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-3 animate-fade-in">
              <p className="text-xs font-bold text-[#22623a]">
                Upload Category Artwork via UploadThing
              </p>
              <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]?.url) {
                    setHeroImage(res[0].url);
                    setShowImagePicker(false);
                    setSuccessMsg("Category image uploaded successfully!");
                  }
                }}
                onUploadError={(err: Error) => {
                  setError(`Image upload failed: ${err.message}`);
                }}
                className="ut-button:bg-[#22623a] ut-button:ut-readying:bg-[#22623a]/70 ut-label:text-[#22623a] border-dashed border-2 border-[#22623a]/30 bg-white/80 rounded-2xl py-4"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#4a4640] mb-1.5">
              Category Description & Traditional Indications
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description explaining the therapeutic category, preparation style, and health benefits..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white transition-all text-[#1c1917]"
            />
          </div>

          {/* Live Storefront Mini Card Preview */}
          {(name || urduName) && (
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#e6dfd5] overflow-hidden relative shrink-0 flex items-center justify-center text-[#22623a]">
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={name}
                      fill
                      className="object-cover"
                      unoptimized={heroImage.startsWith("http")}
                    />
                  ) : (
                    <Leaf className="w-6 h-6 text-[#22623a]/60" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-sm font-bold text-[#1c1917]">
                      {name || "Category Name"}
                    </h4>
                    {urduName && (
                      <span className="font-serif text-xs text-[#22623a] font-semibold">
                        ({urduName})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6a6660] line-clamp-1">
                    {description || "No description provided."}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 bg-white border border-[#e6dfd5] rounded-lg text-[#6a6660] shrink-0">
                slug: {slug || "slug"}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={savingCategory}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-sm font-bold shadow-xs transition-all disabled:opacity-50"
              >
                {savingCategory ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEditing ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{isEditing ? "Save Category Changes" : "Create Category"}</span>
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6a6660] hover:text-[#1c1917] bg-white border border-[#e6dfd5]"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* 1-Click Unani Preset Category Pills */}
        {missingPresets.length > 0 && (
          <div className="px-6 pb-5 pt-1 border-t border-[#e6dfd5]/60 bg-[#faf8f5]/40">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6a6660]">
                Quick-Add Traditional Unani Presets
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={savingCategory}
                  onClick={() => handleQuickAddPreset(preset)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-[#e6dfd5] text-[#4a4640] hover:border-[#22623a] hover:text-[#22623a] shadow-2xs transition-all disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 text-[#22623a]" />
                  <span className="font-semibold">{preset.name}</span>
                  <span className="text-[11px] text-[#22623a] font-serif">
                    ({preset.urduName})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories Catalog Directory */}
      <div className="bg-white rounded-3xl border border-[#e6dfd5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FolderTree className="w-4 h-4 text-[#22623a]" />
            <h3 className="font-serif text-base font-bold text-[#22623a]">
              Categories Directory ({filteredCategories.length})
            </h3>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6a6660]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] text-[#1c1917]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#6a6660]">
            <Loader2 className="w-8 h-8 animate-spin text-[#22623a]" />
            <p className="text-sm font-medium">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-16 text-center">
            <FolderTree className="w-12 h-12 text-[#c59b27] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-[#22623a] mb-1">
              No categories found
            </h3>
            <p className="text-sm text-[#6a6660] max-w-md mx-auto">
              {searchTerm
                ? "No categories matched your search criteria."
                : "Create a category or click any of the 1-click Unani presets above to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e6dfd5] bg-[#faf8f5]/60 text-[11px] font-bold uppercase tracking-wider text-[#6a6660]">
                  <th className="py-3.5 px-4 sm:px-6">Category</th>
                  <th className="py-3.5 px-4">Urdu Title</th>
                  <th className="py-3.5 px-4">URL Slug</th>
                  <th className="py-3.5 px-4 text-center">Products</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd5] text-sm">
                {filteredCategories.map((cat) => {
                  const isBusy = busyId === cat.id;
                  const pCount = cat.productCount || 0;
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-[#faf8f5]/60 transition-colors"
                    >
                      {/* Name & Artwork */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] overflow-hidden relative shrink-0 flex items-center justify-center text-[#22623a]">
                            {cat.heroImage ? (
                              <Image
                                src={cat.heroImage}
                                alt={cat.name}
                                fill
                                className="object-cover"
                                unoptimized={cat.heroImage.startsWith("http")}
                              />
                            ) : (
                              <Leaf className="w-5 h-5 text-[#22623a]" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#1c1917] block">
                              {cat.name}
                            </span>
                            {cat.description && (
                              <p className="text-xs text-[#6a6660] line-clamp-1 max-w-xs">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Urdu Name */}
                      <td className="py-3.5 px-4">
                        <span className="font-serif text-sm font-semibold text-[#22623a]">
                          {cat.urduName}
                        </span>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] text-[#4a4640]">
                          {cat.slug}
                        </span>
                      </td>

                      {/* Products Assigned */}
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/admin?tab=products&category=${cat.id}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            pCount > 0
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <Package className="w-3 h-3" />
                          <span>{pCount} products</span>
                        </Link>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="p-2 rounded-xl text-[#6a6660] hover:text-[#22623a] hover:bg-[#faf8f5] border border-transparent hover:border-[#e6dfd5] transition-all"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            disabled={isBusy}
                            className="p-2 rounded-xl text-[#6a6660] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all disabled:opacity-40"
                            title={
                              pCount > 0
                                ? "Cannot delete: products are assigned"
                                : "Delete category"
                            }
                          >
                            {isBusy ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Protected Delete Warning Modal */}
      {deleteWarning.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#e6dfd5] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-[#1c1917]">
                Cannot Delete Category
              </h3>
              <p className="text-xs text-[#6a6660]">
                Category <strong className="text-[#1c1917]">&ldquo;{deleteWarning.categoryName}&rdquo;</strong> currently has{" "}
                <strong className="text-[#22623a]">{deleteWarning.productCount} active product(s)</strong> assigned to it.
              </p>
              <p className="text-xs text-[#6a6660] pt-1">
                To preserve database integrity, please reassign or remove these products from the Products tab before deleting this category.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setDeleteWarning({ isOpen: false, categoryName: "", productCount: 0 })}
                className="px-6 py-2.5 bg-[#22623a] text-white text-xs font-bold rounded-xl hover:bg-[#1a4d2e] transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
