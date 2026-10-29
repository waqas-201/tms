# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Tameer-e-Sehat — Homepage UI/UX Redesign

**Document type:** Product + UX + Frontend Implementation Specification  
**Priority:** High  
**Primary objective:** Increase consultation bookings and qualified customer enquiries  
**Scope:** Homepage redesign, with limited platform-wide GUI changes when required for consistency or compatibility  
**Design direction:** Premium heritage healthcare / Unani apothecary  
**Primary market:** Pakistan, especially Karachi  
**Brand:** Tameer-e-Sehat  
**Status:** Ready for coding-agent discovery and implementation

---

# 1. PROJECT OVERVIEW

## 1.1 Product background

Tameer-e-Sehat is a traditional Unani and herbal healthcare business offering practitioner consultations, Hijama services, herbal products, and in-person clinic services.

The website must communicate credibility, make services easy to understand, and help visitors take the next step without unnecessary confusion.

The existing platform is the source of truth for functionality, routes, content, products, booking availability, and business logic.

This project is a focused UX and frontend redesign, not a complete website rebuild.

## 1.2 Problem statement

The current homepage contains multiple competing user journeys, including consultation, Hijama, herbal products, condition discovery, and clinic information.

The redesign must address these problems:

1. Visitors may not immediately understand which action to take.
2. Consultation booking and customer enquiry actions need stronger visual hierarchy.
3. Repeated promotional content can increase cognitive load.
4. Practitioner credentials and business information should be presented clearly and consistently.
5. Booking, product, and enquiry interfaces must communicate loading, success, empty, and error states properly.
6. The design should feel like one coherent, premium healthcare brand across desktop and mobile.
7. Existing platform functionality must remain intact.

## 1.3 Product objective

Create a homepage that helps visitors quickly answer three questions:

- What is Tameer-e-Sehat?
- Which service is relevant to me?
- How can I book a consultation or contact the business?

The intended outcome is more completed consultation bookings and more qualified enquiries, not simply more button clicks.

---

# 2. SCOPE AND CHANGE CONTROL

## 2.1 In scope

- Homepage information architecture.
- Homepage visual design and responsive layout.
- Homepage navigation and hero section.
- Consultation call-to-action hierarchy.
- WhatsApp enquiry entry point.
- Service discovery cards.
- Practitioner credibility section.
- Clinic information and contact section.
- Homepage FAQ section, where appropriate.
- Existing homepage product presentation.
- Homepage loading, empty, success, and error states.
- Shared design tokens and components needed to implement the new homepage.
- Accessibility and responsive improvements directly related to the redesign.
- Analytics instrumentation for homepage conversion events, using the existing analytics infrastructure where available.
- Regression testing of all existing routes affected by shared GUI changes.

## 2.2 Explicitly out of scope

Do not independently initiate any of the following:

- A complete redesign of every page.
- A new application architecture or framework migration.
- A database schema redesign.
- Rebuilding authentication, payments, cart, checkout, booking, or inventory systems.
- Changing business rules, pricing, appointment availability, or product data.
- Replacing the existing CMS, API, or backend.
- Removing existing routes or features because they do not fit the new design.
- Rewriting unrelated pages or components for code cleanliness.
- Introducing a new UI framework or large dependency without justification.
- Inventing testimonials, reviews, medical credentials, patient counts, health outcomes, or product claims.

## 2.3 Conditional platform-wide GUI changes

A platform-wide change is permitted only when at least one of these conditions applies:

1. The homepage cannot be implemented correctly without modifying a shared component.
2. The existing global header, footer, navigation, typography, or design tokens prevent a consistent design.
3. A shared component has a usability or accessibility defect that directly affects the new homepage.
4. A shared component change is required to support the redesigned responsive layout.

Examples of permitted shared changes:

- Updating shared color and typography tokens.
- Adjusting the global header or footer.
- Correcting shared button or link styling.
- Fixing a shared mobile navigation issue.
- Improving shared focus states and accessibility.
- Updating a shared container or spacing system.

