# Next Academy — Task Tracker

> `[ ]` = not started | `[/]` = in progress | `[x]` = done

---

## Session Log

### Session 2026-03-21 (19:13) — Docs Logs Refresh

- [x] Updated `docs/logs/api-audit-latest.md` to reflect final post-fix audit state
- [x] Consolidated round status in one place (baseline + auth-gap + gap-fixes + instructor coverage)
- [x] Added traceability links to detailed fix notes:
  - [x] `docs/logs/2026-03-21-work-summary.md`
  - [x] `docs/logs/2026-03-21-checkout-intent-fix.md`
  - [x] `docs/logs/2026-03-21-users-role-escalation-fix.md`
- [x] Updated `docs/logs/changelog.md` with this documentation pass
- [ ] Optional: commit/push docs-only changes

### Session 2026-03-21 (12:55) — CRM Sync: Users Not Appearing in Twenty

- [x] Reproduced CRM sync failure through cron endpoint output:
  - [x] `Object person doesn't have any "externalId" field`
- [x] Confirmed Twenty workspace contacts object is standard `people` schema
- [x] Added standard person mapper for user sync:
  - [x] `mapUserToTwentyPerson` (`name`, `emails`, `phones`, `jobTitle`, `city`)
- [x] Updated CRM service flow:
  - [x] detect contacts resource path `people`
  - [x] use create/update-by-id flow (no `externalId` dependency)
  - [x] keep old externalId-based path for non-standard/custom contacts resources
- [x] Extended Twenty client with:
  - [x] `create(resource, payload)`
  - [x] `updateById(resource, id, payload)`
- [x] Verified TypeScript compile:
  - [x] `node_modules\\.bin\\tsc --noEmit` ✅
- [ ] Deploy latest commit
- [ ] Trigger `/api/cron/crm-sync` and verify `succeeded > 0` and `failed = 0` for user events
- [ ] Confirm new user appears under CRM `people`

### Session 2026-03-21 (12:49) — Checkout Recovery UX + Admin Env Password Sync

- [x] Investigated checkout "الحجز مش موجود أو مش ليك" behavior under API `403`
- [x] Refactored checkout booking loader:
  - [x] replaced list fetch (`/api/bookings?depth=2...`) with direct fetch (`/api/bookings/:id?depth=2`)
  - [x] added explicit `401/403/404` handling
- [x] Added visible recovery actions on empty/forbidden state:
  - [x] login with redirect back to checkout
  - [x] go to my bookings
  - [x] return to site
- [x] Added env-controlled admin password sync on boot:
  - [x] `PAYLOAD_ADMIN_SYNC_PASSWORD=true` forces password sync from env
  - [x] keeps default non-forcing behavior when unset/false
- [x] Updated env docs and production template:
  - [x] `.env.production.template`
  - [x] `docs/engineering/env-variables.md`
- [x] Verified TypeScript compile:
  - [x] `node_modules\\.bin\\tsc --noEmit` ✅
- [ ] Deploy latest commit on Coolify
- [ ] Set `PAYLOAD_ADMIN_SYNC_PASSWORD=true` once, restart app, login with env admin credentials, then set it back to `false`

### Session 2026-03-21 (12:06) — Production Schema Auto-Migration Fix

- [x] Audited latest Coolify runtime logs in `docs/logs/coolify/logs.txt`
- [x] Confirmed schema drift errors causing runtime 500:
  - [x] `programs.featured_priority` missing
  - [x] relation `announcement_bars` missing
  - [x] relation `popups` missing
  - [x] relation `upcoming_events_config` missing
  - [x] relation `crm_sync_events` missing / sync endpoint failure
- [x] Generated fresh Payload migration snapshot + SQL delta:
  - [x] `src/migrations/20260321_100401.ts`
  - [x] `src/migrations/20260321_100401.json`
  - [x] registered in `src/migrations/index.ts`
- [x] Fixed production migration execution path:
  - [x] `src/payload.config.ts` now sets `prodMigrations: migrations`
- [x] Verified TypeScript compile:
  - [x] `node_modules\\.bin\\tsc --noEmit` ✅
