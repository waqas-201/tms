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
        name: /Consult Hakim Sahib/i,
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

      // Click "Consult Hakim Sahib"
      const consultButton = card.getByRole("button", {
        name: /Consult Hakim Sahib/i,
      });
      await consultButton.click();

      // Assert universal ConsultationModal opens
      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
      });
      await expect(modal).toBeVisible();

      // Assert Modal Header credentials
      await expect(
        modal.getByRole("heading", { name: /Consult Hakim Muhammad Tariq/i })
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

      // Click "Consult Hakim Sahib"
      const consultButton = card.getByRole("button", {
        name: /Consult Hakim Sahib/i,
      });
      await consultButton.click();

      // Verify universal ConsultationModal opens
      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
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
        name: /Consult Hakim Sahib/i,
      });
      await consultButton.click();

      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
      });
      await expect(modal).toBeVisible();

      // Verify Step 1 indicator is active
      const step1Tab = modal.getByRole("button", {
        name: /Symptoms & History/i,
      });
      await expect(step1Tab).toBeVisible();

      // Verify Step 1 features: Voice record button, Attach report button, Quick tags
      await expect(
        modal.getByRole("button", { name: /Record Voice/i })
      ).toBeVisible();
      await expect(
        modal.getByRole("button", { name: /Attach Report/i })
      ).toBeVisible();

      // Verify quick symptom tags inside modal
      const modalChip = modal.locator("button", {
        hasText: "Fatty Liver / Body Heat",
      });
      await expect(modalChip).toBeVisible();
      await modalChip.click();

      const textarea = modal.locator("textarea");
      await expect(textarea).toHaveValue(
        "Stomach Acidity / Gas, Fatty Liver / Body Heat"
      );

      // Advance from Step 1 to Step 2 using "Continue to Next Step"
      const continueButton = modal.getByRole("button", {
        name: /Continue to Next Step/i,
      });
      await expect(continueButton).toBeVisible();
      await continueButton.click();

      // ── Step 2 Assertions ──
      // Verify Step 2 is active
      await expect(modal.getByText("Choose Consultation Channel:")).toBeVisible();
      await expect(modal.getByText("Your Clinical Symptoms:")).toBeVisible();
      await expect(
        modal.getByText("Stomach Acidity / Gas, Fatty Liver / Body Heat")
      ).toBeVisible();

      // Verify WhatsApp channel card option is selected by default
      const whatsappCard = modal.locator("button", {
        hasText: "Instant WhatsApp",
      });
      await expect(whatsappCard).toBeVisible();
      await expect(whatsappCard.getByText("Recommended")).toBeVisible();

      // Verify WhatsApp 1-click launch banner and primary CTA
      await expect(
        modal.getByText("✓ 1-Click WhatsApp Direct Launch")
      ).toBeVisible();

      const whatsappLaunchLink = modal.locator("a", {
        hasText: /Launch WhatsApp Consultation/i,
      });
      await expect(whatsappLaunchLink).toBeVisible();

      // Assert WhatsApp URL format and payload encoding
      const href = await whatsappLaunchLink.getAttribute("href");
      expect(href).not.toBeNull();
      expect(href).toContain("https://wa.me/");
      expect(href).toContain(encodeURIComponent("Stomach Acidity / Gas"));

      // Verify "Back to Step 1" button works properly
      const backButton = modal.getByRole("button", {
        name: /Back to Step 1 \(Edit Symptoms\)/i,
      });
      await expect(backButton).toBeVisible();
      await backButton.click();

      // Assert we are back in Step 1 with preserved symptoms
      await expect(modal.locator("textarea")).toBeVisible();
      await expect(modal.locator("textarea")).toHaveValue(
        "Stomach Acidity / Gas, Fatty Liver / Body Heat"
      );

      // Close modal
      const closeButton = modal.getByRole("button", { name: /Close modal/i });
      await closeButton.click();
      await expect(modal).toBeHidden();
    });

    test("Full modal flow: Step 2 channel switch to In-Person Karachi Clinic Visit appointment booking", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const section = page.locator("section#specialties");
      await section.scrollIntoViewIfNeeded();
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
        name: /Consult Hakim Sahib/i,
      });
      await consultButton.click();

      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
      });
      await expect(modal).toBeVisible();

      // Continue to Step 2
      const continueButton = modal.getByRole("button", {
        name: /Continue to Next Step/i,
      });
      await continueButton.click();

      // In Step 2: Switch to "In-Person Visit" (Karachi Matab)
      const clinicCard = modal.locator("button", {
        hasText: "In-Person Visit",
      });
      await expect(clinicCard).toBeVisible();
      await expect(clinicCard.getByText("Karachi Matab")).toBeVisible();

      // Click to select Karachi Clinic Visit
      await clinicCard.click();

      // Assert appointment reservation form is displayed
      await expect(modal.getByText("Patient Name")).toBeVisible();
      await expect(modal.getByText("WhatsApp / Phone")).toBeVisible();
      await expect(modal.getByText("Preferred Day")).toBeVisible();
      await expect(modal.getByText("Time Slot")).toBeVisible();

      // Verify physical clinic location note
      await expect(
        modal.getByText(/Korangi Crossing Rd, Karachi · Pulse diagnosis \(Nabz\) on-site\./i)
      ).toBeVisible();

      // Fill appointment fields
      const nameInput = modal.locator("input[placeholder*='Tariq Mehmood']");
      await expect(nameInput).toBeVisible();
      await nameInput.fill("Muhammad Farooq");

      const phoneInput = modal.locator("input[placeholder*='0300-1234567']");
      await expect(phoneInput).toBeVisible();
      await phoneInput.fill("0300-9876543");

      // Verify day and slot selects
      const selects = modal.locator("select");
      await expect(selects).toHaveCount(2);

      // Select 'Tomorrow' and 'Evening' slot
      await selects.nth(0).selectOption("Tomorrow");
      await selects.nth(1).selectOption("Evening (05:00 PM - 09:00 PM)");

      // Verify "Confirm Clinic Reservation" submit button is visible and active
      const confirmButton = modal.getByRole("button", {
        name: /Confirm Clinic Reservation/i,
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

      // Tap "Consult Hakim Sahib"
      const consultButton = card.getByRole("button", {
        name: /Consult Hakim Sahib/i,
      });
      await consultButton.click();

      // Modal appears
      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
      });
      await expect(modal).toBeVisible();

      // Verify pre-filled symptom in textarea
      const textarea = modal.locator("textarea");
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveValue("Hair Fall & Scalp");

      // Advance to Step 2
      const continueButton = modal.getByRole("button", {
        name: /Continue to Next Step/i,
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

      // Verify WhatsApp launch CTA is clickable
      const whatsappLaunchLink = modal.locator("a", {
        hasText: /Launch WhatsApp Consultation/i,
      });
      await expect(whatsappLaunchLink).toBeVisible();

      // Close modal on mobile
      const closeButton = modal.getByRole("button", { name: /Close modal/i });
      await closeButton.click();
      await expect(modal).toBeHidden();
    });
  });
});