### Mandatory rule

If a shared component changes, inspect and regression-test every route that uses it.

Do not redesign the contents of those pages unless explicitly required by the shared component change.

If a platform-wide change is not necessary, leave the rest of the website visually and functionally unchanged.

---

# 3. DISCOVERY PHASE — REQUIRED BEFORE CODING

The coding agent must inspect the existing implementation before making architectural assumptions.

## 3.1 Inspect the repository

Determine:

- Frontend framework and version.
- Routing system.
- Existing homepage entry point.
- Global layouts and shared components.
- Styling approach and design tokens.
- UI component library, if present.
- Image, font, and icon loading methods.
- Existing booking and consultation routes.
- WhatsApp contact implementation.
- Product listing and product detail routes.
- API endpoints and data-fetching patterns.
- Existing loading and error handling.
- Analytics implementation.
- Mobile navigation and footer.
- Existing tests, linting, type checking, and build commands.

## 3.2 Establish the baseline

Before changing code:

1. Run the existing application using the repository's documented process.
2. Inspect the homepage at desktop and mobile sizes.
3. Capture screenshots of the original homepage.
4. Identify the current routes and links used by homepage CTAs.
5. Test consultation, WhatsApp, product, and Hijama interactions.
6. Identify any persistent loading states or failed requests.
7. Record any existing errors relevant to the homepage.
8. Run the existing test and build commands where feasible.

Do not interpret a loading message observed in a static page snapshot as proof of a production defect. Reproduce it in the actual browser and inspect the relevant network request or application state.

## 3.3 Discovery report

Before significant implementation, produce a concise report containing:

- Relevant files and components.
- Existing design system and dependencies.
- Homepage component hierarchy.
- Confirmed defects.
- Existing routes and actions that must be preserved.
- Proposed files to modify.
- Shared components that require changes.
- Risks and assumptions.

Then proceed with implementation. Do not stop after discovery to request approval for routine, reversible decisions.

Ask for clarification only when an essential business decision cannot be determined from the codebase or existing website.

---

# 4. TARGET USERS AND USER NEEDS

## 4.1 Primary user: consultation seeker

A visitor who wants to discuss a health concern with the practitioner.

Needs:

- Understand what a consultation involves.
- Know whether online and in-person options are available.
- Understand how to book.
- Find the correct contact method.
- Know what information they need to provide.

Primary action: **Book a consultation.**

Secondary action: **Ask a question on WhatsApp.**

## 4.2 Secondary user: service explorer

A visitor exploring the clinic or Hijama services.

Needs:

- Understand which services are offered.
- Find availability and relevant details.
- Reach the appropriate service page without confusion.

Primary action: Explore the relevant service.

## 4.3 Secondary user: herbal product customer

A visitor looking for a product or learning about available remedies.

Needs:

- Identify actual products.
- See accurate pricing and product details.
- Reach the existing product detail or purchasing flow.
- Ask a question when they need assistance.

Primary action: Browse products.

## 4.4 User experience principles

The homepage must:

- Prioritize clarity over decoration.
- Provide obvious next steps.
- Use plain, understandable language.
- Make important information easy to scan.
- Avoid unsupported health claims.
- Minimize unnecessary form fields.
- Preserve user-entered information during recoverable errors.
- Make the interface usable on mobile devices.
- Never imply that a booking is confirmed before confirmation actually occurs.

---

# 5. BRAND AND VISUAL DESIGN SYSTEM

## 5.1 Brand identity

Use the existing Tameer-e-Sehat brand identity rather than inventing a new one.

**Required logo asset:**

https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT8O50QL0ekVXeWipnv45DGaI9LyEYx0bCzJPTK

Use the supplied logo asset in the appropriate existing brand locations. Inspect the asset's dimensions and transparency before use.

Do not recreate, redraw, recolor, distort, or replace the logo unless the existing asset demonstrably requires an alternative approved treatment.

Preserve sufficient clear space around the logo, particularly in the header.

## 5.2 Brand colors

