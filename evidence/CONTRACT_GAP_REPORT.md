# CONTRACT_GAP_REPORT.md

**Commit SHA**: `66f0b3952b7aaef0f2274648d69e3fd125aa0d9e`  
**Generated at**: 2026-03-29T19:58:00+02:00 (Cairo) / 2026-03-29T17:58:00Z (UTC)  
**Audit scope**: API contract gaps between declared access control and actual enforcement  
**Verification status**: Static Verified / Runtime Unverified  
**Evidence sources**: [API_CATALOG.md](file:///d:/projects/nextacademy/evidence/API_CATALOG.md), [RBAC_MATRIX.md](file:///d:/projects/nextacademy/evidence/RBAC_MATRIX.md)

---

## 1. Gap Classification Legend

| Severity | Definition |
|----------|-----------|
| 🔴 **CRITICAL** | Immediate exploitability risk. No compensating control present. |
| 🟠 **HIGH** | Requires specific conditions to exploit. Partial compensating controls exist. |
| 🟡 **MEDIUM** | Design smell or inconsistency that may lead to future vulnerabilities. |
| 🔵 **INFO** | Acknowledged deviation from best practice. No immediate risk. |

---

## 2. Contract Gaps

### GAP-001: Unprotected Seed Endpoints 🔴

| Attribute | Detail |
|-----------|--------|
| **Endpoints** | `POST /api/seed-instructors`, `POST /api/seed-partners` |
| **Contract Expected** | Shared secret (like `CRON_SECRET` used by `/api/seed-admin` and `/api/seed-test-data`) |
| **Contract Actual** | **None**. No authentication, no authorization, no rate limiting. |
| **Gap Type** | Missing Auth Gate |
| **OWASP** | API5:2023 — Broken Function Level Authorization |
| **Impact** | Any HTTP client can create unlimited instructor and partner records with arbitrary media uploads. Data appears on public homepage. |
| **Evidence** | Field `cronSecret: false` in [route_metadata.json](file:///d:/projects/nextacademy/evidence/route_metadata.json); source files have no auth checks. |
| **Remediation** | Add `CRON_SECRET` check consistent with other seed routes. Consider removing from production build entirely. |

---

### GAP-002: `user-profiles` Missing Ownership Enforcement 🔴

| Attribute | Detail |
|-----------|--------|
| **Surface** | Payload Auto REST: `PATCH /api/user-profiles/:id` |
| **Contract Expected** | `isAdminOrSelf` or `isAdminOrOwner` — users should only update their OWN profile |
| **Contract Actual** | `isAuthenticated` — ANY logged-in user can update ANY user profile |
| **Gap Type** | Insufficient Access Control |
| **OWASP** | API1:2023 — Broken Object Level Authorization |
| **Impact** | User A can modify User B's profile: change company linkage, job title, onboarding status. This breaks B2B tenant isolation at the data level. |
| **Evidence** | [UserProfiles.ts L9-14](file:///d:/projects/nextacademy/src/collections/UserProfiles.ts#L9-L14): `update: isAuthenticated` |
| **Mitigating Factor** | Custom routes (e.g. B2B team management) use `overrideAccess: true` with their own auth logic. But the Payload REST API is still exposed directly. |
| **Remediation** | Change `update` to `isAdminOrOwnerByField('user')` or a custom ownership check. |

---

### GAP-003: `blog-posts` Full CUD to All Authenticated Users 🟠

| Attribute | Detail |
|-----------|--------|
| **Surface** | Payload Auto REST: `POST/PATCH/DELETE /api/blog-posts` |
| **Contract Expected** | Admin-only for CUD (blog management is typically admin function) |
| **Contract Actual** | `({ req: { user } }) => Boolean(user)` — any logged-in user can create, update, AND delete |
| **Gap Type** | Overly Permissive Access |
| **OWASP** | API5:2023 — Broken Function Level Authorization |
| **Impact** | Any registered user can publish, modify, or delete blog posts. Content vandalism risk. |
| **Evidence** | [BlogPosts.ts](file:///d:/projects/nextacademy/src/collections/BlogPosts.ts) — inline access functions |
| **Remediation** | Change CUD to `isAdmin` or `isAdminOrOwner`. |

---

### GAP-004: Missing CSRF on `POST /api/bulk-seats/allocate` 🟠

| Attribute | Detail |
|-----------|--------|
| **Surface** | Custom route: `POST /api/bulk-seats/allocate` |
| **Contract Expected** | CSRF token validation (consistent with other POST endpoints: bookings, checkout, discount-codes) |
| **Contract Actual** | `payload.auth` only. No `assertTrustedWriteRequest` call. |
| **Gap Type** | Missing CSRF Protection |
| **OWASP** | API6:2023 — Unrestricted Access to Sensitive Business Flows |
| **Impact** | CSRF attack can trick a logged-in B2B manager/admin into allocating seats. Creates free bookings under attacker-controlled accounts. |
| **Evidence** | [route.ts](file:///d:/projects/nextacademy/src/app/api/bulk-seats/allocate/route.ts): `csrf: false` in metadata; no `assertTrustedWriteRequest` import/call. Compare with [bookings/create](file:///d:/projects/nextacademy/src/app/api/bookings/create/route.ts) which has CSRF. |
| **Remediation** | Add `assertTrustedWriteRequest(request)` at the top of the POST handler. |

---

### GAP-005: `notifications` Update Without Ownership 🟠

| Attribute | Detail |
|-----------|--------|
| **Surface** | Payload Auto REST: `PATCH /api/notifications/:id` |
| **Contract Expected** | `isAdminOrOwner` — users should only mark their OWN notifications as read |
| **Contract Actual** | `isAuthenticated` — any logged-in user can update any notification |
| **Gap Type** | Insufficient Access Control |
| **OWASP** | API1:2023 — Broken Object Level Authorization |
| **Impact** | User A can mark User B's notifications as read. Low severity on its own but inconsistent with the read access (`isAdminOrOwner`). |
| **Evidence** | [Notifications.ts](file:///d:/projects/nextacademy/src/collections/Notifications.ts): `read: isAdminOrOwner` but `update: isAuthenticated` |
| **Mitigating Factor** | Custom routes `/api/notifications/read-all` and `/api/notifications/[id]/read` enforce ownership via `payload.auth` user filtering. But Payload REST API bypasses this. |
| **Remediation** | Change `update` to `isAdminOrOwner`. |

---

### GAP-006: `users.create = () => true` (Open Registration) 🟡

| Attribute | Detail |
|-----------|--------|
| **Surface** | Payload Auto REST: `POST /api/users` |
| **Contract Expected** | Intentional for registration flow |
| **Contract Actual** | `() => true` — anyone can create user accounts via direct API call |
| **Gap Type** | Intentional but High Risk |
| **OWASP** | API4:2023 — Unrestricted Resource Consumption |
| **Impact** | Mass account creation. No rate limiting at the Payload auto-endpoint level; rate limiting exists only on custom OTP routes. |
| **Evidence** | [Users.ts L38](file:///d:/projects/nextacademy/src/collections/Users.ts#L38) |
| **Mitigating Factor** | Accounts without email verification have limited capabilities. `beforeChange` hook prevents role escalation. |
| **Remediation** | Add rate limiting middleware or CAPTCHA at the registration level. |

---

### GAP-007: Custom JWT vs Library JWT 🟡

| Attribute | Detail |
|-----------|--------|
| **Surface** | `GET /api/auth/google/callback` |
| **Contract Expected** | Standard JWT library (jsonwebtoken/jose) |
| **Contract Actual** | Hand-rolled HS256 using `crypto.createHmac` |
| **Gap Type** | Implementation Risk |
| **OWASP** | API2:2023 — Broken Authentication |
| **Impact** | No algorithm confusion protection. No automatic handling of edge cases (clock skew, key rotation). |
| **Evidence** | [callback/route.ts](file:///d:/projects/nextacademy/src/app/api/auth/google/callback/route.ts) |
| **Mitigating Factor** | PKCE, nonce, and timing-safe comparison are correctly implemented. Only HS256 is used (no RSA confusion vector). |
| **Remediation** | Migrate to `jose` library for JWS operations. |

---

### GAP-008: Instructor Portal Uses `overrideAccess` While Collection Is Admin-Only 🟡

| Attribute | Detail |
|-----------|--------|
| **Surface** | All `/api/instructor/*` custom routes |
| **Contract Expected** | Collection access allows instructor operations |
| **Contract Actual** | `instructor-program-submissions` collection is `isAdmin` for ALL CRUD. Custom routes bypass with `overrideAccess: true` after verifying `user.instructorId`. |
| **Gap Type** | Dual-Layer Authorization (Intentional) |
| **OWASP** | N/A — by design |
| **Impact** | Security relies entirely on custom route handler correctness. If a new route is added without `instructorId` verification, it gets admin-only at Payload level (safe failure). |
| **Evidence** | [InstructorProgramSubmissions.ts](file:///d:/projects/nextacademy/src/collections/InstructorProgramSubmissions.ts): CRUD = `isAdmin`; custom routes use `overrideAccess: true` |
| **Mitigating Factor** | Fail-safe: if custom route has a bug, Payload's admin-only restriction blocks unauthorized access through REST. Double lock, not a gap. |
| **Remediation** | Document this pattern explicitly. Consider `isAdminOrOwnInstructor` at collection level for clarity. |

---

### GAP-009: CRM Sync Blocking Hook (Performance Contract) 🟡

| Attribute | Detail |
|-----------|--------|
| **Surface** | `afterChange` hooks on 10+ collections |
| **Contract Expected** | Non-blocking async enqueue |
| **Contract Actual** | `await enqueueCrmSyncEvent(...)` — awaits completion within the hook |
| **Gap Type** | Performance Contract Violation |
| **OWASP** | API4:2023 — Unrestricted Resource Consumption |
| **Impact** | If CRM (Twenty) is slow or down, ALL write operations to business-critical collections (bookings, users, payments) are degraded. |
| **Evidence** | `enqueueCrmSyncEvent` in hook chains across all flagged collections |
| **Mitigating Factor** | The function name suggests "enqueue" (fire-and-forget), but actual behavior depends on implementation. |
| **Remediation** | Verify `enqueueCrmSyncEvent` implementation. If synchronous, add circuit breaker or make truly async (write to queue table, process via cron). |

---

### GAP-010: Missing `admin` Panel Access Check on Some Collections 🔵

| Attribute | Detail |
|-----------|--------|
| **Surface** | Most collections except `users` |
| **Contract Expected** | `admin: isAdmin` to prevent non-admin users from accessing Payload admin panel |
| **Contract Actual** | Only `users` collection has `admin: async ({ req }) => isAdminRequest(req)`. Other collections lack `admin` access. |
| **Gap Type** | Inconsistent Admin Panel Guard |
| **OWASP** | API5:2023 — Broken Function Level Authorization |
| **Impact** | Payload admin panel access is gated by top-level auth config, so this is a defense-in-depth gap, not direct exploitability. |
| **Evidence** | [Users.ts L42](file:///d:/projects/nextacademy/src/collections/Users.ts#L42) has admin access; other collections do not. |
| **Remediation** | Add `admin: ({ req }) => isAdminRequest(req)` to all sensitive collections. |

---

## 3. Gap Summary Statistics

| Severity | Count | Collections/Endpoints Affected |
|----------|-------|-------------------------------|
| 🔴 Critical | 2 | 2 seed routes + `user-profiles` |
| 🟠 High | 3 | `blog-posts`, `bulk-seats/allocate`, `notifications` |
| 🟡 Medium | 4 | `users.create`, Google JWT, instructor `overrideAccess`, CRM hooks |
| 🔵 Info | 1 | Admin panel access |
| **Total** | **10** | |

---

## 4. Prioritized Remediation Roadmap

| Priority | Gap ID | Effort | Impact | Action |
|----------|--------|--------|--------|--------|
| **P0** | GAP-001 | 5 min | 🔴 Blocks exploit | Add `CRON_SECRET` check to `seed-instructors` and `seed-partners` |
| **P0** | GAP-002 | 15 min | 🔴 Blocks data leak | Change `user-profiles.update` to ownership-based access control |
| **P1** | GAP-004 | 5 min | 🟠 Blocks CSRF | Add `assertTrustedWriteRequest` to `bulk-seats/allocate` |
| **P1** | GAP-003 | 10 min | 🟠 Blocks content vandalism | Tighten `blog-posts` CUD to `isAdmin` |
| **P1** | GAP-005 | 5 min | 🟠 Blocks notification tampering | Change `notifications.update` to `isAdminOrOwner` |
| **P2** | GAP-006 | 30 min | 🟡 Rate limiting | Add rate limiting to Payload `users.create` |
| **P2** | GAP-007 | 1 hour | 🟡 Reduce risk surface | Migrate custom JWT to `jose` library |
| **P2** | GAP-008 | 15 min | 🟡 Clarity | Document `overrideAccess` pattern or align collection access |
| **P2** | GAP-009 | 1 hour | 🟡 Performance | Verify/fix CRM sync hook blocking behavior |
| **P3** | GAP-010 | 30 min | 🔵 Defense in depth | Add `admin` access to all collections |
