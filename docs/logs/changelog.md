# 📋 Next Academy — Changelog

> كل التغييرات المهمة بتتسجل هنا. الفورمات: `### [YYYY-MM-DD HH:MM] - العنوان`

---

## 🚧 [Unreleased] — آخر تحديث: 2026-07-18

---

### [2026-03-15 09:58] - Fix: Add /privacy-policy redirect for branding verification

- الملفات اللي اتعدّلت: `next.config.ts`
- **المشكلة:** Google branding verification بيفشل لأن `/privacy-policy` بيرجع 404 — الصفحة موجودة على `/privacy`
- **الحل:** إضافة Next.js redirects في `next.config.ts`: `/privacy-policy` → `/en/privacy` و `/:locale/privacy-policy` → `/:locale/privacy`

### [2026-07-18 09:47] - Fix: Create BlogPosts Collection (Blog Page Server Error)
- الملفات اللي اتعدّلت: `src/collections/BlogPosts.ts` (🆕), `src/payload.config.ts`, `src/payload-types.ts`
- **المشكلة:** Blog pages (`/blog` + `/blog/[slug]`) كانوا بيعملوا server error لأن collection `blog-posts` مكانتش موجودة في Payload
- **الحل:** إنشاء `BlogPosts` collection بـ fields: title, slug, excerpt, content (richText), category, featuredImage, author, tags, status, publishedAt + تسجيلها في `payload.config.ts` + regenerate types

---

### [2026-07-17 16:00] - Security Fixes: IDOR, Headers, Error Leak, Docker
- الملفات اللي اتعدّلت: `Users.ts`, `nginx.conf`, `proxy.ts`, `checkout/paymob/route.ts`, `Dockerfile`
- **Critical Fix**: Users collection `update` access changed from `isAuthenticated` → `isAdminOrSelf` (IDOR)
- **High Fix**: Added 6 security headers to nginx (HSTS, X-Frame-Options, CSP, X-Content-Type-Options, Referrer-Policy, server_tokens off)
- **High Fix**: Added security headers to `proxy.ts` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) — deleted conflicting `middleware.ts`
- **High Fix**: Paymob checkout error leak — now returns generic message, logs details server-side
- **Low Fix**: Added `HEALTHCHECK` to Dockerfile for container health monitoring
- **Verified OK**: docker-compose uses env vars (no hardcoded secrets), email.ts FROM address is display name not a secret

---

### [2026-07-17 14:00] - Deep Security & Code Audit
- الملفات اللي اتراجعت: All 27 Payload collections, access-control.ts, auth-api.ts, payment-api.ts, rate-limit.ts, email.ts, resend-email-adapter.ts, checkout/paymob/route.ts, checkout/easykash/route.ts, cron/check-overdue/route.ts, cron/waitlist/route.ts, webhooks/paymob/route.ts, webhooks/easykash/route.ts, docker-compose.yml, nginx/nginx.conf
- **Critical**: Users collection `update` access uses `isAuthenticated` — IDOR vulnerability (any user can update any other user)
- **High**: Missing security headers in nginx (HSTS, CSP, X-Frame-Options, etc.)
- **High**: No Next.js middleware.ts for route protection
- **High**: Users `read` access exposes all user records to any authenticated user
- **Medium**: PAYLOAD_SECRET in Docker build args, console.log in prod, no rate limiting on checkout, hardcoded phone fallback
- Full report: [walkthrough.md](../../.gemini/antigravity/brain/7b117a1f-0242-44d1-bb95-f9a7350e9ce3/walkthrough.md)

---

### ✅ [2026-07-16 17:00] — Security Hardening + VPS Docker Setup

| الملف | التغيير |
|---|---|
| `next.config.ts` | 🔧 HSTS + CSP headers + `output: standalone` |
| `src/proxy.ts` | 🔧 حماية `/b2b-dashboard` + `/onboarding` |
| `src/lib/rate-limit.ts` | 🆕 ioredis sliding window rate limiter + in-memory fallback |
| `src/app/api/users/login/route.ts` | 🆕 Rate-limited login (10 req/min per IP) |
| `src/app/api/discount-codes/validate/route.ts` | 🆕 Server-side discount validation |
| `src/components/layout/Navbar.tsx` | 🔧 Auth-aware — show/hide login buttons |
| `Dockerfile` | 🆕 Multi-stage production build |
| `docker-compose.yml` | 🔧 كامل: postgres + redis + app + nginx + certbot |
| `nginx/nginx.conf` | 🆕 Reverse proxy + SSL termination |
| `.env.production.template` | 🆕 Production env template |