Use these existing brand colors as the initial design tokens:

| Token | Color | Intended use |
|---|---|---|
| Primary | Ivy Green `#22623A` | Primary actions, links, active states |
| Background | Chalk White `#FAF8F5` | Main page background |
| Accent | Antique Gold `#C59B27` | Restrained decorative accents |
| Dark | Obsidian Black `#11351E` | Headings and strong contrast |
| Surface | White `#FFFFFF` | Cards, forms, elevated surfaces |
| Border | Neutral derived from palette | Dividers and card boundaries |

The primary action should be recognizable through shape, contrast, text, and placement—not color alone.

Do not use antique gold for small text on a light background if contrast is insufficient.

If the current global palette differs, inspect the existing implementation and reconcile it with the brand tokens above. Avoid introducing conflicting color systems.

## 5.3 Typography

Preferred brand typography:

- Headings: Playfair Display.
- Body, navigation, controls, and buttons: Outfit.

Inspect whether these fonts are already installed or loaded.

Reuse existing font assets where possible. If new font loading is required, use a reliable loading strategy with appropriate fallbacks and avoid blocking initial page rendering.

Suggested hierarchy:

- Main hero heading: approximately 40–56px on desktop and 32–40px on mobile.
- Section headings: approximately 28–36px on desktop and 24–30px on mobile.
- Body copy: 16–18px.
- Supporting text: 14–16px.
- Buttons: 15–16px, medium or semibold weight.

These are starting points, not rigid values. Adapt them to the existing design system and actual viewport.

## 5.4 Visual direction

The intended aesthetic is:

- Premium heritage apothecary.
- Modern, calm healthcare presentation.
- Authentic rather than generic.
- Generous whitespace.
- Strong typographic hierarchy.
- Subtle borders and restrained shadows.
- Consistent corner radii.
- Natural, authentic photography.
- Minimal decorative elements.

Avoid:

- Excessive gradients.
- Large gold decorative elements.
- Glassmorphism.
- Excessive card nesting.
- Excessive animation.
- Repeated promotional banners.
- Generic stock imagery presented as actual practitioners.
- Unnecessary carousels.
- Dense blocks of centered text.
- Emoji used as a substitute for professional icons.

Prefer the existing icon library if one is already installed.

---

# 6. HOMEPAGE INFORMATION ARCHITECTURE

Implement the following section order, adapting it to actual business capabilities and existing content.

## Section 1: Global header

### Purpose

Help users understand the website and access primary actions.

### Desktop layout

Left:
- Existing Tameer-e-Sehat logo.

Center:
- Home, if appropriate.
- Consultations.
- Services.
- Herbal products.
- About.
- Contact.

Right:
- Primary consultation CTA.

### Mobile layout

- Logo on the left.
- Accessible menu button on the right.
- Consultation action accessible without navigating through several menu levels.
- Do not allow the header or CTA to consume excessive vertical space.

### Requirements

- Reuse the existing routing system.
- All links must point to real, verified destinations.
- Indicate the active page where appropriate.
- Provide visible keyboard focus.
- Use semantic navigation markup.
- Ensure the mobile menu opens and closes correctly.
- Support keyboard navigation and Escape to close where appropriate.
- Avoid adding a sticky header unless it materially improves usability and does not obscure content.

Do not change existing routes just to make their names match the proposed navigation labels.

---

## Section 2: Hero

### Purpose

Explain the offering and make the next step obvious.

### Recommended content

Eyebrow:

"TRADITIONAL UNANI CARE"

Headline:

"Personal care. Traditional wisdom. Clear guidance."

Supporting copy:

"Speak with our practitioner, explore available services, or plan a visit to our clinic in Karachi."

Primary CTA:

"Book a consultation"

Secondary CTA:

"Ask us on WhatsApp"

Supporting details:

- Karachi clinic location.
- Online and in-person consultation options, only where currently supported.
- A concise credibility detail, if verified.

### Layout

Desktop:

- Two-column layout.
- Copy and CTAs on the left.
- Authentic practitioner or clinic photograph on the right.

