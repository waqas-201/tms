"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductSize } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import { ShoppingBag, Star, ArrowUpRight, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  return (
    <div className="group bg-white rounded-xl border border-[#e6dfd5] hover:border-[#123824]/40 transition-all duration-300 shadow-xs hover:shadow-luxury-hover hover:-translate-y-1 flex flex-col overflow-hidden">
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square w-full bg-[#f6f2ea] overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="bg-[#123824] text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-sm shadow-xs">
              {product.badge}
            </span>
          )}
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="bg-[#c59b27] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-xs">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Hover Action quick view icon */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="w-8 h-8 rounded-full bg-white/90 text-[#123824] flex items-center justify-center shadow-md">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-semibold text-[#c59b27] uppercase tracking-wider">
              {product.categoryLabel}
            </span>
            <div className="flex items-center gap-1 text-[#c59b27]">
              <Star className="w-3.5 h-3.5 fill-[#c59b27]" />
              <span className="text-[11px] font-medium text-[#59534b]">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-serif text-base font-semibold text-[#123824] group-hover:text-[#c59b27] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short traditional purpose */}
          <p className="text-xs text-[#6a6660] line-clamp-2 leading-relaxed pt-1">
            {product.traditionalPurpose}
          </p>
        </div>

        {/* Size Selection Pills */}
        {product.sizes.length > 1 && (
          <div className="pt-1">
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((sz) => {
                const isSelected = selectedSize.name === sz.name;
                return (
                  <button
                    key={sz.name}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(sz);
                    }}
                    className={`text-[11px] px-2 py-0.8 rounded border transition-colors ${
                      isSelected
                        ? "bg-[#123824] text-white border-[#123824] font-medium"
                        : "bg-[#faf8f5] text-[#59534b] border-[#e6dfd5] hover:border-[#123824]"
                    }`}
                  >
                    {sz.weight}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price & Add to Cart Footer */}
        <div className="pt-2 border-t border-[#f4eee5] flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-[#123824]">
              ₨ {selectedSize.price.toLocaleString()}
            </div>
            {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
              <div className="text-xs text-[#7a7268] line-through">
                ₨ {selectedSize.originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
              isAdded
                ? "bg-[#256644] text-white shadow-xs"
                : "bg-[#123824] hover:bg-[#0c2719] text-white shadow-xs hover:shadow-md"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
