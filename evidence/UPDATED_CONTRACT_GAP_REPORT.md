# UPDATED_CONTRACT_GAP_REPORT.md

**Commit SHA**: `66f0b3952b7aaef0f2274648d69e3fd125aa0d9e` + Phase 2.1 Hotfix Patch  
**Generated at**: 2026-03-29T20:15:00+02:00 (Cairo) / 2026-03-29T18:15:00Z (UTC)  
**Audit scope**: API contract gaps — post-hotfix status  
**Verification status**: Static Verified / Runtime Unverified

---

## Gap Status After Phase 2.1 Hotfix

| Gap ID | Title | Severity | Status | Fix Reference |
|--------|-------|----------|--------|---------------|
| GAP-001 | Unprotected Seed Endpoints | 🔴 CRITICAL | ✅ **FIXED** | `ENABLE_SEED_ENDPOINTS` kill-switch + `CRON_SECRET` gate ([seed-instructors](file:///d:/projects/nextacademy/src/app/api/seed-instructors/route.ts), [seed-partners](file:///d:/projects/nextacademy/src/app/api/seed-partners/route.ts)) |
| GAP-002 | `user-profiles` Missing Ownership | 🔴 CRITICAL | ✅ **FIXED** | `update: isAdminOrOwnerByField('user')` ([UserProfiles.ts L12](file:///d:/projects/nextacademy/src/collections/UserProfiles.ts#L12)) |
| GAP-003 | `blog-posts` Full CUD to All Users | 🟠 HIGH | ✅ **FIXED** | CUD → `isAdmin` ([BlogPosts.ts L11-15](file:///d:/projects/nextacademy/src/collections/BlogPosts.ts#L11-L15)) |
| GAP-004 | Missing CSRF on bulk-seats/allocate | 🟠 HIGH | ✅ **FIXED** | `assertTrustedWriteRequest(req)` ([allocate/route.ts L57](file:///d:/projects/nextacademy/src/app/api/bulk-seats/allocate/route.ts#L57)) |
| GAP-005 | `notifications` Update Without Ownership | 🟠 HIGH | ✅ **FIXED** | `update: isAdminOrOwner` ([Notifications.ts L10](file:///d:/projects/nextacademy/src/collections/Notifications.ts#L10)) |
| GAP-006 | `users.create` Open Registration | 🟡 MEDIUM | ⏳ **OPEN** | Intentional for registration. Needs rate limiting at Payload layer. |
| GAP-007 | Custom JWT Implementation | 🟡 MEDIUM | ⏳ **OPEN** | Hand-rolled HS256 in Google OAuth. Recommend migration to `jose`. |
| GAP-008 | Instructor `overrideAccess` Pattern | 🟡 MEDIUM | ⏳ **OPEN** | Dual-layer by design. Needs documentation. |
| GAP-009 | CRM Sync Blocking Hook | 🟡 MEDIUM | ⏳ **OPEN** | Needs async verification of `enqueueCrmSyncEvent`. |
| GAP-010 | Missing `admin` Panel Access | 🔵 INFO | ⏳ **OPEN** | Defense-in-depth improvement. |

---

## Summary Statistics

| Category | Before Hotfix | After Hotfix |
|----------|--------------|--------------|
| 🔴 Critical (Open) | 2 | **0** |
| 🟠 High (Open) | 3 | **0** |
| 🟡 Medium (Open) | 4 | **4** (unchanged) |
| 🔵 Info (Open) | 1 | **1** (unchanged) |
| **Total Open** | **10** | **5** |
| **Total Fixed** | **0** | **5** |

---

## Remaining Gaps — Prioritized Remediation

| Priority | Gap ID | Effort | Action |
|----------|--------|--------|--------|
| P2 | GAP-006 | 30 min | Add rate limiting to `users.create` (e.g. IP-based via middleware) |
| P2 | GAP-007 | 1 hour | Migrate custom JWT to `jose` library |
| P2 | GAP-008 | 15 min | Document the `overrideAccess` pattern in DESIGN_DECISIONS.md |
| P2 | GAP-009 | 1 hour | Audit `enqueueCrmSyncEvent` — add circuit breaker if synchronous |
| P3 | GAP-010 | 30 min | Add `admin: isAdminRequest` to all sensitive collection configs |
