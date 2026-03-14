# Next Academy — Project Changelog

All notable changes to this project will be documented in this file. Format ensures accountability by requiring exact timestamps (YYYY-MM-DD HH:MM).

## [Unreleased] - Updated as of 2026-07-15

### [2026-07-15 18:30] - Phase 5: Dashboard Backend Wiring — Complete

- الملفات اللي اتعدّلت:
  - `src/lib/dashboard-api.ts` — [NEW] Typed fetch helpers for Overview, Bookings, Payments, Profile (GET + PATCH)
  - `src/app/[locale]/(dashboard)/dashboard/layout.tsx` — ربط `useAuth()` بدل `MOCK_USER`؛ avatar initials + logout
  - `src/app/[locale]/(dashboard)/dashboard/page.tsx` — Overview بيجيب stats + next sessions + حضور من API
  - `src/app/[locale]/(dashboard)/dashboard/bookings/page.tsx` — Bookings grid بيجيب البوكينجز الحقيقية مع progress bars و next session
  - `src/app/[locale]/(dashboard)/dashboard/payments/page.tsx` — Payments page بـ tabs: Active Installments + Payment History
  - `src/app/[locale]/(dashboard)/dashboard/profile/page.tsx` — Profile بيجيب بيانات اليوزر ويحدثها + change password عبر API
- وصف مختصر: ربطنا كل صفحات الـ dashboard بـ Payload CMS APIs الحقيقية عبر API helper layer (`dashboard-api.ts`). الـ DashboardLayout بيستخدم `useAuth()` بدل MOCK_USER. كل الصفحات الأربعة بتجيب بياناتها live من `/api/...` endpoints. TypeScript build يعدي بـ exit code 0 بدون أخطاء.
- **حالة:** ✅ Phase 5 مكتملة — كل الـ dashboard wired للـ backend

### [2026-07-15 17:30] - Fix: Normalize access-control imports across all collections

- الملفات اللي اتعدّلت:
  - `src/collections/Waitlist.ts` — `@/lib/access-control` → `../lib/access-control.ts`
  - `src/collections/Reviews.ts` — same fix
  - `src/collections/PaymentLinks.ts` — same fix
  - `src/collections/InstructorBlockedDates.ts` — same fix
  - `src/collections/Certificates.ts` — same fix
- وصف مختصر: 5 collections were using `@/lib/access-control` alias without `.ts` extension while 22 used `../lib/access-control.ts`. Normalized all to relative path with `.ts` extension to prevent future importMap regeneration failures.

### [2026-07-15 17:00] - Fix: Payload Build Errors (importMap + serverFunction)

- الملفات اللي اتعدّلت:
  - `src/app/importMap.js` — renamed from `.ts` → `.js` (empty file, no TS needed)
  - `src/payload-types.ts` — regenerated via `npx payload generate:types`
  - 13 collection files in `src/collections/` — added `.ts` extension to `access-control` imports
  - `src/app/(payload)/layout.tsx` — added `serverFunction` prop with `'use server'` wrapper
- وصف مختصر: حل خطأين في الـ build:
  1. **importMap error**: الملف كان فاضي وبدون exports. حل: إعادة توليد الأنواع + تسمية الملف `.js` + إضافة `.ts` extension لكل imports من `access-control` في 13 collection
  2. **serverFunction error**: Payload 3.79.0 يحتاج `serverFunction` prop جديد على `RootLayout`. حل: إنشاء server action wrapper مع `handleServerFunctions` + `config` + `importMap`
- **حالة:** Build ناجح ✅ (exit code 0, 32 routes generated)

### [2026-03-14 08:20] - Phase 5: Dashboard Backend Wiring — Planning

- الملفات اللي اتعدّلت:
  - `docs/logs/tasks.md` — Updated Phase 4 as COMPLETE, marked Phase 5 backend wiring as IN PROGRESS with sub-tasks
  - `docs/logs/changelog.md` — Added this entry
  - Implementation plan written (artifact) for 6 files: 1 new (`dashboard-api.ts`) + 5 modifications (DashboardLayout + 4 dashboard pages)
