---
trigger: always_on
---

# Next Academy — Project Rules

> These rules MUST be followed at ALL times when working on this project. **لا يوجد استثناء.**

---

## 🔴 Rule 00: Security First (HIGHEST PRIORITY)

**الأمان فوق كل حاجة — قبل الـ UI، قبل الـ features، قبل الـ performance.**

- كل collection لازم يكون عنده access control قبل ما تبدأ الـ UI
- كل API route لازم يتحقق من الـ role server-side قبل أي عملية
- كل input من اليوزر يتعامل معاه كـ untrusted حتى يتعمله validate وsanitize
- مفيش feature بتعتبرها "done" لو الـ access control ناقص
- لو في conflict بين UX وأمان — **الأمان يكسب دايماً**

---

## 🔵 Rule 00.5: Mobile-First Design (NON-NEGOTIABLE)

**كل UI بيتبنى للموبايل الأول — الـ desktop هو الـ enhancement مش الأساس.**

- ابدأ كل component وكل page بـ mobile layout (320px+)
- استخدم `@media (min-width: ...)` فقط — ممنوع `max-width` media queries
- اختبر كل صفحة على موبايل قبل ما تعتبرها خلصت
- الـ touch targets لازم تكون minimum 44×44px
- مفيش horizontal scroll على موبايل أبداً
- الـ bottom nav للـ dashboards على موبايل/تابلت (مش sidebar)

---

## ⚡ Rule 0: Build Discipline (THE MASTER RULE)

**Before building ANY feature, you MUST run `/build-checklist` workflow.**

This means:
1. **READ** all relevant docs for the feature
2. **THINK** through all scenarios (happy/error/edge cases), dependencies, and side effects using sequential-thinking
3. **LIST** anything you need from the user BEFORE starting
4. **BUILD** in the correct order (schema → access → hooks → validation → API → UI → i18n)
5. **VERIFY** (build passes, dev works, RTL works, mobile works, access control tested)
6. **DOCUMENT** (update changelog, tasks, errors)

**If you skip this, you WILL produce broken code. No exceptions.**

---

## 1. Documentation-First Development (STRICT)

- **CRITICAL:** Before implementing ANY feature, you MUST `view_file` the corresponding docs.
- **Never guess.** The docs have the answer. If a doc doesn't cover it, ASK the user.

| What you're building | Read FIRST |
|---|---|
| Collection change | `docs/architecture/prd.md` (entity table) + `docs/engineering/code-audit.md` |
| UI page | `docs/wireframes/pages/<page>.md` + `docs/design/design-system.md` |
| API route | `docs/engineering/api-contracts.md` + `docs/architecture/data-flow.md` |
| Auth/permissions | `docs/architecture/roles-permissions.md` |
| Payment/booking | `docs/features/payment-scenarios.md` + `docs/architecture/data-flow.md` |
| Email/WhatsApp | `docs/features/automations.md` + `docs/features/email-templates.md` |
| Consultations | PRD §22-26 + sitemap consultation section |
| Certificates/quiz | `docs/features/certificates.md` |
| Reviews/ratings | `docs/features/reviews.md` |
| Security | `docs/security/security.md` + `docs/security/rate-limiting.md` |
| Cron jobs | `docs/features/cron-jobs.md` |
| i18n/RTL | `docs/design/i18n.md` |
| Error handling | `docs/engineering/error-handling.md` |
| Deployment | `docs/engineering/deployment.md` |
| Environment vars | `docs/engineering/env-variables.md` |

---

## 2. Scenario-First Thinking (NEW — MANDATORY)

Before writing ANY logic (hook, API route, page with data), you MUST enumerate:

