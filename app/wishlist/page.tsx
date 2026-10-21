"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { CLINIC_INFO, Product, ProductSize } from "@/app/data/products";
import { getSafeProductImage } from "@/lib/utils";
import ProductCard from "@/app/components/ProductCard";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Check,
  ChevronRight,
  Truck,
  Sparkles,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  ExternalLink,
  Star,
  Loader2,
} from "lucide-react";

export default function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
    addToCart,
    showToast,
  } = useCart();

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ProductSize>>({});
  const [addedStates, setAddedStates] = useState<Record<string, boolean>>({});
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) {
          const data = await prodRes.json();
          if (data.success && Array.isArray(data.data)) {
            setProductsList(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products for wishlist:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const wishlistProducts = useMemo(() => {
    return productsList.filter((product) => wishlist.includes(product.id));
  }, [productsList, wishlist]);

  const totalSavedCount = wishlistProducts.length;

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

  const handleAddAllToCart = () => {
    let addedCount = 0;

    wishlistProducts.forEach((product) => {
      const size = selectedSizes[product.id] || product.sizes[0];
      if (!size) return;
      const inStock = size.available !== undefined ? size.available > 0 : product.inStock;
      if (inStock) {
        addToCart(product, size, 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      showToast(`Added ${addedCount} saved ${addedCount === 1 ? "remedy" : "remedies"} to your shopping bag.`);
    } else {
      showToast("No in-stock items available to add to bag.");
    }
  };

  const handleShareWishlistWhatsApp = () => {
    if (totalSavedCount === 0) return;
    setIsSharing(true);

    const productLines = wishlistProducts.map((p, idx) => {
      const s = selectedSizes[p.id] || p.sizes[0];
      const weight = s ? s.weight : "Standard";
      const price = s ? s.price : p.price;
      return `${idx + 1}. *${p.name}* (${weight}) - Rs. ${price.toLocaleString()}`;
    });

    const combinedList = productLines.join("\n");

    const totalEstimate = wishlistProducts.reduce((sum, p) => {
      const s = selectedSizes[p.id] || p.sizes[0];
      return sum + (s ? s.price : p.price);
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
    <div className="bg-surface min-h-screen">
      {/* ─── 1. BREADCRUMBS ─── */}
      <div className="bg-white border-b border-line py-3 text-xs text-ink-body">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-on-inverse" />
            <Link href="/products" className="hover:text-primary">
              Apothecary
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-on-inverse" />
            <span className="text-primary font-semibold">
              Saved Remedies &amp; Wishlist ({totalSavedCount})
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-ink-subtle">
            <Heart className="w-3.5 h-3.5 text-danger fill-danger" />
            <span>Saved in your private browser session</span>
          </div>
        </div>
      </div>

      {/* ─── 2. HEADER BANNER ─── */}
      <section className="bg-gradient-to-b from-white to-sand-50 border-b border-line py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green-50 border border-brand-green-100 rounded-full text-xs font-bold text-primary">
                <Heart className="w-3.5 h-3.5 text-danger fill-danger" />
                <span>Personal Apothecary Wishlist</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                My Saved Remedies &amp; Formulations
              </h1>
              <p className="text-xs sm:text-sm text-ink-body max-w-2xl leading-relaxed">
                Review your saved Unani herbs, natural syrups, and therapeutic oils. You can move items directly to your shopping bag, order via Cash on Delivery, or share your selection with Hakim Muhammad Waqas on WhatsApp.
              </p>
            </div>

            {totalSavedCount > 0 && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={handleAddAllToCart}
                  className="px-4 py-2.5 bg-primary hover:bg-brand-green-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-gold-300" />
                  <span>Move All to Bag</span>
                </button>

                <button
                  onClick={handleShareWishlistWhatsApp}
                  disabled={isSharing}
                  className="px-4 py-2.5 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
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
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-xs text-ink-subtle">Loading your saved remedies...</p>
            </div>
          ) : totalSavedCount === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-line p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-xs">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto border border-line">
                <Heart className="w-10 h-10 text-on-inverse" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                  Your Wishlist is Empty
                </h2>
                <p className="text-xs sm:text-sm text-ink-body leading-relaxed max-w-md mx-auto">
                  You haven&apos;t saved any remedies yet. Click the heart icon on any formulation in our apothecary to bookmark it for later review or clinical consult.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-green-800 transition-all shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-gold-300" />
                  <span>Explore Apothecary</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Populated Wishlist Grid */
            <div className="space-y-10">
              {/* Top Controls Bar */}
              <div className="flex items-center justify-between text-xs text-ink-subtle pb-3 border-b border-line">
                <span>
                  Showing <strong>{totalSavedCount}</strong> saved {totalSavedCount === 1 ? "item" : "items"}
                </span>
                <span className="text-brand-green-600 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Free Nationwide Delivery above Rs. {CLINIC_INFO.freeShippingThreshold.toLocaleString()}
                </span>
              </div>

              {/* SECTION A: INDIVIDUAL HERBS, OILS & SYRUPS */}
              {wishlistProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map((product) => {
                      const currentSelectedSize = (product.sizes && product.sizes.length > 0)
                        ? selectedSizes[product.id] || product.sizes[0]
                        : { name: "Default", weight: "Standard", price: product.price, available: product.inStock ? 10 : 0 };
                      const inStock =
                        currentSelectedSize.available !== undefined
                          ? currentSelectedSize.available > 0
                          : product.inStock;
                      const isAdded = !!addedStates[product.id];

                      return (
                        <div
                          key={product.id}
                          className="group bg-white rounded-2xl border border-line hover:border-primary/40 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative"
                        >
                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              removeFromWishlist(product.id);
                              showToast(`Removed "${product.name}" from your wishlist.`);
                            }}
                            className="absolute top-4 right-4 p-2 text-ink-subtle hover:text-danger hover:bg-danger-soft rounded-full transition-colors z-10 cursor-pointer"
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
                                className="relative w-24 h-24 sm:w-28 sm:h-28 bg-surface rounded-xl overflow-hidden shrink-0 border border-sand-100 block"
                              >
                                <Image
                                  src={getSafeProductImage(product.image)}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="120px"
                                />
                                {product.badge && (
                                  <span className="absolute bottom-1.5 left-1.5 bg-primary/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs backdrop-blur-2xs">
                                    {product.badge}
                                  </span>
                                )}
                              </Link>

                              <div className="flex-1 min-w-0 pr-6">
                                <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block truncate">
                                  {product.categoryLabel || product.category}
                                </span>
                                <Link
                                  href={`/products/${product.slug}`}
                                  className="font-serif text-sm sm:text-base font-bold text-primary hover:text-secondary-text transition-colors line-clamp-2 block leading-snug"
                                >
                                  {product.name}
                                </Link>
                                {product.urduName && (
                                  <span className="font-urdu text-xs text-ink-subtle block mt-0.5">
                                    {product.urduName}
                                  </span>
                                )}

                                {/* Rating */}
                                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                                  <div className="flex items-center text-secondary-text">
                                    <Star className="w-3 h-3 fill-current" />
                                  </div>
                                  <span className="font-bold text-primary text-[11px]">
                                    {product.rating || 5.0}
                                  </span>
                                  <span className="text-[10px] text-ink-subtle">
                                    ({product.reviewCount || 0})
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Short Description */}
                            <p className="text-xs text-ink-body line-clamp-2 leading-relaxed">
                              {product.shortDescription || product.traditionalPurpose}
                            </p>

                            {/* Size / Weight Selector */}
                            {product.sizes && product.sizes.length > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-sand-100">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-ink-subtle font-medium">Select Packaging:</span>
                                  <span className="text-primary font-bold">
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
                                            ? "bg-primary text-white border-primary font-bold shadow-2xs"
                                            : "bg-white text-ink-body border-line hover:border-primary"
                                        }`}
                                      >
                                        {size.weight}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-sand-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-base font-bold text-primary">
                                Rs. {currentSelectedSize.price.toLocaleString()}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  inStock
                                    ? "bg-success-soft text-success"
                                    : "bg-danger-soft text-danger"
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
                                    ? "bg-surface-sunken text-ink-subtle cursor-not-allowed"
                                    : isAdded
                                    ? "bg-brand-green-600 text-white"
                                    : "bg-primary hover:bg-brand-green-800 text-white"
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added to Bag</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5 text-secondary-text" />
                                    <span>+ Add to Bag</span>
                                  </>
                                )}
                              </button>

                              <Link
                                href={`/products/${product.slug}`}
                                className="p-2.5 bg-surface hover:bg-surface-sunken border border-line text-primary rounded-xl transition-colors shrink-0"
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
            </div>
          )}

          {/* ─── 4. RECOMMENDED SECTION ─── */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-line space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Popular Unani Remedies</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                    Frequently Saved by Patients
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-bold text-primary hover:text-secondary-text flex items-center gap-1 transition-colors"
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
          <div className="mt-14 p-6 bg-white rounded-2xl border border-line grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-green-50 rounded-xl text-primary shrink-0 border border-brand-green-100">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-primary">Nationwide Cash on Delivery</h3>
                <p className="text-[11px] text-ink-body mt-0.5">
                  Delivered safely to your doorstep across Karachi, Lahore, Islamabad, and all cities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-gold-50 rounded-xl text-secondary-text shrink-0 border border-brand-gold-100">
                <ShieldCheck className="w-5 h-5 text-secondary-text" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-primary">100% Pure &amp; Chemical-Free</h3>
                <p className="text-[11px] text-ink-body mt-0.5">
                  Prepared according to authentic Unani pharmacopoeia with lab-tested botanical roots.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-green-50 rounded-xl text-primary shrink-0 border border-brand-green-100">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-primary">Qualified Hakim Guidance</h3>
                <p className="text-[11px] text-ink-body mt-0.5">
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