- وصف مختصر: بدأنا Phase 5 — تحليل الكود بيز (collections, auth context, dashboard pages, proxy) وكتبنا implementation plan لربط الـ 4 صفحات dashboard بـ Payload CMS APIs الحقيقية. الخطة تشمل: إنشاء `dashboard-api.ts` fetch helpers، ربط DashboardLayout بـ `useAuth()` بدل MOCK_USER، وتحديث Overview, Bookings, Payments, Profile pages.
- **حالة:** خطة مكتوبة — في انتظار التنفيذ

### [2026-07-15 16:30] - Phase 4: Resend Email Adapter + Google OAuth

- الملفات اللي اتعدّلت:
  - `src/lib/resend-adapter.ts` — [NEW] Resend email adapter implementing Payload's EmailTransportAdapter
  - `src/payload.config.ts` — Wired `resendAdapter` into Payload `email` config
  - `src/app/api/auth/google/route.ts` — [NEW] Google OAuth entry point (redirects to Google consent screen)
  - `src/app/api/auth/google/callback/route.ts` — [NEW] Google OAuth callback (token exchange, user find-or-create, JWT)
  - `src/collections/Users.ts` — Added `googleId` text field
  - `src/lib/auth-api.ts` — Added `redirectToGoogle()` convenience helper
  - `src/app/[locale]/(auth)/login/page.tsx` — Wired Google social button onClick
  - `src/app/[locale]/(auth)/register/page.tsx` — Wired Google social button onClick