```
✅ Happy path — what happens when everything works?
❌ Error paths — what happens when it fails? (network, auth, validation, DB)
🔄 Edge cases:
   - Unauthenticated user?
   - Wrong role?
   - Data doesn't exist (404)?
   - Race condition (two users booking last seat)?
   - Malformed input?
   - User refreshes mid-flow?
   - Mobile viewport?
   - Arabic RTL layout?
   - Database connection failure?
🔗 Side effects:
   - Other collections affected?
   - Notifications to trigger?
   - CRM sync needed?
   - Emails/WhatsApp to send?
   - Cron jobs that depend on this?
📥 Dependencies:
   - What collections/APIs/env vars does this need?
   - What features must exist first?
📤 Dependents:
   - What breaks if this changes?
```

---

## 3. Logs Maintenance (CRITICAL)

You MUST update logs **every 5-10 tool calls minimum.** Never let them go stale.

| File | When to update | Format |
|---|---|---|
| `docs/logs/changelog.md` | After EVERY significant change | `### [YYYY-MM-DD HH:MM] - Title` + files + reason | 
| `docs/logs/tasks.md` | When starting `[/]` or finishing `[x]` a task | Mark the item |
| `docs/logs/errors.md` | When encountering and solving an error | Timestamp + error + root cause + fix |
| `docs/logs/plan.md` | When making a plan and tracking progress |
| `docs/logs/sessions/` | After every chat session — full summary of what was done |

---

## 4. Payload CMS Collection Rules (NEW)

When creating or modifying ANY Payload collection:

```
☐ Fields EXACTLY match the PRD table (check field names, types, enums)
☐ Access control defined for ALL 4 operations (read/create/update/delete)
☐ Use helpers from src/lib/access-control.ts
☐ Hooks implemented where business logic is needed
☐ Input validation beyond just `required` (format, range, uniqueness)
☐ Admin labels are clear English (for Payload admin panel)
☐ Relationships use correct `relationTo` slug
☐ Enum options match PRD exactly (copy-paste, don't retype)
☐ Never leave a collection with no access control — this is a SECURITY HOLE
```

---

## 5. Arabic-First, Bilingual Platform

- Default language is **Arabic (RTL).**
- All user-facing strings MUST be in `messages/ar.json` + `messages/en.json`.
- **Never hardcode text in components.** Use `useTranslations()` or `getTranslations()`.
- Test EVERY page with Arabic layout — RTL breaks are unacceptable.

---

## 6. Security Non-Negotiables

- ❌ Never expose API keys or secrets in client-side code.
- ❌ Never use hardcoded fallback secrets (e.g., `process.env.SECRET || 'fallback'`).
- ✅ All protected routes MUST verify `user.role` server-side.
- ✅ All dates stored as **UTC** in PostgreSQL.
- ✅ Installment access gating: overdue users are **blocked** from content.
- ✅ All API routes must have try/catch + proper status codes.
- ✅ Sanitize user inputs before database operations.
- ✅ Use Signed URLs for video content (expire in 2 hours).

---

## 7. Code Quality & Architecture

### TypeScript
- `strict: true`. **No `any` type.** Use `unknown` and narrow with type guards.
- All components must have typed props interfaces.
- Export types separately: `export type { MyType }`.

### React / Next.js
- **Server Components by default.** `'use client'` only when hooks/event handlers needed.
- `loading.tsx` and `error.tsx` for **every** route group.
- `generateMetadata()` for SEO on every public page.
- `next/image` for all images. `next/link` for internal navigation.

### CSS
- **Mobile-First CSS.** Default = mobile, `@media (min-width: ...)` to scale up.
- Never use desktop-first `max-width` media queries.
- CSS Modules (`.module.css`) for component-scoped styles.
- Design tokens from `docs/design/design-system.md`.
- Dark theme is the DEFAULT.

### Testing (NEW)
- **Tests are written WITH each Sprint, not after.**
- Unit tests for: hooks, access control, validation logic.
- Integration tests for: API routes, Payload queries.
- E2E tests (Playwright): critical user flows (Sprint 7).
- Run tests before declaring ANY feature done.

---

## 8. Implementation Order (NEW — MANDATORY)

