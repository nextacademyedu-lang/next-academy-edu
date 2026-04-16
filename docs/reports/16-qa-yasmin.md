# Yasmin — QA & Testing Engineer Audit Report
**Team:** Software House 🏗️  
**Date:** 2026-04-16  
**Scope:** Test coverage, CI/CD quality gates, type safety, e2e testing

---

## Executive Summary

Next Academy is a production platform processing real payments, managing student enrollments, instructor onboarding, and B2B corporate seat allocations — yet it has **zero unit tests** and **zero integration tests** in the application codebase. The project ships code directly to production with **no CI/CD pipeline**, **no linting gate**, and **no type-checking step** in the build process.

The single bright spot is a well-structured **Playwright E2E test suite** in a separate `e2e-prod-test/` directory, covering ~55 production scenarios across instructor flows and B2B booking flows. However, this suite runs **against production directly**, not in a staging environment, and is **not integrated into any deployment pipeline** — it's a manual safety net at best.

The type safety picture is mixed: `strict: true` is enabled (good), but the codebase contains **150 `as any` type assertions** scattered across critical business logic — payment webhooks, booking hooks, CRM operations, and authentication routes. Each one is a potential runtime surprise that TypeScript's safety net can't catch.

**Bottom line:** This project is operating on faith. Every deployment is a coin flip. The only thing preventing catastrophic regressions is developer memory and manual testing. I've seen this movie before — it always ends with a 2am production incident on the one flow nobody tested.

**Risk Rating: 🔴 CRITICAL** — A production platform handling real payments with zero automated quality gates.

---

## Test Infrastructure Inventory

| Category | Status | Details |
|----------|--------|---------|
| Unit test framework | ❌ None | No Jest, Vitest, or any unit test runner configured |
| Unit test files | ❌ Zero | No `*.test.ts` or `*.test.tsx` files anywhere in `src/` |
| Integration tests | ❌ None | No integration test setup for API routes, hooks, or CRM sync |
| E2E test framework | ✅ Playwright | Separate project in `e2e-prod-test/` with Playwright 1.58 |
| E2E test files | ✅ 3 spec files | ~55 scenarios across instructor + B2B flows (~2,000 lines) |
| E2E CI integration | ❌ Manual only | No pipeline runs these tests; manual `npm run test` |
| CI/CD pipeline | ❌ None | No `.github/workflows/`, no Jenkinsfile, no pipeline of any kind |
| Pre-deploy checks | ❌ None | No lint, type-check, or build verification before deploy |
| Linting (ESLint) | ❌ None | No ESLint config in root project; no `lint` script |
| TypeScript strict mode | ✅ Enabled | `strict: true` in tsconfig.json |
| `@ts-ignore` usage | ✅ Clean | 0 occurrences — team doesn't suppress errors this way |
| `@ts-expect-error` usage | ✅ Clean | 0 occurrences |
| `as any` assertions | ⚠️ 150 | 150 occurrences in `src/`, concentrated in critical paths |
| `package.json` test script | ❌ Missing | No `test`, `test:unit`, `test:e2e`, `lint`, or `type-check` scripts |
| Dockerfile test step | ❌ Missing | Build stage runs `pnpm build` only — no tests, no lint |

---

## Critical Issues 🔴

### 1. ZERO Unit Tests — Payment, Auth, and CRM Logic Completely Untested

**Severity: 🔴 CRITICAL**

The project has **no unit tests whatsoever**. Not one. The following mission-critical modules have zero automated verification:

