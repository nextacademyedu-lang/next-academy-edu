# Next Academy — Corporate Design System (Almentor Reference)

## Overview

This design system is strictly designed to give a premium, solid, and highly professional **Corporate Dark Mode** aesthetic, directly inspired by the Almentor reference provided. It abandons flashy neon gradients in favor of strong typography, stark contrasts, and strict grid alignments.

## 1. Color Palette (Corporate Dark)

```css
:root {
  /* Dark Backgrounds */
  --bg-main: #020504; /* Deep black/dark green for main background */
  --bg-surface: #111111; /* Slightly lighter for cards (or use a slight variation of main) */
  --bg-surface-hover: #1a1a1a; /* Interactive state for cards */

  /* Brand/Action Colors */
  --brand-primary: #c51b1b; /* User red for Primary CTAs */
  --brand-primary-hover: #a01515; /* Darker red on hover */

  --brand-gold: #d6a32b; /* User gold for highlights/premium indicators */

  /* Text Colors */
  --text-primary: #f1f6f1; /* User cream/off-white for headings and main text */
  --text-secondary: #c5c5c5; /* User gray for subtitles, duration, tags */
  --text-muted: #888888; /* Darker gray for disabled or tertiary text */

  /* Borders */
  --border-subtle: rgba(197, 197, 197, 0.2); /* Using the gray with opacity */
}
```

## 2. Typography System (RTL / Arabic Support)

```css
:root {
  /* Fonts */
  /* Cairo or Tajawal are heavy, corporate-friendly Arabic fonts */
  --font-family-primary: "Cairo", "Inter", -apple-system, sans-serif;

  /* Scale */
  --text-h1: clamp(40px, 5vw, 64px); /* Massive Hero */
  --text-h2: clamp(28px, 3vw, 40px); /* Section Titles */
  --text-h3: clamp(20px, 2.5vw, 24px); /* Card Titles */
  --text-body-lg: 18px; /* Hero Subtitle */
  --text-body: 16px; /* Standard readable text */
  --text-small: 14px; /* Meta data (author, time) */

  /* Weights */
  --font-regular: 400;
  --font-medium: 600;
  --font-bold: 800; /* Prominent bolding for Almentor style titles */
}
```

## 3. UI Components

### Corporate Button (Primary)

```css
.btn-primary {
  background-color: var(--brand-primary);
  color: #ffffff;
  border-radius: 4px; /* Sharp, professional corners instead of pills */
  padding: 12px 32px;
  font-weight: 800;
  font-size: var(--text-body);
  border: none;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--brand-primary-hover);
}
```

### Corporate Button (Secondary / Outline)

```css
.btn-secondary {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--text-primary);
  border-radius: 4px;
  padding: 12px 32px;
  font-weight: 600;
  font-size: var(--text-body);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
```

### Clean Course Cards

```css
.program-card {
  background-color: var(--bg-surface);
  border-radius: 8px; /* Slight rounding, not overly bubbly */
  overflow: hidden;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
  border: 1px solid transparent;
}

.program-card:hover {
  transform: translateY(-4px);
  background-color: var(--bg-surface-hover);
  border-color: var(--border-subtle);
}

.program-card .image-wrapper {
  aspect-ratio: 16/9;
  width: 100%;
  background-color: #222;
}

.program-card .content {
  padding: 24px;
}

.program-card .category-tag {
  color: var(--text-secondary);
  font-size: var(--text-small);
  margin-bottom: 8px;
}

.program-card .title {
  color: var(--text-primary);
  font-size: var(--text-h3);
  font-weight: var(--font-bold);
  margin-bottom: 16px;
}

.program-card .meta {
  color: var(--text-muted);
  font-size: var(--text-small);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

## 4. Spacing System

The layout requires generous "breathing room" to feel premium.

- **Section Padding:** `80px` on mobile, `120px` on desktop.
- **Container Max Width:** `1280px` (standard corporate grid).
- **Element Gaps:**
  - `8px` between related text elements (title and subtitle).
  - `24px` between paragraphs and buttons.
  - `32px` column gap in grids.

## 5. Visual Effects

- **No Glows:** Remove all glassmorphic cyan/purple blurs. The brand is built on stark photography and absolute darkness.
- **Shadows:** Removed entirely. The distinction between background `(#000000)` and surface `(#111111)` is enough for hierarchy.
- **Photography:** Images must be high-contrast, dramatic lighting, focusing on human faces looking forward.

## 6. Layout Principles (RTL First)

Because the reference is from a Middle Eastern product (Almentor), the UI architecture must logically flow Right-to-Left natively when Arabic is selected, with text right-aligned and icons on the right by default in RTL mode.

---

## 7. Responsive Breakpoints (Mobile-First)

```css
:root {
  /* Mobile-first: default styles are for mobile (< 640px) */
  --breakpoint-sm: 640px;   /* Small tablets, large phones (landscape) */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Small desktops, landscape tablets */
  --breakpoint-xl: 1280px;  /* Standard desktops (container max-width) */
  --breakpoint-2xl: 1536px; /* Large screens */
}

/* Usage: ALWAYS mobile-first (min-width, never max-width) */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Grid Layouts

```text
Program Cards Grid:
├── Mobile (< 640px): 1 column
├── Tablet (640-1024px): 2 columns
├── Desktop (1024px+): 3 columns
└── Wide (1280px+): 4 columns (optional)

Dashboard Layout:
├── Mobile: single column, bottom nav
├── Tablet: sidebar (240px) + content
└── Desktop: sidebar (280px) + content

Instructor Cards: Same as program cards
Blog Grid: Same as program cards
```

---

## 8. Loading States

### Skeleton Screens

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 0%,
    var(--bg-surface-hover) 50%,
    var(--bg-surface) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton variants */
.skeleton-text { height: 16px; width: 80%; margin-bottom: 8px; }
.skeleton-title { height: 24px; width: 60%; margin-bottom: 16px; }
.skeleton-image { aspect-ratio: 16/9; width: 100%; }
.skeleton-avatar { width: 48px; height: 48px; border-radius: 50%; }
.skeleton-button { height: 44px; width: 120px; border-radius: 4px; }
```

### Button Loading

```css
.btn-loading {
  position: relative;
  color: transparent; /* Hide text */
  pointer-events: none;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  inset: 0;
  margin: auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Page Loading

```text
├── Top-of-page progress bar (thin, gold accent)
├── Width: 100%, height: 3px
├── Color: var(--brand-gold)
├── Position: fixed top, z-index: 9999
└── Animation: indeterminate shimmer
```

---

## 9. Empty States

```text
Design Pattern:
├── Centered layout (both axes)
├── Icon or illustration (64px, muted color)
├── Title (text-h3, text-secondary)
├── Description (text-body, text-muted)
├── CTA button (if applicable)
└── Max width: 400px

Color: 
├── Icon: var(--text-muted)
├── Title: var(--text-secondary)
├── Description: var(--text-muted)
└── Background: same as page (no special container)
```

---

## 10. Status & Feedback States

### Toast Notifications

```css
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%; /* RTL: will auto-flip */
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: var(--text-body);
  font-weight: var(--font-medium);
  z-index: 9000;
  animation: toast-slide-up 0.3s ease;
  max-width: 400px;
}

