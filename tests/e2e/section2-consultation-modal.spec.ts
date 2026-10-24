import { test, expect } from "@playwright/test";

test.describe("Section 2: Minimal Consultation Card & Universal ConsultationModal Verification", () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // DESKTOP VIEWPORT (1280 x 800)
  // ═══════════════════════════════════════════════════════════════════════════
  test.describe("Desktop Viewport (1280 x 800)", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("Section 2 minimal consultation card renders cleanly with all visual elements", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const section = page.locator("section#specialties");
      await section.scrollIntoViewIfNeeded();

      // Let client hydration attach the controlled input handlers before
      // typing/clicking; otherwise early interactions are reset by React.
      await page.waitForTimeout(1500);
      await expect(section).toBeVisible();

      // Verify scope pill and main heading
      await expect(section.getByText("Clinical Scope & Consultation")).toBeVisible();
      await expect(
        section.getByRole("heading", {
          name: /What We Treat with Classical Unani/i,
        })
      ).toBeVisible();

      // Verify explanatory text
      await expect(
        section.getByText(/We treat the root constitutional imbalance \(Mizaj\)/i)
      ).toBeVisible();

      // Verify minimal consultation card container
      const card = section.locator(".bg-white.rounded-3xl.border");
      await expect(card).toBeVisible();

      // Verify input box and primary CTA button
      const input = card.locator("input[placeholder*='Describe your symptoms']");
      await expect(input).toBeVisible();
      await expect(input).toBeEmpty();

      const consultButton = card.getByRole("button", {
        name: /Consult Hakeem Sahib/i,
      });
      await expect(consultButton).toBeVisible();

      // Verify quick symptom chips
      const chips = [
        "Stomach Acidity / Gas",
        "Joint & Knee Pain",
        "Fatty Liver / Body Heat",
        "Vitality & Energy",
        "Hair Fall & Scalp",
      ];

      for (const chipText of chips) {
        const chip = card.locator("button", { hasText: chipText });
        await expect(chip).toBeVisible();
      }

      // Verify reassurance footer
      await expect(
        card.getByText(/100% Free Initial Assessment · Confidential/i)
      ).toBeVisible();
      await expect(
        card.getByText(/Instant WhatsApp & Karachi Matab/i)
      ).toBeVisible();
    });

    test("User can type into symptom input box, clear it, and trigger modal with custom text", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const section = page.locator("section#specialties");
      await section.scrollIntoViewIfNeeded();

      // Let client hydration attach the controlled input handlers before
      // typing/clicking; otherwise early interactions are reset by React.
      await page.waitForTimeout(1500);
      const card = section.locator(".bg-white.rounded-3xl.border");
      const input = card.locator("input[placeholder*='Describe your symptoms']");
      await expect(input).toBeVisible();

      // Test typing symptoms
      const customSymptom = "Severe gastric acidity and burning sensation after meals";
      await input.fill(customSymptom);
      await expect(input).toHaveValue(customSymptom);

      // Verify clear button appears when input has content
      const clearBtn = card.locator("button[aria-label='Clear input']");
      await expect(clearBtn).toBeVisible();

      // Clear input and verify empty
      await clearBtn.click();
      await expect(input).toHaveValue("");
      await expect(clearBtn).toBeHidden();

      // Re-enter symptoms for consultation
      await input.fill(customSymptom);
      await expect(input).toHaveValue(customSymptom);

      // Click "Consult Hakeem Sahib"
      const consultButton = card.getByRole("button", {
        name: /Consult Hakeem Sahib/i,
      });
      await consultButton.click();

      // Assert universal ConsultationModal opens
      const modal = page.getByRole("dialog", {
        name: /Consult Hakeem Tahir Hameed/i,
      });
      await expect(modal).toBeVisible();

      // Assert Modal Header credentials
      await expect(
        modal.getByRole("heading", { name: /Consult Hakeem Tahir Hameed/i })
      ).toBeVisible();
      await expect(
        modal.getByText(/35\+ Years Classical Unani Wisdom/i)
      ).toBeVisible();

      // Assert Step 1 textarea is pre-filled with the exact typed symptom text
      const textarea = modal.locator("textarea");
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveValue(customSymptom);

      // Close modal
      const closeButton = modal.getByRole("button", { name: /Close modal/i });
      await closeButton.click();
      await expect(modal).toBeHidden();
    });

    test("User can click quick symptom chips to populate input and open modal with pre-filled tags", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const section = page.locator("section#specialties");
      await section.scrollIntoViewIfNeeded();

      // Let client hydration attach the controlled input handlers before
      // typing/clicking; otherwise early interactions are reset by React.
      await page.waitForTimeout(1500);
      const card = section.locator(".bg-white.rounded-3xl.border");
      const input = card.locator("input[placeholder*='Describe your symptoms']");
      await expect(input).toBeVisible();

      // Click "Stomach Acidity / Gas" chip
      const stomachChip = card.locator("button", {
        hasText: "Stomach Acidity / Gas",
      });
      await expect(stomachChip).toBeVisible();
      await stomachChip.click();

      // Verify input now has "Stomach Acidity / Gas"
      await expect(input).toHaveValue("Stomach Acidity / Gas");

      // Click second chip "Vitality & Energy" to assert multi-tag combination
      const vitalityChip = card.locator("button", {
        hasText: "Vitality & Energy",
      });
      await expect(vitalityChip).toBeVisible();
      await vitalityChip.click();

      await expect(input).toHaveValue("Stomach Acidity / Gas, Vitality & Energy");

      // Click "Consult Hakeem Sahib"
      const consultButton = card.getByRole("button", {
        name: /Consult Hakeem Sahib/i,
      });
      await consultButton.click();

      // Verify universal ConsultationModal opens
      const modal = page.getByRole("dialog", {
        name: /Consult Hakeem Tahir Hameed/i,
      });
      await expect(modal).toBeVisible();

      // Verify Step 1 textarea contains the concatenated chip tags
      const textarea = modal.locator("textarea");
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveValue("Stomach Acidity / Gas, Vitality & Energy");

      // Close modal
      const closeButton = modal.getByRole("button", { name: /Close modal/i });
      await closeButton.click();
      await expect(modal).toBeHidden();
    });

    test("Full modal flow: Step 1 symptom pre-fill -> advance to Step 2 -> WhatsApp direct launch option", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const section = page.locator("section#specialties");
      await section.scrollIntoViewIfNeeded();

      // Let client hydration attach the controlled input handlers before
      // typing/clicking; otherwise early interactions are reset by React.
      await page.waitForTimeout(1500);
      const card = section.locator(".bg-white.rounded-3xl.border");
      const input = card.locator("input[placeholder*='Describe your symptoms']");
      await expect(input).toBeVisible();

      const stomachChip = card.locator("button", {
        hasText: "Stomach Acidity / Gas",
      });
      await expect(stomachChip).toBeVisible();
      await stomachChip.click();
      await expect(input).toHaveValue("Stomach Acidity / Gas");

      const consultButton = card.getByRole("button", {
        name: /Consult Hakeem Sahib/i,
      });
      await consultButton.click();

      const modal = page.getByRole("dialog", {
        name: /Consult Hakeem Tahir Hameed/i,
      });
      await expect(modal).toBeVisible();

      // Verify Step 1 indicator is active
      await expect(modal.getByText("Step 1 of 3")).toBeVisible();
      await expect(modal.getByText("Describe Health Concern")).toBeVisible();

      // Verify Step 1 features: Attach report button, Quick tags
      await expect(
        modal.getByRole("button", { name: /Attach Report/i })
      ).toBeVisible();

      // Verify quick symptom tags inside modal
      const modalChip = modal.locator("button", {
        hasText: "Fatty Liver & Heat",
      });
      await expect(modalChip).toBeVisible();
      await modalChip.click();

      const textarea = modal.locator("textarea");
      await expect(textarea).toHaveValue(
        "Stomach Acidity / Gas, Fatty Liver & Heat"
      );

      // Advance from Step 1 to Step 2 using "Continue to Next Step"
      const continueButton = modal.getByRole("button", {
        name: /Continue to Choose Channel/i,
      });
      await expect(continueButton).toBeVisible();
      await continueButton.click();

      // ── Step 2 Assertions ──
      // Verify Step 2 is active
      await expect(modal.getByText("Choose Consultation Channel")).toBeVisible();
      await expect(modal.getByText("Health Concern:")).toBeVisible();
      await expect(
        modal.getByText("Stomach Acidity / Gas, Fatty Liver & Heat")
      ).toBeVisible();

      // Verify WhatsApp channel card option is selected by default
      const whatsappCard = modal.locator("button", {
        hasText: "Instant WhatsApp",
      });
      await expect(whatsappCard).toBeVisible();
      await expect(whatsappCard.getByText("Recommended")).toBeVisible();

      // WhatsApp now creates a real, trackable booking ticket, so the
      // patient's name and phone are required.
      await expect(modal.getByText("Your Name")).toBeVisible();
      await expect(modal.getByText("WhatsApp / Phone")).toBeVisible();
      await expect(
        modal.getByRole("button", { name: /Start WhatsApp Consultation/i })
      ).toBeVisible();

      // Direct launch without a ticket stays available and carries symptoms.
      const whatsappDirectLink = modal.locator("a", {
        hasText: /launch WhatsApp directly without ticket/i,
      });
      await expect(whatsappDirectLink).toBeVisible();

      // Assert WhatsApp URL format and payload encoding
      const href = await whatsappDirectLink.getAttribute("href");
      expect(href).not.toBeNull();
      expect(href).toContain("https://wa.me/");
      expect(href).toContain(encodeURIComponent("Stomach Acidity / Gas"));

      // Verify "Back to Step 1" button works properly
      const backButton = modal.getByRole("button", {
        name: /Back to Step 1 \(Edit Concern\)/i,
      });
      await expect(backButton).toBeVisible();
      await backButton.click();

      // Assert we are back in Step 1 with preserved symptoms
      await expect(modal.locator("textarea")).toBeVisible();
      await expect(modal.locator("textarea")).toHaveValue(
        "Stomach Acidity / Gas, Fatty Liver & Heat"
      );

      // Close modal
      const closeButton = modal.getByRole("button", { name: /Close modal/i });
      await closeButton.click();
      await expect(modal).toBeHidden();
    });

    test("Full modal flow: Step 2 channel switch to In-Person Karachi Clinic Visit appointment booking", async ({
      page,
    }) => {
      // Live clinic availability hits the database; allow for cold-start latency.
      test.setTimeout(120000);

      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const section = page.locator("section#specialties");
      await section.scrollIntoViewIfNeeded();

      // Let client hydration attach the controlled input handlers before
      // typing/clicking; otherwise early interactions are reset by React.
      await page.waitForTimeout(1500);
      const card = section.locator(".bg-white.rounded-3xl.border");
      const input = card.locator("input[placeholder*='Describe your symptoms']");
      await expect(input).toBeVisible();

      const jointChip = card.locator("button", {
        hasText: "Joint & Knee Pain",
      });
      await expect(jointChip).toBeVisible();
      await jointChip.click();
      await expect(input).toHaveValue("Joint & Knee Pain");

      const consultButton = card.getByRole("button", {
        name: /Consult Hakeem Sahib/i,
      });
      await consultButton.click();

      const modal = page.getByRole("dialog", {
        name: /Consult Hakeem Tahir Hameed/i,
      });
      await expect(modal).toBeVisible();

      // Continue to Step 2
      const continueButton = modal.getByRole("button", {
        name: /Continue to Choose Channel/i,
      });
      await continueButton.click();

      // In Step 2: Switch to "In-Person Visit" (Karachi Matab)
      const clinicCard = modal.locator("button", {
        hasText: "In-Person Visit",
      });
      await expect(clinicCard).toBeVisible();
      await expect(clinicCard.getByText("Karachi Matab")).toBeVisible();

      // Click to select Karachi Clinic Visit, then continue to Step 3
      await clinicCard.click();

      const continueToClinic = modal.getByRole("button", {
        name: /Continue to Clinic Reservation/i,
      });
      await expect(continueToClinic).toBeVisible();
      await continueToClinic.click();

      // Assert appointment reservation form is displayed
      await expect(modal.getByText("Step 3 of 3").first()).toBeVisible();
      await expect(modal.getByText("Patient Name")).toBeVisible();
      await expect(modal.getByText("Email Address")).toBeVisible();
      await expect(modal.getByText("WhatsApp / Phone")).toBeVisible();
      await expect(modal.getByText("Appointment Date")).toBeVisible();
      await expect(modal.getByText("Time Slot")).toBeVisible();

      // Verify physical clinic location note
      await expect(
        modal.getByText(
          /Matab Tameer-e-Sehat · Plot L-41 Korangi Crossing Rd, Karachi/i
        )
      ).toBeVisible();

      // Fill appointment fields
      const nameInput = modal.locator("input[placeholder*='Tahir Hameed']");
      await expect(nameInput).toBeVisible();
      await nameInput.fill("Muhammad Farooq");

      const emailInput = modal.locator("input[placeholder*='you@example.com']");
      await expect(emailInput).toBeVisible();
      await emailInput.fill("farooq@example.com");

      const phoneInput = modal.locator("input[placeholder*='0300-1234567']");
      await expect(phoneInput).toBeVisible();
      await phoneInput.fill("0300-9876543");

      // Pick the next non-Sunday date, then the first available slot
      const nextOpenDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        while (d.getDay() === 0) d.setDate(d.getDate() + 1);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      })();

      const dateInput = modal.locator('input[type="date"]');
      await expect(dateInput).toBeVisible();
      await dateInput.fill(nextOpenDate);

      const slotSelect = modal.locator("select").first();
      await expect(slotSelect).toBeEnabled({ timeout: 60000 });

      const firstAvailableSlot = await slotSelect
        .locator("option:not([disabled])")
        .evaluateAll((options) => {
          const usable = options.find(
            (option) => (option as HTMLOptionElement).value !== ""
          );
          return usable ? (usable as HTMLOptionElement).value : "";
        });
      expect(firstAvailableSlot).not.toBe("");
      await slotSelect.selectOption(firstAvailableSlot);

      // Verify "Request Clinic Appointment" submit button is visible and active
      const confirmButton = modal.getByRole("button", {
        name: /Request Clinic Appointment/i,
      });
      await expect(confirmButton).toBeVisible();
      await expect(confirmButton).toBeEnabled();

      // Close modal
      const closeButton = modal.getByRole("button", { name: /Close modal/i });
      await closeButton.click();
      await expect(modal).toBeHidden();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE VIEWPORT (390 x 844) - iPhone 12/13/14 class
  // ═══════════════════════════════════════════════════════════════════════════
  test.describe("Mobile Viewport (390 x 844)", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("Section 2 card and modal are fully accessible, responsive, and operational on mobile", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const section = page.locator("section#specialties");
      await section.scrollIntoViewIfNeeded();

      // Let client hydration attach the controlled input handlers before
      // typing/clicking; otherwise early interactions are reset by React.
      await page.waitForTimeout(1500);
      await expect(section).toBeVisible();

      // Card renders cleanly within mobile viewport
      const card = section.locator(".bg-white.rounded-3xl.border");
      await expect(card).toBeVisible();

      // Tap quick symptom chip on mobile
      const chip = card.locator("button", {
        hasText: "Hair Fall & Scalp",
      });
      await expect(chip).toBeVisible();
      await chip.click();
      const input = card.locator("input[placeholder*='Describe your symptoms']");

      await expect(input).toHaveValue("Hair Fall & Scalp");

      // Tap "Consult Hakeem Sahib"
      const consultButton = card.getByRole("button", {
        name: /Consult Hakeem Sahib/i,
      });
      await consultButton.click();

      // Modal appears
      const modal = page.getByRole("dialog", {
        name: /Consult Hakeem Tahir Hameed/i,
      });
      await expect(modal).toBeVisible();

      // Verify pre-filled symptom in textarea
      const textarea = modal.locator("textarea");
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveValue("Hair Fall & Scalp");

      // Advance to Step 2
      const continueButton = modal.getByRole("button", {
        name: /Continue to Choose Channel/i,
      });
      await continueButton.click();

      // Channel selector is visible on mobile
      const whatsappCard = modal.locator("button", {
        hasText: "Instant WhatsApp",
      });
      const clinicCard = modal.locator("button", {
        hasText: "In-Person Visit",
      });

      await expect(whatsappCard).toBeVisible();
      await expect(clinicCard).toBeVisible();

      // Verify WhatsApp launch CTA is visible
      const whatsappLaunchButton = modal.getByRole("button", {
        name: /Start WhatsApp Consultation/i,
      });
      await expect(whatsappLaunchButton).toBeVisible();

      // Close modal on mobile
      const closeButton = modal.getByRole("button", { name: /Close modal/i });
      await closeButton.click();
      await expect(modal).toBeHidden();
    });
  });
});
