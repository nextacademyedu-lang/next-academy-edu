# Next Academy — Task Tracker

This file tracks the overarching phases and microscopic tasks for project completion.

**Rule:** Every completed task must append the completion timestamp `(Done: YYYY-MM-DD HH:MM)` next to it.

## Phase 1: Planning & Documentation (✅ COMPLETE - 2026-03-05 01:00)

- [x] Draft PRD & Architecture Stack. `(Done: 2026-03-04 19:20)`
- [x] Create comprehensive Sitemap (50+ Pages). `(Done: 2026-03-04 19:22)`
- [x] Define global Design System (Corporate dark theme). `(Done: 2026-03-04 23:55)`
- [x] Map detailed User Data Flow. `(Done: 2026-03-04 19:21)`
- [x] Construct Markdown wireframes for all pages individually. `(Done: 2026-03-04 23:45)`
- [x] Roles & Permissions (4 roles). `(Done: 2026-03-05 00:15)`
- [x] Automations (Email, WhatsApp, Calendar, In-App). `(Done: 2026-03-05 00:28)`
- [x] Labels & Broadcasts. `(Done: 2026-03-05 00:31)`
- [x] Certificates (Quiz-based). `(Done: 2026-03-05 01:00)`
- [x] i18n, Reviews, Refunds, Search, PWA, Sales, Error Pages. `(Done: 2026-03-05 00:39)`
- [x] 5 Edge Cases (Guest redirect, Installment access, Waitlist cascade, UTC, Quiz). `(Done: 2026-03-05 01:00)`
- [x] Project Rules & Workflows. `(Done: 2026-03-05 01:09)`
- [x] Documentation Gap Fill (15 files: security, payments, error-handling, API contracts, etc). `(Done: 2026-03-13 04:00)`
- [x] Email Templates, Cron Jobs, Video Protection docs. `(Done: 2026-03-13 14:17)`
- [x] Docs reorganization (28 files → 6 subdirectories) + API contracts expansion + Code Audit report. `(Done: 2026-03-13 14:31)`

## Phase 2: Core Setup & Shared UI (✅ COMPLETE)

- [x] Docker Compose for local PostgreSQL.
- [x] Scaffold Next.js 15 + Payload CMS 3.0 with pnpm.
- [x] Configure globals.css with Design System tokens (CSS Variables).
- [x] Setup i18n (next-intl, Arabic default).
- [x] Build global layouts (Navbar + Footer + Sidebar).
- [x] Develop UI atoms (Button, Input, Card, Badge, Label).
- [x] Setup Payload CMS collections — 27 collections complete:
  - Users, UserProfiles, Programs, Rounds, Sessions, Bookings, Payments, PaymentPlans, PaymentLinks
  - Instructors, InstructorBlockedDates, Companies, Tags, Categories, Media
  - Notifications, DiscountCodes, InstallmentRequests, Reviews, Certificates
  - ConsultationTypes, ConsultationAvailability, ConsultationSlots, ConsultationBookings
  - Waitlist, Leads, VerificationCodes

## Phase 2.5: Foundation Fixes (✅ COMPLETE)

- [x] Renamed proxy.ts to correct convention for Next.js 16.
- [x] Fixed instructor layout params (removed duplicate NextIntlClientProvider + old params syntax).
- [x] Added loading.tsx + error.tsx for all route groups (locale, dashboard, instructor, auth, checkout).
- [x] Populated ar.json + en.json with all existing UI string keys.
- [x] Updated Navbar, Footer, Hero, Featured, B2BTrusted, InstructorsPreview, BlogsPreview to use useTranslations.
- [x] Fixed duplicate `color` property bug in instructor/sessions/page.tsx.

## Sprint 0: Security Fix (✅ COMPLETE - 2026-07-15 10:00)

- [x] Access Control fix for 5 vulnerable collections (Reviews, Certificates, InstructorBlockedDates, PaymentLinks, Waitlist).

## Phase 3: Public Website (✅ COMPLETE)

- [x] Homepage (Hero, Stats, Featured Programs, Why Choose Us, B2B, Instructors Preview, Blog, Testimonials).
- [x] Programs/Workshops/Courses Listings.
- [x] Program Detail Page.
- [x] Instructor Directory & Profiles.
- [x] About, Contact, Blog, Legal Pages (Privacy, Terms, Refund Policy).
- [x] Carousels (Embla) for Featured Programs, Instructors, Testimonials, Blog.
- [x] Framer Motion animations + GSAP Text Reveal.
- [x] Glassmorphism cards, grid background, radial fade effects.