When building a feature, ALWAYS follow this order:
```
1. Collection schema (fields, types, enums)
2. Access control rules
3. Hooks (beforeChange, afterChange)
4. Input validation
5. API route (if custom endpoint needed)
6. Server-side data fetching (page.tsx)
7. UI components + CSS Modules
8. i18n strings (ar.json + en.json)
9. error.tsx + loading.tsx
10. Tests
```

---

## 9. User Communication Rules (NEW)

- **Batch ALL questions in ONE message.** Never drip-feed questions.
- **Before starting a Sprint:** list everything needed from the user (API keys, config decisions, design clarifications).
- **If you encounter ambiguity:** STOP and ask. Don't assume.
- **If a doc says one thing and code says another:** follow the doc and flag the discrepancy.

---

## 10. File Naming

| Type | Convention | Example |
|---|---|---|
| Components | `kebab-case.tsx` | `program-card.tsx` |
| Styles | `kebab-case.module.css` | `program-card.module.css` |
| API Routes | `kebab-case/route.ts` | `send-reminder/route.ts` |
| Collections | `PascalCase.ts` | `PaymentPlans.ts` |
| Hooks | `camelCase` with `use` prefix | `useBookings.ts` |
| Types | `PascalCase.ts` | `BookingTypes.ts` |
| Lib utilities | `kebab-case.ts` | `access-control.ts` |

---

## 11. Git Discipline

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- One feature per branch.
- Never commit `.env` files.

---

## 🚫 NEVER Do These (10 Deadly Sins)

1. **Never build without reading docs first**
2. **Never modify a collection without checking PRD table**
3. **Never create an API route without checking api-contracts.md**
4. **Never skip access control** on any collection
5. **Never hardcode UI text** — always i18n
6. **Never assume a field type** — check PRD
7. **Never leave `console.log` in production**
8. **Never create a page without `loading.tsx` + `error.tsx`**
9. **Never skip mobile/RTL testing**
10. **Never declare done without updating logs**

---

## Reference Documents

| Doc | Purpose |
|---|---|
| `docs/architecture/prd.md` | Requirements & database schema |
| `docs/architecture/data-flow.md` | Data sources, flows, edge cases |
| `docs/architecture/sitemap.md` | All 56 pages across 11 sections |
| `docs/architecture/roles-permissions.md` | Role-based access matrix (4 roles) |
| `docs/design/design-system.md` | Colors, fonts, spacing, components |
| `docs/design/i18n.md` | Arabic/English, RTL rules |
| `docs/design/accessibility.md` | WCAG 2.1 AA compliance |
| `docs/design/performance.md` | Core Web Vitals, bundles |
| `docs/features/payment-scenarios.md` | Payment flows, failures, refunds |
| `docs/features/certificates.md` | Quiz + certificate generation |
| `docs/features/reviews.md` | Ratings, moderation |
| `docs/features/automations.md` | Email/WhatsApp/Calendar triggers |
| `docs/features/email-templates.md` | 31 emails + 10 WhatsApp + 14 in-app |
| `docs/features/cron-jobs.md` | 14 scheduled tasks |
| `docs/features/video-protection.md` | DRM, watermarks, signed URLs |
| `docs/features/platform-features.md` | Search, PWA, Sales, Errors |
| `docs/security/security.md` | Auth, IDOR, XSS, CSRF |
| `docs/security/rate-limiting.md` | Per-endpoint limits |
| `docs/security/data-privacy.md` | GDPR, data retention |
| `docs/engineering/api-contracts.md` | All API endpoints spec |
| `docs/engineering/code-audit.md` | Current code gaps & fixes needed |
| `docs/engineering/error-handling.md` | Error codes & strategies |
| `docs/engineering/testing-strategy.md` | Test plan |
| `docs/engineering/env-variables.md` | Environment variables |
| `docs/engineering/deployment.md` | Infrastructure & checklist |
| `docs/engineering/monitoring.md` | Logging & alerts |
| `docs/wireframes/pages/` | UI structure per page |
| `.agents/workflows/development.md` | Tech stack & code conventions |
| `.agents/workflows/build-checklist.md` | Pre-build checklist (MUST RUN) |
