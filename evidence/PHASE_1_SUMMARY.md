# PHASE_1_SUMMARY.md (Phase 1.2 — Corrected)

**Commit SHA**: `66f0b3952b7aaef0f2274648d69e3fd125aa0d9e`  
**Generated at**: 2026-03-29T19:55:00+02:00 (Cairo) / 2026-03-29T17:55:00Z (UTC)  
**Audit scope**: API contracts, RBAC mappings, Collection hooks, end-to-end flows  
**Verification status**: Static Verified / Runtime Unverified

---

## 1. Execution Metrics (Corrected)

| Metric | Phase 1.0 Value | Phase 1.1 Corrected Value |
|--------|----------------|--------------------------|
| Custom Route **Files** | 55 | 55 (unchanged — but `_scope.ts` now excluded from endpoint count) |
| Custom Endpoint **Methods** | 55 (one per path) | **67** (per-method breakdown; paths with multiple methods counted individually) |
| Payload Auto-Endpoint **Collections** | 34 | **36** (added `verification-codes`, `waitlist`) |
| Payload Auto-Endpoint **Methods** | ~136 (4 × 34) | **~144** (4 × 36) — actual number depends on enabled methods per collection |
| **Total API Surface (methods)** | 89 (paths) | **~211** (67 custom + ~144 auto) |
| Undocumented Contracts | 89 | **211** — no OpenAPI/Swagger spec exists |
| Unverified Access Rules | 0 (not tracked) | **8 collections** with unverified access rules (marked in catalog) |
| Helper Files Incorrectly Classified as Endpoints | Not tracked | **1 removed** (`b2b/_scope.ts`) |
| Misclassified Auth (classified as Public, actually protected) | Not tracked | **6 fixed** (all `resolveB2BScope` routes were calling `payload.auth` internally) |
| Misclassified R/W = None | Not tracked | **5 fixed** (routes with delegated library calls had hidden collection access) |

---

## 2. Top 10 High-Risk Hotspots (Corrected + Confidence)

### 🔴 1. Unprotected Seed Endpoints

| Attribute | Value |
|-----------|-------|
| **Endpoints** | `POST /api/seed-instructors`, `POST /api/seed-partners` |
| **Risk Cause** | No authentication whatsoever. No `CRON_SECRET` check. Any HTTP client can call these endpoints and create arbitrary data in `instructors`, `partners`, and `media` collections. |
| **Blast Radius** | Data pollution in production. Malicious actors can flood the database with fake instructor profiles or partner entries, which then appear on the public homepage. |
| **OWASP** | API5:2023 (Broken Function Level Authorization) |
| **Confidence** | **High** — verified by reading source code; no auth primitive present. |

### 🔴 2. Payment Webhook HMAC Validation

| Attribute | Value |
|-----------|-------|
| **Endpoints** | `POST /api/webhooks/paymob`, `POST /api/webhooks/easykash` |
| **Risk Cause** | External untrusted payload parsing. HMAC signature validation is the only gate. A TOCTOU race or signature bypass = unauthenticated payment state mutation. |
| **Blast Radius** | Financial data corruption — granting course access without payment, or failing to register valid payments. Affects `payments`, `bookings`, `rounds` (enrollment count), and downstream CRM sync. |
| **OWASP** | API2:2023 (Broken Authentication), API8:2023 (Security Misconfiguration) |
| **Confidence** | **High** — HMAC check confirmed in source; specific implementation correctness unverified at runtime. |

### 🔴 3. CRM Sync Engine (Cross-Collection Cascade)

| Attribute | Value |
|-----------|-------|
| **Trigger** | `afterChange` hook on 10 collections: `bookings`, `consultation-bookings`, `bulk-seat-allocations`, `users`, `user-profiles`, `companies`, `payments`, `waitlist`, `leads` |
| **Risk Cause** | Synchronous hook execution in Payload. If CRM API is slow/offline, every write to these 10 collections blocks until timeout. No circuit breaker or async queue visible in hooks. |
| **Blast Radius** | Platform-wide write latency degradation. CRM credential rotation silently breaks data propagation for ALL business-critical tables. |
| **OWASP** | API4:2023 (Unrestricted Resource Consumption) |
| **Confidence** | **High** — confirmed by reading hook registrations across all collection files. |

### 🟠 4. Missing CSRF on `POST /api/bulk-seats/allocate`

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `POST /api/bulk-seats/allocate` |
| **Risk Cause** | Uses `payload.auth` for authentication but does NOT call `assertTrustedWriteRequest` for CSRF validation. All other authenticated POST endpoints (bookings, checkout, discount-codes) include CSRF. |
| **Blast Radius** | A CSRF attack could trick a logged-in B2B Manager into allocating seats to attacker-controlled users via a malicious page. Creates free bookings in production. |
| **OWASP** | API6:2023 (Unrestricted Access to Sensitive Business Flows) |
| **Confidence** | **High** — confirmed by diff between `bookings/create` (has CSRF) and `bulk-seats/allocate` (does not). |

### 🟠 5. Google OAuth Custom JWT Signing

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `GET /api/auth/google/callback` |
| **Risk Cause** | Hand-rolled HS256 JWT implementation using raw `crypto.createHmac`. No library (jsonwebtoken/jose) for edge-case handling (algorithm confusion, key length validation). |
| **Blast Radius** | Identity spoofing. If `PAYLOAD_SECRET` is weak or if an attacker discovers an algorithm confusion path, they can forge `payload-token` cookies for any user. |
| **OWASP** | API2:2023 (Broken Authentication) |
| **Confidence** | **High** — implementation reviewed line-by-line; PKCE + nonce + timing-safe compare are correctly implemented, but custom JWT is inherently riskier than library. |

