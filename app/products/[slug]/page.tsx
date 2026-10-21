"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Product, ProductSize, CLINIC_INFO } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import ProductCard from "@/app/components/ProductCard";
import { getSafeProductImage, isValidImageUrl, DEFAULT_PRODUCT_IMAGE } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  X,
  Send,
  Snowflake,
  Flame,
  Scale,
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
  const [product, setProduct] = useState<Product | null>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Load live product and catalog from API
  useEffect(() => {
    async function loadLiveProduct() {
      try {
        const [productRes, catalogRes] = await Promise.all([
          fetch(`/api/products/${resolvedParams.slug}`),
          fetch(`/api/products`),
        ]);

        if (productRes.ok) {
          const json = await productRes.json();
          if (json.success && json.data) {
            setProduct(json.data);
            setSelectedSize((prev) => {
              if (!prev)
                return (
                  json.data.sizes[0] || {
                    name: "Standard",
                    weight: "250g",
                    price: json.data.price || 0,
                  }
                );
              const match = json.data.sizes.find(
                (s: ProductSize) => s.id === prev.id || s.name === prev.name
              );
              return (
                match ||
                json.data.sizes[0] || {
                  name: "Standard",
                  weight: "250g",
                  price: json.data.price || 0,
                }
              );
            });
          }
        }

        if (catalogRes.ok) {
          const catJson = await catalogRes.json();
          if (catJson.success && Array.isArray(catJson.data)) {
            setCatalog(catJson.data);
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

  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const isSaved = product ? isInWishlist(product.id) : false;

  // Local UI States
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isBundleAdded, setIsBundleAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Radix Dialog Review Modal State
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

  // Load reviews dynamically from Database API
  useEffect(() => {
    async function loadReviews() {
      if (!product?.id) return;
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
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

  if (!product && hasFetched) {
    notFound();
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-line-strong border-t-ink animate-spin" />
          <span className="text-xs uppercase tracking-[0.2em] text-ink-muted font-medium">
            Preparing Remedy Dossier...
          </span>
        </div>
      </div>
    );
  }

  const activeSize: ProductSize =
    selectedSize ||
    product.sizes[0] || {
      name: "Standard",
      weight: "Standard",
      price: product.price,
    };

  const isAvailable =
    activeSize.available !== undefined ? activeSize.available > 0 : product.inStock;
  const maxAvailable = activeSize.available !== undefined ? activeSize.available : 99;

  // Compute dynamic ratings & review breakdown
  const totalReviews = reviewsList.length;
  const averageRating =
    totalReviews > 0
      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : product.rating
      ? product.rating.toFixed(1)
      : "5.0";

  const starBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviewsList.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  // Pick complementary product for "Frequently Prescribed Together" bundle
  const bundleProduct =
    catalog.find(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.category === "arqiyat" || p.featured)
    ) ||
    catalog.find((p) => p.id !== product.id) ||
    null;

  const bundleSize = bundleProduct?.sizes?.[0] || null;
  const bundleTotalPrice = (activeSize.price || 0) + (bundleSize?.price || 0);
  const bundleDiscountedPrice = Math.round(bundleTotalPrice * 0.95); // 5% bundle discount

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(product, activeSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleAddBundleToCart = () => {
    if (!bundleProduct || !bundleSize) return;
    addToCart(product, activeSize, 1);
    addToCart(bundleProduct, bundleSize, 1);
    setIsBundleAdded(true);
    setTimeout(() => setIsBundleAdded(false), 2000);
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const generateDirectWhatsAppUrl = () => {
    const text = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to order:\n\n*Product:* ${product.name}\n*Selected Size:* ${activeSize.weight} (₨ ${activeSize.price.toLocaleString()})\n*Quantity:* ${quantity}\n*Total:* ₨ ${(activeSize.price * quantity).toLocaleString()}\n\nPlease confirm availability and Cash on Delivery dispatch to my city. JazakAllah!`;
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
        setReviewSuccessMsg("Thank you! Your verified review has been published.");
        setReviewForm({ name: "", city: "Karachi", rating: 5, comment: "" });
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewSuccessMsg(null);
        }, 1800);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const relatedProducts = catalog
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const validGallery = (product.gallery || []).filter((g) => isValidImageUrl(g));
  const primarySafe = getSafeProductImage(product.image, DEFAULT_PRODUCT_IMAGE);
  const images = validGallery.length > 0 ? validGallery : [primarySafe];
  const currentImg = images[activeImageIndex] || images[0] || DEFAULT_PRODUCT_IMAGE;

  return (
    <div className="bg-surface min-h-screen text-ink">
      {/* ─── 1. BREADCRUMBS BAR ─── */}
      <div className="bg-white border-b border-line/80 py-3 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px]">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-ink-subtle" />
            <Link href="/products" className="hover:text-ink transition-colors">
              Apothecary
            </Link>
            <ChevronRight className="w-3 h-3 text-ink-subtle" />
            <Link
              href={`/products?category=${product.category}`}
              className="hover:text-ink transition-colors"
            >
              {product.categoryLabel}
            </Link>
            <ChevronRight className="w-3 h-3 text-ink-subtle" />
            <span className="text-ink font-medium truncate">
              {product.name}
            </span>
          </div>

          {/* Share & Wishlist quick actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? "Link Copied" : "Share"}</span>
            </button>
            <span className="text-on-inverse">|</span>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`inline-flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer ${
                isSaved ? "text-danger font-medium" : "text-ink-muted hover:text-danger"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-danger" : ""}`} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN PRODUCT HERO SHOWCASE (SPLIT-SCREEN) ─── */}
      <section className="py-8 sm:py-12 border-b border-line/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* ── LEFT: PRODUCT IMAGERY (5 cols on lg) ── */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface border border-line/70 shadow-2xs group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={currentImg}
                      alt={product.name}
                      fill
                      className="object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.badge && (
                    <Badge variant="default" className="text-[10px] uppercase tracking-wider">
                      {product.badge}
                    </Badge>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <Badge variant="gold" className="text-[10px] font-bold">
                      -{product.discountPercentage}% OFF
                    </Badge>
                  ) : null}
                </div>

                {/* Mobile Wishlist Toggle Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`sm:hidden absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-xs transition-colors shadow-2xs z-10 ${
                    isSaved
                      ? "bg-white text-danger"
                      : "bg-white/80 text-ink-body hover:text-danger"
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-danger" : ""}`} />
                </button>
              </div>

              {/* Multi-Image Gallery Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                  {images.map((img, idx) => {
                    const isSelected = activeImageIndex % images.length === idx;
                    return (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border bg-white transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? "border-ink ring-2 ring-primary/15 shadow-xs scale-102"
                            : "border-line hover:border-line-strong opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          className="object-cover object-center p-0.5"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Purity & Batch Trust Indicators */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white rounded-xl border border-line/70 shadow-2xs flex items-center gap-2.5 text-xs text-ink-body">
                  <Leaf className="w-4 h-4 text-success shrink-0" />
                  <span className="leading-tight text-[11px] font-medium">
                    100% Pure Botanical Herbs
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-line/70 shadow-2xs flex items-center gap-2.5 text-xs text-ink-body">
                  <ShieldCheck className="w-4 h-4 text-secondary-text shrink-0" />
                  <span className="leading-tight text-[11px] font-medium">
                    Zero Chemical Steroids
                  </span>
                </div>
              </div>

              {/* Clinic Freshness Tag */}
              <div className="p-3.5 bg-surface-sunken/70 rounded-xl border border-line flex items-center justify-between text-xs text-neutral-700">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-ink" />
                  <span className="font-semibold text-[11px]">Dispensary Batch: #TMS-2026B</span>
                </div>
                <span className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">
                  Karachi Apothecary
                </span>
              </div>
            </div>

            {/* ── RIGHT: BUYING & ACTION PANEL (7 cols on lg) ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category, Rating & Live Stock Status */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-secondary-text">
                    {product.categoryLabel}
                  </span>

                  {isAvailable ? (
                    activeSize.available !== undefined && activeSize.available <= 5 ? (
                      <span className="text-warning font-medium bg-warning-soft border border-warning-line px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-warning" /> Only {activeSize.available} units left
                      </span>
                    ) : (
                      <span className="text-success font-medium bg-success-soft border border-success-line px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> In Stock · Fresh Batch
                      </span>
                    )
                  ) : (
                    <span className="text-danger font-medium bg-danger-soft border border-danger/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                      <X className="w-3 h-3" /> Out of Stock
                    </span>
                  )}
                </div>

                {/* Title and Urdu Subtitle */}
                <div className="flex flex-wrap items-baseline justify-between gap-3 pt-1">
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink tracking-tight leading-tight">
                    {product.name}
                  </h1>
                  {product.urduName && (
                    <span
                      className="font-urdu text-xl sm:text-2xl text-secondary-text font-normal"
                      dir="rtl"
                    >
                      {product.urduName}
                    </span>
                  )}
                </div>

                {/* Rating Bar */}
                <div className="flex items-center gap-3 text-xs pt-0.5">
                  <div className="flex text-secondary-text">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(Number(averageRating))
                            ? "fill-brand-gold-600"
                            : "text-ink-subtle"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-neutral-800 text-[11px]">
                    {averageRating} / 5.0
                  </span>
                  <a
                    href="#reviews-section"
                    className="text-ink-muted hover:text-ink text-[11px] underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    ({totalReviews} verified {totalReviews === 1 ? "review" : "reviews"})
                  </a>
                </div>
              </div>

              {/* Unani Mizaj (Temperament Energetics) Banner */}
              {product.mizaj && (
                <div className="p-3.5 bg-surface rounded-xl border border-line/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const mz = product.mizaj.toLowerCase();
                      if (mz.includes("sard") || mz.includes("cool")) {
                        return <Snowflake className="w-4 h-4 text-info shrink-0" />;
                      }
                      if (
                        mz.includes("garm") ||
                        mz.includes("warm") ||
                        mz.includes("haar")
                      ) {
                        return <Flame className="w-4 h-4 text-warning shrink-0" />;
                      }
                      return <Scale className="w-4 h-4 text-success shrink-0" />;
                    })()}
                    <div>
                      <span className="font-semibold text-ink">
                        Unani Mizaj (Temperament):
                      </span>{" "}
                      <span className="text-ink-body font-medium">
                        {product.mizaj}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-secondary-text font-semibold hidden sm:inline">
                    Energetic Balance
                  </span>
                </div>
              )}

              {/* Price Banner */}
              <div className="p-4 bg-white rounded-2xl border border-line/80 shadow-2xs flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                    ₨ {activeSize.price.toLocaleString()}
                  </span>
                  {activeSize.originalPrice &&
                    activeSize.originalPrice > activeSize.price && (
                      <span className="text-sm text-ink-subtle line-through">
                        ₨ {activeSize.originalPrice.toLocaleString()}
                      </span>
                    )}
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <span className="text-xs font-bold text-secondary-text bg-brand-gold-50 px-2.5 py-0.5 rounded border border-brand-gold-200">
                      Save {product.discountPercentage}%
                    </span>
                  ) : null}
                </div>

                <div className="text-[11px] text-success font-medium flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Cash on Delivery Available
                </div>
              </div>

              {/* Short Purpose Description */}
              <p className="text-xs sm:text-sm text-ink-body leading-relaxed">
                {product.traditionalPurpose || product.shortDescription}
              </p>

              {/* Size Variant Selector */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-ink text-[11px] uppercase tracking-wider">
                    Select Packaging Size:
                  </label>
                  <span className="text-ink-muted text-xs">
                    Weight: <strong>{activeSize.weight}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = activeSize.name === size.name;
                    const sizeInStock =
                      size.available !== undefined ? size.available > 0 : true;
                    return (
                      <button
                        key={size.name}
                        onClick={() => {
                          setSelectedSize(size);
                          if (
                            size.available !== undefined &&
                            quantity > size.available
                          ) {
                            setQuantity(Math.max(1, size.available));
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl border text-xs transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-surface-inverse text-white border-ink shadow-xs font-medium"
                            : "bg-white text-neutral-800 border-line hover:border-line-strong"
                        } ${!sizeInStock ? "opacity-50 border-dashed" : ""}`}
                      >
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>{size.weight}</span>
                          {!sizeInStock && (
                            <span className="text-[9px] text-danger bg-danger-soft px-1 rounded">
                              Out
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] ${
                            isSelected ? "text-brand-gold-500" : "text-ink-muted"
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
                  <div className="flex items-center border border-line rounded-xl bg-white overflow-hidden shrink-0 shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!isAvailable || quantity <= 1}
                      className="px-3.5 py-3 text-sm text-ink-body hover:text-ink hover:bg-surface transition-colors disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-semibold text-xs text-ink min-w-[24px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(maxAvailable, quantity + 1))
                      }
                      disabled={!isAvailable || quantity >= maxAvailable}
                      className="px-3.5 py-3 text-sm text-ink-body hover:text-ink hover:bg-surface transition-colors disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Primary Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-xs hover:shadow-sm active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                      !isAvailable
                        ? "bg-line text-ink-muted"
                        : isAdded
                        ? "bg-brand-green-600 text-white"
                        : "bg-surface-inverse hover:bg-surface-inverse-hover text-white"
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
                        <ShoppingBag className="w-4 h-4 text-brand-gold-500" />
                        <span>
                          Add to Bag · ₨{" "}
                          {(activeSize.price * quantity).toLocaleString()}
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp (Express COD Dispatch)</span>
                </a>
              </div>

              {/* Delivery Guarantee Strip */}
              <div className="pt-3 border-t border-line/80 space-y-2 text-xs text-ink-body">
                <div className="flex items-center gap-2 text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>
                    <strong>Free Delivery</strong> across Pakistan on orders above ₨ 2,000 (₨ 200 standard shipping).
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-secondary-text shrink-0" />
                  <span>Karachi delivery in 24-48 hours · Other cities in 2-4 business days.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. FREQUENTLY PRESCRIBED TOGETHER BUNDLE ─── */}
      {bundleProduct && bundleSize && (
        <section className="py-8 bg-surface border-b border-line/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-line p-5 sm:p-7 shadow-2xs">
              <div className="flex items-center gap-2 text-ink font-serif text-lg font-semibold pb-4 border-b border-line">
                <Sparkles className="w-4 h-4 text-secondary-text" />
                <h2>Frequently Prescribed Together for Synergistic Relief</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5">
                {/* Products preview */}
                <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-4">
                  {/* Item 1 */}
                  <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-line/70 flex-1 w-full">
                    <div className="relative w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={getSafeProductImage(product.image)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="font-semibold text-ink truncate">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {activeSize.weight}
                      </div>
                      <div className="font-semibold text-ink mt-0.5">
                        ₨ {activeSize.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-xl font-bold text-secondary-text shrink-0">+</div>

                  {/* Item 2 */}
                  <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-line/70 flex-1 w-full">
                    <div className="relative w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={bundleProduct.image}
                        alt={bundleProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="font-semibold text-ink truncate">
                        {bundleProduct.name}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {bundleSize.weight}
                      </div>
                      <div className="font-semibold text-ink mt-0.5">
                        ₨ {bundleSize.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bundle Add CTA */}
                <div className="lg:col-span-4 flex flex-col justify-center space-y-2 border-t lg:border-t-0 lg:border-l border-line lg:pl-6 pt-4 lg:pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-serif font-bold text-ink">
                      ₨ {bundleDiscountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-ink-subtle line-through">
                      ₨ {bundleTotalPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-success bg-success-soft px-2 py-0.5 rounded border border-success-line">
                      5% Bundle Savings
                    </span>
                  </div>

                  <button
                    onClick={handleAddBundleToCart}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-2xs cursor-pointer ${
                      isBundleAdded
                        ? "bg-brand-green-600 text-white"
                        : "bg-surface-inverse hover:bg-surface-inverse-hover text-white"
                    }`}
                  >
                    {isBundleAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Both Remedies Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-brand-gold-500" />
                        <span>Add Both to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. CLINICAL ACCORDIONS & VERIFIED REVIEWS ─── */}
      <section className="py-12 bg-white border-b border-line/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center pb-2">
            <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-secondary-text">
              Clinical Dossier
            </span>
            <h2 className="font-serif text-2xl font-semibold text-ink mt-1">
              Therapeutic Specifications &amp; Usage
            </h2>
          </div>

          <Accordion
            type="multiple"
            defaultValue={["overview", "ingredients", "dosage", "reviews"]}
            className="space-y-4"
          >
            {/* ACCORDION 1: CLINICAL OVERVIEW & BENEFITS */}
            <AccordionItem
              value="overview"
              className="border border-line rounded-2xl overflow-hidden bg-surface shadow-2xs px-5 sm:px-6"
            >
              <AccordionTrigger className="py-5 sm:py-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-secondary-text" />
                  <span className="font-serif text-base sm:text-lg font-semibold text-ink">
                    Traditional Unani Action &amp; Indications
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 space-y-6 pt-2 border-t border-line/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-line/70 space-y-2">
                    <h4 className="font-semibold text-xs text-ink uppercase tracking-wider">
                      Healing Mechanism
                    </h4>
                    <p className="text-xs text-ink-body leading-relaxed">
                      {product.fullDescription || product.shortDescription}
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-line/70 space-y-2">
                    <h4 className="font-semibold text-xs text-ink uppercase tracking-wider">
                      Target Indications
                    </h4>
                    <p className="text-xs text-ink-body leading-relaxed">
                      {product.traditionalPurpose}
                    </p>
                  </div>
                </div>

                {/* Benefits List */}
                {product.benefits && product.benefits.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xs text-ink uppercase tracking-wider">
                      Documented Therapeutic Benefits
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {product.benefits.map((b, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-line/60 text-xs text-neutral-700"
                        >
                          <div className="w-4 h-4 rounded-full bg-success-soft text-success flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                            ✓
                          </div>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ACCORDION 2: BOTANICAL INGREDIENTS & MIZAJ */}
            <AccordionItem
              value="ingredients"
              className="border border-line rounded-2xl overflow-hidden bg-surface shadow-2xs px-5 sm:px-6"
            >
              <AccordionTrigger className="py-5 sm:py-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Leaf className="w-4 h-4 text-success" />
                  <span className="font-serif text-base sm:text-lg font-semibold text-ink">
                    Botanical Ingredients &amp; Temperament (Mizaj)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 space-y-4 pt-2 border-t border-line/60">
                <div className="p-4 bg-white rounded-xl border border-line/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-ink">Mizaj (Temperament):</span>{" "}
                    <span className="text-ink-body font-medium">
                      {product.mizaj || "Mo'tadil (Balanced) — Well tolerated by all constitutions"}
                    </span>
                  </div>
                  <div className="text-success font-medium text-[11px]">
                    ✓ 100% Free of synthetic chemicals, heavy metals &amp; steroids
                  </div>
                </div>

                {product.ingredients && product.ingredients.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left bg-white border border-line rounded-xl overflow-hidden">
                      <thead className="bg-surface text-ink font-semibold border-b border-line text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5">Botanical / Herb Name</th>
                          <th className="p-3.5">Clinical Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {product.ingredients.map((ing, i) => (
                          <tr key={i} className="hover:bg-surface/70 transition-colors">
                            <td className="p-3.5 font-semibold text-ink">{ing.name}</td>
                            <td className="p-3.5 text-ink-body leading-relaxed">{ing.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ACCORDION 3: HAKIM'S DOSAGE & PARHEZ */}
            <AccordionItem
              value="dosage"
              className="border border-line rounded-2xl overflow-hidden bg-surface shadow-2xs px-5 sm:px-6"
            >
              <AccordionTrigger className="py-5 sm:py-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <HeartHandshake className="w-4 h-4 text-ink" />
                  <span className="font-serif text-base sm:text-lg font-semibold text-ink">
                    Hakim&apos;s Dosage &amp; Dietary Guidelines (Parhez)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 space-y-4 pt-2 border-t border-line/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-line/70 space-y-3">
                    <h4 className="font-semibold text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-success" />
                      <span>Recommended Dosage</span>
                    </h4>
                    <div className="space-y-1.5 text-xs text-ink-body">
                      <p>
                        <strong>Dosage:</strong> {product.dosage}
                      </p>
                      <p>
                        <strong>Timing:</strong> {product.howToUse}
                      </p>
                      {product.hakimAdvice && (
                        <p className="pt-2 border-t border-line text-neutral-700">
                          <strong>Hakim&apos;s Clinical Advice:</strong> {product.hakimAdvice}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-line/70 space-y-3">
                    <h4 className="font-semibold text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-secondary-text" />
                      <span>Dietary Precautions (Parhez)</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-ink-body list-disc list-inside">
                      <li>Avoid refrigerated cold water; drink room temperature water.</li>
                      <li>Avoid deep-fried and excessively spicy foods during treatment.</li>
                      <li>Keep a minimum 30-minute interval between heavy meals and dosage.</li>
                      <li>For customized guidance during pregnancy, consult Hakim sahib on WhatsApp.</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ACCORDION 4: DELIVERY & STORAGE */}
            <AccordionItem
              value="shipping"
              className="border border-line rounded-2xl overflow-hidden bg-surface shadow-2xs px-5 sm:px-6"
            >
              <AccordionTrigger className="py-5 sm:py-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-secondary-text" />
                  <span className="font-serif text-base sm:text-lg font-semibold text-ink">
                    Delivery Timelines &amp; Storage Guidelines
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 space-y-4 pt-2 border-t border-line/60">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-line/70 space-y-1.5 text-xs">
                    <Truck className="w-4 h-4 text-ink" />
                    <h4 className="font-semibold text-ink">Courier Dispatch</h4>
                    <p className="text-ink-body leading-relaxed text-[11px]">
                      Karachi: 24–48 hours. Nationwide cities: 2–4 business days via registered courier.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-line/70 space-y-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-secondary-text" />
                    <h4 className="font-semibold text-ink">Cash on Delivery</h4>
                    <p className="text-ink-body leading-relaxed text-[11px]">
                      Pay cash directly upon parcel delivery. Free delivery on orders above ₨ 2,000.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-line/70 space-y-1.5 text-xs">
                    <Leaf className="w-4 h-4 text-success" />
                    <h4 className="font-semibold text-ink">Dispensary Storage</h4>
                    <p className="text-ink-body leading-relaxed text-[11px]">
                      Store in a dry place away from heat. Keep container tightly closed; use clean dry spoons.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ACCORDION 5: PATIENT EXPERIENCES & REVIEWS */}
            <AccordionItem
              value="reviews"
              id="reviews-section"
              className="border border-line rounded-2xl overflow-hidden bg-surface shadow-2xs px-5 sm:px-6"
            >
              <AccordionTrigger className="py-5 sm:py-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-secondary-text" />
                  <span className="font-serif text-base sm:text-lg font-semibold text-ink">
                    Verified Patient Reviews ({totalReviews})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 space-y-6 pt-2 border-t border-line/60">
                {/* Score Summary Box */}
                <div className="p-5 sm:p-6 bg-white rounded-xl border border-line/70 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 text-center md:text-left space-y-1">
                    <div className="text-3xl sm:text-4xl font-serif font-bold text-ink">
                      {averageRating}
                    </div>
                    <div className="flex justify-center md:justify-start text-secondary-text">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(Number(averageRating))
                              ? "fill-brand-gold-600"
                              : "text-on-inverse"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-ink-muted">
                      {totalReviews} verified {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>

                  {/* Star breakdown */}
                  <div className="md:col-span-5 space-y-1 text-xs text-ink-body">
                    {starBreakdown.map((item) => (
                      <div key={item.star} className="flex items-center gap-2">
                        <span className="w-12 text-[10px] font-medium">{item.star} Stars</span>
                        <div className="flex-1 h-1.5 bg-surface-sunken rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-gold-600 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] text-ink-subtle">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Write review button */}
                  <div className="md:col-span-3 text-center md:text-right">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-inverse hover:bg-surface-inverse-hover text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-2xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-gold-500" />
                      <span>Write Review</span>
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                {reviewsList.length === 0 ? (
                  <div className="p-8 bg-white rounded-xl border border-line/70 text-center space-y-3">
                    <Star className="w-6 h-6 text-secondary-text mx-auto opacity-60" />
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="font-serif text-base font-semibold text-ink">
                        No Patient Reviews Yet
                      </h4>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        Have you used {product.name}? Share your honest experience to guide fellow seekers of natural health.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-surface-inverse hover:bg-surface-inverse-hover text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-gold-500" />
                      <span>Be the First to Review</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 sm:p-5 bg-white rounded-xl border border-line/70 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-ink">
                                {rev.name}
                              </span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-1 text-[9px] text-success bg-success-soft px-1.5 py-0.5 rounded font-medium border border-success-line">
                                  <BadgeCheck className="w-2.5 h-2.5 text-success" />
                                  <span>Verified Customer</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-ink-subtle">{rev.city}</div>
                          </div>

                          <div className="text-right">
                            <div className="flex text-secondary-text">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating ? "fill-brand-gold-600" : "text-on-inverse"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-ink-subtle">{rev.date}</span>
                          </div>
                        </div>

                        <p className="text-xs text-ink-body leading-relaxed">
                          &quot;{rev.comment}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── 5. RELATED REMEDIES SECTION ─── */}
      {relatedProducts.length > 0 && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-secondary-text tracking-[0.2em]">
                Complementary Remedies
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-ink mt-0.5">
                More in {product.categoryLabel}
              </h2>
            </div>
            <Link
              href={`/products?category=${product.category}`}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-ink transition-colors"
            >
              View Category &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ─── 6. WRITE A REVIEW RADIX DIALOG ─── */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border-line shadow-2xl">
          <DialogHeader className="p-5 border-b border-line bg-surface">
            <DialogTitle className="font-serif text-base font-semibold text-ink">
              Share Your Health Outcome
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted">
              Reviewing: <strong>{product.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="p-5 space-y-4">
            {reviewSuccessMsg && (
              <div className="p-3 bg-success-soft border border-success-line text-success text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {/* Rating Picker */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink block">
                Overall Experience:
              </label>
              <div className="flex items-center gap-1.5 text-secondary-text">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewForm.rating
                          ? "fill-brand-gold-600 text-secondary-text"
                          : "text-on-inverse"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-medium text-ink-body ml-2">
                  {reviewForm.rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink block">
                Your Name:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Mehmood"
                value={reviewForm.name}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, name: e.target.value })
                }
                className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-ink focus:bg-white transition-all"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink block">
                Your City / Area:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Karachi or Lahore"
                value={reviewForm.city}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, city: e.target.value })
                }
                className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-ink focus:bg-white transition-all"
              />
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink block">
                Your Review &amp; Health Outcome:
              </label>
              <textarea
                required
                rows={4}
                placeholder="Share how this remedy supported your health, ease of use, taste, or packaging..."
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                className="w-full text-xs p-3.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-ink focus:bg-white transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full flex items-center justify-center gap-2 py-3 bg-surface-inverse hover:bg-surface-inverse-hover text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-brand-gold-500" />
                <span>
                  {isSubmittingReview
                    ? "Publishing Review..."
                    : "Submit Verified Review"}
                </span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── 7. STICKY MOBILE BOTTOM PURCHASE BAR ─── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-line px-4 py-3 shadow-lg flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="text-[11px] text-ink-muted truncate font-medium">
            {product.name} ({activeSize.weight})
          </div>
          <div className="font-semibold text-sm text-ink">
            ₨ {activeSize.price.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer ${
              !isAvailable
                ? "bg-line text-ink-muted"
                : isAdded
                ? "bg-brand-green-600 text-white"
                : "bg-surface-inverse text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 text-brand-gold-500" />
                <span>Add</span>
              </>
            )}
          </button>
          <a
            href={generateDirectWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-whatsapp text-on-whatsapp rounded-xl shadow-2xs hover:bg-whatsapp-hover flex items-center justify-center cursor-pointer"
            aria-label="Order on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
