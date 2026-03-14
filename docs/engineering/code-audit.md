# Next Academy — Code Audit Report

> Date: 2026-03-13 14:31
> Scope: All 21 Payload CMS collections, `payload.config.ts`, `next.config.ts`
> Severity: 🔴 Critical | 🟡 High | 🟢 Normal

---

## Executive Summary

| Issue Category | Count | Severity |
|---|---|---|
| Access control missing or too permissive | 21 collections | 🔴 |
| No hooks (business logic, sync, emails) | 21 collections | 🔴 |
| No input validation (beyond `required`) | 21 collections | 🟡 |
| Missing fields vs PRD | 8 collections | 🟡 |
| Missing collections from PRD | 5 collections | 🟡 |
| Config security issues | 3 issues | 🔴 |
| No API routes implemented | 0 of ~50 endpoints | 🟡 |
| No tests | 0 test files | 🟢 |

---

## 1. Access Control Audit 🔴

### Current State

| Collection | `read` | `create` | `update` | `delete` | Verdict |
|---|---|---|---|---|---|
| Users | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 No access control |
| Media | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 No access control |
| Programs | `() => true` | ❌ default | ❌ default | ❌ default | 🟡 Read-only public, but write unprotected |
| Instructors | `() => true` | ❌ default | ❌ default | ❌ default | 🟡 Same |
| Categories | `() => true` | ❌ default | ❌ default | ❌ default | 🟡 Same |
| Tags | `() => true` | ❌ default | ❌ default | ❌ default | 🟡 Same |
| Companies | `() => true` | ❌ default | ❌ default | ❌ default | 🟡 Same |
| Rounds | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 No access control |
| Sessions | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 |
| Bookings | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 Sensitive data exposed |
| Payments | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 Financial data exposed |
| PaymentPlans | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 |
| UserProfiles | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 PII exposed |
| Notifications | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 |
| DiscountCodes | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 Codes leaked |
| InstallmentRequests | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 National ID exposed |
| ConsultationTypes | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 |
| ConsultationAvailability | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 |
| ConsultationSlots | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 |
| ConsultationBookings | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 |
| Leads | ❌ default | ❌ default | ❌ default | ❌ default | 🔴 Lead data exposed |

### What Each Collection Needs

```text
Public read (no auth):
├── Programs, Instructors, Categories, Tags — ✅ already set
├── Rounds (price, dates) — needs: read public
└── Sessions (schedule) — needs: read public

Authenticated read (own data only):
├── Bookings → user can read own, admin reads all
├── Payments → user can read own, admin reads all
├── UserProfiles → user can read own, admin reads all
├── Notifications → user can read own only
├── InstallmentRequests → user can read own, admin reads all
├── ConsultationBookings → user can read own, instructor can read own sessions, admin reads all
└── Companies → authenticated users (for onboarding)

Admin only:
├── DiscountCodes → admin create/update/delete, users can only validate
├── Leads → admin only
├── Media → admin + instructor upload, public read
├── PaymentPlans → admin only
├── ConsultationTypes → instructor (own) + admin
├── ConsultationAvailability → instructor (own) + admin
└── ConsultationSlots → system-generated, instructor/admin read
```

---

## 2. Hooks Audit 🔴

**Zero hooks exist in any collection.** The following hooks are required:

### Critical Hooks (Must Have)

| Collection | Hook Type | Purpose |
|---|---|---|
| Bookings | `beforeChange` | Auto-generate `bookingCode` (BK-2026-XXXXXX) |
| Bookings | `afterChange` | Increment `round.currentEnrollments`, create CRM deal, send confirmation email |
| Bookings | `afterChange` (cancel) | Decrement enrollments, trigger waitlist cascade, update CRM |
| Payments | `beforeChange` | Auto-generate `paymentCode` (PAY-2026-XXXXXX) |
| Payments | `afterChange` (paid) | Update booking status, send receipt, sync CRM |
| ConsultationBookings | `beforeChange` | Auto-generate booking code (CB-2026-XXXXXX) |
| ConsultationBookings | `afterChange` | Mark slot as booked, send confirmation, create calendar event |
| Users | `afterChange` | Sync to Twenty CRM, update lifecycle stage |
| Users | `afterLogin` | Update `lastLogin` timestamp |
| InstallmentRequests | `afterChange` (approve/reject) | Send email notification, set `approvalExpiresAt` |
| DiscountCodes | `beforeChange` | Validate code uniqueness, uppercase transform |
| Leads | `afterChange` (convert) | Create user account, sync to CRM |

