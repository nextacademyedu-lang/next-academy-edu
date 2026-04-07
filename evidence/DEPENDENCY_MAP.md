# DEPENDENCY_MAP.md

**Commit SHA**: `66f0b3952b7aaef0f2274648d69e3fd125aa0d9e`
**Generated at**: 2026-03-29T17:37:00Z (UTC) / 2026-03-29T19:37:00+02:00 (Cairo)
**Audit scope**: API contracts, RBAC mappings, Collection hooks
**Verification status**: Unverified

---

## 1. Frontend Callers (Fetch Abstractions)
The Next.js frontend utilizes centralized wrapper libraries to handle most fetch requests. Direct `fetch` calls from components are heavily mitigated.

| Caller Interface | Target API Endpoints | Responsibility |
|------------------|----------------------|----------------|
| `src/lib/auth-api.ts` | `/api/users/login`, `/api/users/logout`, `/api/users/me`, `/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/users/[password-reset-flows]` | Handles session lifecycle and OTP 2FA handshakes. |
| `src/lib/instructor-api.ts` | `/api/instructor/*`, `/api/consultation-types`, `/api/instructor-blocked-dates`, `/api/consultation-bookings` | Instructors Dashboard core data fetching and profile updates. |
| `src/lib/search-api.ts` | `/api/programs`, `/api/instructors`, `/api/blog-posts` | Powers homepage search forms via Payload native read (GET) endpoints. |
| `src/lib/payment-api.ts` | External Paymob/EasyKash (`/v1/intention`) | Triggers server-side payment states, indirectly dependent on our webhooks matching state IDs. |

## 2. Middleware & Proxy Guards
| Middleware File | Target / Protected Path | Description | Risk / Impact |
|-----------------|-------------------------|-------------|---------------|
| `src/middleware.ts` | Locale & Web | **Bypasses API Routes**. `matcher` explicitly excludes `/api`. | API protection entirely falls back onto Payload Access Control and inline standard Next.js Route handlers (`request.cookies` context). |

## 3. Core Collection Hooks (Indirect Dependencies)
Collection hooks are triggered automatically on API reads/writes, acting as critical unseen dependencies connecting disjoint systems.

| Collection | Event Hook | Dependency / Action Triggered |
|------------|------------|--------------------------------|
| `Bookings` | `afterChange` | **CRM Sync**: Pushes updates to CRM sync queues. |
| `Bookings` | `beforeDelete` | **Cascade Cleanup**: Deletes related `certificates`. |
| `ConsulationBookings` | `afterChange` | **CRM Sync**: Syncs consultation lifecycle. |
| `BulkSeatAllocations` | `afterChange` | **CRM Sync**: Synchronizes B2B pool capacity. |
| `Users` | `afterChange` | **CRM Sync**: Syncs Base Identity. |
| `UserProfiles` | `afterChange` | **CRM Sync**: Syncs Extended Profile info. |
| `Companies` | `afterChange` | **CRM Sync**: B2B client sync. |
| `Payments` | `afterChange` | **CRM Sync**: Finance mirroring. |
| `Waitlist` | `afterChange` | **CRM Sync**: Prospect tracking synchronization. |
| `Leads` | `afterChange` | **CRM Sync**: Funnel tracking. |

> **Audit Note:** The `CRM Sync` logic (`CrmSyncEvents` queueing) represents the largest cross-collection side-effect chain. Any disruption to the CRM credentials affects 10 distinct tables.
