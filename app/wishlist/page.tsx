"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { PRODUCTS, CLINIC_INFO, Product, ProductSize } from "@/app/data/products";
import { INITIAL_NUSKHAJAAT, Nuskha, calculateNuskhaPrice } from "@/app/data/nuskhajaat";
import ProductCard from "@/app/components/ProductCard";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  Check,
  ChevronRight,
  Truck,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Package,
  ShieldCheck,
  RotateCcw,
  Star,
  CheckCircle2,
  Stethoscope,
  ExternalLink,
  Scale,
  Leaf,
} from "lucide-react";

export default function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
    toggleWishlist,
    addToCart,
    addNuskhaToCart,
    showToast,
  } = useCart();

  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [nuskhajaatList, setNuskhajaatList] = useState<Nuskha[]>(INITIAL_NUSKHAJAAT);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ProductSize>>({});
  const [addedStates, setAddedStates] = useState<Record<string, boolean>>({});
  const [isSharing, setIsSharing] = useState(false);

  // Fetch latest products and nuskhajaat from API if available
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, nuskhaRes] = await Promise.allSettled([
          fetch("/api/products"),
          fetch("/api/nuskhajaat"),
        ]);

        if (prodRes.status === "fulfilled" && prodRes.value.ok) {
          const data = await prodRes.value.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setProductsList(data.data);
          }
        }

        if (nuskhaRes.status === "fulfilled" && nuskhaRes.value.ok) {
          const data = await nuskhaRes.value.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setNuskhajaatList(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products/nuskhajaat for wishlist:", err);
      }
    }
    loadData();
  }, []);

  // Filter products and nuskhajaat that exist in the wishlist
  const wishlistProducts = useMemo(() => {
    return productsList.filter((product) => wishlist.includes(product.id));
  }, [productsList, wishlist]);

  const wishlistNuskhajaat = useMemo(() => {
    return nuskhajaatList.filter((nuskha) => wishlist.includes(nuskha.id));
  }, [nuskhajaatList, wishlist]);

  const totalSavedCount = wishlistProducts.length + wishlistNuskhajaat.length;

  // Handle individual size change
  const handleSizeChange = (productId: string, size: ProductSize) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  // Handle add single product to bag
  const handleAddItemToCart = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0];
    addToCart(product, size, 1);
    setAddedStates((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedStates((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  // Handle quick add nuskha to bag
  const handleAddNuskhaToCart = (nuskha: Nuskha) => {
    const defaultPricing = calculateNuskhaPrice(
      nuskha,
      {},
      1.0,
      nuskha.preparationType === "Majun" ? "Majun" : "Safoof"
    );

    const ingredientsSummary = nuskha.ingredients
      .map((ing) => `${ing.name} (${ing.defaultQuantity}${ing.unit === "grams" ? "g" : ing.unit})`)
      .join(", ");

    addNuskhaToCart(nuskha, {
      courseDuration: "30 Days Standard Supply",
      preparationFormat:
        nuskha.preparationType === "Majun"
          ? "Traditional Majun (Honey Base)"
          : "Fine Herb Powder (Safoof / سفوف)",
      finalPrice: defaultPricing.finalPrice,
      totalWeightGrams: defaultPricing.totalWeightGrams,
      ingredientsSummary,
      quantity: 1,
    });

    setAddedStates((prev) => ({ ...prev, [nuskha.id]: true }));
    setTimeout(() => {
      setAddedStates((prev) => ({ ...prev, [nuskha.id]: false }));
    }, 1800);
  };

  // Add all in-stock items to bag
  const handleAddAllToCart = () => {
    let addedCount = 0;

    // Add standard remedies
    wishlistProducts.forEach((product) => {
      const size = selectedSizes[product.id] || product.sizes[0];
      const inStock = size.available !== undefined ? size.available > 0 : product.inStock;
      if (inStock) {
        addToCart(product, size, 1);
        addedCount++;
      }
    });

    // Add compound nuskhajaat
    wishlistNuskhajaat.forEach((nuskha) => {
      const defaultPricing = calculateNuskhaPrice(
        nuskha,
        {},
        1.0,
        nuskha.preparationType === "Majun" ? "Majun" : "Safoof"
      );

      const ingredientsSummary = nuskha.ingredients
        .map((ing) => `${ing.name} (${ing.defaultQuantity}${ing.unit === "grams" ? "g" : ing.unit})`)
        .join(", ");

      addNuskhaToCart(nuskha, {
        courseDuration: "30 Days Standard Supply",
        preparationFormat:
          nuskha.preparationType === "Majun"
            ? "Traditional Majun (Honey Base)"
            : "Fine Herb Powder (Safoof / سفوف)",
        finalPrice: defaultPricing.finalPrice,
        totalWeightGrams: defaultPricing.totalWeightGrams,
        ingredientsSummary,
        quantity: 1,
      });
      addedCount++;
    });

    if (addedCount > 0) {
      showToast(`Added ${addedCount} saved ${addedCount === 1 ? "remedy" : "remedies"} to your shopping bag.`);
    } else {
      showToast("No in-stock items available to add to bag.");
    }
  };

  // Share wishlist via WhatsApp
  const handleShareWishlistWhatsApp = () => {
    if (totalSavedCount === 0) return;
    setIsSharing(true);

    const productLines = wishlistProducts.map((p, idx) => {
      const s = selectedSizes[p.id] || p.sizes[0];
      return `${idx + 1}. *${p.name}* (${s.weight}) - Rs. ${s.price.toLocaleString()}`;
    });

    const nuskhaLines = wishlistNuskhajaat.map((n, idx) => {
      const defaultPricing = calculateNuskhaPrice(
        n,
        {},
        1.0,
        n.preparationType === "Majun" ? "Majun" : "Safoof"
      );
      return `${wishlistProducts.length + idx + 1}. *[Nuskha] ${n.title} (${n.urduTitle})* - Rs. ${defaultPricing.finalPrice.toLocaleString()}`;
    });

    const combinedList = [...productLines, ...nuskhaLines].join("\n");

    const totalEstimate =
      wishlistProducts.reduce((sum, p) => {
        const s = selectedSizes[p.id] || p.sizes[0];
        return sum + s.price;
      }, 0) +
      wishlistNuskhajaat.reduce((sum, n) => {
        const pricing = calculateNuskhaPrice(
          n,
          {},
          1.0,
          n.preparationType === "Majun" ? "Majun" : "Safoof"
        );
        return sum + pricing.finalPrice;
      }, 0);

    const message = encodeURIComponent(
      `Assalam-o-Alaikum Hakim Sahib, I have curated my saved herbal remedies list from Tameer-e-Sehat:\n\n${combinedList}\n\n*Estimated Total:* Rs. ${totalEstimate.toLocaleString()}\n\nPlease guide me regarding the right course dosage and how to proceed with the order.`
    );

    const url = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${message}`;
    window.open(url, "_blank");
    setTimeout(() => setIsSharing(false), 1200);
  };

  // Recommended products when wishlist is empty or for cross-discovery
  const recommendedProducts = useMemo(() => {
    return productsList.filter((p) => !wishlist.includes(p.id)).slice(0, 4);
  }, [productsList, wishlist]);

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* ─── 1. BREADCRUMBS ─── */}
      <div className="bg-white border-b border-[#e6dfd5] py-3 text-xs text-[#59534b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#22623a]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#d7c9b8]" />
            <Link href="/products" className="hover:text-[#22623a]">
              Apothecary
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#d7c9b8]" />
            <span className="text-[#22623a] font-semibold">
              Saved Remedies &amp; Wishlist ({totalSavedCount})
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#7a7268]">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Saved in your private browser session</span>
          </div>
        </div>
      </div>

      {/* ─── 2. HEADER BANNER ─── */}
      <section className="bg-gradient-to-b from-white to-[#faf8f5] border-b border-[#e6dfd5] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f4f9f5] border border-[#d8ecde] rounded-full text-xs font-bold text-[#22623a]">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>Personal Apothecary Wishlist</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a]">
                My Saved Remedies &amp; Formulations
              </h1>
              <p className="text-xs sm:text-sm text-[#59534b] max-w-2xl leading-relaxed">
                Review your saved Unani herbs, natural syrups, therapeutic oils, and compound nuskhajaat. You can move items directly to your shopping bag, order via Cash on Delivery, or share your selection with Hakim Muhammad Waqas on WhatsApp.
              </p>
            </div>

            {totalSavedCount > 0 && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={handleAddAllToCart}
                  className="px-4 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                  <span>Move All to Bag</span>
                </button>

                <button
                  onClick={handleShareWishlistWhatsApp}
                  disabled={isSharing}
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share with Hakim</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3. MAIN WISHLIST CONTENT ─── */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {totalSavedCount === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-[#e6dfd5] p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-xs">
              <div className="w-20 h-20 bg-[#faf8f5] rounded-full flex items-center justify-center mx-auto border border-[#e6dfd5]">
                <Heart className="w-10 h-10 text-[#d7c9b8]" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                  Your Wishlist is Empty
                </h2>
                <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed max-w-md mx-auto">
                  You haven&apos;t saved any remedies yet. Click the heart icon on any formulation in our apothecary to bookmark it for later review or clinical consult.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#22623a] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#1b502e] transition-all shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                  <span>Explore Apothecary</span>
                </Link>

                <Link
                  href="/nuskhajaat"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#e6dfd5] text-[#22623a] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#faf8f5] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#c59b27]" />
                  <span>Compound Nuskhajaat</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Populated Wishlist Grid */
            <div className="space-y-10">
              {/* Top Controls Bar */}
              <div className="flex items-center justify-between text-xs text-[#7a7268] pb-3 border-b border-[#e6dfd5]">
                <span>
                  Showing <strong>{totalSavedCount}</strong> saved {totalSavedCount === 1 ? "item" : "items"}
                  {wishlistNuskhajaat.length > 0 && wishlistProducts.length > 0 && (
                    <span className="ml-1 text-[#22623a]">
                      ({wishlistProducts.length} remedies, {wishlistNuskhajaat.length} compound nuskhajaat)
                    </span>
                  )}
                </span>
                <span className="text-[#2d7648] font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Free Nationwide Delivery above Rs. {CLINIC_INFO.freeShippingThreshold.toLocaleString()}
                </span>
              </div>

              {/* SECTION A: INDIVIDUAL HERBS, OILS & SYRUPS */}
              {wishlistProducts.length > 0 && (
                <div className="space-y-4">
                  {wishlistNuskhajaat.length > 0 && (
                    <h3 className="font-serif text-lg font-bold text-[#22623a] flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-[#2d7648]" />
                      <span>Single Herbs, Syrups &amp; Oils ({wishlistProducts.length})</span>
                    </h3>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map((product) => {
                      const currentSelectedSize = selectedSizes[product.id] || product.sizes[0];
                      const inStock =
                        currentSelectedSize.available !== undefined
                          ? currentSelectedSize.available > 0
                          : product.inStock;
                      const isAdded = !!addedStates[product.id];

                      return (
                        <div
                          key={product.id}
                          className="group bg-white rounded-2xl border border-[#e6dfd5] hover:border-[#22623a]/40 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative"
                        >
                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              removeFromWishlist(product.id);
                              showToast(`Removed "${product.name}" from your wishlist.`);
                            }}
                            className="absolute top-4 right-4 p-2 text-[#7a7268] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-10 cursor-pointer"
                            title="Remove from saved"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-3.5">
                            {/* Image & Main Info */}
                            <div className="flex gap-4 items-start">
                              <Link
                                href={`/products/${product.slug}`}
                                className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#faf8f5] rounded-xl overflow-hidden shrink-0 border border-[#f4eee5] block"
                              >
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="120px"
                                />
                                {product.badge && (
                                  <span className="absolute bottom-1.5 left-1.5 bg-[#22623a]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs backdrop-blur-2xs">
                                    {product.badge}
                                  </span>
                                )}
                              </Link>

                              <div className="flex-1 min-w-0 pr-6">
                                <span className="text-[10px] font-bold text-[#c59b27] uppercase tracking-wider block truncate">
                                  {product.categoryLabel || product.category}
                                </span>
                                <Link
                                  href={`/products/${product.slug}`}
                                  className="font-serif text-sm sm:text-base font-bold text-[#22623a] hover:text-[#c59b27] transition-colors line-clamp-2 block leading-snug"
                                >
                                  {product.name}
                                </Link>
                                {product.urduName && (
                                  <span className="font-urdu text-xs text-[#7a7268] block mt-0.5">
                                    {product.urduName}
                                  </span>
                                )}

                                {/* Rating */}
                                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                                  <div className="flex items-center text-[#c59b27]">
                                    <Star className="w-3 h-3 fill-current" />
                                  </div>
                                  <span className="font-bold text-[#22623a] text-[11px]">
                                    {product.rating}
                                  </span>
                                  <span className="text-[10px] text-[#7a7268]">
                                    ({product.reviewCount})
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Short Description */}
                            <p className="text-xs text-[#59534b] line-clamp-2 leading-relaxed">
                              {product.shortDescription || product.traditionalPurpose}
                            </p>

                            {/* Size / Weight Selector */}
                            <div className="space-y-1.5 pt-2 border-t border-[#f4eee5]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#7a7268] font-medium">Select Packaging:</span>
                                <span className="text-[#22623a] font-bold">
                                  Rs. {currentSelectedSize.price.toLocaleString()}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {product.sizes.map((size) => {
                                  const isSelected = currentSelectedSize.name === size.name;
                                  return (
                                    <button
                                      key={size.name}
                                      onClick={() => handleSizeChange(product.id, size)}
                                      className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-[#22623a] text-white border-[#22623a] font-bold shadow-2xs"
                                          : "bg-white text-[#59534b] border-[#e6dfd5] hover:border-[#22623a]"
                                      }`}
                                    >
                                      {size.weight}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-[#f4eee5] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-base font-bold text-[#22623a]">
                                Rs. {currentSelectedSize.price.toLocaleString()}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  inStock
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {inStock ? "In Stock" : "Sold Out"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAddItemToCart(product)}
                                disabled={!inStock}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                  !inStock
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : isAdded
                                    ? "bg-[#2d7648] text-white"
                                    : "bg-[#22623a] hover:bg-[#1b502e] text-white"
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added to Bag</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5 text-[#c59b27]" />
                                    <span>+ Add to Bag</span>
                                  </>
                                )}
                              </button>

                              <Link
                                href={`/products/${product.slug}`}
                                className="p-2.5 bg-[#faf8f5] hover:bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] rounded-xl transition-colors shrink-0"
                                title="View Details"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION B: COMPOUND NUSKHAJAAT FORMULATIONS */}
              {wishlistNuskhajaat.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="font-serif text-lg font-bold text-[#22623a] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c59b27]" />
                    <span>Saved Compound Nuskhajaat ({wishlistNuskhajaat.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistNuskhajaat.map((nuskha) => {
                      const defaultPricing = calculateNuskhaPrice(
                        nuskha,
                        {},
                        1.0,
                        nuskha.preparationType === "Majun" ? "Majun" : "Safoof"
                      );
                      const isAdded = !!addedStates[nuskha.id];

                      return (
                        <div
                          key={nuskha.id}
                          className="group bg-white rounded-2xl border border-[#e6dfd5] hover:border-[#22623a]/40 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative"
                        >
                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              removeFromWishlist(nuskha.id);
                              showToast(`Removed "${nuskha.title}" from your wishlist.`);
                            }}
                            className="absolute top-4 right-4 p-2 text-[#7a7268] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-10 cursor-pointer"
                            title="Remove from saved"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-3.5">
                            {/* Image & Main Info */}
                            <div className="flex gap-4 items-start">
                              <Link
                                href={`/nuskhajaat/${nuskha.slug}`}
                                className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#faf8f5] rounded-xl overflow-hidden shrink-0 border border-[#f4eee5] block"
                              >
                                <Image
                                  src={nuskha.image}
                                  alt={nuskha.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="120px"
                                />
                                <span className="absolute bottom-1.5 left-1.5 bg-[#22623a]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs backdrop-blur-2xs">
                                  {nuskha.preparationType}
                                </span>
                              </Link>

                              <div className="flex-1 min-w-0 pr-6">
                                <span className="text-[10px] font-bold text-[#22623a] uppercase tracking-wider block truncate">
                                  {nuskha.categoryLabel}
                                </span>
                                <Link
                                  href={`/nuskhajaat/${nuskha.slug}`}
                                  className="font-serif text-sm sm:text-base font-bold text-[#22623a] hover:text-[#c59b27] transition-colors line-clamp-2 block leading-snug"
                                >
                                  {nuskha.title}
                                </Link>
                                <span className="font-serif text-xs text-[#8c6a15] font-semibold block mt-0.5" dir="rtl">
                                  {nuskha.urduTitle}
                                </span>

                                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#7a7268]">
                                  <span className="px-1.5 py-0.2 bg-[#f4f9f5] border border-[#d8ecde] text-[#22623a] rounded text-[10px] font-semibold">
                                    Mizaj: {nuskha.mizaj}
                                  </span>
                                  <span>·</span>
                                  <span>{nuskha.ingredients.length} Herbs</span>
                                </div>
                              </div>
                            </div>

                            {/* Short Description */}
                            <p className="text-xs text-[#59534b] line-clamp-2 leading-relaxed">
                              {nuskha.shortDescription}
                            </p>

                            {/* Key Ingredients Pill List */}
                            <div className="space-y-1 pt-2 border-t border-[#f4eee5]">
                              <div className="flex items-center justify-between text-[11px] text-[#7a7268]">
                                <span className="font-semibold text-[#22623a] flex items-center gap-1">
                                  <Leaf className="w-3 h-3 text-[#2d7648]" />
                                  Pure Botanical Herbs:
                                </span>
                                <span>~{defaultPricing.totalWeightGrams}g Total</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {nuskha.ingredients.slice(0, 3).map((ing) => (
                                  <span
                                    key={ing.id || ing.name}
                                    className="px-1.5 py-0.5 bg-[#f4f9f5] text-[#22623a] rounded text-[10px] font-medium"
                                  >
                                    {ing.name}
                                  </span>
                                ))}
                                {nuskha.ingredients.length > 3 && (
                                  <span className="px-1.5 py-0.5 bg-[#faf8f5] text-[#7a7268] rounded text-[10px] font-semibold">
                                    +{nuskha.ingredients.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-[#f4eee5] space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase text-[#7a7268] block">30 Days Supply:</span>
                                <span className="font-serif text-base font-bold text-[#22623a]">
                                  Rs. {defaultPricing.finalPrice.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                Freshly Compounded
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href={`/nuskhajaat/${nuskha.slug}`}
                                className="py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                              >
                                <Scale className="w-3.5 h-3.5 text-[#c59b27]" />
                                <span>Customize</span>
                              </Link>

                              <button
                                onClick={() => handleAddNuskhaToCart(nuskha)}
                                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                  isAdded
                                    ? "bg-[#2d7648] text-white"
                                    : "bg-[#f4f9f5] hover:bg-[#d8ecde] text-[#22623a] border border-[#d8ecde]"
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <span>+ Quick Add</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── 4. RECOMMENDED SECTION ─── */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-[#e6dfd5] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#c59b27] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Popular Unani Remedies</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                    Frequently Saved by Patients
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-bold text-[#22623a] hover:text-[#c59b27] flex items-center gap-1 transition-colors"
                >
                  <span>View All Formulations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recommendedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode="grid" />
                ))}
              </div>
            </div>
          )}

          {/* ─── 5. CLINICAL ASSURANCE FOOTER ─── */}
          <div className="mt-14 p-6 bg-white rounded-2xl border border-[#e6dfd5] grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#f4f9f5] rounded-xl text-[#22623a] shrink-0 border border-[#d8ecde]">
                <Truck className="w-5 h-5 text-[#22623a]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#22623a]">Nationwide Cash on Delivery</h3>
                <p className="text-[11px] text-[#59534b] mt-0.5">
                  Delivered safely to your doorstep across Karachi, Lahore, Islamabad, and all cities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#fdfbf3] rounded-xl text-[#c59b27] shrink-0 border border-[#fbf3dc]">
                <ShieldCheck className="w-5 h-5 text-[#c59b27]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#22623a]">100% Pure &amp; Chemical-Free</h3>
                <p className="text-[11px] text-[#59534b] mt-0.5">
                  Prepared according to authentic Unani pharmacopoeia with lab-tested botanical roots.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#f4f9f5] rounded-xl text-[#22623a] shrink-0 border border-[#d8ecde]">
                <Stethoscope className="w-5 h-5 text-[#22623a]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#22623a]">Qualified Hakim Guidance</h3>
                <p className="text-[11px] text-[#59534b] mt-0.5">
                  Free consultation on herbal Mizaj compatibility, dosages, and dietary precautions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
