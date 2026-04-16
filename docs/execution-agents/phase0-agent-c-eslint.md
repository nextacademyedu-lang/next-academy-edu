# Phase 0 — Agent C: ESLint + Prettier + Type Safety Fixes

## Mission
Set up ESLint and Prettier for the project, create a typed utility to replace `req as any` patterns, and fix the most critical `as any` type assertions in payment and auth code.

## Context
Next Academy is a **Next.js 15 + Payload CMS 3 + TypeScript** project with:
- **No ESLint configuration** — no `.eslintrc`, no `eslint.config.*`
- **No Prettier configuration**
- **150 `as any` type assertions** across the codebase
- **TypeScript strict mode** enabled in `tsconfig.json`
- The dominant `as any` pattern is `req as any` — casting NextRequest to PayloadRequest

### Root Cause of `as any` Patterns
~60% of all `as any` assertions (approximately 90) are the pattern `req as any` used when Next.js API routes pass a `NextRequest` to Payload CMS hooks that expect `PayloadRequest`. Instead of proper type narrowing, the team used `as any` everywhere.

## Your Task

### 1. Install Dependencies

```bash
pnpm add -D eslint @eslint/js typescript-eslint eslint-config-next prettier eslint-config-prettier
```

### 2. Create ESLint Flat Config

Create `eslint.config.mjs`:

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "e2e-prod-test/**",
      "src/migrations/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  ...tseslint.configs.recommended,
  {
    rules: {
      // Warn on any, don't error (we'll fix gradually)
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      // Allow require imports in config files
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
```

> **⚠️ CRITICAL:** ESLint rules must be set to `warn` not `error` for `no-explicit-any`. The project has 150 `as any` — we can't break the build. We fix them gradually.

### 3. Create Prettier Config

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
```

> **⚠️ IMPORTANT:** Look at the existing code style FIRST. Match whatever conventions are already used (semicolons vs no semicolons, single vs double quotes, etc.). The config above is a starting point — adjust it to match the existing codebase so `prettier --check` doesn't want to reformat every file.

### 4. Create Typed PayloadRequest Utility

Create `src/lib/payload-request.ts`:

```typescript
import type { PayloadRequest } from 'payload'

/**
 * Safely cast a Web API Request to PayloadRequest.
 * This replaces the scattered `req as any` pattern throughout the codebase.
 * 
 * Usage: 
 *   const payloadReq = asPayloadRequest(req)
 *   await payload.find({ req: payloadReq, ... })
 */
export function asPayloadRequest(req: Request): PayloadRequest {
  return req as unknown as PayloadRequest
}
```

### 5. Fix Critical `as any` Patterns

Replace `as any` with proper typing in these files ONLY (highest-risk files):

#### Priority 1 — Payment files:
- `src/app/api/webhooks/paymob/route.ts`
- `src/app/api/webhooks/easykash/route.ts`
- `src/lib/payment-helper.ts`
- `src/lib/payment-api.ts`

#### Priority 2 — Auth files:
- `src/app/api/auth/send-otp/route.ts`
- `src/app/api/auth/verify-otp/route.ts`
- `src/app/api/users/login/route.ts`
- `src/lib/server-auth.ts`

**How to fix:**
1. Find every `req as any` → replace with `asPayloadRequest(req)` (import from `@/lib/payload-request`)
2. Find every `collection as any` → replace with proper collection name typing
3. Find property access with `as any` → use proper type narrowing or create interfaces

### 6. Verify Lint Passes

```bash
pnpm lint
```

The lint should run with WARNINGS only (no errors). If there are errors, fix the rules configuration, NOT by adding `// eslint-disable` comments.

## Files to Create/Modify

| Action | File |
|--------|------|
| INSTALL | `eslint`, `typescript-eslint`, `eslint-config-next`, `prettier`, `eslint-config-prettier` |
| CREATE | `eslint.config.mjs` |
| CREATE | `.prettierrc` |
| CREATE | `src/lib/payload-request.ts` |
| MODIFY | `src/app/api/webhooks/paymob/route.ts` (replace `as any`) |
| MODIFY | `src/app/api/webhooks/easykash/route.ts` (replace `as any`) |
| MODIFY | `src/lib/payment-helper.ts` (replace `as any`) |
| MODIFY | `src/lib/payment-api.ts` (replace `as any`) |
| MODIFY | `src/app/api/auth/send-otp/route.ts` (replace `as any`) |
| MODIFY | `src/app/api/auth/verify-otp/route.ts` (replace `as any`) |
| MODIFY | `src/app/api/users/login/route.ts` (replace `as any`) |
| MODIFY | `src/lib/server-auth.ts` (replace `as any`) |

## Files to Read (reference for code style)

- Any 3-4 source files to understand existing code conventions (semicolons, quotes, etc.)
- `tsconfig.json` — verify strict settings
- `package.json` — check existing devDependencies

## Acceptance Criteria

- [ ] ESLint configured with flat config (warns on `any`, doesn't error)
- [ ] Prettier configured matching existing code style
- [ ] `pnpm lint` runs with warnings only (no errors)
- [ ] `src/lib/payload-request.ts` utility created
- [ ] `as any` removed from ALL 8 priority files listed above
- [ ] Import `asPayloadRequest` from `@/lib/payload-request` used consistently
- [ ] `pnpm type-check` still passes after all changes
- [ ] No functional behavior changes — only type improvements

## What NOT To Do
- Do NOT fix `as any` in files other than the 8 listed above
- Do NOT set `no-explicit-any` to `error` — it must be `warn`
- Do NOT reformat the entire codebase with Prettier (only new/modified files)
- Do NOT install Vitest (Agent P0-B handles that)
- Do NOT modify test files or CI pipeline