| Module | Risk | What Could Go Wrong |
|--------|------|-------------------|
| `src/lib/payment-helper.ts` | 💀 Financial | Paymob amount calculation errors charge wrong amounts |
| `src/lib/payment-api.ts` | 💀 Financial | Payment initiation payload malformed → silent payment failures |
| `src/app/api/webhooks/paymob/route.ts` | 💀 Financial | Webhook signature validation bypass → fraudulent confirmations |
| `src/app/api/webhooks/easykash/route.ts` | 💀 Financial | Installment status mapping error → students lose access |
| `src/lib/auth-api.ts` | 🔓 Security | OTP bypass, session handling errors |
| `src/lib/server-auth.ts` | 🔓 Security | Auth context extraction fails → privilege escalation |
| `src/lib/access-control.ts` | 🔓 Security | Role check logic error → unauthorized data access |
| `src/lib/crm/processor.ts` | 📊 Data | CRM sync silently drops leads, corrupts pipeline data |
| `src/lib/crm/queue.ts` | 📊 Data | Queue processing fails → leads never reach CRM |
| `src/lib/crm/mappers.ts` | 📊 Data | Field mapping error → CRM receives garbage data |
| `src/lib/b2b-seats.ts` | 💰 Business | Seat allocation math wrong → company overcharged or under-allocated |
| `src/lib/b2b-api.ts` | 💰 Business | Cross-company data leak in API responses |
| `src/lib/rate-limit.ts` | 🔓 Security | Rate limit bypassed → brute force attacks succeed |
| `src/lib/csrf.ts` | 🔓 Security | CSRF protection misconfigured → form hijacking |

**Impact:** A single regression in any of these modules could result in financial loss, data breach, or complete service disruption. Without tests, the team has no way to know if a change breaks these flows until a user reports it — or worse, until money is lost.

### 2. No CI/CD Pipeline — Deployments Are Unguarded

**Severity: 🔴 CRITICAL**

There is **no CI/CD pipeline** of any kind:
- No `.github/workflows/` directory
- No Jenkinsfile or equivalent
- No build verification before deployment
- The Dockerfile's build stage (`pnpm build`) runs only the Next.js production build — no tests, no lint, no type-check

**Current deployment flow (inferred):**
```
Developer pushes code → Coolify pulls → Docker builds → Production updated
                        ↑ No gates here. Nothing stops broken code.
```

**What should exist:**
```
Push → Lint → Type-check → Unit tests → Build → E2E (staging) → Deploy
```

### 3. No Linting Configuration or Script

**Severity: 🔴 CRITICAL**

The root project has:
- No `.eslintrc.*` or `eslint.config.*` file
- No `lint` script in `package.json`
- No Prettier configuration

This means there's no automated enforcement of code style, no detection of common bugs (unused variables, unreachable code, missing error handling), and no consistency across developer contributions.

---

## Major Issues 🟠

### 4. 150 `as any` Type Assertions in Application Code

**Severity: 🟠 HIGH**

Despite `strict: true` being enabled, the codebase contains **150 `as any` type assertions** — each one is a hole punched through TypeScript's safety net. The concentration in critical areas is alarming:

| File | `as any` Count | Concern |
|------|:---:|---------|
| `src/collections/Bookings.ts` | 15 | Booking hooks bypass type checking on round, program, user relations |
| `src/collections/Sessions.ts` | 10 | Google Calendar integration uses `as any` for all document properties |
| `src/collections/Rounds.ts` | 6 | Round management bypasses collection type references |
| `src/app/api/webhooks/easykash/route.ts` | 5 | Payment webhook handler bypasses request typing |
| `src/app/api/webhooks/paymob/route.ts` | 3+ | Payment webhook handler bypasses request typing |
| `src/lib/payment-helper.ts` | 3 | Location data access bypasses types |
| `src/collections/Users.ts` | 3 | User hooks bypass collection type references |
| `src/app/api/users/login/route.ts` | 2 | Login route bypasses request typing |
| Various API routes | 50+ | `req as any` pattern used extensively |

**Pattern analysis:** The dominant pattern is `req as any` — used to pass Next.js Request objects to Payload CMS hooks that expect a different Request type. This is a Payload CMS typing gap, but the fix should be proper type narrowing, not `as any`.

**Secondary pattern:** `collection as any` — used when referencing collections dynamically. This hides potential runtime errors from typos in collection names.

### 5. E2E Tests Run Against Production Only

**Severity: 🟠 HIGH**

The Playwright config defaults to `https://nextacademyedu.com`:

```typescript
const baseURL = process.env.E2E_BASE_URL || 'https://nextacademyedu.com';
```

