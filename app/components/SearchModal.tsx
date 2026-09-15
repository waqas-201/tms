"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, Product } from "@/app/data/products";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = PRODUCTS.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.benefits.some((b) => b.toLowerCase().includes(q)) ||
        item.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
      );
    });

    setResults(filtered);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#138833]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Box */}
      <div className="relative mx-auto max-w-2xl bg-[#faf8f5] rounded-xl shadow-2xl border border-[#e6dfd5] overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#e6dfd5] bg-white">
          <Search className="w-5 h-5 text-[#6a6660] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search remedies, preserves, arq, pain oils, or symptoms..."
            className="w-full bg-transparent text-sm text-[#1a1816] placeholder-[#6a6660] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-[#6a6660] hover:text-[#138833] mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#138833] bg-[#f4eee5] px-2.5 py-1 rounded hover:bg-[#e8ded2] transition-colors shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Chips when no query */}
        {!query.trim() && (
          <div className="p-6 space-y-4">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#6a6660] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Popular Health Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Amla Murabba",
                "Arq Kasni",
                "Arq Makoh",
                "Joint Pain Oil",
                "Tahiri Marham",
                "Harar Murabba",
                "Liver Health",
                "Stomach Gas & Acidity",
                "Pure Herbs",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setQuery(chip)}
                  className="text-xs px-3 py-1.5 bg-white border border-[#e6dfd5] rounded-full text-[#138833] hover:bg-[#138833] hover:text-white hover:border-[#138833] transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#e6dfd5]/60 text-xs text-[#6a6660]">
              <p>
                💡 Tip: You can search by remedy name (e.g. <em>Apple Murabba</em>) or symptom (e.g. <em>Joint pain</em>).
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {query.trim() && (
          <div className="max-h-96 overflow-y-auto p-4 divide-y divide-[#e6dfd5]/60">
            {results.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6a6660]">
                No remedies found matching &ldquo;<span className="font-semibold text-[#1a1816]">{query}</span>&rdquo;.
                <p className="mt-2 text-[11px]">
                  Need guidance? You can talk to our Hakim directly for personalized advice.
                </p>
                <Link
                  href="/consultation"
                  onClick={onClose}
                  className="mt-3 inline-block text-xs text-[#138833] font-semibold underline decoration-[#c59b27]"
                >
                  Talk to Hakim Online &rarr;
                </Link>
              </div>
            ) : (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-white transition-colors group"
                >
                  <div className="relative w-14 h-14 bg-[#f4eee5] rounded-md overflow-hidden shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold text-[#c59b27] tracking-wider">
                        {product.categoryLabel}
                      </span>
                      {product.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-[#138833]/10 text-[#138833] rounded">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-[#138833] group-hover:text-[#c59b27] transition-colors truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#6a6660] truncate">
                      {product.traditionalPurpose}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-[#138833]">
                      ₨ {product.price.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#1b993e] font-medium flex items-center justify-end gap-1">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
