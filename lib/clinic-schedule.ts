import prisma from "./prisma";

export interface TimeSlotAvailability {
  slot: string; // e.g. "10:00 AM - 11:00 AM"
  startTime: string; // e.g. "10:00"
  endTime: string; // e.g. "11:00"
  available: boolean;
  capacityRemaining: number;
  maxCapacity: number;
  bookedCount: number;
}

export interface DateAvailabilityResponse {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 0-6
  dayName: string; // "Monday", etc.
  isOpen: boolean;
  isHoliday: boolean;
  holidayReason?: string;
  openTime?: string;
  closeTime?: string;
  slots: TimeSlotAvailability[];
}

const DEFAULT_SCHEDULE = [
  { dayOfWeek: 0, dayName: "Sunday", isOpen: false, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
  { dayOfWeek: 1, dayName: "Monday", isOpen: true, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
  { dayOfWeek: 2, dayName: "Tuesday", isOpen: true, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
  { dayOfWeek: 3, dayName: "Wednesday", isOpen: true, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
  { dayOfWeek: 4, dayName: "Thursday", isOpen: true, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
  { dayOfWeek: 5, dayName: "Friday", isOpen: true, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
  { dayOfWeek: 6, dayName: "Saturday", isOpen: true, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
];

/**
 * Initializes default weekly schedule if none exists, or returns the database schedule.
 */
export async function getOrInitClinicSchedule() {
  const existing = await prisma.clinicSchedule.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  if (existing.length === 7) {
    return existing;
  }

  // Seed missing days
  for (const day of DEFAULT_SCHEDULE) {
    const found = existing.find((e) => e.dayOfWeek === day.dayOfWeek);
    if (!found) {
      await prisma.clinicSchedule.create({
        data: day,
      });
    }
  }

  return prisma.clinicSchedule.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
}

/**
 * Formats 24h "HH:MM" string to 12h formatted slot string (e.g. "10:00 AM - 11:00 AM")
 */
export function formatSlotLabel(startH: number, startM: number, endH: number, endM: number): string {
  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m === 0 ? "00" : m.toString().padStart(2, "0");
    return `${displayH.toString().padStart(2, "0")}:${displayM} ${period}`;
  };

  return `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`;
}

/**
 * Returns real-time available time slots for a specific date (YYYY-MM-DD).
 */
export async function getAvailableSlotsForDate(dateStr: string): Promise<DateAvailabilityResponse> {
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = targetDate.getUTCDay();

  // Check holiday override
  const holiday = await prisma.clinicHoliday.findUnique({
    where: { date: dateStr },
  });

  const schedules = await getOrInitClinicSchedule();
  const daySchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek) || DEFAULT_SCHEDULE[dayOfWeek];

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[dayOfWeek];

  if (holiday) {
    return {
      date: dateStr,
      dayOfWeek,
      dayName,
      isOpen: false,
      isHoliday: true,
      holidayReason: holiday.reason,
      slots: [],
    };
  }

  if (!daySchedule.isOpen) {
    return {
      date: dateStr,
      dayOfWeek,
      dayName,
      isOpen: false,
      isHoliday: false,
      slots: [],
    };
  }

  // Parse open and close times
  const [openH, openM = 0] = daySchedule.openTime.split(":").map(Number);
  const [closeH, closeM = 0] = daySchedule.closeTime.split(":").map(Number);
  const durationMins = daySchedule.slotDurationMins || 60;
  const maxCapacity = daySchedule.maxSlotsPerWindow || 1;

  // Generate slots
  const slots: TimeSlotAvailability[] = [];
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

    slots.push({
      slot: slotLabel,
      startTime: startTimeStr,
      endTime: endTimeStr,
      available: true,
      capacityRemaining: maxCapacity,
      maxCapacity,
      bookedCount: 0,
    });

    currentMinutes += durationMins;
  }

  // Query database for existing booked appointments on this date
  const bookedAppointments = await prisma.consultationRequest.findMany({
    where: {
      appointmentDate: dateStr,
      status: { notIn: ["CANCELLED"] },
    },
    select: { appointmentSlot: true },
  });

  // Calculate remaining capacities
  for (const slot of slots) {
    const booked = bookedAppointments.filter(
      (b) => b.appointmentSlot && (b.appointmentSlot === slot.slot || b.appointmentSlot.includes(slot.startTime))
    ).length;

    slot.bookedCount = booked;
    slot.capacityRemaining = Math.max(0, slot.maxCapacity - booked);
    slot.available = slot.capacityRemaining > 0;
  }

  return {
    date: dateStr,
    dayOfWeek,
    dayName,
    isOpen: true,
    isHoliday: false,
    openTime: daySchedule.openTime,
    closeTime: daySchedule.closeTime,
    slots,
  };
}