This means:
- E2E tests create **real users and data** in production
- Tests rely on cleanup, but the README acknowledges that **user deletion fails** due to a Payload hook bug (`400: The following path cannot be queried: user`)
- No staging environment exists for safe test execution
- Test artifacts (orphaned users, verification codes) accumulate in production

### 6. No Test Coverage for Collection Hooks

**Severity: 🟠 HIGH**

Payload CMS collections have complex `beforeChange`, `afterChange`, `beforeDelete`, and `afterDelete` hooks that implement critical business logic:

- **Users collection:** Auto-creates instructor profiles, links companies, escalates roles on OTP verification
- **Bookings collection:** Manages Google Calendar events, sends notifications, handles cancellation flows
- **Rounds collection:** Manages enrollment counts, capacity checks

None of these hooks have unit or integration tests. A single hook regression can cascade across the entire system.

---

## Minor Issues / Improvements 🟡

### 7. E2E Test Suite Has Its Own Type Safety Issues

The E2E test suite contains **19 `as any` assertions** — mostly casting API response data. While less critical since these are test files, it indicates the test utility types (`ApiResult<T>`) aren't being leveraged consistently.

### 8. E2E Tests Are Serial Only

All three spec files use `mode: 'serial'` and `workers: 1`. While this makes sense for stateful flows, it means the full suite likely takes 5-10+ minutes to run, discouraging frequent execution.

### 9. Missing Test Data Factories

The E2E suite manually constructs test data with inline object literals. A factory pattern (e.g., `createTestUser()`, `createTestRound()`) would reduce duplication and make tests more maintainable.

### 10. No Smoke Tests for Critical Pages

No tests verify that critical pages (homepage, course catalog, checkout, dashboard) actually render without errors. A basic smoke test suite would catch SSR crashes and missing data.

---

## What's Working Well ✅

### 1. Comprehensive E2E Playwright Suite

The `e2e-prod-test/` suite is genuinely impressive for a project with no other testing:

- **`prod-e2e.spec.ts`** — 20 scenarios covering the complete instructor lifecycle: registration, OTP, role escalation prevention, profile submission, approval workflow, consultation services CRUD, availability management, program submissions, and ownership boundaries
- **`b2b-booking-flow.spec.ts`** — 25+ scenarios covering seat purchase (assigned/pool/mixed), assignment, unassignment, pool claiming, dashboard summary, cross-company isolation, invitations, auth edge cases
- **`b2b-manager-e2e.spec.ts`** — 15+ scenarios covering B2B manager registration, onboarding, route guards, team management, scope isolation, bulk allocations

**Quality markers:**
- Proper `beforeAll`/`afterAll` cleanup with unique `RUN_ID` tokens
- Retry logic for rate-limited operations (exponential backoff)
- Well-typed helper utilities in `test-utils.ts` (457 lines of reusable functions)
- Tests verify both positive and negative cases (invalid input, unauthorized access, duplicate operations)
- Cross-company isolation tests verify no data leakage

### 2. TypeScript Strict Mode Enabled

`strict: true` in `tsconfig.json` is a strong foundation. This catches null reference errors, implicit any types, and other common issues at compile time.

### 3. Zero `@ts-ignore` and `@ts-expect-error`

The team hasn't taken the easy route of silencing the compiler entirely. The `as any` assertions are a concern, but they're at least visible and searchable.

### 4. E2E Test Reports Infrastructure

Playwright is configured with JSON and HTML reporters, and there's evidence of prior test runs (`reports/test-results.json` at 32KB). The infrastructure for reporting exists even if it's not in a CI pipeline.

---

## Type Safety Audit

| Pattern | Count (src/) | Count (e2e/) | Impact |
|---------|:---:|:---:|--------|
| `as any` | **150** | 19 | High — bypasses type checking in payment, booking, and auth code |
| `@ts-ignore` | **0** | 0 | Clean |
| `@ts-expect-error` | **0** | 0 | Clean |
| `strict: true` | ✅ | N/A | Good — compiler strictness enabled |
| `noImplicitAny` | ✅ (via strict) | N/A | Good — included in strict mode |
| `strictNullChecks` | ✅ (via strict) | N/A | Good — included in strict mode |

