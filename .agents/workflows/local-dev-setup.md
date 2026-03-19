---
description: Local development environment setup — PostgreSQL via Docker, env vars, seed, and dev server
---

// turbo-all

# Local Development Setup

> Use this workflow when setting up the local dev environment from scratch,
> after a fresh clone, or when the local DB needs to be reset.

---

## Step 1 — Install Dependencies

```bash
# Requires: Node.js 22+, pnpm, Docker Desktop
pnpm install
```

---

## Step 2 — Start Local PostgreSQL with Docker

```bash
# From the project root (uses docker-compose.yml for local dev)
docker compose up -d db

# Verify postgres is running
docker compose ps db
# Expected: db   Up   0.0.0.0:5432->5432/tcp
```

> **Note:** The project's `docker-compose.yml` is the full production compose file.
> For local dev, you only need to start the `db` (and optionally `redis`) service.

---

## Step 3 — Configure .env.local

Create `d:\projects\nextacademy\.env.local` with the following (fill in real values):

```bash
# Database (local Docker)
DATABASE_URI=postgres://postgres:yourpassword@localhost:5432/postgres

# Payload CMS
PAYLOAD_SECRET=your-local-dev-secret-at-least-32-chars-long

# App URLs (local)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Redis (optional locally — Payload works without it in dev)
REDIS_URL=redis://localhost:6379

# Email (use Resend test key or skip in dev)
RESEND_API_KEY=re_your_test_key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Next Academy Dev

# Auth
PAYLOAD_ADMIN_EMAIL=admin@nextacademy.local
PAYLOAD_ADMIN_PASSWORD=AdminPass123!

# Google OAuth (optional in dev)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Payments (use sandbox keys)
PAYMOB_API_KEY=
PAYMOB_PUBLIC_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_WALLET_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
PAYMOB_HMAC_SECRET=

# Security
CRON_SECRET=local-dev-cron-secret
```

---

## Step 4 — Run the Dev Server (Schema Syncs Automatically)

```bash
pnpm dev
```

> **What happens on first run:**
> 1. `instrumentation.ts` calls `getPayload()` eagerly at startup
> 2. Payload's `push: true` pushes the schema to PostgreSQL (creates all tables)
> 3. `onInit` hook creates the admin user (using `PAYLOAD_ADMIN_EMAIL` + `PAYLOAD_ADMIN_PASSWORD`)

**Expected output:**
```
✓ Ready in Xms
[onInit] Admin user seeded: admin@nextacademy.local
```

Open http://localhost:3000 → homepage
Open http://localhost:3000/admin → login with PAYLOAD_ADMIN_EMAIL + PAYLOAD_ADMIN_PASSWORD

---

## Step 5 — Seed Dev Data (Optional but Recommended)

Run the seed script to populate instructors, programs, sessions:

```bash
pnpm seed
# OR if the script is defined differently:
npx tsx scripts/seed.ts
```

> The seed script is at `scripts/seed.ts`. 
> It creates realistic test data for instructors, courses, sessions, and students.
> Safe to run multiple times — it checks for existing data before inserting.

---

## Step 6 — Access Local Services

| Service | URL | Notes |
|---|---|---|
| App | http://localhost:3000 | Next.js dev server |
| Payload Admin | http://localhost:3000/admin | Login with PAYLOAD_ADMIN_EMAIL |
| Health Check | http://localhost:3000/api/health | Should return 200 |
| PostgreSQL | localhost:5432 | Via TablePlus, pgAdmin, or CLI |

---

## Troubleshooting Local Setup

### Problem: `ECONNREFUSED` connecting to PostgreSQL
```bash
# Start postgres
docker compose up -d db
# Wait 5 seconds for it to be ready, then retry pnpm dev
```

### Problem: Admin can't log in after creating account
This is a known Payload auth behavior. Use the seeded admin (from `PAYLOAD_ADMIN_EMAIL`) or:
1. Create user via Payload admin panel (not the frontend)
2. Ensure `PAYLOAD_SECRET` is stable (don't change it mid-session — sessions are invalidated)
3. Clear cookies and retry

### Problem: i18n error / missing translation keys
```bash
# Check both language files exist
ls src/messages/
# Expected: ar.json  en.json
```

### Problem: `pnpm build` fails with TypeScript errors
```bash
# Check for type errors
pnpm tsc --noEmit
```
Fix all errors before pushing. TypeScript strict mode = no `any`.

### Problem: Schema out of sync
```bash
# Wipe and recreate the DB
docker compose down -v   # ⚠️ destroys local DB data
docker compose up -d db
# Restart dev server — schema will be re-pushed
pnpm dev
```

---

## Local → Production Parity Checklist

Before pushing to main:
```
☐ pnpm build passes
☐ No console.log in production code
☐ New env vars added to Coolify dashboard
☐ pnpm-lock.yaml committed
☐ Run /pre-deploy-check workflow
```
