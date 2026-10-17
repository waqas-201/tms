import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_PRODUCT_IMAGE = "/images/placeholder.jpg";

/**
 * Validates whether a value is a valid image URL for Next.js <Image /> component.
 * Must be a non-empty string, not empty JSON array/object ("[]", "{}"), and either
 * a valid relative path (starts with '/') or a valid absolute HTTP/HTTPS URL.
 */
export function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === "[]" ||
    trimmed === "{}" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return false;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("./")) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extracts a safe image URL from raw product image data (which may be a JSON string, array,
 * empty array "[]", invalid URL, or valid string).
 * Guaranteed to return a valid URL or fallback to DEFAULT_PRODUCT_IMAGE.
 */
export function getSafeProductImage(img: unknown, fallback = DEFAULT_PRODUCT_IMAGE): string {
  if (typeof img === "string") {
    const trimmed = img.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const firstValid = parsed.find((item) => isValidImageUrl(item));
          if (firstValid) return firstValid.trim();
        }
      } catch {
        // Not valid JSON, fall through
      }
    }
    if (isValidImageUrl(trimmed)) {
      return trimmed;
    }
  }
  return fallback;
}
