# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section1-hero-header.spec.ts >> Section 1: Hero & Header Viewport Verification >> Mobile Viewport (390 x 844) >> Brand logo in header renders properly with Botanical Emblem SVG
- Location: tests\e2e\section1-hero-header.spec.ts:28:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('header').locator('a[aria-label="Tameer-e-Sehat Home"]').locator('.sm\\:hidden').locator('svg[viewBox="0 0 48 48"]')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('header').locator('a[aria-label="Tameer-e-Sehat Home"]').locator('.sm\\:hidden').locator('svg[viewBox="0 0 48 48"]') with timeout 10000ms
  - waiting for locator('header').locator('a[aria-label="Tameer-e-Sehat Home"]').locator('.sm\\:hidden').locator('svg[viewBox="0 0 48 48"]')

```

```yaml
- banner:
  - button "Open menu"
  - link "Tameer-e-Sehat Home":
    - /url: /
    - img "Tameer-e-Sehat Official Logo"
    - text: Tameer-e-Sehat Herbal Clinic & Dispensary
  - button "Search"
  - button "Shopping Cart"
- main:
  - text: Matab Tameer-e-Sehat · Est. 1990
  - heading "Classical Unani Healing & Botanical Care" [level=1]
  - paragraph: Personalized consultations & pure herbal remedies for chronic health.
  - button "Consult Hakim Sahib"
  - link "Browse Remedies":
    - /url: "#remedies"
  - button "🌿 Gastric & Digestion Consult →"
  - button "🦴 Joint & Knee Pain Consult →"
  - button "⚡ Fatty Liver & Heat Consult →"
  - button "🩸 Energy & Vitality Consult →"
  - button "🍯 Herbal Murabba Consult →"
  - button "🛡️ Immunity & Detox Consult →"
  - text: Clinical Scope & Consultation
  - heading "What We Treat with Classical Unani" [level=2]
  - paragraph: We treat the root constitutional imbalance (Mizaj) rather than masking symptoms. Type your symptoms or tap any condition below to initiate direct consultation with Hakim Sahib.
  - textbox "Describe your symptoms (e.g. stomach acidity, joint stiffness, liver heat)..."
  - button "Consult Hakim Sahib"
  - text: "Common conditions (tap to add):"
  - button "Stomach Acidity / Gas"
  - button "Joint & Knee Pain"
  - button "Fatty Liver / Body Heat"
  - button "Vitality & Energy"
  - button "Hair Fall & Scalp"
  - text: 100% Free Initial Assessment · Confidential · Voice & Reports Supported Instant WhatsApp & Karachi Matab Apothecary Dispensary
  - heading "Physician-Formulated Remedies" [level=2]
  - paragraph: Pure hydro-distillates (Arqiyat), fruit preserves (Murabbajaat), and medicinal oils prepared in clean small batches.
  - button "Ask a Hakim"
  - link "View All Remedies":
    - /url: /products
  - paragraph: Loading physician formulations...
  - text: Need a custom dosage or specific formulation prepared for your condition?
  - button "Consult for Custom Formulation →"
  - img "Hakim Muhammad Tariq"
  - text: Est. 1990 · 35+ Yrs Heritage
  - heading "Hakim Muhammad Tariq" [level=3]
  - paragraph: Senior Tibbi Consultant & Master Herbalist · Karachi Matab
  - text: Clinical Lineage & Heritage · Est. 1990
  - heading "Authentic Eastern Healing, Rooted in 35+ Years of Practice" [level=2]
  - paragraph: At Matab Tameer-e-Sehat, we uphold classical Tibb-e-Unani wisdom by identifying your fundamental temperamental imbalance (Mizaj) rather than suppressing symptoms with synthetic compounds. Every formulation is compounded to restore long-term metabolic and organic vitality.
  - strong: "Individualized Temperament Assessment (طبی تشخیص):"
  - text: Remedies formulated specifically according to your age, digestive strength, and dominant Mizaj.
  - strong: "100% Pure Herbs, Zero Steroids (خالص قدرتی اجزاء):"
  - text: Guaranteed pure hydro-distillates (Arqiyat) and raw honey preserves without any steroids, NSAIDs, or synthetic binders.
  - strong: "Direct Clinical Follow-up & Regimen (طبی رہنمائی):"
  - text: Personal guidance on dietary restrictions (Parhez), dosage adjustments, and ongoing recovery check-ins.
  - button "Consult Hakim Sahib"
  - button "Book Clinic Appointment"
  - link "Our 35-Year Story →":
    - /url: /about
  - text: 35+ Years Clinical Practice Serving Karachi Since 1990
  - link "150K+ Patients Consulted & Treated Verified Reviews on Google ↗":
    - /url: https://www.google.com/maps/search/?api=1&query=Matab+Tameer-e-sehat+Plot+no+L+41+Korangi+Crossing+Rd+Karachi
  - text: 100% Pure Botanical Herbal Extracts Small-Batch Hydro-Distillates 0% Steroids, Chemicals or Additives Guaranteed Pure & Non-Habit Forming Physical Dispensary & Matab in Karachi
  - heading "Visit Our Clinic for Pulse Diagnosis (Nabz)" [level=3]
  - paragraph: Prefer an in-person consultation? Visit Hakim Muhammad Tariq at our established Karachi dispensary at Korangi Crossing for on-the-spot pulse examination (Nabz Shanasi) and freshly compounded botanical remedies.
  - text: Clinic Location
  - paragraph: Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi, Karachi, Pakistan
  - paragraph: Near Korangi Crossing Road, Sector 31-B, Karachi.
  - link "Open in Google Maps →":
    - /url: https://www.google.com/maps/search/?api=1&query=Matab+Tameer-e-sehat+Plot+no+L+41+Korangi+Crossing+Rd+Karachi
  - text: Visiting Hours
  - paragraph:
    - strong: "Mon – Sat:"
    - text: "Monday – Saturday: 10:00 AM – 9:00 PM (PKT)"
  - paragraph:
    - strong: "Friday:"
    - text: "Friday: 3:00 PM – 9:00 PM"
  - paragraph: Walk-ins welcome; prior slot advised.
  - text: Convenient access from DHA Phase 7/8, Clifton, Malir, and Korangi Industrial Area. Reserve Consultation
  - heading "Book Clinic Appointment" [level=4]
  - paragraph: Reserve your dedicated time slot with Hakim Muhammad Tariq to receive thorough pulse diagnosis without long waiting lines at our Karachi Matab.
  - button "Select Clinic Slot & Book"
  - link "Direct WhatsApp Booking":
    - /url: https://wa.me/923353547888?text=Assalam-o-Alaikum%20Hakim%20Sahib%2C%20I%20would%20like%20to%20schedule%20an%20in-person%20clinic%20visit%20at%20your%20Korangi%20Crossing%20Matab%20in%20Karachi.
  - 'link "Call Clinic: +92 318 2311310"':
    - /url: tel:0318-2311310
  - text: Verified Google Business Social Proof
  - heading "Authentic Patient Reviews & Recovery Stories" [level=2]
  - paragraph: Real clinical feedback, recovery milestones, and verified Google Business ratings from patients treated in-person at our Karachi matab and through nationwide remote consultations.
  - text: 35+ Years Clinical Lineage 150,000+ Treated Patients 100% Unadulterated Botanicals
  - link "5.0 /5 Matab Tameer-e-sehat Korangi Crossing, Karachi 8+ Verified Patient Reviews ↗":
    - /url: https://www.google.com/maps/search/?api=1&query=Matab+Tameer-e-sehat+Plot+no+L+41+Korangi+Crossing+Rd+Karachi
    - img
    - text: 5.0 /5 Matab Tameer-e-sehat Korangi Crossing, Karachi 8+ Verified Patient Reviews ↗
  - button "All Stories8"
  - button "Digestive & Acidity2"
  - button "Joint & Knee Pain2"
  - button "Fatty Liver & Cooling1"
  - button "Vitality & Stamina1"
  - button "Respiratory & Allergies1"
  - button "Skin & Scalp Health1"
  - text: Swipe cards horizontally
  - button "Scroll reviews left" [disabled]
  - button "Scroll reviews right"
  - text: Syncing live Google profile data... MU
  - heading "Muhammad Usman" [level=4]
  - text: Karachi (Korangi Crossing) 2 months ago
  - img
  - text: "Google Review 5.0 Severe Gastric Acidity & GERD Relief in 3 Weeks Tibbi Protocol: Pure Steam-Distilled Arq Makoh + Arq Kasni & Mizaj Correction"
  - paragraph: “Suffered from chronic acid reflux and burning stomach for over two years, relying on daily antacid pills. Hakim Muhammad Tariq diagnosed acute gastric heat and prescribed cold steam-distilled Arq Makoh and Arq Kasni. Within three weeks, the constant burning ceased completely. Genuine Tibbi healing with zero side effects.”
  - button "Consult for Similar Symptoms"
  - text: Verified Google Review
  - link "View on Google":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: SF
  - heading "Syeda Fatima Rizvi" [level=4]
  - text: Lahore (Gulberg) 1 month ago
  - img
  - text: "Google Review 5.0 Fatty Liver & Sluggish Digestion Marked Relief in 4 Weeks Tibbi Protocol: Hepatic Cooling Arqiyat + Sharbat Bazoori Herbal Protocol"
  - paragraph: “Ordered the steam distillates after an online consultation with Hakim Sahib. The freshness and aromatic potency of the Arqiyat is incomparable to commercial bottled products. My digestion feels remarkably light, morning heaviness is gone, and repeat ultrasound showed visible liver decongestion.”
  - button "Consult for Similar Symptoms"
  - text: Verified Google Review
  - link "View on Google":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: TM
  - heading "Tariq Mehmood" [level=4]
  - text: Rawalpindi (Satellite Town) 3 weeks ago
  - img
  - text: "Google Review 5.0 Knee Cartilage Stiffness & Sciatica Mobility Restored in 14 Days Tibbi Protocol: Tahiri Marham & JointZen Warm Herbal Liniment"
  - paragraph: “At 58 years of age, climbing stairs was agonizing due to severe knee stiffness. Hakim Sahib recommended Tahiri Marham followed by warm herbal oil massage before bed. Within two weeks, the morning stiffness vanished. I can now pray normally without chairs.”
  - button "Consult for Similar Symptoms"
  - text: Verified Google Review
  - link "View on Google":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: ZB
  - heading "Zainab Bibi" [level=4]
  - text: Karachi (Gulshan-e-Iqbal) 3 months ago
  - img
  - text: "Google Review 5.0 Chronic Constipation & Abdominal Bloating Relief in 48 Hours Tibbi Protocol: Artisanal Amaltas Pulp & Safoof Hazim Formulation"
  - paragraph: “Visited the Korangi Crossing matab in person. Hakim Sahib took 20 minutes for a thorough pulse (Nabz) and eye examination. His pure Amaltas formulation gently restored natural gut motility without cramps. Our entire family now relies on Tameer-e-Sehat.”
  - button "Consult for Similar Symptoms"
  - text: Verified Google Review
  - link "View on Google":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: FQ
  - heading "Dr. Farhan Qureshi" [level=4]
  - text: Hyderabad (Sindh) 1 month ago
  - img
  - text: "Google Review 5.0 Post-Viral Bronchial Spasms & Chronic Cough Clear Chest in 5 Days Tibbi Protocol: Classical Joshanda Herbs & Laooq Sapistan Honey Blend"
  - paragraph: “As an allopathic physician, I deeply appreciate authentic Greco-Arab pharmacopeia when unadulterated. My mother had an irritating post-viral bronchial cough that modern antihistamines couldn't calm. Tameer-e-Sehat's fresh Joshanda herbs soothed her chest within 48 hours.”
  - button "Consult for Similar Symptoms"
  - text: Verified Google Review
  - link "View on Google":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: AK
  - heading "Arsalan Khan" [level=4]
  - text: Karachi (Clifton) 4 weeks ago
  - img
  - text: "Google Review 5.0 Executive Burnout & Chronic Fatigue Vigorous Energy in 3 Weeks Tibbi Protocol: Personalized Majoon Mughalliz & Sharbati Badam Tonic"
  - paragraph: “Demanding corporate hours left me feeling chronically fatigued with mental brain fog. Hakim Tariq formulated a personalized dry-fruit Majoon and daily routine. My energy levels, mental focus, and restorative sleep have completely bounced back.”
  - button "Consult for Similar Symptoms"
  - text: Verified Google Review
  - link "View on Google":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: BN
  - heading "Bushra Naveed" [level=4]
  - text: Faisalabad 2 months ago
  - img
  - text: "Google Review 5.0 Excessive Hair Thinning & Scalp Heat Shedding Halted in 3 Weeks Tibbi Protocol: Roghan Baiza Murgh & Herbal Scalp Cleansing Tonic"
  - paragraph: “Tried expensive commercial hair serums with no luck. The pure herbal oils from Tameer-e-Sehat cooled my burning scalp and visibly stopped excessive hair shed within three weeks. Authentic botanical extracts make all the difference.”
  - button "Consult for Similar Symptoms"
  - text: Verified Google Review
  - link "View on Google":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: AG
  - heading "Haji Abdul Ghaffar" [level=4]
  - text: Karachi (Malir) 5 months ago
  - img
  - text: "Google Review 5.0 Lumbar Backache & Stiff Joints Flexibility Restored in 10 Days Tibbi Protocol: Hab-e-Suranjan & Warm Herbal Liniment"
  - paragraph: “I have been coming to Matab Tameer-e-Sehat since the early 1990s. Hakim Muhammad Tariq is one of the few true traditional tabibs remaining in Karachi who compounds medicines with classical purity, patience, and sincere devotion.”
  - button "Consult for Similar Symptoms"
  - text: Verified Google Review
  - link "View on Google":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: 35+ Years of Classical Tibbi Practice · Karachi
  - heading "Have You Consulted with Hakim Muhammad Tariq?" [level=3]
  - paragraph: Whether you visited our Korangi Crossing matab or received pure steam-distillates delivered to your doorstep, your genuine feedback on Google helps others find safe, unadulterated Unani healing.
  - button "Book Free Consultation"
  - button "Visit Karachi Clinic"
  - link "Write Google Review":
    - /url: https://www.google.com/search?q=Matab+Tameer-e-sehat+Karachi#lrd=0x3eb33b7b6c5bb5d1:0x6d1a5cb55bed2dd2,1,,,
  - text: Zero Forms · 100% Free · Bila-Muawza
  - heading "Direct Consultation with Hakim Muhammad Tariq" [level=2]
  - paragraph: No complex clinical paperwork. Send an audio voice memo in Urdu/English or attach medical reports for an authentic Unani evaluation and personalized botanical guidance.
  - text: Voice Notes Welcome 100% Confidential
  - link "+92 318 2311310":
    - /url: tel:0318-2311310
  - button "Consult via WhatsApp / Voice"
  - button "Book Karachi Clinic Visit"
