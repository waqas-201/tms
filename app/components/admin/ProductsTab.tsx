"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
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
  DollarSign,
  Filter,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/app/components/ProductFormModal";

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  urduName?: string;
  categoryId: string;
  categoryLabel: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number | null;
  costPrice?: number | null;
  image?: string;
  gallery?: string[];
  inStock: boolean;
  featured: boolean;
  rating?: number;
  badge?: string | null;
  benefits?: string[];
  sizes?: Array<{
    id: string;
    name: string;
    weight: string;
    price: number;
    originalPrice?: number | null;
    costPrice?: number | null;
    stockOnHand: number;
    stockReserved: number;
    available?: number;
    lowStockThreshold?: number;
    sku?: string;
    unit?: {
      id: string;
      code: string;
      name: string;
    } | null;
  }>;
  createdAt?: string;
}

interface ProductsTabProps {
  products: ProductItem[];
  loading: boolean;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (product: ProductItem) => void;
}

export default function ProductsTab({
  products,
  loading,
  onRefresh,
  onOpenCreateModal,
  onOpenEditModal,
}: ProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchTerm.trim() ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.categoryLabel && product.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter;

    const matchesStock =
      stockStatusFilter === "all" ||
      (stockStatusFilter === "in-stock" && product.inStock) ||
      (stockStatusFilter === "out-of-stock" && !product.inStock);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Handle Delete Product
  const handleDeleteProduct = async (product: ProductItem) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(product.id);
    setActionError(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product.");
      }
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  // Quick toggle in-stock status
  const handleToggleInStock = async (product: ProductItem) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error updating stock status:", err);
    }
  };

  // Helper for primary image
  const getProductImage = (product: ProductItem): string => {
    if (Array.isArray(product.gallery) && product.gallery.length > 0 && product.gallery[0]) {
      return product.gallery[0];
    }
    if (typeof product.image === "string" && product.image.trim()) {
      if (product.image.startsWith("[")) {
        try {
          const parsed = JSON.parse(product.image);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch {}
      }
      return product.image;
    }
    return "/images/placeholder-herbal.jpg";
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search / Filters Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#e6dfd5] shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6660]" />
            <input
              type="text"
              placeholder="Search products by title, slug, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white transition-all text-[#1c1917] placeholder:text-[#8c8880]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8c8880] hover:text-[#1c1917]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 pl-3 pr-8 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white transition-all text-[#1c1917] appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c8880] pointer-events-none" />
          </div>

          {/* Stock Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="w-full py-2 pl-3 pr-8 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white transition-all text-[#1c1917] appearance-none cursor-pointer"
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock Only</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Product</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-rose-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-[#e6dfd5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4 text-[#22623a]" />
            <h2 className="font-serif text-base font-bold text-[#22623a]">
              Product Catalog ({filteredProducts.length})
            </h2>
          </div>
          <span className="text-xs text-[#6a6660]">
            Showing {filteredProducts.length} of {products.length} registered products
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#6a6660]">
            <Loader2 className="w-8 h-8 animate-spin text-[#22623a]" />
            <p className="text-sm font-medium">Loading herbal product catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-12 h-12 text-[#c59b27] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-[#22623a] mb-1">
              No products found
            </h3>
            <p className="text-sm text-[#6a6660] max-w-md mx-auto mb-5">
              {searchTerm || categoryFilter !== "all"
                ? "No products match your search or filter parameters. Try resetting your query."
                : "Your store does not have any products uploaded yet. Create your first herbal remedy."}
            </p>
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#22623a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a4d2e] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload First Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e6dfd5] bg-[#faf8f5]/60 text-[11px] font-bold uppercase tracking-wider text-[#6a6660]">
                  <th className="py-3.5 px-4 sm:px-6">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Base Price</th>
                  <th className="py-3.5 px-4">Pack Sizes & Stock</th>
                  <th className="py-3.5 px-4 text-center">Catalog Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd5] text-sm">
                {filteredProducts.map((product) => {
                  const imgUrl = getProductImage(product);
                  const totalOnHand = product.sizes?.reduce(
                    (acc, curr) => acc + curr.stockOnHand,
                    0
                  ) ?? 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#faf8f5]/60 transition-colors group"
                    >
                      {/* Product details */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#e6dfd5]/40 shrink-0 border border-[#e6dfd5]">
                            {imgUrl ? (
                              <Image
                                src={imgUrl}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#8c8880]">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#1c1917] group-hover:text-[#22623a] transition-colors">
                                {product.name}
                              </span>
                              {product.badge && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#c59b27]/15 text-[#8c6b1b] border border-[#c59b27]/30">
                                  {product.badge}
                                </span>
                              )}
                              {product.featured && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#6a6660] mt-0.5">
                              <span className="font-mono text-[11px] text-[#8c8880]">
                                /{product.slug}
                              </span>
                              <Link
                                href={`/products/${product.slug}`}
                                target="_blank"
                                className="text-[#22623a] hover:underline inline-flex items-center gap-0.5 text-[11px]"
                              >
                                <span>Preview</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#e6dfd5]/40 text-[#4a4640] border border-[#e6dfd5]">
                          {product.categoryLabel || product.categoryId}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-bold text-[#1c1917]">
                            PKR {product.price.toLocaleString()}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-xs text-[#8c8880] line-through">
                              PKR {product.originalPrice.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Variants & Stock */}
                      <td className="py-4 px-4">
                        {product.sizes && product.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {product.sizes.map((size) => (
                              <span
                                key={size.id}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs border ${
                                  size.stockOnHand > 0
                                    ? "bg-[#faf8f5] border-[#e6dfd5] text-[#2c2824]"
                                    : "bg-rose-50 border-rose-200 text-rose-700"
                                }`}
                              >
                                <span className="font-medium">
                                  {size.weight || size.name}:
                                </span>
                                <span className="text-[#6a6660]">
                                  Rs.{size.price}
                                </span>
                                <span
                                  className={`font-mono text-[11px] px-1 rounded ${
                                    size.stockOnHand > 5
                                      ? "bg-emerald-100 text-emerald-800"
                                      : size.stockOnHand > 0
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800 font-bold"
                                  }`}
                                >
                                  {size.stockOnHand} left
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[#8c8880] italic">
                            No pack variants configured
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleInStock(product)}
                          title="Click to toggle in-stock status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                            product.inStock
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.inStock ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                          <span>{product.inStock ? "In Stock" : "Out of Stock"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEditModal(product)}
                            className="p-1.5 rounded-lg text-[#6a6660] hover:text-[#22623a] hover:bg-[#faf8f5] transition-colors"
                            title="Edit Product & Sizes"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            disabled={deletingId === product.id}
                            className="p-1.5 rounded-lg text-[#6a6660] hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                            title="Delete Product"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
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
    </div>
  );
}