---

### ✅ [2026-07-16 15:00] — Payment Gateway Testing & Bug Fixes

| الملف | التغيير |
|---|---|
| `src/app/.../checkout/[bookingId]/page.tsx` | 🔧 Fix booking ID type mismatch (number vs string) |
| `src/lib/dashboard-api.ts` | 🔧 إضافة `discountAmount` لـ `PayloadBooking` type |
| `src/lib/payment-api.ts` | 🔧 تغيير `Authorization: Token` → `Bearer` للـ Paymob key الجديد |
| `src/app/api/checkout/paymob/route.ts` | 🔧 إرجاع actual error message بدل generic message |
| `scripts/seed-test-payment.sql` | 🆕 SQL seed script لبيانات الاختبار |
| `.env` | 🔧 تصحيح `PAYMOB_API_KEY` + تصحيح integration IDs + تحديث ngrok URL |

**نتيجة الاختبار:**
- Paymob card payment → 3DS → Approved ✅
- EasyKash Fawry voucher → pending page ✅
- HMAC verification على الـ webhooks ✅

---

### ✅ [2026-07-16 02:00] — Payment Gateway Integration (Paymob + EasyKash)

| الملف | التغيير |
|---|---|
| `src/lib/payment-api.ts` | 🆕 Shared types + Paymob Intention API + EasyKash Cash API + HMAC verification |
| `src/app/api/checkout/paymob/route.ts` | 🆕 POST — ينشئ Paymob Intention → يرجع redirect URL |
| `src/app/api/checkout/easykash/route.ts` | 🆕 POST — ينشئ EasyKash Cash voucher (Fawry/Aman) |
| `src/app/api/webhooks/paymob/route.ts` | 🆕 POST — HMAC verify → amount check → confirm booking |
| `src/app/api/webhooks/paymob/redirect/route.ts` | 🆕 GET — Paymob redirect handler → success/pending/failed |
| `src/app/api/webhooks/easykash/route.ts` | 🆕 POST — HMAC verify → amount check → confirm booking |
| `src/app/.../checkout/[bookingId]/page.tsx` | 🔄 Wired لـ real APIs — بيجيب بيانات الحجز الحقيقية |
| `src/app/.../checkout/success/page.tsx` | 🆕 Success page بعد كارت/محفظة |
| `src/app/.../checkout/pending/page.tsx` | 🆕 Pending page — voucher + copy button + خطوات فوري/أمان |
| `src/app/.../checkout/failed/page.tsx` | 🆕 Failed page — retry + واتساب |
| `docs/engineering/env-variables.md` | 🔄 إضافة `PAYMOB_PUBLIC_KEY` + `EASYKASH_API_TOKEN` + `EASYKASH_HMAC_SECRET` |

**الـ Flow:**
- كارت/محفظة → Paymob Intention API → Unified Checkout → webhook → confirmed
- فوري/أمان → EasyKash Cash API → voucher page → يدفع في الفرع → webhook → confirmed

**Testing:**
- ngrok tunnel: `https://97f9-41-36-59-214.ngrok-free.app`
- Webhooks tested locally — HMAC rejection ✅
- Paymob + EasyKash callbacks updated in dashboards ✅

---

---

### ✅ [2026-07-15 21:00] — B2B Manager Dashboard

| الملف | التغيير |
|---|---|
| `src/lib/b2b-api.ts` | 🆕 Typed fetch helpers للـ B2B dashboard |
| `src/components/b2b/B2BLayout.tsx` | 🆕 Sidebar layout مع nav + logout |
| `src/app/.../b2b-dashboard/page.tsx` | 🆕 Overview — stats + team + recent bookings |
| `src/app/.../b2b-dashboard/team/page.tsx` | 🆕 Team members table + search |
| `src/app/.../b2b-dashboard/bookings/page.tsx` | 🆕 Bookings + filter (all/upcoming/completed) |
| `src/app/../(b2b)/layout.tsx` | 🆕 Route group layout |
| `src/app/../(b2b)/loading.tsx` + `error.tsx` | 🆕 Loading + error boundaries |

---

### ✅ [2026-07-15 20:00] — Notifications Page + Instructor Portal Backend Wiring

