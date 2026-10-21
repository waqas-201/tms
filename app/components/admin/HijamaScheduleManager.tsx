"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  Users,
  Sliders,
  Scissors,
  Eye,
  Info,
  CalendarDays,
  ShieldCheck,
  Check,
} from "lucide-react";
import { formatSlotLabel } from "@/lib/hijama-types";

interface CustomSlot {
  id: string;
  slot: string;
  startTime: string;
  endTime: string;
  maleCapacity?: number;
  femaleCapacity?: number;
  disabled?: boolean;
}

interface ScheduleDay {
  id?: string;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slotDurationMins: number;
  maxMaleCapacity: number;
  maxFemaleCapacity: number;
  customSlots?: string | null;
}

interface DateOverride {
  id?: string;
  date: string;
  isClosed: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  slotDurationMins?: number | null;
  maxMaleCapacity?: number | null;
  maxFemaleCapacity?: number | null;
  customSlots?: string | null;
  note?: string | null;
}

interface Settings {
  moonSightingOffset: number;
  sunnahMaleCapacity: number;
  sunnahFemaleCapacity: number;
  standardFee: number;
}

const PRESET_MINUTES = [20, 30, 45, 50, 60];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function HijamaScheduleManager() {
  const [activeMode, setActiveMode] = useState<"weekly" | "dates" | "settings">("weekly");

  // Server state
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [settings, setSettings] = useState<Settings>({
    moonSightingOffset: 0,
    sunnahMaleCapacity: 1,
    sunnahFemaleCapacity: 1,
    standardFee: 2500,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Weekly Mode state
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(1); // Monday default
  const [customSlotDuration, setCustomSlotDuration] = useState<number>(45);

  // Date Override Mode state
  const [selectedOverrideDate, setSelectedOverrideDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [overrideClosed, setOverrideClosed] = useState(false);
  const [overrideOpenTime, setOverrideOpenTime] = useState("10:00");
  const [overrideCloseTime, setOverrideCloseTime] = useState("21:00");
  const [overrideDuration, setOverrideDuration] = useState<number>(45);
  const [overrideMaleCap, setOverrideMaleCap] = useState<number>(1);
  const [overrideFemaleCap, setOverrideFemaleCap] = useState<number>(1);
  const [overrideNote, setOverrideNote] = useState("");
  const [overrideCustomSlots, setOverrideCustomSlots] = useState<CustomSlot[]>([]);

  // Inline custom slot add modal/form state
  const [isAddingCustomSlot, setIsAddingCustomSlot] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState("14:00");
  const [newSlotEnd, setNewSlotEnd] = useState("14:45");

  // Fetch full Hijama configuration from API
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/hijama/config");
      const json = await res.json();
      if (res.ok && json.success) {
        setSchedule(json.data.schedule || []);
        setOverrides(json.data.overrides || []);
        if (json.data.settings) {
          setSettings(json.data.settings);
        }
      } else {
        throw new Error(json.error || "Failed to load schedule config.");
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to load configuration." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Current active day in weekly schedule
  const currentDay = useMemo(() => {
    return schedule.find((d) => d.dayOfWeek === selectedDayIdx) || {
      dayOfWeek: selectedDayIdx,
      dayName: DAY_NAMES[selectedDayIdx],
      isOpen: true,
      openTime: "10:00",
      closeTime: "21:00",
      slotDurationMins: 45,
      maxMaleCapacity: 1,
      maxFemaleCapacity: 1,
      customSlots: null,
    };
  }, [schedule, selectedDayIdx]);

  // Parse custom slots for current selected day
  const currentDaySlots = useMemo<CustomSlot[]>(() => {
    if (currentDay.customSlots) {
      try {
        const parsed = JSON.parse(currentDay.customSlots);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    // Fallback: auto-slice based on openTime, closeTime, and slotDurationMins
    return autoSliceSlots(currentDay.openTime, currentDay.closeTime, currentDay.slotDurationMins || 45);
  }, [currentDay]);

  // Helper: auto-slices a time window into slots based on duration in minutes
  function autoSliceSlots(openTime: string, closeTime: string, duration: number): CustomSlot[] {
    const [openH, openM = 0] = openTime.split(":").map(Number);
    const [closeH, closeM = 0] = closeTime.split(":").map(Number);
    const dur = Math.max(10, duration || 45);

    let cur = openH * 60 + openM;
    const end = closeH * 60 + closeM;
    const result: CustomSlot[] = [];

    while (cur + dur <= end) {
      const sH = Math.floor(cur / 60);
      const sM = cur % 60;
      const eH = Math.floor((cur + dur) / 60);
      const eM = (cur + dur) % 60;

      const slotLabel = formatSlotLabel(sH, sM, eH, eM);
      const sTime = `${sH.toString().padStart(2, "0")}:${sM.toString().padStart(2, "0")}`;
      const eTime = `${eH.toString().padStart(2, "0")}:${eM.toString().padStart(2, "0")}`;

      result.push({
        id: `slot_${sTime}`,
        slot: slotLabel,
        startTime: sTime,
        endTime: eTime,
        disabled: false,
      });

      cur += dur;
    }

    return result;
  }

  // Auto-slice button handler for current weekly day
  const handleAutoSliceDay = (durationMinutes: number) => {
    const sliced = autoSliceSlots(currentDay.openTime, currentDay.closeTime, durationMinutes);
    updateCurrentDay({
      slotDurationMins: durationMinutes,
      customSlots: JSON.stringify(sliced),
    });
    setStatusMsg({
      type: "success",
      text: `Auto-sliced ${currentDay.dayName} into ${sliced.length} slots of ${durationMinutes} minutes each.`,
    });
  };

  // Update fields of the active day in schedule state
  const updateCurrentDay = (updates: Partial<ScheduleDay>) => {
    setSchedule((prev) => {
      const existingIdx = prev.findIndex((d) => d.dayOfWeek === selectedDayIdx);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...updates };
        return copy;
      }
      return [...prev, { ...currentDay, ...updates }];
    });
  };

  // Add individual custom slot to current day
  const handleAddSlotToDay = () => {
    const [sH, sM = 0] = newSlotStart.split(":").map(Number);
    const [eH, eM = 0] = newSlotEnd.split(":").map(Number);
    const label = formatSlotLabel(sH, sM, eH, eM);

    const newSlot: CustomSlot = {
      id: `slot_${newSlotStart}_${Date.now()}`,
      slot: label,
      startTime: newSlotStart,
      endTime: newSlotEnd,
      disabled: false,
    };

    const updated = [...currentDaySlots, newSlot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    updateCurrentDay({ customSlots: JSON.stringify(updated) });
    setIsAddingCustomSlot(false);
  };

  // Delete individual slot from current day
  const handleDeleteSlotFromDay = (slotId: string) => {
    const updated = currentDaySlots.filter((s) => s.id !== slotId && s.startTime !== slotId);
    updateCurrentDay({ customSlots: JSON.stringify(updated) });
  };

  // Toggle slot disabled state
  const handleToggleSlotDisabled = (slotId: string) => {
    const updated = currentDaySlots.map((s) => {
      if (s.id === slotId || s.startTime === slotId) {
        return { ...s, disabled: !s.disabled };
      }
      return s;
    });
    updateCurrentDay({ customSlots: JSON.stringify(updated) });
  };

  // Save weekly day schedule to server
  const handleSaveDaySchedule = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/hijama/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule: [
            {
              dayOfWeek: currentDay.dayOfWeek,
              isOpen: currentDay.isOpen,
              openTime: currentDay.openTime,
              closeTime: currentDay.closeTime,
              slotDurationMins: currentDay.slotDurationMins,
              maxMaleCapacity: currentDay.maxMaleCapacity,
              maxFemaleCapacity: currentDay.maxFemaleCapacity,
              customSlots: currentDay.customSlots,
            },
          ],
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save schedule.");
      }

      setStatusMsg({
        type: "success",
        text: `Successfully saved ${currentDay.dayName} schedule with ${currentDaySlots.length} slots.`,
      });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save schedule." });
    } finally {
      setSaving(false);
    }
  };

  // Date Override: load or reset when date changes
  useEffect(() => {
    const match = overrides.find((o) => o.date === selectedOverrideDate);
    if (match) {
      setOverrideClosed(match.isClosed);
      setOverrideOpenTime(match.openTime || "10:00");
      setOverrideCloseTime(match.closeTime || "21:00");
      setOverrideDuration(match.slotDurationMins || 45);
      setOverrideMaleCap(match.maxMaleCapacity != null ? match.maxMaleCapacity : 1);
      setOverrideFemaleCap(match.maxFemaleCapacity != null ? match.maxFemaleCapacity : 1);
      setOverrideNote(match.note || "");
      if (match.customSlots) {
        try {
          const parsed = JSON.parse(match.customSlots);
          setOverrideCustomSlots(Array.isArray(parsed) ? parsed : []);
        } catch {
          setOverrideCustomSlots([]);
        }
      } else {
        setOverrideCustomSlots(autoSliceSlots(match.openTime || "10:00", match.closeTime || "21:00", match.slotDurationMins || 45));
      }
    } else {
      setOverrideClosed(false);
      setOverrideOpenTime("10:00");
      setOverrideCloseTime("21:00");
      setOverrideDuration(45);
      setOverrideMaleCap(1);
      setOverrideFemaleCap(1);
      setOverrideNote("");
      setOverrideCustomSlots(autoSliceSlots("10:00", "21:00", 45));
    }
  }, [selectedOverrideDate, overrides]);

  // Save specific date override to server
  const handleSaveDateOverride = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/hijama/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          override: {
            date: selectedOverrideDate,
            isClosed: overrideClosed,
            openTime: overrideOpenTime,
            closeTime: overrideCloseTime,
            slotDurationMins: overrideDuration,
            maxMaleCapacity: overrideMaleCap,
            maxFemaleCapacity: overrideFemaleCap,
            customSlots: JSON.stringify(overrideCustomSlots),
            note: overrideNote || null,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save date override.");
      }

      setOverrides(json.data.overrides || []);
      setStatusMsg({
        type: "success",
        text: `Date override saved for ${selectedOverrideDate} (${overrideCustomSlots.length} slots).`,
      });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save date override." });
    } finally {
      setSaving(false);
    }
  };

  // Delete date override
  const handleDeleteDateOverride = async (dateStr: string) => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/hijama/config?date=${dateStr}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete date override.");
      }
      setOverrides((prev) => prev.filter((o) => o.date !== dateStr));
      setStatusMsg({ type: "success", text: `Override for ${dateStr} deleted.` });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to delete override." });
    } finally {
      setSaving(false);
    }
  };

  // Save general settings
  const handleSaveGeneralSettings = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/hijama/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            moonSightingOffset: Number(settings.moonSightingOffset),
            sunnahMaleCapacity: Number(settings.sunnahMaleCapacity),
            sunnahFemaleCapacity: Number(settings.sunnahFemaleCapacity),
            standardFee: Number(settings.standardFee),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update general settings.");
      }
      setStatusMsg({ type: "success", text: "Global Hijama settings saved successfully." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to update settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Mode Switcher Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e6dfd5] shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#f4eee5]/70 rounded-xl border border-[#e6dfd5]">
          <button
            type="button"
            onClick={() => setActiveMode("weekly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "weekly"
                ? "bg-[#14281D] text-white shadow-xs"
                : "text-[#59534b] hover:text-[#14281D]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Master Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("dates")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "dates"
                ? "bg-[#14281D] text-white shadow-xs"
                : "text-[#59534b] hover:text-[#14281D]"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Date Overrides ({overrides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("settings")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "settings"
                ? "bg-[#14281D] text-white shadow-xs"
                : "text-[#59534b] hover:text-[#14281D]"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Lunar &amp; Capacity</span>
          </button>
        </div>

        <button
          type="button"
          onClick={fetchConfig}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#59534b] hover:bg-[#faf8f5] border border-[#e6dfd5] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status feedback message */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-fade-in ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-stone-400 hover:text-stone-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ─── MODE 1: WEEKLY MASTER SCHEDULE (SLICER & CUSTOM SLOTS) ─── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeMode === "weekly" && (
        <div className="space-y-6">
          {/* Day of Week Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {DAY_NAMES.map((dName, idx) => {
              const isSelected = selectedDayIdx === idx;
              const dConfig = schedule.find((d) => d.dayOfWeek === idx);
              const isOpen = dConfig ? dConfig.isOpen : idx !== 0;

              return (
                <button
                  key={dName}
                  type="button"
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border shrink-0 ${
                    isSelected
                      ? "bg-[#14281D] text-white border-[#14281D] shadow-xs"
                      : "bg-white text-[#59534b] border-[#e6dfd5] hover:border-[#14281D]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500" : "bg-stone-300"}`} />
                  <span>{dName}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 cols: Operating hours, Slicer & Capacity Controls */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#e6dfd5] p-5 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0eae1]">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#14281D]">
                    {currentDay.dayName} Timing &amp; Slicer
                  </h3>
                  <p className="text-[11px] text-[#7a7268]">
                    Set hours, choose slot duration, and auto-slice into slots.
                  </p>
                </div>
                {/* Open / Closed Day Switch */}
                <button
                  type="button"
                  onClick={() => updateCurrentDay({ isOpen: !currentDay.isOpen })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentDay.isOpen
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-stone-100 text-stone-600 border border-stone-300"
                  }`}
                >
                  {currentDay.isOpen ? "Clinic Open" : "Closed on this Day"}
                </button>
              </div>

              {/* Operating Hours Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                    Opening Time (24h)
                  </label>
                  <input
                    type="time"
                    value={currentDay.openTime}
                    onChange={(e) => updateCurrentDay({ openTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#14281D] font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                    Closing Time (24h)
                  </label>
                  <input
                    type="time"
                    value={currentDay.closeTime}
                    onChange={(e) => updateCurrentDay({ closeTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#14281D] font-medium"
                  />
                </div>
              </div>

              {/* Capacities */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                    Male Ward Capacity (per slot)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={currentDay.maxMaleCapacity}
                    onChange={(e) => updateCurrentDay({ maxMaleCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#14281D] font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                    Female Ward Capacity (per slot)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={currentDay.maxFemaleCapacity}
                    onChange={(e) => updateCurrentDay({ maxFemaleCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#14281D] font-medium"
                  />
                </div>
              </div>

              {/* ─── DYNAMIC SLOT DURATION SLICER ─── */}
              <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#14281D] flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#22623a]" />
                    <span>Dynamic Slot Duration Slicer</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#22623a]">
                    Active: {currentDay.slotDurationMins || 45} mins
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESET_MINUTES.map((mins) => {
                    const isSelected = (currentDay.slotDurationMins || 45) === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setCustomSlotDuration(mins);
                          updateCurrentDay({ slotDurationMins: mins });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#14281D] text-white shadow-2xs"
                            : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#14281D]"
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}

                  {/* Custom minutes input */}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min={10}
                      max={180}
                      value={currentDay.slotDurationMins || customSlotDuration}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomSlotDuration(val);
                        updateCurrentDay({ slotDurationMins: val });
                      }}
                      className="w-16 px-2 py-1 bg-white border border-[#e6dfd5] rounded-lg text-xs font-bold text-center text-[#14281D]"
                      placeholder="Mins"
                    />
                    <span className="text-[10px] text-[#7a7268]">mins</span>
                  </div>
                </div>

                {/* Auto-Slice Trigger Button */}
                <button
                  type="button"
                  onClick={() => handleAutoSliceDay(currentDay.slotDurationMins || 45)}
                  className="w-full py-2.5 px-4 bg-[#eef7f1] hover:bg-[#d8edd9] text-[#22623a] border border-[#22623a]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Auto-Slice Day ({currentDay.openTime} to {currentDay.closeTime} in {currentDay.slotDurationMins || 45}m intervals)</span>
                </button>
              </div>

              {/* Save Day Schedule CTA */}
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveDaySchedule}
                className="w-full py-3 px-4 bg-[#14281D] hover:bg-[#1f3c2c] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Schedule...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save {currentDay.dayName} Configuration</span>
                  </>
                )}
              </button>
            </div>

            {/* Right 6 cols: Sliced Slots List with Individual Add / Remove / Disable */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#e6dfd5] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0eae1]">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#14281D]">
                    Active Slots ({currentDaySlots.length})
                  </h3>
                  <p className="text-[11px] text-[#7a7268]">
                    Delete breaks, toggle disabled slots, or add custom slot times.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomSlot(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#14281D] hover:bg-[#1f3c2c] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Slot</span>
                </button>
              </div>

              {/* Inline Add Custom Slot Box */}
              {isAddingCustomSlot && (
                <div className="p-3.5 bg-[#faf8f5] border border-[#22623a]/30 rounded-xl space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-[#14281D]">
                    <span>Add Custom Time Slot</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomSlot(false)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#7a7268] block">Start Time</span>
                      <input
                        type="time"
                        value={newSlotStart}
                        onChange={(e) => setNewSlotStart(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7a7268] block">End Time</span>
                      <input
                        type="time"
                        value={newSlotEnd}
                        onChange={(e) => setNewSlotEnd(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSlotToDay}
                    className="w-full py-2 bg-[#22623a] text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-[#1a4e2e]"
                  >
                    Confirm &amp; Insert Slot
                  </button>
                </div>
              )}

              {/* Slots List */}
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {currentDaySlots.map((slot, index) => {
                  return (
                    <div
                      key={slot.id || slot.startTime || index}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        slot.disabled
                          ? "bg-[#eef7f1] text-[#22623a]/70 border-emerald-200/70 opacity-60 blur-[0.3px]"
                          : "bg-[#faf8f5] text-[#1e1c19] border-[#e8e2d8]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-[#22623a] shrink-0" />
                        <div>
                          <span className="text-xs font-bold block">{slot.slot}</span>
                          <span className="text-[10px] text-[#7a7268]">
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Toggle Disable Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSlotDisabled(slot.id || slot.startTime)}
                          title={slot.disabled ? "Enable Slot" : "Disable Slot"}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            slot.disabled
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          {slot.disabled ? "Disabled" : "Active"}
                        </button>

                        {/* Delete Slot Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSlotFromDay(slot.id || slot.startTime)}
                          title="Delete this slot"
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visual preview note */}
              <div className="p-3 bg-[#f7f5f0] border border-[#e6dfd5] rounded-xl text-[11px] text-[#6a645a] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#8c6a15] shrink-0" />
                <span>
                  Booked slots automatically appear in <strong>light green with soft blur and muted cursor</strong> on the public calendar.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ─── MODE 2: DATE-SPECIFIC OVERRIDES (SUNNAH DATES / HOLIDAYS) ─ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeMode === "dates" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 cols: Date selection & Override settings */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#e6dfd5] p-5 shadow-2xs space-y-5">
              <div className="pb-3 border-b border-[#f0eae1]">
                <h3 className="font-serif text-base font-bold text-[#14281D]">
                  Configure Specific Calendar Date
                </h3>
                <p className="text-[11px] text-[#7a7268]">
                  Override timings, slots, or close clinic on holidays and special Sunnah dates.
                </p>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#14281D] block">
                  Select Calendar Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={selectedOverrideDate}
                  onChange={(e) => setSelectedOverrideDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs font-bold text-[#14281D]"
                />
              </div>

              {/* Open / Closed Switch */}
              <div className="flex items-center justify-between p-3.5 bg-[#faf8f5] rounded-xl border border-[#e6dfd5]">
                <div>
                  <span className="text-xs font-bold text-[#14281D] block">Clinic Status for this Date</span>
                  <span className="text-[10px] text-[#7a7268]">
                    {overrideClosed ? "Clinic is marked fully closed" : "Clinic is open for cupping"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOverrideClosed(!overrideClosed)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    overrideClosed
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {overrideClosed ? "Closed (Holiday)" : "Open (Operating)"}
                </button>
              </div>

              {!overrideClosed && (
                <>
                  {/* Hours and Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                        Open Time
                      </label>
                      <input
                        type="time"
                        value={overrideOpenTime}
                        onChange={(e) => setOverrideOpenTime(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#14281D]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                        Close Time
                      </label>
                      <input
                        type="time"
                        value={overrideCloseTime}
                        onChange={(e) => setOverrideCloseTime(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#14281D]"
                      />
                    </div>
                  </div>

                  {/* Slicer for this specific date */}
                  <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#14281D]">Slot Duration (Mins)</span>
                      <button
                        type="button"
                        onClick={() => {
                          const sliced = autoSliceSlots(overrideOpenTime, overrideCloseTime, overrideDuration);
                          setOverrideCustomSlots(sliced);
                        }}
                        className="text-[11px] text-[#22623a] font-bold hover:underline cursor-pointer"
                      >
                        Auto-Slice Date →
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {PRESET_MINUTES.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setOverrideDuration(m);
                            setOverrideCustomSlots(autoSliceSlots(overrideOpenTime, overrideCloseTime, m));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            overrideDuration === m
                              ? "bg-[#14281D] text-white"
                              : "bg-white text-[#59534b] border border-[#e6dfd5]"
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Capacities */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                        Male Beds Capacity
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={overrideMaleCap}
                        onChange={(e) => setOverrideMaleCap(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                        Female Beds Capacity
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={overrideFemaleCap}
                        onChange={(e) => setOverrideFemaleCap(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                      Reason / Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Special Sunnah Night Session, Eid Holiday, etc."
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs"
                    />
                  </div>
                </>
              )}

              {/* Save & Remove Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDateOverride}
                  className="flex-1 py-3 bg-[#14281D] hover:bg-[#1f3c2c] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Override for {selectedOverrideDate}</span>
                </button>

                {overrides.some((o) => o.date === selectedOverrideDate) && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleDeleteDateOverride(selectedOverrideDate)}
                    className="px-4 py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Remove Override
                  </button>
                )}
              </div>
            </div>

            {/* Right 6 cols: Existing Overrides List */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#e6dfd5] p-5 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-[#f0eae1]">
                <h3 className="font-serif text-base font-bold text-[#14281D]">
                  Active Date Overrides ({overrides.length})
                </h3>
                <p className="text-[11px] text-[#7a7268]">
                  Click any existing override to edit or delete it.
                </p>
              </div>

              {overrides.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#7a7268]">
                  No date overrides active. All dates use the weekly master schedule.
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {overrides.map((ov) => {
                    const isSelected = selectedOverrideDate === ov.date;
                    return (
                      <div
                        key={ov.date}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#faf8f5] border-[#14281D] shadow-xs"
                            : "bg-white border-[#e6dfd5] hover:border-[#14281D]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOverrideDate(ov.date)}
                              className="text-xs font-bold text-[#14281D] hover:underline cursor-pointer"
                            >
                              {ov.date}
                            </button>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                ov.isClosed
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {ov.isClosed ? "Closed" : "Custom Hours"}
                            </span>
                          </div>
                          {ov.note && (
                            <p className="text-[10px] text-[#7a7268] mt-0.5">{ov.note}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteDateOverride(ov.date)}
                          title="Delete override"
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ─── MODE 3: LUNAR CALENDAR & GLOBAL CAPACITY SETTINGS ───────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeMode === "settings" && (
        <div className="bg-white rounded-2xl border border-[#e6dfd5] p-5 sm:p-6 shadow-2xs max-w-xl mx-auto space-y-5">
          <div className="pb-3 border-b border-[#f0eae1]">
            <h3 className="font-serif text-base font-bold text-[#14281D]">
              Global Sunnah &amp; Lunar Settings
            </h3>
            <p className="text-[11px] text-[#7a7268]">
              Configure Pakistan Ruet-e-Hilal moon sighting offset and Sunnah day capacity boosts.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#14281D] block mb-1">
                Moon Sighting Offset (Pakistan Ruet-e-Hilal)
              </label>
              <select
                value={settings.moonSightingOffset}
                onChange={(e) => setSettings({ ...settings, moonSightingOffset: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#14281D] font-bold"
              >
                <option value="-2">-2 Days (Early sighting adjustment)</option>
                <option value="-1">-1 Day (1 day earlier than global calculation)</option>
                <option value="0">0 Days (Standard Umm al-Qura calculation)</option>
                <option value="1">+1 Day (Pakistan official Ruet-e-Hilal standard)</option>
                <option value="2">+2 Days (+2 days sighting adjustment)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                  Sunnah Male Capacity (per slot)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.sunnahMaleCapacity}
                  onChange={(e) => setSettings({ ...settings, sunnahMaleCapacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                  Sunnah Female Capacity (per slot)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.sunnahFemaleCapacity}
                  onChange={(e) => setSettings({ ...settings, sunnahFemaleCapacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#14281D] block mb-1">
                Standard Cupping Fee (PKR)
              </label>
              <input
                type="number"
                min={500}
                max={50000}
                step={100}
                value={settings.standardFee}
                onChange={(e) => setSettings({ ...settings, standardFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs font-medium"
              />
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveGeneralSettings}
              className="w-full py-3 bg-[#14281D] hover:bg-[#1f3c2c] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Global Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
