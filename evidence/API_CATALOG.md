# API_CATALOG.md (Phase 1.2 — Corrected)

**Commit SHA**: `66f0b3952b7aaef0f2274648d69e3fd125aa0d9e`  
**Generated at**: 2026-03-29T19:55:00+02:00 (Cairo) / 2026-03-29T17:55:00Z (UTC)  
**Audit scope**: API contracts, RBAC mappings, Collection hooks, end-to-end flows  
**Verification status**: Static Verified / Runtime Unverified

> **Phase 1.1 Correction Notes:**  
> - Helper files (e.g. `b2b/_scope.ts`) excluded — not endpoints.  
> - Every endpoint documented per-method, not per-path.  
> - `resolveB2BScope` delegates to `payload.auth` internally — classified as `payload.auth (via resolveB2BScope)`.  
> - `authenticateRequestUser` verifies JWT from cookie — classified as `JWT/Cookie (via server-auth)`.  
> - Cron routes use `CRON_SECRET` header check — classified as `Shared Secret (CRON_SECRET)`.  
> - Seed routes without explicit auth are flagged as `⚠ UNPROTECTED` with Low confidence.

---

## Section 1: Custom Next.js Routes

### 1.1 Auth & Identity

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 1 | `/api/auth/google` | GET | Public | Any | — | — | Sets OAuth cookies | `auth/google/route.ts` | `GET` | High |
| 2 | `/api/auth/google/callback` | GET | OAuth state+nonce+PKCE | Any (Google-authenticated) | `users` | `users` (find-or-create) | Sets `payload-token` cookie, External fetch to Google APIs | `auth/google/callback/route.ts` | `GET` | High |
| 3 | `/api/auth/send-otp` | POST | Public | Any | `users` (R), `verification-codes` (R) | `verification-codes` (C/U) | Email (Resend) | `auth/send-otp/route.ts` | `POST` | High |
| 4 | `/api/auth/verify-otp` | POST | Public | Any | `verification-codes`, `users`, `instructors` | `verification-codes` (U), `users` (U), `instructors` (C) | Role promotion (b2b_manager), Instructor auto-link | `auth/verify-otp/route.ts` | `POST` | High |
| 5 | `/api/users/login` | POST | Public | Any | `users` | — | Sets session cookie | `users/login/route.ts` | `POST` | High |

### 1.2 Google Calendar Integration

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 6 | `/api/google/connect` | GET | `payload.auth` | Admin only | — | — | Redirects to Google OAuth for Calendar | `google/connect/route.ts` | `GET` | High |
| 7 | `/api/google/callback` | GET | OAuth state | Any (internal redirect) | — | — | Exchanges Google token for Calendar access | `google/callback/route.ts` | `GET` | Med |

