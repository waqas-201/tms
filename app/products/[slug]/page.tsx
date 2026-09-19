"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, Product, ProductSize, CLINIC_INFO } from "@/app/data/products";
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
  Heart,
  Share2,
  AlertCircle,
  Plus,
  Minus,
  MessageSquare,
  BadgeCheck,
  HelpCircle,
  BookOpen,
  Info,
  Calendar,
  X,
  Send,
  Lock,
} from "lucide-react";

interface CustomerReview {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const initialProduct = PRODUCTS.find((p) => p.slug === resolvedParams.slug) || null;
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [hasFetched, setHasFetched] = useState(false);

  // Load live product from API
  useEffect(() => {
    async function loadLiveProduct() {
      try {
        const res = await fetch(`/api/products/${resolvedParams.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setProduct(json.data);
            setSelectedSize((prev) => {
              if (!prev) return json.data.sizes[0];
              const match = json.data.sizes.find((s: ProductSize) => s.id === prev.id || s.name === prev.name);
              return match || json.data.sizes[0];
            });
          }
        }
      } catch (err) {
        console.error("Failed to load live product data:", err);
      } finally {
        setHasFetched(true);
      }
    }
    loadLiveProduct();
  }, [resolvedParams.slug]);

  const { addToCart, wishlist, toggleWishlist, isInWishlist } = useCart();
  const isSaved = product ? isInWishlist(product.id) : false;

  // States
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    initialProduct?.sizes[0] || { name: "Standard", weight: "250g", price: initialProduct?.price || 0 }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "ingredients" | "dosage" | "shipping" | "reviews">("overview");
  const [isBundleAdded, setIsBundleAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    city: "Karachi",
    rating: 5,
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  if (!product && hasFetched) {
    notFound();
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="animate-pulse text-[#22623a] font-serif text-lg">Loading Remedy Guide...</div>
      </div>
    );
  }

  const isAvailable =
    selectedSize?.available !== undefined ? selectedSize.available > 0 : product.inStock;
  const maxAvailable = selectedSize?.available !== undefined ? selectedSize.available : 99;

  // Compute dynamic ratings & review breakdown
  const totalReviews = reviewsList.length;
  const averageRating =
    totalReviews > 0
      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : (product.rating ? product.rating.toFixed(1) : "5.0");

  const starBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviewsList.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  // Pick complementary product for "Frequently Prescribed Together" bundle
  const bundleProduct = PRODUCTS.find(
    (p) => p.id !== product.id && (p.category === product.category || p.category === "arqiyat" || p.featured)
  ) || PRODUCTS[0];

  const bundleSize = bundleProduct.sizes[0];
  const bundleTotalPrice = selectedSize.price + bundleSize.price;
  const bundleDiscountedPrice = Math.round(bundleTotalPrice * 0.95); // 5% bundle discount

  // Load reviews dynamically from Database API
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${product?.id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const mapped = json.data.map((r: any) => ({
              id: r.id,
              name: r.name,
              city: r.city || "Karachi, Pakistan",
              rating: r.rating || 5,
              date: new Date(r.createdAt).toLocaleDateString("en-PK", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              comment: r.comment,
              verified: r.verified !== false,
            }));
            setReviewsList(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic reviews:", err);
      }
    }
    loadReviews();
  }, [product?.id]);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const handleAddBundleToCart = () => {
    addToCart(product, selectedSize, 1);
    addToCart(bundleProduct, bundleSize, 1);
    setIsBundleAdded(true);
    setTimeout(() => setIsBundleAdded(false), 2200);
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const generateDirectWhatsAppUrl = () => {
    const text = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to order:\n\n*Product:* ${product.name}\n*Selected Size:* ${selectedSize.weight} (₨ ${selectedSize.price.toLocaleString()})\n*Quantity:* ${quantity}\n*Total:* ₨ ${(selectedSize.price * quantity).toLocaleString()}\n\nPlease confirm availability and Cash on Delivery dispatch to my city. JazakAllah!`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewSuccessMsg(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: reviewForm.name,
          city: reviewForm.city,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const newReviewObj: CustomerReview = {
          id: json.data?.id || `rev-${Date.now()}`,
          name: reviewForm.name,
          city: reviewForm.city,
          rating: reviewForm.rating,
          date: "Just now",
          comment: reviewForm.comment,
          verified: true,
        };
        setReviewsList([newReviewObj, ...reviewsList]);
        setReviewSuccessMsg("Thank you! Your verified review has been submitted successfully.");
        setReviewForm({ name: "", city: "Karachi", rating: 5, comment: "" });
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewSuccessMsg(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* ─── 1. BREADCRUMBS BAR ─── */}
      <div className="bg-white border-b border-[#e6dfd5] py-3 text-xs text-[#59534b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#22623a]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#d7c9b8]" />
            <Link href="/products" className="hover:text-[#22623a]">
              Apothecary &amp; Store
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#d7c9b8]" />
            <Link
              href={`/products?category=${product.category}`}
              className="hover:text-[#22623a]"
            >
              {product.categoryLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#d7c9b8]" />
            <span className="text-[#22623a] font-semibold truncate">
              {product.name}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 text-xs text-[#59534b] hover:text-[#22623a] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? "Link Copied!" : "Share Remedy"}</span>
            </button>
            <span className="text-[#e6dfd5]">|</span>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                isSaved ? "text-red-500 font-semibold" : "text-[#59534b] hover:text-red-500"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-red-500" : ""}`} />
              <span>{isSaved ? "Saved in Wishlist" : "Save to Wishlist"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN PRODUCT HERO SHOWCASE ─── */}
      <section className="py-8 sm:py-12 border-b border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ── LEFT: PRODUCT IMAGERY (5 cols on lg) ── */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#e6dfd5] shadow-xs">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  priority
                />

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.badge && (
                    <span className="bg-[#22623a] text-white text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded shadow-xs">
                      {product.badge}
                    </span>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="bg-[#c59b27] text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs">
                      -{product.discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Mobile Wishlist Toggle Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`sm:hidden absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-xs transition-colors shadow-xs z-10 ${
                    isSaved ? "bg-white text-red-500" : "bg-white/90 text-[#59534b]"
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} />
                </button>
              </div>

              {/* Purity & Batch Trust Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#e6dfd5] shadow-xs flex items-center gap-2.5 text-xs text-[#59534b]">
                  <Leaf className="w-4 h-4 text-[#2d7648] shrink-0" />
                  <span className="leading-tight">100% Raw Botanical Extracts</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#e6dfd5] shadow-xs flex items-center gap-2.5 text-xs text-[#59534b]">
                  <ShieldCheck className="w-4 h-4 text-[#c59b27] shrink-0" />
                  <span className="leading-tight">Zero Chemical Steroids</span>
                </div>
              </div>

              {/* Clinic Freshness Tag */}
              <div className="p-3.5 bg-[#f4f9f5] rounded-xl border border-[#d8ecde] flex items-center justify-between text-xs text-[#22623a]">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-[#2d7648]" />
                  <span className="font-semibold">Batch No: #TMS-2026B</span>
                </div>
                <span className="text-[11px] text-[#2d7648] font-medium">
                  Prepared in Karachi Dispensary
                </span>
              </div>
            </div>

            {/* ── RIGHT: BUYING & ACTION PANEL (7 cols on lg) ── */}
            <div className="lg:col-span-7 space-y-5">
              {/* Category, Rating & Live Stock Status */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs uppercase font-bold text-[#c59b27] tracking-wider">
                    {product.categoryLabel}
                  </span>
                  {isAvailable ? (
                    selectedSize.available !== undefined && selectedSize.available <= 5 ? (
                      <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Only {selectedSize.available} units left in stock
                      </span>
                    ) : (
                      <span className="text-[#2d7648] font-semibold bg-[#f4f9f5] border border-[#d8ecde] px-2.5 py-0.5 rounded text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock · Freshly Packed
                      </span>
                    )
                  ) : (
                    <span className="text-red-700 font-semibold bg-red-50 border border-red-200 px-2.5 py-0.5 rounded text-xs flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Out of Stock · Restocking Soon
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                  {product.name}
                </h1>

                {/* Rating Bar with Jump-to-reviews link */}
                <div className="flex items-center gap-3 text-xs pt-1">
                  <div className="flex text-[#c59b27]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(Number(averageRating))
                            ? "fill-[#c59b27]"
                            : "text-[#d7c9b8]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#1a1816]">
                    {averageRating} / 5.0
                  </span>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="text-[#8c6a15] hover:text-[#22623a] font-medium underline underline-offset-2"
                  >
                    ({totalReviews} verified {totalReviews === 1 ? "review" : "reviews"})
                  </button>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-4 bg-white rounded-2xl border border-[#e6dfd5] shadow-xs flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-[#22623a]">
                    ₨ {selectedSize.price.toLocaleString()}
                  </span>
                  {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                    <span className="text-sm text-[#7a7268] line-through">
                      ₨ {selectedSize.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="text-xs font-bold text-[#c59b27] bg-[#fdfbf3] px-2.5 py-0.5 rounded border border-[#fbf3dc]">
                      Save {product.discountPercentage}%
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#2d7648] font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Cash on Delivery (COD) Nationwide
                </div>
              </div>

              {/* Short Purpose Description */}
              <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                {product.traditionalPurpose}
              </p>

              {/* Size Variant Selector */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#22623a] uppercase tracking-wider">
                    Select Packaging Size / Weight:
                  </label>
                  <span className="text-[#7a7268]">
                    Selected: <strong>{selectedSize.weight}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize.name === size.name;
                    const sizeInStock = size.available !== undefined ? size.available > 0 : true;
                    return (
                      <button
                        key={size.name}
                        onClick={() => {
                          setSelectedSize(size);
                          if (size.available !== undefined && quantity > size.available) {
                            setQuantity(Math.max(1, size.available));
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-xs transition-all text-left relative ${
                          isSelected
                            ? "bg-[#22623a] text-white border-[#22623a] shadow-xs font-medium"
                            : "bg-white text-[#1a1816] border-[#e6dfd5] hover:border-[#22623a]"
                        } ${!sizeInStock ? "opacity-60 border-dashed" : ""}`}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{size.weight}</span>
                          {!sizeInStock && (
                            <span className="text-[10px] text-red-700 bg-red-100 px-1 rounded font-normal">
                              Sold Out
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[11px] ${
                            isSelected ? "text-[#c59b27]" : "text-[#7a7268]"
                          }`}
                        >
                          ₨ {size.price.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Counter & Add-to-Cart Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-[#e6dfd5] rounded-xl bg-white overflow-hidden shrink-0 shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!isAvailable || quantity <= 1}
                      className="px-3.5 py-3 text-sm text-[#6a6660] hover:text-[#22623a] hover:bg-[#faf8f5] transition-colors disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-bold text-xs text-[#1a1816]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                      disabled={!isAvailable || quantity >= maxAvailable}
                      className="px-3.5 py-3 text-sm text-[#6a6660] hover:text-[#22623a] hover:bg-[#faf8f5] transition-colors disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Primary Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
                      !isAvailable
                        ? "bg-gray-200 text-gray-500"
                        : isAdded
                        ? "bg-[#2d7648] text-white"
                        : "bg-[#22623a] hover:bg-[#1b502e] text-white"
                    }`}
                  >
                    {!isAvailable ? (
                      <span>Out of Stock</span>
                    ) : isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                        <span>
                          Add to Bag · ₨ {(selectedSize.price * quantity).toLocaleString()}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct WhatsApp Order CTA */}
                <a
                  href={generateDirectWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Directly via WhatsApp (Quick COD)</span>
                </a>
              </div>

              {/* Delivery Guarantee Strip */}
              <div className="pt-3 border-t border-[#e6dfd5] space-y-2 text-xs text-[#59534b]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#2d7648] shrink-0" />
                  <span>
                    <strong>Free Nationwide Delivery</strong> on orders above ₨ 2,000 (Flat ₨ 200 otherwise).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#c59b27] shrink-0" />
                  <span>Karachi delivery in 24-48 hours · Other cities in 2-4 business days.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. "FREQUENTLY PRESCRIBED TOGETHER" BUNDLE CROSS-SELL ─── */}
      <section className="py-8 bg-[#faf8f5] border-b border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[#e6dfd5] p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2 text-[#22623a] font-serif text-lg font-bold pb-4 border-b border-[#f4eee5]">
              <Sparkles className="w-4 h-4 text-[#c59b27]" />
              <h2>Frequently Prescribed Together for Faster Relief</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5">
              {/* Products preview */}
              <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-4">
                {/* Item 1 */}
                <div className="flex items-center gap-3 bg-[#faf8f5] p-3 rounded-xl border border-[#e6dfd5] flex-1 w-full">
                  <div className="relative w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-bold text-[#22623a] truncate">{product.name}</div>
                    <div className="text-[11px] text-[#7a7268]">{selectedSize.weight}</div>
                    <div className="font-bold text-[#22623a] mt-0.5">₨ {selectedSize.price}</div>
                  </div>
                </div>

                <div className="text-xl font-bold text-[#c59b27] shrink-0">+</div>

                {/* Item 2 */}
                <div className="flex items-center gap-3 bg-[#faf8f5] p-3 rounded-xl border border-[#e6dfd5] flex-1 w-full">
                  <div className="relative w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={bundleProduct.image}
                      alt={bundleProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-bold text-[#22623a] truncate">{bundleProduct.name}</div>
                    <div className="text-[11px] text-[#7a7268]">{bundleSize.weight}</div>
                    <div className="font-bold text-[#22623a] mt-0.5">₨ {bundleSize.price}</div>
                  </div>
                </div>
              </div>

              {/* Bundle Add CTA */}
              <div className="lg:col-span-4 flex flex-col justify-center space-y-2 border-t lg:border-t-0 lg:border-l border-[#f4eee5] lg:pl-6 pt-4 lg:pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[#22623a]">
                    ₨ {bundleDiscountedPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#7a7268] line-through">
                    ₨ {bundleTotalPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-[#2d7648] bg-[#f4f9f5] px-2 py-0.5 rounded">
                    5% Bundle Saving
                  </span>
                </div>

                <button
                  onClick={handleAddBundleToCart}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs ${
                    isBundleAdded
                      ? "bg-[#2d7648] text-white"
                      : "bg-[#22623a] hover:bg-[#1b502e] text-white"
                  }`}
                >
                  {isBundleAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Both Items Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                      <span>Add Both to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. TABBED CLINICAL INFORMATION & REVIEWS ─── */}
      <section className="py-12 bg-white border-b border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Navigation Tabs Header */}
          <div className="flex items-center gap-2 border-b border-[#e6dfd5] overflow-x-auto whitespace-nowrap pb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "overview"
                  ? "border-[#22623a] text-[#22623a]"
                  : "border-transparent text-[#7a7268] hover:text-[#22623a]"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#c59b27]" />
              <span>Clinical Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("ingredients")}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "ingredients"
                  ? "border-[#22623a] text-[#22623a]"
                  : "border-transparent text-[#7a7268] hover:text-[#22623a]"
              }`}
            >
              <Leaf className="w-4 h-4 text-[#2d7648]" />
              <span>Botanical Ingredients &amp; Mizaj</span>
            </button>

            <button
              onClick={() => setActiveTab("dosage")}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "dosage"
                  ? "border-[#22623a] text-[#22623a]"
                  : "border-transparent text-[#7a7268] hover:text-[#22623a]"
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-[#22623a]" />
              <span>Hakim&apos;s Dosage &amp; Parhez</span>
            </button>

            <button
              onClick={() => setActiveTab("shipping")}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "shipping"
                  ? "border-[#22623a] text-[#22623a]"
                  : "border-transparent text-[#7a7268] hover:text-[#22623a]"
              }`}
            >
              <Truck className="w-4 h-4 text-[#c59b27]" />
              <span>Delivery &amp; Storage</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "reviews"
                  ? "border-[#22623a] text-[#22623a]"
                  : "border-transparent text-[#7a7268] hover:text-[#22623a]"
              }`}
            >
              <Star className="w-4 h-4 text-[#c59b27]" />
              <span>Verified Reviews ({totalReviews})</span>
            </button>
          </div>

          {/* TAB 1: CLINICAL OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 sm:p-8 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#22623a]">
                    Traditional Unani Action &amp; Healing Mechanism
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                    {product.fullDescription}
                  </p>
                </div>

                <div className="p-6 sm:p-8 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#22623a]">
                    Target Indications &amp; Primary Symptoms Treated
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                    {product.traditionalPurpose}
                  </p>
                </div>
              </div>

              {/* Key Benefits Grid */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#22623a]">
                  Documented Therapeutic Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.benefits.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-[#faf8f5] rounded-xl border border-[#e6dfd5]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#22623a] text-[#c59b27] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        ✓
                      </div>
                      <span className="text-xs sm:text-sm text-[#1e1c19] font-medium">
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOTANICAL INGREDIENTS & MIZAJ */}
          {activeTab === "ingredients" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-[#22623a]">Temperament (Mizaj):</span>{" "}
                  <span className="text-[#59534b]">
                    {product.mizaj || "Mo'tadil (Balanced) — Suitable for all body types"}
                  </span>
                </div>
                <div className="text-[#2d7648] font-semibold">
                  ✓ 100% Free of synthetic chemicals, lead, and mercury
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left bg-white border border-[#e6dfd5] rounded-xl overflow-hidden">
                  <thead className="bg-[#faf8f5] text-[#22623a] font-bold border-b border-[#e6dfd5] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Botanical / Herb Name</th>
                      <th className="p-4">Clinical Action in This Formulation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4eee5]">
                    {product.ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-[#faf8f5]/60 transition-colors">
                        <td className="p-4 font-bold text-[#1a1816]">{ing.name}</td>
                        <td className="p-4 text-[#59534b] leading-relaxed">{ing.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HAKIM'S USAGE GUIDE & PARHEZ */}
          {activeTab === "dosage" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#22623a] flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#2d7648]" />
                    <span>Recommended Dosage &amp; Timing</span>
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-[#59534b]">
                    <p>
                      <strong>Dosage:</strong> {product.dosage}
                    </p>
                    <p>
                      <strong>How to take:</strong> {product.howToUse}
                    </p>
                    <p className="pt-2 border-t border-[#e6dfd5]/60">
                      <strong>Hakim&apos;s Advice:</strong> {product.hakimAdvice}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#22623a] flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#c59b27]" />
                    <span>Dietary Precautions (Parhez)</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#59534b] list-disc list-inside">
                    <li>Avoid refrigerated cold water; drink room temperature or warm water.</li>
                    <li>Avoid deep-fried and excessively spicy street food during treatment course.</li>
                    <li>Keep a minimum 30-minute gap between heavy meals and taking this remedy.</li>
                    <li>For customized dosage for pregnant or nursing mothers, consult Hakim sahib on WhatsApp.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERY, COD & STORAGE */}
          {activeTab === "shipping" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-2 text-xs">
                  <Truck className="w-5 h-5 text-[#22623a]" />
                  <h4 className="font-bold text-[#22623a] text-sm">Delivery Timelines</h4>
                  <p className="text-[#59534b] leading-relaxed">
                    Karachi: 24 to 48 hours.<br />
                    Lahore, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad &amp; other cities: 2 to 4 business days via courier.
                  </p>
                </div>

                <div className="p-5 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-2 text-xs">
                  <ShieldCheck className="w-5 h-5 text-[#c59b27]" />
                  <h4 className="font-bold text-[#22623a] text-sm">Cash on Delivery (COD)</h4>
                  <p className="text-[#59534b] leading-relaxed">
                    Pay cash in PKR directly to the courier rider upon parcel delivery. Free delivery on orders above ₨ 2,000.
                  </p>
                </div>

                <div className="p-5 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-2 text-xs">
                  <Leaf className="w-5 h-5 text-[#2d7648]" />
                  <h4 className="font-bold text-[#22623a] text-sm">Storage Instructions</h4>
                  <p className="text-[#59534b] leading-relaxed">
                    Store in a cool, dry place away from direct sunlight. Keep the lid tightly closed after each use. Avoid wet spoons in herbal preserves.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VERIFIED REVIEWS & SUBMISSION */}
          {activeTab === "reviews" && (
            <div className="space-y-8 animate-fade-in">
              {/* Rating Summary Bar */}
              <div className="p-6 sm:p-8 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Score */}
                <div className="md:col-span-4 text-center md:text-left space-y-1">
                  <div className="text-4xl sm:text-5xl font-serif font-bold text-[#22623a]">
                    {averageRating}
                  </div>
                  <div className="flex justify-center md:justify-start text-[#c59b27]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(Number(averageRating))
                            ? "fill-[#c59b27]"
                            : "text-[#d7c9b8]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#6a6660]">
                    Based on {totalReviews} verified {totalReviews === 1 ? "experience" : "experiences"}
                  </p>
                </div>

                {/* Star breakdown bars */}
                <div className="md:col-span-5 space-y-1.5 text-xs text-[#59534b]">
                  {starBreakdown.map((item) => (
                    <div key={item.star} className="flex items-center gap-2">
                      <span className="w-12 text-[11px] font-medium">{item.star} Stars</span>
                      <div className="flex-1 h-2 bg-[#e6dfd5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#c59b27] rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] text-[#7a7268]">{item.percentage}%</span>
                    </div>
                  ))}
                </div>

                {/* Write Review Button */}
                <div className="md:col-span-3 text-center md:text-right">
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-[#c59b27]" />
                    <span>Write a Review</span>
                  </button>
                </div>
              </div>

              {/* Reviews List or Honest Zero State */}
              {reviewsList.length === 0 ? (
                <div className="p-8 sm:p-12 bg-white rounded-2xl border border-[#e6dfd5] text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-[#f4f9f5] border border-[#d8ecde] text-[#22623a] flex items-center justify-center mx-auto">
                    <Star className="w-6 h-6 text-[#c59b27]" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="font-serif text-lg font-bold text-[#22623a]">No Reviews Yet</h4>
                    <p className="text-xs sm:text-sm text-[#59534b]">
                      Have you used {product.name}? Share your genuine recovery experience to help other patients make informed health choices.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-[#c59b27]" />
                    <span>Be the First to Review</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsList.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 sm:p-6 bg-white rounded-2xl border border-[#e6dfd5] shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#22623a]">
                              {rev.name}
                            </span>
                            {rev.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[#2d7648] bg-[#f4f9f5] border border-[#d8ecde] px-2 py-0.5 rounded font-semibold">
                                <BadgeCheck className="w-3 h-3 text-[#2d7648]" />
                                <span>Verified Customer</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#7a7268]">{rev.city}</div>
                        </div>

                        <div className="text-right">
                          <div className="flex text-[#c59b27]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? "fill-[#c59b27]" : "text-[#e6dfd5]"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-[#a59f95]">{rev.date}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                        &quot;{rev.comment}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ─── 5. RELATED REMEDIES SECTION ─── */}
      {relatedProducts.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-[#c59b27] tracking-wider">
                Complementary Formulations
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                More Remedies in {product.categoryLabel}
              </h2>
            </div>
            <Link
              href={`/products?category=${product.category}`}
              className="text-xs font-bold uppercase tracking-wider text-[#22623a] hover:text-[#c59b27] transition-colors"
            >
              View All Category &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ─── 6. WRITE A REVIEW MODAL DIALOG ─── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsReviewModalOpen(false)}
            className="fixed inset-0 bg-[#0c2417]/60 backdrop-blur-xs transition-opacity"
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-lg border border-[#e6dfd5]">
              <div className="p-6 border-b border-[#e6dfd5] flex items-center justify-between bg-[#faf8f5]">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-lg font-bold text-[#22623a]">
                    Share Your Experience
                  </h3>
                  <p className="text-xs text-[#6a6660]">
                    Reviewing: <strong>{product.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 rounded-full text-[#7a7268] hover:text-[#22623a]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
                {reviewSuccessMsg && (
                  <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{reviewSuccessMsg}</span>
                  </div>
                )}

                {/* Rating Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#22623a] block">
                    Your Overall Rating:
                  </label>
                  <div className="flex items-center gap-2 text-[#c59b27]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewForm.rating
                              ? "fill-[#c59b27] text-[#c59b27]"
                              : "text-[#e6dfd5]"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-[#59534b] ml-2">
                      {reviewForm.rating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#22623a] block">
                    Your Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#22623a] block">
                    Your City / Area:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi (Gulshan-e-Iqbal) or Lahore"
                    value={reviewForm.city}
                    onChange={(e) => setReviewForm({ ...reviewForm, city: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#22623a] block">
                    Your Review &amp; Health Outcome:
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe how this natural remedy helped your health, ease of use, taste, and packaging quality..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full text-xs p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>{isSubmittingReview ? "Submitting Review..." : "Submit Customer Review"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
