# Full Audit Follow-up (2026-03-19)

## Status Snapshot
- Home variable metrics/cards were moved to DB-backed APIs in the previous pass.
- Additive columns already added in `programs`:
  - `featuredPriority`
  - `learnersCount`

## Remaining Gaps (Missing / Misaligned)

### A) Missing API Routes (still not implemented)
1. `/api/b2b/dashboard`
2. `/api/b2b/team`
3. `/api/b2b/bookings`
4. `/api/instructor/availability`

Evidence:
- Frontend calls exist in `src/lib/b2b-api.ts` and `src/lib/instructor-api.ts`.
- Corresponding route files do not exist under `src/app/api`.

### B) Field Contract Mismatches
1. Consultation Types (instructor portal)
- Frontend expects:
  - `service.title`
  - `service.description`
- Collection currently stores:
  - `titleAr/titleEn`
  - `descriptionAr/descriptionEn`

2. Consultation Availability
- Frontend uses numeric day index (`0..6`).
- Collection uses weekday string enum (`saturday..friday`).

3. Sessions
- Frontend relies on:
  - `session.status`
  - `attendanceCount`
- Collection currently defines:
  - `isCancelled`
  - `attendeesCount`

### C) Access / Authorization Gaps
1. Instructor bookings update flow mismatch
- Frontend allows instructor action to update consultation booking status.
- Collection update access is currently admin-only.

2. B2B scoping weakness
- `isAdminOrB2BManager` grants role-based access without company-level filtering.
- Risk: managers can read beyond their company scope if endpoint logic doesn't enforce company constraints.

### D) Data Modeling / Input Mismatch
1. Onboarding company field
- Onboarding sends `company` as free text.
- `user-profiles.company` is a relationship to `companies` (ID expected).

### E) Still Static (Not DB-driven Yet)
- Home sections still static constants:
  - Instructors preview
  - Blogs preview
  - Text testimonials
  - Why choose us
  - B2B trusted logos
- Static public pages:
  - `/workshops`
  - `/faq`
  - `/for-business`

## Missing Columns (Additive Recommendations)
1. `sessions.status` (select) + compatibility with existing `isCancelled`
2. `sessions.attendanceCount` (or align frontend to `attendeesCount`)
3. `consultation-availability.dayIndex` (number 0..6) for frontend-friendly contract
4. Either:
   - API adapter returning `title/description` in consultation-types
   - or add compatibility fields `title` / `description` (write-through from localized fields)

## Missing Tables
- No strictly mandatory new collection was identified yet for current scope.
- Optional (if you want stronger B2B governance): add a dedicated `company-memberships` collection for explicit user-company-role mapping.

## Audit Conclusion
- Columns added so far: partial and correct for home featured/stats.
- Remaining work is primarily API completion + schema compatibility fields + access-scope hardening.