### 🟠 6. B2B Scope Isolation (`resolveB2BScope`)

| Attribute | Value |
|-----------|-------|
| **Endpoints** | All `/api/b2b/*` routes (8 endpoint-methods) |
| **Risk Cause** | All tenant isolation depends on `resolveB2BScope` → `resolveCompanyFromProfile`. If the user-profile ↔ company link is corrupted or missing, the scope returns an error but the error path must be 100% covered in every caller. |
| **Blast Radius** | Tenant data bleed — B2B Manager from Company A views Company B's bookings, team members, and invitations. |
| **OWASP** | API1:2023 (Broken Object Level Authorization) |
| **Confidence** | **High** — scope function reviewed; all callers check `'error' in scope` correctly. Residual risk is in Admin path where `companyId` can be overridden via query param. |

### 🟠 7. OTP Auto-Linking Logic

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `POST /api/auth/verify-otp` |
| **Risk Cause** | Upon OTP success: (1) promotes `b2b_manager` role if `signupIntent === 'b2b_manager'`, (2) creates or links `instructor` profile if `signupIntent === 'instructor'`. Both happen automatically with `overrideAccess: true`. |
| **Blast Radius** | Privilege escalation if OTP is compromised. Rate limiting (5 per 15min per email+IP) mitigates brute force, but a compromised email account gives immediate b2b_manager or instructor access. |
| **OWASP** | API3:2023 (Broken Object Property Level Authorization) |
| **Confidence** | **High** — full function reviewed including `ensureB2BManagerAccountForIntent` and `ensureInstructorAccountForIntent`. |

### 🟡 8. Booking State Machine Cascades

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `POST /api/bookings/create`, Payload auto `PATCH /api/bookings/:id` |
| **Risk Cause** | Complex multi-step atomic operations: booking create → payment create → round enrollment increment → discount usage increment. If any step fails mid-way, rollback is manual and partial. |
| **Blast Radius** | Data inconsistency: enrollment count drifts from actual bookings; discount codes consumed without corresponding booking; orphaned payment records. |
| **OWASP** | API6:2023 (Unrestricted Access to Sensitive Business Flows) |
| **Confidence** | **Med** — atomic increment is correct for single-step, but multi-step orchestration lacks transactional guarantee. |

### 🟡 9. Consultation Availability Hook

| Attribute | Value |
|-----------|-------|
| **Collection** | `consultation-availability` |
| **Risk Cause** | `beforeChange` hook translates day-of-week strings to integer day indexes. Multiple fallback paths for timezone handling. If serialization fails silently, slots show at wrong times. |
| **Blast Radius** | Double-booked consultations. Instructor calendar displays incorrect availability. |
| **OWASP** | N/A (data integrity issue) |
| **Confidence** | **Med** — hook logic reviewed; actual timezone handling depends on frontend locale and Payload date serialization. |

### 🟡 10. Users `beforeChange` Role Guard

| Attribute | Value |
|-----------|-------|
| **Collection** | `users` |
| **Risk Cause** | `beforeChange` hook prevents non-admin users from setting `role` to privileged values. But `allowPrivilegedRoleWrite` context flag can bypass this — used internally by `verify-otp` and `b2b/team`. |
| **Blast Radius** | Full privilege escalation if an attacker finds a code path that sets `context.allowPrivilegedRoleWrite = true` without proper authorization. |
| **OWASP** | API3:2023 (Broken Object Property Level Authorization) |
| **Confidence** | **High** — confirmed only 2 callers use this flag, both already behind auth gates. |

---

## 3. Classification Corrections Summary

| # | What Was Wrong | What Was Corrected |
|---|----------------|-------------------|
| 1 | `b2b/_scope.ts` listed as an endpoint | Removed — it's a helper module, not a `route.ts` |
| 2 | All B2B routes classified as using "custom auth" | Reclassified as `payload.auth (via resolveB2BScope)` — because `resolveB2BScope` calls `payload.auth` internally |
| 3 | `/api/bookings/create` auth listed as `payload.auth` | Corrected to `JWT/Cookie (via authenticateRequestUser) + CSRF` |
| 4 | `/api/checkout/*` auth listed as `payload.auth` | Corrected to `JWT/Cookie (via authenticateRequestUser) + CSRF` |
| 5 | `/api/seed-instructors`, `/api/seed-partners` listed as semi-protected | Corrected to `⚠ UNPROTECTED` — no auth of any kind |
| 6 | Collections R/W = "None" for several endpoints | Fixed: e.g. `/api/b2b/invitations/accept` has hidden writes via `acceptCompanyInvitation` lib; `/api/b2b/invitations/validate` has hidden reads via `findInvitationByToken` |
| 7 | Endpoint count was per-path (55) | Corrected to per-method (67 custom, ~144 auto = ~211 total) |
| 8 | No CSRF tracking | Added CSRF column — discovered missing CSRF on `bulk-seats/allocate` |
| 9 | No confidence rating | Added Confidence column (High/Med/Low) for every endpoint |
| 10 | No OWASP mapping | Created `DOC_REFERENCES.md` with OWASP API Security Top 10 mappings |
