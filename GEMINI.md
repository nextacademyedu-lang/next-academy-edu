# GEMINI.md — Next Academy Agent Rules

> هذا الملف هو مرجعك الأساسي. اقرأه في بداية كل session.
> This is your primary reference. Read it at the start of every session.

---

## 🔴 RULE 1: Read Docs BEFORE Coding (ZERO EXCEPTIONS)

**You MUST `view_file` the relevant doc BEFORE writing ANY code.**

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
| **Deployment** | **`docs/engineering/coolify-deployment.md`** ← PRIMARY |
| Environment vars | `docs/engineering/env-variables.md` |

**If the doc doesn't cover it → ASK the user. Never guess.**

---

## 🔴 RULE 2: Update Logs EVERY Time (MANDATORY)

After EVERY significant change (every 5–10 tool calls minimum), update:

| File | When | Format |
|---|---|---|
| `docs/logs/changelog.md` | After EVERY significant change | `### [YYYY-MM-DD HH:MM] - Title` + files + reason |
| `docs/logs/tasks.md` | When starting `[/]` or finishing `[x]` a task | Mark the item |
| `docs/logs/errors.md` | When encountering and solving an error | Timestamp + error + root cause + fix |

**If you complete work without updating logs, the work is NOT done.**

---

## 🔴 RULE 3: Run /build-checklist Before Every Feature

Before building ANY feature, run the `/build-checklist` workflow:
1. READ docs
2. THINK (happy/error/edge cases, dependencies, side effects)
3. LIST questions for user (batch ALL in one message)
4. BUILD in order: schema → access → hooks → validation → API → UI → i18n
5. VERIFY (build, dev, RTL, mobile, access control)
6. DOCUMENT (update changelog, tasks, errors)

---

## ⚙️ Tech Stack

- **Framework:** Next.js 15 (App Router + Server Components)
- **CMS:** Payload CMS 3.0 (embedded inside Next.js)
- **Database:** PostgreSQL (Docker in Coolify production)
- **ORM:** Drizzle ORM (via Payload adapter)
- **Language:** TypeScript strict (NO `any`)
- **Styling:** Vanilla CSS + CSS Modules (NO Tailwind)
- **Package Manager:** pnpm
- **Deployment:** Coolify (Docker Compose on VPS)
- **i18n:** next-intl (Arabic RTL default)

---

## 🏗️ Deployment: Coolify (NOT Vercel)

**CRITICAL:** This project deploys via **Coolify** (self-hosted Docker Compose).

**Always read:** `docs/engineering/coolify-deployment.md`

Key rules:
- `Dockerfile` must use multi-stage build (base → deps → builder → runner)
- Healthcheck: `node -e "fetch(...)..."` — NOT `curl` or `wget`
- `docker-compose.yml` services: app, postgres, redis, nginx
- Test `pnpm build` locally before pushing
- Environment variables go in Coolify UI, NOT in `.env` files on server

---

## 🔒 Security Non-Negotiables

- ❌ Never expose API keys in client-side code
- ❌ Never use hardcoded fallback secrets
- ✅ All protected routes verify `user.role` server-side
- ✅ All dates stored as UTC in PostgreSQL
- ✅ All API routes have try/catch + proper status codes
- ✅ Sanitize all user inputs

---

## 📝 Code Quality

- `strict: true` — NO `any` type
- Server Components by default — `'use client'` only when needed
- `loading.tsx` + `error.tsx` for every route group
- Mobile-first CSS (default = mobile, `@media (min-width)` to scale up)
- Dark theme is DEFAULT
- CSS Modules for component styles
- Design tokens from `docs/design/design-system.md`

---

## 🌍 Arabic-First, Bilingual

- Default language: **Arabic (RTL)**
- All UI text in `messages/ar.json` + `messages/en.json`
- Never hardcode text — use `useTranslations()` or `getTranslations()`
- Test every page with Arabic RTL layout

---

## 📁 File Naming

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

## 📋 Implementation Order (ALWAYS)

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

## 🗂️ Reference Documents

| Doc | Purpose |
|---|---|
| `docs/architecture/prd.md` | Requirements & database schema |
| `docs/architecture/data-flow.md` | Data sources, flows, edge cases |
| `docs/architecture/sitemap.md` | All 56 pages across 11 sections |
| `docs/architecture/roles-permissions.md` | Role-based access matrix (4 roles) |
| `docs/design/design-system.md` | Colors, fonts, spacing, components |
| `docs/design/i18n.md` | Arabic/English, RTL rules |
| `docs/features/payment-scenarios.md` | Payment flows, failures, refunds |
| `docs/features/automations.md` | Email/WhatsApp/Calendar triggers |
| `docs/features/email-templates.md` | 31 emails + 10 WhatsApp + 14 in-app |
| `docs/features/cron-jobs.md` | 14 scheduled tasks |
| `docs/security/security.md` | Auth, IDOR, XSS, CSRF |
| `docs/engineering/api-contracts.md` | All API endpoints spec |
| `docs/engineering/code-audit.md` | Current code gaps & fixes needed |
| `docs/engineering/coolify-deployment.md` | **Coolify deployment rules (PRIMARY)** |
| `docs/engineering/env-variables.md` | Environment variables |
| `docs/wireframes/pages/` | UI structure per page |
| `.agents/workflows/build-checklist.md` | Pre-build checklist (MUST RUN) |
| `.agents/workflows/development.md` | Tech stack & code conventions |
| `docs/logs/changelog.md` | Change history |
| `docs/logs/tasks.md` | Task tracker |
| `docs/logs/errors.md` | Error history |

---

## 🚫 10 Deadly Sins

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
