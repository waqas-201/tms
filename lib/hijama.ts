import prisma from "./prisma";
import type {
  HijamaBooking,
  HijamaScheduleConfig,
  HijamaSetting,
  HijamaDateOverride,
} from "@prisma/client";

// Re-export Prisma types for convenient consumer imports
export type {
  HijamaBooking,
  HijamaScheduleConfig,
  HijamaSetting,
  HijamaDateOverride,
};

import {
  ISLAMIC_MONTH_NAMES,
  IslamicMonthName,
  HijriDateInfo,
  parseDateInput,
  formatDateStr,
  getHijriDate,
  formatSlotLabel,
  HijamaSlotAvailability,
  HijamaDateAvailability,
  UpcomingSunnahDate,
  CreateHijamaBookingInput,
} from "./hijama-types";

export * from "./hijama-types";


// -------------------------------------------------------------
// Schedule Defaults & Initialization
// -------------------------------------------------------------

export const DEFAULT_HIJAMA_SCHEDULE: Omit<
  HijamaScheduleConfig,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    dayOfWeek: 0,
    dayName: "Sunday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "21:00",
    slotDurationMins: 45,
    maxMaleCapacity: 1,
    maxFemaleCapacity: 1,
    customSlots: null,
  },
  {
    dayOfWeek: 1,
    dayName: "Monday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "21:00",
    slotDurationMins: 45,
    maxMaleCapacity: 1,
    maxFemaleCapacity: 1,
    customSlots: null,
  },
  {
    dayOfWeek: 2,
    dayName: "Tuesday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "21:00",
    slotDurationMins: 45,
    maxMaleCapacity: 1,
    maxFemaleCapacity: 1,
    customSlots: null,
  },
  {
    dayOfWeek: 3,
    dayName: "Wednesday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "21:00",
    slotDurationMins: 45,
    maxMaleCapacity: 1,
    maxFemaleCapacity: 1,
    customSlots: null,
  },
  {
    dayOfWeek: 4,
    dayName: "Thursday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "21:00",
    slotDurationMins: 45,
    maxMaleCapacity: 1,
    maxFemaleCapacity: 1,
    customSlots: null,
  },
  {
    dayOfWeek: 5,
    dayName: "Friday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "21:00",
    slotDurationMins: 45,
    maxMaleCapacity: 1,
    maxFemaleCapacity: 1,
    customSlots: null,
  },
  {
    dayOfWeek: 6,
    dayName: "Saturday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "21:00",
    slotDurationMins: 45,
    maxMaleCapacity: 1,
    maxFemaleCapacity: 1,
    customSlots: null,
  },
];

export const DEFAULT_HIJAMA_SETTING = {
  id: "default",
  moonSightingOffset: 0,
  sunnahMaleCapacity: 1,
  sunnahFemaleCapacity: 1,
  standardFee: 2500,
};

/**
 * Initializes default weekly schedule and settings if none exist, or returns the current records.
 */
export async function getOrInitHijamaSchedule(): Promise<{
  configs: HijamaScheduleConfig[];
  settings: HijamaSetting;
}> {
  // Ensure default settings exist
  let settings = await prisma.hijamaSetting.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.hijamaSetting.create({
      data: DEFAULT_HIJAMA_SETTING,
    });
  }

  // Ensure all 7 days of schedule exist
  const existingConfigs = await prisma.hijamaScheduleConfig.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  if (existingConfigs.length < 7) {
    for (const day of DEFAULT_HIJAMA_SCHEDULE) {
      const found = existingConfigs.find((c) => c.dayOfWeek === day.dayOfWeek);
      if (!found) {
        await prisma.hijamaScheduleConfig.create({
          data: day,
        });
      }
    }
  }

  const configs = await prisma.hijamaScheduleConfig.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return { configs, settings };
}

// -------------------------------------------------------------
// Settings & Overrides
// -------------------------------------------------------------

export async function getHijamaSettings(): Promise<HijamaSetting> {
  const { settings } = await getOrInitHijamaSchedule();
  return settings;
}