- [ ] Re-deploy app on Coolify with latest commit
- [ ] Validate post-deploy endpoints:
  - [ ] `GET /api/programs`
  - [ ] `GET /api/home/featured-programs`
  - [ ] `GET /api/announcement-bars/active`
  - [ ] `GET /api/popups/active`
  - [ ] `GET /api/upcoming-events`
  - [ ] `GET /api/cron/crm-sync` (with `CRON_SECRET`)
- [ ] Security follow-up: rotate all secrets that were pasted in chat/logs and remove plaintext from tracked docs/env exports

### Session 2026-03-20 (03:42) — CRM Production Incident Audit (Logs + Live Health Checks)

- [x] Audited provided Coolify logs:
  - [x] Postgres (`ready to accept connections`)
  - [x] Redis (`Ready to accept connections`)
  - [x] Twenty app (migrations done, app started)
  - [x] Worker (cron jobs processing successfully)
- [x] Audited `docs/logs/coolify/Variables.md` for config-risk signals
- [x] Ran live health checks against CRM domain
- [x] Confirmed production-facing failures:
  - [x] TLS presents self-signed Traefik default cert
  - [x] `/healthz` returns `503 no available server`
  - [x] Node fetch fails with `DEPTH_ZERO_SELF_SIGNED_CERT`
- [x] Logged findings and incident context in:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/errors.md`
  - [x] `docs/sessions/2026-03-20-03-42-session-15.md`
- [ ] Infra action: issue valid TLS cert for `crm.nextacademyedu.com` (Let's Encrypt/ACME)
- [ ] Infra action: restore healthy upstream routing for Twenty service (remove `503 no available server`)
- [ ] Security action: rotate and redact all leaked secrets from `docs/logs/coolify/Variables.md`
- [ ] Validation action: re-test CRM endpoint + API auth from Next backend after infra fix

### Session 2026-03-20 (00:14) — Twenty CRM Full Lifecycle Implementation

- [x] Implemented CRM core integration modules:
  - [x] Twenty client + mappers + stage mapping + service layer
  - [x] outbox queue helpers + processor + retry/dead-letter strategy
- [x] Added CRM outbox collection:
  - [x] `crm-sync-events` with statuses (`pending`, `processing`, `done`, `failed`, `dead_letter`)
- [x] Wired lifecycle enqueue hooks for all required entities:
  - [x] users, user-profiles, leads, companies
  - [x] bookings, payments, consultation-bookings
  - [x] bulk-seat-allocations, waitlist
- [x] Added additive schema support:
  - [x] `consultation-bookings.twentyCrmDealId`
- [x] Added secured cron endpoint:
  - [x] `GET /api/cron/crm-sync` with `CRON_SECRET` auth
  - [x] fail-closed if secret is missing
  - [x] timing-safe bearer comparison
  - [x] stale processing lock recovery (`CRM_SYNC_STALE_LOCK_MINUTES`)
- [x] Added historical backfill script:
  - [x] `npm run crm:backfill`
  - [x] dry-run + resumable cursor support
- [x] Updated environment documentation and production template for CRM sync vars
- [x] Verified TypeScript: `cmd /c node_modules\\.bin\\tsc --noEmit` ✅
- [/] `npm run build`:
  - [x] app compile/type/lint/page generation succeeded
  - [ ] standalone symlink copy failed on local Windows (`EPERM`)

### Session 2026-03-19 (23:34–23:59) — Backend Closure Pass (Missing APIs + Compatibility + Access Scope)

- [x] Implemented missing endpoints:
  - [x] `/api/b2b/dashboard`
  - [x] `/api/b2b/team`
  - [x] `/api/b2b/bookings`
  - [x] `/api/instructor/availability` (GET/PUT)
- [x] Added strict B2B company scope helper and applied it across B2B endpoints
- [x] Added instructor compatibility columns/hooks:
  - [x] `consultation-types.title` + `consultation-types.description`
  - [x] `consultation-availability.dayIndex`
  - [x] `sessions.status` + `sessions.attendanceCount`
- [x] Closed instructor booking access mismatch:
  - [x] `consultation-bookings` read/update now scoped for instructor own records
- [x] Hardened B2B collection read scope:
  - [x] `isAdminOrB2BManager` now filters by manager company (not role-only)
- [x] Updated frontend instructor API compatibility:
  - [x] availability now uses `/api/instructor/availability`
  - [x] consultation title fallback supports localized fields
- [x] Synced documentation updates:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/tasks.md`
  - [x] `docs/sessions/2026-03-19-23-59-session-13.md`