### Nice-to-Have Hooks

| Collection | Hook Type | Purpose |
|---|---|---|
| Programs | `afterChange` | Invalidate cache, update search index |
| Rounds | `afterChange` (full) | Auto-close if `autoCloseOnFull`, trigger waitlist |
| Sessions | `afterChange` (cancel) | Notify attendees |
| Notifications | `afterCreate` | Push real-time notification via WebSocket |

---

## 3. Input Validation Audit 🟡

**No validation exists beyond `required: true` on some fields.** Missing:

| Collection | Field | Validation Needed |
|---|---|---|
| Users | `email` | Email format, domain validation |
| Users | `phone` | Phone format (Egyptian: +20XXXXXXXXXX) |
| Users | `password` | Min 8 chars, 1 uppercase, 1 number |
| Bookings | `discountCode` | Uppercase transform, existence check |
| Bookings | `totalAmount/finalAmount` | Positive number, max limit |
| Payments | `amount` | Positive number, matches plan |
| DiscountCodes | `code` | Uppercase, alphanumeric only, 4-20 chars |
| DiscountCodes | `value` | If percentage: 1-100, if fixed: > 0 |
| DiscountCodes | `validUntil` | Must be after `validFrom` |
| InstallmentRequests | `nationalIdNumber` | 14-digit Egyptian national ID format |
| ConsultationTypes | `durationMinutes` | Is string `"30"/"60"/"90"` — should be `number` |
| Rounds | `price` | Positive number |
| Rounds | `maxCapacity` | Positive integer |
| Sessions | `startTime/endTime` | Time format HH:MM, end > start |
| Leads | `email` | Email format |
| UserProfiles | `yearOfBirth` | 4-digit year, reasonable range (1940-2010) |
| All text fields | XSS | HTML sanitization |

---

## 4. Missing Fields vs PRD 🟡

| Collection | Missing Field | PRD Table # | Impact |
|---|---|---|---|
| Rounds | `currentEnrollments` | Table 7 | Can't track seat availability |
| Bookings | `paidAmount` | Table 11 | Can't show payment progress |
| Bookings | `remainingAmount` | Table 11 | Can't calculate balance |
| Bookings | `accessBlocked` | Custom | Can't gate content for overdue installments |
| Payments | `paymentGatewayResponse` | Table 12 | Can't debug Paymob issues |
| Payments | `paymobOrderId` | Custom | Can't reconcile with Paymob dashboard |
| Programs | `averageRating` | Computed | Can't show ratings on cards |
| Programs | `reviewCount` | Computed | Can't show review count |
| Users | `loginAttempts` | Security | Can't implement brute force protection |
| Users | `lockedUntil` | Security | Can't lock accounts |
| Users | `whatsappOptIn` | Privacy | Can't respect WhatsApp opt-out |
| Instructors | `slug` | For URLs | Can't have `/instructors/:slug` routes |
| Notifications | More types | Table 17 | Missing: `certificate_ready`, `waitlist_available`, `payment_overdue`, `access_blocked`, `refund_approved` |
| ConsultationTypes | `durationMinutes` type | Table 22 | Should be `number`, not `select` with string values |

---

## 5. Missing Collections 🟡

### 5.1 Waitlist (PRD Referenced)
```typescript
// collections/Waitlist.ts — DOES NOT EXIST
{
  slug: 'waitlist',
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'position', type: 'number', required: true },
    { name: 'status', type: 'select', options: ['waiting', 'notified', 'expired', 'converted'] },
    { name: 'notifiedAt', type: 'date' },
    { name: 'expiresAt', type: 'date' }, // 24h after notification
  ]
}
```

