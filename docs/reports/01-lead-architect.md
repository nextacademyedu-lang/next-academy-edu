# Lead Architect Audit Report

**Agent:** 01 — Lead Architect  
**Date:** 2026-04-16  
**Persona:** Senior software architect (15+ years, ex-Shopify/Vercel)

---

## Executive Summary

Next Academy is a well-structured monolithic Next.js 15 + Payload CMS 3.0 application with 40+ Payload collections, 27 API route groups, and a mature cron/webhook/CRM sync layer. The co-located architecture (Payload embedded inside Next.js) is pragmatic at this stage but introduces coupling risks at scale. The system shows strong domain modeling but has critical infrastructure fragility (Neon free tier, Railway CRM), missing atomicity in payment flows, and no CI/CD pipeline. **Architecture is solid for launch but requires hardening before scaling past ~500 concurrent users.**

---

## Architecture Overview (Current State)

```
┌──────────────────────────────────────────────────────────────┐
│                       Vercel (Next.js 15)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ App Router│  │ Payload  │  │ API      │  │ Cron Jobs    │ │
│  │ (SSR/SSG)│  │ CMS 3.0  │  │ Routes   │  │ (3 groups)   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │              │             │               │          │
│       └──────────────┴─────────────┴───────────────┘          │
│                           │                                    │
├───────────────────────────┼────────────────────────────────────┤
│                    PostgreSQL (Neon)                           │
│                    40+ tables via Payload                      │
└───────────────────────────┼────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────▼──┐  ┌──────▼──┐  ┌───────▼─────┐
    │ Twenty CRM │  │ Paymob  │  │ EasyKash    │
    │ (Railway)  │  │ Gateway │  │ (Fawry/Aman)│
    └────────────┘  └─────────┘  └─────────────┘
              │
    ┌─────────▼─────────┐
    │ Resend (Email)    │
    │ R2/S3 (Media)     │
    │ Google Calendar   │
    └───────────────────┘
```

### Key Architecture Decisions
- **40 Payload collections** mapped to PostgreSQL tables (Users, Bookings, Payments, Programs, Rounds, Sessions, etc.)
- **Co-located CMS**: Payload runs inside the same Next.js process — no separate CMS server
- **CRM sync via event queue**: `CrmSyncEvents` collection acts as an async outbox for Twenty CRM
- **Dual payment gateways**: Paymob (card/wallet) + EasyKash (Fawry/Aman cash)
- **next-intl** for Arabic-first i18n with RTL support
- **Google Calendar integration** for session management

---

## Critical Issues (P0/P1)

### P0-ARCH-001: Neon Free Tier for Production Database
- **File:** `payload.config.ts:299-307`
- **Risk:** Neon free tier auto-pauses after 5 minutes of inactivity. Cold starts add 2-5s latency. Connection limits are severely constrained (~100 connections). No SLA, no guaranteed uptime.
- **Impact:** First visitor after idle period gets 2-5s page load. Payment webhooks may timeout during cold start. Cron jobs may fail silently.
- **Recommendation:** Upgrade to Neon Pro ($19/mo) or switch to a managed PostgreSQL with guaranteed uptime.

### P0-ARCH-002: No Database Transaction Atomicity in Payment Flows
- **File:** `src/lib/payment-helper.ts`
- **Risk:** `processSuccessfulPayment()` performs multiple sequential database writes (update payment → update booking → update round enrollment → send email) without wrapping in a database transaction. If any step fails midway, data becomes inconsistent (e.g., payment marked paid but booking still pending).
- **Impact:** Revenue leakage, customer confusion, manual reconciliation required.
- **Recommendation:** Wrap the entire payment confirmation flow in a PostgreSQL transaction using the `atomic-db.ts` utility that already exists but isn't used here.

### P1-ARCH-003: No CI/CD Pipeline
- **Evidence:** No `.github/workflows/`, no `vercel.json` with test gates, no `vitest.config.ts`, no test runner in `package.json`
- **Risk:** Code ships directly to production without automated testing, type checking, or build verification.
- **Impact:** Regression bugs reach production. The previous audit found 11 bugs in production, several of which would have been caught by CI.
- **Recommendation:** Implement GitHub Actions with: `tsc --noEmit`, `vitest run`, `next build` validation, ideally with Playwright E2E for critical paths.

### P1-ARCH-004: CRM Single Point of Failure on Railway
- **File:** Previous audit confirmed CRM domain was down (503 + self-signed cert)
- **Risk:** Twenty CRM on Railway has no redundancy. If Railway goes down, all CRM sync events queue up and may overflow. No retry mechanism with exponential backoff was observed.
- **Impact:** Lead data loss, sales attribution breaks, pipeline visibility disappears.
- **Recommendation:** Implement proper retry with exponential backoff in CRM sync. Consider a managed CRM with SLA if Twenty CRM instability persists.

---

## Major Issues (P2)

### P2-ARCH-005: 40+ Collections — Schema Complexity
- **Files:** `src/collections/*.ts` (40 files)
- The schema has grown organically. Some collections like `CompanyGroups`, `CompanyGroupMembers`, `CompanyPolicies`, `CompanyInvitations` suggest B2B features that may be premature for current scale. This adds maintenance overhead and increases Payload admin complexity.