Mobile:

- Single-column layout.
- Headline first.
- Short supporting copy.
- Primary CTA.
- Secondary CTA.
- Supporting details.
- Optional image below the main actions if it improves the layout.

### Hero requirements

- The main headline must be visible without requiring excessive scrolling.
- The primary CTA must be visually dominant.
- The secondary CTA must remain clearly distinguishable.
- Avoid multiple competing primary buttons.
- Keep the copy concise.
- Use an optimized image with explicit dimensions or aspect ratio.
- Provide meaningful alternative text for informative images.
- Do not embed essential text inside an image.
- Respect reduced-motion preferences.
- Avoid auto-playing video or an image carousel in the hero.

### CTA behavior

"Book a consultation" must navigate to the existing consultation booking route or the closest verified consultation entry point.

"Ask us on WhatsApp" must use the actual business contact details and open the intended conversation.

The current known business contact is **03353547888**. Verify the existing website configuration before introducing or changing the number.

For a WhatsApp link, use the international format `923353547888` if this number is confirmed as the intended destination.

An optional prefilled message may say:

"Assalam-o-Alaikum. I would like to enquire about a consultation at Tameer-e-Sehat."

The visitor must be able to edit the message before sending it.

Do not claim that a WhatsApp message has been sent merely because the visitor clicked the link.

---

## Section 3: Compact trust strip

### Purpose

Provide a small amount of immediate reassurance without overwhelming the hero.

Potential items:

- Established in 1990.
- Karachi clinic.
- Practitioner-led consultation.
- Direct enquiry support.

Use only information verified against the existing website and business records.

The establishment date is not a substitute for current practitioner qualifications or evidence of clinical quality.

### Design

- One compact row on desktop.
- Two or three compact items per row on mobile, depending on screen width.
- Small, consistent icons.
- No oversized numerical counters.
- No animated count-up effects.
- No invented patient numbers, ratings, or success statistics.

If the trust strip repeats information already clear in the hero, remove the duplication.

---

## Section 4: Service discovery

### Heading

"How can we help?"

Supporting text:

"Explore our services and choose the option that best fits your needs."

### Service cards

Create cards for the existing supported services.

#### Card A: Consultation

Description:

"Learn about available consultation options and how to arrange an appointment."

CTA:

"Explore consultations"

#### Card B: Hijama

Description:

"Learn about the service, available appointments, and relevant preparation information."

CTA:

"View Hijama service"

#### Card C: Herbal products

Description:

"Explore available products and review their ingredients and details."

CTA:

"Browse products"

#### Card D: Visit the clinic

Description:

"Find our location, opening hours, and contact information."

CTA:

"Clinic information"

### Requirements

- Reuse existing route destinations.
- Do not invent service availability or appointment guarantees.
- Use consistent card dimensions and spacing.
- Make each action clear.
- Avoid large descriptions.
- Do not make an entire card clickable if it contains conflicting interactive elements without carefully implementing accessible behavior.
- Use authentic imagery only when it improves understanding.
- Use simple icons or restrained photography rather than decorative illustrations.

On mobile, cards should stack naturally or use a compact two-column layout only when text and touch targets remain comfortable.

---

## Section 5: Consultation conversion section

### Purpose

Give visitors who are ready to consult a more direct route to booking.

### Heading

"Take the next step toward a consultation"

### Supporting copy

"Review the available consultation options and choose how you would like to connect with the practitioner."

### Content

Present the consultation modes currently supported by the platform.

For each mode, explain:

- Whether it is online or in person.
- How the appointment is arranged.
- Whether the visitor needs to select a date or contact the clinic.
- Where fees or other relevant details can be found.

### CTA

"Book a consultation"

### Functional requirements

- Link to the existing booking workflow.
- Preserve the current booking business rules.
- Do not create a parallel booking system.
- Do not bypass availability checks.
- Do not claim a booking is confirmed until the existing system confirms it.
- Do not collect sensitive health details in a general marketing enquiry form unless there is a documented need and appropriate privacy controls.