### 1.3 B2B Management

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 8 | `/api/b2b/bookings` | GET | `payload.auth` (via `resolveB2BScope`) | Admin or B2B Manager (company-scoped) | `bookings`, `user-profiles` | — | — | `b2b/bookings/route.ts` | `GET` | High |
| 9 | `/api/b2b/dashboard` | GET | `payload.auth` (via `resolveB2BScope`) | Admin or B2B Manager (company-scoped) | `bookings`, `user-profiles` | — | — | `b2b/dashboard/route.ts` | `GET` | High |
| 10 | `/api/b2b/invitations` | GET | `payload.auth` (via `resolveB2BScope`) | Admin or B2B Manager (company-scoped) | `company-invitations` | `company-invitations` (expired status update) | — | `b2b/invitations/route.ts` | `GET` | High |
| 11 | `/api/b2b/invitations` | POST | `payload.auth` (via `resolveB2BScope`) | Admin or B2B Manager (company-scoped) | `company-invitations`, `users`, `user-profiles` | `company-invitations` (C/U) | Email (`payload.sendEmail`) | `b2b/invitations/route.ts` | `POST` | High |
| 12 | `/api/b2b/invitations` | DELETE | `payload.auth` (via `resolveB2BScope`) | Admin or B2B Manager (company-scoped) | `company-invitations` | `company-invitations` (status→revoked) | — | `b2b/invitations/route.ts` | `DELETE` | High |
| 13 | `/api/b2b/invitations/accept` | POST | `payload.auth` | Authenticated user (email-verified) | `company-invitations` (R: findByToken), `user-profiles` (R: getUserProfile) | `company-invitations` (U: status→accepted, acceptedBy), `user-profiles` (C/U: company link, jobTitle, title) | — | `b2b/invitations/accept/route.ts` | `POST` | High |
| 14 | `/api/b2b/invitations/validate` | GET | Public | Any | `company-invitations` (R: findByToken) | — | — | `b2b/invitations/validate/route.ts` | `GET` | High |
| 15 | `/api/b2b/team` | GET | `payload.auth` (via `resolveB2BScope`) | Admin or B2B Manager (company-scoped) | `user-profiles`, `bookings` | — | — | `b2b/team/route.ts` | `GET` | High |
| 16 | `/api/b2b/team` | POST | `payload.auth` (via `resolveB2BScope`) | Admin or B2B Manager (company-scoped) | `users`, `user-profiles` | `users` (C), `user-profiles` (C/U) | Creates user if not exists | `b2b/team/route.ts` | `POST` | High |
| 17 | `/api/b2b/team` | DELETE | `payload.auth` (via `resolveB2BScope`) | Admin or B2B Manager (company-scoped) | `user-profiles` | `user-profiles` (company→null) | — | `b2b/team/route.ts` | `DELETE` | High |

### 1.4 Bookings & Checkout

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 18 | `/api/bookings/create` | POST | JWT/Cookie (via `authenticateRequestUser`) + CSRF | Authenticated user | `rounds`, `bookings`, `discount-codes`, `payment-plans` | `bookings` (C/U), `payments` (C), `rounds` (atomic inc), `discount-codes` (atomic inc) | Atomic DB increments, `processSuccessfulPayment` (for free bookings) | `bookings/create/route.ts` | `POST` | High |
| 19 | `/api/checkout/easykash` | POST | JWT/Cookie (via `authenticateRequestUser`) + CSRF | Authenticated user (owner of booking) | `bookings`, `payments` | `payments` (U) | `processSuccessfulPayment`, External EasyKash API | `checkout/easykash/route.ts` | `POST` | High |
| 20 | `/api/checkout/paymob` | POST | JWT/Cookie (via `authenticateRequestUser`) + CSRF | Authenticated user (owner of booking) | `bookings`, `payments` | `payments` (U) | `processSuccessfulPayment`, External Paymob/EasyKash API | `checkout/paymob/route.ts` | `POST` | High |
| 21 | `/api/bulk-seats/allocate` | POST | `payload.auth` | Admin or B2B Manager (company-scoped) | `user-profiles`, `bulk-seat-allocations`, `bookings` | `bulk-seat-allocations` (U), `bookings` (C) | Creates booking for allocated user | `bulk-seats/allocate/route.ts` | `POST` | High |

### 1.5 Certificates & Reviews

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 22 | `/api/certificates/generate` | POST | `payload.auth` | Admin only | `bookings`, `certificates` | `certificates` (C) | — | `certificates/generate/route.ts` | `POST` | High |
| 23 | `/api/reviews/moderate` | POST | `payload.auth` | Admin only | `reviews`, `programs` | `reviews` (U), `programs` (U: rating recalc) | — | `reviews/moderate/route.ts` | `POST` | High |

### 1.6 Discount Codes

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 24 | `/api/discount-codes/validate` | POST | JWT/Cookie (via `authenticateRequestUser`) + CSRF | Authenticated user | `bookings`, `discount-codes`, `payments` | — | Atomic DB reads | `discount-codes/validate/route.ts` | `POST` | High |
| 25 | `/api/discount-codes/remove` | POST | JWT/Cookie (via `authenticateRequestUser`) + CSRF | Authenticated user | `bookings`, `payments` | `bookings` (U), `payments` (U) | Atomic DB decrement | `discount-codes/remove/route.ts` | `POST` | High |

