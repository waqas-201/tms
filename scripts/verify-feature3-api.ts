import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import prisma from "../lib/prisma";

async function main() {
  const testDate = "2026-11-04";

  // Fetch real-time available slot dynamically
  const availRes = await fetch(`http://127.0.0.1:3000/api/consultations/availability?date=${testDate}`);
  const availData = await availRes.json();
  const availableSlot = availData.data.slots.find((s: any) => s.available)?.slot || "02:00 PM - 03:00 PM";

  console.log(`Using date: ${testDate}, slot: ${availableSlot}`);

  const payload = {
    fullName: "Tariq Mahmood Test",
    email: "tariq.test.clinic@example.com",
    // phone omitted / empty
    phone: "",
    appointmentDate: testDate,
    appointmentSlot: availableSlot,
    primarySymptoms: "Chronic lower back stiffness and disc bulge with leg numbness",
    duration: "3 months",
    consultationType: "CLINIC",
    channel: "CLINIC",
    city: "Karachi",
    reportUrl: "https://blob.vercel-storage.com/reports/mri-lumbar-spine.pdf",
    reportName: "mri-lumbar-spine.pdf",
    reportSize: "1.2 MB",
  };

  console.log("\nSending POST http://127.0.0.1:3000/api/consultations with payload:");
  console.log(JSON.stringify(payload, null, 2));

  const response = await fetch("http://127.0.0.1:3000/api/consultations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const statusCode = response.status;
  const data = await response.json();

  console.log("\n--- Response Status ---");
  console.log("HTTP Status Code:", statusCode);
  console.log("\n--- Response Body ---");
  console.log(JSON.stringify(data, null, 2));

  if (statusCode !== 201) {
    throw new Error(`Expected HTTP 201, got ${statusCode}`);
  }

  if (!data.success || !data.data?.ticketNumber) {
    throw new Error("Missing success or ticketNumber in response");
  }

  const ticketNumber = data.data.ticketNumber;
  console.log(`\nVerified API returned HTTP 201 with ticketNumber: ${ticketNumber}`);

  console.log("\n--- Database Verification via Prisma ---");
  const dbRecord = await prisma.consultationRequest.findUnique({
    where: { ticketNumber },
  });

  if (!dbRecord) {
    throw new Error(`Consultation record with ticket ${ticketNumber} not found in database!`);
  }

  console.log("DB Record Found in database:");
  console.log(JSON.stringify(dbRecord, null, 2));

  console.log("\n--- Verifying Assertions ---");
  console.log("1. Full Name matches:", dbRecord.fullName === payload.fullName ? "PASSED" : "FAILED");
  console.log("2. Email matches:", dbRecord.email === payload.email ? "PASSED" : "FAILED");
  console.log("3. Phone fallback handled without constraint error:", dbRecord.phone ? `PASSED (value: '${dbRecord.phone}')` : "FAILED");
  console.log("4. Date & Slot matches:", dbRecord.appointmentDate === payload.appointmentDate && dbRecord.appointmentSlot === payload.appointmentSlot ? "PASSED" : "FAILED");
  console.log("5. Report URL matches:", dbRecord.reportUrl === payload.reportUrl ? "PASSED" : "FAILED");
  console.log("6. Report Name matches:", dbRecord.reportName === payload.reportName ? "PASSED" : "FAILED");
  console.log("7. Report Size matches:", dbRecord.reportSize === payload.reportSize ? "PASSED" : "FAILED");

  // Clean up test records
  await prisma.consultationRequest.delete({
    where: { ticketNumber },
  });
  console.log(`\nTest consultation ${ticketNumber} cleaned up successfully from database.`);

  const lingering = await prisma.consultationRequest.findMany({
    where: { email: "tariq.test.clinic@example.com" },
  });
  if (lingering.length > 0) {
    await prisma.consultationRequest.deleteMany({
      where: { email: "tariq.test.clinic@example.com" },
    });
    console.log(`Cleaned up ${lingering.length} lingering test records.`);
  }

  process.exit(0);
}

main()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  });
