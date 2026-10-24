"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useSession, signOut } from "@/lib/auth-client";
import { CLINIC_INFO } from "@/app/data/products";
import { useLenis } from "./SmoothScroll";
import dynamic from "next/dynamic";

const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });
import { useConsultation } from "@/app/context/ConsultationContext";
import BrandLogo from "./BrandLogo";
import { isStaffRole } from "@/lib/rbac-base";
import { getHijriDate } from "@/lib/hijama-types";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  Truck,
  MessageCircle,
  Calendar,
  Phone,
  Stethoscope,
  Activity,
  Building2,
  Home,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Leaf,
  Sprout,
  Flame,
  Droplets,
  Sun,
  Moon,
  Package,
} from "lucide-react";

export const SHOP_SUBMENU_ITEMS = [
  {
    name: "Herbs",
    subtitle: "Pure roots, barks & raw botanicals",
    href: "/products?category=herbs-seeds",
    icon: Leaf,
    badge: "Botanical",
  },
  {
    name: "Deals",
    subtitle: "Seasonal discounts & bundle savings",
    href: "/products?onSale=true",
    icon: Sparkles,
    badge: "50% OFF",
    highlight: true,
  },
  {
    name: "Murabba",
    subtitle: "Classical herbal preserves & tonics",
    href: "/products?category=murabbajaat",
    icon: Package,
    badge: "Traditional",
  },
  {
    name: "Spices",
    subtitle: "Aromatic culinary & medicinal spices",
    href: "/products?category=spices",
    icon: Flame,
    badge: "Aromatic",
  },
  {
    name: "Seeds",
    subtitle: "Organic whole seeds, grains & kernels",
    href: "/products?category=seeds",
    icon: Sprout,
    badge: "Natural",
  },
  {
    name: "Health Collections",
    subtitle: "Targeted blends for digestion, joints & vitality",
    href: "/products?concern=all",
    icon: Activity,
    badge: "Curated",
  },
  {
    name: "Oils & Balms",
    subtitle: "Therapeutic massage oils & herbal balms",
    href: "/products?category=oils-marham",
    icon: Droplets,
    badge: "Therapeutic",
  },
  {
    name: "Dry Fruits & Nuts",
    subtitle: "Nutrient-dense vitality mixes & whole nuts",
    href: "/products?category=dry-fruits",
    icon: Sun,
    badge: "Vitality",
  },
];