### 1.7 Instructor Portal

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 26 | `/api/instructor/profile` | GET | `payload.auth` | Instructor (linked via `instructorId`) | `instructors` | — | — | `instructor/profile/route.ts` | `GET` | High |
| 27 | `/api/instructor/profile` | PATCH | `payload.auth` | Instructor (linked) | `instructors` | `instructors` (U) | — | `instructor/profile/route.ts` | `PATCH` | High |
| 28 | `/api/instructor/profile/submit` | POST | `payload.auth` | Instructor (linked) | `instructors` | `instructors` (U: status→pending) | — | `instructor/profile/submit/route.ts` | `POST` | High |
| 29 | `/api/instructor/availability` | GET | `payload.auth` | Admin or Instructor | `consultation-availability` | — | — | `instructor/availability/route.ts` | `GET` | High |
| 30 | `/api/instructor/availability` | PUT | `payload.auth` | Admin or Instructor | `consultation-availability` | `consultation-availability` (C/U/D) | — | `instructor/availability/route.ts` | `PUT` | High |
| 31 | `/api/instructor/consultation-types` | GET | `payload.auth` | Instructor (linked) | `consultation-types` | — | — | `instructor/consultation-types/route.ts` | `GET` | High |
| 32 | `/api/instructor/consultation-types` | POST | `payload.auth` | Instructor (linked) | `consultation-types` | `consultation-types` (C) | — | `instructor/consultation-types/route.ts` | `POST` | High |
| 33 | `/api/instructor/consultation-types/[id]` | PATCH | `payload.auth` | Instructor (owner) | `consultation-types` | `consultation-types` (U) | — | `instructor/consultation-types/[id]/route.ts` | `PATCH` | High |
| 34 | `/api/instructor/consultation-types/[id]` | DELETE | `payload.auth` | Instructor (owner) | `consultation-types` | `consultation-types` (D) | — | `instructor/consultation-types/[id]/route.ts` | `DELETE` | High |
| 35 | `/api/instructor/program-submissions` | GET | `payload.auth` | Instructor (linked) | `instructor-program-submissions` | — | — | `instructor/program-submissions/route.ts` | `GET` | High |
| 36 | `/api/instructor/program-submissions` | POST | `payload.auth` | Instructor (linked) | `instructor-program-submissions` | `instructor-program-submissions` (C) | — | `instructor/program-submissions/route.ts` | `POST` | High |
| 37 | `/api/instructor/program-submissions/[id]` | PATCH | `payload.auth` | Instructor (owner) | `instructor-program-submissions` | `instructor-program-submissions` (U) | — | `instructor/program-submissions/[id]/route.ts` | `PATCH` | High |
| 38 | `/api/instructor/program-submissions/[id]` | DELETE | `payload.auth` | Instructor (owner) | `instructor-program-submissions` | `instructor-program-submissions` (D) | — | `instructor/program-submissions/[id]/route.ts` | `DELETE` | High |
| 39 | `/api/instructor/program-submissions/[id]/submit` | POST | `payload.auth` | Instructor (owner) | `instructor-program-submissions` | `instructor-program-submissions` (U: status→submitted) | — | `instructor/program-submissions/[id]/submit/route.ts` | `POST` | High |
| 40 | `/api/instructor/sessions` | GET | `payload.auth` | Instructor (linked) | `sessions` | — | — | `instructor/sessions/route.ts` | `GET` | High |
| 41 | `/api/instructor/sessions/[id]/materials` | GET | `payload.auth` | Instructor (linked) | `sessions` | — | — | `instructor/sessions/[id]/materials/route.ts` | `GET` | High |
| 42 | `/api/instructor/sessions/[id]/materials` | POST | `payload.auth` | Instructor (linked) | `sessions`, `media` | `sessions` (U), `media` (C) | — | `instructor/sessions/[id]/materials/route.ts` | `POST` | High |
| 43 | `/api/instructor/sessions/[id]/materials` | PATCH | `payload.auth` | Instructor (linked) | `sessions` | `sessions` (U) | — | `instructor/sessions/[id]/materials/route.ts` | `PATCH` | High |

