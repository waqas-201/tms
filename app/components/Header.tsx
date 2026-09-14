"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession, signOut } from "@/lib/auth-client";
import { CLINIC_INFO } from "@/app/data/products";
import SearchModal from "./SearchModal";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  User,
  Shield,
  LogOut,
  Truck,
  MessageCircle,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { language, setLanguage, isUrdu } = useLanguage();
  const { data: session } = useSession();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focused, high-priority navigation links
  const navLinks = [
    { name: isUrdu ? "ادویات و قرابادین" : "Apothecary", href: "/products" },
    { name: isUrdu ? "طبی معائنہ" : "Consultation", href: "/consultation" },
    { name: isUrdu ? "حکیم و تاریخ" : "Heritage", href: "/about" },
    { name: isUrdu ? "مطب و رابطہ" : "Clinic & Contact", href: "/contact" },
  ];

  return (
    <>
      {/* 1. Sleek Announcement Bar */}
      <div className="bg-[#0f2e1e] text-[#f4eee5] text-[11px] py-1.5 px-4 border-b border-[#1a4d33]/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#e3ded6]">
            <span className="text-[#c59b27] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{isUrdu ? "مفت ترسیل" : "Free Delivery"}</span>
            </span>
            <span className="hidden sm:inline opacity-80">
              {isUrdu
                ? "· پورے پاکستان میں 2,000 روپے سے زائد کے آرڈر پر"
                : "· Nationwide on orders above ₨ 2,000"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#ded8ce]">
            <Link
              href="/track-order"
              className="flex items-center gap-1 hover:text-[#c59b27] transition-colors"
            >
              <Truck className="w-3 h-3 text-[#c59b27]" />
              <span>{isUrdu ? "آرڈر ٹریکنگ" : "Track Order"}</span>
            </Link>

            <span className="opacity-40">|</span>

            <a
              href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#25D366] transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3 text-[#25D366]" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Luxury Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-250 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#e6dfd5] shadow-xs py-2.5"
            : "bg-[#faf8f5] border-b border-[#e6dfd5]/80 py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">

            {/* Brand Logo & Signature */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative h-9 sm:h-10 w-auto shrink-0 overflow-hidden rounded-md border border-[#e6dfd5]/60 group-hover:border-[#c59b27]/50 transition-colors">
                <Image
                  src="/images/cropped-logo.png"
                  alt="Tameer-e-Sehat"
                  width={160}
                  height={40}
                  className="h-full w-auto object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-[#123824] leading-tight group-hover:text-[#1a4d33] transition-colors">
                  Tameer-e-Sehat
                </span>
                <span className="text-[10px] tracking-widest text-[#857f76] flex items-center gap-1 font-medium -mt-0.5">
                  <span className="text-[#c59b27] font-serif font-bold">تعمیرِ صحت</span>
                  <span className="opacity-30">·</span>
                  <span>Est. 1990</span>
                </span>
              </div>
            </Link>

            {/* Desktop Center Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs uppercase tracking-wider font-semibold transition-all duration-200 relative py-1 ${
                      isActive
                        ? "text-[#123824] font-bold"
                        : "text-[#635d54] hover:text-[#123824]"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#123824] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Suite (Clean & Uncluttered) */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Language Switcher (Minimalist Text Toggle) */}
              <div className="flex items-center bg-[#f0eae1] rounded-md p-0.5 border border-[#e6dfd5] text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    language === "en"
                      ? "bg-[#123824] text-white shadow-2xs"
                      : "text-[#635d54] hover:text-[#123824]"
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ur")}
                  className={`px-2 py-0.5 rounded font-urdu text-[11px] transition-colors ${
                    language === "ur"
                      ? "bg-[#123824] text-[#c59b27] shadow-2xs"
                      : "text-[#635d54] hover:text-[#123824]"
                  }`}
                  aria-label="Urdu"
                >
                  اردو
                </button>
              </div>

              {/* Search Modal Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#59534b] hover:text-[#123824] hover:bg-black/5 rounded-full transition-colors"
                title={isUrdu ? "ادویات تلاش کریں" : "Search Formulations"}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* User Account / Portal Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`p-2 rounded-full transition-colors ${
                    session
                      ? "text-[#123824] bg-[#f0eae1] hover:bg-[#e6dfd5]"
                      : "text-[#59534b] hover:text-[#123824] hover:bg-black/5"
                  }`}
                  title={session ? session.user.name : "Account & Portal"}
                  aria-label="Account"
                >
                  <User className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#e6dfd5] py-1.5 z-50 animate-fade-in text-xs">
                    {session ? (
                      <>
                        <div className="px-3.5 py-2 border-b border-[#f4eee5]">
                          <p className="font-bold text-[#123824] truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[10px] text-[#6a6660] truncate">
                            {session.user.email}
                          </p>
                        </div>
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#123824] hover:bg-[#faf8f5] flex items-center gap-2 font-medium"
                        >
                          <Shield className="w-3.5 h-3.5 text-[#c59b27]" />
                          <span>Hakim & Admin Desk</span>
                        </Link>
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
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#123824] hover:bg-[#faf8f5] flex items-center gap-2 font-semibold"
                        >
                          <span>Sign In / Hakim Portal</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3.5 py-2 text-left text-[#59534b] hover:bg-[#faf8f5] flex items-center gap-2"
                        >
                          <span>Create Patient Account</span>
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

              {/* Shopping Bag Drawer Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#123824] hover:bg-white rounded-full transition-colors border border-[#e6dfd5] bg-white shadow-2xs hover:shadow-xs"
                aria-label="Shopping Bag"
              >
                <ShoppingBag
                  key={totalItems}
                  className={`w-4 h-4 text-[#123824] ${
                    totalItems > 0 ? "animate-pop" : ""
                  }`}
                />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c59b27] text-[#123824] font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 text-[#123824] hover:bg-black/5 rounded-md transition-colors"
                aria-label="Toggle Navigation"
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

        {/* Mobile Flyout Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#e6dfd5] px-5 py-5 space-y-4 animate-fade-in shadow-xl">
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 px-3 text-sm font-medium rounded-md ${
                  pathname === "/" ? "bg-[#f4eee5] text-[#123824] font-bold" : "text-[#59534b]"
                }`}
              >
                {isUrdu ? "صفحۂ اول" : "Home"}
              </Link>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-2 px-3 text-sm font-medium rounded-md ${
                      isActive ? "bg-[#f4eee5] text-[#123824] font-bold" : "text-[#59534b]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <Link
                href="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-3 text-sm font-medium text-[#59534b]"
              >
                {isUrdu ? "آرڈر ٹریکنگ (کیش آن ڈیلیوری)" : "Track Order (COD)"}
              </Link>
            </div>

            <div className="pt-3 border-t border-[#e6dfd5] space-y-2">
              <Link
                href="/consultation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#123824] text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>{isUrdu ? "طبی معائنہ شروع کریں" : "Consult Hakim Online"}</span>
              </Link>

              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#faf8f5] text-[#123824] border border-[#e6dfd5] text-xs font-medium rounded-md"
              >
                <User className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>{isUrdu ? "حکیم و ایڈمن پورٹل لاگ ان" : "Hakim & Admin Sign In"}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
