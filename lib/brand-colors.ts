/**
 * Literal brand colours.
 *
 * This module exists for the three places a CSS custom property cannot reach:
 * transactional email, document metadata / manifest, and generated image assets.
 * Everything rendered by the app must use the tokens in app/globals.css instead.
 *
 * Keep these values in sync with `@theme` in app/globals.css.
 */
export const BRAND = {
  primary: "#22623a",
  primaryHover: "#1b502e",
  secondary: "#c59b27",
  secondaryText: "#725721",
  secondaryOnDark: "#f5e6b8",
  primarySoft: "#f4f9f5",

  surface: "#faf8f5",
  surfaceRaised: "#ffffff",
  surfaceSunken: "#f4eee5",
  surfaceInverse: "#14281d",

  line: "#e6dfd5",
  lineStrong: "#8c8880",

  ink: "#1a1816",
  inkBody: "#59534b",
  inkMuted: "#6a6660",
  inkSubtle: "#6b6660",
  onInverse: "#faf8f5",
  onInverseMuted: "#a8cbb5",

  success: "#047857",
  successSoft: "#ecfdf5",
  successLine: "#a7f3d0",
  warning: "#b45309",
  warningSoft: "#fffbeb",
  warningLine: "#fde68a",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",
  info: "#1d4ed8",
  infoSoft: "#eff6ff",
  infoLine: "#bfdbfe",
  plum: "#7e22ce",
  plumSoft: "#faf5ff",
  plumLine: "#e9d5ff",

  whatsapp: "#25d366",
  whatsappHover: "#1ebe5d",
  onWhatsapp: "#14281d",

  googleBlue: "#4285f4",
  googleGreen: "#34a853",
  googleYellow: "#fbbc05",
  googleRed: "#ea4335",

  // Alpha variants for inline email styles.
  primaryA05: "rgba(34, 98, 58, 0.05)",
  primaryA06: "rgba(34, 98, 58, 0.06)",
  primaryA08: "rgba(34, 98, 58, 0.08)",
  primaryA2: "rgba(34, 98, 58, 0.2)",
  blackA05: "rgba(0, 0, 0, 0.05)",
  blackA06: "rgba(0, 0, 0, 0.06)",
} as const;