- [x] Verified TypeScript: `node .\node_modules\typescript\bin\tsc --noEmit` ✅

### Session 2026-03-19 (23:19–23:34) — Full Re-Audit (Missing APIs / Columns / Tables)

- [x] Re-audited frontend API calls against actual available custom routes
- [x] Re-audited frontend DTO expectations against collection schemas
- [x] Re-validated access-control alignment for instructor/B2B flows
- [x] Confirmed still-missing routes:
  - [x] `/api/b2b/dashboard`
  - [x] `/api/b2b/team`
  - [x] `/api/b2b/bookings`
  - [x] `/api/instructor/availability`
- [x] Confirmed still-missing schema compatibility areas:
  - [x] consultation types alias contract (`title/description`)
  - [x] consultation availability numeric day compatibility
  - [x] sessions status/attendance compatibility
- [x] Confirmed onboarding company payload mismatch remains (text vs relationship)
- [x] Confirmed previous completed items still valid:
  - [x] Home stats API wiring
  - [x] Home featured cards API wiring
  - [x] Programs additive columns (`featuredPriority`, `learnersCount`)
  - [x] Upcoming-events DTO normalization
- [x] Wrote follow-up report:
  - [x] `docs/engineering/full-audit-followup-2026-03-19.md`
- [x] Synced documentation updates:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/tasks.md`
  - [x] `docs/sessions/2026-03-19-23-34-session-12.md`

### Session 2026-03-19 (23:00–23:19) — DB-Driven Home Metrics & Featured Cards (Additive)

- [x] Added additive schema support in `programs` collection:
  - [x] `featuredPriority` for explicit featured-card ordering
  - [x] `learnersCount` as aggregate-ready learners counter field
- [x] Built home stats API:
  - [x] `GET /api/home/stats` from real DB collections (bookings/companies/instructors)
- [x] Built featured cards API:
  - [x] `GET /api/home/featured-programs` using DB data from `programs`, `rounds`, and `reviews`
  - [x] Returned normalized card DTO containing rating, rating count, learners/enrollments, schedule, price, and image
- [x] Migrated home sections from mock to API:
  - [x] `src/components/sections/stats.tsx` now fetches `/api/home/stats`
  - [x] `src/components/sections/featured.tsx` now fetches `/api/home/featured-programs`
- [x] Fixed upcoming events API/frontend contract mismatch:
  - [x] `src/app/api/upcoming-events/route.ts` now returns flat event DTO expected by UI
- [x] Added i18n keys used by dynamic featured cards:
  - [x] `Featured.subtitle`
  - [x] `Featured.enrolled`
  - [x] `Featured.noRating`
- [x] Synced documentation updates in:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/tasks.md`
  - [x] `docs/sessions/2026-03-19-23-19-session-11.md`
- [x] Verified TypeScript: `node .\node_modules\typescript\bin\tsc --noEmit` ✅

### Session 2026-03-19 (22:52–23:00) — Frontend vs DB Deep Contract Audit

- [x] Performed full UI data-source audit (home, public pages, dashboard, instructor, B2B)
- [x] Mapped each key screen/section to one of:
  - [x] static/mock constants
  - [x] Payload `getPayload` queries
  - [x] Payload REST/custom API endpoints
- [x] Verified home hero KPI strip status:
  - [x] Confirmed `300+ / 80K+ / 4.8` cards are already removed from hero
  - [x] Confirmed dedicated `StatsSection` still exists on home
- [x] Identified backend contract gaps that block reliable frontend-as-source alignment:
  - [x] missing custom endpoints (`/api/b2b/*`, `/api/instructor/availability`)
  - [x] response-shape mismatches (upcoming events)
  - [x] schema-field mismatches (consultation types, sessions, availability)
  - [x] access-control mismatches (instructor booking status update, B2B company scoping)
  - [x] onboarding company payload mismatch (text vs relationship ID)
