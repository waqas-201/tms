// Pure Islamic Calendar & Hijama Shared Types (Safe for Client & Server)

export const ISLAMIC_MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
] as const;

export type IslamicMonthName = (typeof ISLAMIC_MONTH_NAMES)[number];

export interface HijriDateInfo {
  hijriYear: number;
  hijriMonth: number;
  hijriDay: number;
  hijriMonthName: string;
  hijriFormatted: string;
  isSunnahDay: boolean;
}

/**
 * Parses a Date object or "YYYY-MM-DD" string into a UTC noon Date object
 * to prevent any local timezone boundary shifts during arithmetic.
 */
export function parseDateInput(input: Date | string): Date {
  if (input instanceof Date) {
    return new Date(
      Date.UTC(input.getFullYear(), input.getMonth(), input.getDate(), 12, 0, 0)
    );
  }
  const [y, m, d] = input.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/**
 * Formats a Date object as "YYYY-MM-DD".
 */
export function formatDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Converts a Gregorian date and moon-sighting offset into an Islamic (Hijri) date.
 * Uses Intl.DateTimeFormat 'en-u-ca-islamic-umalqura' calendar with day arithmetic.
 * Sunnah cupping days are the 17th, 19th, and 21st of each lunar month.
 */
export function getHijriDate(date: Date | string, offset: number = 0): HijriDateInfo {
  try {
    const baseDate = parseDateInput(date);
    const adjustedTime = baseDate.getTime() + offset * 86_400_000;
    const adjustedDate = new Date(adjustedTime);

    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

    const parts = formatter.formatToParts(adjustedDate);
    const dayPart = parts.find((p) => p.type === "day");
    const monthPart = parts.find((p) => p.type === "month");
    const yearPart = parts.find((p) => p.type === "year");

    const hijriDay = dayPart ? parseInt(dayPart.value, 10) : 1;
    const hijriMonth = monthPart ? parseInt(monthPart.value, 10) : 1;
    const hijriYear = yearPart ? parseInt(yearPart.value, 10) : 1448;

    const hijriMonthName = ISLAMIC_MONTH_NAMES[hijriMonth - 1] || "Unknown";
    const hijriFormatted = `${hijriDay} ${hijriMonthName} ${hijriYear}`;
    const isSunnahDay = hijriDay === 17 || hijriDay === 19 || hijriDay === 21;

    return {
      hijriYear,
      hijriMonth,
      hijriDay,
      hijriMonthName,
      hijriFormatted,
      isSunnahDay,
    };
  } catch {
    return {
      hijriYear: 1448,
      hijriMonth: 1,
      hijriDay: 1,
      hijriMonthName: "Muharram",
      hijriFormatted: "1 Muharram 1448",
      isSunnahDay: false,
    };
  }
}

/**
 * Formats 24h start and end times to 12h slot string (e.g. "10:00 AM - 10:45 AM").
 */
export function formatSlotLabel(
  startH: number,
  startM: number,
  endH: number,
  endM: number
): string {
  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m === 0 ? "00" : m.toString().padStart(2, "0");
    return `${displayH.toString().padStart(2, "0")}:${displayM} ${period}`;
  };

  return `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`;
}

export interface HijamaSlotAvailability {
  slot: string; // e.g. "10:00 AM - 10:45 AM"
  startTime: string; // e.g. "10:00"
  endTime: string; // e.g. "10:45"
  maleBooked: number;
  femaleBooked: number;
  maleCapacity: number;
  femaleCapacity: number;
  maleSeatsRemaining: number;
  femaleSeatsRemaining: number;
  seatsRemaining: number;
  available: boolean;
}

export interface HijamaDateAvailability {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 0-6
  dayName: string; // "Sunday", etc.
  isOpen: boolean;
  isOverride: boolean;
  overrideNote?: string | null;
  openTime?: string;
  closeTime?: string;
  hijriInfo: HijriDateInfo;
  isSunnahDay: boolean;
  standardFee: number;
  slots: HijamaSlotAvailability[];
  totalSeatsRemaining: number;
}

export interface UpcomingSunnahDate {
  date: string; // "YYYY-MM-DD"
  dayName: string; // "Monday", etc.
  hijriFormatted: string; // "17 Rajab 1447"
  hijriDay: number; // 17, 19, or 21
  hijriMonthName: string;
  hijriYear: number;
  isOpen: boolean;
  totalAvailableSeats: number;
  slotsCount: number;
}

export interface CreateHijamaBookingInput {
  fullName: string;
  phone: string;
  email?: string | null;
  age: number;
  gender: "MALE" | "FEMALE";
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentSlot: string; // "10:00 AM - 10:45 AM" or start time
  cuppingReason?: string | null;
  contraindications?: string | null | Record<string, any>;
  userId?: string | null;
  adminNotes?: string | null;
  feeAmount?: number;
  paymentStatus?: "UNPAID" | "PAID_AT_CLINIC";
}
