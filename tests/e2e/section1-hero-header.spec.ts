import { test, expect } from "@playwright/test";

test.describe("Section 1: Hero & Header Viewport Verification", () => {
  test.describe("Mobile Viewport (390 x 844)", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("Hero section container takes full viewport height", async ({ page }) => {
      await page.goto("/");

      const hero = page.locator("#hero");
      await expect(hero).toBeVisible();

      // Verify the hero section has the Tailwind min-h class for mobile viewport height
      const className = await hero.getAttribute("class");
      expect(className).toContain("min-h-[calc(100dvh-3.5rem)]");

      // Verify computed bounding box height is close to viewport height (844px minus header height)
      const box = await hero.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        // At 844 viewport height, 100dvh - 3.5rem (56px) is approximately 788px.
        // We assert height is close to viewport (>= 720px and <= 860px)
        expect(box.height).toBeGreaterThanOrEqual(720);
        expect(box.height).toBeLessThanOrEqual(860);
      }
    });

    test("Brand logo in header renders properly with Botanical Emblem SVG", async ({ page }) => {
      await page.goto("/");

      const header = page.locator("header");
      await expect(header).toBeVisible();

      // Brand link inside header
      const brandLink = header.locator('a[aria-label="Tameer-e-Sehat Home"]');
      await expect(brandLink).toBeVisible();

      // On mobile viewport (< 640px), the mobile logo variant (.sm:hidden) is active and visible
      const mobileLogo = brandLink.locator(".sm\\:hidden");
      await expect(mobileLogo).toBeVisible();

      // Botanical Emblem SVG inside the active mobile brand logo
      const emblemSvg = mobileLogo.locator('svg[viewBox="0 0 48 48"]');
      await expect(emblemSvg).toBeVisible();

      // Verify emblem SVG contains defs for goldRing and emeraldBg gradients
      const hasGoldRing = await emblemSvg.locator("linearGradient#goldRing").count();
      const hasEmeraldBg = await emblemSvg.locator("linearGradient#emeraldBg").count();
      expect(hasGoldRing).toBeGreaterThanOrEqual(1);
      expect(hasEmeraldBg).toBeGreaterThanOrEqual(1);

      // Verify the SVG paths/circles exist
      const pathCount = await emblemSvg.locator("path").count();
      expect(pathCount).toBeGreaterThanOrEqual(4);

      // Verify brand title text is visible in mobile header
      const brandText = mobileLogo.locator("text=Tameer-e-Sehat");
      await expect(brandText).toBeVisible();
    });

    test("WhatsApp floating button (WhatsAppFloat) is hidden/not visible on mobile", async ({ page }) => {
      await page.goto("/");

      // WhatsApp floating button has aria-label for Chat with Hakeem / Tameer-e-Sehat on WhatsApp
      const whatsappFloat = page.locator('a[aria-label="Chat with Hakeem / Tameer-e-Sehat on WhatsApp"]');

      // Assert WhatsApp floating button is hidden (via hidden md:flex)
      await expect(whatsappFloat).toBeHidden();

      // Also confirm via computed style display === 'none'
      const isDisplayNone = await whatsappFloat.evaluate((el) => {
        return window.getComputedStyle(el).display === "none";
      });
      expect(isDisplayNone).toBe(true);
    });
  });

  test.describe("Desktop Viewport (1280 x 800)", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("Hero section renders left and right columns properly", async ({ page }) => {
      await page.goto("/");

      const hero = page.locator("#hero");
      await expect(hero).toBeVisible();

      // Left Column (lg:col-span-7): Headline, value prop, and CTAs
      const leftCol = hero.locator(".lg\\:col-span-7");
      await expect(leftCol).toBeVisible();

      const mainHeadline = leftCol.locator("h1");
      await expect(mainHeadline).toBeVisible();
      await expect(mainHeadline).toContainText("Heal Naturally with a Trusted Hakeem");

      const consultButton = leftCol.locator("button", { hasText: "Consult Hakeem Sahib" });
      await expect(consultButton).toBeVisible();

      const browseLink = leftCol.locator('a[href="#remedies"]', { hasText: "Browse Remedies" });
      await expect(browseLink).toBeVisible();

      // Right Column (hidden lg:block lg:col-span-5): Editorial visual image and proof badge
      const rightCol = hero.locator(".lg\\:col-span-5");
      await expect(rightCol).toBeVisible();

      const heroImage = rightCol.locator('img[alt*="Tameer-e-Sehat Classical Unani"]');
      await expect(heroImage).toBeVisible();

      const proofBadge = rightCol.locator("text=Zero Steroids · 100% Herbal");
      await expect(proofBadge).toBeVisible();
    });

    test("WhatsApp floating button IS visible on desktop", async ({ page }) => {
      await page.goto("/");

      const whatsappFloat = page.locator('a[aria-label="Chat with Hakeem / Tameer-e-Sehat on WhatsApp"]');

      // Assert WhatsApp floating button is visible on desktop
      await expect(whatsappFloat).toBeVisible();

      // Assert it has proper WhatsApp link
      const href = await whatsappFloat.getAttribute("href");
      expect(href).toContain("https://wa.me/");

      // Assert button text content
      await expect(whatsappFloat).toContainText("Online Hakeem");
      await expect(whatsappFloat).toContainText("Chat on WhatsApp");
    });
  });
});
