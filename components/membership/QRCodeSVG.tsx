import React, { useMemo } from "react";
import QRCode from "qrcode";
import { BRAND } from "@/lib/brand-colors";

export interface QRCodeSVGProps {
  value: string;
  size?: number;
  margin?: number;
  className?: string;
  title?: string;
  fgColor?: string;
  bgColor?: string;
}

/**
 * Synchronous vector SVG QR code component.
 * Renders pure vector paths synchronously so print rendering and SSR
 * never display an empty or flashing placeholder.
 * Defaults to margin: 4 for ISO/IEC 18004 standard quiet zone.
 */
export function QRCodeSVG({
  value,
  size = 180,
  margin = 4,
  className = "",
  title,
  fgColor = BRAND.surfaceInverse,
  bgColor = BRAND.surfaceRaised,
}: QRCodeSVGProps) {
  const qrSvg = useMemo(() => {
    try {
      const qr = QRCode.create(value, {
        errorCorrectionLevel: "M",
      });
      const numModules = qr.modules.size;
      const totalSize = numModules + margin * 2;

      let pathData = "";
      for (let r = 0; r < numModules; r++) {
        for (let c = 0; c < numModules; c++) {
          if (qr.modules.get(r, c)) {
            pathData += `M${c + margin} ${r + margin}h1v1h-1z `;
          }
        }
      }

      return {
        totalSize,
        pathData,
      };
    } catch (err) {
      console.error("Failed to synchronously generate QR SVG:", err);
      return null;
    }
  }, [value, margin]);

  if (!qrSvg) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-sand-100 rounded-xl text-xs text-neutral-400 ${className}`}
      >
        QR Error
      </div>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${qrSvg.totalSize} ${qrSvg.totalSize}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={title || `QR code for ${value}`}
    >
      {title && <title>{title}</title>}
      <rect width={qrSvg.totalSize} height={qrSvg.totalSize} fill={bgColor} />
      <path d={qrSvg.pathData} fill={fgColor} />
    </svg>
  );
}