### 1.8 Notifications

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 44 | `/api/notifications/read-all` | PUT | `payload.auth` | Authenticated (own notifications) | `notifications` | `notifications` (U) | — | `notifications/read-all/route.ts` | `PUT` | High |
| 45 | `/api/notifications/[id]/read` | PUT | `payload.auth` | Authenticated (own notification) | `notifications` | `notifications` (U) | — | `notifications/[id]/read/route.ts` | `PUT` | High |

### 1.9 Public Content (Homepage)

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 46 | `/api/announcement-bars/active` | GET | `payload.auth` (optional, for preview) | Public (Admin for preview) | `announcement-bars` | — | — | `announcement-bars/active/route.ts` | `GET` | High |
| 47 | `/api/home/blog-posts` | GET | Public | Any | `blog-posts` | — | — | `home/blog-posts/route.ts` | `GET` | High |
| 48 | `/api/home/featured-programs` | GET | Public | Any | `programs`, `rounds`, `reviews` | — | — | `home/featured-programs/route.ts` | `GET` | High |
| 49 | `/api/home/instructors` | GET | Public | Any | `instructors` | — | — | `home/instructors/route.ts` | `GET` | High |
| 50 | `/api/home/stats` | GET | Public | Any | `bookings`, `companies`, `instructors` | — | — | `home/stats/route.ts` | `GET` | High |
| 51 | `/api/home/testimonials` | GET | Public | Any | `reviews` | — | — | `home/testimonials/route.ts` | `GET` | High |
| 52 | `/api/home/video-testimonials` | GET | Public | Any | `reviews` | — | — | `home/video-testimonials/route.ts` | `GET` | High |
| 53 | `/api/popups/active` | GET | JWT/Cookie (via `authenticateRequestUser`) | Optional auth (Admin for preview, user for targeting) | `popups`, `bookings` | — | — | `popups/active/route.ts` | `GET` | High |
| 54 | `/api/upcoming-events` | GET | Public | Any | `upcoming-events-config`, `programs`, `rounds` | — | — | `upcoming-events/route.ts` | `GET` | High |

### 1.10 Webhooks (External Inbound)

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 55 | `/api/webhooks/easykash` | POST | HMAC Signature | External (EasyKash server) | `payments` | `payments` (U) | `processSuccessfulPayment` | `webhooks/easykash/route.ts` | `POST` | High |
| 56 | `/api/webhooks/easykash/redirect` | GET | Public (user browser redirect) | Any | `payments` | — | Redirects to success/failure page | `webhooks/easykash/redirect/route.ts` | `GET` | High |
| 57 | `/api/webhooks/paymob` | POST | HMAC Signature | External (Paymob server) | `payments` | `payments` (U) | `processSuccessfulPayment` | `webhooks/paymob/route.ts` | `POST` | High |
| 58 | `/api/webhooks/paymob/redirect` | GET | Public (user browser redirect) | Any | — | — | Redirects to success/failure page | `webhooks/paymob/redirect/route.ts` | `GET` | High |

### 1.11 Cron Jobs (Internal Scheduled)

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 59 | `/api/cron/check-overdue` | GET | Shared Secret (`CRON_SECRET`) | Internal cron only | `payments`, `bookings`, `users` | `bookings` (U: status→cancelled_overdue), `payments` (U) | — | `cron/check-overdue/route.ts` | `GET` | High |
| 60 | `/api/cron/crm-sync` | GET | Shared Secret (`CRON_SECRET`) | Internal cron only | `crm-sync-events` | `crm-sync-events` (U) | Pushes events to CRM (Twenty) | `cron/crm-sync/route.ts` | `GET` | High |
| 61 | `/api/cron/waitlist` | GET | Shared Secret (`CRON_SECRET`) | Internal cron only | `waitlist`, `rounds`, `users` | `waitlist` (U) | — | `cron/waitlist/route.ts` | `GET` | High |
| 62 | `/api/health` | GET | Public | Any | — | — | — | `health/route.ts` | `GET` | High |
| 63 | `/api/health/db` | GET | Shared Secret (`CRON_SECRET`) | Internal only | — | — | DB connectivity probe | `health/db/route.ts` | `GET` | High |

