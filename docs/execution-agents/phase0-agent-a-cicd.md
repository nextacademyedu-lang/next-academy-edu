# Phase 0 — Agent A: CI/CD Pipeline Setup

## Mission
Set up the foundational CI/CD pipeline so every future code change is automatically verified.

## Context
Next Academy is a **Next.js 15 + Payload CMS 3 + PostgreSQL** monorepo. It currently has:
- **Zero CI/CD pipeline** — no `.github/workflows/`, no Jenkinsfile
- **No `test`, `lint`, or `type-check` scripts** in `package.json`
- **pnpm** as the package manager
- **Docker** deployment via Coolify
- **TypeScript strict mode** enabled

The project DOES have an E2E test suite in `e2e-prod-test/` (Playwright), but it's separate and not integrated into any pipeline.

## Your Task

### 1. Add Scripts to `package.json`

Add these scripts to `package.json`:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

> **⚠️ IMPORTANT:** Do NOT remove or modify any existing scripts. Only ADD new ones.

### 2. Create GitHub Actions CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test

      - name: Build
        run: pnpm build
        env:
          # Add minimum required env vars for build to succeed
          DATABASE_URI: "postgresql://placeholder:placeholder@localhost:5432/placeholder"
          PAYLOAD_SECRET: "ci-placeholder-secret-key-minimum-length"
          NEXT_PUBLIC_SERVER_URL: "http://localhost:3000"
```

### 3. Add Type-Check Step to Dockerfile

Read the existing `Dockerfile` and add a type-check step BEFORE the build step in the builder stage:

```dockerfile
# Add this line BEFORE "RUN pnpm build"
RUN pnpm type-check
```

> **⚠️ CRITICAL:** Do NOT break the existing Dockerfile structure. Only add the type-check line. Read the Dockerfile first to understand the current structure.

### 4. Verify Everything Works

After making changes:
1. Run `pnpm type-check` — should pass (strict mode is already enabled and the project compiles)
2. The CI workflow should be syntactically valid YAML
3. Existing `pnpm build` should still work

## Files to Create/Modify

| Action | File |
|--------|------|
| CREATE | `.github/workflows/ci.yml` |
| MODIFY | `package.json` (add scripts only) |
| MODIFY | `Dockerfile` (add type-check step) |

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` exists with correct pipeline
- [ ] `package.json` has `type-check`, `lint`, `test`, `test:watch` scripts
- [ ] Dockerfile has type-check before build
- [ ] `pnpm type-check` runs successfully
- [ ] No existing scripts or configurations modified

## What NOT To Do
- Do NOT install Vitest or ESLint (Agent P0-B and P0-C handle those)
- Do NOT modify any source code
- Do NOT change tsconfig.json
- Do NOT restructure the Dockerfile