- contentinfo:
  - heading "100% Pure Herbs" [level=4]
  - paragraph: Authentic, clean herbs sourced fresh with zero chemical additives.
  - heading "Experienced Hakim" [level=4]
  - paragraph: Formulated by qualified herbal practitioners with 35+ years of experience.
  - heading "Cash on Delivery" [level=4]
  - paragraph: Fast courier delivery to Karachi, Lahore, Islamabad, and across Pakistan.
  - heading "Private & Confidential" [level=4]
  - paragraph: Friendly, private advice focused on your personal health and symptoms.
  - link "Tameer-e-Sehat Home":
    - /url: /
    - img "Tameer-e-Sehat Official Logo"
    - text: Tameer-e-Sehat Herbal Clinic & Dispensary • Est. 1990
  - paragraph: Established in 1990 in Karachi, Tameer-e-Sehat is a trusted herbal clinic and remedy center. We use pure, natural herbs and time-tested recipes to provide honest, gentle remedies for you and your family.
  - button "Chat on WhatsApp"
  - button "Free Consultation"
  - heading "Navigation" [level=4]
  - list:
    - listitem:
      - link "Home":
        - /url: /
    - listitem:
      - link "Online Consultation":
        - /url: /consultation
    - listitem:
      - link "Clinical Specialties":
        - /url: /specialties
    - listitem:
      - link "Shop Remedies":
        - /url: /products
    - listitem:
      - link "About Clinic":
        - /url: /about
    - listitem:
      - link "Contact & Visit":
        - /url: /contact
    - listitem:
      - link "Track Order (COD)":
        - /url: /track-order
  - heading "Categories" [level=4]
  - list:
    - listitem:
      - link "Herbal Preserves (Murabba)":
        - /url: /products?category=murabbajaat
    - listitem:
      - link "Pure Herbal Waters (Arq)":
        - /url: /products?category=arqiyat
    - listitem:
      - link "Pain Relief Oils & Balms":
        - /url: /products?category=oils-marham
    - listitem:
      - link "Whole Herbs & Seeds":
        - /url: /products?category=herbs-seeds
    - listitem:
      - link "Wellness Teas & Energy Mixes":
        - /url: /products?category=teas-vitality
    - listitem:
      - link "Admin Portal":
        - /url: /admin
  - heading "Clinic & Store" [level=4]
  - text: Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi, Karachi, Pakistan
  - link "View on Google Maps (Matab Tameer-e-sehat) →":
    - /url: https://www.google.com/maps/search/?api=1&query=Matab+Tameer-e-sehat+Plot+no+L+41+Korangi+Crossing+Rd+Karachi
  - link "+92 318 2311310":
    - /url: tel:0318-2311310
  - link "hello@tameeresehat.com":
    - /url: mailto:hello@tameeresehat.com
  - paragraph: "Monday – Saturday: 10:00 AM – 9:00 PM (PKT)"
  - paragraph: "Friday: 3:00 PM – 9:00 PM"
  - button "Book Clinic Visit →"
  - paragraph:
    - strong: "Important Health Notice:"
    - text: Our natural remedies and advice are based on traditional herbal medicine. They are designed to support your daily wellness, digestion, and natural body strength. If you have a severe medical emergency or are pregnant, please consult your doctor. Keep all natural remedies in a cool, dry place away from direct sunlight.
  - paragraph: © 2026 Tameer-e-Sehat. All rights reserved. Registered Herbal Health Clinic, Karachi, Pakistan.
  - link "Consultation Help":
    - /url: /consultation
  - text: ·
  - link "Specialties":
    - /url: /specialties
  - text: ·
  - link "Track Order":
    - /url: /track-order
  - text: ·
  - link "Contact & Support":
    - /url: /contact
  - text: ·
  - link "Sign In":
    - /url: /login
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
> 44  |       await expect(emblemSvg).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
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
  93  |       await expect(mainHeadline).toContainText("Heal Naturally with a Trusted Hakim");
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