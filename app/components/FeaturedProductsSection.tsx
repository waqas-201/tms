"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, CategoryInfo } from "@/app/data/products";
import ProductCard from "./ProductCard";
import Reveal from "./motion/Reveal";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";

export default function FeaturedProductsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFeaturedData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (prodRes.ok) {
          const json = await prodRes.json();
          if (json.success && Array.isArray(json.data)) {
            setProductsList(json.data);
          }
        }

        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.success && Array.isArray(catJson.data)) {
            setCategoriesList(catJson.data);
          }
        }
      } catch (err) {
        console.error("Failed to load featured live products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeaturedData();
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? productsList.slice(0, 8)
      : productsList.filter((p) => p.category === activeCategory);

  return (
    <section className="py-16 bg-surface border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-widest font-semibold text-secondary-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pure Natural Recipes</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
              Featured Herbal Remedies
            </h2>
            <p className="text-xs sm:text-sm text-ink-body">
              Handcrafted fruit preserves, pure herbal waters, soothing pain oils, and daily wellness tonics.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary hover:text-secondary-text transition-colors self-start md:self-auto group"
          >
            <span>View All Products {productsList.length > 0 ? `(${productsList.length})` : ""}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>

        {/* Category Filter Pills */}
        {categoriesList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                activeCategory === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-ink-body border border-line hover:border-primary"
              }`}
            >
              All Products
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-4 py-2 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white text-ink-body border border-line hover:border-primary"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-xs text-ink-subtle">Loading featured remedies from dispensary...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-line text-center p-6 space-y-3">
            <p className="text-xs text-ink-body">No products available in this category yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
            >
              <span>Explore All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.06} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
