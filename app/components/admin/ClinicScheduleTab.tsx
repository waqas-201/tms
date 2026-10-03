"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Info,
  Sliders,
  ShieldAlert,
} from "lucide-react";

interface ScheduleDay {
  id?: string;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slotDurationMins: number;
  maxSlotsPerWindow: number;
}

interface Holiday {
  id: string;
  date: string;
  reason: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function ClinicScheduleTab() {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Saving state
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string | null>(null);
  const [scheduleErrorMsg, setScheduleErrorMsg] = useState<string | null>(null);

  // New Holiday state
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayReason, setNewHolidayReason] = useState("");
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [holidayError, setHolidayError] = useState<string | null>(null);

  const fetchScheduleData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch("/api/admin/schedule");
      const json = await res.json();
      if (res.ok && json.success) {
        setDays(json.data.schedule || []);
        setHolidays(json.data.holidays || []);
      }
    } catch (err) {
      console.error("Failed to load clinic schedule:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const handleDayChange = (index: number, field: keyof ScheduleDay, value: any) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchedule(true);
    setScheduleSuccessMsg(null);
    setScheduleErrorMsg(null);

    try {
      const res = await fetch("/api/admin/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update clinic schedule.");
      }

      setScheduleSuccessMsg("Clinic operating hours and slot rules saved successfully.");
      setDays(json.data);
    } catch (err: any) {
      setScheduleErrorMsg(err.message || "Failed to save schedule.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayReason.trim()) {
      setHolidayError("Please select a date and enter an off-day reason.");
      return;
    }

    setAddingHoliday(true);
    setHolidayError(null);

    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newHolidayDate,
          reason: newHolidayReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add holiday.");
      }

      setNewHolidayDate("");
      setNewHolidayReason("");
      fetchScheduleData(true);
    } catch (err: any) {
      setHolidayError(err.message || "Failed to add holiday.");
    } finally {
      setAddingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (date: string) => {
    if (!window.confirm(`Remove holiday override for ${date}?`)) return;

    try {
      const res = await fetch(`/api/admin/schedule?date=${date}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchScheduleData(true);
      } else {
        alert(json.error || "Failed to delete holiday.");
      }
    } catch (err) {
      alert("Error deleting holiday.");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#14281D] space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading clinic schedule configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── 1. Weekly Operating Hours & Slot Rules ─── */}
      <div className="bg-white rounded-2xl border border-[#e6dfd5] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6dfd5]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#14281D] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#c59b27]" />
              <span>Weekly Clinic Operating Hours &amp; Capacity</span>
            </h2>
            <p className="text-xs text-[#6a6660] mt-0.5">
              Set active days, opening and closing hours, slot duration, and maximum simultaneous patients.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchScheduleData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4a4640] hover:bg-[#faf8f5] border border-[#e6dfd5] transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {scheduleSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{scheduleSuccessMsg}</span>
          </div>
        )}

        {scheduleErrorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{scheduleErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveSchedule} className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8f5] text-[#78716C] uppercase text-[10px] font-bold border-b border-[#e6dfd5]">
                <tr>
                  <th className="py-3 px-4">Day of Week</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Opening Time</th>
                  <th className="py-3 px-4">Closing Time</th>
                  <th className="py-3 px-4">Slot Duration</th>
                  <th className="py-3 px-4">Max Patients / Slot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd5]">
                {days.map((day, idx) => (
                  <tr
                    key={day.dayOfWeek}
                    className={`hover:bg-[#faf8f5]/60 transition-colors ${
                      !day.isOpen ? "bg-gray-50/70 opacity-60" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#1a1816]">
                      {day.dayName || DAY_NAMES[day.dayOfWeek]}
                    </td>

                    <td className="py-3.5 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.isOpen}
                          onChange={(e) =>
                            handleDayChange(idx, "isOpen", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#14281D]"></div>
                        <span className="ml-2 text-xs font-semibold text-[#1a1816]">
                          {day.isOpen ? "Open" : "Closed"}
                        </span>
                      </label>
                    </td>

                    <td className="py-3.5 px-4">
                      <input
                        type="time"
                        disabled={!day.isOpen}
                        value={day.openTime}
                        onChange={(e) =>
                          handleDayChange(idx, "openTime", e.target.value)
                        }
                        className="px-2.5 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] disabled:bg-gray-100"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <input
                        type="time"
                        disabled={!day.isOpen}
                        value={day.closeTime}
                        onChange={(e) =>
                          handleDayChange(idx, "closeTime", e.target.value)
                        }
                        className="px-2.5 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] disabled:bg-gray-100"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        disabled={!day.isOpen}
                        value={day.slotDurationMins}
                        onChange={(e) =>
                          handleDayChange(
                            idx,
                            "slotDurationMins",
                            Number(e.target.value)
                          )
                        }
                        className="px-2.5 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] disabled:bg-gray-100"
                      >
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes (Default)</option>
                        <option value={90}>90 Minutes</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        disabled={!day.isOpen}
                        value={day.maxSlotsPerWindow}
                        onChange={(e) =>
                          handleDayChange(
                            idx,
                            "maxSlotsPerWindow",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] disabled:bg-gray-100"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#e6dfd5]">
            <button
              type="submit"
              disabled={savingSchedule}
              className="px-6 py-2.5 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {savingSchedule ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Weekly Operating Hours</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─── 2. Clinic Holidays & Blackout Dates Manager ─── */}
      <div className="bg-white rounded-2xl border border-[#e6dfd5] p-6 shadow-xs space-y-6">
        <div className="pb-4 border-b border-[#e6dfd5]">
          <h2 className="font-serif text-lg font-bold text-[#14281D] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#c59b27]" />
            <span>Clinic Holidays &amp; Blackout Dates</span>
          </h2>
          <p className="text-xs text-[#6a6660] mt-0.5">
            Add official clinic holidays, Eid breaks, or maintenance off-days. Appointment booking will automatically be disabled on these dates.
          </p>
        </div>

        {/* Add Holiday Form */}
        <form onSubmit={handleAddHoliday} className="p-4 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] space-y-3">
          <span className="text-xs font-bold text-[#14281D] uppercase tracking-wider block">
            Add Off-Day Override:
          </span>

          {holidayError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{holidayError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1a1816]">Date (YYYY-MM-DD)</label>
              <input
                type="date"
                required
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#1a1816]">Reason / Description</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newHolidayReason}
                  onChange={(e) => setNewHolidayReason(e.target.value)}
                  placeholder="e.g. Eid-ul-Fitr Holiday, Annual Inventory & Disinfection..."
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                />
                <button
                  type="submit"
                  disabled={addingHoliday}
                  className="px-4 py-2 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {addingHoliday ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Holiday</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Existing Holidays List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#1a1816] uppercase tracking-wider block">
            Scheduled Holidays ({holidays.length})
          </span>

          {holidays.length === 0 ? (
            <p className="text-xs text-[#6a6660] italic">
              No holiday blackout dates registered. Clinic operates based on standard weekly hours.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {holidays.map((h) => (
                <div
                  key={h.date}
                  className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-[#1a1816] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span>{h.date}</span>
                    </div>
                    <p className="text-[11px] text-[#78716C] mt-0.5">{h.reason}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteHoliday(h.date)}
                    className="w-7 h-7 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Remove Holiday"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