If a visitor cannot complete a booking online, provide a genuine alternative contact method.

---

## Section 6: Practitioner profile

### Purpose

Establish a human connection and explain who provides the service.

### Content

- Authentic practitioner portrait.
- Name and professional title.
- Verified qualifications.
- Relevant experience.
- Concise professional introduction.
- Clinic affiliation and location.
- Consultation CTA.

### Suggested heading

"Meet your practitioner"

### Requirements

- Reuse verified existing profile content.
- Do not fabricate qualifications, affiliations, experience, or credentials.
- Do not use an AI-generated portrait to represent the actual practitioner.
- Do not add fake testimonial quotations.
- Do not claim guaranteed treatment outcomes.
- Keep the profile concise, with an optional link to an existing detailed profile if one exists.

---

## Section 7: Herbal products

### Purpose

Allow interested visitors to explore the shop without distracting from the consultation goal.

### Heading

"Explore our herbal products"

### Content

Display a small, curated selection of actual products already available in the existing product catalogue.

Each product card may contain:

- Product image.
- Product name.
- Current price in PKR.
- Brief description.
- Product detail link.
- Purchase action, if the existing platform supports it.

### Functional requirements

- Read products from the existing source of truth.
- Do not hardcode prices into presentation components.
- Respect actual stock and availability information where available.
- Use existing product routes and cart functionality.
- Do not invent discounts, ratings, reviews, ingredients, or medical claims.
- Do not display unavailable products as available.
- Ensure the homepage remains useful if the product query fails.

### Loading and error states

Loading:

- Use a restrained skeleton or loading indicator.
- Avoid a large, permanent loading message.

Empty:

- Show a concise message and an appropriate route to the shop or enquiry channel.

Error:

- Preserve the rest of the homepage.
- Display a recoverable state.
- Provide retry only when retry is meaningful.
- Log technical details appropriately without exposing sensitive information to visitors.

Do not build a new commerce system as part of this task.

---

## Section 8: Clinic information

### Purpose

Help visitors confidently find or contact the physical clinic.

### Content

- Verified clinic address.
- Karachi location.
- Opening hours.
- Telephone or WhatsApp contact.
- Map or directions link, if currently supported.
- Consultation booking CTA.

### Requirements

- Use the actual business address from existing site data.
- Do not guess coordinates or opening hours.
- Ensure phone links work on mobile.
- Ensure the map link points to the correct location.
- Keep this section concise.
- Do not add an interactive map library unless there is a clear requirement and the dependency is justified.

---

## Section 9: Frequently asked questions

### Purpose

Resolve common objections before a visitor contacts the business.

Potential questions:

1. How do I book a consultation?
2. Are online consultations available?
3. How do I find the clinic?
4. How can I enquire about Hijama appointments?
5. How do I ask about a herbal product?
6. What information should I prepare before a consultation?
7. How is my enquiry information handled?

Only publish answers supported by current business policies and platform capabilities.

### Interaction requirements

- Use accessible disclosure controls.
- Ensure keyboard operation.
- Use clear open/closed states.
- Avoid nested interactive controls.
- Keep answers short and direct.
- Link to existing detailed pages when available.

Do not provide unsupported medical advice in FAQs.

---

## Section 10: Footer

### Content

- Existing logo.
- Short business description.
- Navigation links.
- Consultation and service links.
- Verified clinic contact details.
- Address and opening hours.
- Existing social channels, where applicable.
- Privacy policy and other existing legal links.

### Requirements

- Reuse existing global footer where possible.
- Maintain consistency across routes.
- Do not create duplicate contact details in different components.
- Use a single source of truth for shared contact information.
- Do not remove existing functional footer links.

---

# 7. GLOBAL CONVERSION REQUIREMENTS

## 7.1 CTA hierarchy

The page must maintain a clear visual hierarchy:

1. Primary: Book a consultation.
2. Secondary: Ask on WhatsApp.
3. Supporting: Explore services, products, and clinic details.

