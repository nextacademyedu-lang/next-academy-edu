# Frontend Engineer Audit Report

**Agent:** 02 — Frontend Engineer  
**Date:** 2026-04-16  
**Persona:** Senior React/Next.js engineer (shipped apps for 1M+ users)

---

## Executive Summary

The frontend is built on Next.js 15 with App Router, utilizing a locale-based routing system (`[locale]/`) with `next-intl` for Arabic-first i18n. The component architecture is reasonable but inconsistent — some pages use CSS modules while the root uses global CSS. RTL support is implemented at the HTML level but needs verification across all components. The design system uses Cairo (Arabic) + Montserrat (English) + Cinzel fonts. **The frontend is functional but lacks polish — missing loading states, inconsistent component patterns, and accessibility gaps prevent a high score.**

---

## Page-by-Page Audit

| Page/Section | Route | Wireframe Match | Key Issues |
|---|---|---|---|
| Homepage | `/[locale]` | ⚠️ Partial | Missing hero section matching wireframe, metadata is generic |
| About | `/[locale]/about` | ⚠️ Partial | Previous audit found raw i18n keys in EN version |
| Programs Listing | `/[locale]/programs` | ✅ Basic | No filter/sort UI observed |
| Program Detail | `/[locale]/programs/[slug]` | ⚠️ Partial | Test data "sad" visible in previous audit |
| Workshops | `/[locale]/workshops` | ⚠️ Partial | Separate from programs — may confuse users |
| Webinars | `/[locale]/webinars` | ⚠️ Partial | Separate listing page |
| Events | `/[locale]/events` | ✅ Basic | Dynamic content from Payload |
| Courses | `/[locale]/courses` | ✅ Basic | Separate from programs |
| Instructors | `/[locale]/instructors` | ✅ Basic | Listing page exists |
| Instructor Profile | `/[locale]/instructors/[slug]` | ⚠️ Partial | Needs credential/social proof |
| Blog | `/[locale]/blog` | ✅ Basic | Exists but content depth unknown |
| FAQ | `/[locale]/faq` | ✅ Basic | Exists |
| Contact | `/[locale]/contact` | ✅ Basic | Also exists as `/contact` (duplicate route!) |
| Corporate Training | `/[locale]/corporate-training` | ⚠️ Partial | B2B page |
| For Business | `/[locale]/for-business` | ⚠️ Partial | Separate from corporate-training — redundant? |
| Privacy | `/[locale]/privacy` | ✅ Legal page | Also exists as `/privacy-policy` — duplicate! |
| Terms | `/[locale]/terms` | ⚠️ Issue | Previous audit found test popup on this page |
| Refund Policy | `/[locale]/refund-policy` | ✅ Legal page | |
| Login | `/[locale]/(auth)` | ✅ Basic | Auth group route |
| Register | `/[locale]/(auth)` | ✅ Basic | |
| Dashboard | `/[locale]/(dashboard)` | ⚠️ Partial | Multiple sub-pages |
| Instructor Portal | `/[locale]/(instructor)` | ⚠️ Partial | 8 wireframes, needs details |
| B2B Dashboard | `/[locale]/(b2b)` | ⚠️ Partial | |
| Checkout | `/[locale]/(checkout)` | ⚠️ Partial | Previous audit: 401 on booking |
| Certificates | `/[locale]/certificates` | ✅ Basic | Exists |
| Retreats | `/[locale]/retreats` | ❓ New | Not in original wireframes |
| Invite | `/[locale]/invite` | ❓ New | Company invitation flow |

### Critical Route Issues
1. **Duplicate routes:** `/contact` exists both as `/[locale]/contact` and `/app/contact/` (non-locale). `/privacy-policy` exists as standalone AND `/[locale]/privacy`.
2. **Route fragmentation:** Programs, workshops, webinars, courses, events, and retreats are all separate routes. Consider consolidating under `/programs?type=workshop`.
3. **`/[locale]/for-business` vs `/[locale]/corporate-training`** — Two pages for the same purpose.

---

## Component Architecture Assessment

### Strengths
- **Auth context** (`src/context/auth-context.tsx`) — Client-side auth state management
- **Theme context** (`src/context/theme-context.tsx`) — Dark/light mode support
- **Popup manager** (`src/components/marketing/popup-manager.tsx`) — Marketing popups
- **CSS Modules** in some pages — Good encapsulation

### Weaknesses
- **No shared component library** — No `Button`, `Card`, `Modal` base components visible
- **Mixed styling approaches** — CSS modules in pages, global CSS in `globals.css` (16KB!)
- **16KB globals.css** — Monolithic global stylesheet suggests poor modularization
- **No Storybook or component documentation**
- **No error boundaries** observed at component level (only `global-error.tsx` and `error.tsx`)
- **No skeleton loaders** visible in the component structure

---

## RTL/i18n Quality

### Implementation
- ✅ `dir={locale === 'ar' ? 'rtl' : 'ltr'}` on `<html>` tag
- ✅ Cairo font loaded with Arabic subset
- ✅ `next-intl` for translation management
- ✅ Messages directory (`src/messages/`) for translation files