### 1.12 Seed Routes (⚠ DANGEROUS)

| # | Path | Method | Auth Primitive | Required Role + Scope | Read Collections | Write Collections | Side Effects | Source File | Handler | Confidence |
|---|------|--------|----------------|----------------------|------------------|-------------------|--------------|-------------|---------|------------|
| 64 | `/api/seed-admin` | POST | Shared Secret (`CRON_SECRET`) | Internal only | `users` | `users` (C) | Creates admin user | `seed-admin/route.ts` | `POST` | High |
| 65 | `/api/seed-instructors` | POST | ⚠ UNPROTECTED | Any | `media`, `instructors` | `media` (C), `instructors` (C) | Bulk data creation | `seed-instructors/route.ts` | `POST` | **Low** |
| 66 | `/api/seed-partners` | POST | ⚠ UNPROTECTED | Any | `media`, `partners` | `media` (C), `partners` (C) | Bulk data creation | `seed-partners/route.ts` | `POST` | **Low** |
| 67 | `/api/seed-test-data` | POST | Shared Secret (`CRON_SECRET`) | Internal only | `categories`, `programs`, `rounds`, `discount-codes` | All four (C) | Bulk data creation | `seed-test-data/route.ts` | `POST` | High |

---

## Section 2: Payload Auto Endpoints

Each Payload CMS collection automatically exposes `GET` (list/findByID), `POST` (create), `PATCH` (update), `DELETE` (delete) endpoints at `/api/<slug>`. Auth is enforced by the `access` property defined in the collection config file.