Do not render every section CTA as a visually identical primary button.

## 7.2 WhatsApp behavior

- Use the verified business number.
- Use the correct international number format.
- Open the appropriate WhatsApp destination.
- Include an optional, editable prefilled message.
- Provide accessible link text.
- Avoid repeated floating buttons that obstruct content.
- If the platform already has a floating WhatsApp control, inspect it before introducing another.

## 7.3 Forms and booking

For existing forms and booking flows:

- Clearly label all fields.
- Identify required fields.
- Validate input accessibly.
- Show field-level errors.
- Preserve valid entered data after recoverable failures.
- Disable duplicate submissions while a request is processing.
- Provide clear success confirmation after actual server success.
- Provide a useful recovery action after failure.
- Never expose stack traces or internal API errors in the UI.

Do not modify booking validation rules or backend behavior unless a verified defect blocks the requested user journey. Any required backend correction must be minimal and directly related to the defect.

---

# 8. RESPONSIVE DESIGN REQUIREMENTS

The homepage must work at minimum across the following viewport widths:

- 320px.
- 375px.
- 390px.
- 768px.
- 1024px.
- 1440px.

These are testing targets, not separate designs to hardcode.

Requirements:

- No unintended horizontal overflow.
- No clipped headings or buttons.
- No overlapping fixed elements.
- Readable body text.
- Comfortable touch targets, aiming for approximately 44 × 44 CSS pixels where practical.
- Correct image cropping.
- No excessive vertical spacing on small screens.
- No inaccessible hover-only actions.
- Mobile navigation must work without a mouse.
- Booking and enquiry actions must remain discoverable.
- Avoid loading unnecessarily large desktop images on mobile.

Use the project's existing responsive breakpoints when practical.

---

# 9. ACCESSIBILITY

Target WCAG 2.2 AA for the redesigned interface where practical.

Requirements:

- Semantic HTML.
- Correct heading hierarchy.
- Accessible names for controls.
- Sufficient text contrast.
- Visible focus indicators.
- Keyboard-accessible navigation and disclosure controls.
- Meaningful image alternative text.
- Appropriate form labels and error messages.
- No color-only communication of status.
- Reduced-motion support.
- Accessible loading and status announcements where necessary.
- Correctly identified links versus buttons.
- No unnecessary focus traps.

Use automated accessibility checks alongside manual keyboard testing.

Do not claim full WCAG compliance based only on an automated scan.

---

# 10. PERFORMANCE AND TECHNICAL QUALITY

## 10.1 Performance goals

Treat these as target outcomes rather than assumed existing performance.

Aim for Core Web Vitals in the good range at the 75th percentile:

- LCP: 2.5 seconds or less.
- INP: 200 milliseconds or less.
- CLS: 0.1 or less.

Requirements:

- Optimize homepage images.
- Provide appropriate image dimensions.
- Avoid layout shifts.
- Avoid unnecessary client-side JavaScript.
- Reuse existing dependencies.
- Avoid adding large libraries for simple UI requirements.
- Use existing caching and data-fetching strategies.
- Avoid blocking the initial render on nonessential product or service requests.
- Ensure failure of a secondary API does not blank the entire homepage.
- Use appropriate loading strategies for below-the-fold content.

Measure performance using the existing setup or a suitable repeatable tool. Do not fabricate performance results.

## 10.2 Code quality

- Follow existing project conventions.
- Reuse existing components where appropriate.
- Avoid unnecessary abstraction.
- Keep components reasonably focused.
- Keep shared business data in existing configuration or data sources.
- Use the existing type system.
- Preserve existing error handling patterns.
- Remove dead code introduced by the redesign.
- Do not leave debug statements, placeholder URLs, or unfinished TODOs.
- Do not suppress errors simply to make the build pass.

## 10.3 Security and privacy

- Do not expose API keys or secrets in client-side code.
- Do not introduce new third-party tracking without justification.
- Do not log sensitive health information in analytics.
- Do not add unnecessary health-data collection.
- Do not place sensitive information into query strings.
- Follow existing privacy and consent requirements.
- Keep WhatsApp messages optional and editable.

