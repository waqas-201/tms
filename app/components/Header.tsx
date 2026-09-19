"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useSession, signOut } from "@/lib/auth-client";
import { CLINIC_INFO } from "@/app/data/products";
import SearchModal from "./SearchModal";
import ConsultationModal from "./ConsultationModal";
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
  Package,
  Building2,
  ChevronDown,
  Sparkles,
  MapPin,
  Clock,
  Home,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen, wishlist } = useCart();
  const { data: session } = useSession();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll shadow & glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/products", icon: ShoppingBag },
    { name: "Nuskhajaat", href: "/nuskhajaat", icon: Sparkles, badge: "Custom" },
    { name: "Specialties", href: "/specialties", icon: Activity },
    { name: "Consult", href: "/consultation", icon: Stethoscope },
    { name: "About Us", href: "/about", icon: Building2 },
  ];

  return (
    <>
      {/* ─── 1. TOP UTILITY STRIP ─── */}
      <div className="bg-[#11351e] text-[#f4eee5] text-[11px] py-1.5 px-4 border-b border-[#143e23]/60 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Authority & Scope */}
          <div className="flex items-center gap-2 text-[#e3ded6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27]" />
            <span className="font-medium">
              Herbal Clinic &amp; Online Consult
            </span>
            <span className="text-[#a59f95] opacity-60">|</span>
            <span className="text-[#c59b27] font-semibold">
              Karachi, Pakistan (Est. 1990)
            </span>
          </div>

          {/* Right: Essential Contact & Order Tracking */}
          <div className="flex items-center gap-4 text-[#ded8ce]">
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
              <span>WhatsApp Helpline</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN NAVIGATION HEADER ─── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#e6dfd5] shadow-xs py-2.5"
            : "bg-[#faf8f5] border-b border-[#e6dfd5] py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">

            {/* ── Left: Brand Signature ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative h-9 sm:h-10 w-auto shrink-0 overflow-hidden rounded-md border border-[#e6dfd5]/80 bg-white p-0.5 group-hover:border-[#22623a]/50 transition-colors shadow-2xs">
                <Image
                  src="/images/cropped-logo.png"
                  alt="Tameer-e-Sehat Herbal Healthcare"
                  width={150}
                  height={38}
                  className="h-full w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#22623a] leading-tight group-hover:text-[#1b502e] transition-colors">
                  Tameer-e-Sehat
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-widest text-[#7a7268] uppercase font-semibold -mt-0.5">
                  Herbal Clinic &amp; Care
                </span>
              </div>
            </Link>

            {/* ── Center: Primary Navigation Links ── */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.name}
                    href={link.href}
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

            {/* ── Right: Utilities & Primary Appointment CTA ── */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Search Modal Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#59534b] hover:text-[#22623a] hover:bg-black/5 rounded-full transition-colors"
                title="Search Remedies & Symptoms"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* User Account Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`p-2 rounded-full transition-colors ${
                    session
                      ? "text-[#22623a] bg-[#f0eae1] hover:bg-[#e6dfd5]"
                      : "text-[#59534b] hover:text-[#22623a] hover:bg-black/5"
                  }`}
                  title={session ? session.user.name : "Account & Orders"}
                  aria-label="User Account"
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
                        {isStaffRole((session.user as any).role) && (
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

              {/* Wishlist Link Button */}
              <Link
                href="/wishlist"
                className="relative p-2 text-[#59534b] hover:text-[#22623a] hover:bg-black/5 rounded-full transition-colors"
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

              {/* Shopping Bag Drawer Button */}
              <button
                onClick={() => setIsCartOpen(true)}
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

              {/* Divider on Desktop */}
              <div className="hidden sm:block h-6 w-[1px] bg-[#e6dfd5] mx-0.5" />

              {/* Primary "Book Appointment" High-Converting CTA Button */}
              <button
                onClick={() => setIsConsultModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs hover:shadow-md active:scale-98"
              >
                <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Book Appointment</span>
              </button>

              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-[#22623a] hover:bg-black/5 rounded-lg transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── 3. MOBILE SLIDE-DOWN DRAWER ─── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#e6dfd5] px-4 py-5 space-y-5 animate-fade-in shadow-xl">
            {/* Primary Action Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsConsultModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md"
            >
              <Calendar className="w-4 h-4 text-[#c59b27]" />
              <span>Book Appointment / Consult Hakim</span>
            </button>

            {/* Navigation Links with Icons */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2.5 px-3 text-xs font-semibold rounded-xl transition-colors ${
                      isActive
                        ? "bg-[#eef7f1] text-[#22623a] font-bold"
                        : "text-[#59534b] hover:bg-[#faf8f5]"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#22623a]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 text-xs font-semibold text-[#59534b] hover:bg-[#faf8f5] rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Saved Remedies / Wishlist</span>
                </div>
                {wishlist.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                href="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2.5 px-3 text-xs font-semibold text-[#59534b] hover:bg-[#faf8f5] rounded-xl transition-colors"
              >
                <Truck className="w-4 h-4 text-[#8c6a15]" />
                <span>Track Order (Cash on Delivery)</span>
              </Link>

              {session && isStaffRole((session.user as any).role) && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 text-xs font-semibold text-[#59534b] hover:bg-[#faf8f5] rounded-xl transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#2d7648]" />
                  <span>Staff / Admin Portal</span>
                </Link>
              )}
            </div>

            {/* Clinic Info Box on Mobile */}
            <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-xs space-y-2">
              <div className="flex items-center justify-between text-[#22623a] font-bold">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
                  Karachi Clinic &amp; Dispensary
                </span>
                <span className="text-[10px] text-[#8c6a15]">Est. 1990</span>
              </div>
              <p className="text-[11px] text-[#6a6660]">
                {CLINIC_INFO.address}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${CLINIC_INFO.phone}`}
                  className="flex-1 text-center py-2 bg-white border border-[#e6dfd5] rounded-lg text-[#22623a] font-semibold text-[11px]"
                >
                  Call: {CLINIC_INFO.phoneFormatted}
                </a>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-[#25D366] text-white rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 fill-current" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Auth Link */}
            <div className="pt-2 border-t border-[#f4eee5]">
              {session ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#6a6660] block">Signed in as:</span>
                    <strong className="text-[#22623a]">{session.user.name}</strong>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-600 font-semibold px-3 py-1.5 bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-white border border-[#e6dfd5] text-[#22623a] font-semibold text-xs rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-[#faf8f5] border border-[#e6dfd5] text-[#59534b] font-semibold text-xs rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Global Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
      />
    </>
  );
}
