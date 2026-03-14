# ✅ Next Academy — Task Tracker

> كل task خلصت لازم يكون جنبها timestamp: `(Done: YYYY-MM-DD HH:MM)`

---

## 📌 Legend

| Icon | المعنى |
|---|---|
| ✅ | Phase مكتملة |
| 🔄 | Phase شغالة دلوقتي |
| ⏳ | Phase جاية |
| ☐ | Task لسه |
| ☑ | Task خلصت |

---

## ✅ Phase 1: Planning & Documentation — (Done: 2026-03-05 01:00)

| | Task | Done |
|---|---|---|
| ☑ | Draft PRD & Architecture Stack | 2026-03-04 19:20 |
| ☑ | Sitemap (50+ Pages) | 2026-03-04 19:22 |
| ☑ | Design System (Corporate dark theme) | 2026-03-04 23:55 |
| ☑ | User Data Flow | 2026-03-04 19:21 |
| ☑ | Markdown wireframes لكل الصفحات | 2026-03-04 23:45 |
| ☑ | Roles & Permissions (4 roles) | 2026-03-05 00:15 |
| ☑ | Automations (Email, WhatsApp, Calendar, In-App) | 2026-03-05 00:28 |
| ☑ | Labels & Broadcasts | 2026-03-05 00:31 |
| ☑ | Certificates (Quiz-based) | 2026-03-05 01:00 |
| ☑ | i18n, Reviews, Refunds, Search, PWA, Sales, Error Pages | 2026-03-05 00:39 |
| ☑ | 5 Edge Cases | 2026-03-05 01:00 |
| ☑ | Project Rules & Workflows | 2026-03-05 01:09 |
| ☑ | Documentation Gap Fill (15 files) | 2026-03-13 04:00 |
| ☑ | Email Templates, Cron Jobs, Video Protection docs | 2026-03-13 14:17 |
| ☑ | Docs reorganization + API contracts + Code Audit | 2026-03-13 14:31 |

---

## ✅ Phase 2: Core Setup & Shared UI — COMPLETE

| | Task |
|---|---|
| ☑ | Docker Compose for local PostgreSQL |
| ☑ | Scaffold Next.js 16 + Payload CMS 3.0 with pnpm |
| ☑ | globals.css — Design System tokens (CSS Variables) |
| ☑ | i18n (next-intl, Arabic default) |
| ☑ | Global layouts (Navbar + Footer + Sidebar) |
| ☑ | UI atoms (Button, Input, Card, Badge, Label) |
| ☑ | 27 Payload CMS collections |

**Collections:**
> Users, UserProfiles, Programs, Rounds, Sessions, Bookings, Payments, PaymentPlans, PaymentLinks, Instructors, InstructorBlockedDates, Companies, Tags, Categories, Media, Notifications, DiscountCodes, InstallmentRequests, Reviews, Certificates, ConsultationTypes, ConsultationAvailability, ConsultationSlots, ConsultationBookings, Waitlist, Leads, VerificationCodes

---

## ✅ Phase 2.5: Foundation Fixes — COMPLETE

| | Task |
|---|---|
| ☑ | proxy.ts convention fix (Next.js 16) |
| ☑ | Instructor layout params fix |
| ☑ | loading.tsx + error.tsx لكل route groups |
| ☑ | ar.json + en.json — كل UI string keys |
| ☑ | useTranslations في Navbar, Footer, Hero, Featured, B2BTrusted, InstructorsPreview, BlogsPreview |
| ☑ | TypeScript fix — duplicate `color` property |

---

## ✅ Sprint 0: Security Fix — (Done: 2026-07-15 10:00)

| | Task |
|---|---|
| ☑ | Access Control لـ 5 collections (Reviews, Certificates, InstructorBlockedDates, PaymentLinks, Waitlist) |

---

## ✅ Phase 3: Public Website — COMPLETE

| | Task |
|---|---|
| ☑ | Homepage (Hero, Stats, Featured, Why Choose Us, B2B, Instructors, Blog, Testimonials) |
| ☑ | Programs / Workshops / Courses Listings |
| ☑ | Program Detail Page |
| ☑ | Instructor Directory & Profiles |
| ☑ | About, Contact, Blog, Legal Pages |
| ☑ | Carousels (Embla) |
| ☑ | Framer Motion + GSAP Text Reveal |
| ☑ | Glassmorphism + grid background + radial fade |