export async function updateHijamaSettings(data: {
  moonSightingOffset?: number;
  sunnahMaleCapacity?: number;
  sunnahFemaleCapacity?: number;
  standardFee?: number;
}): Promise<HijamaSetting> {
  return prisma.hijamaSetting.upsert({
    where: { id: "default" },
    update: {
      ...(data.moonSightingOffset !== undefined
        ? { moonSightingOffset: data.moonSightingOffset }
        : {}),
      ...(data.sunnahMaleCapacity !== undefined
        ? { sunnahMaleCapacity: data.sunnahMaleCapacity }
        : {}),
      ...(data.sunnahFemaleCapacity !== undefined
        ? { sunnahFemaleCapacity: data.sunnahFemaleCapacity }
        : {}),
      ...(data.standardFee !== undefined
        ? { standardFee: data.standardFee }
        : {}),
    },
    create: {
      id: "default",
      moonSightingOffset: data.moonSightingOffset ?? 0,
      sunnahMaleCapacity: data.sunnahMaleCapacity ?? 1,
      sunnahFemaleCapacity: data.sunnahFemaleCapacity ?? 1,
      standardFee: data.standardFee ?? 2500,
    },
  });
}

export async function setHijamaDateOverride(data: {
  date: string;
  isClosed?: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  slotDurationMins?: number | null;
  maxMaleCapacity?: number | null;
  maxFemaleCapacity?: number | null;
  customSlots?: string | null;
  note?: string | null;
}): Promise<HijamaDateOverride> {
  return prisma.hijamaDateOverride.upsert({
    where: { date: data.date },
    update: {
      ...(data.isClosed !== undefined ? { isClosed: data.isClosed } : {}),
      ...(data.openTime !== undefined ? { openTime: data.openTime } : {}),
      ...(data.closeTime !== undefined ? { closeTime: data.closeTime } : {}),
      ...(data.slotDurationMins !== undefined
        ? { slotDurationMins: data.slotDurationMins }
        : {}),
      ...(data.maxMaleCapacity !== undefined
        ? { maxMaleCapacity: data.maxMaleCapacity }
        : {}),
      ...(data.maxFemaleCapacity !== undefined
        ? { maxFemaleCapacity: data.maxFemaleCapacity }
        : {}),
      ...(data.customSlots !== undefined ? { customSlots: data.customSlots } : {}),
      ...(data.note !== undefined ? { note: data.note } : {}),
    },
    create: {
      date: data.date,
      isClosed: data.isClosed ?? false,
      openTime: data.openTime,
      closeTime: data.closeTime,
      slotDurationMins: data.slotDurationMins,
      maxMaleCapacity: data.maxMaleCapacity,
      maxFemaleCapacity: data.maxFemaleCapacity,
      customSlots: data.customSlots,
      note: data.note,
    },
  });
}

export async function deleteHijamaDateOverride(
  date: string
): Promise<HijamaDateOverride | null> {
  try {
    return await prisma.hijamaDateOverride.delete({
      where: { date },
    });
  } catch {
    return null;
  }
}

export async function getHijamaDateOverrides(): Promise<HijamaDateOverride[]> {
  return prisma.hijamaDateOverride.findMany({
    orderBy: { date: "asc" },
  });
}

export async function updateHijamaScheduleDay(
  dayOfWeek: number,
  data: Partial<{
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    slotDurationMins: number;
    maxMaleCapacity: number;
    maxFemaleCapacity: number;
    customSlots: string | null;
  }>
): Promise<HijamaScheduleConfig> {
  await getOrInitHijamaSchedule();

  return prisma.hijamaScheduleConfig.update({
    where: { dayOfWeek },
    data,
  });
}

// -------------------------------------------------------------
// Availability Engine
// -------------------------------------------------------------


/**
 * Computes slot-by-slot availability for a given date, factoring in Sunnah capacity boosts,
 * date overrides, and existing bookings.
 */