---

# 11. ANALYTICS AND SUCCESS METRICS

Reuse the existing analytics system if available. Do not install a second analytics platform without a clear reason.

Track the following events where supported.

| Event | Trigger | Purpose |
|---|---|---|
| `homepage_view` | Homepage viewed | Establish baseline traffic |
| `consultation_cta_click` | Consultation CTA clicked | Measure primary intent |
| `whatsapp_cta_click` | WhatsApp link clicked | Measure contact intent |
| `service_card_click` | Service card selected | Understand service discovery |
| `booking_started` | Booking flow actually starts | Measure booking intent |
| `booking_completed` | Booking successfully confirmed | Measure outcomes |
| `product_card_click` | Product opened | Measure shop interest |
| `clinic_directions_click` | Directions link clicked | Measure clinic intent |
| `enquiry_submitted` | Enquiry successfully submitted | Measure genuine enquiries |

### Analytics requirements

- Do not count a button click as a completed booking.
- Use the existing booking confirmation as the source of truth.
- Prevent duplicate events where practical.
- Do not include health details, names, phone numbers, or other sensitive user information in event payloads.
- Document the event names and triggers.
- If analytics does not exist, implement only a lightweight, privacy-conscious approach appropriate to the current architecture.

### Success evaluation

Establish a baseline before launch.

Evaluate:

1. Consultation CTA click-through rate.
2. Booking completion rate.
3. Qualified enquiries.
4. Booking and enquiry error rate.
5. Mobile conversion performance.
6. Page performance and usability.

Do not invent a numerical conversion improvement target without baseline data.

---

# 12. IMPLEMENTATION PLAN

## Phase 1: Audit and baseline

- Inspect the codebase.
- Run the current application.
- Capture desktop and mobile screenshots.
- Identify existing routes and functional dependencies.
- Verify current CTA destinations.
- Reproduce suspected loading or rendering problems.
- Document the files and components that need changes.

Deliverable: concise discovery report and implementation plan.

## Phase 2: Design foundation

- Reconcile existing brand tokens with the specified palette.
- Verify logo and font assets.
- Define consistent spacing, typography, buttons, borders, and surfaces.
- Update shared GUI components only when required.
- Confirm the design works at mobile and desktop sizes.

Deliverable: reusable design foundation without unnecessary architectural changes.

## Phase 3: Homepage implementation

Implement the homepage sections in this order:

1. Header.
2. Hero and primary CTAs.
3. Compact trust strip.
4. Service discovery.
5. Consultation conversion section.
6. Practitioner profile.
7. Herbal products.
8. Clinic information.
9. FAQs.
10. Footer.

Reuse existing routes, components, and data sources.

## Phase 4: Integration and responsive QA

- Test every CTA.
- Verify WhatsApp behavior.
- Verify booking navigation and confirmation.
- Test product links.
- Check loading, empty, and error states.
- Test the specified viewport sizes.
- Test keyboard navigation and accessibility.
- Inspect shared components on every affected route.

## Phase 5: Validation and delivery

Run the existing:

- Lint checks.
- Type checks.
- Unit tests.
- Relevant integration tests.
- Production build.
- Accessibility checks.
- Performance checks.

Fix regressions caused by the implementation.

Deliver a concise summary of what changed, what was tested, and any remaining issues.

---

# 13. ACCEPTANCE CRITERIA

The implementation is complete only when the following requirements are met.

## Homepage experience

- [ ] The hero clearly communicates the business and its offering.
- [ ] Consultation booking is the primary visual action.
- [ ] WhatsApp enquiry is a clear secondary action.
- [ ] Service discovery is straightforward.
- [ ] Practitioner information is accurate and easy to find.
- [ ] Clinic information is accessible.
- [ ] Product cards use actual product data.
- [ ] Redundant promotional sections are removed or consolidated.
- [ ] The design consistently follows the approved brand direction.

