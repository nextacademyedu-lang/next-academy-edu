# Next Academy — Task Tracker

> `[ ]` = not started | `[/]` = in progress | `[x]` = done

---

## Session Log

### Session 2026-03-19 (12:35–12:40) — RTL CSS Build Verification

- [x] Verified build after RTL CSS fixes (6 module files + hero button)
- [x] Cleaned stale `.next` cache
- [x] Confirmed compilation ✅, TypeScript ✅, 29/29 static pages ✅
- [x] Updated changelog, tasks, session logs

### Session 2026-03-18 (~21:05–21:07) — Logs & Session Verification

- [x] Reviewed all log files (`changelog.md`, `tasks.md`, `errors.md`)
- [x] Confirmed sessions 1–6 logs are up-to-date
- [x] Created session 7 log for traceability
- [x] Updated changelog and tasks with this entry

### Session 2026-03-18 (~20:20–20:49) — About Page Full Build

- [x] Read wireframe, design-system, i18n docs + existing about page code
- [x] Built 5 section components: hero, story, values, team, CTA (12 new files)
- [x] Composed sections in `page.tsx`, overhauled `page.module.css` (dark tokens, mobile-first, RTL)
- [x] Added `loading.tsx` skeleton + `error.tsx` boundary with retry
- [x] Verified `pnpm build` — 0 errors, 26/26 static pages
- [x] Updated changelog and session logs

### Session 2026-03-18 (~20:15–20:19) — Email Template Refactoring

- [x] Analyzed existing monolithic `src/lib/email.ts` and `src/lib/email/email-core.ts`
- [x] Created 4 domain-specific email modules: `booking-emails.ts`, `payment-emails.ts`, `user-emails.ts`, `admin-emails.ts`
- [x] Updated barrel `index.ts` with re-exports and legacy aliases
- [x] Fixed 3 caller files with stale parameter names (`amount` → `amountDue`/`amountPaid`)
- [x] Build verified: compiled + type-checked ✅, 26/26 pages ✅
- [x] Updated changelog and session logs

### Session 2026-03-18 (~19:15–20:15) — Light Mode CSS Fix & About Page i18n

- [x] Audited ~50 hardcoded `rgba(255,255,255,...)` values across CSS modules
- [x] Added 12 theme-safe CSS tokens to `globals.css` (dark defaults + light overrides)
- [x] Fixed 9 CSS module files (button, why-choose-us, text-testimonials, featured, footer, auth-layout, instructor, global-search)
- [x] User added About page i18n strings to `ar.json` + `en.json` (34 keys each)
- [x] Updated logs and session file

### Session 2026-03-18 (~17:00–19:15) — UI Audit Phase 2: Page-Level CSS Design System Alignment

- [x] Read `docs/design/design-system.md` for design tokens, breakpoints, and constraints
- [x] Audited and fixed `src/app/[locale]/programs/page.module.css` — mobile-first, design tokens, RTL
- [x] Audited and fixed `src/app/[locale]/programs/[slug]/page.module.css` — mobile-first, design tokens, RTL
- [x] Audited and fixed `src/app/[locale]/instructors/page.module.css` — mobile-first, design tokens, RTL
- [x] Audited and fixed `src/app/[locale]/instructors/[slug]/page.module.css` — mobile-first, design tokens, RTL
- [x] Verified build: `pnpm build` — compiled successfully
- [x] Updated logs and session file

### Session 2026-03-18 (~14:00–14:33) — Fix Program Detail Page TypeScript Errors

- [x] Read PRD and payload-types to understand correct schema fields
- [x] Rewrote `page.tsx` with proper `Program`, `Round`, `Instructor` types from `@/payload-types`
- [x] Fixed field names: `maxCapacity`, `currentEnrollments`, `locationType`, `shortDescriptionAr/En`
- [x] Fetched rounds from separate collection instead of assuming embedded
- [x] Removed non-existent `syllabus` section
- [x] Verified build: `tsc --noEmit` — zero errors in `page.tsx`
- [x] Updated logs and session file

### Session 2026-03-18 (~08:00–08:25) — Log Unification & Cleanup