- [x] Wrote deep-dive report:
  - [x] `docs/engineering/frontend-db-contract-audit-2026-03-19.md`
- [x] Synced documentation:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/tasks.md`
  - [x] `docs/sessions/2026-03-19-22-52-session-10.md`

### Session 2026-03-19 (22:45–22:49) — Navbar Account Access Fix + Avatar Support

- [x] Added role-aware logged-in account destination in navbar:
  - [x] `user` → `/${locale}/dashboard/profile`
  - [x] `instructor` → `/${locale}/instructor`
  - [x] `b2b_manager` → `/${locale}/b2b-dashboard`
  - [x] `admin` → `/admin`
- [x] Reworked logged-in navbar account action (desktop + mobile) to a clear account button with avatar + display name
- [x] Added avatar image rendering with initial fallback in navbar styles
- [x] Updated current-user API fetch to `depth=1` so user picture relation resolves with URL
- [x] Hardened role redirect helper for admin route handling
- [x] Synced documentation updates in:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/tasks.md`
  - [x] `docs/sessions/2026-03-19-22-49-session-9.md`
- [x] Verified TypeScript: `node .\node_modules\typescript\bin\tsc --noEmit` ✅

### Session 2026-03-19 (22:39–22:45) — Bottom Bar Visual Redesign (Reference-Matched)

- [x] Redesigned mobile bottom bar in user dashboard portal to rounded-pill + floating active icon style
- [x] Redesigned mobile bottom bar in instructor portal to the same visual system
- [x] Redesigned mobile bottom bar in B2B portal to the same visual system
- [x] Kept existing project icon set and wired brand colors/tokens to active bubble + surface
- [x] Added accessibility labels for icon-only mobile nav items (`aria-label`)
- [x] Updated safe-area / bottom spacing to avoid overlap with floating back button
- [x] Synced documentation updates in:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/tasks.md`
  - [x] `docs/sessions/2026-03-19-22-45-session-8.md`
- [x] Verified TypeScript: `npx tsc --noEmit` ✅

### Session 2026-03-19 (22:35–22:37) — Popup Campaign Engine + Theme Toggle/Desktop + Global Spacing Fix

- [x] Expanded popup admin schema to support advanced behavioral targeting:
  - [x] first visit vs returning visitor
  - [x] purchased vs not purchased
  - [x] email captured vs not captured
  - [x] minimum session page views
- [x] Implemented behavior-aware popup filtering in `GET /api/popups/active` with auth + bookings checks
- [x] Fixed popup manager payload parsing (`data.popups`) and added local behavior context tracking
- [x] Moved popup manager mounting from homepage to locale layout (site-wide popup handling)
- [x] Added `offer_dark` popup preset with richer promo-oriented controls and rendering
- [x] Restored missing desktop navbar light/dark toggle button
- [x] Removed frontend outer spacing caused by default browser body margin/padding
- [x] Synced documentation updates in:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/tasks.md`
  - [x] `docs/sessions/2026-03-19-22-35-session-6.md`
- [x] Verified TypeScript: `node .\node_modules\typescript\bin\tsc --noEmit` ✅

### Session 2026-03-19 (22:37–22:39) — Hero KPI Strip Removal + Docs Sync

- [x] Removed duplicated KPI cards from home hero (`300+`, `80K+`, `4.8`)
- [x] Deleted now-unused hero metric styles from `hero.module.css`
- [x] Synced documentation updates in:
  - [x] `docs/logs/changelog.md`
  - [x] `docs/logs/tasks.md`
  - [x] `docs/sessions/2026-03-19-22-37-session-7.md`
- [x] Verification note recorded (`tsc/build` not run in this pass)

### Session 2026-03-19 (22:03–22:35) — Portals UI/Responsive Cleanup (B2B + User Profile + Instructor)

