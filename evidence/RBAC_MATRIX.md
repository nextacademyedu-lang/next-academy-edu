# RBAC_MATRIX.md

**Commit SHA**: `66f0b3952b7aaef0f2274648d69e3fd125aa0d9e`  
**Generated at**: 2026-03-29T19:55:00+02:00 (Cairo) / 2026-03-29T17:55:00Z (UTC)  
**Audit scope**: Role-Based Access Control across all API surfaces  
**Verification status**: Static Verified / Runtime Unverified  
**Evidence source**: [API_CATALOG.md](file:///d:/projects/nextacademy/evidence/API_CATALOG.md), [access-control.ts](file:///d:/projects/nextacademy/src/lib/access-control.ts)

---

## 1. Role Definitions (from codebase)

| Role | Defined In | Description | Population |
|------|-----------|-------------|------------|
| `admin` | `access-control.ts` L45-54 | Full system access. determined by `user.role === 'admin'` OR email in `PAYLOAD_ADMIN_EMAIL` env var | Manually assigned |
| `b2b_manager` | `verify-otp` / `Users.beforeChange` | Company manager. Can manage team, bookings, invitations for own company | Set during OTP verify with `signupIntent='b2b_manager'` |
| `instructor` | `verify-otp` / `Users.beforeChange` | Course instructor. Linked to `instructors` collection via `user.instructorId` | Set during OTP verify with `signupIntent='instructor'`, or admin assigns |
| `user` (default) | Payload auth default | Standard learner. Can book courses, manage own profile | Created on registration |
| `anonymous` | — | Unauthenticated visitor | No session |

---

## 2. Payload Collection RBAC Matrix

Legend: ✅ = Allowed | 🔒 = Scoped (query constraint) | ❌ = Denied | — = N/A

| # | Collection | Anonymous (read) | User (read) | User (create) | User (update) | User (delete) | B2B Mgr (read) | Instructor (read) | Instructor (create) | Instructor (update) | Admin (all) | Evidence |
|---|-----------|------------------|-------------|---------------|---------------|---------------|-----------------|--------------------|--------------------|--------------------|----|----------|
| 1 | `users` | ❌ | 🔒 own | ✅ | 🔒 own | ❌ | 🔒 own | 🔒 own | ✅ | 🔒 own | ✅ | [Users.ts L36-43](file:///d:/projects/nextacademy/src/collections/Users.ts#L36-L43) |
| 2 | `user-profiles` | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | [UserProfiles.ts L9-14](file:///d:/projects/nextacademy/src/collections/UserProfiles.ts#L9-L14) |
| 3 | `bookings` | ❌ | 🔒 own | ✅ | ❌ | ❌ | 🔒 own | 🔒 own | ✅ | ❌ | ✅ | [Bookings.ts](file:///d:/projects/nextacademy/src/collections/Bookings.ts) |
| 4 | `payments` | ❌ | 🔒 own (via booking.user) | ❌ | ❌ | ❌ | 🔒 own | 🔒 own | ❌ | ❌ | ✅ | [Payments.ts](file:///d:/projects/nextacademy/src/collections/Payments.ts) |
| 5 | `bulk-seat-allocations` | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 company | ❌ | ❌ | ❌ | ✅ | [BulkSeatAllocations.ts](file:///d:/projects/nextacademy/src/collections/BulkSeatAllocations.ts) |
| 6 | `companies` | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | [Companies.ts](file:///d:/projects/nextacademy/src/collections/Companies.ts) |
| 7 | `company-invitations` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | [CompanyInvitations.ts](file:///d:/projects/nextacademy/src/collections/CompanyInvitations.ts) |
| 8 | `certificates` | ❌ | 🔒 own | ❌ | ❌ | ❌ | 🔒 own | 🔒 own | ❌ | ❌ | ✅ | [Certificates.ts](file:///d:/projects/nextacademy/src/collections/Certificates.ts) |
| 9 | `programs` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Programs.ts](file:///d:/projects/nextacademy/src/collections/Programs.ts) |
| 10 | `rounds` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Rounds.ts](file:///d:/projects/nextacademy/src/collections/Rounds.ts) |
| 11 | `categories` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Categories.ts](file:///d:/projects/nextacademy/src/collections/Categories.ts) |
| 12 | `sessions` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Sessions.ts](file:///d:/projects/nextacademy/src/collections/Sessions.ts) |
| 13 | `instructors` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Instructors.ts](file:///d:/projects/nextacademy/src/collections/Instructors.ts) |
| 14 | `consultation-types` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | 🔒 own instr | 🔒 own instr | ✅ | [ConsultationTypes.ts](file:///d:/projects/nextacademy/src/collections/ConsultationTypes.ts) |
| 15 | `consultation-availability` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | 🔒 own instr | 🔒 own instr | ✅ | [ConsultationAvailability.ts](file:///d:/projects/nextacademy/src/collections/ConsultationAvailability.ts) |
| 16 | `consultation-bookings` | ❌ | 🔒 own | ✅ | ❌ | ❌ | 🔒 own | 🔒 own instr | ✅ | 🔒 own instr | ✅ | [ConsultationBookings.ts](file:///d:/projects/nextacademy/src/collections/ConsultationBookings.ts) |
| 17 | `consultation-slots` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [ConsultationSlots.ts](file:///d:/projects/nextacademy/src/collections/ConsultationSlots.ts) |
| 18 | `instructor-blocked-dates` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 own instr | ✅ (any instr) | 🔒 own instr | ✅ | [InstructorBlockedDates.ts](file:///d:/projects/nextacademy/src/collections/InstructorBlockedDates.ts) |
| 19 | `instructor-program-submissions` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | [InstructorProgramSubmissions.ts](file:///d:/projects/nextacademy/src/collections/InstructorProgramSubmissions.ts) |
| 20 | `reviews` | ✅ | ✅ | ✅ | 🔒 own | ❌ | ✅ | ✅ | ✅ | 🔒 own | ✅ | [Reviews.ts](file:///d:/projects/nextacademy/src/collections/Reviews.ts) |
| 21 | `notifications` | ❌ | 🔒 own | ❌ | ✅ (mark read) | ❌ | 🔒 own | 🔒 own | ❌ | ✅ | ✅ | [Notifications.ts](file:///d:/projects/nextacademy/src/collections/Notifications.ts) |
| 22 | `waitlist` | ❌ | 🔒 own | ✅ | ❌ | ❌ | 🔒 own | 🔒 own | ✅ | ❌ | ✅ | [Waitlist.ts](file:///d:/projects/nextacademy/src/collections/Waitlist.ts) |
| 23 | `installment-requests` | ❌ | 🔒 own | ✅ | ❌ | ❌ | 🔒 own | 🔒 own | ✅ | ❌ | ✅ | [InstallmentRequests.ts](file:///d:/projects/nextacademy/src/collections/InstallmentRequests.ts) |
| 24 | `discount-codes` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | [DiscountCodes.ts](file:///d:/projects/nextacademy/src/collections/DiscountCodes.ts) |
| 25 | `leads` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | [Leads.ts](file:///d:/projects/nextacademy/src/collections/Leads.ts) |
| 26 | `crm-sync-events` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | [CrmSyncEvents.ts](file:///d:/projects/nextacademy/src/collections/CrmSyncEvents.ts) |
| 27 | `verification-codes` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | [VerificationCodes.ts](file:///d:/projects/nextacademy/src/collections/VerificationCodes.ts) |
| 28 | `media` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Media.ts](file:///d:/projects/nextacademy/src/collections/Media.ts) |
| 29 | `announcement-bars` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [AnnouncementBars.ts](file:///d:/projects/nextacademy/src/collections/AnnouncementBars.ts) |
| 30 | `blog-posts` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | [BlogPosts.ts](file:///d:/projects/nextacademy/src/collections/BlogPosts.ts) |
| 31 | `popups` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Popups.ts](file:///d:/projects/nextacademy/src/collections/Popups.ts) |
| 32 | `tags` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Tags.ts](file:///d:/projects/nextacademy/src/collections/Tags.ts) |
| 33 | `partners` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [Partners.ts](file:///d:/projects/nextacademy/src/collections/Partners.ts) |
| 34 | `payment-plans` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [PaymentPlans.ts](file:///d:/projects/nextacademy/src/collections/PaymentPlans.ts) |
| 35 | `payment-links` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | [PaymentLinks.ts](file:///d:/projects/nextacademy/src/collections/PaymentLinks.ts) |
| 36 | `upcoming-events-config` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | [UpcomingEventsConfig.ts](file:///d:/projects/nextacademy/src/collections/UpcomingEventsConfig.ts) |

---

## 3. Custom Route RBAC Matrix

| # | Endpoint | Method | Anonymous | User | B2B Manager | Instructor | Admin | Auth Mechanism | Evidence |
|---|----------|--------|-----------|------|-------------|------------|-------|----------------|----------|
| 1 | `/api/auth/google` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | Public | [route.ts](file:///d:/projects/nextacademy/src/app/api/auth/google/route.ts) |
| 2 | `/api/auth/google/callback` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | OAuth state/PKCE | [route.ts](file:///d:/projects/nextacademy/src/app/api/auth/google/callback/route.ts) |
| 3 | `/api/auth/send-otp` | POST | ✅ | ✅ | ✅ | ✅ | ✅ | Public (rate-limited) | [route.ts](file:///d:/projects/nextacademy/src/app/api/auth/send-otp/route.ts) |
| 4 | `/api/auth/verify-otp` | POST | ✅ | ✅ | ✅ | ✅ | ✅ | Public (rate-limited) | [route.ts](file:///d:/projects/nextacademy/src/app/api/auth/verify-otp/route.ts) |
| 5 | `/api/users/login` | POST | ✅ | ✅ | ✅ | ✅ | ✅ | Public | [route.ts](file:///d:/projects/nextacademy/src/app/api/users/login/route.ts) |
| 6 | `/api/google/connect` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | `payload.auth` + role=admin | [route.ts](file:///d:/projects/nextacademy/src/app/api/google/connect/route.ts) |
| 7 | `/api/google/callback` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | OAuth state | [route.ts](file:///d:/projects/nextacademy/src/app/api/google/callback/route.ts) |
| 8 | `/api/b2b/bookings` | GET | ❌ | ❌ | 🔒 company | ❌ | ✅ | `resolveB2BScope` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/bookings/route.ts) |
| 9 | `/api/b2b/dashboard` | GET | ❌ | ❌ | 🔒 company | ❌ | ✅ | `resolveB2BScope` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/dashboard/route.ts) |
| 10 | `/api/b2b/invitations` | GET | ❌ | ❌ | 🔒 company | ❌ | ✅ | `resolveB2BScope` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/invitations/route.ts) |
| 11 | `/api/b2b/invitations` | POST | ❌ | ❌ | 🔒 company | ❌ | ✅ | `resolveB2BScope` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/invitations/route.ts) |
| 12 | `/api/b2b/invitations` | DELETE | ❌ | ❌ | 🔒 company | ❌ | ✅ | `resolveB2BScope` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/invitations/route.ts) |
| 13 | `/api/b2b/invitations/accept` | POST | ❌ | ✅ | ✅ | ✅ | ❌ (blocked) | `payload.auth` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/invitations/accept/route.ts) |
| 14 | `/api/b2b/invitations/validate` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | Public | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/invitations/validate/route.ts) |
| 15 | `/api/b2b/team` | GET | ❌ | ❌ | 🔒 company | ❌ | ✅ | `resolveB2BScope` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/team/route.ts) |
| 16 | `/api/b2b/team` | POST | ❌ | ❌ | 🔒 company | ❌ | ✅ | `resolveB2BScope` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/team/route.ts) |
| 17 | `/api/b2b/team` | DELETE | ❌ | ❌ | 🔒 company | ❌ | ✅ | `resolveB2BScope` | [route.ts](file:///d:/projects/nextacademy/src/app/api/b2b/team/route.ts) |
| 18 | `/api/bookings/create` | POST | ❌ | ✅ | ✅ | ✅ | ✅ | `authenticateRequestUser` + CSRF | [route.ts](file:///d:/projects/nextacademy/src/app/api/bookings/create/route.ts) |
| 19 | `/api/checkout/easykash` | POST | ❌ | ✅ (owner) | ✅ (owner) | ✅ (owner) | ✅ | `authenticateRequestUser` + CSRF | [route.ts](file:///d:/projects/nextacademy/src/app/api/checkout/easykash/route.ts) |
| 20 | `/api/checkout/paymob` | POST | ❌ | ✅ (owner) | ✅ (owner) | ✅ (owner) | ✅ | `authenticateRequestUser` + CSRF | [route.ts](file:///d:/projects/nextacademy/src/app/api/checkout/paymob/route.ts) |
| 21 | `/api/bulk-seats/allocate` | POST | ❌ | ❌ | ✅ | ❌ | ✅ | `payload.auth` + role check | [route.ts](file:///d:/projects/nextacademy/src/app/api/bulk-seats/allocate/route.ts) |
| 22 | `/api/certificates/generate` | POST | ❌ | ❌ | ❌ | ❌ | ✅ | `payload.auth` + admin | [route.ts](file:///d:/projects/nextacademy/src/app/api/certificates/generate/route.ts) |
| 23 | `/api/reviews/moderate` | POST | ❌ | ❌ | ❌ | ❌ | ✅ | `payload.auth` + admin | [route.ts](file:///d:/projects/nextacademy/src/app/api/reviews/moderate/route.ts) |
| 24 | `/api/discount-codes/validate` | POST | ❌ | ✅ | ✅ | ✅ | ✅ | `authenticateRequestUser` + CSRF | [route.ts](file:///d:/projects/nextacademy/src/app/api/discount-codes/validate/route.ts) |
| 25 | `/api/discount-codes/remove` | POST | ❌ | ✅ | ✅ | ✅ | ✅ | `authenticateRequestUser` + CSRF | [route.ts](file:///d:/projects/nextacademy/src/app/api/discount-codes/remove/route.ts) |
| 26 | `/api/instructor/profile` | GET | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/profile/route.ts) |
| 27 | `/api/instructor/profile` | PATCH | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/profile/route.ts) |
| 28 | `/api/instructor/profile/submit` | POST | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/profile/submit/route.ts) |
| 29 | `/api/instructor/availability` | GET | ❌ | ❌ | ❌ | ✅ | ✅ | `payload.auth` + admin/instr | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/availability/route.ts) |
| 30 | `/api/instructor/availability` | PUT | ❌ | ❌ | ❌ | ✅ | ✅ | `payload.auth` + admin/instr | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/availability/route.ts) |
| 31 | `/api/instructor/consultation-types` | GET | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/consultation-types/route.ts) |
| 32 | `/api/instructor/consultation-types` | POST | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/consultation-types/route.ts) |
| 33 | `/api/instructor/consultation-types/[id]` | PATCH | ❌ | ❌ | ❌ | ✅ (owner) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/consultation-types/%5Bid%5D/route.ts) |
| 34 | `/api/instructor/consultation-types/[id]` | DELETE | ❌ | ❌ | ❌ | ✅ (owner) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/consultation-types/%5Bid%5D/route.ts) |
| 35 | `/api/instructor/program-submissions` | GET | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/program-submissions/route.ts) |
| 36 | `/api/instructor/program-submissions` | POST | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/program-submissions/route.ts) |
| 37 | `/api/instructor/program-submissions/[id]` | PATCH | ❌ | ❌ | ❌ | ✅ (owner) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/program-submissions/%5Bid%5D/route.ts) |
| 38 | `/api/instructor/program-submissions/[id]` | DELETE | ❌ | ❌ | ❌ | ✅ (owner) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/program-submissions/%5Bid%5D/route.ts) |
| 39 | `/api/instructor/program-submissions/[id]/submit` | POST | ❌ | ❌ | ❌ | ✅ (owner) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/program-submissions/%5Bid%5D/submit/route.ts) |
| 40 | `/api/instructor/sessions` | GET | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/sessions/route.ts) |
| 41 | `/api/instructor/sessions/[id]/materials` | GET/POST/PATCH | ❌ | ❌ | ❌ | ✅ (linked) | ❌ | `payload.auth` + instructorId | [route.ts](file:///d:/projects/nextacademy/src/app/api/instructor/sessions/%5Bid%5D/materials/route.ts) |
| 42 | `/api/notifications/read-all` | PUT | ❌ | ✅ (own) | ✅ (own) | ✅ (own) | ✅ | `payload.auth` | [route.ts](file:///d:/projects/nextacademy/src/app/api/notifications/read-all/route.ts) |
| 43 | `/api/notifications/[id]/read` | PUT | ❌ | ✅ (own) | ✅ (own) | ✅ (own) | ✅ | `payload.auth` | [route.ts](file:///d:/projects/nextacademy/src/app/api/notifications/%5Bid%5D/read/route.ts) |
| 44 | `/api/home/*` (6 endpoints) | GET | ✅ | ✅ | ✅ | ✅ | ✅ | Public | `home/*/route.ts` |
| 45 | `/api/announcement-bars/active` | GET | ✅ | ✅ | ✅ | ✅ | ✅ (preview) | Optional `payload.auth` | [route.ts](file:///d:/projects/nextacademy/src/app/api/announcement-bars/active/route.ts) |
| 46 | `/api/popups/active` | GET | ✅ | ✅ | ✅ | ✅ | ✅ (preview) | Optional auth | [route.ts](file:///d:/projects/nextacademy/src/app/api/popups/active/route.ts) |
| 47 | `/api/upcoming-events` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | Public | [route.ts](file:///d:/projects/nextacademy/src/app/api/upcoming-events/route.ts) |
| 48 | `/api/webhooks/paymob` | POST | ✅ (HMAC) | — | — | — | — | HMAC Signature | [route.ts](file:///d:/projects/nextacademy/src/app/api/webhooks/paymob/route.ts) |
| 49 | `/api/webhooks/easykash` | POST | ✅ (HMAC) | — | — | — | — | HMAC Signature | [route.ts](file:///d:/projects/nextacademy/src/app/api/webhooks/easykash/route.ts) |
| 50 | `/api/webhooks/*/redirect` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | Public (browser redirect) | `webhooks/*/redirect/route.ts` |
| 51 | `/api/cron/*` (3 endpoints) | GET | ❌ | ❌ | ❌ | ❌ | ❌ | `CRON_SECRET` header | `cron/*/route.ts` |
| 52 | `/api/health` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | Public | [route.ts](file:///d:/projects/nextacademy/src/app/api/health/route.ts) |
| 53 | `/api/health/db` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | `CRON_SECRET` header | [route.ts](file:///d:/projects/nextacademy/src/app/api/health/db/route.ts) |
| 54 | `/api/seed-admin` | POST | ❌ | ❌ | ❌ | ❌ | ❌ | `CRON_SECRET` header | [route.ts](file:///d:/projects/nextacademy/src/app/api/seed-admin/route.ts) |
| 55 | `/api/seed-test-data` | POST | ❌ | ❌ | ❌ | ❌ | ❌ | `CRON_SECRET` header | [route.ts](file:///d:/projects/nextacademy/src/app/api/seed-test-data/route.ts) |
| 56 | `/api/seed-instructors` | POST | ⚠️ ✅ | ⚠️ ✅ | ⚠️ ✅ | ⚠️ ✅ | ⚠️ ✅ | **NONE** | [route.ts](file:///d:/projects/nextacademy/src/app/api/seed-instructors/route.ts) |
| 57 | `/api/seed-partners` | POST | ⚠️ ✅ | ⚠️ ✅ | ⚠️ ✅ | ⚠️ ✅ | ⚠️ ✅ | **NONE** | [route.ts](file:///d:/projects/nextacademy/src/app/api/seed-partners/route.ts) |

---

## 4. RBAC Anomalies & Findings

### 🔴 Critical

| # | Finding | Roles Affected | Evidence |
|---|---------|----------------|----------|
| 1 | **Seed endpoints without auth** — `POST /api/seed-instructors` and `POST /api/seed-partners` are callable by anyone | All (including anonymous) | No auth check in source files |
| 2 | **`blog-posts` overly permissive** — Any authenticated user can create, update, AND delete blog posts | User, B2B, Instructor | `BlogPosts.ts` uses `Boolean(user)` for CUD |
| 3 | **`user-profiles` no ownership enforcement** — `isAuthenticated` for update means any logged-in user can update ANY profile | User, B2B, Instructor | [UserProfiles.ts L9-14](file:///d:/projects/nextacademy/src/collections/UserProfiles.ts#L9-L14) |

### 🟠 High

| # | Finding | Roles Affected | Evidence |
|---|---------|----------------|----------|
| 4 | **`notifications` update = `isAuthenticated`** — Any logged-in user can mark ANY notification as read | User, B2B, Instructor | `Notifications.ts` but custom routes `/api/notifications/*` add ownership checks |
| 5 | **`instructor-program-submissions` is admin-only at Payload level** but custom routes use `payload.auth` with `instructorId` check + `overrideAccess: true` — dual-layer is intentional but creates confusion | Instructor | [InstructorProgramSubmissions.ts](file:///d:/projects/nextacademy/src/collections/InstructorProgramSubmissions.ts) |
| 6 | **`company-invitations` admin-only at Payload level** — All B2B invitation operations go through custom routes that use `overrideAccess: true` | B2B Manager | [CompanyInvitations.ts](file:///d:/projects/nextacademy/src/collections/CompanyInvitations.ts) |
| 7 | **Admins cannot accept invitations** — `acceptCompanyInvitation` explicitly blocks `admin` role | Admin | [company-invitations.ts L260-267](file:///d:/projects/nextacademy/src/lib/company-invitations.ts#L260-L267) |

### 🟡 Medium

| # | Finding | Roles Affected | Evidence |
|---|---------|----------------|----------|
| 8 | **`payments` read uses `isAdminOrOwnerByField('booking.user')`** — requires relational traversal (booking → user) which may be slow | User | `Payments.ts` |
| 9 | **`users` create = `() => true`** — Anyone can create user records via Payload REST API. Intentional for registration but allows mass account creation | Anonymous | [Users.ts L38](file:///d:/projects/nextacademy/src/collections/Users.ts#L38) |
