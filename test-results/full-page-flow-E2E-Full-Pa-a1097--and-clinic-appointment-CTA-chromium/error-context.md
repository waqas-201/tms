# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-page-flow.spec.ts >> E2E Full-Page Flow - Sections 3 to 6 & Responsive Verification >> Desktop Viewport (1280px) >> Section 4: Hakim Authority & physical Karachi clinic visit displays credentials and clinic appointment CTA
- Location: tests\e2e\full-page-flow.spec.ts:85:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('section#hakim-authority').getByRole('heading', { name: /Authentic Eastern Healing, Rooted in Pure Herbs/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('section#hakim-authority').getByRole('heading', { name: /Authentic Eastern Healing, Rooted in Pure Herbs/i }) with timeout 10000ms
  - waiting for locator('section#hakim-authority').getByRole('heading', { name: /Authentic Eastern Healing, Rooted in Pure Herbs/i })

```

```yaml
- text: Herbal Clinic & Online Consult | Karachi, Pakistan (Est. 1990)
- link "+92 318 2311310":
  - /url: tel:0318-2311310
- text: "|"
- link "Track Order":
  - /url: /track-order
- text: "|"
- link "WhatsApp Helpline":
  - /url: https://wa.me/923353547888
- banner:
  - link "Tameer-e-Sehat Home":
    - /url: /
    - text: Tameer-e-Sehat Herbal Clinic • Online Dispensary
  - navigation:
    - link "Home":
      - /url: /
    - link "Shop":
      - /url: /products
    - link "Specialties":
      - /url: /specialties
    - link "Consult":
      - /url: /consultation
    - link "About Us":
      - /url: /about
  - button "Search"
  - button "User Account"
  - link "Wishlist":
    - /url: /wishlist
  - button "Shopping Cart"
- main:
  - text: Classical Unani Herbal Care · Est. 1990 | 100% Botanical
  - heading "Heal Naturally with a Trusted Hakim" [level=1]
  - paragraph: Personalized Unani consultations and handcrafted botanical remedies for chronic stomach, joint, liver, and vitality issues — 100% steroid-free.
  - button "Consult Hakim Sahib"
  - link "Browse Remedies":
    - /url: "#remedies"
  - img "Tameer-e-Sehat Classical Unani Herbal Medicine Pakistan"
  - text: Zero Steroids · 100% Herbal ⭐ 5.0
  - paragraph: Tameer-e-Sehat Clinic · Korangi, Karachi
  - text: Clinical Scope & Consultation
  - heading "What We Treat with Classical Unani" [level=2]
  - paragraph: We treat the root constitutional imbalance (Mizaj) rather than masking symptoms. Type your symptoms or tap any condition below to initiate direct consultation with Hakim Sahib.
  - textbox "Describe your symptoms (e.g. stomach acidity, joint stiffness, liver heat)..."
  - button "Consult Hakim Sahib"
  - text: "Common conditions (tap to add): Select one or more"
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
  - img "Hakim Muhammad Tariq - Senior Tibbi Consultant at Tameer-e-Sehat Karachi"
  - text: Certified Tibbi Lineage · Est. 1990
  - heading "Hakim Muhammad Tariq" [level=3]
  - paragraph: Senior Tibbi Consultant & Master Herbalist · Serving Karachi Since 1990
  - text: Est. 1990 35+ Years of Clinical Trust Clinical Lineage & Heritage · Est. 1990
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
    - text: Tameer-e-Sehat Herbal Clinic & Dispensary · Est. 1990
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
- link "Chat with Hakim / Tameer-e-Sehat on WhatsApp":
  - /url: https://wa.me/923353547888?text=Assalam-o-Alaikum%20Tameer-e-Sehat%2C%20I%20would%20like%20to%20inquire%20about%20herbal%20consultation%20and%20products.
  - text: Online Hakim Chat on WhatsApp
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("E2E Full-Page Flow - Sections 3 to 6 & Responsive Verification", () => {
  4   |   // ═══════════════════════════════════════════════════════════════════════════
  5   |   // DESKTOP SUITE (1280px)
  6   |   // ═══════════════════════════════════════════════════════════════════════════
  7   |   test.describe("Desktop Viewport (1280px)", () => {
  8   |     test.use({ viewport: { width: 1280, height: 900 } });
  9   | 
  10  |     test("Section 3: Physician-Formulated Remedies renders, category tabs work, remedies cards display pricing and details", async ({
  11  |       page,
  12  |     }) => {
  13  |       await page.goto("/", { waitUntil: "domcontentloaded" });
  14  | 
  15  |       const remediesSection = page.locator("section#remedies");
  16  |       await remediesSection.scrollIntoViewIfNeeded();
  17  |       await expect(remediesSection).toBeVisible({ timeout: 10000 });
  18  | 
  19  |       // Heading and badge verification
  20  |       await expect(
  21  |         remediesSection.getByRole("heading", {
  22  |           name: /Physician-Formulated Remedies/i,
  23  |         })
  24  |       ).toBeVisible();
  25  |       await expect(remediesSection.getByText(/Apothecary Dispensary/i)).toBeVisible();
  26  | 
  27  |       // Category filter tabs exist
  28  |       const allFormulationsTab = remediesSection.getByRole("button", {
  29  |         name: /All Formulations/i,
  30  |       });
  31  |       await expect(allFormulationsTab).toBeVisible();
  32  | 
  33  |       // Wait for product cards to load from live API
  34  |       const addButtons = remediesSection.getByRole("button", { name: /Add/i });
  35  |       await expect(addButtons.first()).toBeVisible({ timeout: 15000 });
  36  | 
  37  |       // Remedies cards display pricing in PKR and title details
  38  |       const priceElement = remediesSection.getByText(/₨\s*[\d,]+/).first();
  39  |       await expect(priceElement).toBeVisible();
  40  | 
  41  |       const productHeadings = remediesSection.getByRole("heading", { level: 3 });
  42  |       await expect(productHeadings.first()).toBeVisible();
  43  | 
  44  |       // Category tabs switching
  45  |       const otherCategoryTabs = remediesSection
  46  |         .locator("button[type='button']")
  47  |         .filter({
  48  |           hasNotText: /All Formulations|Consult for Custom Formulation|Add/i,
  49  |         });
  50  | 
  51  |       const tabCount = await otherCategoryTabs.count();
  52  |       if (tabCount > 0) {
  53  |         const firstCategoryTab = otherCategoryTabs.first();
  54  |         await firstCategoryTab.click();
  55  |         await page.waitForTimeout(300);
  56  | 
  57  |         // Click back to All Formulations
  58  |         await allFormulationsTab.click();
  59  |         await page.waitForTimeout(300);
  60  |         await expect(addButtons.first()).toBeVisible();
  61  |       }
  62  | 
  63  |       // Universal Consultation Modal trigger from custom formulation strip
  64  |       const customFormulationBtn = remediesSection.getByRole("button", {
  65  |         name: /Consult for Custom Formulation/i,
  66  |       });
  67  |       await expect(customFormulationBtn).toBeVisible();
  68  |       await customFormulationBtn.click();
  69  | 
  70  |       // Assert modal opens uniquely
  71  |       const modal = page.getByRole("dialog", {
  72  |         name: /Consult Hakim Muhammad Tariq/i,
  73  |       });
  74  |       await expect(modal).toBeVisible({ timeout: 10000 });
  75  |       await expect(
  76  |         modal.getByRole("heading", { name: /Consult Hakim Muhammad Tariq/i })
  77  |       ).toBeVisible();
  78  | 
  79  |       // Close modal
  80  |       const closeButton = modal.getByRole("button", { name: /Close modal/i });
  81  |       await closeButton.click();
  82  |       await expect(modal).not.toBeVisible();
  83  |     });
  84  | 
  85  |     test("Section 4: Hakim Authority & physical Karachi clinic visit displays credentials and clinic appointment CTA", async ({
  86  |       page,
  87  |     }) => {
  88  |       await page.goto("/", { waitUntil: "domcontentloaded" });
  89  | 
  90  |       const authoritySection = page.locator("section#hakim-authority");
  91  |       await authoritySection.scrollIntoViewIfNeeded();
  92  |       await expect(authoritySection).toBeVisible({ timeout: 10000 });
  93  | 
  94  |       // Assert credentials and clinical lineage
  95  |       await expect(
  96  |         authoritySection.getByRole("heading", {
  97  |           name: /Authentic Eastern Healing, Rooted in Pure Herbs/i,
  98  |         })
> 99  |       ).toBeVisible();
      |         ^ Error: expect(locator).toBeVisible() failed
  100 | 
  101 |       // Hakim portrait / title and clinical metrics
  102 |       await expect(authoritySection.getByText(/Hakim Muhammad Tariq/i).first()).toBeVisible();
  103 |       await expect(authoritySection.getByText("35+").first()).toBeVisible();
  104 |       await expect(authoritySection.getByText(/Years Clinical Experience/i)).toBeVisible();
  105 |       await expect(authoritySection.getByText("150K+")).toBeVisible();
  106 |       await expect(authoritySection.getByText("100%")).toBeVisible();
  107 |       await expect(authoritySection.getByText("0%")).toBeVisible();
  108 | 
  109 |       // Assert Physical Karachi Clinic Visit details
  110 |       await expect(
  111 |         authoritySection.getByText(/Visit Our Clinic for Pulse Diagnosis/i)
  112 |       ).toBeVisible();
  113 |       await expect(authoritySection.getByText(/Korangi/i).first()).toBeVisible();
  114 |       await expect(authoritySection.getByText(/Visiting Hours/i)).toBeVisible();
  115 | 
  116 |       // Verify Clinic Booking CTA triggers modal
  117 |       const bookClinicButton = authoritySection.getByRole("button", {
  118 |         name: /Select Clinic Slot & Book/i,
  119 |       });
  120 |       await bookClinicButton.scrollIntoViewIfNeeded();
  121 |       await expect(bookClinicButton).toBeVisible();
  122 |       await bookClinicButton.click();
  123 | 
  124 |       const modal = page.getByRole("dialog", {
  125 |         name: /Consult Hakim Muhammad Tariq/i,
  126 |       });
  127 |       await expect(modal).toBeVisible({ timeout: 10000 });
  128 | 
  129 |       // Advance to Step 2 to verify channel is In-Person Visit
  130 |       const continueBtn = modal.getByRole("button", { name: /Continue to Next Step/i });
  131 |       await continueBtn.click();
  132 | 
  133 |       // Assert In-Person Visit / Karachi Matab channel
  134 |       await expect(modal.getByRole("button", { name: /In-Person Visit/i })).toBeVisible();
  135 |       await expect(modal.getByText(/Karachi Matab/i)).toBeVisible();
  136 | 
  137 |       // Close modal
  138 |       const closeBtn = modal.getByRole("button", { name: /Close modal/i });
  139 |       await closeBtn.click();
  140 |       await expect(modal).not.toBeVisible();
  141 |     });
  142 | 
  143 |     test("Section 5: Community Reviews display 5.0 Google rating and patient stories", async ({
  144 |       page,
  145 |     }) => {
  146 |       await page.goto("/", { waitUntil: "domcontentloaded" });
  147 | 
  148 |       const reviewsSection = page.locator("section#community-reviews");
  149 |       await reviewsSection.scrollIntoViewIfNeeded();
  150 |       await expect(reviewsSection).toBeVisible({ timeout: 10000 });
  151 | 
  152 |       // Verify heading and 5.0 rating card
  153 |       await expect(
  154 |         reviewsSection.getByRole("heading", { name: /Authentic Patient Reviews/i })
  155 |       ).toBeVisible();
  156 | 
  157 |       // Official Google rating indicator 5.0
  158 |       await expect(reviewsSection.getByText("5.0").first()).toBeVisible();
  159 |       await expect(reviewsSection.getByText(/Verified Google/i).first()).toBeVisible();
  160 | 
  161 |       // Verify Google external links exist
  162 |       const googleMapsLink = reviewsSection.getByRole("link", { name: /View Google Maps/i });
  163 |       await googleMapsLink.scrollIntoViewIfNeeded();
  164 |       await expect(googleMapsLink).toBeVisible();
  165 |       const href = await googleMapsLink.getAttribute("href");
  166 |       expect(href).toContain("google.com/maps");
  167 | 
  168 |       const writeReviewLink = reviewsSection.getByRole("link", { name: /Write Google Review/i });
  169 |       await expect(writeReviewLink).toBeVisible();
  170 |     });
  171 | 
  172 |     test("Section 6: Bottom consultation banner triggers the universal modal with correct mode", async ({
  173 |       page,
  174 |     }) => {
  175 |       await page.goto("/", { waitUntil: "domcontentloaded" });
  176 | 
  177 |       const consultBanner = page.locator("section#whatsapp-consult");
  178 |       await consultBanner.scrollIntoViewIfNeeded();
  179 |       await expect(consultBanner).toBeVisible({ timeout: 10000 });
  180 | 
  181 |       // Banner Heading
  182 |       await expect(
  183 |         consultBanner.getByRole("heading", {
  184 |           name: /Direct Consultation with Hakim Muhammad Tariq/i,
  185 |         })
  186 |       ).toBeVisible();
  187 | 
  188 |       // 1. WhatsApp Action Trigger
  189 |       const whatsappButton = consultBanner.getByRole("button", {
  190 |         name: /Consult via WhatsApp \/ Voice/i,
  191 |       });
  192 |       await expect(whatsappButton).toBeVisible();
  193 |       await whatsappButton.click();
  194 | 
  195 |       const modal = page.getByRole("dialog", {
  196 |         name: /Consult Hakim Muhammad Tariq/i,
  197 |       });
  198 |       await expect(modal).toBeVisible({ timeout: 10000 });
  199 | 
```