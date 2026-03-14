# Next Academy — Accessibility (WCAG 2.1 AA)

> Last Updated: 2026-03-13 04:00
> Standard: WCAG 2.1 Level AA
> Priority: 🟢 Required before production launch

---

## 1. Core Requirements

### 1.1 Color Contrast

```text
WCAG AA Requirements:
├── Normal text (< 18px): contrast ratio ≥ 4.5:1
├── Large text (≥ 18px or ≥ 14px bold): contrast ratio ≥ 3:1
├── UI components & icons: contrast ratio ≥ 3:1
└── Non-text content (charts, graphs): contrast ratio ≥ 3:1

Current Design System Check:
├── --text-primary (#EAEAEA) on --bg-primary (#0F0F1A) → ✅ 14.2:1
├── --text-secondary (#A0A0B0) on --bg-primary → ⚠️ Check: ~7.8:1 ✅
├── --accent (#D4AF37) on --bg-primary → ⚠️ Check: ~6.1:1 ✅
├── --accent (#D4AF37) on --bg-card (#1A1A2E) → ⚠️ Check: ~5.4:1 ✅
├── --text-primary on --bg-card → ✅ ~12.5:1
├── --error (#FF3B30) on --bg-primary → Check needed
├── --success (#34C759) on --bg-primary → Check needed
└── Placeholder text → Must meet 4.5:1 contrast

Action Items:
├── Verify ALL color combinations with contrast checker
├── Adjust --text-muted if below 4.5:1
├── Error/success states: ensure readable on dark backgrounds
└── Focus indicators: visible at 3:1 contrast minimum
```

### 1.2 Keyboard Navigation

```text
Every interactive element MUST be:
├── Focusable (tabindex="0" or native focus)
├── Operable via keyboard (Enter or Space to activate)
├── Visible focus indicator (2px outline, high contrast)
└── Logical tab order (follows visual order)

Specific Components:
├── Modals: trap focus inside, Escape to close
├── Dropdown menus: Arrow keys to navigate, Escape to close
├── Carousels: Arrow keys to switch slides
├── Date pickers: Arrow keys for day/month/year
├── Star rating: Arrow keys to change value
├── Price range sliders: Arrow keys for fine control
├── Tabs: Arrow keys between tabs, Tab to content
└── Mobile bottom nav: skip navigation link

Custom Focus Style:
├── outline: 2px solid var(--accent)
├── outline-offset: 2px
├── No outline: none (!important) — ever
└── :focus-visible for keyboard-only focus
```

### 1.3 Screen Reader Support

```text
Semantic HTML:
├── <nav> for navigation sections
├── <main> for main content area
├── <aside> for sidebars
├── <article> for cards, blog posts
├── <section> with aria-label for page sections
├── <header>/<footer> for document landmarks
├── <h1>-<h6> in proper hierarchy (single <h1> per page)
└── <button> for actions, <a> for navigation

ARIA Labels:
├── aria-label on icon-only buttons
│   Example: <button aria-label="إغلاق القائمة">✕</button>
├── aria-live="polite" for dynamic content updates
│   Example: "تم إضافة البرنامج للمفضلة"
├── aria-expanded for dropdowns/accordions
├── role="alert" for error messages
├── aria-busy="true" during loading
├── aria-describedby for form field help text
└── aria-hidden="true" on decorative elements

Image Alt Text:
├── Program thumbnails: alt="صورة برنامج [اسم البرنامج]"
├── Instructor photos: alt="صورة المحاضر [اسم المحاضر]"
├── Decorative images: alt="" (empty, not omitted)
├── Icons with meaning: aria-label on parent
├── Charts/graphs: descriptive alt + data table alternative
└── Logo: alt="Next Academy"
```

---

## 2. RTL-Specific Accessibility

```text
Bidirectional Text:
├── Use dir="auto" for user-generated content (may contain English)
├── Phone numbers: always LTR (dir="ltr" on input)
├── Prices: always LTR for numerals (e.g., "3,000 ج.م")
├── URLs: always LTR
├── Code snippets: always LTR
└── Mixed content: <bdi> element for isolated bidirectional text

RTL Focus Order:
├── Tab order follows RTL visual flow (right to left)
├── Screen readers announce in reading order
├── Form labels on right side of inputs
└── Error messages appear on the right

Reversed Icons:
├── Arrow icons (→) flip to (←) in RTL
├── Progress bars: fill from right to left
├── Carousels: "next" goes left, "previous" goes right
├── Breadcrumbs: display right to left
└── Chevrons in menus: point left (not right)
```

---

## 3. Form Accessibility

```text
Every form field MUST have:
├── <label> element linked via htmlFor/id
├── Error message linked via aria-describedby
├── Required fields: aria-required="true" + visual indicator (*)
├── Help text linked via aria-describedby
├── Auto-complete attributes (autocomplete="email", "tel", "name")
└── Input type matching data (type="email", "tel", "number")

Example:
<div>
  <label htmlFor="email">البريد الإلكتروني *</label>
  <input 
    id="email" 
    type="email"
    aria-required="true"
    aria-describedby="email-help email-error"
    aria-invalid={hasError}
    autocomplete="email"
  />
  <span id="email-help">سنرسل لك رابط التأكيد</span>
  {hasError && <span id="email-error" role="alert">أدخل إيميل صحيح</span>}
</div>
```

---

## 4. Motion & Animations

```text
Reduce Motion:
├── Respect prefers-reduced-motion media query
├── Disable: parallax, auto-playing carousels, GSAP animations
├── Keep: opacity transitions, color changes
└── CSS: @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }

Auto-Playing Content:
├── No auto-playing videos with sound
├── Carousel auto-play: pause on hover/focus
├── Auto-play stop button always visible
└── No flashing content (>3 flashes/second)
```

---

## 5. Content Accessibility

```text
Text:
├── Min font size: 16px (body), 14px (captions)
├── Line height: ≥ 1.5 for body text
├── Paragraph max width: 80 characters (~35em)
├── No text in images (use real text)
├── Resizable up to 200% without horizontal scroll
└── Language attribute: <html lang="ar" dir="rtl">

Links:
├── Descriptive text (never "click here" or "اضغط هنا")
├── External links: indicate (aria-label includes "يفتح في نافذة جديدة")
├── Underline links in body text (not just color)
├── Visited link state distinguishable
└── Skip-to-main-content link as first focusable element

Tables:
├── <thead> with <th> for header cells
├── scope="col" / scope="row" on headers
├── caption for table title
├── aria-sort for sortable columns
└── Responsive: horizontally scrollable or card-based on mobile
```

---

## 6. Testing Checklist

```text
Automated Testing:
├── axe-core (npm package) → run in CI
├── Lighthouse accessibility audit → score ≥ 90
├── eslint-plugin-jsx-a11y → lint rules
└── Pa11y → automated page scans

Manual Testing:
├── Full keyboard navigation (no mouse)
├── Screen reader (NVDA on Windows, VoiceOver on Mac)
├── Browser zoom to 200%
├── High contrast mode
├── prefers-reduced-motion
└── RTL/LTR switching

Checklist per Page:
├── [ ] Single <h1>
├── [ ] Logical heading hierarchy
├── [ ] All images have alt text
├── [ ] All interactive elements keyboard accessible
├── [ ] Focus visible on all focusable elements
├── [ ] Forms have labels and error messages
├── [ ] No autoplay audio/video
├── [ ] Page has <title> and <meta description>
├── [ ] Language attribute set
└── [ ] Skip navigation link present
```
