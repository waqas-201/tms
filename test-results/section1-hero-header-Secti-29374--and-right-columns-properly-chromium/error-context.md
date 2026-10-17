# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section1-hero-header.spec.ts >> Section 1: Hero & Header Viewport Verification >> Desktop Viewport (1280 x 800) >> Hero section renders left and right columns properly
- Location: tests\e2e\section1-hero-header.spec.ts:81:9

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#hero').locator('.lg\\:col-span-7').locator('h1')
Expected substring: "Heal Naturally with a Trusted Hakim"
Received string:    "Classical Unani Healing & Botanical Care"
Timeout: 10000ms

Call log:
  - Expect "toContainText" locator('#hero').locator('.lg\\:col-span-7').locator('h1') with timeout 10000ms
  - waiting for locator('#hero').locator('.lg\\:col-span-7').locator('h1')
    23 × locator resolved to <h1 class="font-serif text-2xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-bold text-[#22623a] leading-[1.15] sm:leading-[1.18] tracking-tight">Classical Unani Healing & Botanical Care</h1>
       - unexpected value "Classical Unani Healing & Botanical Care"

```

```yaml
- heading "Classical Unani Healing & Botanical Care" [level=1]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Section 1: Hero & Header Viewport Verification", () => {
  4   |   test.describe("Mobile Viewport (390 x 844)", () => {
  5   |     test.use({ viewport: { width: 390, height: 844 } });
  6   | 
  7   |     test("Hero section container takes full viewport height", async ({ page }) => {
  8   |       await page.goto("/");
  9   | 
  10  |       const hero = page.locator("#hero");
  11  |       await expect(hero).toBeVisible();
  12  | 
  13  |       // Verify the hero section has the Tailwind min-h class for mobile viewport height
  14  |       const className = await hero.getAttribute("class");
  15  |       expect(className).toContain("min-h-[calc(100dvh-3.5rem)]");
  16  | 
  17  |       // Verify computed bounding box height is close to viewport height (844px minus header height)
  18  |       const box = await hero.boundingBox();
  19  |       expect(box).not.toBeNull();
  20  |       if (box) {
  21  |         // At 844 viewport height, 100dvh - 3.5rem (56px) is approximately 788px.
  22  |         // We assert height is close to viewport (>= 720px and <= 860px)
  23  |         expect(box.height).toBeGreaterThanOrEqual(720);
  24  |         expect(box.height).toBeLessThanOrEqual(860);
  25  |       }
  26  |     });
  27  | 
  28  |     test("Brand logo in header renders properly with Botanical Emblem SVG", async ({ page }) => {
  29  |       await page.goto("/");
  30  | 
  31  |       const header = page.locator("header");
  32  |       await expect(header).toBeVisible();
  33  | 
  34  |       // Brand link inside header
  35  |       const brandLink = header.locator('a[aria-label="Tameer-e-Sehat Home"]');
  36  |       await expect(brandLink).toBeVisible();
  37  | 
  38  |       // On mobile viewport (< 640px), the mobile logo variant (.sm:hidden) is active and visible
  39  |       const mobileLogo = brandLink.locator(".sm\\:hidden");
  40  |       await expect(mobileLogo).toBeVisible();
  41  | 
  42  |       // Botanical Emblem SVG inside the active mobile brand logo
  43  |       const emblemSvg = mobileLogo.locator('svg[viewBox="0 0 48 48"]');
  44  |       await expect(emblemSvg).toBeVisible();
  45  | 
  46  |       // Verify emblem SVG contains defs for goldRing and emeraldBg gradients
  47  |       const hasGoldRing = await emblemSvg.locator("linearGradient#goldRing").count();
  48  |       const hasEmeraldBg = await emblemSvg.locator("linearGradient#emeraldBg").count();
  49  |       expect(hasGoldRing).toBeGreaterThanOrEqual(1);
  50  |       expect(hasEmeraldBg).toBeGreaterThanOrEqual(1);
  51  | 
  52  |       // Verify the SVG paths/circles exist
  53  |       const pathCount = await emblemSvg.locator("path").count();
  54  |       expect(pathCount).toBeGreaterThanOrEqual(4);
  55  | 
  56  |       // Verify brand title text is visible in mobile header
  57  |       const brandText = mobileLogo.locator("text=Tameer-e-Sehat");
  58  |       await expect(brandText).toBeVisible();
  59  |     });
  60  | 
  61  |     test("WhatsApp floating button (WhatsAppFloat) is hidden/not visible on mobile", async ({ page }) => {
  62  |       await page.goto("/");
  63  | 
  64  |       // WhatsApp floating button has aria-label for Chat with Hakim / Tameer-e-Sehat on WhatsApp
  65  |       const whatsappFloat = page.locator('a[aria-label="Chat with Hakim / Tameer-e-Sehat on WhatsApp"]');
  66  | 
  67  |       // Assert WhatsApp floating button is hidden (via hidden md:flex)
  68  |       await expect(whatsappFloat).toBeHidden();
  69  | 
  70  |       // Also confirm via computed style display === 'none'
  71  |       const isDisplayNone = await whatsappFloat.evaluate((el) => {
  72  |         return window.getComputedStyle(el).display === "none";
  73  |       });
  74  |       expect(isDisplayNone).toBe(true);
  75  |     });
  76  |   });
  77  | 
  78  |   test.describe("Desktop Viewport (1280 x 800)", () => {
  79  |     test.use({ viewport: { width: 1280, height: 800 } });
  80  | 
  81  |     test("Hero section renders left and right columns properly", async ({ page }) => {
  82  |       await page.goto("/");
  83  | 
  84  |       const hero = page.locator("#hero");
  85  |       await expect(hero).toBeVisible();
  86  | 
  87  |       // Left Column (lg:col-span-7): Headline, value prop, and CTAs
  88  |       const leftCol = hero.locator(".lg\\:col-span-7");
  89  |       await expect(leftCol).toBeVisible();
  90  | 
  91  |       const mainHeadline = leftCol.locator("h1");
  92  |       await expect(mainHeadline).toBeVisible();
> 93  |       await expect(mainHeadline).toContainText("Heal Naturally with a Trusted Hakim");
      |                                  ^ Error: expect(locator).toContainText(expected) failed
  94  | 
  95  |       const consultButton = leftCol.locator("button", { hasText: "Consult Hakim Sahib" });
  96  |       await expect(consultButton).toBeVisible();
  97  | 
  98  |       const browseLink = leftCol.locator('a[href="#remedies"]', { hasText: "Browse Remedies" });
  99  |       await expect(browseLink).toBeVisible();
  100 | 
  101 |       // Right Column (hidden lg:block lg:col-span-5): Editorial visual image and proof badge
  102 |       const rightCol = hero.locator(".lg\\:col-span-5");
  103 |       await expect(rightCol).toBeVisible();
  104 | 
  105 |       const heroImage = rightCol.locator('img[alt*="Tameer-e-Sehat Classical Unani"]');
  106 |       await expect(heroImage).toBeVisible();
  107 | 
  108 |       const proofBadge = rightCol.locator("text=Zero Steroids · 100% Herbal");
  109 |       await expect(proofBadge).toBeVisible();
  110 |     });
  111 | 
  112 |     test("WhatsApp floating button IS visible on desktop", async ({ page }) => {
  113 |       await page.goto("/");
  114 | 
  115 |       const whatsappFloat = page.locator('a[aria-label="Chat with Hakim / Tameer-e-Sehat on WhatsApp"]');
  116 | 
  117 |       // Assert WhatsApp floating button is visible on desktop
  118 |       await expect(whatsappFloat).toBeVisible();
  119 | 
  120 |       // Assert it has proper WhatsApp link
  121 |       const href = await whatsappFloat.getAttribute("href");
  122 |       expect(href).toContain("https://wa.me/");
  123 | 
  124 |       // Assert button text content
  125 |       await expect(whatsappFloat).toContainText("Online Hakim");
  126 |       await expect(whatsappFloat).toContainText("Chat on WhatsApp");
  127 |     });
  128 |   });
  129 | });
  130 | 
```