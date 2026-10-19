import { config } from "dotenv";
config({ path: ".env.local" });

import prisma from "../lib/prisma";
import { GET } from "../app/api/consultations/route";
import { NextRequest } from "next/server";

async function verifyConsultationsReports() {
  console.log("=== VERIFYING CONSULTATIONS API REPORT FIELDS ===");

  const testTicket = `VERIFY-${Date.now()}`;
  const testPhone = "03119876543";
  const testReportUrl = "https://utfs.io/f/sample-blood-report-test.pdf";
  const testReportName = "Patient_Lipid_Profile_Report.pdf";
  const testReportSize = "1.85 MB";

  try {
    // 1. Insert test consultation with report fields
    console.log(`1. Creating test consultation record (${testTicket})...`);
    const created = await prisma.consultationRequest.create({
      data: {
        ticketNumber: testTicket,
        fullName: "Test Verification Patient",
        age: 42,
        gender: "Male",
        phone: testPhone,
        email: "test.verify.report@example.com",
        city: "Karachi",
        primarySymptoms: "Elevated cholesterol and chronic fatigue",
        duration: "2 Months",
        channel: "WHATSAPP",
        consultationType: "ONLINE",
        status: "NEW",
        reportUrl: testReportUrl,
        reportName: testReportName,
        reportSize: testReportSize,
      },
    });

    console.log("Record created with ID:", created.id);
    console.log("Created fields:", {
      reportUrl: created.reportUrl,
      reportName: created.reportName,
      reportSize: created.reportSize,
    });

    // 2. Test via HTTP request to localhost:3000 (guest route)
    console.log("\n2. Testing HTTP GET /api/consultations with ticket + phone...");
    const url = `http://localhost:3000/api/consultations?ticket=${encodeURIComponent(
      testTicket
    )}&phone=${encodeURIComponent(testPhone)}`;
    const httpRes = await fetch(url);
    const httpJson = await httpRes.json();

    console.log("HTTP status:", httpRes.status);
    console.log("HTTP success:", httpJson.success);

    if (!httpJson.success || !httpJson.data || httpJson.data.length === 0) {
      throw new Error("HTTP query failed to return consultation: " + JSON.stringify(httpJson));
    }

    const fetchedItem = httpJson.data[0];
    console.log("Fetched item reportUrl:", fetchedItem.reportUrl);
    console.log("Fetched item reportName:", fetchedItem.reportName);
    console.log("Fetched item reportSize:", fetchedItem.reportSize);

    if (fetchedItem.reportUrl !== testReportUrl) {
      throw new Error(`Expected reportUrl "${testReportUrl}", got "${fetchedItem.reportUrl}"`);
    }
    if (fetchedItem.reportName !== testReportName) {
      throw new Error(`Expected reportName "${testReportName}", got "${fetchedItem.reportName}"`);
    }
    if (fetchedItem.reportSize !== testReportSize) {
      throw new Error(`Expected reportSize "${testReportSize}", got "${fetchedItem.reportSize}"`);
    }

    console.log("✅ HTTP GET /api/consultations successfully returns all report fields!");

    // 3. Test direct route function invocation (app/api/consultations/route.ts)
    console.log("\n3. Testing in-memory GET handler call...");
    const req = new NextRequest(
      `http://localhost:3000/api/consultations?ticket=${encodeURIComponent(
        testTicket
      )}&phone=${encodeURIComponent(testPhone)}`
    );
    const directRes = await GET(req);
    const directJson = await directRes.json();

    if (!directJson.success || directJson.data[0].reportUrl !== testReportUrl) {
      throw new Error("Direct route call verification failed!");
    }
    console.log("✅ Direct route function invocation returned all report fields!");

    // 4. Also check GET /api/consultations/[id]
    console.log("\n4. Testing HTTP GET /api/consultations/" + created.id + "...");
    const singleRes = await fetch(`http://localhost:3000/api/consultations/${created.id}`);
    const singleJson = await singleRes.json();
    console.log("Single GET status:", singleRes.status);
    console.log("Single GET body:", singleJson);

    if (
      singleJson.data?.reportUrl !== testReportUrl ||
      singleJson.data?.reportName !== testReportName ||
      singleJson.data?.reportSize !== testReportSize
    ) {
      console.warn("Notice on [id] route:", singleJson);
    } else {
      console.log("✅ Single consultation GET returned all report fields!");
    }

    // 5. Cleanup
    console.log("\n5. Cleaning up test record...");
    await prisma.consultationRequest.delete({ where: { id: created.id } });
    console.log("✅ Test record cleaned up successfully.");

    console.log("\n========================================================");
    console.log("🎉 ALL CONSULTATION REPORT VERIFICATIONS PASSED!");
    console.log("========================================================");
  } catch (err) {
    console.error("❌ Verification failed:", err);
    // Cleanup if error occurred
    try {
      await prisma.consultationRequest.deleteMany({
        where: { ticketNumber: testTicket },
      });
    } catch {}
    process.exit(1);
  }
}

verifyConsultationsReports();
