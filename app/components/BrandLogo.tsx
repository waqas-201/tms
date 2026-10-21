import React from "react";
import Image from "next/image";

export interface BrandLogoProps {
  variant?: "header" | "footer" | "invoice" | "mobile" | "icon-only";
  showTagline?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Backwards compatibility helper for any callers that previously imported BotanicalEmblem.
 * Renders the authentic official logo emblem instead of the synthetic placeholder SVG.
 */
export function BotanicalEmblem({
  size = 38,
  className = "",
  theme = "light",
}: {
  size?: number;
  className?: string;
  theme?: "light" | "dark" | "invoice";
}) {
  const width = Math.round(size * (463 / 214));
  const isDark = theme === "dark";
  const isInvoice = theme === "invoice";

  return (
    <div
      style={{ height: size, width }}
      className={`relative shrink-0 ${
        isDark
          ? "bg-white/10 rounded-lg p-0.5 ring-1 ring-secondary/40"
          : isInvoice
          ? "bg-white rounded-md p-0.5 border border-line"
          : ""
      } ${className}`}
    >
      <Image
        src={isDark ? "/images/logo-mono-light.png" : "/images/cropped-logo.png"}
        alt="Tameer-e-Sehat Official Logo"
        fill
        sizes={`${width}px`}
        quality={95}
        className="object-contain"
      />
    </div>
  );
}

export default function BrandLogo({
  variant = "header",
  showTagline = true,
  className = "",
  priority = true,
}: BrandLogoProps) {
  // Icon only - pure emblem badge presentation
  if (variant === "icon-only") {
    return (
      <div
        className={`relative h-9 sm:h-10 aspect-[463/214] shrink-0 inline-flex items-center ${className}`}
      >
        <Image
          src="/images/cropped-logo.png"
          alt="Tameer-e-Sehat Official Logo"
          fill
          sizes="120px"
          priority={priority}
          quality={95}
          className="object-contain"
        />
      </div>
    );
  }

  // Footer variant - high-contrast container on the inverse surface
  if (variant === "footer") {
    return (
      <div className={`flex items-center gap-3.5 group select-none ${className}`}>
        <div className="relative h-10 sm:h-11 md:h-12 aspect-[463/214] rounded-lg overflow-hidden bg-white/10 p-0.5 shadow-md ring-1 ring-secondary/40 group-hover:ring-secondary group-hover:scale-105 transition-all shrink-0">
          <Image
            src="/images/logo-mono-light.png"
            alt="Tameer-e-Sehat Official Logo"
            fill
            sizes="(max-width: 640px) 95px, 125px"
            quality={95}
            priority={priority}
            className="object-contain p-0.5"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-brand-gold-300 transition-colors leading-tight">
              Tameer-e-Sehat
            </span>
          </div>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium tracking-wide text-brand-gold-300">
              <span>Herbal Clinic &amp; Dispensary</span>
              <span className="opacity-50">•</span>
              <span className="text-on-inverse/80 font-normal">Est. 1990</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Invoice variant - crisp, clean, print-friendly rendering
  if (variant === "invoice") {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <div className="relative h-11 sm:h-12 aspect-[463/214] shrink-0 rounded-md border border-line bg-white p-0.5 shadow-2xs">
          <Image
            src="/images/cropped-logo.png"
            alt="Tameer-e-Sehat Official Logo"
            fill
            sizes="120px"
            quality={95}
            priority={priority}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-xl sm:text-2xl font-bold text-primary tracking-tight leading-none">
            Tameer-e-Sehat
          </span>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px] uppercase tracking-wider font-semibold text-secondary-text">
              <span>Classical Unani Medicine</span>
              <span className="opacity-40">•</span>
              <span className="text-ink-body font-medium">Est. 1990</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile variant - compact crisp size for mobile navbar & drawer
  if (variant === "mobile") {
    return (
      <div className={`flex items-center gap-2 group select-none min-w-0 ${className}`}>
        <div className="relative h-8 sm:h-8.5 aspect-[463/214] shrink-0 transition-transform duration-200 group-hover:scale-105">
          <Image
            src="/images/cropped-logo.png"
            alt="Tameer-e-Sehat Official Logo"
            fill
            sizes="85px"
            priority={priority}
            quality={95}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0 justify-center">
          <span className="font-serif text-[15px] sm:text-base font-bold tracking-tight text-primary leading-none truncate">
            Tameer-e-Sehat
          </span>
          {showTagline && (
            <span className="text-[9.5px] text-secondary-text font-medium tracking-wide mt-1 leading-none truncate">
              Herbal Clinic &amp; Dispensary
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: "header" variant
  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}
    >
      {/* Official Emblem Badge */}
      <div className="relative h-9 sm:h-10 md:h-11 aspect-[463/214] shrink-0 transition-transform duration-300 group-hover:scale-[1.03]">
        <Image
          src="/images/cropped-logo.png"
          alt="Tameer-e-Sehat Official Logo"
          fill
          sizes="(max-width: 640px) 85px, 115px"
          priority={priority}
          quality={95}
          className="object-contain drop-shadow-xs"
        />
      </div>

      {/* Typography Lockup */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-primary group-hover:text-brand-green-900 transition-colors leading-tight">
            Tameer-e-Sehat
          </span>
          <span className="hidden 2xl:inline-block px-1.5 py-0.5 bg-secondary/15 text-brand-gold-800 text-[9px] font-bold rounded-sm border border-secondary/30 tracking-wider">
            EST. 1990
          </span>
        </div>

        {showTagline && (
          <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-medium tracking-wide text-ink-subtle group-hover:text-ink-body transition-colors leading-none mt-0.5">
            <span className="text-secondary-text font-semibold">Herbal Clinic</span>
            <span className="opacity-40">•</span>
            <span>Online Dispensary</span>
          </div>
        )}
      </div>
    </div>
  );
}
