# Frontend DB Contract Audit (2026-03-19)

## Scope
- Audited public pages, home sections, dashboard, instructor portal, and B2B portal.
- Traced data flow per screen: UI -> API endpoint -> Payload collection.
- Objective: verify what is truly DB-backed and identify backend alignment gaps after recent frontend updates.
- Constraint: additive-only strategy (no table drops).

## Executive Verdict
- Not all UI content is coming from DB.
- Core catalog/profile pages are DB-backed.
- Home marketing sections are mostly static/mock, except selected components (upcoming events, popup, announcement bar).
- There are contract mismatches where frontend expects fields/endpoints that backend does not currently provide.

## Home Page Source Map
| Section | Source | Backed by DB? | Evidence |
|---|---|---|---|
| Hero | i18n + static image | No | `src/components/sections/hero.tsx` |
| Stats | `MOCK_STATS` | No | `src/components/sections/stats.tsx:8` |
| Featured | `MOCK_PROGRAMS` | No | `src/components/sections/featured.tsx:12` |
| Why Choose Us | `SERVICES` array | No | `src/components/sections/why-choose-us.tsx:13` |
| Upcoming Events | `/api/upcoming-events` | Yes (with mismatch) | `src/components/sections/upcoming-events.tsx:38`, `src/app/api/upcoming-events/route.ts` |
| Text Testimonials | `TEXT_TESTIMONIALS` | No | `src/components/sections/text-testimonials.tsx:5` |
| Instructors Preview | `MOCK_INSTRUCTORS` | No | `src/components/sections/instructors-preview.tsx:11` |
| B2B Trusted Logos | `LOGOS_LIST` | No | `src/components/sections/b2b-trusted.tsx:5` |
| Video Testimonials | hardcoded slides/captions | No | `src/components/sections/video-testimonials.tsx` |
| Blogs Preview | `MOCK_POSTS` | No | `src/components/sections/blogs-preview.tsx:13` |

## Public Pages Source Map
| Route | Source | Backed by DB? |
|---|---|---|
| `/courses` (`/programs` alias) | `getPayload` -> `categories`, `programs`, `rounds` | Yes |
| `/events` | `getPayload` -> `rounds` (+ related `programs`) | Yes |
| `/webinars` | `getPayload` -> `programs(type=webinar)`, `rounds` | Yes |
| `/instructors` | `getPayload` -> `instructors`, `programs`, `rounds` | Yes |
| `/instructors/[slug]` | `getPayload` -> `instructors`, `programs`, `rounds`, `consultation-types`, `consultation-slots` | Yes |
| `/programs/[slug]` | `getPayload` -> `programs`, `rounds` | Yes |
| `/blog`, `/blog/[slug]` | `getPayload` -> `blog-posts` | Yes |
| `/certificates/[code]` | `getPayload` -> `certificates` | Yes |
| `/workshops` | `WORKSHOP_CARDS` constant | No |
| `/faq` | `FAQ_ITEMS` constant | No |
| `/for-business` | `PILLARS` constant | No |

## Dashboard, Instructor, B2B Source Map
- User dashboard pages call Payload REST collection endpoints through `src/lib/dashboard-api.ts`:
  - `/api/bookings`
  - `/api/payments`
  - `/api/notifications`
- Instructor pages call through `src/lib/instructor-api.ts`:
  - `/api/sessions`
  - `/api/consultation-bookings`
  - `/api/consultation-types`
  - `/api/consultation-availability`
  - `/api/instructor-blocked-dates`
  - `/api/instructor/availability` (expected custom endpoint)
- B2B pages call through `src/lib/b2b-api.ts`:
  - `/api/b2b/dashboard`
  - `/api/b2b/team`
  - `/api/b2b/bookings`

## High-Risk Contract Gaps

### 1) Upcoming Events response shape mismatch
- Frontend expects flat event fields (`titleAr`, `titleEn`, `startDate`, etc.).
- API currently returns nested shape `{ program, round, customImage, customUrl }`.
- Evidence:
  - `src/components/sections/upcoming-events.tsx:8-18`
  - `src/app/api/upcoming-events/route.ts:73-76,121`