.toast-success {
  background-color: #1a3a1a;
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.toast-error {
  background-color: #3a1a1a;
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.toast-warning {
  background-color: #3a2a1a;
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.toast-info {
  background-color: #1a2a3a;
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}
```

### Inline Status Badges

```css
:root {
  /* Status Colors */
  --status-success: #4ade80;      /* مؤكد، مدفوع، نشط */
  --status-success-bg: #1a3a1a;
  --status-warning: #fbbf24;       /* في الانتظار، قيد المراجعة */
  --status-warning-bg: #3a2a1a;
  --status-error: #f87171;         /* ملغي، متأخر، مرفوض */
  --status-error-bg: #3a1a1a;
  --status-info: #60a5fa;          /* جديد، قادم */
  --status-info-bg: #1a2a3a;
  --status-neutral: #a1a1aa;       /* مكتمل، مؤرشف */
  --status-neutral-bg: #2a2a2a;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 100px; /* Pill shape for badges */
  font-size: var(--text-small);
  font-weight: var(--font-medium);
  gap: 6px;
}

.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

---

## 11. Form Field States

```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  color: var(--text-secondary);
  font-size: var(--text-small);
  font-weight: var(--font-medium);
}

.form-input {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: var(--text-body);
  font-family: var(--font-family-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Focus State */
.form-input:focus {
  outline: none;
  border-color: var(--brand-gold);
  box-shadow: 0 0 0 3px rgba(214, 163, 43, 0.15);
}

/* Error State */
.form-input[aria-invalid="true"],
.form-input.error {
  border-color: var(--status-error);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
}

/* Success State */
.form-input.success {
  border-color: var(--status-success);
}

/* Disabled State */
.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(17, 17, 17, 0.5);
}

/* Error Message */
.form-error {
  color: var(--status-error);
  font-size: 13px;
}

/* Help Text */
.form-help {
  color: var(--text-muted);
  font-size: 13px;
}

/* Required Indicator */
.form-label .required {
  color: var(--status-error);
  margin-inline-start: 4px;
}
```

---

## 12. Modal / Dialog

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 8000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.2s ease;
}

.modal {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  width: min(90vw, 560px);
  max-height: 85vh;
  overflow-y: auto;
  padding: 32px;
  animation: modal-scale 0.2s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: var(--text-h3);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.modal-close:hover { color: var(--text-primary); }

@keyframes modal-scale {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 13. Animation Tokens

```css
:root {
  /* Duration */
  --duration-instant: 100ms;    /* Micro-interactions (hover color) */
  --duration-fast: 200ms;       /* Button hover, focus */
  --duration-normal: 300ms;     /* Transitions, modals */
  --duration-slow: 500ms;       /* Page transitions, complex animations */
  --duration-slower: 800ms;     /* Entrance animations */

  /* Easing */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);  /* Material standard */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);          /* Accelerate (exit) */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);         /* Decelerate (enter) */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring (attention) */
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. Z-Index Scale

```css
:root {
  --z-dropdown: 100;       /* Dropdown menus */
  --z-sticky: 200;         /* Sticky elements (navbar) */
  --z-fixed: 300;          /* Fixed positioned elements */
  --z-drawer: 400;         /* Side drawers, mobile menu */
  --z-modal-overlay: 500;  /* Modal backdrop */
  --z-modal: 600;          /* Modal content */
  --z-popover: 700;        /* Tooltips, popovers */
  --z-toast: 800;          /* Toast notifications */
  --z-loading: 900;        /* Full-page loading overlay */
  --z-max: 9999;           /* Top progress bar */
}
```

---

## 15. Dark Mode Note

```text
This is a dark-mode-ONLY design system. There is intentionally NO light mode.
The corporate dark theme IS the brand identity.

If light mode is requested in the future:
├── Create separate set of CSS variables
├── Use prefers-color-scheme media query
├── Toggle via class on <html> element
└── But for now: dark mode only, always
```
