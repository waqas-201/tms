import { test, expect } from "@playwright/test";

test.describe("E2E Full-Page Flow - Sections 3 to 6 & Responsive Verification", () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // DESKTOP SUITE (1280px)
  // ═══════════════════════════════════════════════════════════════════════════
  test.describe("Desktop Viewport (1280px)", () => {
    test.use({ viewport: { width: 1280, height: 900 } });

    test("Section 3: Physician-Formulated Remedies renders, category tabs work, remedies cards display pricing and details", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const remediesSection = page.locator("section#remedies");
      await remediesSection.scrollIntoViewIfNeeded();
      await expect(remediesSection).toBeVisible({ timeout: 10000 });

      // Heading and badge verification
      await expect(
        remediesSection.getByRole("heading", {
          name: /Physician-Formulated Remedies/i,
        })
      ).toBeVisible();
      await expect(remediesSection.getByText(/Apothecary Dispensary/i)).toBeVisible();

      // Category filter tabs exist
      const allFormulationsTab = remediesSection.getByRole("button", {
        name: /All Formulations/i,
      });
      await expect(allFormulationsTab).toBeVisible();

      // Wait for product cards to load from live API
      const addButtons = remediesSection.getByRole("button", { name: /Add/i });
      await expect(addButtons.first()).toBeVisible({ timeout: 15000 });

      // Remedies cards display pricing in PKR and title details
      const priceElement = remediesSection.getByText(/₨\s*[\d,]+/).first();
      await expect(priceElement).toBeVisible();

      const productHeadings = remediesSection.getByRole("heading", { level: 3 });
      await expect(productHeadings.first()).toBeVisible();

      // Category tabs switching
      const otherCategoryTabs = remediesSection
        .locator("button[type='button']")
        .filter({
          hasNotText: /All Formulations|Consult for Custom Formulation|Add/i,
        });

      const tabCount = await otherCategoryTabs.count();
      if (tabCount > 0) {
        const firstCategoryTab = otherCategoryTabs.first();
        await firstCategoryTab.click();
        await page.waitForTimeout(300);

        // Click back to All Formulations
        await allFormulationsTab.click();
        await page.waitForTimeout(300);
        await expect(addButtons.first()).toBeVisible();
      }

      // Universal Consultation Modal trigger from custom formulation strip
      const customFormulationBtn = remediesSection.getByRole("button", {
        name: /Consult for Custom Formulation/i,
      });
      await expect(customFormulationBtn).toBeVisible();
      await customFormulationBtn.click();

      // Assert modal opens uniquely
      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
      });
      await expect(modal).toBeVisible({ timeout: 10000 });
      await expect(
        modal.getByRole("heading", { name: /Consult Hakim Muhammad Tariq/i })
      ).toBeVisible();

      // Close modal
      const closeButton = modal.getByRole("button", { name: /Close modal/i });
      await closeButton.click();
      await expect(modal).not.toBeVisible();
    });

    test("Section 4: Hakim Authority & physical Karachi clinic visit displays credentials and clinic appointment CTA", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const authoritySection = page.locator("section#hakim-authority");
      await authoritySection.scrollIntoViewIfNeeded();
      await expect(authoritySection).toBeVisible({ timeout: 10000 });

      // Assert credentials and clinical lineage
      await expect(
        authoritySection.getByRole("heading", {
          name: /Authentic Eastern Healing, Rooted in Pure Herbs/i,
        })
      ).toBeVisible();

      // Hakim portrait / title and clinical metrics
      await expect(authoritySection.getByText(/Hakim Muhammad Tariq/i).first()).toBeVisible();
      await expect(authoritySection.getByText("35+").first()).toBeVisible();
      await expect(authoritySection.getByText(/Years Clinical Experience/i)).toBeVisible();
      await expect(authoritySection.getByText("150K+")).toBeVisible();
      await expect(authoritySection.getByText("100%")).toBeVisible();
      await expect(authoritySection.getByText("0%")).toBeVisible();

      // Assert Physical Karachi Clinic Visit details
      await expect(
        authoritySection.getByText(/Visit Our Clinic for Pulse Diagnosis/i)
      ).toBeVisible();
      await expect(authoritySection.getByText(/Korangi/i).first()).toBeVisible();
      await expect(authoritySection.getByText(/Visiting Hours/i)).toBeVisible();

      // Verify Clinic Booking CTA triggers modal
      const bookClinicButton = authoritySection.getByRole("button", {
        name: /Select Clinic Slot & Book/i,
      });
      await bookClinicButton.scrollIntoViewIfNeeded();
      await expect(bookClinicButton).toBeVisible();
      await bookClinicButton.click();

      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
      });
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Advance to Step 2 to verify channel is In-Person Visit
      const continueBtn = modal.getByRole("button", { name: /Continue to Next Step/i });
      await continueBtn.click();

      // Assert In-Person Visit / Karachi Matab channel
      await expect(modal.getByRole("button", { name: /In-Person Visit/i })).toBeVisible();
      await expect(modal.getByText(/Karachi Matab/i)).toBeVisible();

      // Close modal
      const closeBtn = modal.getByRole("button", { name: /Close modal/i });
      await closeBtn.click();
      await expect(modal).not.toBeVisible();
    });

    test("Section 5: Community Reviews display 5.0 Google rating and patient stories", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const reviewsSection = page.locator("section#community-reviews");
      await reviewsSection.scrollIntoViewIfNeeded();
      await expect(reviewsSection).toBeVisible({ timeout: 10000 });

      // Verify heading and 5.0 rating card
      await expect(
        reviewsSection.getByRole("heading", { name: /Authentic Patient Reviews/i })
      ).toBeVisible();

      // Official Google rating indicator 5.0
      await expect(reviewsSection.getByText("5.0").first()).toBeVisible();
      await expect(reviewsSection.getByText(/Verified Google/i).first()).toBeVisible();

      // Verify Google external links exist
      const googleMapsLink = reviewsSection.getByRole("link", { name: /View Google Maps/i });
      await googleMapsLink.scrollIntoViewIfNeeded();
      await expect(googleMapsLink).toBeVisible();
      const href = await googleMapsLink.getAttribute("href");
      expect(href).toContain("google.com/maps");

      const writeReviewLink = reviewsSection.getByRole("link", { name: /Write Google Review/i });
      await expect(writeReviewLink).toBeVisible();
    });

    test("Section 6: Bottom consultation banner triggers the universal modal with correct mode", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const consultBanner = page.locator("section#whatsapp-consult");
      await consultBanner.scrollIntoViewIfNeeded();
      await expect(consultBanner).toBeVisible({ timeout: 10000 });

      // Banner Heading
      await expect(
        consultBanner.getByRole("heading", {
          name: /Direct Consultation with Hakim Muhammad Tariq/i,
        })
      ).toBeVisible();

      // 1. WhatsApp Action Trigger
      const whatsappButton = consultBanner.getByRole("button", {
        name: /Consult via WhatsApp \/ Voice/i,
      });
      await expect(whatsappButton).toBeVisible();
      await whatsappButton.click();

      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
      });
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Advance to step 2 to check default channel is WhatsApp
      const continueBtn = modal.getByRole("button", { name: /Continue to Next Step/i });
      await continueBtn.click();

      await expect(
        modal.getByRole("link", { name: /Launch WhatsApp Consultation/i })
      ).toBeVisible();

      // Close modal
      const closeBtn = modal.getByRole("button", { name: /Close modal/i });
      await closeBtn.click();
      await expect(modal).not.toBeVisible();

      // 2. Physical Clinic Action Trigger
      const physicalButton = consultBanner.getByRole("button", {
        name: /Book Karachi Clinic Visit/i,
      });
      await physicalButton.scrollIntoViewIfNeeded();
      await expect(physicalButton).toBeVisible();
      await physicalButton.click();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Advance to step 2
      const continueBtn2 = modal.getByRole("button", { name: /Continue to Next Step/i });
      await continueBtn2.click();

      // Verify In-Person / Karachi Clinic Visit form is displayed
      await expect(modal.getByRole("button", { name: /In-Person Visit/i })).toBeVisible();
      await expect(
        modal.getByRole("button", { name: /Confirm Clinic Reservation/i })
      ).toBeVisible();

      await closeBtn.click();
      await expect(modal).not.toBeVisible();
    });

    test("Desktop Layout: Zero horizontal overflow across full page (1280px)", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);

      // Verify page document width matches viewport with zero horizontal overflow
      const overflowDetails = await page.evaluate(() => {
        const docWidth = Math.ceil(document.documentElement.scrollWidth);
        const winWidth = window.innerWidth;
        const bodyWidth = Math.ceil(document.body.scrollWidth);
        return {
          docWidth,
          winWidth,
          bodyWidth,
          hasOverflow: docWidth > winWidth,
        };
      });

      expect(overflowDetails.docWidth).toBeLessThanOrEqual(overflowDetails.winWidth);
      expect(overflowDetails.hasOverflow).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE SUITE (390px - e.g. iPhone 12/13/14)
  // ═══════════════════════════════════════════════════════════════════════════
  test.describe("Mobile Viewport (390px)", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("Mobile Layout: Zero horizontal overflow and responsive section rendering (390px)", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);

      // Verify page has zero horizontal scrollbar/overflow
      const overflowDetails = await page.evaluate(() => {
        const docWidth = Math.ceil(document.documentElement.scrollWidth);
        const winWidth = window.innerWidth;
        const bodyWidth = Math.ceil(document.body.scrollWidth);
        return {
          docWidth,
          winWidth,
          bodyWidth,
          hasOverflow: docWidth > winWidth,
        };
      });

      expect(overflowDetails.docWidth).toBeLessThanOrEqual(overflowDetails.winWidth);
      expect(overflowDetails.hasOverflow).toBe(false);

      // Verify Sections 3-6 render cleanly on mobile
      const remediesSection = page.locator("section#remedies");
      await remediesSection.scrollIntoViewIfNeeded();
      await expect(remediesSection).toBeVisible();

      const authoritySection = page.locator("section#hakim-authority");
      await authoritySection.scrollIntoViewIfNeeded();
      await expect(authoritySection).toBeVisible();

      const reviewsSection = page.locator("section#community-reviews");
      await reviewsSection.scrollIntoViewIfNeeded();
      await expect(reviewsSection).toBeVisible();

      const consultBanner = page.locator("section#whatsapp-consult");
      await consultBanner.scrollIntoViewIfNeeded();
      await expect(consultBanner).toBeVisible();

      // Mobile modal interaction check
      const mobileWhatsappBtn = consultBanner.getByRole("button", {
        name: /Consult via WhatsApp \/ Voice/i,
      });
      await mobileWhatsappBtn.scrollIntoViewIfNeeded();
      await expect(mobileWhatsappBtn).toBeVisible();
      await mobileWhatsappBtn.click();

      const modal = page.getByRole("dialog", {
        name: /Consult Hakim Muhammad Tariq/i,
      });
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Verify modal fits cleanly within mobile viewport
      const modalBox = await modal.boundingBox();
      if (modalBox) {
        expect(modalBox.width).toBeLessThanOrEqual(390);
      }

      const closeBtn = modal.getByRole("button", { name: /Close modal/i });
      await closeBtn.click();
      await expect(modal).not.toBeVisible();
    });
  });
});