- [x] Identified duplicate log files (`docs/logs/` vs `logs/`)
- [x] Merged unique entries from `docs/logs/changelog.md` → `logs/changelog.md` (2 entries: Role-Based Routing, Login Route Body Parsing)
- [x] Merged unique error from `docs/logs/errors.md` → `logs/errors.md` (1 entry: Login Route 500)
- [x] Deleted `docs/logs/` directory entirely
- [x] Confirmed no other duplicate log files exist in `docs/`
- [x] Updated all log files with current session details (this update)

### Session 2026-03-17 (~22:00) — Auth Security Audit & Fix

- [x] Deep audit of Payload auth system (14 files audited)
- [x] Delete insecure `reset-admin/route.ts` (hardcoded password `NextAcademy@2026!` in source)
- [x] Fix login error handling (401 vs 500 distinction in `login/route.ts`)
- [x] Create `.env.local` with `localhost:3000` URLs (was pointing to production domain)
- [x] Delete outdated troubleshooting file from repo root

### Session 2026-03-16 (~18:00–19:30) — Payload Admin CSS Fix

- [x] Fix V1: Wrap `globals.css` in `@layer frontend` (failed — Next.js strips layer content in prod)
- [x] Fix V2: Scope destructive resets with `html[data-app="frontend"]` data-attribute (working fix)
- [x] Update `[locale]/layout.tsx` to inject `data-app="frontend"` on `<html>`

### Session 2026-03-16 (~13:00–16:00) — Coolify Deployment Setup

- [x] Create Coolify deployment rules (`docs/engineering/coolify-deployment.md`)
- [x] Deprecate old Vercel deployment guide
- [x] Create GEMINI.md agent rules
- [x] Create logs structure
- [x] Add Facebook domain verification meta tag
- [x] Set up seed-admin route

---

## Infrastructure & Setup

- [x] Create Coolify deployment rules (`docs/engineering/coolify-deployment.md`)
- [x] Deprecate old Vercel deployment guide
- [x] Create GEMINI.md agent rules
- [x] Create logs structure (`logs/` — unified, `docs/logs/` deleted)
- [x] Add Facebook domain verification meta tag
- [ ] Verify Coolify deployment works end-to-end

## Authentication & Security

- [x] Deep audit of Payload auth system (14 files audited)
- [x] Delete insecure `reset-admin/route.ts` (hardcoded password)
- [x] Fix login error handling (401 vs 500 distinction)
- [x] Create `.env.local` for local dev URLs
- [x] Delete outdated troubleshooting file from repo root
- [x] Fix Login Route body parsing (multipart/form-data support for Payload admin)
- [x] Role-Based Dashboard Routing after login (per `roles-permissions.md`)
- [ ] Verify admin login works on production after deployment
- [ ] Verify password reset emails are sending
- [ ] Test Google OAuth callback flow end-to-end

## UI & CSS

- [x] Payload Admin CSS — `data-app="frontend"` scoping fix (V2)
- [x] Fix program detail page TypeScript errors — proper Payload types (2026-03-18)
- [x] Dark/Light theme toggle — ThemeProvider, animated toggle, localStorage persistence
- [x] Light mode CSS fix — 12 theme-safe tokens, 9 CSS module files fixed (~50 hardcoded values)
- [x] About page i18n strings — 34 keys in `ar.json` + `en.json`
- [x] Build About page UI component (5 sections, 12 new files, loading + error states) — 2026-03-18
- [ ] Verify Payload admin panel renders correctly on production

## Sprint 1 — Foundation (Collections + Admin)

- [ ] Review and validate all Payload collections against PRD
- [ ] Implement access control on all collections
- [x] Set up seed-admin route
- [ ] Verify admin panel works on production

## Deployment

- [ ] Fix all Coolify deployment issues
- [ ] Verify healthcheck passes
- [ ] Test production build locally before pushing

## Housekeeping

- [x] Unify log files — `logs/` is the single source of truth (2026-03-18)
- [x] Remove duplicate sections from `tasks.md` and `errors.md`
