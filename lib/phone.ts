/**
 * Canonical phone number normalization utility.
 *
 * Rules:
 * 1. Returns null for empty, null, or undefined values.
 * 2. Strips all non-digit characters.
 * 3. Rejects numbers with fewer than 7 digits (returns null).
 * 4. Pakistani local format: if 11 digits starting with '0' (e.g. 03001234567),
 *    converts to international country code format (923001234567).
 * 5. Returns canonical string of digits for all other valid numbers.
 */
export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (!digits || digits.length < 7) return null;
  // If Pakistan local format like 03001234567, normalize to 923001234567
  if (digits.startsWith("0") && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  return digits;
}