### Top `as any` Hotspots (by file)

| # | File | Count | Category |
|---|------|:---:|----------|
| 1 | `Bookings.ts` | ~15 | Collection hooks — relation type casting |
| 2 | `Sessions.ts` | ~10 | Google Calendar — document property access |
| 3 | `Rounds.ts` | ~6 | Collection hooks — req and collection casting |
| 4 | `easykash/route.ts` | ~5 | Payment webhook — req casting |
| 5 | `paymob/route.ts` | ~4 | Payment webhook — req casting |
| 6 | `payment-helper.ts` | 3 | Payment logic — round property access |
| 7 | Various API routes | ~50+ | `req as any` pattern throughout |

### Root Cause Analysis

The `req as any` pattern (accounting for ~60% of all assertions) stems from a **Payload CMS typing mismatch**: Next.js API routes receive `NextRequest`, but Payload hooks expect `PayloadRequest`. Instead of creating a proper type adapter, the team cast to `any` every time. A single shared utility function could eliminate ~90 of these 150 assertions:

```typescript
// Proposed fix: create src/lib/payload-request.ts
import type { PayloadRequest } from 'payload';

export function asPayloadReq(req: Request): PayloadRequest {
  return req as unknown as PayloadRequest;
}
```

---

## Recommended Test Plan

### Phase 1: Emergency Coverage (Week 1-2) — P0

| Priority | Flow to Test | Test Type | Framework | Effort | Rationale |
|:---:|-------------|-----------|-----------|:---:|-----------|
| P0 | Payment webhook signature validation | Unit | Vitest | S | Fraudulent payment confirmation prevention |
| P0 | Payment amount calculation | Unit | Vitest | S | Financial accuracy — wrong amounts charged |
| P0 | OTP verification logic | Unit | Vitest | S | Auth bypass prevention |
| P0 | Access control role checks | Unit | Vitest | S | Privilege escalation prevention |
| P0 | Booking creation + enrollment count | Integration | Vitest | M | Double-booking, capacity overflow |

### Phase 2: Critical Business Logic (Week 3-4) — P1

| Priority | Flow to Test | Test Type | Framework | Effort | Rationale |
|:---:|-------------|-----------|-----------|:---:|-----------|
| P1 | CRM sync processor + queue | Integration | Vitest | M | Lead data integrity |
| P1 | CRM field mappers | Unit | Vitest | S | Data mapping correctness |
| P1 | B2B seat allocation math | Unit | Vitest | S | Corporate billing accuracy |
| P1 | B2B cross-company isolation | Integration | Vitest | M | Data leak prevention |
| P1 | Rate limiter behavior | Unit | Vitest | S | Brute force protection |
| P1 | Discount code validation | Unit | Vitest | S | Revenue leakage prevention |

### Phase 3: CI/CD Pipeline + Infrastructure (Week 3-4) — P1

| Priority | Task | Type | Effort | Rationale |
|:---:|------|------|:---:|-----------|
| P1 | Set up Vitest + test config | Infrastructure | S | Foundation for all unit tests |
| P1 | Add `lint` script + ESLint config | Infrastructure | S | Code quality baseline |
| P1 | Add `type-check` script (`tsc --noEmit`) | Infrastructure | S | Catch type errors pre-deploy |
| P1 | Create GitHub Actions CI pipeline | Infrastructure | M | Automated quality gates |
| P1 | Add test + lint steps to Dockerfile | Infrastructure | S | Prevent broken builds from deploying |
| P1 | Set up staging environment for E2E | Infrastructure | L | Stop testing against production |

### Phase 4: Comprehensive Coverage (Month 2) — P2

| Priority | Flow to Test | Test Type | Framework | Effort | Rationale |
|:---:|-------------|-----------|-----------|:---:|-----------|
| P2 | Collection hook behaviors | Integration | Vitest | L | Prevent hook regression cascades |
| P2 | Email template rendering | Unit | Vitest | S | Notification reliability |
| P2 | Consultation booking + calendar | Integration | Vitest | M | Instructor scheduling correctness |
| P2 | Certificate generation | Unit | Vitest | S | Student credential integrity |
| P2 | Page smoke tests (SSR) | E2E | Playwright | M | Catch rendering crashes |
| P2 | Checkout flow (Paymob + EasyKash) | E2E | Playwright | L | End-to-end payment verification |