### Issues
- ⚠️ **Previous audit found raw i18n keys** on the English About page (BUG-001)
- ⚠️ **No hreflang tags** observed in the layout — critical for multilingual SEO
- ⚠️ **CSS may not be RTL-aware** — Need to verify that all `margin-left`, `padding-right`, etc. use logical properties (`margin-inline-start`) or RTL-specific overrides
- ⚠️ **Metadata is not localized** — `metadata.title` is hardcoded as "Next Academy" in English

---

## Performance Issues

### Font Loading
- ✅ Using `next/font/google` for Cairo, Montserrat, Cinzel — proper optimization
- ⚠️ **Three font families** loaded on every page — consider if all three are needed

### Bundle Size Concerns
- **framer-motion** (12.35.0) — Heavy animation library (~30KB gzipped)
- **gsap** (3.14.2) — Another animation library (~25KB gzipped) — **WHY TWO?**
- **embla-carousel-react** — Carousel library
- **googleapis** (171.4.0) — Very large package, should use specific sub-packages
- **react-email + @react-email/components** — Email rendering (not needed on client)

### Missing Optimizations
- No `next/dynamic` lazy loading observed for heavy components
- No evidence of route-based code splitting beyond automatic Next.js splitting
- `suppressHydrationWarning` used on both `<html>` and `<body>` — may mask real hydration issues

---

## Accessibility Violations (WCAG 2.1 AA)

| Issue | Severity | Location |
|---|---|---|
| No skip-to-content link | High | Layout |
| No ARIA landmarks observed | Medium | All pages |
| No focus management for route changes | Medium | App Router |
| Theme toggle may lack ARIA label | Medium | Theme context |
| Form validation approach unknown | Medium | Auth forms |
| No `aria-live` regions for dynamic content | Medium | Dashboard |
| No reduced-motion media query handling | Low | Animations |
| Two heavy animation libraries loaded | Low | framer-motion + gsap |

---

## Mobile Experience

- ✅ `standalone` PWA display mode in manifest
- ⚠️ **Only favicon.ico in PWA manifest** — No proper icons (192x192, 512x512)
- ⚠️ **No viewport meta tag** visible in layout (though Next.js adds one automatically)
- ⚠️ **No mobile-specific navigation** — No evidence of bottom navigation or hamburger menu
- ⚠️ **Touch target sizes** not verified across components
- ❌ **No Service Worker** — No offline capability

---

## Critical Bugs Found

1. **BUG-FE-001:** Duplicate route handlers for `/contact` and `/privacy-policy` outside locale routing
2. **BUG-FE-002:** Raw i18n keys visible on English pages (from previous audit, status unknown)
3. **BUG-FE-003:** Test popup with fake data visible on Terms page (from previous audit)
4. **BUG-FE-004:** Test program "sad" visible in program listings (from previous audit)
5. **BUG-FE-005:** Two animation libraries (framer-motion + gsap) causing unnecessary bundle bloat

---

## UX Issues

1. **Route fragmentation** — Users must visit 6 different page types (programs, workshops, webinars, courses, events, retreats) to see all offerings
2. **No global search UI** — `search-api.ts` exists in lib but no Cmd+K overlay component found
3. **No breadcrumbs** on detail pages
4. **Generic metadata** — "B2B Educational Platform for Entrepreneurs" doesn't match Arabic-first positioning
5. **No onboarding wizard** visible in route structure (wireframes specify 3-step, `/onboarding/step-1,2,3`)

---

## Competitor UI Comparison

| Feature | Next Academy | Coursat.me | Mersal | El-Sheikh |
|---|---|---|---|---|
| AR-first design | ✅ | ✅ | ✅ | ✅ |
| Modern UI framework | ✅ (Next.js) | ❓ | ❓ | Legacy |
| Dark mode | ✅ | ❌ | ❌ | ❌ |
| Mobile PWA | ⚠️ Basic | ❌ | ❌ | ❌ |
| Animations | ✅ (2 libs) | ⚠️ Basic | ⚠️ Basic | ❌ |
| Program filtering | ❌ | ✅ | ✅ | ⚠️ Basic |
| Global search | ❌ | ✅ | ❌ | ❌ |
| Skeleton loaders | ❌ | ❌ | ❌ | ❌ |

---

## Recommendations

1. **[P0] Fix duplicate routes** — Remove non-locale `/contact` and `/privacy-policy` routes
2. **[P0] Fix raw i18n keys** — Verify and fix all translation gaps
3. **[P1] Consolidate program types** — Single `/programs` page with type filter
4. **[P1] Remove one animation library** — Pick framer-motion OR gsap, not both
5. **[P1] Add proper PWA icons** — 192x192 and 512x512 at minimum
6. **[P2] Implement global search overlay** — search-api.ts exists, needs UI
7. **[P2] Add skeleton loaders** — For all data-fetching pages
8. **[P2] Localize metadata** — Dynamic titles/descriptions per locale
9. **[P2] Add error boundaries** — Per-section, not just global
10. **[P3] Reduce globals.css** — Break into CSS modules per component area

---

## Verdict: Frontend Score 5/10

The frontend has a solid foundation with Next.js App Router and proper i18n setup, but lacks polish and consistency. Duplicate routes, missing loading states, two animation libraries, and unresolved bugs from the previous audit significantly lower the score. The component architecture needs standardization with a shared design system.
