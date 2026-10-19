import { test, expect } from "@playwright/test";
import prisma from "../../lib/prisma";
import { auth } from "../../lib/auth";

const TEST_TICKET = `TKT-REP-${Date.now()}`;
const TEST_PATIENT_NAME = "Zainab Fatima Dossier Test";
const TEST_REPORT_URL = "https://utfs.io/f/test-thyroid-ultrasound-report.pdf";
const TEST_REPORT_NAME = "Thyroid_Ultrasound_Scan_2026.pdf";
const TEST_REPORT_SIZE = "3.4 MB";

const TEST_ADMIN_EMAIL = `test.staff.${Date.now()}@tameeresehat.test`;
const TEST_ADMIN_PASSWORD = "SecureStaffPass123!";

test.describe("Admin Consultation Dossier & Table Attached Report Verification", () => {
  let consultationId: string | null = null;
  let testAdminUserId: string | null = null;

  test.beforeAll(async () => {
    // 1. Create a dedicated staff/admin user
    const signUpRes = await auth.api.signUpEmail({
      body: {
        name: "Playwright Admin Tester",
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      },
    });

    if (signUpRes?.user) {
      testAdminUserId = signUpRes.user.id;
      await prisma.user.update({
        where: { id: testAdminUserId },
        data: { role: "editor" },
      });
    }

    // 2. Seed consultation with attached report
    const record = await prisma.consultationRequest.create({
      data: {
        ticketNumber: TEST_TICKET,
        fullName: TEST_PATIENT_NAME,
        age: 38,
        gender: "Female",
        phone: "03219988776",
        email: "zainab.dossier@example.com",
        city: "Karachi",
        primarySymptoms: "Thyroid disorder and chronic metabolism fatigue",
        duration: "6 Months",
        channel: "WHATSAPP",
        consultationType: "ONLINE",
        status: "NEW",
        reportUrl: TEST_REPORT_URL,
        reportName: TEST_REPORT_NAME,
        reportSize: TEST_REPORT_SIZE,
      },
    });
    consultationId = record.id;
  });

  test.afterAll(async () => {
    if (consultationId) {
      await prisma.consultationRequest.delete({
        where: { id: consultationId },
      }).catch(() => {});
    }
    if (testAdminUserId) {
      await prisma.user.delete({
        where: { id: testAdminUserId },
      }).catch(() => {});
    }
  });

  test("Admin Consultation tab displays 'Report Attached' badge and drawer 'Attached Medical Report' card", async ({
    page,
  }) => {
    // 1. Log in via UI form using our fresh test admin credentials
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.fill('input[type="email"]', TEST_ADMIN_EMAIL);
    await page.fill('input[type="password"]', TEST_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to /admin
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // 2. Open Consultations Tab directly
    await page.goto("/admin?tab=consultations");
    await page.waitForLoadState("domcontentloaded");

    // Wait for the table to load
    await expect(
      page.getByText("Consultation & Appointment Dossiers")
    ).toBeVisible({ timeout: 15000 });

    // Search for our test ticket or patient name
    const searchInput = page.getByPlaceholder(
      "Search by patient name, phone, ticket, city..."
    );
    await searchInput.fill(TEST_TICKET);
    await page.waitForTimeout(600);

    // 3. Verify Table Row & "Report Attached" Badge
    const row = page.locator("tr", { hasText: TEST_TICKET });
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row.getByText(TEST_PATIENT_NAME)).toBeVisible();

    const reportBadge = row.locator("text=Report Attached");
    await expect(reportBadge).toBeVisible();

    // 4. Open Consultation Drawer by clicking "Manage"
    const manageButton = row.getByRole("button", { name: /Manage/i });
    await manageButton.click();

    // 5. Verify Drawer opens and contains "Attached Medical Report" Card
    const drawer = page.locator("div.fixed.inset-0");
    await expect(drawer).toBeVisible({ timeout: 10000 });

    // Heading in drawer
    await expect(
      drawer.getByText("Attached Medical Report:")
    ).toBeVisible();

    // File name
    await expect(drawer.getByText(TEST_REPORT_NAME)).toBeVisible();

    // File size badge
    await expect(drawer.getByText(TEST_REPORT_SIZE)).toBeVisible();

    // Clickable "View / Download" button link
    const viewDownloadBtn = drawer.locator("a", { hasText: "View / Download" });
    await expect(viewDownloadBtn).toBeVisible();

    // Verify link attributes: href, target="_blank", rel contains "noopener"
    const href = await viewDownloadBtn.getAttribute("href");
    const target = await viewDownloadBtn.getAttribute("target");
    const rel = await viewDownloadBtn.getAttribute("rel");

    expect(href).toBe(TEST_REPORT_URL);
    expect(target).toBe("_blank");
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  });
});