| # | Collection Slug | Access Rules Source | Read Rule | Create Rule | Update Rule | Delete Rule | Hooks (Side Effects) | Source File |
|---|-----------------|---------------------|-----------|-------------|-------------|-------------|---------------------|-------------|
| 1 | `announcement-bars` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `AnnouncementBars.ts` |
| 2 | `blog-posts` | Inline | `() => true` | `Boolean(user)` | `Boolean(user)` | `Boolean(user)` | — | `BlogPosts.ts` |
| 3 | `bookings` | `access-control.ts` | `isAdminOrOwner` | `isAuthenticated` | `isAdmin` | `isAdmin` | `afterChange` → CRM sync, Google Calendar; `beforeDelete` → cascade delete certificates | `Bookings.ts` |
| 4 | `bulk-seat-allocations` | `access-control.ts` | `isAdminOrB2BManager` | `isAdmin` | `isAdmin` | `isAdmin` | `afterChange` → CRM sync | `BulkSeatAllocations.ts` |
| 5 | `categories` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Categories.ts` |
| 6 | `certificates` | `access-control.ts` | `isAdminOrOwner` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Certificates.ts` |
| 7 | `companies` | `access-control.ts` | `isAuthenticated` | `isAuthenticated` | `isAdmin` | `isAdmin` | `afterChange` → CRM sync | `Companies.ts` |
| 8 | `company-invitations` | `access-control.ts` | `isAdmin` | `isAdmin` | `isAdmin` | `isAdmin` | — | `CompanyInvitations.ts` |
| 9 | `consultation-availability` | `access-control.ts` | `isPublic` | `isAdminOrOwnInstructor` | `isAdminOrOwnInstructor` | `isAdminOrOwnInstructor` | `beforeChange` → dayOfWeek/dayIndex normalization | `ConsultationAvailability.ts` |
| 10 | `consultation-bookings` | `access-control.ts` | `isAdminOrOwnerOrOwnInstructor` | `isAuthenticated` | `isAdminOrOwnInstructorForUpdate` | `isAdmin` | `afterChange` → CRM sync | `ConsultationBookings.ts` |
| 11 | `consultation-slots` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `ConsultationSlots.ts` |
| 12 | `consultation-types` | `access-control.ts` | `isPublic` | `isAdminOrOwnInstructor` | `isAdminOrOwnInstructor` | `isAdmin` | `beforeChange` → title normalization; `afterRead` → title sync | `ConsultationTypes.ts` |
| 13 | `crm-sync-events` | `access-control.ts` | `isAdmin` | `isAdmin` | `isAdmin` | `isAdmin` | — | `CrmSyncEvents.ts` |
| 14 | `discount-codes` | `access-control.ts` | `isAdmin` | `isAdmin` | `isAdmin` | `isAdmin` | — | `DiscountCodes.ts` |
| 15 | `installment-requests` | `access-control.ts` | `isAdminOrOwner` | `isAuthenticated` | `isAdmin` | `isAdmin` | — | `InstallmentRequests.ts` |
| 16 | `instructor-blocked-dates` | `access-control.ts` | `isAdminOrOwnInstructor` | `isAdminOrInstructor` | `isAdminOrOwnInstructor` | `isAdminOrOwnInstructor` | — | `InstructorBlockedDates.ts` |
| 17 | `instructor-program-submissions` | `access-control.ts` | `isAdmin` | `isAdmin` | `isAdmin` | `isAdmin` | — | `InstructorProgramSubmissions.ts` |
| 18 | `instructors` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Instructors.ts` |
| 19 | `leads` | `access-control.ts` | `isAdmin` | `isAdmin` | `isAdmin` | `isAdmin` | `afterChange` → CRM sync | `Leads.ts` |
| 20 | `media` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Media.ts` |
| 21 | `notifications` | `access-control.ts` | `isAdminOrOwner` | `isAdmin` | `isAuthenticated` | `isAdmin` | — | `Notifications.ts` |
| 22 | `partners` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Partners.ts` |
| 23 | `payment-links` | `access-control.ts` | `isAdmin` | `isAdmin` | `isAdmin` | `isAdmin` | — | `PaymentLinks.ts` |
| 24 | `payment-plans` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `PaymentPlans.ts` |
| 25 | `payments` | `access-control.ts` | `isAdminOrOwnerByField('booking.user')` | `isAdmin` | `isAdmin` | `isAdmin` | `afterChange` → CRM sync | `Payments.ts` |
| 26 | `popups` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Popups.ts` |
| 27 | `programs` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Programs.ts` |
| 28 | `reviews` | `access-control.ts` | `isPublic` | `isAuthenticated` | `isAdminOrOwner` | `isAdmin` | — | `Reviews.ts` |
| 29 | `rounds` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Rounds.ts` |
| 30 | `sessions` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Sessions.ts` |
| 31 | `tags` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `Tags.ts` |
| 32 | `upcoming-events-config` | `access-control.ts` | `isPublic` | `isAdmin` | `isAdmin` | `isAdmin` | — | `UpcomingEventsConfig.ts` |
| 33 | `user-profiles` | `access-control.ts` | `isAuthenticated` | `isAuthenticated` | `isAuthenticated` | `isAdmin` | `afterChange` → CRM sync | `UserProfiles.ts` |
| 34 | `users` | `access-control.ts` | `isAdminOrSelf` | `() => true` | `isAdminOrSelf` | `isAdmin` | `beforeChange` → role guard; `afterChange` → CRM sync, instructor auto-link | `Users.ts` |
| 35 | `verification-codes` | `access-control.ts` | `isAdmin` | `isAdmin` | `isAdmin` | `isAdmin` | — | `VerificationCodes.ts` |
| 36 | `waitlist` | `access-control.ts` | `isAdminOrOwner` | `isAuthenticated` | `isAdmin` | `isAdmin` | `afterChange` → CRM sync | `Waitlist.ts` |