export async function getHijamaAvailabilityForDate(
  dateStr: string,
  gender?: "MALE" | "FEMALE"
): Promise<HijamaDateAvailability> {
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = targetDate.getUTCDay();

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = dayNames[dayOfWeek];

  const [{ configs, settings }, override] = await Promise.all([
    getOrInitHijamaSchedule(),
    prisma.hijamaDateOverride.findUnique({
      where: { date: dateStr },
    }),
  ]);

  const daySchedule =
    configs.find((c) => c.dayOfWeek === dayOfWeek) ||
    DEFAULT_HIJAMA_SCHEDULE[dayOfWeek];

  const hijriInfo = getHijriDate(targetDate, settings.moonSightingOffset);
  const isSunnahDay = hijriInfo.isSunnahDay;

  // Closed logic: Date override takes precedence, otherwise day schedule
  const isOverrideClosed = override?.isClosed === true;
  const isDayClosed = !daySchedule.isOpen;
  const isOpen = !isOverrideClosed && !isDayClosed;

  if (!isOpen) {
    return {
      date: dateStr,
      dayOfWeek,
      dayName,
      isOpen: false,
      isOverride: !!override,
      overrideNote: override?.note || null,
      openTime: daySchedule.openTime,
      closeTime: daySchedule.closeTime,
      hijriInfo,
      isSunnahDay,
      standardFee: settings.standardFee,
      slots: [],
      totalSeatsRemaining: 0,
    };
  }

  // Determine capacity per slot:
  // If Sunnah day, use boosted capacity from settings; otherwise standard day schedule capacity.
  // Overrides on the specific date override both.
  const baseMaleCapacity = isSunnahDay
    ? settings.sunnahMaleCapacity
    : daySchedule.maxMaleCapacity;
  const baseFemaleCapacity = isSunnahDay
    ? settings.sunnahFemaleCapacity
    : daySchedule.maxFemaleCapacity;

  const effectiveMaleCapacity =
    override?.maxMaleCapacity != null
      ? override.maxMaleCapacity
      : baseMaleCapacity;
  const effectiveFemaleCapacity =
    override?.maxFemaleCapacity != null
      ? override.maxFemaleCapacity
      : baseFemaleCapacity;

  // Effective operating times & duration
  const openTimeEffective = override?.openTime || daySchedule.openTime || "10:00";
  const closeTimeEffective = override?.closeTime || daySchedule.closeTime || "21:00";
  const durationMins = override?.slotDurationMins || daySchedule.slotDurationMins || 45;

  let generatedSlots: {
    slot: string;
    startTime: string;
    endTime: string;
    maleCapacity?: number;
    femaleCapacity?: number;
  }[] = [];

  // 1. Check customSlots on override first, then on daySchedule
  const customSlotsRaw = override?.customSlots || (daySchedule as any).customSlots;
  let parsedCustomSlots: any[] | null = null;
  if (customSlotsRaw) {
    try {
      parsedCustomSlots = JSON.parse(customSlotsRaw);
    } catch {
      parsedCustomSlots = null;
    }
  }

  if (Array.isArray(parsedCustomSlots) && parsedCustomSlots.length > 0) {
    generatedSlots = parsedCustomSlots
      .filter((s: any) => !s.disabled)
      .map((s: any) => ({
        slot: s.slot,
        startTime: s.startTime,
        endTime: s.endTime,
        maleCapacity: s.maleCapacity,
        femaleCapacity: s.femaleCapacity,
      }));
  } else {
    // 2. Standard duration slicing based on openTime, closeTime, and slotDurationMins
    const [openH, openM = 0] = openTimeEffective.split(":").map(Number);
    const [closeH, closeM = 0] = closeTimeEffective.split(":").map(Number);

    let currentMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    while (currentMinutes + durationMins <= endMinutes) {
      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const endH = Math.floor((currentMinutes + durationMins) / 60);
      const endM = (currentMinutes + durationMins) % 60;

      const slotLabel = formatSlotLabel(startH, startM, endH, endM);
      const startTimeStr = `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`;
      const endTimeStr = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;

      generatedSlots.push({
        slot: slotLabel,
        startTime: startTimeStr,
        endTime: endTimeStr,
      });

      currentMinutes += durationMins;
    }
  }

  // Query database for all active bookings on this date
  const bookedAppointments = await prisma.hijamaBooking.findMany({
    where: {
      appointmentDate: dateStr,
      status: { not: "CANCELLED" },
    },
    select: {
      appointmentSlot: true,
      gender: true,
    },
  });

  const slots: HijamaSlotAvailability[] = generatedSlots.map((s) => {
    const slotBookings = bookedAppointments.filter(
      (b) =>
        b.appointmentSlot === s.slot ||
        b.appointmentSlot.includes(s.startTime)
    );

    const maleBooked = slotBookings.filter((b) => b.gender === "MALE").length;
    const femaleBooked = slotBookings.filter(
      (b) => b.gender === "FEMALE"
    ).length;

    const slotMaleCapacity = s.maleCapacity != null ? s.maleCapacity : effectiveMaleCapacity;
    const slotFemaleCapacity = s.femaleCapacity != null ? s.femaleCapacity : effectiveFemaleCapacity;

    const maleSeatsRemaining = Math.max(0, slotMaleCapacity - maleBooked);
    const femaleSeatsRemaining = Math.max(
      0,
      slotFemaleCapacity - femaleBooked
    );

    let seatsRemaining: number;
    let available: boolean;

    if (gender === "MALE") {
      seatsRemaining = maleSeatsRemaining;
      available = maleSeatsRemaining > 0;
    } else if (gender === "FEMALE") {
      seatsRemaining = femaleSeatsRemaining;
      available = femaleSeatsRemaining > 0;
    } else {
      seatsRemaining = maleSeatsRemaining + femaleSeatsRemaining;
      available = maleSeatsRemaining > 0 || femaleSeatsRemaining > 0;
    }

    return {
      slot: s.slot,
      startTime: s.startTime,
      endTime: s.endTime,
      maleBooked,
      femaleBooked,
      maleCapacity: slotMaleCapacity,
      femaleCapacity: slotFemaleCapacity,
      maleSeatsRemaining,
      femaleSeatsRemaining,
      seatsRemaining,
      available,
    };
  });

  const totalSeatsRemaining = slots.reduce(
    (acc, s) => acc + s.seatsRemaining,
    0
  );

  return {
    date: dateStr,
    dayOfWeek,
    dayName,
    isOpen: true,
    isOverride: !!override,
    overrideNote: override?.note || null,
    openTime: daySchedule.openTime,
    closeTime: daySchedule.closeTime,
    hijriInfo,
    isSunnahDay,
    standardFee: settings.standardFee,
    slots,
    totalSeatsRemaining,
  };
}