export default function Header() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { totalItems, setIsCartOpen, wishlist } = useCart();
  const { data: session } = useSession();
  const { openConsultation, isOpen: isConsultOpen } = useConsultation();
  const isStaff = isStaffRole((session?.user as { role?: string })?.role);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hijamaBannerInfo, setHijamaBannerInfo] = useState<{
    daysAway: number;
    hijriText: string;
    gregText: string;
    isToday: boolean;
  } | null>(null);

  useEffect(() => {
    try {
      const today = new Date();
      for (let i = 0; i < 35; i++) {
        const check = new Date(today);
        check.setDate(today.getDate() + i);
        const h = getHijriDate(check, 0);
        if (h.isSunnahDay) {
          const greg = check.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          setHijamaBannerInfo({
            daysAway: i,
            hijriText: `${h.hijriDay}th ${h.hijriMonthName}`,
            gregText: greg,
            isToday: i === 0,
          });
          break;
        }
      }
    } catch {
      // fallback
    }
  }, []);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const shopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeMenuRef = useRef<HTMLButtonElement>(null);

  const handleShopMouseEnter = () => {
    if (shopTimeoutRef.current) {
      clearTimeout(shopTimeoutRef.current);
      shopTimeoutRef.current = null;
    }
    setIsShopDropdownOpen(true);
  };

  const handleShopMouseLeave = () => {
    shopTimeoutRef.current = setTimeout(() => {
      setIsShopDropdownOpen(false);
    }, 180);
  };

  const openMobileMenu = () => {
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(false);
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const openSearch = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(false);
    setIsSearchOpen(true);
  };

  const openCart = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(true);
  };

  const openConsult = (options?: {
    mode?: "WHATSAPP" | "PHYSICAL";
    message?: string;
  }) => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(false);
    openConsultation(options);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        shopMenuRef.current &&
        !shopMenuRef.current.contains(event.target as Node)
      ) {
        setIsShopDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (pathname === href) {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleMobileNavClick = (href: string, e: React.MouseEvent) => {
    closeMobileMenu();
    if (pathname === href) {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", handleKeyDown);

    // rAF so this wins if cart/search is releasing the same lock in this tick
    const frame = requestAnimationFrame(() => {
      document.body.style.overflow = "hidden";
      closeMenuRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navLinks: { name: string; href: string; icon: any; badge?: string }[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/products", icon: ShoppingBag },
    // Specialties hidden for now per instructions (A/B/C testing)
    // { name: "Specialties", href: "/specialties", icon: Activity },
    // Hijama removed from nav - now an emphasized inline calendar section on home page
    // { name: "Hijama", href: "/hijama", icon: Droplets },
    { name: "Consult", href: "/consultation", icon: Stethoscope },
    { name: "About Us", href: "/about", icon: Building2 },
  ];

  const isActivePath = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      {/* ─── 1. HIJAMA TOP BANNER (Mobile-Dedicated & Desktop Versions) ─── */}
      {/* 1A. Dedicated Mobile Version (< sm) — Full text, high visibility CTA, no ellipsis clipping */}
      <div className="block sm:hidden bg-surface-inverse text-on-inverse px-3 py-2 border-b border-secondary/30 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-brand-gold-400 font-bold text-[10px] tracking-wider uppercase shrink-0 border border-secondary/40 shadow-2xs">
              <Moon className="w-2.5 h-2.5 fill-current" />
              <span>Sunnah Hijama</span>
            </span>

            <strong className="text-brand-gold-400 font-bold text-[11px] leading-tight shrink-0">
              {hijamaBannerInfo ? (
                hijamaBannerInfo.isToday
                  ? "Today is Sunnah Day!"
                  : `${hijamaBannerInfo.daysAway} ${hijamaBannerInfo.daysAway === 1 ? "day" : "days"} left`
              ) : (
                "Lunar Cupping"
              )}
            </strong>
          </div>

          <Link
            href={pathname === "/" ? "#hijama-calendar" : "/#hijama-calendar"}
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                const target = document.getElementById("hijama-calendar");
                if (target) {
                  if (lenis) {
                    lenis.scrollTo(target, { offset: -60, duration: 1.2 });
                  } else {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary hover:bg-brand-gold-400 text-ink font-bold text-[10px] uppercase tracking-wider shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>

        <div className="mt-1 flex items-center justify-between text-[10.5px] text-brand-green-300 leading-tight pt-0.5">
          <span className="font-medium text-on-inverse min-w-0">
            {hijamaBannerInfo ? (
              <>
                <span className="text-on-inverse font-semibold">{hijamaBannerInfo.hijriText}</span>
                <span className="text-brand-green-300 mx-1">·</span>
                <span>{hijamaBannerInfo.gregText}</span>
                <span className="text-brand-green-300 mx-1">·</span>
                <span className="text-brand-green-300">Male &amp; Female Wards</span>
              </>
            ) : (
              "17th, 19th & 21st Lunar Dates · Separate Wards"
            )}
          </span>

          <Link
            href="/track-order"
            className="text-[10px] text-on-inverse hover:text-brand-gold-500 underline shrink-0 ml-2"
          >
            Track Order
          </Link>
        </div>
      </div>

      {/* 1B. Desktop / Tablet Version (sm:block hidden) */}
      <div className="hidden sm:block bg-surface-inverse text-on-inverse text-xs py-2 px-3 sm:px-6 border-b border-secondary/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-brand-gold-400 font-bold text-[10px] tracking-wider uppercase shrink-0 border border-secondary/40 shadow-2xs">
              <Moon className="w-3 h-3 fill-current" />
              <span>Sunnah Hijama</span>
            </span>

            <span className="truncate text-on-inverse font-medium">
              {hijamaBannerInfo ? (
                <>
                  <strong className="text-brand-gold-400 font-bold">
                    {hijamaBannerInfo.isToday
                      ? "Today is a Blessed Sunnah Day!"
                      : `${hijamaBannerInfo.daysAway} ${hijamaBannerInfo.daysAway === 1 ? "day" : "days"} left`}
                  </strong>{" "}
                  <span className="text-brand-green-200">
                    ({hijamaBannerInfo.hijriText} · {hijamaBannerInfo.gregText})
                  </span>
                  <span className="hidden md:inline text-brand-green-300">
                    {" "}— Separate Male &amp; Female Wards
                  </span>
                </>
              ) : (
                "Islamic Lunar Wet Cupping (17th, 19th & 21st) — Reserve your session"
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-[11px]">
            <Link
              href={pathname === "/" ? "#hijama-calendar" : "/#hijama-calendar"}
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  const target = document.getElementById("hijama-calendar");
                  if (target) {
                    if (lenis) {
                      lenis.scrollTo(target, { offset: -60, duration: 1.2 });
                    } else {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }
              }}
              className="inline-flex items-center gap-1 text-brand-gold-500 hover:text-brand-gold-300 font-bold hover:underline transition-colors shrink-0"
            >
              <span>View Hijama Calendar &amp; Book</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <span className="hidden lg:inline opacity-30 text-on-inverse">|</span>

            <Link
              href="/track-order"
              className="hidden lg:flex items-center gap-1.5 text-on-inverse hover:text-brand-gold-500 transition-colors"
            >
              <Truck className="w-3 h-3 text-brand-gold-500" />
              <span>Track Order</span>
            </Link>

            <span className="hidden xl:inline opacity-30 text-on-inverse">|</span>

            <a
              href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 text-whatsapp hover:text-whatsapp transition-colors font-medium"
            >
              <MessageCircle className="w-3 h-3 fill-current" />
              <span>WhatsApp Helpline</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN NAVIGATION HEADER ─── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-line shadow-xs py-2"
            : "bg-surface border-b border-line py-2.5 sm:py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 xl:gap-8">
            {/* ── Left: Menu (below xl) + Brand ── */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() =>
                  isMobileMenuOpen ? closeMobileMenu() : openMobileMenu()
                }
                className="xl:hidden p-2 -ml-1 text-primary hover:bg-black/5 rounded-lg transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-sheet"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <Link
                href="/"
                onClick={(e) => handleNavClick("/", e)}
                className="flex items-center group shrink-0"
                aria-label="Tameer-e-Sehat Home"
              >
                <BrandLogo variant="header" className="hidden sm:flex" priority={false} />
                <BrandLogo variant="mobile" className="flex sm:hidden" priority={true} />
              </Link>
            </div>

            {/* ── Center: Primary Navigation (xl+ only — six labels don't fit at 1024) ── */}
            <nav className="hidden xl:flex items-center gap-5 2xl:gap-7">
              {navLinks.map((link) => {
                const isActive = isActivePath(link.href);

                if (link.name === "Shop") {
                  return (
                    <div
                      key={link.name}
                      ref={shopMenuRef}
                      className="relative py-2"
                      onMouseEnter={handleShopMouseEnter}
                      onMouseLeave={handleShopMouseLeave}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(link.href, e)}
                        className={`text-sm font-medium transition-colors duration-150 relative py-1 flex items-center gap-1.5 ${
                          isActive
                            ? "text-primary"
                            : "text-ink-body hover:text-primary"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isShopDropdownOpen
                              ? "rotate-180 text-primary"
                              : "text-ink-subtle"
                          }`}
                        />
                        {link.badge && (
                          <span className="px-1.5 py-0.5 bg-secondary/15 text-brand-gold-800 text-[9px] font-bold uppercase tracking-wider rounded-md border border-secondary/30">
                            {link.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute -bottom-[3px] left-0 w-full h-[2px] bg-secondary rounded-full" />
                        )}
                      </Link>

                      {/* Mega Menu Dropdown */}
                      {isShopDropdownOpen && (
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[620px] z-50 animate-fade-in"
                          onMouseEnter={handleShopMouseEnter}
                          onMouseLeave={handleShopMouseLeave}
                        >
                          <div className="bg-white rounded-2xl shadow-2xl border border-line p-5 overflow-hidden">
                            {/* Header bar */}
                            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-sand-100">
                              <div>
                                <h3 className="font-serif font-bold text-sm text-primary">
                                  Apothecary Collections &amp; Categories
                                </h3>
                                <p className="text-[11px] text-ink-subtle">
                                  Pure, unadulterated &amp; clinically verified herbal remedies
                                </p>
                              </div>
                              <Link
                                href="/products"
                                onClick={() => setIsShopDropdownOpen(false)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-secondary-text hover:text-brand-gold-900 transition-colors group"
                              >
                                <span>All Products</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>

                            {/* 2-Column Grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {SHOP_SUBMENU_ITEMS.map((item) => {
                                const SubIcon = item.icon;
                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsShopDropdownOpen(false)}
                                    className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all border ${
                                      item.highlight
                                        ? "bg-warning-soft/70 border-warning-line/80 hover:bg-warning-soft/70 hover:border-warning-line"
                                        : "bg-surface/60 border-transparent hover:bg-brand-green-50 hover:border-primary/15 hover:shadow-xs"
                                    }`}
                                  >
                                    <div
                                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                        item.highlight
                                          ? "bg-warning-soft text-warning"
                                          : "bg-brand-green-50 text-primary group-hover:bg-primary group-hover:text-white"
                                      }`}
                                    >
                                      <SubIcon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-primary group-hover:text-brand-green-900 transition-colors">
                                          {item.name}
                                        </span>
                                        {item.badge && (
                                          <span
                                            className={`px-1.5 py-0.2 text-[8px] font-extrabold uppercase tracking-wider rounded-md border ${
                                              item.highlight
                                                ? "bg-danger text-white border-danger animate-pulse"
                                                : "bg-secondary/15 text-brand-gold-800 border-secondary/30"
                                            }`}
                                          >
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-ink-subtle line-clamp-1 leading-snug mt-0.5">
                                        {item.subtitle}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>

                            {/* Footer Bar */}
                            <div className="mt-3.5 pt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-ink-subtle bg-surface -mx-5 -mb-5 px-5 py-2.5">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-secondary-text" />
                                <span>Free delivery on orders above Rs. 2,000 across Pakistan</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsShopDropdownOpen(false);
                                  openConsult();
                                }}
                                className="text-primary font-bold hover:underline"
                              >
                                Ask a Hakeem →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.name === "Consult") {
                  return (
                    <button
                      key={link.name}
                      type="button"
                      onClick={() =>
                        openConsult({
                          mode: "WHATSAPP",
                          message:
                            "Assalam-o-Alaikum Hakeem Tahir Hameed Sahab, I would like to consult with you regarding authentic herbal guidance for my health.",
                        })
                      }
                      className={`text-sm font-medium transition-colors duration-150 relative py-1 flex items-center gap-1.5 cursor-pointer ${
                        isConsultOpen
                          ? "text-primary"
                          : "text-ink-body hover:text-primary"
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.5 bg-secondary/15 text-brand-gold-800 text-[9px] font-bold uppercase tracking-wider rounded-md border border-secondary/30">
                          {link.badge}
                        </span>
                      )}
                      {isConsultOpen && (
                        <span className="absolute -bottom-[3px] left-0 w-full h-[2px] bg-secondary rounded-full" />
                      )}
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(link.href, e)}
                    className={`text-sm font-medium transition-colors duration-150 relative py-1 flex items-center gap-1.5 ${
                      isActive
                        ? "text-primary"
                        : "text-ink-body hover:text-primary"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                          link.badge === "Sunnah"
                            ? "bg-surface-inverse text-brand-gold-500 border-secondary/60 shadow-xs"
                            : "bg-secondary/15 text-brand-gold-800 border-secondary/30"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute -bottom-[3px] left-0 w-full h-[2px] bg-secondary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right: Search + Cart always; account/wishlist/CTA from xl ── */}
            <div className="flex items-center gap-0.5 sm:gap-1 xl:gap-2 shrink-0">
              <button
                type="button"
                onClick={openSearch}
                className="p-2 text-ink-body hover:text-primary hover:bg-black/5 rounded-full transition-colors"
                title="Search Remedies & Symptoms"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <div className="relative hidden xl:block" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`p-2 rounded-full transition-colors ${
                    session
                      ? "text-primary bg-surface-sunken hover:bg-line"
                      : "text-ink-body hover:text-primary hover:bg-black/5"
                  }`}
                  title={session ? session.user.name : "Account & Orders"}
                  aria-label="User Account"
                  aria-expanded={isUserMenuOpen}
                >
                  <User className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-line py-1.5 z-50 animate-fade-in text-xs">
                    {session ? (
                      <>
                        <div className="px-3.5 py-2 border-b border-sand-100">
                          <p className="font-bold text-primary truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[10px] text-ink-muted truncate">
                            {session.user.email}
                          </p>
                        </div>
                        <Link
                          href={isStaff ? "/admin" : "/account"}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-primary hover:bg-surface flex items-center gap-2 font-semibold"
                        >
                          {isStaff ? (
                            <Shield className="w-3.5 h-3.5 text-brand-green-600" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-brand-green-600" />
                          )}
                          <span>
                            {isStaff ? "Admin Dashboard" : "My Account & Orders"}
                          </span>
                        </Link>
                        {!isStaff && (
                          <>
                            <Link
                              href="/wishlist"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full px-3.5 py-2 text-left text-ink-body hover:bg-surface flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Heart className="w-3.5 h-3.5 text-danger" />
                                <span>Saved Remedies</span>
                              </div>
                              {wishlist.length > 0 && (
                                <span className="px-1.5 py-0.2 bg-danger-soft text-danger text-[10px] font-bold rounded-full">
                                  {wishlist.length}
                                </span>
                              )}
                            </Link>
                            <Link
                              href="/track-order"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full px-3.5 py-2 text-left text-ink-body hover:bg-surface flex items-center gap-2"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track My Orders</span>
                            </Link>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            signOut();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-danger hover:bg-danger-soft flex items-center gap-2 border-t border-sand-100 mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-primary hover:bg-surface flex items-center gap-2 font-semibold"
                        >
                          <User className="w-3.5 h-3.5 text-brand-green-600" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-ink-body hover:bg-surface flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-danger" />
                            <span>Saved Remedies</span>
                          </div>
                          {wishlist.length > 0 && (
                            <span className="px-1.5 py-0.2 bg-danger-soft text-danger text-[10px] font-bold rounded-full">
                              {wishlist.length}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-ink-body hover:bg-surface flex items-center gap-2"
                        >
                          <span>Sign In</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-ink-body hover:bg-surface flex items-center gap-2"
                        >
                          <span>Create Account</span>
                        </Link>
                        <Link
                          href="/track-order"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-ink-body hover:bg-surface flex items-center gap-2 border-t border-sand-100"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Order (COD)</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {isStaff ? (
                <Link
                  href="/admin"
                  className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-brand-green-800 transition-colors shadow-2xs"
                  title="Open the staff dashboard"
                  aria-label="Staff dashboard"
                >
                  <Shield className="w-3.5 h-3.5 text-brand-gold-300" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/wishlist"
                    className="relative hidden xl:inline-flex p-2 text-ink-body hover:text-primary hover:bg-black/5 rounded-full transition-colors"
                    title="Saved Remedies & Wishlist"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        wishlist.length > 0
                          ? "text-danger fill-danger"
                          : "text-ink-body"
                      }`}
                    />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={openCart}
                    className="relative p-2 text-primary hover:bg-white rounded-full transition-colors border border-line bg-white shadow-2xs hover:shadow-xs"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingBag
                      key={totalItems}
                      className={`w-4 h-4 text-primary ${
                        totalItems > 0 ? "animate-pop" : ""
                      }`}
                    />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-on-secondary font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* CTA button hidden for now per instructions */}
              {/* <div className="hidden xl:block h-6 w-[1px] bg-line mx-0.5" />
              <button
                type="button"
                onClick={openConsult}
                className="hidden xl:inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-brand-green-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs hover:shadow-md active:scale-98"
              >
                <Calendar className="w-3.5 h-3.5 text-secondary-text" />
                <span>Book Appointment</span>
              </button> */}
            </div>
          </div>
        </div>
      </header>

      {/* ─── 3. MOBILE / TABLET RIGHT SHEET ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden xl:hidden">
          <div
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-surface-inverse/50 backdrop-blur-xs animate-fade-in"
            aria-hidden="true"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div
              id="mobile-nav-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="w-screen max-w-sm bg-surface shadow-drawer flex flex-col h-full border-l border-line animate-slide-in-right"
            >
              <div className="p-4 border-b border-line bg-white flex items-center justify-between shrink-0">
                <Link
                  href="/"
                  onClick={(e) => handleMobileNavClick("/", e)}
                  className="flex items-center group shrink-0"
                  aria-label="Tameer-e-Sehat Home"
                >
                  <BrandLogo variant="mobile" />
                </Link>
                <button
                  ref={closeMenuRef}
                  type="button"
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full text-ink-subtle hover:text-primary hover:bg-surface transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto p-4 space-y-5"
              >
                {/* Mobile Consult CTA button hidden for now per instructions */}

                <nav className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = isActivePath(link.href);

                    if (link.name === "Shop") {
                      return (
                        <div key={link.name} className="space-y-1">
                          <div className="flex items-center justify-between rounded-xl transition-colors hover:bg-white">
                            <Link
                              href={link.href}
                              onClick={(e) => handleMobileNavClick(link.href, e)}
                              className={`flex items-center gap-3 py-2.5 px-3 text-sm font-semibold rounded-xl flex-1 ${
                                isActive
                                  ? "bg-brand-green-50 text-primary font-bold"
                                  : "text-ink-body"
                              }`}
                            >
                              <Icon className="w-4 h-4 text-primary shrink-0" />
                              <span className="flex-1">{link.name}</span>
                              {link.badge && (
                                <span className="px-1.5 py-0.5 bg-secondary/15 text-brand-gold-800 text-[9px] font-bold uppercase tracking-wider rounded-md border border-secondary/30">
                                  {link.badge}
                                </span>
                              )}
                            </Link>
                            <button
                              type="button"
                              onClick={() => setIsMobileShopExpanded(!isMobileShopExpanded)}
                              className="p-2.5 text-ink-subtle hover:text-primary transition-colors"
                              aria-label="Toggle Shop categories"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isMobileShopExpanded ? "rotate-180 text-primary" : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* Mobile Submenu Accordion */}
                          {isMobileShopExpanded && (
                            <div className="pl-3 pr-1 py-1 space-y-1 animate-fade-in border-l-2 border-primary/20 ml-4 my-1">
                              {SHOP_SUBMENU_ITEMS.map((item) => {
                                const SubIcon = item.icon;
                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => handleMobileNavClick(item.href, e)}
                                    className={`flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                                      item.highlight
                                        ? "bg-warning-soft text-warning hover:bg-warning-soft"
                                        : "text-ink-body hover:bg-white hover:text-primary"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <SubIcon
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          item.highlight ? "text-warning" : "text-primary"
                                        }`}
                                      />
                                      <span className="truncate">{item.name}</span>
                                    </div>
                                    {item.badge && (
                                      <span
                                        className={`px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-md shrink-0 border ${
                                          item.highlight
                                            ? "bg-danger text-white border-danger"
                                            : "bg-secondary/15 text-brand-gold-800 border-secondary/30"
                                        }`}
                                      >
                                        {item.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                              <Link
                                href="/products"
                                onClick={(e) => handleMobileNavClick("/products", e)}
                                className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-secondary-text hover:bg-white transition-colors"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>View All Products</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (link.name === "Consult") {
                      return (
                        <button
                          key={link.name}
                          type="button"
                          onClick={() =>
                            openConsult({
                              mode: "WHATSAPP",
                              message:
                                "Assalam-o-Alaikum Hakeem Tahir Hameed Sahab, I would like to consult with you regarding authentic herbal guidance for my health.",
                            })
                          }
                          className={`flex items-center gap-3 py-2.5 px-3 text-sm font-semibold rounded-xl transition-colors w-full text-left cursor-pointer ${
                            isConsultOpen
                              ? "bg-brand-green-50 text-primary font-bold"
                              : "text-ink-body hover:bg-white"
                          }`}
                        >
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          <span className="flex-1">{link.name}</span>
                          {link.badge && (
                            <span className="px-1.5 py-0.5 bg-secondary/15 text-brand-gold-800 text-[9px] font-bold uppercase tracking-wider rounded-md border border-secondary/30">
                              {link.badge}
                            </span>
                          )}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={(e) => handleMobileNavClick(link.href, e)}
                        className={`flex items-center gap-3 py-2.5 px-3 text-sm font-semibold rounded-xl transition-colors ${
                          isActive
                            ? "bg-brand-green-50 text-primary font-bold"
                            : "text-ink-body hover:bg-white"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            link.badge === "Sunnah"
                              ? "text-secondary-text"
                              : "text-primary"
                          }`}
                        />
                        <span className="flex-1">{link.name}</span>
                        {link.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                              link.badge === "Sunnah"
                                ? "bg-surface-inverse text-brand-gold-500 border-secondary/60 shadow-xs"
                                : "bg-secondary/15 text-brand-gold-800 border-secondary/30"
                            }`}
                          >
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {!isStaff && (
                    <Link
                      href="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-ink-body hover:bg-white rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-danger" />
                        <span>Saved Remedies</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="px-2 py-0.5 bg-danger-soft text-danger text-[10px] font-bold rounded-full">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  )}

                  <Link
                    href="/track-order"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-ink-body hover:bg-white rounded-xl transition-colors"
                  >
                    <Truck className="w-4 h-4 text-secondary-text" />
                    <span>Track Order</span>
                  </Link>

                  {session &&
                    isStaffRole((session.user as { role?: string }).role) && (
                      <Link
                        href="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-ink-body hover:bg-white rounded-xl transition-colors"
                      >
                        <Shield className="w-4 h-4 text-brand-green-600" />
                        <span>Staff / Admin Portal</span>
                      </Link>
                    )}
                </nav>
              </div>

              <div className="p-4 border-t border-line bg-white shrink-0">
                {session ? (
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={isStaff ? "/admin" : "/account"}
                      onClick={closeMobileMenu}
                      className="text-xs min-w-0"
                    >
                      <span className="text-ink-muted block">Signed in as</span>
                      <strong className="text-primary truncate block">
                        {session.user.name}
                      </strong>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        closeMobileMenu();
                      }}
                      className="text-xs text-danger font-semibold px-3 py-1.5 bg-danger-soft rounded-lg shrink-0"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="flex-1 text-center py-2.5 bg-primary text-white font-semibold text-xs rounded-lg"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="flex-1 text-center py-2.5 bg-surface border border-line text-ink-body font-semibold text-xs rounded-lg"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </>
  );
}