- وصف مختصر: Task 1: أنشأنا Resend adapter بيستخدم REST API مع type safety كامل. Task 2: أنشأنا Google OAuth flow كامل — entry route بيعمل redirect لـ Google consent screen، والـ callback بيعمل token exchange وبيعمل find-or-create للـ user وبيولد JWT باستخدام Node.js crypto (بدون أي deps جديدة). الـ Google buttons اتربطت في login و register pages.
- **Env vars مطلوبة:** `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### [2026-03-14 05:05] - Fix: OTP Double-Submit Race Condition

- الملفات اللي اتعدّلت:
  - `src/app/[locale]/(auth)/verify-email/page.tsx` — أضفنا `verifyingRef` (ref-based lock) لمنع الـ handleVerify من الاستدعاء المزدوج
- وصف مختصر: الـ auto-submit كان بينادي `handleVerify` لما كل الأرقام تتملي، وبعدين لو اليوزر دوس الزر handleVerify بتتنادي تاني. المرة الأولى بتنجح وبتعمل mark used للكود، والمرة التانية بتلاقي الكود مستخدم فبتقول "الرمز غلط". الحل: ref-based lock بيمنع الاستدعاء المتزامن.

### [2026-07-15 14:30] - Fix: Signup redirects to /ar/dashboard instead of register page

- الملفات اللي اتعدّلت:
  - `src/proxy.ts` — شيلنا الـ blind redirect من auth routes عشان الـ middleware كان بيوثق بـ stale cookies
  - `src/app/[locale]/(auth)/login/page.tsx` — أضفنا client-side auth check وصلحنا type error في `result.user`
- وصف مختصر: الـ middleware كان بيشوف `payload-token` cookie وبيعمل redirect لـ `/dashboard` حتى لو الـ user اتمسح من الداتابيز. الحل: شيلنا الـ server-side redirect من auth routes وخلينا الـ pages تتعامل مع الحالة دي client-side عن طريق الـ auth context.

### [2026-03-13 18:45] - Fix: Middleware/Proxy Conflict (Next.js 16)
- الملفات اللي اتعدّلت:
  - `src/proxy.ts` — دمج كل لوجيك auth + i18n من middleware.ts
  - `src/middleware.ts` — [DELETED] ملغي عشان Next.js 16 بيرفض وجود الاتنين
- وصف مختصر: Next.js 16 عمل deprecate لـ middleware.ts وبيطلب proxy.ts بس. تم نقل كل اللوجيك (route protection, auth redirects, i18n) لـ proxy.ts وحذف middleware.ts. السيرفر شغال تمام.

### [2026-07-15 14:00] - Sprint 4: Onboarding i18n + Premium CSS Redesign
- الملفات اللي اتعدّلت:
  - `src/app/[locale]/(auth)/onboarding/page.tsx` — Rewrote with `useTranslations('Auth')`, all hardcoded English replaced with i18n keys
  - `src/app/[locale]/(auth)/onboarding/onboarding.module.css` — [DELETED] Duplicate removed; importing from component-level module
  - `src/components/onboarding/step-1.tsx` — Added `useTranslations('Auth')` for all labels/placeholders/options
  - `src/components/onboarding/step-2.tsx` — Added `useTranslations('Auth')` for all labels/placeholders/options
  - `src/components/onboarding/step-3.tsx` — Added `useTranslations('Auth')` for all labels/placeholders/options
  - `src/components/onboarding/onboarding.module.css` — Premium CSS overhaul: radial gradient backgrounds, glowing stepper dots, glassmorphism card, animated tag chips, micro-interactions
- وصف مختصر: تحويل كامل للـ onboarding: i18n عربي/إنجليزي بدون أي نص hardcoded، حذف CSS مكرر، تصميم premium dark بتأثيرات glass و glow و animations. صفر أخطاء TypeScript جديدة.

### [2026-07-15 11:30] - Sprint 4: Multi-Step Onboarding Wizard
- الملفات اللي اتعدّلت:
  - `src/app/[locale]/(auth)/onboarding/page.tsx` — [NEW] Main 3-step wizard orchestrator with framer-motion animations
  - `src/app/[locale]/(auth)/onboarding/onboarding.module.css` — [NEW] Dark-themed stepper styles matching auth layout
  - `src/components/onboarding/step-1.tsx` — [NEW] Professional Info (title, job, field, experience)
  - `src/components/onboarding/step-2.tsx` — [NEW] Company & Location (company, size, type, country, city)
  - `src/components/onboarding/step-3.tsx` — [NEW] Learning Goals (tag chips for interests, goals textarea, how-did-you-hear)
- وصف مختصر: Onboarding wizard كامل 3 خطوات. Progress dots, animated transitions, tag chip selection للاهتمامات, skip functionality. الـ page بتعمل create/update لـ UserProfiles عبر Payload API مع onboardingCompleted=true. صفر أخطاء TypeScript جديدة.

### [2026-07-15 10:00] - Sprint 0: Access Control Fix for 5 Vulnerable Collections
- الملفات اللي اتعدّلت:
  - `src/collections/Reviews.ts` — added access: public read, auth create, owner/admin update, admin delete
  - `src/collections/Certificates.ts` — added access: owner/admin read, admin create/update/delete
  - `src/collections/InstructorBlockedDates.ts` — added access: instructor-owner + admin for all ops
  - `src/collections/PaymentLinks.ts` — added access: admin-only for all CRUD
  - `src/collections/Waitlist.ts` — added access: owner/admin read, auth create, admin update/delete
- وصف مختصر: 5 collections كانوا بدون access control = security hole. تم إضافة access control باستخدام helpers من `src/lib/access-control.ts`. Build passes بدون أخطاء جديدة.

### [2026-03-13 14:31] - 3-Phase: Organize Docs + Verify APIs + Code Audit
- الملفات اللي اتعدّلت:
  - **Phase 1:** نقل 28 docs file في 6 subdirectories: `architecture/`, `design/`, `features/`, `security/`, `engineering/`, `business/`. أنشأنا `docs/README.md` index. سمّينا `Design System.md` → `design-system.md`
  - **Phase 2:** `docs/engineering/api-contracts.md` — أضفنا 8 sections جديدة (Reviews, Certificates, Blog, PaymentLinks, B2B, Onboarding, Instructors, Cron auth) + pagination spec + field name mapping appendix. 411 → 749 سطر
  - **Phase 3:** `docs/engineering/code-audit.md` — تقرير audit شامل لـ 21 collection: access control, hooks, validation, missing fields, 5 collections ناقصة, config security issues, + roadmap


### Added

### [2026-03-13 04:00] - Comprehensive Documentation Gap Fill (15 Files)
- الملفات اللي اتعدّلت:
  - **12 ملف جديد:** `docs/security.md`, `docs/payment-scenarios.md`, `docs/error-handling.md`, `docs/api-contracts.md`, `docs/rate-limiting.md`, `docs/testing-strategy.md`, `docs/env-variables.md`, `docs/deployment.md`, `docs/monitoring.md`, `docs/accessibility.md`, `docs/performance.md`, `docs/data-privacy.md`
  - **3 ملفات اتوسّعت:** `docs/reviews.md` (32→170 سطر), `docs/i18n.md` (40→200 سطر), `docs/Design System.md` (167→577 سطر)
- وصف مختصر: تم إنشاء كل الملفات الناقصة في التوثيق بناءً على تحليل شامل للمشروع. يغطي: الأمان، سيناريوهات الدفع، معالجة الأخطاء، عقود API، Rate Limiting، استراتيجية الاختبار، متغيرات البيئة، النشر، المراقبة، إمكانية الوصول، الأداء، وخصوصية البيانات.

### [2026-03-13 14:17] - Round 2: Email Templates, Cron Jobs, Video Protection + Sitemap Fix
- الملفات اللي اتعدّلت:
  - **3 ملفات جديدة:** `docs/email-templates.md` (31 email + 10 WhatsApp + 14 in-app), `docs/cron-jobs.md` (14 cron job), `docs/video-protection.md`
  - **ملف اتحدّث:** `docs/sitemap.md` → أضفنا 9 صفحات ناقصة (consultations, certificates, B2B dashboard)
- وصف مختصر: مراجعة نهائية كشفت عن 3 ملفات ناقصة و9 صفحات مش موجودة في الخريطة.

- **[2026-03-05 01:48] Phase 3 Completed (Static Pages)**: Implemented Next.js routes and layout components for `/about`, `/contact`, `/blog`, `/privacy`, `/terms`, and `/refund-policy`. Adjusted `globals.css` to permanently mount the target brand colors (`#C51B1B`, `#020504`, etc).

