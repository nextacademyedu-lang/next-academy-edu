# 📋 Next Academy — Changelog

> كل التغييرات المهمة بتتسجل هنا. الفورمات: `### [YYYY-MM-DD HH:MM] - العنوان`

---

### [2026-03-22 13:40] - Round Session Planner (Per-Session Date/Time داخل الراوند)

**Files updated (this pass):**
- `src/collections/Rounds.ts`
- `src/migrations/20260322_113423_add_round_session_plan.ts` (new)
- `src/migrations/20260322_113423_add_round_session_plan.json` (new)
- `src/migrations/index.ts`
- `src/payload-types.ts`
- `docs/logs/changelog.md`
- `docs/logs/tasks.md`
- `docs/sessions/2026-03-22-13-40-session-20.md` (new)

**What changed technically:**
- Added `sessionPlan` array inside `rounds` admin form, so each session has its own:
  - `date`
  - `startTime`
  - `endTime`
  - optional per-session title/location fields
- Added `beforeChange` hook on `rounds` to auto-sync:
  - `startDate` from earliest session date
  - `endDate` from latest session date
- Added `afterChange` hook on `rounds` to create/update `sessions` docs from `sessionPlan` (one session row per plan row).
- Kept existing `sessions` collection model intact; this is additive admin UX + sync layer.
- Generated and registered migration for new `rounds_session_plan` table.
- Regenerated Payload types.

**Reason:**
- User requested that when a round contains multiple sessions, admin must be able to set date/time for each session (instead of one generic date range only).

**Verification:**
- `pnpm.cmd exec tsc --noEmit` ✅

---

### [2026-03-22 01:06] - CRM Opportunities Compatibility + Admin Access Fallback + Marketing Preview

**Files updated (this pass):**
- CRM compatibility:
  - `src/lib/crm/mappers.ts`
  - `src/lib/crm/service.ts`
- Access control/admin reliability:
  - `src/lib/access-control.ts`
  - `src/collections/Users.ts`
- Marketing preview + runtime mapping:
  - `src/collections/Popups.ts`
  - `src/collections/AnnouncementBars.ts`
  - `src/app/api/popups/active/route.ts`
  - `src/app/api/announcement-bars/active/route.ts`
  - `src/components/marketing/popup-manager.tsx`
  - `src/components/layout/announcement-bar.tsx`
- Documentation:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-22-01-06-session-19.md` (new)

**What changed technically:**
- Fixed CRM pipeline gap with default Twenty schema:
  - Removed skip behavior for deals when `TWENTY_RESOURCE_DEALS=opportunities`.
  - Added opportunities-safe payload mappers and local-id based create/update flow via `twentyCrmDealId`.
  - Booking/payment/consultation sync now creates/updates opportunities instead of silently skipping.
- Fixed admin permission false negatives:
  - Added `isAdminUser(...)` helper that treats configured `PAYLOAD_ADMIN_EMAIL` as admin fallback.
  - Reused helper across access guards and `Users` collection admin access / role-write checks.
- Added preview support for marketing collections:
  - Collection-level admin preview URLs for `popups` and `announcement-bars`.
  - API routes accept secure preview params (`previewPopupId`, `previewAnnouncementId`) with admin-only checks.
  - Frontend managers now read preview params and render selected draft item.
- Aligned Announcement Bar frontend with actual collection schema:
  - switched rendering to `messages` / `appearance` / `behavior` / `countdown` structure.

**Reason:**
- User reported:
  - CRM data mismatch and missing sales pipeline flow.
  - Admin account receiving `You are not allowed to perform this action`.
  - No working preview flow for Popups and Announcement Bars.

**Verification:**
- `pnpm.cmd exec tsc --noEmit` ✅

---

### [2026-03-21 19:13] - Logs Refresh: Final API Audit Snapshot + Traceability

**Files updated (this pass):**
- `docs/logs/api-audit-latest.md`
- `docs/logs/changelog.md`
- `docs/logs/tasks.md`

**What changed technically:**
- Refreshed `api-audit-latest.md` to avoid stale status and reflect final remediation rounds:
  - Full sweep baseline: `150 total / 145 passed / 5 failed / 5 skipped`
  - Auth/role gap pass: `26 total / 26 passed / 0 failed / 6 skipped`
  - Gap-fix verification pass: `22 total / 22 passed / 0 failed / 0 skipped`
  - Instructor scope coverage pass: `8 total / 8 passed / 0 failed`
- Added direct references from the latest snapshot to:
  - `docs/logs/2026-03-21-work-summary.md`
  - `docs/logs/2026-03-21-checkout-intent-fix.md`
  - `docs/logs/2026-03-21-users-role-escalation-fix.md`

**Reason:**
- User requested `update /docs/logs`, and the previous "latest" report still reflected the pre-fix baseline run.

**Verification:**
- Docs-only update completed (no code/runtime behavior changed).

---

### [2026-03-21 12:55] - CRM User Sync Fix for Twenty "people" Object

**Files updated (this pass):**
- CRM mapping/service/client:
  - `src/lib/crm/mappers.ts`
  - `src/lib/crm/service.ts`
  - `src/lib/crm/twenty-client.ts`
- Documentation:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-21-12-55-session-18.md` (new)

**What changed technically:**
- Identified production CRM sync failure from cron response:
  - `Object person doesn't have any "externalId" field.`
- Root cause:
  - Contacts sync assumed custom `externalId` field for upsert.
  - Twenty default contacts object (`people`) in this workspace uses standard schema without that field.
- Implemented compatibility path for `people` resource:
  - Added `mapUserToTwentyPerson(...)` with standard fields (`name`, `emails`, `phones`, `jobTitle`, `city`).
  - In `CRMService.syncUser`, when contacts resource is `people`:
    - update by stored `twentyCrmContactId` if present,
    - otherwise create a new person directly.
  - Added public `create(...)` and `updateById(...)` methods to `TwentyClient`.

**Reason:**
- User reported newly created users were not appearing in CRM despite sync pipeline being enabled.

**Verification:**
- `node_modules\\.bin\\tsc --noEmit` ✅

---

### [2026-03-21 12:49] - Checkout Access UX + Admin Password Sync Control

**Files updated (this pass):**
- Checkout flow UX:
  - `src/app/[locale]/(checkout)/checkout/[bookingId]/page.tsx`
  - `src/app/[locale]/(checkout)/checkout/[bookingId]/checkout.module.css`
- Admin bootstrap reliability:
  - `src/payload.config.ts`
  - `.env.production.template`
  - `docs/engineering/env-variables.md`
- Documentation:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-21-12-49-session-17.md` (new)

**What changed technically:**
- Reworked checkout booking loader:
  - switched from listing all bookings (`/api/bookings?limit=50`) to direct booking fetch (`/api/bookings/:id?depth=2`)
  - explicit handling for `401/403/404` states
- Added user-facing recovery actions when booking cannot be accessed:
  - Login button (with redirect back to checkout)
  - "My Bookings" button
  - "Back to site" button
- Added production-safe admin sync option:
  - new env flag `PAYLOAD_ADMIN_SYNC_PASSWORD`
  - when `true`, app boot forces admin role + email verified + password sync from env for `PAYLOAD_ADMIN_EMAIL`
  - when `false`, no password override (default behavior preserved)
- Updated env docs to clarify:
  - `PAYMOB_API_KEY` should be `egy_sk_*` secret key (not JWT/base64 API token form)

**Reason:**
- User reported:
  - no usable action buttons on "booking not found / not yours" screen
  - inability to access admin account configured in env
  - recurring 403 booking fetch confusion

**Verification:**
- `node_modules\\.bin\\tsc --noEmit` ✅

---

### [2026-03-21 12:06] - Production Schema Auto-Migration Fix (Payload + Coolify)

**Files updated (this pass):**
- Runtime config:
  - `src/payload.config.ts`
- DB migrations:
  - `src/migrations/20260321_100401.ts` (new)
  - `src/migrations/20260321_100401.json` (new)
  - `src/migrations/index.ts` (updated)
- Documentation:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/logs/errors.md`
  - `docs/sessions/2026-03-21-12-06-session-16.md` (new)

**What changed technically:**
- Confirmed root cause from production logs:
  - Production Postgres adapter does not run schema `push` automatically.
  - New collections/fields existed in code, but DB schema was behind (`programs.featured_priority`, `announcement_bars`, `popups`, `upcoming_events_config`, `crm_sync_events`).
- Generated a new migration that includes the missing schema delta (tables, enums, indexes, and additive columns).
- Wired production migrations in Payload config:
  - Added `prodMigrations: migrations` to `postgresAdapter(...)`.
  - Kept `push: true` for non-production/dev behavior.

**Reason:**
- User provided production env + Coolify logs showing runtime 500s after successful build/deploy.
- Goal was to make production schema updates deterministic on app boot without manual DB patching each deploy.

**Verification:**
- `node_modules\\.bin\\tsc --noEmit` ✅

---

### [2026-03-20 03:42] - CRM Production Incident Audit (Coolify Logs + Live Endpoint Checks)

**Files updated (this pass):**
- Documentation:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/logs/errors.md`
  - `docs/sessions/2026-03-20-03-42-session-15.md` (new)
- Inputs audited:
  - `docs/logs/coolify/postgres-k084o4soc8gscks0o08okgw8-all-logs-2026-03-20-01-31-17.txt`
  - `docs/logs/coolify/redis-k084o4soc8gscks0o08okgw8-all-logs-2026-03-20-01-31-14.txt`
  - `docs/logs/coolify/twenty-k084o4soc8gscks0o08okgw8-all-logs-2026-03-20-01-31-06.txt`
  - `docs/logs/coolify/worker-k084o4soc8gscks0o08okgw8-all-logs-2026-03-20-01-31-21.txt`
  - `docs/logs/coolify/Variables.md`

**What changed technically:**
- Performed deep log audit across Postgres, Redis, Twenty app, and worker logs.
- Verified all four services booted successfully in captured logs:
  - Postgres: ready on `5432`.
  - Redis: ready on `6379` (with overcommit warning).
  - Twenty: migrations completed, app started.
  - Worker: cron queues processing successfully.
- Performed live endpoint verification and found infrastructure-level failures:
  - `https://crm.nextacademyedu.com/healthz` returns `503` with body `no available server`.
  - TLS certificate served is Traefik default self-signed cert (`CN=TRAEFIK DEFAULT CERT`).
  - Node HTTPS fetch fails with `DEPTH_ZERO_SELF_SIGNED_CERT`.
- Flagged security risk: `docs/logs/coolify/Variables.md` currently contains plaintext production secrets and must be rotated/redacted.

**Reason:**
- User reported CRM issue after completion and provided Coolify logs + variables for root-cause diagnosis.

**Verification commands run:**
- `curl -k https://crm.nextacademyedu.com/healthz` -> `503 no available server`
- Node fetch against CRM domain -> `DEPTH_ZERO_SELF_SIGNED_CERT`
- Raw TLS cert inspection -> `CN=TRAEFIK DEFAULT CERT`