### P2-ARCH-006: Monolith Coupling Risk
- Payload CMS, API routes, cron jobs, webhook handlers, and the frontend all run in the same Next.js process. An OOM in a cron job crashes the entire application including the customer-facing site.
- **Recommendation:** At minimum, run cron jobs as separate Vercel functions or in a separate worker process.

### P2-ARCH-007: Missing Caching Strategy
- The codebase has minimal caching. No Redis cache layer for frequently-read data (programs listing, instructor profiles). No `revalidate` tags observed on static pages. The `ioredis` dependency is installed but primarily used for rate limiting, not caching.
- **Recommendation:** Implement ISR with `revalidateTag` for program/instructor pages. Add Redis caching for dashboard API calls.

### P2-ARCH-008: No Service Worker / Offline Support Implementation
- **File:** `src/app/manifest.ts` — Only a basic manifest exists
- PWA manifest has only `favicon.ico` as icon. No Service Worker, no offline page, no push notification infrastructure despite documentation promising these features.

---

## Minor Issues (P3)

### P3-ARCH-009: Build Artifacts in Repository
- Files like `build_output.txt`, `build_output2.txt`, `build_output3.txt`, `media__*.png`, `admin-page.html` are committed to the repo root. This bloats the repository and creates confusion.

### P3-ARCH-010: Orphaned Sub-Projects
- `cardo/` and `mekk/` directories appear to be separate projects co-located in the repo. These should be in separate repositories.

### P3-ARCH-011: Mixed Package Managers
- `package.json` uses npm scripts, Dockerfile uses `pnpm`, but `package-lock.json` suggests npm. This inconsistency can cause dependency resolution issues.

---

## Scalability Assessment

| Scale Point | Current Capacity | Breaks At | Bottleneck |
|---|---|---|---|
| Concurrent Users | ~50-100 | ~200+ | Neon free tier connection limits |
| Webhook Processing | Sequential | ~10 webhooks/sec | Single-threaded, no queue |
| CRM Sync | Event queue table | ~1000 events/day | Railway CRM instability |
| Media Storage | S3/R2 | Unlimited (with proper config) | Good ✅ |
| Build Time | ~2-3 min | N/A | Acceptable |
| Database Size | Free tier = 512MB | ~10k bookings | Neon storage limits |

**What breaks first at 10x load:** The Neon database connection pool. At 10x current load (~500-1000 concurrent users), connection exhaustion will cause cascading failures across the entire application since all services share one connection pool.

---

## Tech Debt Inventory

| Item | Severity | Effort | Description |
|---|---|---|---|
| No test suite | High | 2 weeks | Zero unit/integration tests in the main project |
| No CI/CD | High | 2 days | No automated quality gates |
| Build artifacts in repo | Low | 1 hour | Clean up committed build files |
| Mixed package managers | Medium | 2 hours | Standardize on pnpm |
| No database migrations as code | Medium | 1 week | Using `push: true` in dev, `prodMigrations` for prod — but migrations are auto-generated |
| Hardcoded admin seed in config | Low | 1 hour | PAYLOAD_ADMIN_EMAIL in onInit should use a migration |
| `any` type assertions | Medium | 3 days | Multiple `as any` casts in webhook handlers and hooks |

---

## Competitor Architecture Comparison

| Feature | Next Academy | Coursat.me | Udemy | Edraak |
|---|---|---|---|---|
| Stack | Next.js + Payload | Custom PHP/Laravel | Python/Django + React | Drupal + Open edX |
| CMS | Payload (embedded) | Custom | Custom | Drupal |
| Database | PostgreSQL (Neon) | MySQL (managed) | PostgreSQL (managed) | MongoDB + PostgreSQL |
| Payment | Paymob + EasyKash | Fawaterak + custom | Stripe + local gateways | Fawry |
| CDN | Vercel Edge | Cloudflare | Fastly | Cloudflare |
| Search | None (custom API) | Algolia | ElasticSearch | ElasticSearch |
| Scalability | Limited (free tier) | Moderate | Enterprise | Moderate |

**Key Insight:** Competitors use managed infrastructure with SLAs. Next Academy's "zero cost" constraint is a competitive disadvantage for reliability.

---

## Recommendations (Prioritized)

1. **[P0] Upgrade Neon to Pro tier** — $19/mo eliminates all auto-pause risks
2. **[P0] Wrap payment flows in database transactions** — Use existing `atomic-db.ts`
3. **[P1] Implement CI/CD pipeline** — GitHub Actions with type check + build
4. **[P1] Add retry/backoff to CRM sync** — Prevent data loss on Railway outages
5. **[P2] Implement Redis caching** — ioredis already installed, use it
6. **[P2] Separate cron jobs** — Run as Vercel cron functions, not in-app
7. **[P2] Clean repository** — Remove build artifacts, orphaned projects
8. **[P3] Standardize package manager** — Pick pnpm, update all configs
9. **[P3] Add structured logging** — Replace console.error with proper logger

---

## Verdict: Architecture Score 5.5/10

The architecture demonstrates strong domain modeling, good separation of concerns within the Payload CMS paradigm, and thoughtful integration with external services. However, critical infrastructure fragility (Neon free tier, no CI/CD, no transaction safety in payments) prevents a higher score. The platform is buildable and deployable but not production-hardened for a revenue-generating application handling real money.