- **[2026-03-05 01:30] Directory Architecture Standardized**: Moved all Next.js App Router files (`app/`, `i18n/`, `messages/`, and `proxy.ts` / `middleware.ts`) into `src/` to comply with project rules. Updated `tsconfig.json` path aliases (`@/*` to `./src/*`).

- **[2026-03-05 01:00] 5 Edge Case Fixes**: (1) Guest redirect persisted through onboarding steps. (2) Installment access blocking (overdue = no live/recordings) + admin override + auto-cancel installments on refund. (3) Waitlist cascade cron (24h expiry → next user auto-notified). (4) UTC timezone storage convention. (5) Quiz-based certificate eligibility (admin quiz builder in Payload CMS).

- **[2026-03-05 00:48] Platform Features Update**: Added 3 new critical sections to `platform-features.md`: In-App Live Streaming (Zoom Web SDK integration for PWA), Backup & Disaster Recovery Strategy (3-tier), and Guided Onboarding Tour (driver.js tooltips).

- **[2026-03-05 00:39] 10 Platform Features Batch**: Certificates (custom per program, 11 fields, QR verification), i18n (Arabic RTL + English), Admin Analytics (GA4 + 8 dashboard sections), Reviews & Ratings, Refund Flow (user request → admin approve/reject with reason), Global Search, PWA, Sales Attribution & Referral, 13 Email Templates, Error Pages (404/500/Maintenance).
- **[2026-03-05 00:31] Labels & Broadcast System (`admin-labels-broadcasts.md`)**: User labeling/tagging system (6 auto + manual types) with targeted broadcast messaging across Email, WhatsApp, and In-App. 4-step broadcast composer with merge tags and scheduling.