// -------------------------------------------------------------
// Month Overview Helper: Upcoming Sunnah Dates
// -------------------------------------------------------------


/**
 * Scans upcoming calendar days (default 2 months ahead) and returns all Sunnah days
 * (17th, 19th, 21st of Islamic months) with their Hijri representation and available capacity.
 */
export async function getUpcomingSunnahDates(
  monthsAhead: number = 2
): Promise<UpcomingSunnahDate[]> {
  const settings = await getHijamaSettings();
  const now = new Date();
  const baseUtc = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)
  );

  const daysToScan = Math.max(1, monthsAhead) * 31;
  const sunnahDates: UpcomingSunnahDate[] = [];

  for (let i = 0; i <= daysToScan; i++) {
    const dayDate = new Date(baseUtc.getTime() + i * 86_400_000);
    const dateStr = formatDateStr(dayDate);
    const hijri = getHijriDate(dayDate, settings.moonSightingOffset);

    if (hijri.isSunnahDay) {
      const availability = await getHijamaAvailabilityForDate(dateStr);
      sunnahDates.push({
        date: dateStr,
        dayName: availability.dayName,
        hijriFormatted: hijri.hijriFormatted,
        hijriDay: hijri.hijriDay,
        hijriMonthName: hijri.hijriMonthName,
        hijriYear: hijri.hijriYear,
        isOpen: availability.isOpen,
        totalAvailableSeats: availability.totalSeatsRemaining,
        slotsCount: availability.slots.length,
      });
    }
  }

  return sunnahDates;
}

// -------------------------------------------------------------
// Booking Creation & Management
// -------------------------------------------------------------


/**
 * Creates a new Hijama booking with capacity validation and unique ticket number generation.
 */