---

### [2026-03-20 00:14] - Twenty CRM Full Lifecycle (Outbox + Cron + Backfill + Hardening)

**Files updated (this pass):**
- CRM core layer:
  - `src/lib/crm/types.ts` (new)
  - `src/lib/crm/utils.ts` (new)
  - `src/lib/crm/dedupe.ts` (new)
  - `src/lib/crm/stages.ts` (new)
  - `src/lib/crm/twenty-client.ts` (new)
  - `src/lib/crm/mappers.ts` (new)
  - `src/lib/crm/queue.ts` (new)
  - `src/lib/crm/processor.ts` (new)
  - `src/lib/crm/service.ts` (new)
- New outbox collection:
  - `src/collections/CrmSyncEvents.ts` (new)
  - `src/payload.config.ts` (registered in collections list)
- Lifecycle hooks wired to outbox:
  - `src/collections/Users.ts`
  - `src/collections/UserProfiles.ts`
  - `src/collections/Leads.ts`
  - `src/collections/Companies.ts`
  - `src/collections/Bookings.ts`
  - `src/collections/Payments.ts`
  - `src/collections/ConsultationBookings.ts` (+ `twentyCrmDealId` field)
  - `src/collections/BulkSeatAllocations.ts`
  - `src/collections/Waitlist.ts`
- Cron processor endpoint:
  - `src/app/api/cron/crm-sync/route.ts` (new)
- Backfill tooling:
  - `scripts/backfill-crm-sync.ts` (new)
  - `package.json` (`crm:backfill` script)
- Environment/docs:
  - `.env.production.template`
  - `docs/engineering/env-variables.md`
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-20-00-14-session-14.md` (new)

**What changed technically:**
- Implemented one-way CRM integration from platform to Twenty via reliable outbox (`crm-sync-events`) with dedupe and retry/backoff.
- Added lifecycle event capture across all required entities and scenarios:
  - users, profiles/onboarding, leads, companies
  - bookings, payments, consultation bookings
  - bulk seat allocations, waitlist transitions
- Implemented CRM sync cron processor with:
  - pending/failed processing
  - dead-letter on max retries
  - stale processing lock reclaim (`CRM_SYNC_STALE_LOCK_MINUTES`)
- Added full historical backfill script with dry-run and resumable cursor.
- Added security hardening for cron endpoint:
  - fail-closed when `CRON_SECRET` is missing
  - timing-safe auth comparison
  - forced dynamic route execution
- Kept sync best-effort so CRM failures do not block user/business flows.

**Verification:**
- TypeScript check passed:
  - `cmd /c node_modules\\.bin\\tsc --noEmit` ✅
- Build status:
  - `npm run build` compiled app pages successfully but failed at standalone symlink copy on Windows (`EPERM`) — environment limitation, not app type/runtime logic.

---

### [2026-03-19 23:59] - Backend Closure Pass: Missing B2B/Instructor Endpoints + Contract Compatibility + Scope Hardening

**Files updated (this pass):**
- New API routes:
  - `src/app/api/b2b/_scope.ts` (new)
  - `src/app/api/b2b/dashboard/route.ts` (new)
  - `src/app/api/b2b/team/route.ts` (new)
  - `src/app/api/b2b/bookings/route.ts` (new)
  - `src/app/api/instructor/availability/route.ts` (new)
- Access + collection contract hardening:
  - `src/lib/access-control.ts`
  - `src/collections/ConsultationBookings.ts`
  - `src/collections/ConsultationTypes.ts`
  - `src/collections/ConsultationAvailability.ts`
  - `src/collections/Sessions.ts`
- Frontend compatibility client update:
  - `src/lib/instructor-api.ts`
- Documentation sync:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-19-23-59-session-13.md` (new)

**What changed technically:**
- Implemented all missing routes requested by audit:
  - `/api/b2b/dashboard`
  - `/api/b2b/team`
  - `/api/b2b/bookings`
  - `/api/instructor/availability` (GET/PUT)
- Added strict B2B company scoping (not role-only) through a shared scope resolver based on `user-profiles.company`.
- Added instructor contract compatibility columns/hooks (additive):
  - `consultation-types.title` + `consultation-types.description` (with localized sync/fallback hooks)
  - `consultation-availability.dayIndex` (numeric compatibility + day mapping hooks)
  - `sessions.status` + `sessions.attendanceCount` (legacy sync with `isCancelled` / `attendeesCount`)
- Closed instructor booking access mismatch:
  - `consultation-bookings` now allows instructor read/update for own records via `instructor` scope.
- Updated instructor frontend API helper to use the new scoped availability endpoint and better title fallbacks.

**Reason:**
- User explicitly approved immediate execution of:
  1. missing endpoints,
  2. instructor compatibility columns/contracts,
  3. final B2B/instructor access-scope hardening.

**Verification:** `node .\\node_modules\\typescript\\bin\\tsc --noEmit` ✅

---

### [2026-03-19 23:34] - Full Re-Audit: Remaining Missing APIs/Columns/Tables After Home DB Wiring

**Files updated (this pass):**
- Re-audit report:
  - `docs/engineering/full-audit-followup-2026-03-19.md` (new)
