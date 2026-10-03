import { config } from "dotenv";
config({ path: ".env.local" });

import prisma from "../lib/prisma";
import {
  getAvailableSlotsForDate,
  getOrInitClinicSchedule,
} from "../lib/clinic-schedule";

async function runConsultationTests() {
  console.log("================================================================================");
  console.log(" 🧪 TAMEER-E-SEHAT DUAL-CHANNEL CONSULTATION & CLINIC SCHEDULER TEST SUITE");
  console.log("================================================================================\n");

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      if (detail) console.error(`    Detail: ${detail}`);
      testsFailed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Schedule Initialization
    // -------------------------------------------------------------------------
    console.log("--- TEST 1: Clinic Schedule Initialization ---");
    const weeklySchedule = await getOrInitClinicSchedule();
    assert(
      Array.isArray(weeklySchedule) && weeklySchedule.length === 7,
      "Clinic weekly schedule initializes 7 days (Sunday - Saturday)",
      `Found ${weeklySchedule.length} days`
    );

    const sunday = weeklySchedule.find((d) => d.dayOfWeek === 0);
    const monday = weeklySchedule.find((d) => d.dayOfWeek === 1);
    assert(sunday !== undefined && !sunday.isOpen, "Sunday defaults to closed");
    assert(monday !== undefined && monday.isOpen, "Monday defaults to open (10:00 to 21:00)");

    // -------------------------------------------------------------------------
    // TEST 2: Availability Engine for Active Day
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Availability Engine Calculation ---");
    // Pick next Monday
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
    const mondayStr = `${nextMonday.getFullYear()}-${String(nextMonday.getMonth() + 1).padStart(2, "0")}-${String(nextMonday.getDate()).padStart(2, "0")}`;

    const mondayAvail = await getAvailableSlotsForDate(mondayStr);
    assert(mondayAvail.isOpen, `Availability for ${mondayStr} reports clinic open`);
    assert(
      mondayAvail.slots.length > 0,
      `Calculates time slots for active day (Found ${mondayAvail.slots.length} slots)`
    );

    const firstSlot = mondayAvail.slots[0];
    assert(
      firstSlot.available && firstSlot.capacityRemaining >= 1,
      `First slot ${firstSlot.slot} is initially available with capacity >= 1`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Consultation Booking & Slot Collision Prevention
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Consultation Booking & Capacity Depletion ---");
    const testTicket = `TEST-CON-${Date.now()}`;
    const createdConsultation = await prisma.consultationRequest.create({
      data: {
        ticketNumber: testTicket,
        fullName: "Test Patient Aisha",
        age: 34,
        gender: "Female",
        phone: "03009998877",
        email: "aisha.test@tameersehat.pk",
        city: "Karachi",
        primarySymptoms: "Gastric pain and acid reflux",
        duration: "1 to 3 Months",
        channel: "EMAIL",
        consultationType: "ONLINE",
        appointmentDate: mondayStr,
        appointmentSlot: firstSlot.slot,
        preferredContact: "EMAIL",
        status: "NEW",
      },
    });

    assert(
      createdConsultation.id !== undefined && createdConsultation.ticketNumber === testTicket,
      `Consultation booking created in PostgreSQL (Ticket: ${testTicket})`
    );

    // Re-check slot availability after booking
    const updatedAvail = await getAvailableSlotsForDate(mondayStr);
    const matchedSlotAfter = updatedAvail.slots.find((s) => s.slot === firstSlot.slot);
    assert(
      matchedSlotAfter !== undefined &&
        matchedSlotAfter.bookedCount === 1 &&
        matchedSlotAfter.capacityRemaining === 0 &&
        !matchedSlotAfter.available,
      `Booked slot ${firstSlot.slot} is now marked unavailable with 0 capacity remaining`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Clinic Holiday / Blackout Date Override
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Holiday Override & Blackout Protection ---");
    const testHolidayDate = `${today.getFullYear()}-12-25`;
    const holidayRecord = await prisma.clinicHoliday.upsert({
      where: { date: testHolidayDate },
      update: { reason: "Quaid-e-Azam Day & Clinic Disinfection" },
      create: { date: testHolidayDate, reason: "Quaid-e-Azam Day & Clinic Disinfection" },
    });

    const holidayAvail = await getAvailableSlotsForDate(testHolidayDate);
    assert(
      holidayAvail.isHoliday && holidayAvail.holidayReason === "Quaid-e-Azam Day & Clinic Disinfection",
      `Holiday override recognized for ${testHolidayDate}`
    );
    assert(
      holidayAvail.slots.length === 0,
      `All appointment slots disabled on official holiday date`
    );

    // Clean up holiday record
    await prisma.clinicHoliday.delete({ where: { date: testHolidayDate } });

    // -------------------------------------------------------------------------
    // TEST 5: Hakim Prescription & Status Update Workflow
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Hakim Clinical Action & Prescription ---");
    const updatedConsultation = await prisma.consultationRequest.update({
      where: { id: createdConsultation.id },
      data: {
        status: "PRESCRIBED",
        prescribedTreatment: "1. Majoon Dabeed-ul-Ward (1 tsp morning)\n2. Arq-e-Gulab (1/2 cup before meals)",
        hakimNotes: "Avoid fried and acidic foods for 14 days.",
      },
    });

    assert(
      updatedConsultation.status === "PRESCRIBED",
      "Consultation status transitions to PRESCRIBED"
    );
    assert(
      updatedConsultation.prescribedTreatment?.includes("Majoon Dabeed-ul-Ward") === true,
      "Hakim prescription saved to patient dossier"
    );

    // -------------------------------------------------------------------------
    // Cleanup Test Data
    // -------------------------------------------------------------------------
    await prisma.consultationRequest.delete({ where: { id: createdConsultation.id } });
    console.log("\n--- Cleaned up test records from database ---");

  } catch (error: any) {
    console.error("❌ UNEXPECTED ERROR IN TEST SUITE:", error);
    testsFailed++;
  }

  console.log("\n================================================================================");
  console.log(` 📊 CONSULTATION & SCHEDULER TEST RESULTS: ${testsPassed} Passed | ${testsFailed} Failed`);
  console.log("================================================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runConsultationTests();
