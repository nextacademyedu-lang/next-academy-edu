# Phase 0 — Agent B: Vitest Setup + Critical Unit Tests

## Mission
Install Vitest, configure it for the Next.js + Payload project, and write the first critical unit tests covering payment webhooks, amount calculations, OTP verification, and access control.

## Context
Next Academy is a **Next.js 15 + Payload CMS 3 + TypeScript** project with:
- **Zero unit tests** currently
- **pnpm** package manager
- **TypeScript strict mode** enabled
- Critical business logic in `src/lib/` that handles real money and user authentication

The project has an E2E suite (`e2e-prod-test/`) using Playwright, but NO unit or integration testing framework.

## Your Task

### 1. Install Vitest

```bash
pnpm add -D vitest @vitejs/plugin-react
```

### 2. Create `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', 'e2e-prod-test'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 3. Write Critical Unit Tests

You need to read the source files first and then write tests. Here's what to test:

#### Test File 1: `src/__tests__/payment-webhook.test.ts`
**Read:** `src/app/api/webhooks/paymob/route.ts` and `src/app/api/webhooks/easykash/route.ts`

Test the HMAC/signature verification logic:
- Valid signature → accepted
- Invalid signature → rejected (401)
- Tampered payload → rejected
- Missing signature header → rejected
- Empty body → rejected

#### Test File 2: `src/__tests__/payment-amounts.test.ts`
**Read:** `src/lib/payment-helper.ts` and `src/lib/payment-api.ts`

Test amount calculation logic:
- Full price payment → correct amount in piasters (EGP × 100)
- Discounted payment → correct calculation
- Installment payment → correct per-installment amount
- Zero amount → rejected
- Negative amount → rejected

#### Test File 3: `src/__tests__/access-control.test.ts`
**Read:** `src/lib/access-control.ts`

Test role-based access:
- Admin user → full access
- Instructor → instructor-only access
- Student → student-only access
- B2B Manager → company-scoped access
- Unauthenticated → rejected
- Cross-role access attempt → rejected

#### Test File 4: `src/__tests__/rate-limit.test.ts`
**Read:** `src/lib/rate-limit.ts`

Test rate limiting:
- Under limit → allowed
- At limit → blocked
- After cooldown → allowed again
- Different keys → independent limits

### 4. Important Testing Patterns

When testing functions that depend on Payload CMS or database:
- **Mock the dependencies** — don't connect to a real database
- Use `vi.mock()` to mock Payload's `payload.find()`, `payload.update()`, etc.
- Focus on testing the LOGIC, not the database layer

Example mock pattern:
```typescript
import { vi, describe, it, expect } from 'vitest'

// Mock payload
vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    find: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  }),
}))
```

### 5. Verify Tests Pass

Run `pnpm vitest run` and ensure all tests pass.

## Files to Create/Modify

| Action | File |
|--------|------|
| INSTALL | `vitest`, `@vitejs/plugin-react` as devDependencies |
| CREATE | `vitest.config.ts` |
| CREATE | `src/__tests__/payment-webhook.test.ts` |
| CREATE | `src/__tests__/payment-amounts.test.ts` |
| CREATE | `src/__tests__/access-control.test.ts` |
| CREATE | `src/__tests__/rate-limit.test.ts` |

## Files to Read (DO NOT MODIFY)

- `src/app/api/webhooks/paymob/route.ts`
- `src/app/api/webhooks/easykash/route.ts`
- `src/lib/payment-helper.ts`
- `src/lib/payment-api.ts`
- `src/lib/access-control.ts`
- `src/lib/rate-limit.ts`
- `src/app/api/auth/verify-otp/route.ts`
- `src/app/api/auth/send-otp/route.ts`

## Acceptance Criteria

- [ ] Vitest installed and configured
- [ ] `vitest.config.ts` at project root with correct path aliases
- [ ] At least 4 test files in `src/__tests__/`
- [ ] Each test file covers both happy path and edge cases
- [ ] All tests pass with `pnpm vitest run`
- [ ] Tests use proper mocking (no real DB connection needed)
- [ ] No source code modified (tests only)

## What NOT To Do
- Do NOT modify any source code files
- Do NOT install ESLint or Prettier (Agent P0-C handles that)
- Do NOT write E2E tests (existing Playwright suite handles those)
- Do NOT connect to a real database in tests
