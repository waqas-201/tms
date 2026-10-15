# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section2-consultation-modal.spec.ts >> Section 2: Minimal Consultation Card & Universal ConsultationModal Verification >> Desktop Viewport (1280 x 800) >> User can type into symptom input box, clear it, and trigger modal with custom text
- Location: tests\e2e\section2-consultation-modal.spec.ts:70:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('section#specialties').locator('.bg-white.rounded-3xl.border').locator('button[aria-label=\'Clear input\']')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('section#specialties').locator('.bg-white.rounded-3xl.border').locator('button[aria-label=\'Clear input\']') with timeout 10000ms
  - waiting for locator('section#specialties').locator('.bg-white.rounded-3xl.border').locator('button[aria-label=\'Clear input\']')

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
  - textbox "Describe your symptoms (e.g. stomach acidity, joint stiffness, liver heat)...": Severe gastric acidity and burning sensation after meals
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
  3   | test.describe("Section 2: Minimal Consultation Card & Universal ConsultationModal Verification", () => {
  4   |   // ═══════════════════════════════════════════════════════════════════════════
  5   |   // DESKTOP VIEWPORT (1280 x 800)
  6   |   // ═══════════════════════════════════════════════════════════════════════════
  7   |   test.describe("Desktop Viewport (1280 x 800)", () => {
  8   |     test.use({ viewport: { width: 1280, height: 800 } });
  9   | 
  10  |     test("Section 2 minimal consultation card renders cleanly with all visual elements", async ({
  11  |       page,
  12  |     }) => {
  13  |       await page.goto("/");
  14  |       await page.waitForLoadState("domcontentloaded");
  15  | 
  16  |       const section = page.locator("section#specialties");
  17  |       await section.scrollIntoViewIfNeeded();
  18  |       await expect(section).toBeVisible();
  19  | 
  20  |       // Verify scope pill and main heading
  21  |       await expect(section.getByText("Clinical Scope & Consultation")).toBeVisible();
  22  |       await expect(
  23  |         section.getByRole("heading", {
  24  |           name: /What We Treat with Classical Unani/i,
  25  |         })
  26  |       ).toBeVisible();
  27  | 
  28  |       // Verify explanatory text
  29  |       await expect(
  30  |         section.getByText(/We treat the root constitutional imbalance \(Mizaj\)/i)
  31  |       ).toBeVisible();
  32  | 
  33  |       // Verify minimal consultation card container
  34  |       const card = section.locator(".bg-white.rounded-3xl.border");
  35  |       await expect(card).toBeVisible();
  36  | 
  37  |       // Verify input box and primary CTA button
  38  |       const input = card.locator("input[placeholder*='Describe your symptoms']");
  39  |       await expect(input).toBeVisible();
  40  |       await expect(input).toBeEmpty();
  41  | 
  42  |       const consultButton = card.getByRole("button", {
  43  |         name: /Consult Hakim Sahib/i,
  44  |       });
  45  |       await expect(consultButton).toBeVisible();
  46  | 
  47  |       // Verify quick symptom chips
  48  |       const chips = [
  49  |         "Stomach Acidity / Gas",
  50  |         "Joint & Knee Pain",
  51  |         "Fatty Liver / Body Heat",
  52  |         "Vitality & Energy",
  53  |         "Hair Fall & Scalp",
  54  |       ];
  55  | 
  56  |       for (const chipText of chips) {
  57  |         const chip = card.locator("button", { hasText: chipText });
  58  |         await expect(chip).toBeVisible();
  59  |       }
  60  | 
  61  |       // Verify reassurance footer
  62  |       await expect(
  63  |         card.getByText(/100% Free Initial Assessment · Confidential/i)
  64  |       ).toBeVisible();
  65  |       await expect(
  66  |         card.getByText(/Instant WhatsApp & Karachi Matab/i)
  67  |       ).toBeVisible();
  68  |     });
  69  | 
  70  |     test("User can type into symptom input box, clear it, and trigger modal with custom text", async ({
  71  |       page,
  72  |     }) => {
  73  |       await page.goto("/");
  74  |       await page.waitForLoadState("domcontentloaded");
  75  | 
  76  |       const section = page.locator("section#specialties");
  77  |       await section.scrollIntoViewIfNeeded();
  78  |       const card = section.locator(".bg-white.rounded-3xl.border");
  79  |       const input = card.locator("input[placeholder*='Describe your symptoms']");
  80  |       await expect(input).toBeVisible();
  81  | 
  82  |       // Test typing symptoms
  83  |       const customSymptom = "Severe gastric acidity and burning sensation after meals";
  84  |       await input.fill(customSymptom);
  85  |       await expect(input).toHaveValue(customSymptom);
  86  | 
  87  |       // Verify clear button appears when input has content
  88  |       const clearBtn = card.locator("button[aria-label='Clear input']");
> 89  |       await expect(clearBtn).toBeVisible();
      |                              ^ Error: expect(locator).toBeVisible() failed
  90  | 
  91  |       // Clear input and verify empty
  92  |       await clearBtn.click();
  93  |       await expect(input).toHaveValue("");
  94  |       await expect(clearBtn).toBeHidden();
  95  | 
  96  |       // Re-enter symptoms for consultation
  97  |       await input.fill(customSymptom);
  98  |       await expect(input).toHaveValue(customSymptom);
  99  | 
  100 |       // Click "Consult Hakim Sahib"
  101 |       const consultButton = card.getByRole("button", {
  102 |         name: /Consult Hakim Sahib/i,
  103 |       });
  104 |       await consultButton.click();
  105 | 
  106 |       // Assert universal ConsultationModal opens
  107 |       const modal = page.getByRole("dialog", {
  108 |         name: /Consult Hakim Muhammad Tariq/i,
  109 |       });
  110 |       await expect(modal).toBeVisible();
  111 | 
  112 |       // Assert Modal Header credentials
  113 |       await expect(
  114 |         modal.getByRole("heading", { name: /Consult Hakim Muhammad Tariq/i })
  115 |       ).toBeVisible();
  116 |       await expect(
  117 |         modal.getByText(/35\+ Years Classical Unani Wisdom/i)
  118 |       ).toBeVisible();
  119 | 
  120 |       // Assert Step 1 textarea is pre-filled with the exact typed symptom text
  121 |       const textarea = modal.locator("textarea");
  122 |       await expect(textarea).toBeVisible();
  123 |       await expect(textarea).toHaveValue(customSymptom);
  124 | 
  125 |       // Close modal
  126 |       const closeButton = modal.getByRole("button", { name: /Close modal/i });
  127 |       await closeButton.click();
  128 |       await expect(modal).toBeHidden();
  129 |     });
  130 | 
  131 |     test("User can click quick symptom chips to populate input and open modal with pre-filled tags", async ({
  132 |       page,
  133 |     }) => {
  134 |       await page.goto("/");
  135 |       await page.waitForLoadState("domcontentloaded");
  136 | 
  137 |       const section = page.locator("section#specialties");
  138 |       await section.scrollIntoViewIfNeeded();
  139 |       const card = section.locator(".bg-white.rounded-3xl.border");
  140 |       const input = card.locator("input[placeholder*='Describe your symptoms']");
  141 |       await expect(input).toBeVisible();
  142 | 
  143 |       // Click "Stomach Acidity / Gas" chip
  144 |       const stomachChip = card.locator("button", {
  145 |         hasText: "Stomach Acidity / Gas",
  146 |       });
  147 |       await expect(stomachChip).toBeVisible();
  148 |       await stomachChip.click();
  149 | 
  150 |       // Verify input now has "Stomach Acidity / Gas"
  151 |       await expect(input).toHaveValue("Stomach Acidity / Gas");
  152 | 
  153 |       // Click second chip "Vitality & Energy" to assert multi-tag combination
  154 |       const vitalityChip = card.locator("button", {
  155 |         hasText: "Vitality & Energy",
  156 |       });
  157 |       await expect(vitalityChip).toBeVisible();
  158 |       await vitalityChip.click();
  159 | 
  160 |       await expect(input).toHaveValue("Stomach Acidity / Gas, Vitality & Energy");
  161 | 
  162 |       // Click "Consult Hakim Sahib"
  163 |       const consultButton = card.getByRole("button", {
  164 |         name: /Consult Hakim Sahib/i,
  165 |       });
  166 |       await consultButton.click();
  167 | 
  168 |       // Verify universal ConsultationModal opens
  169 |       const modal = page.getByRole("dialog", {
  170 |         name: /Consult Hakim Muhammad Tariq/i,
  171 |       });
  172 |       await expect(modal).toBeVisible();
  173 | 
  174 |       // Verify Step 1 textarea contains the concatenated chip tags
  175 |       const textarea = modal.locator("textarea");
  176 |       await expect(textarea).toBeVisible();
  177 |       await expect(textarea).toHaveValue("Stomach Acidity / Gas, Vitality & Energy");
  178 | 
  179 |       // Close modal
  180 |       const closeButton = modal.getByRole("button", { name: /Close modal/i });
  181 |       await closeButton.click();
  182 |       await expect(modal).toBeHidden();
  183 |     });
  184 | 
  185 |     test("Full modal flow: Step 1 symptom pre-fill -> advance to Step 2 -> WhatsApp direct launch option", async ({
  186 |       page,
  187 |     }) => {
  188 |       await page.goto("/");
  189 |       await page.waitForLoadState("domcontentloaded");
```