### Phase 5: `as any` Elimination (Ongoing) — P2

| Priority | Task | Count | Effort | Rationale |
|:---:|------|:---:|:---:|-----------|
| P2 | Create `asPayloadReq()` utility | ~90 fixes | S | Eliminate req casting pattern |
| P2 | Type collection references properly | ~15 fixes | M | Eliminate `collection as any` |
| P2 | Type round/program relations | ~20 fixes | M | Eliminate relation casting |
| P2 | Type Session document properties | ~10 fixes | S | Eliminate Google Calendar casting |

---

## CI/CD Pipeline Recommendation

### Minimum Viable Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit          # Type check
      - run: pnpm eslint src/            # Lint
      - run: pnpm vitest run             # Unit + integration tests
      - run: pnpm build                  # Build verification
```

### Dockerfile Enhancement

```dockerfile
# Add before the build step in Stage 2:
RUN pnpm tsc --noEmit
RUN pnpm vitest run --reporter=verbose
RUN pnpm build
```

---

## Appendix

### A. Files Analyzed

| Category | Files |
|----------|-------|
| Test infrastructure | `package.json`, `tsconfig.json`, `Dockerfile` |
| E2E suite | `e2e-prod-test/playwright.config.ts`, `e2e-prod-test/test-utils.ts`, `e2e-prod-test/tests/*.spec.ts` |
| CI/CD | Searched for `.github/workflows/`, `Jenkinsfile` — none found |
| ESLint | Searched for `.eslintrc*`, `eslint.config.*` — none in root project |
| Test configs | Searched for `jest.config.*`, `vitest.config.*`, `cypress.config.*` — none found |
| Type safety | Grep across entire `src/` for `as any`, `@ts-ignore`, `@ts-expect-error` |

### B. E2E Test Inventory

| Spec File | Scenarios | Lines | Coverage Area |
|-----------|:---------:|:-----:|---------------|
| `prod-e2e.spec.ts` | 20 | 900 | Instructor registration, OTP, profile lifecycle, services CRUD, availability, programs |
| `b2b-booking-flow.spec.ts` | ~25 | 605 | Seat purchase, assignment, pool claiming, dashboard, cross-company isolation, invitations |
| `b2b-manager-e2e.spec.ts` | ~15 | 484 | Manager registration, onboarding, route guards, team management, bulk allocations |
| **Total** | **~60** | **1,989** | |

### C. Critical Modules Without Any Test Coverage

```
src/lib/payment-api.ts          — Payment initiation
src/lib/payment-helper.ts       — Amount calculation, payment flow orchestration
src/lib/auth-api.ts             — Authentication flows
src/lib/server-auth.ts          — Server-side auth context
src/lib/access-control.ts       — Role-based access control
src/lib/crm/processor.ts        — CRM sync processing
src/lib/crm/queue.ts            — CRM sync queue management
src/lib/crm/mappers.ts          — CRM field mapping
src/lib/b2b-seats.ts            — B2B seat allocation logic
src/lib/b2b-api.ts              — B2B API helpers
src/lib/rate-limit.ts           — Rate limiting
src/lib/csrf.ts                 — CSRF protection
src/collections/Bookings.ts     — Booking hooks (15 `as any`)
src/collections/Sessions.ts     — Session hooks + Google Calendar (10 `as any`)
src/collections/Users.ts        — User lifecycle hooks
src/collections/Rounds.ts       — Round management hooks
```

---

*"I've audited hundreds of projects. The ones that say 'we'll add tests later' never do — until the first production incident costs more than the entire test suite would have. Next Academy has built an impressive product, but it's standing on a foundation of hope. The E2E suite shows the team knows how to write tests. Now it needs to become a habit, not an afterthought."*

— **Yasmin, QA & Testing Engineer**