### 2) Missing custom endpoints used by frontend
- Frontend calls:
  - `/api/b2b/dashboard`
  - `/api/b2b/team`
  - `/api/b2b/bookings`
  - `/api/instructor/availability`
- Route files do not exist under `src/app/api`.
- Evidence:
  - `src/lib/b2b-api.ts:100,109,118`
  - `src/lib/instructor-api.ts:165`

### 3) Consultation types field mismatch
- UI reads `service.title` and `service.description`.
- Collection schema stores `titleAr/titleEn` and `descriptionAr/descriptionEn`.
- Evidence:
  - `src/app/[locale]/(instructor)/instructor/consultation-types/page.tsx:90,98-100`
  - `src/collections/ConsultationTypes.ts:15-16`

### 4) Consultation availability type mismatch
- Frontend type expects numeric day (`0..6`) and writes numeric day values.
- Collection uses string enum day names (`monday`, `tuesday`, ...).
- Evidence:
  - `src/lib/instructor-api.ts:75`
  - `src/app/[locale]/(instructor)/instructor/availability/page.tsx:38,55`
  - `src/collections/ConsultationAvailability.ts:19`

### 5) Sessions field mismatch
- Frontend depends on `session.status` and `attendanceCount`.
- Collection defines `isCancelled` and `attendeesCount`; no `status` field.
- Evidence:
  - `src/lib/instructor-api.ts:21,34`
  - `src/app/[locale]/(instructor)/instructor/sessions/page.tsx:67-68,101,106,115`
  - `src/collections/Sessions.ts:33,35`

### 6) Instructor bookings permissions mismatch
- Frontend tries to PATCH consultation booking status.
- Collection access currently allows update for admins only.
- Evidence:
  - `src/lib/instructor-api.ts:131-141`
  - `src/collections/ConsultationBookings.ts:8,10`

### 7) B2B data isolation gap
- `isAdminOrB2BManager` grants role-level access without company-level filter.
- Bulk seat allocations are company-owned records, but read access is not scoped to company.
- Evidence:
  - `src/lib/access-control.ts:91-94`
  - `src/collections/BulkSeatAllocations.ts:8,15`

### 8) Onboarding company payload mismatch
- Onboarding sends `company` as free text.
- `user-profiles.company` expects relationship to `companies` collection ID.
- Evidence:
  - `src/app/[locale]/(auth)/onboarding/page.tsx:118`
  - `src/collections/UserProfiles.ts:39`

## Additive Backend Alignment Plan (No Drops)

1. Add compatibility endpoints (recommended first)
- Implement:
  - `GET /api/b2b/dashboard`
  - `GET /api/b2b/team`
  - `GET /api/b2b/bookings`
  - `PUT /api/instructor/availability`
- Keep existing collections; aggregate/transform responses server-side.

2. Add response adapters (non-breaking)
- `GET /api/upcoming-events`: return flat event DTO expected by home UI.
- `GET /api/consultation-types`: add computed aliases `title` and `description` based on locale.
- `GET /api/sessions`: add computed `status` and `attendanceCount` aliases.

3. Add schema compatibility fields (optional, additive)
- `sessions.status` (derived/maintained), keep `isCancelled` for backward compatibility.
- `consultation-availability.dayIndex` numeric (0..6), keep string `dayOfWeek`.
- `consultation-types.title` and `consultation-types.description` (localized resolver or write-through fields).

4. Add safer access rules (no table changes)
- Allow instructors to update only their own consultation booking status.
- Scope B2B manager reads by company (via user profile/company relation).

5. Add onboarding company resolver
- On save: resolve/create company record, then store company relationship ID in `user-profiles.company`.

## Final Assessment
- Frontend can guide backend updates, but backend should adopt compatibility/adaptor endpoints first.
- With additive adapters and scoped access control, existing tables can remain while contracts stabilize.
