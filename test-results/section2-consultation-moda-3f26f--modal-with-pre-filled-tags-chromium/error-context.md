# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section2-consultation-modal.spec.ts >> Section 2: Minimal Consultation Card & Universal ConsultationModal Verification >> Desktop Viewport (1280 x 800) >> User can click quick symptom chips to populate input and open modal with pre-filled tags
- Location: tests\e2e\section2-consultation-modal.spec.ts:131:9

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('section#specialties').locator('.bg-white.rounded-3xl.border').locator('input[placeholder*=\'Describe your symptoms\']')
Expected: "Stomach Acidity / Gas"
Received: ""
Timeout:  10000ms

Call log:
  - Expect "toHaveValue" locator('section#specialties').locator('.bg-white.rounded-3xl.border').locator('input[placeholder*=\'Describe your symptoms\']') with timeout 10000ms
  - waiting for locator('section#specialties').locator('.bg-white.rounded-3xl.border').locator('input[placeholder*=\'Describe your symptoms\']')
    22 × locator resolved to <input value="" type="text" placeholder="Describe your symptoms (e.g. stomach acidity, joint stiffness, liver heat)..." class="w-full text-xs sm:text-sm px-4 py-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl sm:rounded-2xl text-[#1a1816] placeholder:text-[#8c827a] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all pr-8"/>
       - unexpected value ""

```

```yaml
- textbox "Describe your symptoms (e.g. stomach acidity, joint stiffness, liver heat)..."
```

# Test source

```ts
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
  89  |       await expect(clearBtn).toBeVisible();
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
> 151 |       await expect(input).toHaveValue("Stomach Acidity / Gas");
      |                           ^ Error: expect(locator).toHaveValue(expected) failed
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
  190 | 
  191 |       const section = page.locator("section#specialties");
  192 |       await section.scrollIntoViewIfNeeded();
  193 |       const card = section.locator(".bg-white.rounded-3xl.border");
  194 |       const input = card.locator("input[placeholder*='Describe your symptoms']");
  195 |       await expect(input).toBeVisible();
  196 | 
  197 |       const stomachChip = card.locator("button", {
  198 |         hasText: "Stomach Acidity / Gas",
  199 |       });
  200 |       await expect(stomachChip).toBeVisible();
  201 |       await stomachChip.click();
  202 |       await expect(input).toHaveValue("Stomach Acidity / Gas");
  203 | 
  204 |       const consultButton = card.getByRole("button", {
  205 |         name: /Consult Hakim Sahib/i,
  206 |       });
  207 |       await consultButton.click();
  208 | 
  209 |       const modal = page.getByRole("dialog", {
  210 |         name: /Consult Hakim Muhammad Tariq/i,
  211 |       });
  212 |       await expect(modal).toBeVisible();
  213 | 
  214 |       // Verify Step 1 indicator is active
  215 |       const step1Tab = modal.getByRole("button", {
  216 |         name: /Symptoms & History/i,
  217 |       });
  218 |       await expect(step1Tab).toBeVisible();
  219 | 
  220 |       // Verify Step 1 features: Voice record button, Attach report button, Quick tags
  221 |       await expect(
  222 |         modal.getByRole("button", { name: /Record Voice/i })
  223 |       ).toBeVisible();
  224 |       await expect(
  225 |         modal.getByRole("button", { name: /Attach Report/i })
  226 |       ).toBeVisible();
  227 | 
  228 |       // Verify quick symptom tags inside modal
  229 |       const modalChip = modal.locator("button", {
  230 |         hasText: "Fatty Liver / Body Heat",
  231 |       });
  232 |       await expect(modalChip).toBeVisible();
  233 |       await modalChip.click();
  234 | 
  235 |       const textarea = modal.locator("textarea");
  236 |       await expect(textarea).toHaveValue(
  237 |         "Stomach Acidity / Gas, Fatty Liver / Body Heat"
  238 |       );
  239 | 
  240 |       // Advance from Step 1 to Step 2 using "Continue to Next Step"
  241 |       const continueButton = modal.getByRole("button", {
  242 |         name: /Continue to Next Step/i,
  243 |       });
  244 |       await expect(continueButton).toBeVisible();
  245 |       await continueButton.click();
  246 | 
  247 |       // ── Step 2 Assertions ──
  248 |       // Verify Step 2 is active
  249 |       await expect(modal.getByText("Choose Consultation Channel:")).toBeVisible();
  250 |       await expect(modal.getByText("Your Clinical Symptoms:")).toBeVisible();
  251 |       await expect(
```