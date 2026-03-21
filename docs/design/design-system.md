---
description: 
---


# Next Academy — Visual Design System (Figma-Aligned)

## Overview

This design system defines a clean, premium, education-focused visual language for Next Academy, aligned to the latest Figma direction.
It supports both **dark mode** and **light mode**, uses semantic design tokens, and keeps accessibility, RTL, and i18n requirements as first-class rules.

The visual direction is:

- Compact and polished, not bulky
- Strong red brand accent
- Flat, clean surfaces with subtle borders
- Readable cards and buttons in both themes
- Minimal shadows, minimal visual noise
- RTL-first for Arabic, with English fully supported

---

## 1. Theme Tokens

```css
:root {
  /* Brand */
  --brand-primary: #c81d25;
  --brand-primary-hover: #a9151c;
  --brand-primary-soft: rgba(200, 29, 37, 0.10);

  /* Typography */
  --font-family-ar: "Cairo", "Inter", system-ui, sans-serif;
  --font-family-en: "Montserrat", "Inter", system-ui, sans-serif;

  --text-h1: clamp(36px, 4vw, 56px);
  --text-h2: clamp(26px, 3vw, 36px);
  --text-h3: 20px;
  --text-body-lg: 18px;
  --text-body: 16px;
  --text-small: 14px;
  --text-xs: 12px;

  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Radius */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 999px;

  /* Spacing */
  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Motion */
  --duration-fast: 160ms;
  --duration-normal: 220ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-overlay: 500;
  --z-modal: 600;
  --z-toast: 800;
}
```

### Dark Theme

```css
html[data-theme="dark"] {
  --bg-main: #1f1f1f;
  --bg-surface: #0f0f10;
  --bg-surface-2: #171718;
  --bg-surface-hover: #202022;

  --text-primary: #f7f7f7;
  --text-secondary: #d7d7d7;
  --text-muted: #a7a7a7;

  --border-subtle: rgba(255, 255, 255, 0.12);
  --border-strong: rgba(255, 255, 255, 0.24);

  --button-secondary-bg: #f5f5f2;
  --button-secondary-text: #1a1a1a;
  --button-secondary-hover: #e9e9e4;

  --card-bg: #101010;
  --card-text: #f5f5f5;
  --card-meta: #cfcfcf;
  --chip-bg: rgba(0, 0, 0, 0.55);
  --chip-text: #ffffff;

  --icon-surface: rgba(255, 255, 255, 0.10);
  --icon-stroke: #ffffff;
}
```

### Light Theme

```css
html[data-theme="light"] {
  --bg-main: #f3f3ef;
  --bg-surface: #ffffff;
  --bg-surface-2: #faf9f6;
  --bg-surface-hover: #f5f4f1;

  --text-primary: #171717;
  --text-secondary: #4f4f4f;
  --text-muted: #767676;

  --border-subtle: rgba(0, 0, 0, 0.10);
  --border-strong: rgba(0, 0, 0, 0.18);

  --button-secondary-bg: #181818;
  --button-secondary-text: #ffffff;
  --button-secondary-hover: #2a2a2a;

  --card-bg: #ffffff;
  --card-text: #181818;
  --card-meta: #5d5d5d;
  --chip-bg: rgba(25, 25, 25, 0.88);
  --chip-text: #ffffff;

  --icon-surface: rgba(255, 255, 255, 0.92);
  --icon-stroke: #1b1b1b;
}
```

---

## 2. Typography

```css
html[lang="ar"] body {
  font-family: var(--font-family-ar);
}

html[lang="en"] body {
  font-family: var(--font-family-en);
}

body {
  background: var(--bg-main);
  color: var(--text-primary);
  font-size: var(--text-body);
  line-height: 1.5;
}
```

Rules:

- Arabic is RTL by default
- English is LTR
- Use `text-align: start`
- Use logical CSS properties only
- Keep small metadata at 12px–14px only when contrast stays compliant

---

## 3. Buttons

### Primary Button

```css
.btn-primary {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--brand-primary);
  color: #ffffff;
  font-size: 13px;
  font-weight: var(--font-semibold);
  line-height: 1;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-default),
    transform var(--duration-fast) var(--ease-default);
}

.btn-primary:hover:not(:disabled) {
  background: var(--brand-primary-hover);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
}
```

### Secondary Button

```css
.btn-secondary {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  font-size: 13px;
  font-weight: var(--font-semibold);
  line-height: 1;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-default),
    color var(--duration-fast) var(--ease-default);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--button-secondary-hover);
}
```

