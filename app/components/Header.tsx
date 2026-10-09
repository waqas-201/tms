"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useSession, signOut } from "@/lib/auth-client";
import { CLINIC_INFO } from "@/app/data/products";
import { useLenis } from "./SmoothScroll";
import SearchModal from "./SearchModal";
import ConsultationModal from "./ConsultationModal";
import BrandLogo from "./BrandLogo";
import { isStaffRole } from "@/lib/rbac-base";
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

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
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
    setIsConsultModalOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(false);
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const openSearch = () => {
    setIsMobileMenuOpen(false);
    setIsConsultModalOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(false);
    setIsSearchOpen(true);
  };

  const openCart = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsConsultModalOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(true);
  };

  const openConsult = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(false);
    setIsConsultModalOpen(true);
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
    { name: "Specialties", href: "/specialties", icon: Activity },
    { name: "Consult", href: "/consultation", icon: Stethoscope },
    { name: "About Us", href: "/about", icon: Building2 },
  ];

  const isActivePath = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      {/* ─── 1. TOP UTILITY STRIP (desktop only — too wide for phone/tablet) ─── */}
      <div className="bg-[#11351e] text-[#f4eee5] text-[11px] py-1.5 px-4 border-b border-[#143e23]/60 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden xl:flex items-center gap-2 text-[#e3ded6] min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27] shrink-0" />
            <span className="font-medium truncate">
              Herbal Clinic &amp; Online Consult
            </span>
            <span className="text-[#a59f95] opacity-60 shrink-0">|</span>
            <span className="text-[#c59b27] font-semibold shrink-0">
              Karachi, Pakistan (Est. 1990)
            </span>
          </div>

          <div className="flex items-center gap-3 xl:gap-4 text-[#ded8ce] ml-auto">
            <a
              href={`tel:${CLINIC_INFO.phone}`}
              className="flex items-center gap-1.5 hover:text-[#c59b27] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#c59b27]" />
              <span>{CLINIC_INFO.phoneFormatted}</span>
            </a>

            <span className="opacity-30">|</span>

            <Link
              href="/track-order"
              className="flex items-center gap-1.5 hover:text-[#c59b27] transition-colors"
            >
              <Truck className="w-3 h-3 text-[#c59b27]" />
              <span>Track Order</span>
            </Link>

            <span className="opacity-30">|</span>

            <a
              href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors font-medium text-[#25D366]"
            >
              <MessageCircle className="w-3 h-3 fill-current" />
              <span className="hidden xl:inline">WhatsApp Helpline</span>
              <span className="xl:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN NAVIGATION HEADER ─── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#e6dfd5] shadow-xs py-2"
            : "bg-[#faf8f5] border-b border-[#e6dfd5] py-2.5 sm:py-3.5"
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
                className="xl:hidden p-2 -ml-1 text-[#22623a] hover:bg-black/5 rounded-lg transition-colors"
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
                <div className="relative h-8 sm:h-10 aspect-[463/214] transition-transform duration-200 group-hover:scale-[1.02]">
                  <Image
                    src="/images/cropped-logo.png"
                    alt="Tameer-e-Sehat"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
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
                            ? "text-[#22623a]"
                            : "text-[#59534b] hover:text-[#22623a]"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isShopDropdownOpen
                              ? "rotate-180 text-[#22623a]"
                              : "text-[#7a7268]"
                          }`}
                        />
                        {link.badge && (
                          <span className="px-1.5 py-0.5 bg-[#c59b27]/15 text-[#8c6a15] text-[9px] font-bold uppercase tracking-wider rounded-md border border-[#c59b27]/30">
                            {link.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute -bottom-[3px] left-0 w-full h-[2px] bg-[#c59b27] rounded-full" />
                        )}
                      </Link>

                      {/* Mega Menu Dropdown */}
                      {isShopDropdownOpen && (
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[620px] z-50 animate-fade-in"
                          onMouseEnter={handleShopMouseEnter}
                          onMouseLeave={handleShopMouseLeave}
                        >
                          <div className="bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] p-5 overflow-hidden">
                            {/* Header bar */}
                            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#f0eae1]">
                              <div>
                                <h3 className="font-serif font-bold text-sm text-[#22623a]">
                                  Apothecary Collections &amp; Categories
                                </h3>
                                <p className="text-[11px] text-[#7a7268]">
                                  Pure, unadulterated &amp; clinically verified herbal remedies
                                </p>
                              </div>
                              <Link
                                href="/products"
                                onClick={() => setIsShopDropdownOpen(false)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#8c6a15] hover:text-[#6e520e] transition-colors group"
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
                                        ? "bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/70 hover:border-amber-300"
                                        : "bg-[#faf8f5]/60 border-transparent hover:bg-[#f0f6f2] hover:border-[#22623a]/15 hover:shadow-xs"
                                    }`}
                                  >
                                    <div
                                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                        item.highlight
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-[#eef7f1] text-[#22623a] group-hover:bg-[#22623a] group-hover:text-white"
                                      }`}
                                    >
                                      <SubIcon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-[#22623a] group-hover:text-[#174829] transition-colors">
                                          {item.name}
                                        </span>
                                        {item.badge && (
                                          <span
                                            className={`px-1.5 py-0.2 text-[8px] font-extrabold uppercase tracking-wider rounded-md border ${
                                              item.highlight
                                                ? "bg-red-500 text-white border-red-600 animate-pulse"
                                                : "bg-[#c59b27]/15 text-[#8c6a15] border-[#c59b27]/30"
                                            }`}
                                          >
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-[#7a7268] line-clamp-1 leading-snug mt-0.5">
                                        {item.subtitle}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>

                            {/* Footer Bar */}
                            <div className="mt-3.5 pt-3 border-t border-[#f0eae1] flex items-center justify-between text-[11px] text-[#7a7268] bg-[#faf8f5] -mx-5 -mb-5 px-5 py-2.5">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                                <span>Free delivery on orders above Rs. 2,000 across Pakistan</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsShopDropdownOpen(false);
                                  openConsult();
                                }}
                                className="text-[#22623a] font-bold hover:underline"
                              >
                                Ask a Hakim →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(link.href, e)}
                    className={`text-sm font-medium transition-colors duration-150 relative py-1 flex items-center gap-1.5 ${
                      isActive
                        ? "text-[#22623a]"
                        : "text-[#59534b] hover:text-[#22623a]"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 bg-[#c59b27]/15 text-[#8c6a15] text-[9px] font-bold uppercase tracking-wider rounded-md border border-[#c59b27]/30">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute -bottom-[3px] left-0 w-full h-[2px] bg-[#c59b27] rounded-full" />
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
                className="p-2 text-[#59534b] hover:text-[#22623a] hover:bg-black/5 rounded-full transition-colors"
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
                      ? "text-[#22623a] bg-[#f0eae1] hover:bg-[#e6dfd5]"
                      : "text-[#59534b] hover:text-[#22623a] hover:bg-black/5"
                  }`}
                  title={session ? session.user.name : "Account & Orders"}
                  aria-label="User Account"
                  aria-expanded={isUserMenuOpen}
                >
                  <User className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#e6dfd5] py-1.5 z-50 animate-fade-in text-xs">
                    {session ? (
                      <>
                        <div className="px-3.5 py-2 border-b border-[#f4eee5]">
                          <p className="font-bold text-[#22623a] truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[10px] text-[#6a6660] truncate">
                            {session.user.email}
                          </p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#22623a] hover:bg-[#faf8f5] flex items-center gap-2 font-semibold"
                        >
                          <User className="w-3.5 h-3.5 text-[#2d7648]" />
                          <span>My Account &amp; Orders</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#59534b] hover:bg-[#faf8f5] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                            <span>Saved Remedies</span>
                          </div>
                          {wishlist.length > 0 && (
                            <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                              {wishlist.length}
                            </span>
                          )}
                        </Link>
                        {isStaffRole((session.user as { role?: string }).role) && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full px-3.5 py-2 text-left text-[#22623a] hover:bg-[#faf8f5] flex items-center gap-2 font-medium"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#c59b27]" />
                            <span>Staff / Admin Portal</span>
                          </Link>
                        )}
                        <Link
                          href="/track-order"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#59534b] hover:bg-[#faf8f5] flex items-center gap-2"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track My Orders</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            signOut();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-[#f4eee5] mt-1"
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
                          className="w-full px-3.5 py-2 text-left text-[#22623a] hover:bg-[#faf8f5] flex items-center gap-2 font-semibold"
                        >
                          <User className="w-3.5 h-3.5 text-[#2d7648]" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#59534b] hover:bg-[#faf8f5] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                            <span>Saved Remedies</span>
                          </div>
                          {wishlist.length > 0 && (
                            <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                              {wishlist.length}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#59534b] hover:bg-[#faf8f5] flex items-center gap-2"
                        >
                          <span>Sign In</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#59534b] hover:bg-[#faf8f5] flex items-center gap-2"
                        >
                          <span>Create Account</span>
                        </Link>
                        <Link
                          href="/track-order"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#59534b] hover:bg-[#faf8f5] flex items-center gap-2 border-t border-[#f4eee5]"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Order (COD)</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/wishlist"
                className="relative hidden xl:inline-flex p-2 text-[#59534b] hover:text-[#22623a] hover:bg-black/5 rounded-full transition-colors"
                title="Saved Remedies & Wishlist"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    wishlist.length > 0
                      ? "text-red-500 fill-red-500"
                      : "text-[#59534b]"
                  }`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-[#22623a] hover:bg-white rounded-full transition-colors border border-[#e6dfd5] bg-white shadow-2xs hover:shadow-xs"
                aria-label="Shopping Cart"
              >
                <ShoppingBag
                  key={totalItems}
                  className={`w-4 h-4 text-[#22623a] ${
                    totalItems > 0 ? "animate-pop" : ""
                  }`}
                />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c59b27] text-[#22623a] font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* CTA button hidden for now per instructions */}
              {/* <div className="hidden xl:block h-6 w-[1px] bg-[#e6dfd5] mx-0.5" />
              <button
                type="button"
                onClick={openConsult}
                className="hidden xl:inline-flex items-center gap-2 px-4 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs hover:shadow-md active:scale-98"
              >
                <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
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
            className="absolute inset-0 bg-[#0c2417]/50 backdrop-blur-xs animate-fade-in"
            aria-hidden="true"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div
              id="mobile-nav-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="w-screen max-w-sm bg-[#faf8f5] shadow-drawer flex flex-col h-full border-l border-[#e6dfd5] animate-slide-in-right"
            >
              <div className="p-4 border-b border-[#e6dfd5] bg-white flex items-center justify-between shrink-0">
                <Link
                  href="/"
                  onClick={(e) => handleMobileNavClick("/", e)}
                  className="flex items-center group shrink-0"
                  aria-label="Tameer-e-Sehat Home"
                >
                  <div className="relative h-8 aspect-[463/214]">
                    <Image
                      src="/images/cropped-logo.png"
                      alt="Tameer-e-Sehat"
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                </Link>
                <button
                  ref={closeMenuRef}
                  type="button"
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full text-[#7a7268] hover:text-[#22623a] hover:bg-[#faf8f5] transition-colors"
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
                                  ? "bg-[#eef7f1] text-[#22623a] font-bold"
                                  : "text-[#59534b]"
                              }`}
                            >
                              <Icon className="w-4 h-4 text-[#22623a] shrink-0" />
                              <span className="flex-1">{link.name}</span>
                              {link.badge && (
                                <span className="px-1.5 py-0.5 bg-[#c59b27]/15 text-[#8c6a15] text-[9px] font-bold uppercase tracking-wider rounded-md border border-[#c59b27]/30">
                                  {link.badge}
                                </span>
                              )}
                            </Link>
                            <button
                              type="button"
                              onClick={() => setIsMobileShopExpanded(!isMobileShopExpanded)}
                              className="p-2.5 text-[#7a7268] hover:text-[#22623a] transition-colors"
                              aria-label="Toggle Shop categories"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isMobileShopExpanded ? "rotate-180 text-[#22623a]" : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* Mobile Submenu Accordion */}
                          {isMobileShopExpanded && (
                            <div className="pl-3 pr-1 py-1 space-y-1 animate-fade-in border-l-2 border-[#22623a]/20 ml-4 my-1">
                              {SHOP_SUBMENU_ITEMS.map((item) => {
                                const SubIcon = item.icon;
                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => handleMobileNavClick(item.href, e)}
                                    className={`flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                                      item.highlight
                                        ? "bg-amber-50 text-amber-900 hover:bg-amber-100"
                                        : "text-[#59534b] hover:bg-white hover:text-[#22623a]"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <SubIcon
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          item.highlight ? "text-amber-600" : "text-[#22623a]"
                                        }`}
                                      />
                                      <span className="truncate">{item.name}</span>
                                    </div>
                                    {item.badge && (
                                      <span
                                        className={`px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-md shrink-0 border ${
                                          item.highlight
                                            ? "bg-red-500 text-white border-red-600"
                                            : "bg-[#c59b27]/15 text-[#8c6a15] border-[#c59b27]/30"
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
                                className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-[#8c6a15] hover:bg-white transition-colors"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>View All Products</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={(e) => handleMobileNavClick(link.href, e)}
                        className={`flex items-center gap-3 py-2.5 px-3 text-sm font-semibold rounded-xl transition-colors ${
                          isActive
                            ? "bg-[#eef7f1] text-[#22623a] font-bold"
                            : "text-[#59534b] hover:bg-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#22623a] shrink-0" />
                        <span className="flex-1">{link.name}</span>
                        {link.badge && (
                          <span className="px-1.5 py-0.5 bg-[#c59b27]/15 text-[#8c6a15] text-[9px] font-bold uppercase tracking-wider rounded-md border border-[#c59b27]/30">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  <Link
                    href="/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-[#59534b] hover:bg-white rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Saved Remedies</span>
                    </div>
                    {wishlist.length > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/track-order"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-[#59534b] hover:bg-white rounded-xl transition-colors"
                  >
                    <Truck className="w-4 h-4 text-[#8c6a15]" />
                    <span>Track Order</span>
                  </Link>

                  {session &&
                    isStaffRole((session.user as { role?: string }).role) && (
                      <Link
                        href="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-[#59534b] hover:bg-white rounded-xl transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#2d7648]" />
                        <span>Staff / Admin Portal</span>
                      </Link>
                    )}
                </nav>
              </div>

              <div className="p-4 border-t border-[#e6dfd5] bg-white shrink-0">
                {session ? (
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href="/account"
                      onClick={closeMobileMenu}
                      className="text-xs min-w-0"
                    >
                      <span className="text-[#6a6660] block">Signed in as</span>
                      <strong className="text-[#22623a] truncate block">
                        {session.user.name}
                      </strong>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        closeMobileMenu();
                      }}
                      className="text-xs text-red-600 font-semibold px-3 py-1.5 bg-red-50 rounded-lg shrink-0"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="flex-1 text-center py-2.5 bg-[#22623a] text-white font-semibold text-xs rounded-lg"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="flex-1 text-center py-2.5 bg-[#faf8f5] border border-[#e6dfd5] text-[#59534b] font-semibold text-xs rounded-lg"
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

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
      />
    </>
  );
}