- [x] Fixed `/instructors` runtime image host issue by allowing localhost Payload media in `next.config.ts`
- [x] Rebuilt `B2BLayout` with dedicated CSS module and responsive structure (sidebar/topbar/mobile bottom nav)
- [x] Refined dashboard shell mobile bottom nav behavior and spacing
- [x] Refined instructor shell mobile nav behavior to avoid icon/text crowding
- [x] Redesigned `dashboard/profile` UI (tabs/forms/toasts/cards) with token-based styling and stronger mobile behavior
- [x] Improved B2B pages responsiveness (search blocks, table/card wraps, card backgrounds)
- [x] Improved instructor pages responsiveness (grid min widths, wraps, service/availability layouts)
- [x] Re-aligned instructor + dashboard stats color accents to core brand palette
- [x] Updated dashboard fallback CTA link from `/programs` to `/courses`
- [x] Verified TypeScript: `npx tsc --noEmit` ✅

### Session 2026-03-19 (21:25–22:03) — Brand Palette Rollback + Core Page Rebuild

- [x] Re-aligned theme tokens to core brand colors (`#c51b1b`, `#f1f6f1`, `#d6a32b`, `#020504`)
- [x] Unified naming direction: `Courses` as primary catalog, with `/programs` reusing `/courses` implementation
- [x] Fixed navbar duplication (Courses/Programs overlap removed from primary nav)
- [x] Rebuilt `/courses` from Payload data (filters, cards, real rounds/pricing/learners)
- [x] Redesigned `/instructors` cards with image, role, tracks count, and learners count
- [x] Rebuilt `/instructors/[slug]` profile page (hero metrics, about, courses/workshops list, booking types)
- [x] Rebuilt `/events` as full page (upcoming, archive, gallery/video highlights)
- [x] Rebuilt `/webinars` as full page (upcoming live sessions, archive, highlights)
- [x] Verified TypeScript: `npx tsc --noEmit` ✅

### Session 2026-03-19 (21:03–21:25) — Remaining Pages Redesign + Background System Pass

- [x] Unified dark/light palette behavior by fixing `html[data-theme="dark"]` tokens in `globals.css` (removed gray fallback behavior)
- [x] Updated default visual state for ghost/outline buttons to be visible without hover
- [x] Applied alternating branded backgrounds across remaining home sections
- [x] Applied contrast/background redesign across About sections
- [x] Restyled remaining core pages (about/blog/contact/programs/instructors/legal) with consistent section contrast
- [x] Polished navbar/mobile drawer surfaces and link states for cleaner visual hierarchy
- [x] Fixed hero business CTA route to `/${locale}/for-business`
- [x] Verified TypeScript: `npx tsc --noEmit` ✅

### Session 2026-03-19 (20:50–21:03) — Navbar Completion + Missing Route Pages

- [x] Reduced desktop navbar density (primary links trimmed, non-core links moved into `More`)
- [x] Removed `Ctrl/Cmd + K` visual badge from navbar search trigger
- [x] Fixed button normal-state visibility by removing global button reset override
- [x] Aligned auth CTAs in navbar to background-visible variants (`secondary`, `primary`)
- [x] Added missing locale routes matching navbar:
  - [x] `/courses`
  - [x] `/workshops`
  - [x] `/events`
  - [x] `/webinars`
  - [x] `/faq`
  - [x] `/for-business`
- [x] Added reusable catalog page component (`src/components/pages/catalog-page.*`)
- [x] Applied additional home section contrast tuning (`why-choose-us`, `video-testimonials`)
- [x] Verified TypeScript: `npx tsc --noEmit` ✅

### Session 2026-03-19 (20:10–20:50) — Home UI Refactor (Navbar/Hero/Featured)

- [x] Rebuilt navbar architecture (desktop mega menu + more dropdown + mobile drawer)
- [x] Removed nav duplication and split desktop/mobile menu state handling
- [x] Converted hero to full-bleed visual layout with CTAs and metrics strip
- [x] Reworked featured cards to align with provided Figma dark/light direction
- [x] Fixed button visibility issue in default state (ghost/outline/primary token alignment)
- [x] Added contrast pass across key home sections to break single-tone background feel
- [x] Added new Nav i18n keys in Arabic and English
- [x] Verified TypeScript: `npx tsc --noEmit` ✅

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
