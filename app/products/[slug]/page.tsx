"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, ProductSize, CLINIC_INFO } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import ProductCard from "@/app/components/ProductCard";
import {
  ShoppingBag,
  Star,
  Check,
  Truck,
  ShieldCheck,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Leaf,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const generateDirectWhatsAppUrl = () => {
    const text = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to order:\n\n*Product:* ${product.name}\n*Selected Size:* ${selectedSize.weight} (₨ ${selectedSize.price})\n*Quantity:* ${quantity}\n*Total:* ₨ ${(selectedSize.price * quantity).toLocaleString()}\n\nPlease confirm availability and Cash on Delivery details to my city. Thank you!`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="bg-[#faf8f5]">
      {/* Breadcrumbs Navigation */}
      <div className="bg-white border-b border-[#e6dfd5] py-3 text-xs text-[#6a6660]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#123824]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#d7c9b8]" />
          <Link href="/products" className="hover:text-[#123824]">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#d7c9b8]" />
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-[#123824]"
          >
            {product.categoryLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#d7c9b8]" />
          <span className="text-[#123824] font-medium truncate">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Product Showcase */}
      <section className="py-10 sm:py-12 border-b border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

            {/* Product Imagery (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#e6dfd5] shadow-xs">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  priority
                />

                {product.badge && (
                  <span className="absolute top-4 left-4 bg-[#123824] text-white text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Quality & Origin Banner below image */}
              <div className="p-3.5 bg-white rounded-xl border border-[#e6dfd5] shadow-xs flex items-center justify-between text-xs text-[#59534b]">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#256644]" />
                  <span>100% Pure Natural Herbs</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#c59b27]" />
                  <span>Zero Chemicals Added</span>
                </div>
              </div>
            </div>

            {/* Product Buying & Info Panel (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Category & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase font-semibold text-[#c59b27] tracking-wider">
                  {product.categoryLabel}
                </span>
                <span className="text-[#256644] font-medium bg-[#f2f9f5] px-2.5 py-0.5 rounded text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Dispatch
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#123824] leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex text-[#c59b27]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-[#c59b27]"
                          : "text-[#d7c9b8]"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-[#1a1816]">
                  {product.rating} / 5.0
                </span>
                <span className="text-[#6a6660]">
                  ({product.reviewCount} customer reviews)
                </span>
              </div>

              {/* Price & Discounts */}
              <div className="p-4 bg-white rounded-xl border border-[#e6dfd5] shadow-xs flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#123824]">
                  ₨ {selectedSize.price.toLocaleString()}
                </span>
                {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                  <span className="text-sm text-[#7a7268] line-through">
                    ₨ {selectedSize.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="text-xs font-bold text-[#c59b27] bg-[#fdfbf3] px-2 py-0.5 rounded border border-[#fbf3dc]">
                    Save {product.discountPercentage}%
                  </span>
                )}
                <span className="text-[11px] text-[#6a6660] ml-auto">
                  Cash on Delivery Available
                </span>
              </div>

              {/* Short Purpose Description */}
              <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Size Selector */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-[#123824] uppercase tracking-wider">
                  Select Size:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize.name === size.name;
                    return (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-xs transition-all text-left ${
                          isSelected
                            ? "bg-[#123824] text-white border-[#123824] shadow-xs"
                            : "bg-white text-[#1a1816] border-[#e6dfd5] hover:border-[#123824]"
                        }`}
                      >
                        <div className="font-semibold">{size.weight}</div>
                        <div className={`text-[11px] ${isSelected ? "text-[#c59b27]" : "text-[#6a6660]"}`}>
                          ₨ {size.price.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-[#e6dfd5] rounded-lg bg-white overflow-hidden shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-3 text-sm text-[#6a6660] hover:text-[#123824] hover:bg-[#faf8f5] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold text-xs text-[#1a1816]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 py-3 text-sm text-[#6a6660] hover:text-[#123824] hover:bg-[#faf8f5] transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 ${
                      isAdded
                        ? "bg-[#256644] text-white"
                        : "bg-[#123824] hover:bg-[#0c2719] text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                        <span>Add to Cart · ₨ {(selectedSize.price * quantity).toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct WhatsApp Order */}
                <a
                  href={generateDirectWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Directly via WhatsApp</span>
                </a>
              </div>

              {/* Delivery Info Box */}
              <div className="pt-4 border-t border-[#e6dfd5] space-y-2 text-xs text-[#6a6660]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#256644]" />
                  <span>
                    <strong>Free Delivery</strong> across Pakistan on orders above ₨ 2,000 (Flat ₨ 200 otherwise).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#c59b27]" />
                  <span>Karachi delivery in 24-48 hours · Other cities in 2-4 business days.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Detailed Remedy Information & Advice */}
      <section className="py-14 bg-white border-b border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* 2-Col Cards: Description & Hakim's Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 sm:p-8 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-3">
              <div className="flex items-center gap-2 text-[#c59b27]">
                <Sparkles className="w-4 h-4" />
                <h2 className="font-serif text-base font-bold text-[#123824] uppercase tracking-wider">
                  How This Remedy Helps
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                {product.traditionalPurpose}
              </p>
              <div className="pt-3 border-t border-[#e6dfd5]/60 text-xs text-[#59534b] leading-relaxed">
                {product.fullDescription}
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-3">
              <div className="flex items-center gap-2 text-[#256644]">
                <HeartHandshake className="w-4 h-4" />
                <h2 className="font-serif text-base font-bold text-[#123824] uppercase tracking-wider">
                  Hakim&apos;s Advice & How to Use
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                {product.hakimAdvice}
              </p>
              <div className="pt-3 border-t border-[#e6dfd5]/60 text-xs text-[#6a6660]">
                <strong>Recommended Dosage:</strong> {product.dosage}
              </div>
              <div className="text-xs text-[#6a6660]">
                <strong>How to take:</strong> {product.howToUse}
              </div>
            </div>
          </div>

          {/* Key Benefits Checklist */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#123824]">
              Key Health Benefits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-[#faf8f5] rounded-xl border border-[#e6dfd5]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#123824] text-[#c59b27] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-xs sm:text-sm text-[#1e1c19] font-medium">
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#123824]">
              Natural Herbal Ingredients
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left bg-white border border-[#e6dfd5] rounded-xl overflow-hidden">
                <thead className="bg-[#faf8f5] text-[#123824] font-semibold border-b border-[#e6dfd5]">
                  <tr>
                    <th className="p-3.5">Natural Ingredient</th>
                    <th className="p-3.5">How It Works in This Remedy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4eee5]">
                  {product.ingredients.map((ing, i) => (
                    <tr key={i} className="hover:bg-[#faf8f5]">
                      <td className="p-3.5 font-medium text-[#1a1816]">{ing.name}</td>
                      <td className="p-3.5 text-[#59534b]">{ing.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#123824]">
              More Remedies in {product.categoryLabel}
            </h2>
            <Link
              href={`/products?category=${product.category}`}
              className="text-xs font-semibold uppercase tracking-wider text-[#123824] hover:text-[#c59b27] transition-colors"
            >
              View Category &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