- **[2026-03-05 00:19] Protected Video Playback**: Documented secure content delivery system (Signed URLs + Dynamic Watermark + No Download) for session recordings across `data-flow.md`, `booking-details.md`, and `session-details.md`.
- **[2026-03-05 00:15] Roles & Permissions (`docs/roles-permissions.md`)**: Full matrix documenting 4 user roles (`user`, `b2b_manager`, `instructor`, `admin`) with detailed capabilities, role assignment flow, and Employee Churn rules.
- **[2026-03-05 00:10] B2B Advanced Scenarios**: Added Waitlists, Company-Specific Promo Codes, B2B HR Dashboard wireframe, and Employee Churn logic.
- **[2026-03-05 00:06] Companies Collection**: Added `Companies` entity to `data-flow.md` with autocomplete search onboarding flow. Created `admin-companies.md` wireframe.
- **[2026-03-04 23:55] Design System (`docs/Design System.md`)**: Fully rewritten to match "Corporate Dark Mode" Almentor reference styling utilizing specific semantic colors (`#020504` background, `#C51B1B` primary red, `#D6A32B` secondary gold, `#F1F6F1` text-primary, `#C5C5C5` text-secondary). Removed neon styling.
- **[2026-03-04 23:45] Wireframes (`docs/wireframes/pages/`)**: Automatically generated 47 fully distinct markdown wireframe documents detailing the layout of every single page in the project grouped into functional directories.
- **[2026-03-04 19:22] Sitemap (`docs/sitemap.md`)**: Comprehensive structure mapped with 47 functional pages across 10 sections.
- **[2026-03-04 19:20] PRD (`docs/prd.md`)**: Complete product requirements defining the B2B tech stack (Next.js 15, Payload CMS, Twenty CRM, Resend, Paymob).
- **[2026-03-04 19:21] Data Flow (`docs/data-flow.md`)**: Detailed entity definitions, states, and data flow map for system logic.
- **[2026-03-04 19:24] Project Structure**: Initiated `create-next-app` to set up the foundational repository skeleton.
- **[2026-03-04 23:25] MCP Configurations**: Added `html-to-design` to the AI's integrations list for Figma imports.

- **[2026-07-14] Foundation Fixes Batch**: (1) Renamed proxy.ts back to correct convention for Next.js 16 (v16 uses `proxy` not `middleware`). (2) Fixed instructor layout — removed duplicate NextIntlClientProvider and old Next.js 14 params syntax. (3) Added loading.tsx + error.tsx to all 5 route groups (locale root, dashboard, instructor, auth, checkout). (4) Fully populated ar.json + en.json with all UI string keys across Nav, Footer, Hero, Stats, Featured, WhyChooseUs, B2B, Instructors, Blogs, Dashboard, Instructor portal, Auth, Common namespaces. (5) Updated 7 components to use useTranslations/getTranslations — zero hardcoded strings remaining in layout and homepage sections. (6) Fixed duplicate `color` property TypeScript error in instructor sessions page. Build passes cleanly.

- **[2026-03-04 23:51] Homepage UX**: Refined the homepage wireframe structure to include components specifically for Corporate Training (B2B Lead Gen), an Upcoming Events Carousel, and a Blog Insights section.
- **[2026-03-04 23:33] MCP Syntax Fix**: Fixed MCP configuration regex parsing error preventing Figma server connection.

### Planned

