export const HIJAMA_BOOKING_DRAFT_KEY = "tms_hijama_booking_draft";
export const CONSULTATION_DRAFT_KEY = "tms_consultation_draft";

/**
 * Returns a validated safe relative redirect path, preventing open redirect vulnerabilities.
 */
export function getSafeRedirect(path: string | null | undefined, fallback = "/account"): string {
  if (!path) return fallback;
  const trimmed = path.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }
  return fallback;
}

/**
 * Saves in-progress booking draft to sessionStorage before redirecting for authentication.
 */
export function saveBookingDraft<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save booking draft:", e);
  }
}

/**
 * Retrieves in-progress booking draft from sessionStorage.
 */
export function getBookingDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : null;
  } catch (e) {
    console.error("Failed to retrieve booking draft:", e);
    return null;
  }
}

/**
 * Clears in-progress booking draft from sessionStorage.
 */
export function clearBookingDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error("Failed to clear booking draft:", e);
  }
}

/**
 * Builds standard login or register URL with redirect and optional resume parameter.
 */
export function buildAuthUrl(
  type: "login" | "register",
  options?: {
    redirect?: string;
    resumeBooking?: string;
  }
): string {
  const params = new URLSearchParams();
  if (options?.redirect) {
    let redirectUrl = options.redirect;
    if (options.resumeBooking) {
      const separator = redirectUrl.includes("?") ? "&" : "?";
      redirectUrl = `${redirectUrl}${separator}resumeBooking=${encodeURIComponent(options.resumeBooking)}`;
    }
    params.set("redirect", redirectUrl);
  }
  const qs = params.toString();
  return `/${type}${qs ? `?${qs}` : ""}`;
}
