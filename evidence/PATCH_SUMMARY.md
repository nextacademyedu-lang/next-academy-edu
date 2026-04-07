# PATCH_SUMMARY.md — Phase 2.1 Hotfix Patch

**Generated at**: 2026-03-29T20:15:00+02:00 (Cairo) / 2026-03-29T18:15:00Z (UTC)  
**Commit reference**: Applied on top of `66f0b3952b7aaef0f2274648d69e3fd125aa0d9e`  
**Verification**: `tsc --noEmit` ✅ | `next build` ✅ (compile+pages; symlink EPERM is pre-existing Windows issue)

---

## Changes Applied

### FIX-1: Protect Seed Routes (GAP-001) 🔴→✅

| File | Lines Changed | Change |
|------|--------------|--------|
| [seed-instructors/route.ts](file:///d:/projects/nextacademy/src/app/api/seed-instructors/route.ts) | +42 lines | Added: JSDoc header, `ENABLE_SEED_ENDPOINTS` kill-switch, `CRON_SECRET` via `Authorization: Bearer` with `timingSafeEqual`, `NextRequest` param |
| [seed-partners/route.ts](file:///d:/projects/nextacademy/src/app/api/seed-partners/route.ts) | +42 lines | Same pattern as seed-instructors |

**Before**:
```typescript
export async function POST() {
  // No auth check — anyone can call
```

**After**:
```typescript
export async function POST(req: NextRequest) {
  if (process.env.ENABLE_SEED_ENDPOINTS !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // CRON_SECRET timing-safe comparison
  // ...
```

**New env vars**: `ENABLE_SEED_ENDPOINTS` (default: undefined = disabled)

---

### FIX-2: User-Profiles Ownership (GAP-002) 🔴→✅

| File | Lines Changed | Change |
|------|--------------|--------|
| [UserProfiles.ts](file:///d:/projects/nextacademy/src/collections/UserProfiles.ts) | L2, L12 | Import `isAdminOrOwnerByField`; change `update` from `isAuthenticated` → `isAdminOrOwnerByField('user')` |

**Before**: `update: isAuthenticated` — any logged-in user can update ANY profile  
**After**: `update: isAdminOrOwnerByField('user')` — only profile owner or admin

---

### FIX-3: Blog Posts CUD (GAP-003) 🟠→✅

| File | Lines Changed | Change |
|------|--------------|--------|
| [BlogPosts.ts](file:///d:/projects/nextacademy/src/collections/BlogPosts.ts) | L1-L16 | Import `isAdmin, isPublic`; replace `Boolean(user)` with `isAdmin` for CUD |

**Before**: `create/update/delete: ({ req: { user } }) => Boolean(user)` — any user  
**After**: `create: isAdmin, update: isAdmin, delete: isAdmin`

---

### FIX-4: CSRF on Bulk-Seats Allocate (GAP-004) 🟠→✅

| File | Lines Changed | Change |
|------|--------------|--------|
| [allocate/route.ts](file:///d:/projects/nextacademy/src/app/api/bulk-seats/allocate/route.ts) | L4, L57-59 | Import `assertTrustedWriteRequest`; add CSRF check before body parsing |

**Before**: No CSRF check  
**After**: `const csrfError = assertTrustedWriteRequest(req); if (csrfError) return csrfError;`

---

### FIX-5: Notifications Update Scope (GAP-005) 🟠→✅

| File | Lines Changed | Change |
|------|--------------|--------|
| [Notifications.ts](file:///d:/projects/nextacademy/src/collections/Notifications.ts) | L10 | `update: isAuthenticated` → `update: isAdminOrOwner` |

**Before**: Any logged-in user can update any notification  
**After**: Only notification owner or admin

---

## Verification Results

| Check | Result | Notes |
|-------|--------|-------|
| `tsc --noEmit` | ✅ Pass (exit 0) | Zero type errors |
| `next build` — compile | ✅ Pass (84s) | Only pre-existing autoprefixer CSS warning |
| `next build` — type check | ✅ Pass | "Linting and checking validity of types" |
| `next build` — pages | ✅ Pass (49/49) | All static pages generated |
| `next build` — standalone | ⚠️ EPERM | Pre-existing Windows symlink issue, not caused by patch |

---

## Files Changed Summary

| # | File | Type | Lines |
|---|------|------|-------|
| 1 | `src/app/api/seed-instructors/route.ts` | Route fix | +42 |
| 2 | `src/app/api/seed-partners/route.ts` | Route fix | +42 |
| 3 | `src/collections/UserProfiles.ts` | Collection access fix | L2, L12 |
| 4 | `src/collections/BlogPosts.ts` | Collection access fix | L1-L16 |
| 5 | `src/collections/Notifications.ts` | Collection access fix | L10 |
| 6 | `src/app/api/bulk-seats/allocate/route.ts` | Route CSRF fix | L4, L57-59 |

**Total**: 6 files changed, ~90 lines net added
