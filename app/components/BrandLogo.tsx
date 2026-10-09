import React from "react";

interface BrandLogoProps {
  variant?: "header" | "footer" | "invoice" | "mobile" | "icon-only";
  showTagline?: boolean;
  className?: string;
}

export function BotanicalEmblem({
  size = 38,
  className = "",
  theme = "light",
}: {
  size?: number;
  className?: string;
  theme?: "light" | "dark" | "invoice";
}) {
  const isDark = theme === "dark";
  const isInvoice = theme === "invoice";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Outer Ring Gold Gradient */}
        <linearGradient
          id="goldRing"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#e5c05d" />
          <stop offset="50%" stopColor="#c59b27" />
          <stop offset="100%" stopColor="#967215" />
        </linearGradient>

        {/* Emerald Medallion Gradient */}
        <linearGradient
          id="emeraldBg"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#2c7a4b" />
          <stop offset="60%" stopColor="#1e5834" />
          <stop offset="100%" stopColor="#11351e" />
        </linearGradient>

        {/* Leaf 1 Vibrant Emerald */}
        <linearGradient
          id="leafGradientPrimary"
          x1="20%"
          y1="10%"
          x2="80%"
          y2="90%"
        >
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="40%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Leaf 2 Golden Accent */}
        <linearGradient
          id="leafGradientAccent"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Subtle Inner Glow */}
        <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor="#000"
            floodOpacity={isDark ? "0.4" : "0.15"}
          />
        </filter>
      </defs>

      {/* Outer Border Halo */}
      <circle
        cx="24"
        cy="24"
        r="23"
        fill={isDark ? "#143e23" : isInvoice ? "#faf8f5" : "#fbf9f5"}
        stroke="url(#goldRing)"
        strokeWidth="1.2"
        strokeDasharray={isInvoice ? undefined : "3 1"}
        opacity={isDark ? 0.9 : 0.8}
      />

      {/* Main Inner Medallion */}
      <circle
        cx="24"
        cy="24"
        r="20.5"
        fill={isInvoice ? "#22623a" : "url(#emeraldBg)"}
        filter="url(#emblemGlow)"
      />

      {/* Inner Decorative Accent Ring */}
      <circle
        cx="24"
        cy="24"
        r="18.5"
        stroke="url(#goldRing)"
        strokeWidth="0.8"
        strokeOpacity={0.5}
        fill="none"
      />

      {/* Heritage Stars / Dots at Compass Points */}
      <circle cx="24" cy="6.2" r="0.8" fill="#e5c05d" />
      <circle cx="24" cy="41.8" r="0.8" fill="#e5c05d" />
      <circle cx="6.2" cy="24" r="0.8" fill="#e5c05d" />
      <circle cx="41.8" cy="24" r="0.8" fill="#e5c05d" />

      {/* Botanical Stem & Remedy Arc */}
      <path
        d="M24 36.5 C24 33 22 28.5 17 24 C14 21.3 12.5 18 13.2 14"
        stroke="url(#goldRing)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Primary Classical Unani Leaf (Left Sweeping) */}
      <path
        d="M24 35 C23 30 18 26 15 22 C13 19 13.5 14 17.5 13.5 C21.5 13 25 17 25 22 C25 27 24.5 32 24 35 Z"
        fill="url(#leafGradientPrimary)"
        opacity={0.95}
      />
      {/* Primary Leaf Central Spine */}
      <path
        d="M17.5 13.5 C19 18 21.5 24 24 35"
        stroke="#065f46"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Secondary Accent Leaf / Sprout (Right Upward) */}
      <path
        d="M23 29 C24 25 28 22 31.5 19 C34 16.8 34.2 13 31 12 C27.5 11 24 15 23 19.5 C22.4 23 22.8 26.5 23 29 Z"
        fill="url(#leafGradientAccent)"
        opacity={0.9}
      />
      {/* Secondary Leaf Vein */}
      <path
        d="M31 12 C28.5 15.5 25.5 21 23 29"
        stroke="#854d0e"
        strokeWidth="0.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Central Dewdrop / Pure Essence Pearl */}
      <circle
        cx="24"
        cy="17"
        r="2"
        fill="#ffffff"
        opacity={0.9}
      />
      <circle
        cx="24"
        cy="17"
        r="1"
        fill="#e5c05d"
      />
    </svg>
  );
}

export default function BrandLogo({
  variant = "header",
  showTagline = true,
  className = "",
}: BrandLogoProps) {
  if (variant === "icon-only") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <BotanicalEmblem size={36} theme="light" />
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`flex items-center gap-3.5 group select-none ${className}`}>
        <div className="relative p-0.5 rounded-full ring-1 ring-[#c59b27]/40 bg-[#11351e]/80 shadow-md group-hover:ring-[#c59b27] transition-all duration-300 group-hover:scale-105">
          <BotanicalEmblem size={44} theme="dark" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#e5c05d] transition-colors">
              Tameer-e-Sehat
            </span>
          </div>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium tracking-wide text-[#c59b27]">
              <span>Herbal Clinic &amp; Dispensary</span>
              <span className="opacity-50">•</span>
              <span className="text-[#e3ded6]/80 font-normal">Est. 1990</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "invoice") {
    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        <div className="relative p-0.5 rounded-full ring-1 ring-[#c59b27]/50 bg-white shadow-xs">
          <BotanicalEmblem size={46} theme="invoice" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-xl sm:text-2xl font-bold text-[#22623a] tracking-tight">
            Tameer-e-Sehat
          </span>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] uppercase tracking-wider font-semibold text-[#c59b27]">
              <span>Classical Unani Medicine</span>
              <span className="opacity-40">•</span>
              <span className="text-[#59534b] font-medium">Est. 1990</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className={`flex items-center gap-2.5 group select-none ${className}`}>
        <div className="relative p-0.5 rounded-full ring-1 ring-[#c59b27]/30 bg-white shadow-2xs group-hover:ring-[#c59b27]/80 transition-all duration-300">
          <BotanicalEmblem size={32} theme="light" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#1b4b2d] leading-none">
            Tameer-e-Sehat
          </span>
          <span className="text-[9.5px] text-[#8c6a15] font-medium tracking-wide mt-1">
            Herbal Clinic &amp; Dispensary
          </span>
        </div>
      </div>
    );
  }

  // Default: "header"
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Emblem Seal */}
      <div className="relative p-0.5 rounded-full ring-1 ring-[#c59b27]/35 bg-white shadow-2xs group-hover:ring-[#c59b27] group-hover:shadow-xs transition-all duration-300 group-hover:scale-[1.03]">
        <BotanicalEmblem
          size={36}
          theme="light"
          className="group-hover:rotate-6"
        />
      </div>

      {/* Typography Lockup */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1b4b2d] group-hover:text-[#143e23] transition-colors leading-tight">
            Tameer-e-Sehat
          </span>
          <span className="hidden 2xl:inline-block px-1.5 py-0.2 bg-[#c59b27]/15 text-[#8c6a15] text-[9px] font-bold rounded-sm border border-[#c59b27]/30">
            EST. 1990
          </span>
        </div>

        {showTagline && (
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-[#7a7268] group-hover:text-[#59534b] transition-colors leading-none mt-0.5">
            <span className="text-[#8c6a15] font-semibold">Herbal Clinic</span>
            <span className="opacity-40">•</span>
            <span>Online Dispensary</span>
          </div>
        )}
      </div>
    </div>
  );
}