---

## ✅ Phase 4: Auth & Onboarding — COMPLETE

| | Task | Done |
|---|---|---|
| ☑ | Login page | 2026-03-13 |
| ☑ | Register page | 2026-03-13 |
| ☑ | Forgot Password page | 2026-03-13 |
| ☑ | Reset Password page | 2026-03-13 |
| ☑ | Verify Email (OTP) + race condition fix | 2026-03-14 05:05 |
| ☑ | Multi-step Onboarding wizard (3 steps + i18n + CSS) | 2026-07-15 14:00 |
| ☑ | Signup redirect fix (stale cookie bug) | 2026-07-15 14:30 |
| ☑ | Middleware/Proxy conflict fix (Next.js 16) | 2026-03-13 18:45 |
| ☑ | Payload CMS Auth integration | 2026-03-13 |
| ☑ | Google OAuth | 2026-07-15 16:30 |
| ☑ | Resend Email Adapter | 2026-07-15 16:30 |
| ☑ | Redirect persistence after login | — |

---

## ✅ Phase 5: Dashboard Ecosystems — COMPLETE

### 👤 User Dashboard

| | Task | Done |
|---|---|---|
| ☑ | Layout + routing structure | — |
| ☑ | Overview page (stats, recent activity) | — |
| ☑ | Bookings page + "Browse Courses" button | — |
| ☑ | Payments & Installments tracker | — |
| ☑ | Profile Settings (responsive, mobile stack) | — |
| ☑ | Mobile responsive (bottom nav) | — |
| ☑ | Floating "Back to Site" button | — |
| ☑ | `dashboard-api.ts` fetch helpers | 2026-07-15 18:30 |
| ☑ | Wire DashboardLayout → `useAuth()` | 2026-07-15 18:30 |
| ☑ | Wire Overview → real data | 2026-07-15 18:30 |
| ☑ | Wire Bookings → real data | 2026-07-15 18:30 |
| ☑ | Wire Payments → real data | 2026-07-15 18:30 |
| ☑ | Wire Profile → real data + save + password | 2026-07-15 18:30 |
| ☑ | Notifications page | 2026-07-15 20:00 |

### 🎓 Instructor Portal

| | Task | Done |
|---|---|---|
| ☑ | Layout + navigation | — |
| ☑ | Overview page | — |
| ☑ | Sessions management page | — |
| ☑ | Availability page | — |
| ☑ | Consultation Types page | — |
| ☑ | Consultation Bookings page | — |
| ☑ | Wire to Payload CMS APIs (real data) | 2026-07-15 20:00 |

### 🏢 B2B Manager Dashboard

| | Task |
|---|---|
| ☑ | Layout + navigation | 2026-07-15 21:00 |
| ☑ | Team management page | 2026-07-15 21:00 |
| ☑ | Company stats (Overview page) | 2026-07-15 21:00 |
| ☑ | Bookings page | 2026-07-15 21:00 |
| ☐ | Bulk seat allocation page |

### 💳 Checkout

| | Task |
|---|---|
| ☑ | Checkout flow page (`/checkout/:id`) |
| ☑ | Pay in Full (Paymob + EasyKash) |
| ☑ | Installments (valU + Manual) |
| ☑ | Connect to payment gateway APIs — Paymob + EasyKash | 2026-07-16 02:00 |
| ☑ | End-to-end payment test (Paymob card + EasyKash Fawry) | 2026-07-16 15:00 |
| ☑ | Fix Paymob API key + integration IDs | 2026-07-16 15:00 |
| ☑ | Seed test data via SQL (Program + Round + Booking + Payment) | 2026-07-16 15:00 |

---

## 🐙 GitHub

| | Task | Done |
|---|---|---|
| ☑ | Create repo `next-academy-edu` على `nextacademyedu-lang` | 2026-07-15 19:00 |
| ☑ | Initial commit + push (274 files) | 2026-07-15 19:00 |

---

## ✅ Sprint 1: Security Hardening — (Done: 2026-07-16)

