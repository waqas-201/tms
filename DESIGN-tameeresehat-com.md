# Design System Inspired by Tameere Sehat

> Auto-extracted from `https://tameeresehat.com/` on 2026-09-13

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

The hero section leads with "Your Trusted".

**Key Characteristics:**
- Outfit as the heading font (custom web font loaded via @font-face)
- outfit as the body font for all running text
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#ae14d2` used for CTAs and brand highlights
- 6 shadow level(s) detected — tinted shadows
- Rounded corners (3px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#ae14d2`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#1346af`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#2f5336`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#514e4e`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#2f5336`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#111111`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | block | large | text-dark |
| 2 | `#2f5336` | `--palette-2` | block | large | text-light |
| 3 | `#1b422a` | `--palette-3` | text-accent | large | text-light |
| 4 | `#111111` | `--palette-4` | badge | large | text-light |
| 5 | `#292f34` | `--palette-5` | block | medium | text-light |
| 6 | `#f1f3f5` | `--palette-6` | block | medium | text-dark |
| 7 | `#4a5d43` | `--palette-7` | block | medium | text-light |
| 8 | `#1346af` | `--palette-8` | button | small | text-light |
| 9 | `#42855b` | `--palette-9` | badge | small | text-light |
| 10 | `#6a7078` | `--palette-10` | badge | small | text-light |
| 11 | `#ae14d2` | `--palette-11` | text-accent | small | text-light |
| 12 | `#2142b2` | `--palette-12` | text-accent | small | text-light |

## 3. Typography Rules

- **Heading Font:** `Outfit` (web font)
- **Body Font:** `outfit` (web font)

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H2 | Outfit | 36px | 600 | 36px | normal |
| H3 | outfit | 17px | 500 | 23.8px | normal |
| H4 | outfit | 13px | 400 | 19.5px | normal |
| Body | outfit | 18px | 600 | 21.6px | normal |
| Small | outfit | 14px | 400 | 28px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `63px` | headings |
| H1 | `60px` | headings |
| H2 | `42px` | headings |
| H3 | `41px` | headings |
| H4 | `40px` | headings |
| Body L | `37px` | body / supporting text |
| Body | `36px` | body / supporting text |
| Small | `32px` | body / supporting text |
| XS | `29px` | body / supporting text |
| Caption | `26px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #2b2b2b;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 14px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #514e4e;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 0px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button 2

```css
.btn-ghost-2 {
  background: transparent;
  color: #ffffff;
  border-radius: 6px;
  padding: 18px 30px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #ffffff;
  color: #111111;
  border-radius: 3px;
  padding: 8px 8px;
  font-size: 15px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button 2

```css
.btn-filled-2 {
  background: #ffffff;
  color: #ae14d2;
  border-radius: 3px;
  padding: 8px 8px;
  font-size: 15px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button 3

```css
.btn-filled-3 {
  background: #ffffff;
  color: #2142b2;
  border-radius: 3px;
  padding: 8px 8px;
  font-size: 15px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Card

```css
.card {
  background: #ffffff;
  border-radius: 10px;
  padding: 0px;
}
```

## 5. Layout Principles

- **Base spacing unit:** `8px` — use multiples (16px, 24px, 32px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `8px` | element |
| spacing-2 | `10px` | element |
| spacing-3 | `12px` | element |
| spacing-4 | `20px` | element |
| spacing-5 | `18px` | element |
| spacing-6 | `6px` | element |
| spacing-7 | `23px` | element |
| spacing-8 | `1px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-subtle | `3px` | subtle |
| radius-pill | `100px` | pill |
| radius-subtle | `5px` | subtle |
| radius-card | `50px` | card |
| radius-button | `10px` | button |
| radius-subtle | `4px` | subtle |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Mid | `rgba(3, 2, 2, 0.1) 0px 1px 10px 0px` | Dropdowns, popovers |
| Mid | `rgba(125, 122, 122, 0.2) 0px 2px 8px 0px` | Dropdowns, popovers |
| Low | `rgba(0, 0, 0, 0.2) 0px 1px 4px 0px` | Cards, subtle elevation |
| Deep | `rgba(0, 0, 0, 0.08) 0px 20px 50px 0px` | Hero sections, deep layers |
| Mid | `rgba(0, 0, 0, 0.03) 0px -3px 15px 6px` | Dropdowns, popovers |

> **Note:** This site uses chromatic (color-tinted) shadows rather than pure black — this is a deliberate brand choice that adds warmth to elevation.

## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `Outfit` for all headings and `outfit` for body text
- Use `#ae14d2` as the single dominant accent/CTA color
- Maintain `8px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`3px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Outfit/outfit with generic alternatives
- Don't use irregular spacing — stick to 8px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use pure black (#000000) for text — use `#514e4e` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 8px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #514e4e
Accent:      #ae14d2
Secondary:   #1346af
Border:      #111111
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `Outfit` heading in `#514e4e`, and a `#ae14d2` CTA button with 3px radius."
2. "Create a pricing card using background `#2f5336`, border `#111111`, `outfit` for text, and 24px padding."
3. "Design a navigation bar — `#ffffff` background, `#514e4e` links, `#ae14d2` for active state."
4. "Build a feature grid with 3 columns, 24px gap, each card using the card component style."
5. "Create a footer with `#514e4e` background, `#ffffff` text, and 16px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 101 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--wp--preset--color--black` | `#000000` |
| `--wp--preset--color--cyan-bluish-gray` | `#abb8c3` |
| `--wp--preset--color--white` | `#ffffff` |
| `--wp--preset--color--pale-pink` | `#f78da7` |
| `--wp--preset--color--vivid-red` | `#cf2e2e` |
| `--wp--preset--color--luminous-vivid-orange` | `#ff6900` |
| `--wp--preset--color--luminous-vivid-amber` | `#fcb900` |
| `--wp--preset--color--light-green-cyan` | `#7bdcb5` |
| `--wp--preset--color--vivid-green-cyan` | `#00d084` |
| `--wp--preset--color--pale-cyan-blue` | `#8ed1fc` |
| `--wp--preset--color--vivid-cyan-blue` | `#0693e3` |
| `--wp--preset--color--vivid-purple` | `#9b51e0` |
| `--wp--preset--color--woostify-primary` | `#25B54B` |
| `--wp--preset--color--woostify-heading` | `#2b2b2b` |
| `--wp--preset--color--woostify-text` | `#514E4E` |
| `--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple` | `linear-gradient(135deg,rgb(6,147,227) 0%,rgb(155,81,224) 100%)` |
| `--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan` | `linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%)` |
| `--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange` | `linear-gradient(135deg,rgb(252,185,0) 0%,rgb(255,105,0) 100%)` |
| `--wp--preset--gradient--luminous-vivid-orange-to-vivid-red` | `linear-gradient(135deg,rgb(255,105,0) 0%,rgb(207,46,46) 100%)` |
| `--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray` | `linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%)` |
| `--wp--preset--gradient--cool-to-warm-spectrum` | `linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%)` |
| `--wp--preset--gradient--blush-light-purple` | `linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%)` |
| `--wp--preset--gradient--blush-bordeaux` | `linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%)` |
| `--wp--preset--gradient--luminous-dusk` | `linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%)` |
| `--wp--preset--gradient--pale-ocean` | `linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%)` |
| `--wp--preset--gradient--electric-grass` | `linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%)` |
| `--wp--preset--gradient--midnight` | `linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%)` |
| `--wp--preset--shadow--natural` | `6px 6px 9px rgba(0, 0, 0, 0.2)` |
| `--wp--preset--shadow--deep` | `12px 12px 50px rgba(0, 0, 0, 0.4)` |
| `--wp--preset--shadow--sharp` | `6px 6px 0px rgba(0, 0, 0, 0.2)` |
| ... | *(25 more)* |

### Spacing Variables

| Variable | Value |
|---|---|
| `--direction-multiplier` | `1` |
| `--wp--preset--aspect-ratio--square` | `1` |
| `--wp--preset--spacing--20` | `0.44rem` |
| `--wp--preset--spacing--30` | `0.67rem` |
| `--wp--preset--spacing--40` | `1rem` |
| `--wp--preset--spacing--50` | `1.5rem` |
| `--wp--preset--spacing--60` | `2.25rem` |
| `--wp--preset--spacing--70` | `3.38rem` |
| `--wp--preset--spacing--80` | `5.06rem` |
| `--swiper-navigation-size` | `44px` |
| `--checkmark-width` | `18px` |
| `--checkmark-height` | `18px` |
| `--details-page-attr-width` | `30px` |
| `--details-page-attr-height` | `30px` |
| `--showcase-attr-width` | `30px` |
| `--showcase-attr-height` | `30px` |
| `--tooltip-image-padding` | `3px` |
| `--variation-attr-border-radius` | `4px` |
| `--vg-grid-column` | `4` |
| `--vg-thumb-item-inner-padding` | `10px` |
| ... | *(3 more)* |

### Typography Variables

| Variable | Value |
|---|---|
| `--wp--preset--font-size--small` | `13px` |
| `--wp--preset--font-size--medium` | `20px` |
| `--wp--preset--font-size--large` | `36px` |
| `--wp--preset--font-size--x-large` | `42px` |
| `--wp--preset--font-size--woostify-heading-6` | `18px` |
| `--wp--preset--font-size--woostify-heading-5` | `26px` |
| `--wp--preset--font-size--woostify-heading-4` | `28px` |
| `--wp--preset--font-size--woostify-heading-3` | `30px` |
| `--wp--preset--font-size--woostify-heading-2` | `36px` |
| `--wp--preset--font-size--woostify-heading-1` | `48px` |
| `--details-page-attr-label-font-size` | `16px` |
| `--checkmark-font-size` | `13px` |
| `--details-page-attr-font-size` | `16px` |
| `--showcase-attr-font-size` | `16px` |

### Other Variables

| Variable | Value |
|---|---|
| `--page-title-display` | `block` |
| `--wp--preset--aspect-ratio--4-3` | `4/3` |
| `--wp--preset--aspect-ratio--3-4` | `3/4` |
| `--wp--preset--aspect-ratio--3-2` | `3/2` |
| `--wp--preset--aspect-ratio--2-3` | `2/3` |
| `--wp--preset--aspect-ratio--16-9` | `16/9` |
| `--wp--preset--aspect-ratio--9-16` | `9/16` |
| `--vg-main-slider-v-alignment` | `flex-start` |
| `--vg-main-slider-border-color` | `transparent` |
