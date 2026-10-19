import { test, expect } from "@playwright/test";

test.describe("Consultation Report Upload & WhatsApp / Clinic Flow", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  async function openConsultationModal(page: any) {
    page.on("pageerror", (err: any) => console.log("[BROWSER ERROR]", err.message));
    page.on("console", (msg: any) => {
      if (msg.type() === "error") console.log("[BROWSER CONSOLE ERROR]", msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    const bannerBtn = page.getByRole("banner").getByRole("button", {
      name: "Consult",
      exact: true,
    });

    if (await bannerBtn.isVisible()) {
      await bannerBtn.click();
    } else {
      const section = page.locator("section#specialties");
      await section.scrollIntoViewIfNeeded();
      await section.getByRole("button", { name: /Consult Hakim Sahib/i }).click();
    }

    const modal = page.getByRole("dialog", {
      name: /Consult Hakim Tahir Hameed/i,
    });

    // If modal is not visible yet, click once more to account for hydration
    const isVisible = await modal.isVisible();
    if (!isVisible) {
      await page.waitForTimeout(600);
      if (await bannerBtn.isVisible()) {
        await bannerBtn.click();
      } else {
        await page.locator("section#specialties").getByRole("button", { name: /Consult Hakim Sahib/i }).click();
      }
    }

    await expect(modal).toBeVisible({ timeout: 10000 });
    return modal;
  }

  test("Feature 1: Attaching report in Step 1 updates UI chip with ready/uploaded state", async ({
    page,
  }) => {
    const modal = await openConsultationModal(page);

    // Type symptoms
    const textarea = modal.locator("textarea");
    await textarea.fill("Chronic indigestion and elevated liver enzymes");

    // 1. Attach mock PDF report
    const fileInput = modal.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "liver-function-test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 mock liver function lab report content with enough bytes"),
    });

    // Check that file name chip appears
    await expect(modal.getByText("liver-function-test.pdf")).toBeVisible();

    // Check that file size appears in chip
    await expect(modal.locator("text=/\\d+\\s*(KB|MB)/i").first()).toBeVisible();

    // Verify remove button clears PDF attachment
    const removeBtn = modal.locator('button[title="Remove file"]');
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();
    await expect(modal.getByText("liver-function-test.pdf")).toBeHidden();

    // 2. Attach mock Image file (e.g. tongue/skin photo)
    await fileInput.setInputFiles({
      name: "tongue-examination.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-content-for-testing-purposes"),
    });

    // Verify image file chip and size appear
    await expect(modal.getByText("tongue-examination.jpg")).toBeVisible();
    await expect(modal.locator("text=/\\d+\\s*(KB|MB)/i").first()).toBeVisible();

    // Remove image attachment
    await removeBtn.click();
    await expect(modal.getByText("tongue-examination.jpg")).toBeHidden();
  });

  test("Feature 2: Step 2 displays WhatsApp flow with direct launch option and pre-filled symptom text", async ({
    page,
  }) => {
    const modal = await openConsultationModal(page);

    // Type symptoms
    await modal.locator("textarea").fill("Headache and fatigue");

    // Advance to Step 2
    const continueBtn = modal.getByRole("button", {
      name: /Continue to Choose Channel|Continue to Next Step/i,
    });
    await continueBtn.click();

    // Verify WhatsApp channel is selected & pre-filled symptom summary is displayed
    await expect(modal.getByText("Choose Consultation Channel")).toBeVisible();
    await expect(modal.getByText("Instant WhatsApp")).toBeVisible();
    await expect(modal.getByText("Headache and fatigue")).toBeVisible();

    // Verify direct WhatsApp fallback link is visible and contains correctly URL-encoded message
    const directLink = modal.locator("a", {
      hasText: /launch WhatsApp directly without ticket|open WhatsApp directly/i,
    });
    await expect(directLink).toBeVisible();

    const href = await directLink.getAttribute("href");
    expect(href).not.toBeNull();
    expect(href).toContain("https://wa.me/");
    expect(href).toContain(encodeURIComponent("Headache and fatigue"));
  });

  test("Feature 2: WhatsApp consultation with attached report includes report link, name, size, and ticket number", async ({
    page,
  }) => {
    // Intercept UploadThing ingest upload for deterministic, instant completion
    await page.route("https://*.uploadthing.com/**", async (route: any) => {
      if (route.request().method() === "HEAD") {
        await route.fulfill({
          status: 200,
          headers: { "x-ut-range-start": "0" },
        });
      } else if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            url: "https://utfs.io/f/mock-liver-report.pdf",
            ufsUrl: "https://utfs.io/f/mock-liver-report.pdf",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock window.open so the test doesn't launch new tabs in the background
    await page.addInitScript(() => {
      window.open = () => null;
    });

    const modal = await openConsultationModal(page);

    // 1. Enter symptoms in Step 1
    const symptomDescription = "Chronic indigestion and elevated liver enzymes";
    await modal.locator("textarea").fill(symptomDescription);

    // 2. Attach mock lab report
    const fileInput = modal.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "liver-function-test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 mock liver function lab report content"),
    });

    // Verify ready state after upload completes
    await expect(modal.getByText("Ready")).toBeVisible({ timeout: 10000 });

    // 3. Advance to Step 2 (Channel selection)
    const continueBtn = modal.getByRole("button", {
      name: /Continue to Choose Channel|Continue to Next Step/i,
    });
    await continueBtn.click();

    // Verify Step 2 displays pre-filled symptom text and report attachment indicator
    await expect(modal.getByText("Choose Consultation Channel")).toBeVisible();
    await expect(modal.getByText("Instant WhatsApp")).toBeVisible();
    await expect(modal.getByText(symptomDescription)).toBeVisible();
    await expect(modal.getByText("liver-function-test.pdf")).toBeVisible();
    await expect(modal.getByText("(Uploaded)")).toBeVisible();

    // 4. Verify direct WhatsApp fallback link includes UploadThing report link and name
    const fallbackLink = modal.locator("a", {
      hasText: /launch WhatsApp directly without ticket|open WhatsApp directly/i,
    });
    await expect(fallbackLink).toBeVisible();
    const fallbackHref = await fallbackLink.getAttribute("href");
    expect(fallbackHref).not.toBeNull();
    const decodedFallbackHref = decodeURIComponent(fallbackHref!);
    expect(decodedFallbackHref).toContain("liver-function-test.pdf");
    expect(decodedFallbackHref).toContain("https://utfs.io/f/mock-liver-report.pdf");
    expect(decodedFallbackHref).toContain(symptomDescription);

    // 5. Fill patient info for booking ticket generation
    await modal.locator('input[placeholder*="Ahmed Khan"]').fill("Zubair Ahmed");
    await modal.locator('input[placeholder*="0300-1234567"]').fill("03001234567");

    // 6. Submit WhatsApp booking request
    const startWhatsAppBtn = modal.getByRole("button", {
      name: /Start WhatsApp Consultation/i,
    });
    await startWhatsAppBtn.click();

    // 7. Verify booking confirmation and ticket number
    await expect(modal.getByText("Booking Request Received")).toBeVisible({
      timeout: 10000,
    });
    await expect(modal.getByText(/Ticket Number:/i)).toBeVisible();

    const ticketNumberEl = modal.locator("strong.font-mono");
    await expect(ticketNumberEl).toBeVisible();
    const ticketNumber = (await ticketNumberEl.innerText()).trim();
    expect(ticketNumber).toMatch(/^CON-\d{4}-\d+/);

    // 8. Verify the pre-filled WhatsApp message includes the clickable UploadThing report link, report name, size, and ticket number
    const openWhatsAppBtn = modal.locator("a", {
      hasText: /Open WhatsApp Consultation/i,
    });
    await expect(openWhatsAppBtn).toBeVisible();

    const openHref = await openWhatsAppBtn.getAttribute("href");
    expect(openHref).not.toBeNull();
    expect(openHref).toContain("https://wa.me/");

    const decodedOpenHref = decodeURIComponent(openHref!);
    expect(decodedOpenHref).toContain(`*Booking Ticket:* ${ticketNumber}`);
    expect(decodedOpenHref).toContain("*Patient:* Zubair Ahmed");
    expect(decodedOpenHref).toContain(symptomDescription);
    expect(decodedOpenHref).toContain("liver-function-test.pdf");
    expect(decodedOpenHref).toContain("https://utfs.io/f/mock-liver-report.pdf");
    expect(decodedOpenHref).toContain("📄 *Attached Medical Report:*");
    expect(decodedOpenHref).toContain("🔗 *Document Link:*");
  });

  test("Feature 3: Step 3 In-Person Clinic Booking requires Email and Name, with Phone optional", async ({
    page,
  }) => {
    const modal = await openConsultationModal(page);

    await modal.locator("textarea").fill("Knee joint stiffness and pain");

    // Advance to Step 2
    const continueBtn = modal.getByRole("button", {
      name: /Continue to Choose Channel|Continue to Next Step/i,
    });
    await continueBtn.click();

    // Choose In-Person Karachi Clinic Visit
    const clinicCard = modal.locator("button", { hasText: "In-Person Visit" });
    await clinicCard.click();

    const continueToClinic = modal.getByRole("button", {
      name: /Continue to Clinic Reservation/i,
    });
    await continueToClinic.click();

    // Verify Step 3 fields: Name (*), Email Address (*), and Phone (optional)
    await expect(modal.getByText("Step 3 of 3").first()).toBeVisible();
    await expect(modal.getByText("Patient Name")).toBeVisible();
    await expect(modal.getByText("Email Address")).toBeVisible();

    const emailInput = modal.locator('input[placeholder*="you@example.com"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("required", "");

    const phoneInput = modal.locator('input[placeholder*="0300-1234567"]');
    await expect(phoneInput).toBeVisible();
    // Phone should NOT be required
    const isPhoneRequired = await phoneInput.getAttribute("required");
    expect(isPhoneRequired).toBeNull();
  });
});