## Functional correctness

- [ ] Every CTA points to a real destination.
- [ ] WhatsApp opens the intended business contact.
- [ ] Existing booking rules remain unchanged.
- [ ] Booking confirmation reflects actual success.
- [ ] Product navigation and purchasing functionality remain intact.
- [ ] Loading, empty, and error states are handled appropriately.
- [ ] No existing feature is removed merely because it is outside the redesign.
- [ ] No placeholder content is left in the final implementation.

## Responsive and accessibility quality

- [ ] No unintended horizontal overflow at target widths.
- [ ] Header and mobile navigation function correctly.
- [ ] Buttons and links are keyboard accessible.
- [ ] Focus states are visible.
- [ ] Text and controls have sufficient contrast.
- [ ] Images have appropriate alternative text.
- [ ] Forms and errors are accessible.
- [ ] Reduced-motion preferences are respected where relevant.

## Technical quality

- [ ] Existing architecture is preserved.
- [ ] Shared component changes are limited and justified.
- [ ] All affected routes pass regression testing.
- [ ] Existing lint, type, and build checks pass, or pre-existing failures are documented separately.
- [ ] No secrets are exposed.
- [ ] No unnecessary dependencies are introduced.
- [ ] Analytics does not collect sensitive health information.
- [ ] Changes are summarized with relevant files and tests.

---

# 14. REQUIRED REGRESSION TESTING FOR SHARED GUI CHANGES

If the header, footer, typography, buttons, layout containers, global CSS, or shared design tokens change, test the affected existing routes.

At minimum, where these routes exist:

- Homepage.
- Consultation pages.
- Hijama pages.
- Product listing.
- Product detail.
- Cart and checkout.
- Contact page.
- About or practitioner page.
- Any existing authentication or account pages.

Check:

- Visual consistency.
- Navigation.
- Layout and overflow.
- CTA functionality.
- Form usability.
- Product and booking interactions.
- Mobile responsiveness.
- Console errors and failed requests.

Do not redesign these routes. Only correct regressions directly caused by the shared changes.

If a route cannot be tested because its backend or external service is unavailable, document the limitation rather than claiming it passed.

---

# 15. DELIVERABLES

The coding agent must deliver:

1. Fully implemented homepage redesign.
2. Reusable styling and shared components required by the redesign.
3. Preserved existing routes and functionality.
4. Responsive layouts.
5. Appropriate loading, empty, and error states.
6. Analytics events where supported.
7. Relevant tests or updated test coverage.
8. Desktop and mobile screenshots of the finished homepage.
9. A list of modified files and a short explanation of significant changes.
10. Test results and any unresolved issues.
11. A clear list of platform-wide GUI changes, with justification for each.

Do not deliver only a design proposal, static mockup, or disconnected prototype. Implement the redesign in the existing application.

---

# 16. FINAL INSTRUCTIONS TO THE CODING AGENT

You are modifying an existing production-oriented website, not building a new website from scratch.

Follow these rules throughout implementation:

1. Inspect before changing.
2. Preserve the existing architecture and business logic.
3. Optimize for consultation bookings and qualified enquiries.
4. Use the existing Tameer-e-Sehat brand assets and design direction.
5. Implement the homepage first.
6. Change shared GUI components only when necessary.
7. Regression-test every route affected by shared changes.
8. Never invent business information, product details, health claims, or credentials.
9. Never claim an action succeeded without actual confirmation.
10. Prioritize functional correctness, usability, accessibility, and performance over decorative complexity.
11. Make reasonable implementation decisions independently when the existing codebase provides sufficient evidence.
12. If an essential requirement is ambiguous, inspect existing behavior and data before asking for clarification.
13. Do not expand the scope into a full-platform redesign.
14. Do not stop at planning; complete the implementation and validate it.

**Definition of success:** The homepage provides a coherent, premium brand experience, makes consultation and enquiry actions immediately understandable, works reliably on mobile and desktop, and improves the path to conversion without breaking the existing platform.