| | Task | Done |
|---|---|---|
| ☑ | HSTS + CSP headers في `next.config.ts` | 2026-07-16 |
| ☑ | إضافة `/b2b-dashboard` + `/onboarding` لـ `PROTECTED_PATTERNS` | 2026-07-16 |
| ☑ | Rate limiting على `/api/users/login` (10 req/min per IP) | 2026-07-16 |
| ☑ | إزالة `NEXT_PUBLIC_BASE_URL=http://localhost:3000` من `.env` | 2026-07-16 |
| ☑ | Discount code server-side validation API route | 2026-07-16 |
| ☑ | Wire discount validation في checkout page | 2026-07-16 |
| ☑ | Navbar auth state (show/hide login buttons) | 2026-07-16 |

---

## ✅ Sprint 1: Security Hardening — (Done: 2026-07-16)

| | Task | Done |
|---|---|---|
| ☑ | HSTS + CSP headers في `next.config.ts` | 2026-07-16 |
| ☑ | إضافة `/b2b-dashboard` + `/onboarding` لـ `PROTECTED_PATTERNS` | 2026-07-16 |
| ☑ | Rate limiting على `/api/users/login` (10 req/min per IP بـ ioredis) | 2026-07-16 |
| ☑ | إزالة `NEXT_PUBLIC_BASE_URL` من `.env` | 2026-07-16 |
| ☑ | Discount code server-side validation | 2026-07-16 |
| ☑ | Wire discount validation في checkout page | 2026-07-16 |
| ☑ | Navbar auth-aware (show/hide login buttons) | 2026-07-16 |

---

## ✅ Sprint 2: VPS Docker Setup — (Done: 2026-07-16)

| | Task | Done |
|---|---|---|
| ☑ | `Dockerfile` — multi-stage build | 2026-07-16 |
| ☑ | `docker-compose.yml` — postgres + redis + app + nginx + certbot | 2026-07-16 |
| ☑ | `nginx/nginx.conf` — reverse proxy + SSL | 2026-07-16 |
| ☑ | `.env.production.template` | 2026-07-16 |
| ☑ | `next.config.ts` — `output: standalone` | 2026-07-16 |
| ☑ | `ioredis` للـ rate limiting على VPS | 2026-07-16 |

---

## ✅ Phase 6: Backend & Collections Logic — (Done: 2026-07-16)

| | Task | Done |
|---|---|---|
| ☑ | `src/lib/email.ts` — transactional email utility (Resend) | 2026-07-16 |
| ☑ | Booking confirmation email بعد الدفع (Paymob + EasyKash webhooks) | 2026-07-16 |
| ☑ | `src/app/api/bookings/create/route.ts` — booking creation + installments | 2026-07-16 |
| ☑ | Installment Plans — create N payment records عند الحجز | 2026-07-16 |
| ☑ | `src/app/api/cron/check-overdue/route.ts` — overdue payments + access block | 2026-07-16 |
| ☑ | Payment reminders (3 days before due date) | 2026-07-16 |
| ☑ | `src/app/api/cron/waitlist/route.ts` — notify next in line + 24h expiry | 2026-07-16 |
| ☑ | `src/app/api/reviews/moderate/route.ts` — approve/flag/remove + recalc rating | 2026-07-16 |
| ☑ | `src/app/api/certificates/generate/route.ts` — generate + unique code | 2026-07-16 |
| ☑ | `src/app/[locale]/certificates/[code]/page.tsx` — public verification page | 2026-07-16 |

---

## ⏳ Phase 7: Integrations

| | Task |
|---|---|
| ☑ | Paymob (Checkout + Webhooks) | 2026-07-16 |
| ☐ | Resend (31 email templates) |
| ☐ | Evolution API (WhatsApp — 10 messages) |
| ☐ | Google Calendar/Meet API |
| ☐ | Twenty CRM Sync |
| ☐ | Bunny.net / Cloudflare Stream (Video CDN + Signed URLs) |

---

## ⏳ Phase 8: Polish & Launch

| | Task |
|---|---|
| ☐ | Error pages (404, 500, Maintenance) |
| ☐ | PWA manifest + Service Worker |
| ☐ | Global Search |
| ☐ | Guided Onboarding Tour (driver.js) |
| ☐ | GA4 integration |
| ☐ | E2E Testing (Playwright) |
| ☐ | Mobile responsiveness audit |
| ☐ | Production deployment (Vercel) |
