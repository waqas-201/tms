"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Moon,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  getHijriDate,
  formatDateStr,
  type HijriDateInfo,
  type HijamaDateAvailability,
  type HijamaSlotAvailability,
} from "@/lib/hijama-types";

export interface HijamaSunnahCalendarProps {
  selectedDate?: string; // "YYYY-MM-DD"
  selectedGender?: "MALE" | "FEMALE";
  onSelectDate?: (dateStr: string, hijri: HijriDateInfo) => void;
  onSelectSlot?: (
    dateStr: string,
    slot: HijamaSlotAvailability,
    hijri: HijriDateInfo
  ) => void;
  className?: string;
}

export default function HijamaSunnahCalendar({
  selectedDate: initialSelectedDate,
  selectedGender = "MALE",
  onSelectDate,
  onSelectSlot,
  className = "",
}: HijamaSunnahCalendarProps) {
  // Calendar View Month/Year State
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateStr(today), [today]);

  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (initialSelectedDate) {
      const parts = initialSelectedDate.split("-").map(Number);
      return parts[0] || today.getFullYear();
    }
    return today.getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (initialSelectedDate) {
      const parts = initialSelectedDate.split("-").map(Number);
      return (parts[1] || today.getMonth() + 1) - 1;
    }
    return today.getMonth();
  });

  // Selected date
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    initialSelectedDate || todayStr
  );

  // Filter gender for availability calculations
  const [activeGender, setActiveGender] =
    useState<"MALE" | "FEMALE">(selectedGender);

  // Selected slot state
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Live availability for selected date
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [dateAvailability, setDateAvailability] =
    useState<HijamaDateAvailability | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Cache for quick day-seat indicators across the current month
  const [monthSunnahSeats, setMonthSunnahSeats] = useState<
    Record<string, { seats: number; isOpen: boolean }>
  >({});

  // Synchronize initial prop changes
  useEffect(() => {
    if (initialSelectedDate && initialSelectedDate !== selectedDateStr) {
      setSelectedDateStr(initialSelectedDate);
      const [y, m] = initialSelectedDate.split("-").map(Number);
      if (y && m) {
        setCurrentYear(y);
        setCurrentMonth(m - 1);
      }
    }
  }, [initialSelectedDate]);

  useEffect(() => {
    if (selectedGender && selectedGender !== activeGender) {
      setActiveGender(selectedGender);
    }
  }, [selectedGender]);

  // Fetch slot availability whenever selected date or active gender changes
  const fetchAvailability = useCallback(
    async (dateStr: string, gender: "MALE" | "FEMALE") => {
      setLoadingAvailability(true);
      setAvailabilityError(null);
      try {
        const res = await fetch(
          `/api/hijama/availability?date=${dateStr}&gender=${gender}`
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Unable to retrieve slot availability.");
        }
        setDateAvailability(json.data);
      } catch (err: any) {
        console.error("Availability error:", err);
        setAvailabilityError(
          err.message || "Failed to load live clinic schedule."
        );
      } finally {
        setLoadingAvailability(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedDateStr) {
      fetchAvailability(selectedDateStr, activeGender);
    }
  }, [selectedDateStr, activeGender, fetchAvailability]);

  // Gregorian calendar days generator
  const daysInCurrentMonth = useMemo(() => {
    const days: {
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
      hijri: HijriDateInfo;
    }[] = [];

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Day of week for first day (0 = Sunday, 1 = Monday, ...)
    const startDayOfWeek = firstDayOfMonth.getDay();

    // Previous month padding
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDate - i);
      const dStr = formatDateStr(d);
      const hijri = getHijriDate(d);
      days.push({
        date: d,
        dateStr: dStr,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isPast: dStr < todayStr,
        hijri,
      });
    }

    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dStr = formatDateStr(d);
      const hijri = getHijriDate(d);
      days.push({
        date: d,
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isPast: dStr < todayStr,
        hijri,
      });
    }

    // Next month padding to fill out 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const dStr = formatDateStr(d);
      const hijri = getHijriDate(d);
      days.push({
        date: d,
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isPast: dStr < todayStr,
        hijri,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Compute Islamic month name(s) spanning current month
  const hijriMonthSpan = useMemo(() => {
    if (daysInCurrentMonth.length === 0) return "";
    const currentMonthDays = daysInCurrentMonth.filter((d) => d.isCurrentMonth);
    const firstHijri = currentMonthDays[0]?.hijri;
    const lastHijri =
      currentMonthDays[currentMonthDays.length - 1]?.hijri;

    if (!firstHijri || !lastHijri) return "";
    if (firstHijri.hijriMonthName === lastHijri.hijriMonthName) {
      return `${firstHijri.hijriMonthName} ${firstHijri.hijriYear} AH`;
    }
    return `${firstHijri.hijriMonthName} – ${lastHijri.hijriMonthName} ${lastHijri.hijriYear} AH`;
  }, [daysInCurrentMonth]);

  // Month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
    const hijri = getHijriDate(today);
    onSelectDate?.(todayStr, hijri);
  };

  const handleDayClick = (dayObj: (typeof daysInCurrentMonth)[0]) => {
    setSelectedDateStr(dayObj.dateStr);
    setSelectedSlot(null);
    onSelectDate?.(dayObj.dateStr, dayObj.hijri);
  };

  const handleSlotClick = (slot: HijamaSlotAvailability) => {
    if (!slot.available || slot.seatsRemaining <= 0) return;
    setSelectedSlot(slot.slot);
    if (dateAvailability) {
      onSelectSlot?.(selectedDateStr, slot, dateAvailability.hijriInfo);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedHijri = useMemo(() => {
    return dateAvailability?.hijriInfo || getHijriDate(selectedDateStr);
  }, [dateAvailability, selectedDateStr]);

  return (
    <div
      className={`rounded-3xl border border-[#e6dfd5] bg-white shadow-xl overflow-hidden ${className}`}
    >
      {/* ─── Top Control Strip ─── */}
      <div className="bg-[#0d2818] text-[#f7f4ee] px-5 sm:px-8 py-5 border-b border-[#1b432a]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b432a] text-[#c59b27] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#c59b27]/30">
              <Moon className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Prophetic Lunar Timings</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Sunnah Cupping Calendar</span>
              <Sparkles className="w-5 h-5 text-[#c59b27]" />
            </h3>
            <p className="text-xs sm:text-sm text-[#c4d4c9] mt-0.5">
              Highlighting the blessed 17th, 19th, and 21st days of the Islamic month.
            </p>
          </div>

          {/* Gender Wing Switcher */}
          <div className="flex items-center bg-[#133821] p-1 rounded-2xl border border-[#225534]">
            <button
              type="button"
              onClick={() => setActiveGender("MALE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeGender === "MALE"
                  ? "bg-[#c59b27] text-[#0d2818] shadow-md font-bold"
                  : "text-[#c4d4c9] hover:text-white"
              }`}
            >
              Male Room (Hajjam)
            </button>
            <button
              type="button"
              onClick={() => setActiveGender("FEMALE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeGender === "FEMALE"
                  ? "bg-[#c59b27] text-[#0d2818] shadow-md font-bold"
                  : "text-[#c4d4c9] hover:text-white"
              }`}
            >
              Female Room (Hajjama)
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="mt-5 pt-4 border-t border-[#1b432a]/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#133821] rounded-xl p-0.5 border border-[#225534]">
              <button
                type="button"
                onClick={goToPreviousMonth}
                aria-label="Previous Month"
                className="p-2 rounded-lg text-[#c4d4c9] hover:text-white hover:bg-[#1b432a] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="Next Month"
                className="p-2 rounded-lg text-[#c4d4c9] hover:text-white hover:bg-[#1b432a] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <span className="hidden sm:inline-block ml-3 px-2.5 py-0.5 rounded-md bg-[#1b432a] text-[#c59b27] text-xs font-medium border border-[#c59b27]/20">
                {hijriMonthSpan}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={goToToday}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#1b432a] hover:bg-[#225534] text-white border border-[#2d6c44] font-medium transition-colors"
          >
            Today ({today.getDate()} {monthNames[today.getMonth()].slice(0, 3)})
          </button>
        </div>
      </div>

      {/* ─── Calendar Grid & Slots Layout ─── */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Calendar Table (7 columns) */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
              {weekDayNames.map((d, i) => (
                <div
                  key={d}
                  className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                    i === 5 // Friday highlight
                      ? "text-[#22623a]"
                      : "text-[#7a7268]"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {daysInCurrentMonth.map((dayObj) => {
                const isSelected = dayObj.dateStr === selectedDateStr;
                const isSunnah = dayObj.hijri.isSunnahDay;
                const isToday = dayObj.isToday;
                const isPast = dayObj.isPast;
                const isDimmed = !dayObj.isCurrentMonth;

                return (
                  <button
                    key={dayObj.dateStr}
                    type="button"
                    onClick={() => handleDayClick(dayObj)}
                    className={`relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-2xl min-h-[72px] sm:min-h-[86px] transition-all text-left border ${
                      isSelected
                        ? "bg-[#0d2818] text-white border-[#c59b27] ring-2 ring-[#c59b27]/40 shadow-lg scale-[1.02] z-10"
                        : isSunnah
                        ? "bg-gradient-to-b from-[#fbf8ed] to-[#f4ebe0] border-[#c59b27] hover:border-[#8c6a15] hover:shadow-md"
                        : isDimmed
                        ? "bg-[#faf8f5]/40 text-[#a59f95] border-transparent hover:bg-white hover:border-[#e6dfd5]"
                        : "bg-white text-[#1e1c19] border-[#e6dfd5] hover:border-[#22623a]/40 hover:bg-[#f6f9f7]"
                    } ${isPast ? "opacity-60" : ""}`}
                  >
                    {/* Sunnah Halo Ribbon / Badge */}
                    {isSunnah && (
                      <span
                        className={`absolute -top-1.5 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-tight shadow-xs ${
                          isSelected
                            ? "bg-[#c59b27] text-[#0d2818]"
                            : "bg-[#22623a] text-[#f7f4ee]"
                        }`}
                      >
                        Sunnah
                      </span>
                    )}

                    {/* Day number & Today dot */}
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isSelected
                            ? "text-white"
                            : isSunnah
                            ? "text-[#8c6a15]"
                            : "text-[#1e1c19]"
                        }`}
                      >
                        {dayObj.dayNumber}
                      </span>

                      {isToday && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-[#c59b27]" : "bg-[#22623a]"
                          }`}
                          title="Today"
                        />
                      )}
                    </div>

                    {/* Prominent Hijri Date Display */}
                    <div className="w-full text-center my-0.5 sm:my-1">
                      <div
                        className={`text-[10px] sm:text-xs font-semibold leading-tight truncate ${
                          isSelected
                            ? "text-[#c59b27]"
                            : isSunnah
                            ? "text-[#22623a] font-bold"
                            : "text-[#59534b]"
                        }`}
                      >
                        {dayObj.hijri.hijriDay}{" "}
                        <span className="hidden sm:inline font-normal opacity-90">
                          {dayObj.hijri.hijriMonthName.slice(0, 5)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Status / Sunnah indicator */}
                    <div className="w-full flex items-center justify-center">
                      {isSunnah ? (
                        <div
                          className={`text-[9px] font-semibold px-1 rounded flex items-center gap-0.5 ${
                            isSelected
                              ? "text-emerald-300"
                              : "text-[#22623a]"
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-[#c59b27]" />
                          <span className="hidden sm:inline">Blessed</span>
                        </div>
                      ) : (
                        <span
                          className={`text-[8px] sm:text-[9px] font-medium opacity-70 ${
                            isSelected ? "text-white/70" : "text-[#7a7268]"
                          }`}
                        >
                          Open
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-5 pt-4 border-t border-[#f0eae1] flex flex-wrap items-center gap-4 text-xs text-[#59534b]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-b from-[#fbf8ed] to-[#f4ebe0] border border-[#c59b27] inline-block" />
                <span className="font-semibold text-[#8c6a15]">
                  Sunnah Day (17, 19, 21)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#0d2818] border border-[#c59b27] inline-block" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-white border border-[#e6dfd5] inline-block" />
                <span>Clinic Open</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-50 border border-rose-200 inline-block" />
                <span className="text-rose-700">Fully Booked</span>
              </div>
            </div>
          </div>

          {/* ─── Right Panel: Selected Day Slot Availability (5 cols) ─── */}
          <div className="lg:col-span-5 xl:col-span-4 bg-[#faf8f5] rounded-2xl p-5 border border-[#e6dfd5]">
            <div className="border-b border-[#e6dfd5] pb-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#7a7268]">
                  Selected Session Date
                </span>
                {selectedHijri.isSunnahDay && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#c59b27]/20 text-[#8c6a15] text-[10px] font-bold border border-[#c59b27]/40">
                    <Sparkles className="w-3 h-3 text-[#c59b27]" />
                    Sunnah Priority Day
                  </span>
                )}
              </div>

              <h4 className="font-serif text-lg sm:text-xl font-bold text-[#0d2818] mt-1">
                {selectedDateStr}
              </h4>
              <p className="text-xs text-[#22623a] font-semibold mt-0.5 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>{selectedHijri.hijriFormatted}</span>
              </p>

              {/* Total Seats Remaining Badge */}
              <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e6dfd5]">
                <div className="flex items-center gap-2 text-xs text-[#59534b]">
                  <Users className="w-4 h-4 text-[#22623a]" />
                  <span>
                    {activeGender === "MALE"
                      ? "Male Ward (Hajjam)"
                      : "Female Ward (Hajjama)"}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#22623a] flex items-center gap-1">
                  {loadingAvailability ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c59b27]" />
                  ) : dateAvailability?.isOpen ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#eef7f1] text-[#22623a] border border-[#cde4d6]">
                      {dateAvailability.totalSeatsRemaining} seats remaining
                      today
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold">Closed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Slots List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#22623a]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Available 45-Min Sessions</span>
                </span>
                <span className="text-[10px] text-[#7a7268] font-normal">
                  Standard Fee: ₨ 2,500
                </span>
              </div>

              {loadingAvailability ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-xs text-[#7a7268] gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#22623a]" />
                  <span>Checking live clinic seats...</span>
                </div>
              ) : availabilityError ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {availabilityError}
                </div>
              ) : !dateAvailability?.isOpen ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center space-y-1">
                  <AlertCircle className="w-5 h-5 mx-auto text-amber-600" />
                  <p className="font-bold">Clinic Closed for Hijama</p>
                  <p className="text-[11px] text-amber-700">
                    {dateAvailability?.overrideNote ||
                      "No appointments are available on this date. Please pick another day."}
                  </p>
                </div>
              ) : dateAvailability.slots.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-center text-[#7a7268]">
                  No time slots configured for this date.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[310px] overflow-y-auto pr-1">
                  {dateAvailability.slots.map((slot) => {
                    const isSlotSelected = selectedSlot === slot.slot;
                    const isAvailable =
                      slot.available && slot.seatsRemaining > 0;

                    return (
                      <button
                        key={slot.slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleSlotClick(slot)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSlotSelected
                            ? "bg-[#22623a] text-white border-[#22623a] shadow-md"
                            : isAvailable
                            ? "bg-white border-[#e6dfd5] hover:border-[#22623a] hover:bg-emerald-50/40 text-[#1e1c19]"
                            : "bg-[#f5f2ed] border-transparent text-[#a59f95] cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSlotSelected
                                ? "text-[#c59b27]"
                                : isAvailable
                                ? "text-[#22623a]"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="text-xs font-semibold truncate">
                            {slot.slot}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isAvailable ? (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isSlotSelected
                                  ? "bg-white/20 text-white"
                                  : slot.seatsRemaining <= 1
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-[#eef7f1] text-[#22623a] border border-[#cde4d6]"
                              }`}
                            >
                              {slot.seatsRemaining} of{" "}
                              {activeGender === "MALE"
                                ? slot.maleCapacity
                                : slot.femaleCapacity}{" "}
                              left
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700">
                              Full
                            </span>
                          )}

                          {isSlotSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#c59b27]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Action Info Banner */}
            <div className="mt-4 pt-3 border-t border-[#e6dfd5] text-[11px] text-[#59534b] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
              <span>
                Separate private wards for men and women. All sessions include single-use sterile vacuum cups and clinical antiseptic prep.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