| الملف | التغيير |
|---|---|
| `src/lib/instructor-api.ts` | 🆕 Typed fetch helpers للـ instructor portal |
| `src/app/.../dashboard/notifications/page.tsx` | 🆕 Notifications page — real data + mark read + mark all read |
| `src/app/.../instructor/page.tsx` | 🔄 Wire لـ real sessions + consultations بدل mock |
| `src/app/.../instructor/sessions/page.tsx` | 🔄 Wire لـ real sessions + search |
| `src/app/.../instructor/bookings/page.tsx` | 🔄 Wire لـ real consultation bookings + approve/decline |
| `src/app/.../instructor/availability/page.tsx` | 🔄 Wire لـ real availability + blocked dates (add/delete) |

---

### ✅ [2026-07-15 19:00] — GitHub Repository Setup + Initial Push

| | |
|---|---|
| 📁 **ملف جديد** | `.gitignore` — يستثني `node_modules/`, `.next/`, `.env*`, `*.tsbuildinfo`, `client_secret_*.json` |
| 🔗 **Repo** | https://github.com/nextacademyedu-lang/next-academy-edu (private) |
| 📦 **Commit** | `feat: initial commit — Next Academy platform scaffold` (274 ملف) |
| 🌿 **Branch** | `main` |

---

### ✅ [2026-07-15 18:30] — Phase 5: Dashboard Backend Wiring

| الملف | التغيير |
|---|---|
| `src/lib/dashboard-api.ts` | 🆕 Typed fetch helpers للـ Overview, Bookings, Payments, Profile |
| `src/components/dashboard/DashboardLayout.tsx` | 🔄 ربط `useAuth()` بدل `MOCK_USER` + avatar + logout |
| `src/app/.../dashboard/page.tsx` | 🔄 Overview بيجيب stats + next sessions من API |
| `src/app/.../dashboard/bookings/page.tsx` | 🔄 Bookings grid بالبيانات الحقيقية + progress bars |
| `src/app/.../dashboard/payments/page.tsx` | 🔄 Payments بـ tabs: Active Installments + History |
| `src/app/.../dashboard/profile/page.tsx` | 🔄 Profile بيجيب بيانات اليوزر + save + change password |

**النتيجة:** TypeScript build ✅ exit code 0 — كل الـ dashboard wired للـ backend

---

### 🔧 [2026-07-15 17:30] — Fix: Normalize Access-Control Imports

| | |
|---|---|
| 📁 **الملفات** | `Waitlist.ts`, `Reviews.ts`, `PaymentLinks.ts`, `InstructorBlockedDates.ts`, `Certificates.ts` |
| ❌ **المشكلة** | 5 collections كانوا بيستخدموا `@/lib/access-control` بدون `.ts` |
| ✅ **الحل** | Normalize لـ `../lib/access-control.ts` في كل الـ 27 collection |

---

### 🔧 [2026-07-15 17:00] — Fix: Payload Build Errors (importMap + serverFunction)

| المشكلة | الحل |
|---|---|
| `importMap` error — ملف فاضي بدون exports | Rename `.ts` → `.js` + regenerate types + إضافة `.ts` extension لـ 13 collection |
| `serverFunction` error — Payload 3.79.0 يحتاج prop جديد | إضافة `serverFunction` wrapper مع `'use server'` على `RootLayout` |

**النتيجة:** Build ✅ — 32 routes generated

---

### ✅ [2026-07-15 16:30] — Phase 4: Resend Email Adapter + Google OAuth

| الملف | التغيير |
|---|---|
| `src/lib/resend-adapter.ts` | 🆕 Resend adapter بـ REST API + type safety |
| `src/payload.config.ts` | 🔄 Wire `resendAdapter` في Payload email config |
| `src/app/api/auth/google/route.ts` | 🆕 Google OAuth entry point |
| `src/app/api/auth/google/callback/route.ts` | 🆕 Token exchange + find-or-create user + JWT |
| `src/collections/Users.ts` | 🔄 إضافة `googleId` field |
| `src/app/.../login/page.tsx` | 🔄 Wire Google button |
| `src/app/.../register/page.tsx` | 🔄 Wire Google button |