### 5.2 Reviews (PRD + reviews.md)
```typescript
// collections/Reviews.ts — DOES NOT EXIST
{
  slug: 'reviews',
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'booking', type: 'relationship', relationTo: 'bookings', required: true },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'title', type: 'text' },
    { name: 'comment', type: 'textarea', required: true },
    { name: 'status', type: 'select', options: ['pending', 'approved', 'flagged', 'removed'] },
    { name: 'helpfulCount', type: 'number', defaultValue: 0 },
    { name: 'isVerifiedPurchase', type: 'checkbox', defaultValue: true },
    { name: 'adminNotes', type: 'textarea' },
  ]
}
```

### 5.3 Certificates (PRD + certificates.md)
```typescript
// collections/Certificates.ts — DOES NOT EXIST
{
  slug: 'certificates',
  fields: [
    { name: 'certificateCode', type: 'text', unique: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'booking', type: 'relationship', relationTo: 'bookings', required: true },
    { name: 'quizScore', type: 'number' },
    { name: 'issuedAt', type: 'date', required: true },
    { name: 'pdfUrl', type: 'text' },
    { name: 'verificationUrl', type: 'text' },
  ]
}
```

### 5.4 PaymentLinks (PRD Table 20)
```typescript
// collections/PaymentLinks.ts — DOES NOT EXIST
{
  slug: 'payment-links',
  fields: [
    { name: 'code', type: 'text', unique: true, required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'paymentPlan', type: 'relationship', relationTo: 'payment-plans' },
    { name: 'discountCode', type: 'text' },
    { name: 'expiresAt', type: 'date' },
    { name: 'maxUses', type: 'number' },
    { name: 'currentUses', type: 'number', defaultValue: 0 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'createdBy', type: 'relationship', relationTo: 'users' },
  ]
}
```

### 5.5 InstructorBlockedDates (PRD Table 24)
```typescript
// collections/InstructorBlockedDates.ts — DOES NOT EXIST
{
  slug: 'instructor-blocked-dates',
  fields: [
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    { name: 'date', type: 'date', required: true },
    { name: 'reason', type: 'text' },
  ]
}
```

---

## 6. Config Security Issues 🔴

### 6.1 `payload.config.ts`

```typescript
// Line 62 — CRITICAL: Hardcoded fallback secret
secret: process.env.PAYLOAD_SECRET || 'super-secret-development-key',
// FIX: Remove fallback, crash if not set
secret: process.env.PAYLOAD_SECRET!,

// Line 56 — WARNING: Hardcoded DB connection string
connectionString: process.env.DATABASE_URI || 'postgresql://nextacademy:...',
// FIX: Remove fallback for production
connectionString: process.env.DATABASE_URI!,
```

### 6.2 `next.config.ts`

```typescript
// Current: EMPTY config — no security headers, no image optimization
const nextConfig: NextConfig = {
  /* config options here */
};

// SHOULD HAVE:
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.nextacademyedu.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }],
  poweredByHeader: false,
};
```

### 6.3 No CORS Configuration

No CORS settings exist. API routes will accept requests from any origin.

---

## 7. API Routes Status 🟡

**Zero API routes exist.** The project has no `route.ts` files in the app directory. All 50+ endpoints documented in `api-contracts.md` need to be implemented.

---

## 8. Priority Fix Roadmap

### Immediate (Before any deployment)
1. Remove hardcoded secrets from `payload.config.ts`
2. Add security headers to `next.config.ts`
3. Add access control to Bookings, Payments, UserProfiles, InstallmentRequests, Notifications

### Phase 4-5 (During Dashboard build)
4. Create missing collections (Waitlist, Reviews, Certificates, PaymentLinks, InstructorBlockedDates)
5. Add missing fields to existing collections
6. Implement core hooks (booking code generation, seat counting, email triggers)

### Phase 6-7 (During Backend/Integrations)
7. Implement all API routes
8. Add input validation
9. Integrate Paymob, Resend, CRM sync hooks
10. Set up testing framework

### Phase 8 (Pre-Launch)
11. Full security audit
12. Load testing
13. CORS configuration
14. Rate limiting middleware