export async function createHijamaBooking(
  data: CreateHijamaBookingInput
): Promise<HijamaBooking> {
  // 1. Validate required fields
  if (!data.fullName || !data.fullName.trim()) {
    throw new Error("Full name is required.");
  }
  if (!data.phone || !data.phone.trim()) {
    throw new Error("Phone number is required.");
  }
  if (data.age == null || data.age <= 0) {
    throw new Error("A valid age is required.");
  }
  if (data.gender !== "MALE" && data.gender !== "FEMALE") {
    throw new Error("Gender must be 'MALE' or 'FEMALE'.");
  }
  if (!data.appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.appointmentDate)) {
    throw new Error("Appointment date must be formatted as YYYY-MM-DD.");
  }

  // 2. Check real-time availability for slot & gender
  const availability = await getHijamaAvailabilityForDate(
    data.appointmentDate,
    data.gender
  );

  if (!availability.isOpen) {
    throw new Error(
      `The clinic is closed for Hijama sessions on ${data.appointmentDate}${
        availability.overrideNote ? `: ${availability.overrideNote}` : ""
      }`
    );
  }

  const matchingSlot = availability.slots.find(
    (s) =>
      s.slot === data.appointmentSlot ||
      s.startTime === data.appointmentSlot ||
      s.slot.includes(data.appointmentSlot)
  );

  if (!matchingSlot) {
    throw new Error(
      `Slot "${data.appointmentSlot}" is not a valid time slot on ${data.appointmentDate}.`
    );
  }

  if (!matchingSlot.available || matchingSlot.seatsRemaining <= 0) {
    throw new Error(
      `No available capacity remaining for ${data.gender.toLowerCase()}s in slot "${
        matchingSlot.slot
      }" on ${data.appointmentDate}.`
    );
  }

  // 3. Settings, Hijri Date, Fee, and Contraindications
  const settings = await getHijamaSettings();
  const hijri = getHijriDate(data.appointmentDate, settings.moonSightingOffset);
  const fee = data.feeAmount !== undefined ? data.feeAmount : settings.standardFee;

  let contraindicationsJson: string | null = null;
  if (data.contraindications) {
    if (typeof data.contraindications === "object") {
      contraindicationsJson = JSON.stringify(data.contraindications);
    } else {
      contraindicationsJson = data.contraindications;
    }
  }

  // 4. Ticket generation with atomic collision retry
  const year =
    data.appointmentDate.split("-")[0] ||
    new Date().getFullYear().toString();
  const prefix = `HIJ-${year}-`;

  const maxAttempts = 5;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    // Query highest current ticket number for this year
    const latestBooking = await prisma.hijamaBooking.findFirst({
      where: {
        ticketNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        ticketNumber: "desc",
      },
      select: {
        ticketNumber: true,
      },
    });

    let nextSequence = 1001;
    if (latestBooking?.ticketNumber) {
      const rawNum = latestBooking.ticketNumber.replace(prefix, "");
      const parsed = parseInt(rawNum, 10);
      if (!isNaN(parsed) && parsed >= 1000) {
        nextSequence = parsed + 1;
      }
    }

    if (attempts > 1) {
      nextSequence += attempts - 1;
    }

    const ticketNumber = `${prefix}${nextSequence.toString().padStart(4, "0")}`;

    try {
      const booking = await prisma.hijamaBooking.create({
        data: {
          ticketNumber,
          fullName: data.fullName.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || null,
          age: data.age,
          gender: data.gender,
          appointmentDate: data.appointmentDate,
          appointmentSlot: matchingSlot.slot,
          hijriDate: hijri.hijriFormatted,
          isSunnahDay: hijri.isSunnahDay,
          cuppingReason: data.cuppingReason?.trim() || null,
          contraindications: contraindicationsJson,
          status: "CONFIRMED",
          feeAmount: fee,
          paymentStatus: data.paymentStatus || "UNPAID",
          adminNotes: data.adminNotes?.trim() || null,
          userId: data.userId || null,
        },
      });

      return booking;
    } catch (err: any) {
      // Prisma unique constraint violation code is P2002
      if (err?.code === "P2002" && attempts < maxAttempts) {
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to generate a unique ticket number. Please try again.");
}

/**
 * Updates booking status ("CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW") and optional admin notes.
 */
export async function updateHijamaBookingStatus(
  id: string,
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
  notes?: string
): Promise<HijamaBooking> {
  const existing = await prisma.hijamaBooking.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Hijama booking with ID "${id}" was not found.`);
  }

  return prisma.hijamaBooking.update({
    where: { id },
    data: {
      status,
      ...(notes !== undefined ? { adminNotes: notes } : {}),
    },
  });
}

/**
 * Fetches a booking by ticket number (e.g. "HIJ-2026-1042").
 */
export async function getHijamaBookingByTicket(
  ticketNumber: string
): Promise<HijamaBooking | null> {
  return prisma.hijamaBooking.findUnique({
    where: { ticketNumber },
    include: { user: true },
  });
}

/**
 * Fetches a booking by internal cuid id.
 */
export async function getHijamaBookingById(
  id: string
): Promise<HijamaBooking | null> {
  return prisma.hijamaBooking.findUnique({
    where: { id },
    include: { user: true },
  });
}

/**
 * Lists Hijama bookings with flexible filtering and pagination.
 */
export async function listHijamaBookings(filters?: {
  date?: string;
  status?: string;
  gender?: string;
  search?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ bookings: HijamaBooking[]; total: number }> {
  const where: any = {};

  if (filters?.date) {
    where.appointmentDate = filters.date;
  }
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.gender) {
    where.gender = filters.gender;
  }
  if (filters?.userId) {
    where.userId = filters.userId;
  }
  if (filters?.search) {
    const s = filters.search.trim();
    where.OR = [
      { ticketNumber: { contains: s, mode: "insensitive" } },
      { fullName: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.hijamaBooking.findMany({
      where,
      orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
      include: { user: true },
    }),
    prisma.hijamaBooking.count({ where }),
  ]);

  return { bookings, total };
}