> ⚠️ **Env vars مطلوبة:** `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

### 🔧 [2026-03-14 05:05] — Fix: OTP Double-Submit Race Condition

| | |
|---|---|
| 📁 **الملف** | `src/app/[locale]/(auth)/verify-email/page.tsx` |
| ❌ **المشكلة** | `handleVerify` بتتنادي مرتين (auto-submit + manual) → الكود يتعمل mark used → "الرمز غلط" |
| ✅ **الحل** | `verifyingRef` — ref-based lock يمنع الاستدعاء المتزامن |

---

### 🔧 [2026-07-15 14:30] — Fix: Signup Redirects to Dashboard Instead of Register

| | |
|---|---|
| 📁 **الملفات** | `src/proxy.ts`, `src/app/.../login/page.tsx` |
| ❌ **المشكلة** | Middleware كان بيشوف `payload-token` stale cookie ويعمل redirect لـ `/dashboard` |
| ✅ **الحل** | شيل الـ server-side redirect من auth routes + client-side auth check في login page |

---

### 🔧 [2026-03-13 18:45] — Fix: Middleware/Proxy Conflict (Next.js 16)

| | |
|---|---|
| 📁 **الملفات** | `src/proxy.ts` (دمج), `src/middleware.ts` (🗑️ محذوف) |
| ❌ **المشكلة** | Next.js 16 بيرفض وجود `middleware.ts` و`proxy.ts` مع بعض |
| ✅ **الحل** | نقل كل اللوجيك (auth + i18n + route protection) لـ `proxy.ts` وحذف `middleware.ts` |

---

### ✅ [2026-07-15 14:00] — Sprint 4: Onboarding i18n + Premium CSS Redesign

| الملف | التغيير |
|---|---|
| `src/app/.../onboarding/page.tsx` | 🔄 `useTranslations('Auth')` — صفر hardcoded text |
| `src/components/onboarding/step-1.tsx` | 🔄 i18n كامل |
| `src/components/onboarding/step-2.tsx` | 🔄 i18n كامل |
| `src/components/onboarding/step-3.tsx` | 🔄 i18n كامل |
| `src/components/onboarding/onboarding.module.css` | 🔄 Premium CSS: radial gradient + glassmorphism + glow animations |
| `src/app/.../onboarding/onboarding.module.css` | 🗑️ حذف duplicate |

---

### ✅ [2026-07-15 11:30] — Sprint 4: Multi-Step Onboarding Wizard

| الملف | التغيير |
|---|---|
| `src/app/.../onboarding/page.tsx` | 🆕 3-step wizard orchestrator + framer-motion |
| `src/components/onboarding/step-1.tsx` | 🆕 Professional Info |
| `src/components/onboarding/step-2.tsx` | 🆕 Company & Location |
| `src/components/onboarding/step-3.tsx` | 🆕 Learning Goals + tag chips |

---

### ✅ [2026-07-15 10:00] — Sprint 0: Access Control Fix (5 Collections)

| Collection | Access Control المضاف |
|---|---|
| `Reviews.ts` | Public read, auth create, owner/admin update, admin delete |
| `Certificates.ts` | Owner/admin read, admin create/update/delete |
| `InstructorBlockedDates.ts` | Instructor-owner + admin لكل العمليات |
| `PaymentLinks.ts` | Admin-only لكل CRUD |
| `Waitlist.ts` | Owner/admin read, auth create, admin update/delete |

---

### 📁 [2026-03-13 14:31] — 3-Phase: Docs Organize + API Verify + Code Audit

| Phase | التغيير |
|---|---|
| Phase 1 | نقل 28 ملف لـ 6 subdirectories + `docs/README.md` index |
| Phase 2 | `api-contracts.md` — إضافة 8 sections جديدة (411 → 749 سطر) |
| Phase 3 | `code-audit.md` — تقرير شامل لـ 21 collection |

---

### 📁 [2026-03-13 04:00] — Documentation Gap Fill (15 Files)

> أنشأنا 12 ملف جديد + وسّعنا 3 ملفات موجودة

| الملفات الجديدة |
|---|
| `security.md`, `payment-scenarios.md`, `error-handling.md`, `api-contracts.md` |
| `rate-limiting.md`, `testing-strategy.md`, `env-variables.md`, `deployment.md` |
| `monitoring.md`, `accessibility.md`, `performance.md`, `data-privacy.md` |

---

### ✅ [2026-07-15 14:00] — Sprint 4: Foundation Fixes Batch

| Fix | التفاصيل |
|---|---|
| proxy.ts convention | Renamed لـ Next.js 16 convention |
| Instructor layout | حذف duplicate `NextIntlClientProvider` + old params syntax |
| loading/error pages | إضافة لكل 5 route groups |
| ar.json + en.json | Populated بكل UI string keys |
| useTranslations | Updated في 7 components — صفر hardcoded strings |
| TypeScript fix | حذف duplicate `color` property في instructor sessions |

---

### ✅ [2026-03-05 01:00] — Phase 3: Static Pages

> تم تنفيذ routes و layout components لـ `/about`, `/contact`, `/blog`, `/privacy`, `/terms`, `/refund-policy`
> تثبيت brand colors في `globals.css` (`#C51B1B`, `#020504`)

---