- **Frontend Development:** Begin converting the layout structures into reusable React/Next.js UI components.
- **Supabase/Postgres Configuration:** Setup actual database schemas aligned with the data flow documentation.
- **Payload CMS Integration:** Build the Admin panel collections inside Payload mapped to our specific 15 Admin pages.
- [x] Added Blogs Preview Section to Homepage
- [x] Redesigned Footer to match DevStudio mockup with watermark
- [x] Added Framer Motion lazy scroll and parallax animations to all Homepage sections
- [x] Animated Stats section numbers from zero on scroll using Framer Motion
- [x] Updated Why Choose Us section with strong copy and GSAP Text Reveal animation
- [x] Fixed CSS variable scoping in Why Choose Us to allow cascading changes
\n- [x] Converted Featured Programs, Meet Our Experts, Graduate Success Stories, and Latest Insights sections into interactive Carousels using Embla
\n- [x] Moved Carousel controls to the side of elements and added Center Scaling to the active card.
\n- [x] Fixed carousel configuration to support infinite loop and added vertical padding to prevent scaled active cards from clipping.
\n- [x] Duplicated Carousel arrays and applied startIndex to prevent infinite loop rewinding and fix initial selected center positioning.
\n- [x] Fixed carousel overlap by applying scale transforms selectively to inner cards and enforcing layout scale bounding via Embla padding strategy.
\n- [x] Added  linear gradient to all carousels to create a smooth blurred fade effect on the left and right edges instead of a sharp cutoff.
\n- [x] Refactored Why Choose Us section to use lucide-react vector icons absolutely positioned overlapping the cards instead of inline emojis.
\n- [x] Refactored Why Choose Us section to feature a grid background + radial fade, with cards upgraded to use premium glassmorphism.
\n- [x] Transferred grid+radial background and heavier liquid glass card styling to Marquee Testimonials section as requested.
\n- [x] Redesigned Instructor styling in `instructors-preview` to be a minimal, borderless, photo-forward card.
\n- [x] Fixed `/login` and `/register` routing 404s by correctly mapping Next-Intl middleware logic and updating route groups.
\n- [x] Implemented Student Dashboard Layout and routing structure.\n- [x] Added User Dashboard Overview page.\n- [x] Added Bookings Page.\n- [x] Added Payments & Installments Tracker Page.\n- [x] Added Profile Settings Page.
\n- [x] Fixed contrast ratio across the dashboard application by updating `--text-muted` from near-black to a legible gray and replacing dark overlay colors on cards with subtle white opacities.
\n- [x] Designed and implemented the programmatic checkout flow mimicking the provided reference, supporting EasyKash / Paymob / digital wallets inside `/checkout/:id`.
\n- [x] Refactored checkout UI to precisely match PRD specifications, including separate segments for Pay in Full (Card & Wallet via Paymob, Fawry & Aman via EasyKash) and Installments (valU & Next Academy Manual Installment).
\n- [x] Converted User Dashboard UI to be mobile-responsive by replacing the side sidebar with a bottom navigation bar on tablet and mobile viewports.
\n- [x] Refactored Profile Settings Page layout to use , converting it from a fixed grid into a responsive view that stacks perfectly on mobile.
\n- [x] Added persistent floating 'Back to Site' button across the user dashboard.
- [x] Inserted prominent 'Browse Courses' navigation button to the Bookings page header.
\n## [Unreleased] - 2026-03-05\n- [x] Added complete Instructor Portal section under `/instructor` route group.\n- [x] Implemented `InstructorLayout` for portal navigation.\n- [x] Created `/instructor` overview page with stats, upcoming sessions, and recent consultations.\n- [x] Created `/instructor/sessions` for managing workshop and course rounds.\n- [x] Created `/instructor/availability` for setting weekly hours and date overrides.\n- [x] Created `/instructor/consultation-types` for managing offered 1-on-1 services.\n- [x] Created `/instructor/bookings` for reviewing and managing student consultation bookings.