- Documentation sync:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-19-23-34-session-12.md` (new)

**What was re-audited:**
- Re-checked all frontend API calls against:
  - existing `src/app/api/**` custom routes
  - Payload auto-exposed collection endpoints
  - collection field contracts used by UI pages/components

**Confirmed still missing / unresolved:**
- Missing routes still referenced by frontend:
  - `/api/b2b/dashboard`, `/api/b2b/team`, `/api/b2b/bookings`, `/api/instructor/availability`
- Remaining schema/DTO mismatches:
  - consultation types (`title/description` vs `titleAr/titleEn`, `descriptionAr/descriptionEn`)
  - consultation availability (numeric day index vs weekday string enum)
  - sessions (`status`/`attendanceCount` expected vs `isCancelled`/`attendeesCount` in schema)
- Access-control mismatches still present:
  - instructor booking status update flow vs admin-only update access
  - B2B role access lacking strict company-level scoping in shared access helper
- Onboarding company payload mismatch remains (text vs relationship ID).

**Also confirmed complete from prior pass:**
- Home featured cards + home stats are now DB/API-driven.
- Added `programs.featuredPriority` and `programs.learnersCount` columns.
- Upcoming events response shape now matches frontend event DTO.

**Verification:** `node .\\node_modules\\typescript\\bin\\tsc --noEmit` ✅ (no TypeScript errors during re-audit pass).

---

### [2026-03-19 23:19] - Home Data Contracts: DB-Driven Featured Cards + Auto Stats + Upcoming Events DTO Fix

**Files updated (this pass):**
- Schema (additive columns for card/ordering readiness):
  - `src/collections/Programs.ts`
  - Added `featuredPriority` (manual order for featured cards)
  - Added `learnersCount` (read-only aggregate-ready counter)
- New home APIs:
  - `src/app/api/home/stats/route.ts` (new)
  - `src/app/api/home/featured-programs/route.ts` (new)
- Home sections wiring:
  - `src/components/sections/stats.tsx` (migrated from mock to `/api/home/stats`)
  - `src/components/sections/featured.tsx` (migrated from mock to `/api/home/featured-programs`)
- Event contract alignment:
  - `src/app/api/upcoming-events/route.ts`
  - Normalized API response to the flat event DTO expected by the frontend section component
- i18n updates:
  - `src/messages/en.json`
  - `src/messages/ar.json`
  - Added featured keys: `subtitle`, `enrolled`, `noRating`
- Documentation sync:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-19-23-19-session-11.md` (new)

**What changed technically:**
- Featured cards now pull real data from DB-backed collections (`programs`, `rounds`, `reviews`) via a normalized API.
- Card fields now come dynamically from DB context:
  - title, type, category, instructor, schedule/date, price/currency, image
  - enrolled count (from rounds enrollments)
  - rating and rating count (approved reviews with fallback to program aggregates)
- Stats section now computes numbers from DB (no mock constants):
  - professionals (confirmed/completed bookings)
  - corporate partners (companies)
  - active instructors
  - completion rate
- Upcoming events route now returns the frontend-expected flat event shape (`titleAr/titleEn/startDate/...`) to remove UI/API mismatch.

**Reason:**
- User requested that variable UI data (especially card content and stats) must come from database truth, with additive schema evolution and no table deletion.

**Verification:** `node .\\node_modules\\typescript\\bin\\tsc --noEmit` ✅

---

### [2026-03-19 23:00] - Frontend vs DB Deep Contract Audit (Additive Backend Alignment)

**Files updated (this pass):**
- Audit documentation:
  - `docs/engineering/frontend-db-contract-audit-2026-03-19.md` (new)
- Documentation sync:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-19-22-52-session-10.md` (new)

**What was verified:**
- Home page data sources were mapped section-by-section:
  - Confirmed most hero/home marketing blocks are static/mock data.
  - Confirmed upcoming events is DB/API-backed but with response-shape mismatch.
- Public pages were traced to Payload collections:
  - `/courses`, `/events`, `/webinars`, `/instructors`, `/programs/[slug]`, `/blog`, `/certificates` are DB-backed.
  - `/workshops`, `/faq`, `/for-business` remain static content.
- Dashboard/instructor/B2B data flows were audited against API route availability and access control.

**Critical contract gaps identified:**
- Missing custom endpoints expected by frontend:
  - `/api/b2b/dashboard`, `/api/b2b/team`, `/api/b2b/bookings`, `/api/instructor/availability`
- Field/schema mismatches:
  - upcoming events flat card DTO vs nested `{ program, round }` API response
  - consultation types UI expects `title/description` while schema uses `titleAr/titleEn` and `descriptionAr/descriptionEn`
  - instructor availability UI uses numeric day index while schema uses string weekday enum
  - instructor sessions UI expects `status` + `attendanceCount` while schema has `isCancelled` + `attendeesCount`
  - onboarding sends `company` as text while profile schema expects `companies` relationship ID
- Access mismatches:
  - instructor consultation booking status update path exists in UI but collection update is admin-only
  - B2B manager read access is role-based without explicit company-level scoping

**Decision (per user direction):**
- Adopt additive-only backend alignment (no table drops/deletions).
- Prioritize compatibility endpoints + response adapters first, then optional additive fields for long-term contract stability.

**Verification:** Deep code-path audit completed; no runtime/build command executed in this documentation-only pass.

---

### [2026-03-19 22:49] - Account Entry Fix in Navbar (Role-Aware Profile Access + User Avatar)

**Files updated (this pass):**
- Navbar account access behavior:
  - `src/components/layout/navbar.tsx`
  - Added explicit logged-in account entry (desktop + mobile) with role-aware destination:
    - `user` → `/${locale}/dashboard/profile`
    - `instructor` → `/${locale}/instructor`
    - `b2b_manager` → `/${locale}/b2b-dashboard`
    - `admin` → `/admin`
  - Replaced ambiguous text-only account action with clearer account button containing avatar + name
- Navbar account visual:
  - `src/components/layout/navbar.module.css`
  - Added avatar image style with safe fallback to first-name initial
- Auth user payload for avatar rendering:
  - `src/lib/auth-api.ts`
  - Updated `/api/users/me` fetch to `?depth=1` to reliably receive populated media object for `picture`
  - Broadened `UserData.picture` type to handle populated/non-populated relation formats safely
- Role redirect helper hardening:
  - `src/lib/role-redirect.ts`
  - Ensured admin route resolves to `/admin` without locale prefix

**Reason:** User reported that logged-in users had no clear profile/account entry point in navbar, especially across roles, and requested real profile picture support instead of text-only access.

**Verification:** `node .\\node_modules\\typescript\\bin\\tsc --noEmit` ✅

---

### [2026-03-19 22:45] - Mobile Bottom Bar Redesign (B2B + User + Instructor Portals)

**Files updated (this pass):**
- Dashboard portal bottom bar redesign:
  - `src/components/dashboard/DashboardLayout.tsx`
  - `src/components/dashboard/dashboard.module.css`
- Instructor portal bottom bar redesign:
  - `src/components/instructor/InstructorLayout.tsx`
  - `src/components/instructor/instructor.module.css`
- B2B portal bottom bar redesign:
  - `src/components/b2b/B2BLayout.tsx`
  - `src/components/b2b/b2b-layout.module.css`

**What changed:**
- Converted mobile bottom bars to rounded pill containers inspired by the provided reference.
- Added elevated active icon bubble (floating circular active state).
- Kept project icon set (Lucide) and applied project brand tokens/colors.
- Hid text labels visually on mobile while keeping accessibility labels (`aria-label`).
- Updated mobile safe-area spacing and floating back button offset to avoid overlap with the new bars.

**Reason:** User requested a bottom navigation style update across B2B profile, user profile/dashboard, and instructor portal to match the shared visual reference while preserving brand identity.

**Verification:** `npx tsc --noEmit` ✅

---

### [2026-03-19 22:35] - Portal UX/Responsive Pass: B2B Layout + User Profile + Instructor Portal

**Files updated (this pass):**
- `next.config.ts`
  - Added `next/image` localhost patterns for Payload media in dev:
    - `http://localhost:3000/api/media/**`
    - `http://127.0.0.1:3000/api/media/**`
- B2B portal shell redesign:
  - `src/components/b2b/B2BLayout.tsx`
  - `src/components/b2b/b2b-layout.module.css` (new)
  - Added responsive desktop/mobile structure (sidebar, topbar, bottom nav, back-to-site CTA)
- User dashboard shell/mobile nav polish:
  - `src/components/dashboard/DashboardLayout.tsx`
  - `src/components/dashboard/dashboard.module.css`
- Instructor portal shell/mobile nav decongestion:
  - `src/components/instructor/InstructorLayout.tsx`
  - `src/components/instructor/instructor.module.css`
  - Replaced cramped mobile nav behavior with horizontal scrollable nav items
- User profile page redesign:
  - `src/app/[locale]/(dashboard)/dashboard/profile/page.tsx`
  - `src/app/[locale]/(dashboard)/dashboard/profile/profile.module.css`
  - Reworked tabs/forms/toasts/cards into cleaner token-based styling and better mobile behavior
- B2B dashboard pages responsive + visual consistency pass:
  - `src/app/[locale]/(b2b)/b2b-dashboard/page.tsx`
  - `src/app/[locale]/(b2b)/b2b-dashboard/bookings/page.tsx`
  - `src/app/[locale]/(b2b)/b2b-dashboard/team/page.tsx`
  - `src/app/[locale]/(b2b)/b2b-dashboard/bulk-seats/page.tsx`
- Instructor portal pages responsive + palette consistency pass:
  - `src/app/[locale]/(instructor)/instructor/page.tsx`
  - `src/app/[locale]/(instructor)/instructor/sessions/page.tsx`
  - `src/app/[locale]/(instructor)/instructor/bookings/page.tsx`
  - `src/app/[locale]/(instructor)/instructor/availability/page.tsx`
  - `src/app/[locale]/(instructor)/instructor/consultation-types/page.tsx`
  - `src/app/[locale]/(instructor)/instructor/earnings/page.tsx`
- User dashboard overview consistency update:
  - `src/app/[locale]/(dashboard)/dashboard/page.tsx`
  - Updated CTA link to `/courses` and aligned colors with core palette

**Reason:** User requested targeted UI cleanup and responsiveness for B2B profile/dashboard, user profile, and instructor portal sections while preserving backend integrations.

**Verification:** `npx tsc --noEmit` ✅

---

### [2026-03-19 22:35] - Popup Targeting Expansion + Offer-Dark Preset + Navbar Theme Toggle + Global Spacing Fix

**Files updated (this pass):**
- Popup admin schema expansion:
  - `src/collections/Popups.ts`
  - Added advanced targeting controls (`visitorCondition`, `purchaseCondition`, `emailCaptureCondition`, `minSessionPageViews`)
  - Added design preset fields for promotional style (`stylePreset`, badge/subtitle/legal note, background image/overlay, border/badge colors)
- Popup runtime + eligibility logic:
  - `src/app/api/popups/active/route.ts`
  - `src/components/marketing/popup-manager.tsx`
  - `src/components/marketing/popup-modal.tsx`
  - `src/components/marketing/popup-modal.module.css`
  - Fixed API response parsing mismatch in popup manager (`data.popups`)
  - Added context-aware filtering (first visit, email captured flag, session page views, purchased vs non-purchased users)
  - Added `offer_dark` visual preset to match provided promotional modal direction
- App-wide popup mounting:
  - `src/app/[locale]/layout.tsx`
  - `src/app/[locale]/page.tsx`
  - Moved popup manager to locale layout so targeting runs across all public pages, not homepage-only
- Navbar desktop utility fix:
  - `src/components/layout/navbar.tsx`
  - Restored desktop light/dark toggle visibility by rendering `ThemeToggle` in desktop actions
- Global spacing reset fix:
  - `src/app/globals.css`
  - Removed browser default body/html margin/padding for frontend scope to eliminate unwanted outer gaps
- Documentation sync:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-19-22-35-session-6.md`

**Reason:** User requested stronger admin-controlled popup conditions/design (including first-visit and no-purchase targeting), promo-modal styling closer to provided examples, missing desktop theme-toggle in navbar, and removal of global extra page spacing.

**Verification:** `node .\\node_modules\\typescript\\bin\\tsc --noEmit` ✅

---

### [2026-03-19 22:37] - Home Hero Cleanup: Removed KPI Metrics Strip

**Files updated (this pass):**
- Hero metrics removal:
  - `src/components/sections/hero.tsx` (removed `300+ / 80K+ / 4.8` metric cards block)
  - `src/components/sections/hero.module.css` (removed unused `.metrics/.metric` styles)
- Documentation sync:
  - `docs/logs/changelog.md`
  - `docs/logs/tasks.md`
  - `docs/sessions/2026-03-19-22-37-session-7.md`

**Reason:** User requested removing duplicate KPI cards from home hero because a dedicated stats section already exists.

**Verification:** Not run (`tsc/build` not executed in this pass).

---

### [2026-03-19 22:03] - Courses Naming Alignment + Instructors/Profile Redesign + Full Events/Webinars Pages

**Files updated (this pass):**
- Brand color re-alignment to core palette:
  - `src/app/globals.css` (`#c51b1b`, `#f1f6f1`, `#d6a32b`, `#020504` as base tokens)
- Courses/Programs unification:
  - `src/app/[locale]/courses/page.tsx` (new dynamic catalog page from real Payload data)
  - `src/app/[locale]/courses/page.module.css` (new)
  - `src/app/[locale]/programs/page.tsx` (alias to `/courses` page implementation)
- Navbar/links cleanup (remove Courses/Programs duplication in primary nav):
  - `src/components/layout/navbar.tsx`
  - `src/components/layout/footer.tsx`
  - `src/components/sections/hero.tsx`
  - `src/components/sections/featured.tsx`
  - `src/components/sections/about-cta.tsx`
  - `src/components/pages/catalog-page.tsx`
- Instructors listing redesign with real stats:
  - `src/app/[locale]/instructors/page.tsx`
  - `src/app/[locale]/instructors/page.module.css`
- Instructor profile redesign (almentor-style structure adapted to project data):
  - `src/app/[locale]/instructors/[slug]/page.tsx`
  - `src/app/[locale]/instructors/[slug]/page.module.css`
  - Added profile metrics, programs/workshops section, and available booking types from DB-backed consultation types/slots
- Full page rebuilds for webinars/events:
  - `src/app/[locale]/events/page.tsx`
  - `src/app/[locale]/events/page.module.css`
  - `src/app/[locale]/webinars/page.tsx`
  - `src/app/[locale]/webinars/page.module.css`
  - Added upcoming + archive + media/gallery sections

**Reason:** User requested strict return to core brand colors, better structure for `/programs`, stronger `/instructors` and mentor profile experience, removal of Courses/Programs nav duplication, and full-featured `/events` + `/webinars` pages.

**Verification:** `npx tsc --noEmit` ✅

---

### [2026-03-19 21:25] - Visual Consistency Pass: Remaining Pages + Section Background System

**Files updated (this pass):**
- Global design tokens + button baseline states:
  - `src/app/globals.css`
- Home sections contrast/background pass:
  - `src/components/sections/featured.module.css`
  - `src/components/sections/instructors-preview.module.css`
  - `src/components/sections/blogs-preview.module.css`
  - `src/components/sections/upcoming-events.module.css`
  - `src/components/sections/video-testimonials.module.css`
  - `src/components/sections/b2b-trusted.module.css`
- About sections background alternation:
  - `src/components/sections/about-story.module.css`
  - `src/components/sections/about-values.module.css`
  - `src/components/sections/about-team.module.css`
  - `src/components/sections/about-partners.module.css`
  - `src/components/sections/about-timeline.module.css`
  - `src/components/sections/about-cta.module.css`
- Remaining pages background/style alignment:
  - `src/app/[locale]/about/page.module.css`
  - `src/app/[locale]/blog/page.module.css`
  - `src/app/[locale]/contact/page.module.css`
  - `src/app/[locale]/programs/page.module.css`
  - `src/app/[locale]/programs/[slug]/page.module.css`
  - `src/app/[locale]/instructors/page.module.css`
  - `src/app/[locale]/instructors/[slug]/page.module.css`
  - `src/app/[locale]/privacy/page.module.css`
  - `src/app/[locale]/terms/page.module.css`
  - `src/app/[locale]/refund-policy/page.module.css`
  - `src/components/pages/catalog-page.module.css`
- Navbar/mobile menu polish:
  - `src/components/layout/navbar.module.css`
- Minor UI consistency:
  - `src/components/layout/announcement-bar.module.css`
  - `src/components/layout/sidebar.module.css`
  - `src/components/search/global-search.module.css`
- CTA route fix:
  - `src/components/sections/hero.tsx` (`/b2b-dashboard` → `/for-business`)

**Reason:** User requested redesign completion for remaining pages/sections and a full revisit of section backgrounds because the previous gray tone felt heavy.

**Verification:** `npx tsc --noEmit` ✅

---

### [2026-03-19 21:03] - Navigation Completion Pass: Missing Pages + Navbar Decongestion

**Files updated (this pass):**
- Navbar cleanup:
  - `src/components/layout/navbar.tsx`
  - `src/components/layout/navbar.module.css`
- Button visibility fix:
  - `src/app/globals.css` (removed global button reset that overrode component button backgrounds)
- New route pages to match navbar:
  - `src/app/[locale]/courses/page.tsx`
  - `src/app/[locale]/workshops/page.tsx`
  - `src/app/[locale]/events/page.tsx`
  - `src/app/[locale]/webinars/page.tsx`
  - `src/app/[locale]/faq/page.tsx`
  - `src/app/[locale]/faq/page.module.css`
  - `src/app/[locale]/for-business/page.tsx`
  - `src/app/[locale]/for-business/page.module.css`
- Shared reusable catalog UI:
  - `src/components/pages/catalog-page.tsx`
  - `src/components/pages/catalog-page.module.css`
- Home contrast tuning:
  - `src/components/sections/why-choose-us.module.css`
  - `src/components/sections/video-testimonials.module.css`

**Reason:** User feedback indicated navbar crowding, missing linked pages, and normal-state buttons appearing transparent.

**Verification:** `npx tsc --noEmit` ✅

---

### [2026-03-19 20:50] - Home UI Refactor: Navbar + Hero + Featured + Contrast Pass

**Files updated (core):**
- `src/components/layout/navbar.tsx` — full navigation rewrite (desktop mega menu + clean mobile drawer + de-duplicated auth/CTA)
- `src/components/layout/navbar.module.css` — new responsive layout/styling and dropdown/drawer interactions
- `src/components/sections/hero.tsx` — full-bleed hero with image, overlay, CTA links, KPI strip
- `src/components/sections/hero.module.css` — hero visual system (overlay, grain, responsive behavior)
- `src/components/sections/featured.tsx` — rebuilt course cards to match Figma direction (badge/meta/price/book CTA)
- `src/components/sections/featured.module.css` — card and carousel visual rewrite
- `src/components/ui/button.module.css` + `src/app/globals.css` — button token alignment to dark/light Figma states (fixed ghost visibility issue)
- Home section contrast tuning:
  - `src/components/sections/stats.module.css`
  - `src/components/sections/upcoming-events.module.css`
  - `src/components/sections/instructors-preview.module.css`
  - `src/components/sections/b2b-trusted.module.css`
  - `src/components/sections/blogs-preview.module.css`
  - `src/components/sections/text-testimonials.module.css`
- i18n additions for nav labels:
  - `src/messages/en.json`
  - `src/messages/ar.json`

**Reason:** Navbar had structural duplication/UX issues, mobile menu was weak, hero was placeholder-like instead of full-bleed, ghost buttons lacked visible default state, and home sections had low visual contrast.

**Verification:** `npx tsc --noEmit` ✅ (no TypeScript errors).

---

### [2026-03-19 13:10] - Dark/Light Mode CSS Token Audit

**Files audited:**
- All `.module.css` files across the project
- `globals.css` — confirmed `--input-bg`, `--input-bg-hover`, `--input-bg-active`, `--overlay-bg` tokens present

**Result:** Every CSS module file already uses design tokens (`var(--xxx)`) with proper fallbacks. No hardcoded rgba/hex values found that would break dark/light mode contrast. Auth pages (login, onboarding, verify-email) were already fixed in the prior WCAG session.

**Build status:** ✅ Compilation + TypeScript pass. ⚠️ Pre-existing page data error for missing `/register` and `/reset-password` routes (unrelated to CSS).

---

### [2026-03-19 12:35] - RTL CSS Fixes (Arabic Default Language)

**Files:**

- `src/components/sections/video-testimonials.module.css` (MODIFIED) — logical properties for RTL
- `src/components/instructor/instructors-preview.module.css` (MODIFIED) — logical properties for RTL
- `src/components/sections/featured.module.css` (MODIFIED) — logical properties for RTL
- `src/components/sections/blogs-preview.module.css` (MODIFIED) — logical properties for RTL
- `src/components/sections/why-choose-us.module.css` (MODIFIED) — logical properties for RTL
- `src/components/ui/popup-modal.module.css` (MODIFIED) — logical properties for RTL
- Hero button variant changed from `outline` → `secondary`

**Reason:** Making Arabic (RTL) the default language — replaced directional CSS properties (`margin-left`, `padding-right`, etc.) with CSS logical properties (`margin-inline-start`, `padding-inline-end`, etc.) for proper RTL support.

**Build status:** ✅ Compilation, TypeScript, and 29/29 static pages pass. Symlink EPERM on Windows is known (Docker/Coolify unaffected).

---

### [2025-07-22 00:30] - WCAG AA Contrast Fix: `--accent-text` Token

**Files changed (16):**
- `src/app/globals.css` — added `--accent-text` token
- 15 `.module.css` files — replaced `color: var(--accent-primary)` → `color: var(--accent-text)`

**Reason:** `#FF3333` (`--accent-primary`) failed WCAG AA (4.5:1) when used as text color on dark backgrounds. New token `--accent-text` uses `#E63030` (dark) / `#B71616` (light) to pass contrast.

### [2026-03-18 21:05] - Housekeeping: Logs & Session Verification

- **Files:**
  - `docs/sessions/2026-03-18-21-05-session-7.md` — **NEW** — Session 7 log (documentation housekeeping)
  - `docs/logs/changelog.md` — Updated with this entry
  - `docs/logs/tasks.md` — Updated with session 7 record
- **Reason:** User requested verification and update of all logs/sessions for the day's work (sessions 1–6). All previous logs confirmed up-to-date; created session 7 for traceability.

---

### [2026-03-18 20:30] - Feature: About Page — Full Build with 5 Sections

- **Files:**
  - `src/app/[locale]/about/page.tsx` — Rewrote from placeholder to full About page composing 5 sections
  - `src/app/[locale]/about/page.module.css` — Overhauled with dark mode tokens, mobile-first breakpoints, RTL logical properties
  - `src/components/about/hero-section.tsx` — **NEW** — Animated gradient hero with heading + CTA
  - `src/components/about/hero-section.module.css` — **NEW** — Hero styles with gradient animation
  - `src/components/about/story-section.tsx` — **NEW** — Academy origin story with stat cards
  - `src/components/about/story-section.module.css` — **NEW** — Story layout with glassmorphic stat cards
  - `src/components/about/values-section.tsx` — **NEW** — 6 core values with icon cards
  - `src/components/about/values-section.module.css` — **NEW** — Card grid with hover effects
  - `src/components/about/team-section.tsx` — **NEW** — Team member cards with role badges
  - `src/components/about/team-section.module.css` — **NEW** — Team grid with avatar placeholders
  - `src/components/about/cta-section.tsx` — **NEW** — Contact CTA with gradient background
  - `src/components/about/cta-section.module.css` — **NEW** — CTA styles with glow effects
  - `src/app/[locale]/about/loading.tsx` — **NEW** — Skeleton loading state
  - `src/app/[locale]/about/error.tsx` — **NEW** — Error boundary with retry
- **i18n:** All content uses `useTranslations('About')` — zero hardcoded strings (ar.json + en.json already populated)
- **Design:** Dark glassmorphism, mobile-first CSS, RTL logical properties, design system tokens
- **Verification:** `pnpm build` — compiled ✓, types valid ✓, 26/26 static pages ✓

---

### [2026-03-18 19:45] - Refactor: Split Email Templates into Domain-Specific Files

- **Files:**
  - `src/lib/email/booking-emails.ts` — **NEW** — `sendBookingConfirmation`, `sendBookingCancelled`
  - `src/lib/email/payment-emails.ts` — **NEW** — `sendPaymentReceipt`, `sendPaymentReminder`, `sendPaymentOverdue`, `sendInstallmentReminder`
  - `src/lib/email/user-emails.ts` — **NEW** — `sendWelcomeEmail`, `sendPasswordResetEmail`, `sendEmailVerification`
  - `src/lib/email/admin-emails.ts` — **NEW** — `sendAdminNewBookingNotification`, `sendAdminPaymentAlert`
  - `src/lib/email/index.ts` — Updated barrel with re-exports + legacy aliases
  - `src/app/api/cron/check-overdue/route.ts` — Fixed: `amount` → `amountDue`
  - `src/app/api/webhooks/easykash/route.ts` — Fixed: `amount` → `amountPaid`
  - `src/app/api/webhooks/paymob/route.ts` — Fixed: `amount` → `amountPaid`
- **Reason:** Single 400-line email.ts was hard to maintain; split into domain modules with consistent naming.
- **Verification:** `pnpm build` — compiled + type-checked ✅, 26/26 static pages ✅.

---

### [2026-03-18 20:15] - Content: About Page i18n Strings

- **Files:**
  - `src/messages/en.json` — Added `About` namespace (34 keys: hero, story, values, team, CTA)
  - `src/messages/ar.json` — Added `About` namespace (34 keys: Arabic translations for all About page content)
- **Reason:** Preparing i18n strings for the upcoming About page build.

---

### [2026-03-18 19:30] - Fix: Light Mode Color Contrast & Theme-Safe CSS Tokens

- **Files:**
  - `src/app/globals.css` — Added 12 component-level CSS tokens (`--glass-bg`, `--glass-border`, `--grid-line`, `--hover-overlay`, `--icon-bg`, `--icon-border`, `--badge-bg`, `--card-shadow`, `--card-shadow-hover`, `--sidebar-bg`, `--topbar-bg`, `--glass-shadow`) with dark defaults + light overrides
  - `src/components/ui/button.module.css` — Replaced hardcoded white-rgba borders/bg
  - `src/components/sections/why-choose-us.module.css` — Fixed grid lines, icon bg/border, glass card bg/shadow
  - `src/components/sections/text-testimonials.module.css` — Fixed carousel card bg, border, shadow, dot indicators
  - `src/components/sections/featured.module.css` — Fixed typeBadge bg
  - `src/components/layout/footer.module.css` — Fixed border-top, watermark text color
  - `src/components/auth/auth-layout.module.css` — Fixed grid pattern, testimonial card bg/border/shadow, badge bg
  - `src/components/instructor/instructor.module.css` — Fixed sidebar bg, topbar bg, nav links, mobile bottom bar, page grid
  - `src/components/search/global-search.module.css` — Fixed kbd badge, thumbnail placeholder bg
- **Reason:** Light mode had invisible/washed-out elements because ~50 hardcoded `rgba(255, 255, 255, ...)` values showed white-on-white.
- **Verification:** All changes are CSS variable substitutions (no logic changes), structurally safe.

---

### [2026-03-18 19:00] - Feature: Dark/Light Theme Toggle

- **Files:**
  - `src/context/theme-context.tsx` — **NEW** — ThemeProvider + useTheme hook (localStorage persistence)
  - `src/components/layout/theme-toggle.tsx` — **NEW** — Animated sun/moon toggle button
  - `src/components/layout/theme-toggle.module.css` — **NEW** — Toggle component styles
  - `src/app/globals.css` — Added `html[data-theme="light"]` CSS vars block
  - `src/components/layout/navbar.tsx` — Integrated toggle in desktop + mobile menu
  - `src/app/[locale]/layout.tsx` — Wrapped with ThemeProvider + anti-FOUC inline script
  - `src/messages/ar.json` — Added `Accessibility.lightMode` + `Accessibility.darkMode`
  - `src/messages/en.json` — Added `Accessibility.lightMode` + `Accessibility.darkMode`
- **Reason:** Users need ability to switch between dark and light modes with persistence across sessions.
- **Verification:** `pnpm build` → compiled ✓, types valid ✓, 26/26 static pages ✓ (standalone symlink error is pre-existing Windows/pnpm issue).

---

### [2026-03-18 18:30] - Refactor: Email System — Split Monolith into Domain Modules

- **Files:**
  - `src/lib/email.ts` — **DELETED** (monolith — 700+ lines)
  - `src/lib/email/email-core.ts` — **NEW** — shared utilities (send, layout, greeting, types)
  - `src/lib/email/auth-emails.ts` — **NEW** — 7 auth/account functions
  - `src/lib/email/booking-emails.ts` — **NEW** — 9 booking/program functions
  - `src/lib/email/payment-emails.ts` — **NEW** — 9 payment/installment functions
  - `src/lib/email/engagement-emails.ts` — **NEW** — 6 consultation/lifecycle functions
  - `src/lib/email/index.ts` — **NEW** — barrel re-export (31 functions + 2 legacy aliases)
- **Reason:** 700+ line monolith was hard to navigate and maintain. Split into 4 domain-specific modules with a shared core and barrel re-export for backward-compatible imports.
- **Verification:** `pnpm tsc --noEmit` ✅ — zero errors. All `@/lib/email` imports resolve correctly through the barrel.

---

### [2026-03-18 19:15] - Fix: UI Audit Phase 2 — Page-Level CSS Design System Alignment (4 CSS files)

- **Files:**
  - `src/app/[locale]/programs/page.module.css` — Converted to mobile-first breakpoints, replaced magic numbers with design tokens, switched to RTL logical properties
  - `src/app/[locale]/programs/[slug]/page.module.css` — Converted to mobile-first breakpoints, design token alignment, RTL logical properties
  - `src/app/[locale]/instructors/page.module.css` — Converted to mobile-first breakpoints, design token alignment, RTL logical properties
  - `src/app/[locale]/instructors/[slug]/page.module.css` — Converted to mobile-first breakpoints, design token alignment, RTL logical properties
- **Issues Fixed:**
  1. Desktop-first `max-width` breakpoints → mobile-first `min-width` breakpoints
  2. Magic numbers (colors, spacing, radii, font-sizes) → CSS custom properties from `design-system.md`
  3. Physical properties (`padding-left`, `margin-right`) → RTL logical properties (`padding-inline-start`, `margin-inline-end`)
  4. `box-shadow` → `border` (per design system — no shadows except hero CTA)
  5. Hardcoded breakpoint values → `993px` and `769px` per design system
- **Verification:** `pnpm build` → compiled successfully.

---

### [2026-03-18 18:00] - Fix: UI Audit — Design System Alignment (7 CSS files)

- **Files:**
  - `src/app/globals.css` — Added 8 missing design tokens (z-index scale, spacing aliases, badge status colors)
  - `src/components/ui/button.module.css` — Changed border-radius to 4px, font-weight to 800
  - `src/components/ui/card.module.css` — Changed border-radius to 8px, resting border to transparent, removed min-height
  - `src/components/ui/badge.module.css` — Added status color variants using new tokens, added dot indicator
  - `src/components/layout/navbar.module.css` — Replaced magic z-index with `var(--z-sticky)`, converted to mobile-first `min-width` breakpoints
  - `src/components/layout/footer.module.css` — Converted to mobile-first responsive (stacked default → row at 993px)
  - `src/components/sections/featured.module.css` — Converted to mobile-first responsive, used z-index tokens
- **Issue:** CSS files used values that contradict `docs/design/design-system.md` — wrong border-radii, wrong font-weights, magic z-index numbers, desktop-first breakpoints.
- **Fix:** Aligned all 7 files with documented design system. Mobile-first CSS is now the default pattern.
- **Verification:** `pnpm build` → compiled successfully in 39s, types valid. `_document` error is pre-existing/unrelated.

---

### [2026-03-18 14:30] - Fix: Program Detail Page TypeScript Errors (Proper Payload Types)

- **Files:**
  - `src/app/[locale]/programs/[slug]/page.tsx` — Rewrote with proper `Program`, `Round`, `Instructor` types from `@/payload-types`
- **Issue:** The program detail page used `Record<string, unknown>` casts with non-existent field names (`maxSeats`, `enrolledCount`, `format`, `syllabus`), causing TypeScript errors and potential runtime crashes.
- **Fix:**
  - Imported `Program`, `Round`, `Instructor` types from `@/payload-types`
  - Fixed field names to match schema: `maxCapacity`, `currentEnrollments`, `locationType`, `shortDescriptionAr`/`shortDescriptionEn`
  - Fetched rounds from separate `rounds` collection (correct Payload pattern) instead of assuming embedded
  - Removed non-existent `syllabus` section
  - Properly handled `number | Instructor` union type for instructor field
- **Verification:** `pnpm exec tsc --noEmit` — zero errors in `page.tsx`. Only pre-existing drizzle-orm errors in `reset-admin/route.ts` remain (unrelated).

---

### [2026-03-18 15:00] - Fix: Missing i18n Keys + Program Detail Objectives Rendering

- **Files:**
  - `src/messages/en.json` — Added `Auth.checkEmail`, `Auth.resetLinkSent`, `Auth.enterEmailError`
  - `src/messages/ar.json` — Added same 3 keys in Arabic
  - `src/app/[locale]/programs/[slug]/page.tsx` — Fixed `objectives` type from `string[]` to `{id?, item}[]` and updated `.map()` rendering
- **Issue:** Forgot-password page crashed at runtime with `MISSING_MESSAGE: Could not resolve 'Auth.checkEmail'` (and 2 related keys). Program detail page crashed with `obj.item is not a function` because `objectives` is an array of objects, not strings.
- **Fix:** Added the 3 missing i18n keys to both locale files. Changed objectives rendering to access `.item` property.

---

### [2026-03-18 00:00] - Created Agent Workflow Files (4 new workflows)

- **Files:**
  - `.agents/workflows/local-dev-setup.md` (NEW) — local PostgreSQL via Docker, env vars, schema sync, seed, troubleshooting
  - `.agents/workflows/debug-production.md` (NEW) — container crashes, auth issues, schema failures, email, SSL, rollback
  - `.agents/workflows/deploy.md` (already existed — Coolify full deploy)
  - `.agents/workflows/pre-deploy-check.md` (already existed — 10-step pre-deploy gate)
- **Reason:** Codified the full local development setup and production debugging procedures that were previously undocumented. These are now accessible as `/local-dev-setup` and `/debug-production` slash commands.

---

### [2026-03-18 08:25] - Log Unification & Cleanup

- **Files:** `logs/changelog.md`, `logs/tasks.md`, `logs/errors.md`
- **Deleted:** `docs/logs/` directory (was a duplicate of `logs/`)
- **Reason:** Two log directories existed (`logs/` and `docs/logs/`) with overlapping but inconsistent content. Both `tasks.md` and `errors.md` had duplicate sections within the same file.
- **Changes:**
  - Merged 2 unique changelog entries from `docs/logs/changelog.md` → `logs/changelog.md`
  - Merged 1 unique error entry from `docs/logs/errors.md` → `logs/errors.md`
  - Deleted `docs/logs/` entirely
  - Rewrote `tasks.md` — removed duplicates, added session log section with per-session breakdowns
  - Rewrote `errors.md` — removed duplicates, added missing CSS fix error, organized chronologically
  - `logs/` is now the **single source of truth** for all project logs

---

### [2026-03-18 08:15] - Role-Based Dashboard Routing After Login

- **Files:** `src/lib/role-redirect.ts` (NEW), `src/app/[locale]/(auth)/login/page.tsx`, `src/lib/auth-api.ts`
- **Reason:** All users were redirected to `/dashboard` after login regardless of role. Per `roles-permissions.md`, each role should land on its own dashboard (`user` → `/dashboard`, `b2b_manager` → `/b2b-dashboard`, `instructor` → `/instructor`, `admin` → `/admin`).
- **Changes:**
  - Created `getDashboardPath(role, locale)` utility mapping each role to its correct dashboard path
  - Updated login page `useEffect` redirect to use user's role from auth context
  - Updated login `handleSubmit` success to extract role from login API response and redirect accordingly
  - Changed `redirectToGoogle()` default from `/dashboard` to `/`

---

### [2026-03-16 09:00] - Fix Login Route Body Parsing for Payload Admin Panel

- **Files:** `src/app/api/users/login/route.ts`
- **Reason:** Payload CMS admin panel sends login data as `multipart/form-data` with a `_payload` field. The custom login route only handled `application/json`, causing a 500 error on every login attempt from the admin panel.
- **Changes:**
  - Added `Content-Type` header detection to distinguish between `multipart/form-data` and `application/json`
  - For multipart requests, parse `_payload` field from `formData()`
  - For JSON requests, use `req.json()` as before
  - Properly type `email`/`password` as `string | undefined` instead of using `as string` casts on `unknown` values

---

### [2026-03-16 19:27] - Fix V2: Payload Admin CSS — data-attribute scoping (replaces @layer approach)

- **الملفات اللي اتعدّلت:** `src/app/globals.css`, `src/app/[locale]/layout.tsx`, `src/app/(payload)/custom.scss`
- **المشكلة:** الـ `@layer frontend` wrapper من الـ fix الأول اتعمله strip من Next.js CSS bundler في الـ production build — الـ layer order declaration ظهر بس محتوى الـ layer اختفى. النتيجة: الـ resets (dark bg, `* { margin: 0 }`, `button { border: none }`) فضلت unlayered وبتكسب على Payload.
- **الحل:** بدل layers، كل الـ destructive resets اتلفت في `html[data-app="frontend"]` selector. والـ `[locale]/layout.tsx` بقى بيضيف `data-app="frontend"` على `<html>`. Payload admin مبيضيفش الـ attribute ده فالـ resets مبتأثرش عليه.
- **ملاحظة:** `:root` CSS variables اتسابت بدون scoping لأنها safe — بتتطبق بس لما يتعمللها reference.

---

### [2026-03-16 18:00] - Fix: Payload Admin CSS — wrap globals.css in @layer frontend

- **الملفات اللي اتعدّلت:** `src/app/globals.css`, `src/app/(payload)/custom.scss`
- **المشكلة:** الـ `globals.css` (dark background, margin/padding resets, button resets) كانت unlayered CSS. Payload بتلف الـ CSS بتاعها في `@layer payload-default`. في CSS Cascade Layers، unlayered styles دايماً بتكسب على layered styles — فالـ frontend CSS كانت بتعمل override كامل للـ admin panel.
- **الحل:**
  1. لفينا كل `globals.css` في `@layer frontend { ... }`
  2. حطينا layer ordering في `custom.scss`: `@layer frontend, payload-default, payload;` — ده بيخلي Payload ياخد أعلى priority

---

### [2026-03-16 14:12] - Fix: Payload Admin Panel CSS Not Rendering (Double-Nested HTML)

- **الملفات اللي اتعدّلت:** `src/app/layout.tsx`
- **المشكلة:** الـ Payload admin panel (`/admin`) كان بيظهر بدون أي CSS — الصفحة HTML خام. السبب إن الـ root `layout.tsx` كان بيعمل `<html><body>` وPayload's `RootLayout` كمان كان بيعمل `<html data-theme="light"><body>` جواه — فبقى فيه double nesting. المتصفح كان بيطبق الـ CSS variables على الـ outer `<html>` اللي مفيهوش `data-theme`.
- **الحل:** غيّرنا الـ root layout إنه يرجع `children` مباشرة بدون `<html>/<body>` عشان كل route group (`(payload)` و `[locale]`) يحط الـ tags بتاعته بنفسه.

### [2026-03-16 13:46] - Fix: Regenerate pnpm-lock.yaml for deployment (next@15.4.11)

- **الملفات اللي اتعدّلت:** `pnpm-lock.yaml`
- **المشكلة:** الـ Dockerfile بيستخدم `pnpm install --frozen-lockfile` بس الـ `pnpm-lock.yaml` كان لسه فيه `next@16.1.6` القديم بعد ما عملنا downgrade لـ `next@15.4.11` في الـ `package.json`. ده كان بيعمل version mismatch وفشل في الـ deployment.
- **الحل:** عملنا `pnpm install --no-frozen-lockfile` عشان نعمل regenerate للـ lockfile. اتأكدنا إن الـ version بقى `15.4.11` وامتحنّا إن `16.1.6` اتشال تماماً.
- **Commit:** `78a36a2`

---

### [2026-03-16 13:36] - Fix: Downgrade Next.js 16.1.6 → 15.4.11 (Admin Panel CSS compatibility)

- **الملفات اللي اتعدّلت:** `package.json`, `src/app/layout.tsx` [🆕], `src/app/privacy-policy/page.tsx`
- **المشكلة:** الـ Admin Panel CSS كان مكسور على Next.js 16.1.6 — Payload CMS 3.79 مش متوافق رسمياً مع Next.js 16 (يحتاج `>=16.2.0-canary.10` أو يستخدم 15.x). الـ SCSS compilation والـ theme variables كانوا مش شغالين صح. كمان `sass` package كان ناقص (اتضاف قبل كده بس الـ framework version كان هو الـ root cause).
- **الحل:**
  1. Downgrade `next` من `16.1.6` → `15.4.11` (آخر stable في النطاق المدعوم من Payload)
  2. إنشاء `src/app/layout.tsx` — root layout مطلوب في Next.js 15 لكل route tree
  3. Refactor `privacy-policy/page.tsx` — حذف الـ `<html>/<head>/<body>` tags (بقوا بييجوا من root layout)
  4. Clean install (`node_modules` + `.next` + `package-lock.json` اتحذفوا وتعملوا من جديد)
- **النتيجة:** Build ✅ — 60 route اتعملوا compile بنجاح، الـ admin panel bundle 729kB مع CSS chunks سليمة
- **ملاحظة:** لا تعمل upgrade لـ Next.js 16 غير لما Payload CMS يدعمه رسمياً

---

### [2026-03-16 12:05] - Fix: Admin Panel Missing CSS on VPS (NEXT_PUBLIC_SERVER_URL not baked into build)

- **الملفات اللي اتعدّلت:** `Dockerfile`, `.env.production.template`
- **المشكلة:** الـ admin panel على الـ VPS كان بيظهر بدون CSS (white/unstyled). السبب الجذري: `NEXT_PUBLIC_SERVER_URL` مكانش موجود كـ Docker build arg. بما إن `NEXT_PUBLIC_*` vars بتتعمل bake في الـ client bundle وقت الـ build بواسطة Next.js، الـ `serverURL` في Payload config كان فاضي — الـ theme provider مكانش بيعمل hydrate، و`data-theme` attribute و CSS variables كانوا مش بيتحطوا على `<html>`.
- **الحل:** إضافة `NEXT_PUBLIC_SERVER_URL` كـ build ARG في Dockerfile مع fallback لـ `NEXT_PUBLIC_APP_URL`: `ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL:-$NEXT_PUBLIC_APP_URL}`
- **ملاحظة:** يجب إضافة `NEXT_PUBLIC_SERVER_URL=https://nextacademyedu.com` في `.env.production` على الـ VPS وعمل rebuild

---

### [2026-03-16 11:03] - Remove: Social Login Buttons (Google, Facebook, Apple)

- **الملفات اللي اتعدّلت:** `src/app/[locale]/(auth)/login/page.tsx`, `src/app/[locale]/(auth)/register/page.tsx`
- **المشكلة:** أزرار الـ Social Login (Google, Facebook, Apple) كانت موجودة في صفحات Login و Register لكن الـ OAuth providers مش متظبطين — الأزرار كانت بتعمل redirect لـ endpoints مش شغالة
- **الحل:** حذف الـ social login buttons + الـ divider ("or") + cleanup الـ unused imports (`Facebook`, `Apple` من lucide-react)
- **ملاحظة:** لما يتم تظبيط OAuth providers في المستقبل، ممكن نرجّعهم تاني

---

### [2026-03-16 09:29] - Fix: Admin Panel Missing CSS (sass package missing)

- **الملفات اللي اتعدّلت:** `package.json`
- **المشكلة:** الـ admin panel على `/admin` كان بيظهر أبيض بالكامل بدون styling — الـ CSS variables (`--theme-bg`, `--theme-elevation-*`, إلخ) كانت undefined. السبب الجذري: `sass` package مش موجود في `package.json`. Payload CMS 3.x بيستخدم SCSS files (`colors.scss`, `app.scss`, `vars.scss`) لتعريف CSS variables — من غير `sass`, Next.js مش بيقدر يعمل compile للـ SCSS → الـ CSS chunks بتطلع فاضية.
- **الحل:** إضافة `"sass": "^1.89.1"` في `devDependencies`
- **ملاحظة:** كمان Next.js 16.1.6 مش في النطاق المدعوم من Payload 3.79 (`>=16.2.0-canary.10`) — ده ممكن يسبب مشاكل تانية.

---

## 🚧 ### [2026-03-16 04:30] - Fix: Database migration applied to VPS

-03-16

---

### [2026-03-16 04:30] - Fix: Database migration applied to VPS

- الملفات اللي اتعدّلت: No code files changed — database-only fix
- وصف: الـ admin panel على `/admin` كان بيرجّع 500 Server Error بسبب إن الـ PostgreSQL database على الـ VPS كانت فاضية (مفيش tables). تم استخراج الـ raw SQL من `src/migrations/20260316_020144.ts`، رفعه على الـ VPS عن طريق SCP، وتنفيذه في الـ Docker container `nextacademy-db` (`g0wckcksgoo484okg4cg804s`). اتعملوا 46 table بنجاح وتم تسجيل الـ migration في `payload_migrations`.

### [2026-03-16 02:33] - Fix: DB schema push not running in production (instrumentation.ts)

- **الملفات اللي اتعدّلت:**
  - `src/instrumentation.ts` — إصلاح 3 مشاكل:
    1. استبدال `@payload-config` alias بـ `./payload.config` relative import (الـ alias مش بيتحل في standalone mode)
    2. إضافة retry logic (5 محاولات، 3 ثواني بين كل محاولة) عشان الـ DB ممكن يكون لسه بيعمل boot
    3. `process.exit(1)` لو كل المحاولات فشلت بدلاً من swallow الـ error
- **المشكلة:** `relation "users" does not exist` — الـ schema push مكانش بيتنفذ في production لأن `@payload-config` TypeScript alias مش بيتحل في Next.js standalone runtime
- **الحل:** Relative import + retry + crash-on-failure

---

### [2026-03-16 01:59] - Fix: Admin page 500 error (i18n + DB schema push)

- **الملفات اللي اتعدّلت:**
  - `src/messages/ar.json` — إضافة `Footer.login` key الناقص
  - `src/messages/en.json` — إضافة `Footer.login` key الناقص
  - `src/instrumentation.ts` [🆕] — Eager Payload CMS init عند server startup
  - `Dockerfile` — نسخ `src/messages` للـ runner stage + زيادة healthcheck `start-period` لـ 60s
- **المشكلة:**
  1. `Footer.login` missing from i18n → Next.js throws during SSR
  2. Payload `push: true` schema sync was lazy (waits for first request) → first page load fails with "relation does not exist"
- **الحل:**
  1. إضافة `login` key لـ Footer namespace في ar.json و en.json
  2. إنشاء `instrumentation.ts` بيعمل `getPayload()` eagerly عند server startup → schema push يحصل قبل أي request
  3. نسخ i18n messages في Docker runner stage (كانت محذوفة مع standalone build)

### [2026-03-15 14:07] - Fix docker-compose.yml healthcheck (still using wget)

- **الملفات:** `docker-compose.yml`
- **المشكلة:** Dockerfile healthcheck اتصلح قبل كده لـ `node -e`، لكن `docker-compose.yml` لسه بيستخدم `wget` اللي مش موجود في `node:22-alpine`. Coolify بيستخدم docker-compose.yml فبيعمل override.
- **الحل:**
  - استبدال `wget -qO-` بـ `node -e` inline HTTP GET (زي الـ Dockerfile)
  - إضافة `start_period: 30s` عشان الـ container ياخد وقت يعمل boot

### [2026-03-15 13:54] - Fix Docker healthcheck failure (Coolify deployment)

- **الملفات:** `Dockerfile`, `src/app/api/health/route.ts` [NEW]
- **المشكلة:** Container healthcheck كان بيستخدم `wget` اللي مش موجود في `node:22-alpine`
- **الحل:**
  - استبدال `wget` بـ `node -e` inline HTTP request
  - إنشاء `/api/health` endpoint بيرجع `{ status: "ok" }`
  - زيادة `--start-period` من 20s لـ 30s عشان Next.js ياخد وقت أكتر في الـ startup

### [2026-03-15 13:45] - Fix: TypeScript Strict Mode Build Errors (7 API Route Files)

- الملفات اللي اتعدّلت:
  - `src/app/api/auth/google/callback/route.ts` — nullable `externalId` field
  - `src/app/api/bookings/create/route.ts` — nullable `currentEnrollments`, `currentUses` fields + `paymentGatewayResponse` JSON cast
  - `src/app/api/checkout/easykash/route.ts` — `paymentGatewayResponse` typed as `Record<string, unknown>` instead of specific interface
  - `src/app/api/cron/waitlist/route.ts` — nullable `currentEnrollments`, user relation narrowing from `number | User`
  - `src/app/api/discount-codes/validate/route.ts` — nullable `currentUses` comparison
  - `src/app/api/notifications/[id]/read/route.ts` — relation ID typed as `number | User` not `string | User`
  - `src/app/api/reviews/moderate/route.ts` — statusMap values inferred as `string` instead of enum literals (fixed with `as const`)
- **المشكلة:** الـ build كان فاشل بسبب TypeScript strict mode — nullable fields, relation type narrowing, and enum inference
- **الحل:** إضافة nullish coalescing (`?? 0`), type casts, `as const` assertions, وتصحيح relation narrowing من `typeof === 'string'` لـ `typeof === 'object'`

---

### [2026-03-15 13:08] - Fix: Production Server Component Render Errors (4 Public Pages)

- الملفات اللي اتعدّلت: `src/app/[locale]/programs/page.tsx`, `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/instructors/page.tsx`, `src/app/[locale]/about/page.tsx`
- **المشكلة:** 4 صفحات عامة (programs, blog, instructors, about) كانوا بيعملوا server error في production لأن Next.js كان بيحاول يعمل static render وقت الـ build بس الـ Payload DB مش متاحة
- **الحل:**
  - إضافة `export const dynamic = 'force-dynamic'` لكل الـ 4 صفحات عشان تتعمل render وقت الـ request
  - إضافة try-catch حول Payload queries في `programs` و `blog` (instructors كان عنده already)
  - تصحيح CSS module import في `about` page (`about.module.css` → `page.module.css`)
  - إضافة type annotations لـ TypeScript strict mode compliance

---

### [2026-03-15 09:58] - Fix: Add /privacy-policy redirect for branding verification

- الملفات اللي اتعدّلت: `next.config.ts`
- **المشكلة:** Google branding verification بيفشل لأن `/privacy-policy` بيرجع 404 — الصفحة موجودة على `/privacy`
- **الحل:** إضافة Next.js redirects في `next.config.ts`: `/privacy-policy` → `/en/privacy` و `/:locale/privacy-policy` → `/:locale/privacy`

### [2026-03-15 09:55] - Fix: Create BlogPosts Collection (Blog Page Server Error)

- الملفات اللي اتعدّلت: `src/collections/BlogPosts.ts` (🆕), `src/payload.config.ts`, `src/payload-types.ts`
- **المشكلة:** Blog pages (`/blog` + `/blog/[slug]`) كانوا بيعملوا server error لأن collection `blog-posts` مكانتش موجودة في Payload
- **الحل:** إنشاء `BlogPosts` collection بـ fields: title, slug, excerpt, content (richText), category, featuredImage, author, tags, status, publishedAt + تسجيلها في `payload.config.ts` + regenerate types

---

### [2026-03-15 01:44] - Security Fixes: IDOR, Headers, Error Leak, Docker

- الملفات اللي اتعدّلت: `Users.ts`, `nginx.conf`, `proxy.ts`, `checkout/paymob/route.ts`, `Dockerfile`
- **Critical Fix**: Users collection `update` access changed from `isAuthenticated` → `isAdminOrSelf` (IDOR)
- **High Fix**: Added 6 security headers to nginx (HSTS, X-Frame-Options, CSP, X-Content-Type-Options, Referrer-Policy, server_tokens off)
- **High Fix**: Added security headers to `proxy.ts` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) — deleted conflicting `middleware.ts`
- **High Fix**: Paymob checkout error leak — now returns generic message, logs details server-side
- **Low Fix**: Added `HEALTHCHECK` to Dockerfile for container health monitoring
- **Verified OK**: docker-compose uses env vars (no hardcoded secrets), email.ts FROM address is display name not a secret

---

### [2026-03-15 01:00] - Deep Security & Code Audit

- الملفات اللي اتراجعت: All 27 Payload collections, access-control.ts, auth-api.ts, payment-api.ts, rate-limit.ts, email.ts, resend-email-adapter.ts, checkout/paymob/route.ts, checkout/easykash/route.ts, cron/check-overdue/route.ts, cron/waitlist/route.ts, webhooks/paymob/route.ts, webhooks/easykash/route.ts, docker-compose.yml, nginx/nginx.conf
- **Critical**: Users collection `update` access uses `isAuthenticated` — IDOR vulnerability (any user can update any other user)
- **High**: Missing security headers in nginx (HSTS, CSP, X-Frame-Options, etc.)
- **High**: No Next.js middleware.ts for route protection
- **High**: Users `read` access exposes all user records to any authenticated user
- **Medium**: PAYLOAD_SECRET in Docker build args, console.log in prod, no rate limiting on checkout, hardcoded phone fallback
- Full report: [walkthrough.md](../../.gemini/antigravity/brain/7b117a1f-0242-44d1-bb95-f9a7350e9ce3/walkthrough.md)

---

### ✅ [2026-03-14 23:00] — Security Hardening + VPS Docker Setup

| الملف | التغيير |
|---|---|
| `next.config.ts` | 🔧 HSTS + CSP headers + `output: standalone` |
| `src/proxy.ts` | 🔧 حماية `/b2b-dashboard` + `/onboarding` |
| `src/lib/rate-limit.ts` | 🆕 ioredis sliding window rate limiter + in-memory fallback |
| `src/app/api/users/login/route.ts` | 🆕 Rate-limited login (10 req/min per IP) |
| `src/app/api/discount-codes/validate/route.ts` | 🆕 Server-side discount validation |
| `src/components/layout/Navbar.tsx` | 🔧 Auth-aware — show/hide login buttons |
| `Dockerfile` | 🆕 Multi-stage production build |
| `docker-compose.yml` | 🔧 كامل: postgres + redis + app + nginx + certbot |
| `nginx/nginx.conf` | 🆕 Reverse proxy + SSL termination |
| `.env.production.template` | 🆕 Production env template |

---

### ✅ [2026-03-14 22:00] — Payment Gateway Testing & Bug Fixes

| الملف | التغيير |
|---|---|
| `src/app/.../checkout/[bookingId]/page.tsx` | 🔧 Fix booking ID type mismatch (number vs string) |
| `src/lib/dashboard-api.ts` | 🔧 إضافة `discountAmount` لـ `PayloadBooking` type |
| `src/lib/payment-api.ts` | 🔧 تغيير `Authorization: Token` → `Bearer` للـ Paymob key الجديد |
| `src/app/api/checkout/paymob/route.ts` | 🔧 إرجاع actual error message بدل generic message |
| `scripts/seed-test-payment.sql` | 🆕 SQL seed script لبيانات الاختبار |
| `.env` | 🔧 تصحيح `PAYMOB_API_KEY` + تصحيح integration IDs + تحديث ngrok URL |

**نتيجة الاختبار:**

- Paymob card payment → 3DS → Approved ✅
- EasyKash Fawry voucher → pending page ✅
- HMAC verification على الـ webhooks ✅

---

### ✅ [2026-03-14 20:00] — Payment Gateway Integration (Paymob + EasyKash)

| الملف | التغيير |
|---|---|
| `src/lib/payment-api.ts` | 🆕 Shared types + Paymob Intention API + EasyKash Cash API + HMAC verification |
| `src/app/api/checkout/paymob/route.ts` | 🆕 POST — ينشئ Paymob Intention → يرجع redirect URL |
| `src/app/api/checkout/easykash/route.ts` | 🆕 POST — ينشئ EasyKash Cash voucher (Fawry/Aman) |
| `src/app/api/webhooks/paymob/route.ts` | 🆕 POST — HMAC verify → amount check → confirm booking |
| `src/app/api/webhooks/paymob/redirect/route.ts` | 🆕 GET — Paymob redirect handler → success/pending/failed |
| `src/app/api/webhooks/easykash/route.ts` | 🆕 POST — HMAC verify → amount check → confirm booking |
| `src/app/.../checkout/[bookingId]/page.tsx` | 🔄 Wired لـ real APIs — بيجيب بيانات الحجز الحقيقية |
| `src/app/.../checkout/success/page.tsx` | 🆕 Success page بعد كارت/محفظة |
| `src/app/.../checkout/pending/page.tsx` | 🆕 Pending page — voucher + copy button + خطوات فوري/أمان |
| `src/app/.../checkout/failed/page.tsx` | 🆕 Failed page — retry + واتساب |
| `docs/engineering/env-variables.md` | 🔄 إضافة `PAYMOB_PUBLIC_KEY` + `EASYKASH_API_TOKEN` + `EASYKASH_HMAC_SECRET` |

**الـ Flow:**

- كارت/محفظة → Paymob Intention API → Unified Checkout → webhook → confirmed
- فوري/أمان → EasyKash Cash API → voucher page → يدفع في الفرع → webhook → confirmed

**Testing:**

- ngrok tunnel: `https://97f9-41-36-59-214.ngrok-free.app`
- Webhooks tested locally — HMAC rejection ✅
- Paymob + EasyKash callbacks updated in dashboards ✅

---

---

### ✅ [2026-03-14 18:00] — B2B Manager Dashboard

| الملف | التغيير |
|---|---|
| `src/lib/b2b-api.ts` | 🆕 Typed fetch helpers للـ B2B dashboard |
| `src/components/b2b/B2BLayout.tsx` | 🆕 Sidebar layout مع nav + logout |
| `src/app/.../b2b-dashboard/page.tsx` | 🆕 Overview — stats + team + recent bookings |
| `src/app/.../b2b-dashboard/team/page.tsx` | 🆕 Team members table + search |
| `src/app/.../b2b-dashboard/bookings/page.tsx` | 🆕 Bookings + filter (all/upcoming/completed) |
| `src/app/../(b2b)/layout.tsx` | 🆕 Route group layout |
| `src/app/../(b2b)/loading.tsx` + `error.tsx` | 🆕 Loading + error boundaries |

---

### ✅ [2026-03-14 17:00] — Notifications Page + Instructor Portal Backend Wiring

| الملف | التغيير |
|---|---|
| `src/lib/instructor-api.ts` | 🆕 Typed fetch helpers للـ instructor portal |
| `src/app/.../dashboard/notifications/page.tsx` | 🆕 Notifications page — real data + mark read + mark all read |
| `src/app/.../instructor/page.tsx` | 🔄 Wire لـ real sessions + consultations بدل mock |
| `src/app/.../instructor/sessions/page.tsx` | 🔄 Wire لـ real sessions + search |
| `src/app/.../instructor/bookings/page.tsx` | 🔄 Wire لـ real consultation bookings + approve/decline |
| `src/app/.../instructor/availability/page.tsx` | 🔄 Wire لـ real availability + blocked dates (add/delete) |

---

### ✅ [2026-03-14 16:00] — GitHub Repository Setup + Initial Push

| | |
|---|---|
| 📁 **ملف جديد** | `.gitignore` — يستثني `node_modules/`, `.next/`, `.env*`, `*.tsbuildinfo`, `client_secret_*.json` |
| 🔗 **Repo** | <https://github.com/nextacademyedu-lang/next-academy-edu> (private) |
| 📦 **Commit** | `feat: initial commit — Next Academy platform scaffold` (274 ملف) |
| 🌿 **Branch** | `main` |

---

### ✅ [2026-03-14 15:30] — Phase 5: Dashboard Backend Wiring

| الملف | التغيير |
|---|---|
| `src/lib/dashboard-api.ts` | 🆕 Typed fetch helpers للـ Overview, Bookings, Payments, Profile |
| `src/components/dashboard/DashboardLayout.tsx` | 🔄 ربط `useAuth()` بدل `MOCK_USER` + avatar + logout |
| `src/app/.../dashboard/page.tsx` | 🔄 Overview بيجيب stats + next sessions من API |
| `src/app/.../dashboard/bookings/page.tsx` | 🔄 Bookings grid بالبيانات الحقيقية + progress bars |
| `src/app/.../dashboard/payments/page.tsx` | 🔄 Payments بـ tabs: Active Installments + History |
| `src/app/.../dashboard/profile/page.tsx` | 🔄 Profile بيجيب بيانات اليوزر + save + change password |

**النتيجة:** TypeScript build ✅ exit code 0 — كل الـ dashboard wired للـ backend

---

### 🔧 [2026-03-14 15:00] — Fix: Normalize Access-Control Imports

| | |
|---|---|
| 📁 **الملفات** | `Waitlist.ts`, `Reviews.ts`, `PaymentLinks.ts`, `InstructorBlockedDates.ts`, `Certificates.ts` |
| ❌ **المشكلة** | 5 collections كانوا بيستخدموا `@/lib/access-control` بدون `.ts` |
| ✅ **الحل** | Normalize لـ `../lib/access-control.ts` في كل الـ 27 collection |

---

### 🔧 [2026-03-14 14:30] — Fix: Payload Build Errors (importMap + serverFunction)

| المشكلة | الحل |
|---|---|
| `importMap` error — ملف فاضي بدون exports | Rename `.ts` → `.js` + regenerate types + إضافة `.ts` extension لـ 13 collection |
| `serverFunction` error — Payload 3.79.0 يحتاج prop جديد | إضافة `serverFunction` wrapper مع `'use server'` على `RootLayout` |

**النتيجة:** Build ✅ — 32 routes generated

---

### ✅ [2026-03-14 14:00] — Phase 4: Resend Email Adapter + Google OAuth

| الملف | التغيير |
|---|---|
| `src/lib/resend-adapter.ts` | 🆕 Resend adapter بـ REST API + type safety |
| `src/payload.config.ts` | 🔄 Wire `resendAdapter` في Payload email config |
| `src/app/api/auth/google/route.ts` | 🆕 Google OAuth entry point |
| `src/app/api/auth/google/callback/route.ts` | 🆕 Token exchange + find-or-create user + JWT |
| `src/collections/Users.ts` | 🔄 إضافة `googleId` field |
| `src/app/.../login/page.tsx` | 🔄 Wire Google button |
| `src/app/.../register/page.tsx` | 🔄 Wire Google button |

> ⚠️ **Env vars مطلوبة:** `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

### 🔧 [2026-03-14 05:05] — Fix: OTP Double-Submit Race Condition

| | |
|---|---|
| 📁 **الملف** | `src/app/[locale]/(auth)/verify-email/page.tsx` |
| ❌ **المشكلة** | `handleVerify` بتتنادي مرتين (auto-submit + manual) → الكود يتعمل mark used → "الرمز غلط" |
| ✅ **الحل** | `verifyingRef` — ref-based lock يمنع الاستدعاء المتزامن |

---

### 🔧 [2026-03-14 12:30] — Fix: Signup Redirects to Dashboard Instead of Register

| | |
|---|---|
| 📁 **الملفات** | `src/proxy.ts`, `src/app/.../login/page.tsx` |
| ❌ **المشكلة** | Middleware كان بيشوف `payload-token` stale cookie ويعمل redirect لـ `/dashboard` |
| ✅ **الحل** | شيل الـ server-side redirect من auth routes + client-side auth check في login page |

---

### 🔧 [2026-03-13 18:45] — Fix: Middleware/Proxy Conflict (Next.js 16)

| | |
|---|---|
| 📁 **الملفات** | `src/proxy.ts` (دمج), `src/middleware.ts` (🗑️ محذوف) |
| ❌ **المشكلة** | Next.js 16 بيرفض وجود `middleware.ts` و`proxy.ts` مع بعض |
| ✅ **الحل** | نقل كل اللوجيك (auth + i18n + route protection) لـ `proxy.ts` وحذف `middleware.ts` |

---

### ✅ [2026-03-14 12:00] — Sprint 4: Onboarding i18n + Premium CSS Redesign

| الملف | التغيير |
|---|---|
| `src/app/.../onboarding/page.tsx` | 🔄 `useTranslations('Auth')` — صفر hardcoded text |
| `src/components/onboarding/step-1.tsx` | 🔄 i18n كامل |
| `src/components/onboarding/step-2.tsx` | 🔄 i18n كامل |
| `src/components/onboarding/step-3.tsx` | 🔄 i18n كامل |
| `src/components/onboarding/onboarding.module.css` | 🔄 Premium CSS: radial gradient + glassmorphism + glow animations |
| `src/app/.../onboarding/onboarding.module.css` | 🗑️ حذف duplicate |

---

### ✅ [2026-03-14 11:30] — Sprint 4: Multi-Step Onboarding Wizard

| الملف | التغيير |
|---|---|
| `src/app/.../onboarding/page.tsx` | 🆕 3-step wizard orchestrator + framer-motion |
| `src/components/onboarding/step-1.tsx` | 🆕 Professional Info |
| `src/components/onboarding/step-2.tsx` | 🆕 Company & Location |
| `src/components/onboarding/step-3.tsx` | 🆕 Learning Goals + tag chips |

---

### ✅ [2026-03-14 10:00] — Sprint 0: Access Control Fix (5 Collections)

| Collection | Access Control المضاف |
|---|---|
| `Reviews.ts` | Public read, auth create, owner/admin update, admin delete |
| `Certificates.ts` | Owner/admin read, admin create/update/delete |
| `InstructorBlockedDates.ts` | Instructor-owner + admin لكل العمليات |
| `PaymentLinks.ts` | Admin-only لكل CRUD |
| `Waitlist.ts` | Owner/admin read, auth create, admin update/delete |

---

### 📁 [2026-03-13 14:31] — 3-Phase: Docs Organize + API Verify + Code Audit

| Phase | التغيير |
|---|---|
| Phase 1 | نقل 28 ملف لـ 6 subdirectories + `docs/README.md` index |
| Phase 2 | `api-contracts.md` — إضافة 8 sections جديدة (411 → 749 سطر) |
| Phase 3 | `code-audit.md` — تقرير شامل لـ 21 collection |

---

### 📁 [2026-03-13 04:00] — Documentation Gap Fill (15 Files)

> أنشأنا 12 ملف جديد + وسّعنا 3 ملفات موجودة

| الملفات الجديدة |
|---|
| `security.md`, `payment-scenarios.md`, `error-handling.md`, `api-contracts.md` |
| `rate-limiting.md`, `testing-strategy.md`, `env-variables.md`, `deployment.md` |
| `monitoring.md`, `accessibility.md`, `performance.md`, `data-privacy.md` |

---

### ✅ [2026-03-14 12:00] — Sprint 4: Foundation Fixes Batch

| Fix | التفاصيل |
|---|---|
| proxy.ts convention | Renamed لـ Next.js 16 convention |
| Instructor layout | حذف duplicate `NextIntlClientProvider` + old params syntax |
| loading/error pages | إضافة لكل 5 route groups |
| ar.json + en.json | Populated بكل UI string keys |
| useTranslations | Updated في 7 components — صفر hardcoded strings |
| TypeScript fix | حذف duplicate `color` property في instructor sessions |

---

### ✅ [2026-03-05 01:00] — Phase 3: Static Pages

> تم تنفيذ routes و layout components لـ `/about`, `/contact`, `/blog`, `/privacy`, `/terms`, `/refund-policy`
> تثبيت brand colors في `globals.css` (`#C51B1B`, `#020504`)

---

### [2026-03-17 15:40] - Created Coolify Deployment Rules

**Files:**

- `docs/engineering/coolify-deployment.md` (NEW) — comprehensive deployment rules for Coolify
- `docs/engineering/deployment.md` (MODIFIED) — deprecated, pointing to coolify-deployment.md

**Reason:** Project migrated from Vercel to Coolify (self-hosted Docker Compose on VPS). Documented all known deployment issues, Dockerfile rules, environment variables, and troubleshooting based on error history.

---

### [2026-03-17 15:45] - Created Agent Rules (GEMINI.md) + Logs Structure

**Files:**

- `GEMINI.md` (NEW) — root-level agent rules file
- `docs/logs/changelog.md` (NEW) — this file
- `docs/logs/tasks.md` (NEW) — task tracking
- `docs/logs/errors.md` (NEW) — error history

**Reason:** Enforcing documentation-first development and log maintenance discipline.

---

### [2026-03-17 ~13:00] - Debugging Payload Authentication Issues

**Files:**

- `src/app/api/auth/login/route.ts` (INVESTIGATED) — login returning 401 for all errors
- `src/app/api/reset-admin/route.ts` (INVESTIGATED) — discovered hardcoded password
- `.env` (INVESTIGATED) — `serverURL` pointing to production domain during local dev

**Reason:** Newly created admin users could not sign in, and the initial admin user could not log back in after logging out. Investigated auth flow end-to-end.

---

### [2026-03-17 ~22:00] - Deep Audit of Payload Auth — Fixes Applied

**Files:**

- `src/app/api/reset-admin/route.ts` (DELETED) — security risk: plain-text password in code & response
- `src/app/api/users/login/route.ts` (MODIFIED) — fixed error handling: auth errors → 401, server errors → 500
- `.env.local` (NEW) — local dev URLs to avoid hitting production domain
- `بص المشكلة دي ف payload...md` (DELETED) — outdated troubleshooting file in repo root

**Reason:** Deep audit of 14 auth-related files. Fixed security vulnerability (hardcoded password), improved error handling, resolved serverURL mismatch for local development.

---

### [2026-03-17 ~10:00] - Added Facebook Domain Verification Meta Tag

**Files:**

- `src/app/layout.tsx` (MODIFIED) — added `<meta>` tag for Facebook domain verification

**Reason:** Required for Facebook Business verification of the `nextacademyedu.com` domain.