## Phase 4: Auth & Onboarding (✅ COMPLETE)

- [x] Login page. `(Done: 2026-03-13)`
- [x] Register page. `(Done: 2026-03-13)`
- [x] Forgot Password page. `(Done: 2026-03-13)`
- [x] Reset Password page. `(Done: 2026-03-13)`
- [x] Verify Email (OTP) page + double-submit race condition fix. `(Done: 2026-03-14 05:05)`
- [x] Multi-step Onboarding wizard (3 steps + i18n + premium CSS). `(Done: 2026-07-15 14:00)`
- [x] Signup redirect fix (stale cookie → dashboard bug). `(Done: 2026-07-15 14:30)`
- [x] Middleware/Proxy conflict resolution (Next.js 16). `(Done: 2026-03-13 18:45)`
- [x] Payload CMS Auth integration (email + password backend wiring). `(Done: 2026-03-13)`
- [x] Google OAuth setup. `(Done: 2026-07-15 16:30)`
- [x] Resend Email Adapter. `(Done: 2026-07-15 16:30)`
- [ ] Redirect persistence after login (return to original page).

## Phase 5: Dashboard Ecosystems (🟡 BACKEND WIRING IN PROGRESS)

### User Dashboard
- [x] Dashboard layout + routing structure.
- [x] Overview page (stats, recent activity).
- [x] Bookings page + "Browse Courses" button.
- [x] Payments & Installments tracker page.
- [x] Profile Settings page (responsive, stacks on mobile).
- [x] Mobile responsive (bottom nav on tablet/mobile).
- [x] Floating "Back to Site" button.
- [/] Connect to Payload CMS APIs (real data) — plan written `(Started: 2026-03-14 08:20)`
  - [ ] Create `dashboard-api.ts` fetch helpers
  - [ ] Wire DashboardLayout to `useAuth()` (replace MOCK_USER)
  - [ ] Wire Overview page to real data
  - [ ] Wire Bookings page to real data
  - [ ] Wire Payments page to real data
  - [ ] Wire Profile page to real data (save + password change)
- [ ] Notifications page.

### Instructor Portal
- [x] Instructor layout + navigation.
- [x] Overview page (stats, upcoming sessions, recent consultations).
- [x] Sessions management page.
- [x] Availability page (weekly hours, date overrides).
- [x] Consultation Types management page.
- [x] Consultation Bookings page.
- [ ] Connect to Payload CMS APIs (real data).

### B2B Manager Dashboard
- [ ] B2B layout + navigation.
- [ ] Team management page.
- [ ] Bulk seat allocation page.
- [ ] Company stats page.

### Checkout
- [x] Checkout flow page (`/checkout/:id`).
- [x] Pay in Full (Card & Wallet via Paymob, Fawry & Aman via EasyKash).
- [x] Installments (valU & Next Academy Manual Installment).
- [ ] Connect to payment gateway APIs.

## Phase 6: Backend & Collections Logic

- [ ] Installment Plans + Payment Gate logic (overdue = blocked).
- [ ] Waitlist collection + cascade cron (24h expiry → auto-notify next).
- [ ] Labels & Broadcasts collections + broadcast composer.
- [ ] Certificates + Quiz collections + QR verification.
- [ ] Reviews collection logic (moderation workflow).

## Phase 7: Integrations

- [ ] Paymob (Checkout + Webhooks).
- [ ] Resend (Email templates — 31 emails).
- [ ] Evolution API (WhatsApp — 10 messages).
- [ ] Google Calendar/Meet API (auto-create events).
- [ ] Twenty CRM Sync.
- [ ] Bunny.net/Cloudflare Stream (Video CDN + Signed URLs).

## Phase 8: Polish & Launch

- [ ] Error pages (404, 500, Maintenance).
- [ ] PWA manifest + Service Worker.
- [ ] Global Search.
- [ ] Guided Onboarding Tour (driver.js).
- [ ] GA4 integration.
- [ ] E2E Testing (Playwright).
- [ ] Mobile responsiveness audit.
- [ ] Production deployment (Vercel).