### Button Rules

- Buttons are compact, not oversized
- No pill-heavy corporate style
- Default CTA uses red
- Secondary CTA inverts by theme
- Disabled state uses lower opacity but text must remain readable

---

## 4. Program Cards

```css
.program-card {
  background: var(--card-bg);
  color: var(--card-text);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition:
    transform var(--duration-fast) var(--ease-default),
    border-color var(--duration-fast) var(--ease-default),
    background var(--duration-fast) var(--ease-default);
}

.program-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  background: var(--bg-surface-hover);
}

.program-card__image {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
  display: block;
}

.program-card__body {
  padding: 10px 12px 12px;
}

.program-card__category {
  font-size: 10px;
  font-weight: var(--font-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #b89a63;
}

.program-card__rating {
  margin-top: 4px;
  font-size: 11px;
  color: var(--card-meta);
}

.program-card__title {
  margin-top: 6px;
  font-size: 18px;
  line-height: 1.3;
  font-weight: var(--font-medium);
  color: var(--card-text);
}

.program-card__meta {
  margin-top: 10px;
  display: grid;
  gap: 2px;
  font-size: 11px;
  color: var(--card-meta);
}

.program-card__footer {
  margin-top: 12px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.program-card__price {
  font-size: 24px;
  font-weight: var(--font-medium);
  line-height: 1;
  color: var(--card-text);
}
```

### Card Extras

```css
.program-card__chip {
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;
  height: 22px;
  padding-inline: 10px;
  border-radius: var(--radius-pill);
  background: var(--chip-bg);
  color: var(--chip-text);
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.program-card__save {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  background: var(--icon-surface);
  color: var(--icon-stroke);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

Card rules:

- Keep the layout compact and information-dense
- Use subtle borders instead of heavy shadows
- Preserve the same structure in dark and light themes
- CTA stays small and visually secondary to the card title and price

---

## 5. Navbar

```css
.navbar {
  height: 52px;
  background: #111111;
  color: #f5f5f5;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.navbar__container {
  max-width: 1280px;
  height: 100%;
  margin-inline: auto;
  padding-inline: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar__link {
  color: #d8d8d8;
  font-size: 12px;
  font-weight: var(--font-medium);
  text-decoration: none;
}

.navbar__link:hover {
  color: #ffffff;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

Navbar rules:

- Compact height
- Low visual noise
- Theme and language controls stay visible
- CTA button is small and aligned with the rest of the header

---

## 6. Forms

```css
.form-label {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: var(--font-medium);
}

.form-input {
  min-height: 40px;
  padding: 10px 12px;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.form-input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(200, 29, 37, 0.14);
}
```

Rules:

- Inputs should match the compact button language
- Error and help text must remain readable in both themes
- Never rely on color alone to communicate state

---

## 7. Visual Effects

Rules:

- No glassmorphism
- No oversized shadows
- Use borders first, shadows second
- Hover motion should be subtle
- Photography can be dramatic, UI chrome should stay calm

Suggested shadow:

```css
--shadow-soft: 0 6px 18px rgba(0, 0, 0, 0.08);
```

Use this only in light mode and only when separation is actually needed.

---

## 8. Accessibility Rules

The system must stay compliant with WCAG 2.1 AA.

```text
Normal text: minimum 4.5:1
Large text: minimum 3:1
Icons and UI boundaries: minimum 3:1
Focus indicators: visible and high-contrast
Placeholder text: do not drop below readable contrast
```

Additional rules:

- All icon-only buttons require `aria-label`
- Save/bookmark buttons must have focus-visible styles
- Use real text, not text baked into images
- Dark and light themes must both be tested separately

---

## 9. RTL and i18n Rules

- Arabic is default and RTL
- English is LTR
- Use logical properties only
- Prices, dates, phone numbers, and URLs must remain readable and direction-safe
- Theme toggle and language switch remain available in navbar on all pages

---

## 10. Responsive Rules

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

Grid behavior:

- Mobile: 1 card per row
- Tablet: 2 cards per row
- Desktop: 3 cards per row
- Wide desktop: 4 cards per row if content density allows

---

## 11. Theme Policy

This system is **not dark-only anymore**.

Rules:

- Support both `html[data-theme="dark"]` and `html[data-theme="light"]`
- Do not duplicate component CSS unnecessarily; rely on semantic tokens
- Keep component structure identical across themes
- Only tokens should change between dark and light wherever possible

```

