# Next Academy — Coolify Deployment Rules

> **Last Updated:** 2026-03-20 01:42
> **Platform:** Coolify (self-hosted PaaS on VPS)
> **Architecture:** Docker Compose — Next.js + Payload CMS + Twenty CRM + PostgreSQL 16 + Redis 7 + Nginx

---

## ⚠️ CRITICAL RULES (MUST READ BEFORE ANY DEPLOYMENT WORK)

```
1. NEVER use Dockerfile HEALTHCHECK with `wget` — Alpine doesn't have it.
   Use `node -e` inline HTTP GET instead.
2. FIX healthchecks in BOTH Dockerfile AND docker-compose.yml — Compose overrides Dockerfile.
3. NEVER use TypeScript path aliases (@payload-config) in instrumentation.ts — standalone mode
   does NOT resolve TS aliases. Use relative imports only.
4. ALWAYS run `pnpm install` after changing versions in package.json — pnpm-lock.yaml must match.
   Commit the lockfile. Dockerfile uses --frozen-lockfile.
5. NEVER modify schema without verifying push:true runs BEFORE the first request.
   instrumentation.ts eagerly calls getPayload() to guarantee schema sync at startup.
6. ALWAYS copy runtime files to the runner stage in Dockerfile:
   - src/messages/ (i18n JSON files)
   - public/ (static assets)
7. Coolify DOES NOT auto-run Payload migrations. After DB wipe, run migration SQL manually.
8. Environment Variables are set in Coolify dashboard, NOT in .env files on the server.
9. The `Environment Variables` file in the repo root is a REFERENCE for Coolify config.
   Do NOT commit it with real secrets to git.
10. Port 3001 is the internal app port. Nginx proxies to it. Never expose 3001 publicly.
```

---

## 1. Architecture

```text
Internet
   │
   ▼
┌───────────────────────────────────────────────┐
│            Nginx (port 80 / 443)              │
│  ├── nextacademyedu.com   → app:3001          │
│  └── crm.nextacademyedu.com → twenty:3000     │
└──────────┬───────────────────┬────────────────┘
           │                   │
     ┌─────┴─────┐     ┌───────┴────────┐
     ▼           │     ▼                │
┌────────────┐   │  ┌────────────────┐  │
│ Next.js    │   │  │ Twenty Server  │  │
│ App:3001   │   │  │ (port 3000)    │  │
│ + Payload  │   │  │ + Twenty Worker│  │
│   CMS      │   │  │ (background)   │  │
└─────┬──────┘   │  └──────┬─────────┘  │
      │          │         │            │
      └──────┐   │   ┌─────┘            │
             ▼   ▼   ▼                  ▼
       ┌──────────────┐          ┌──────────────┐
       │ PostgreSQL 16│          │ Redis 7      │
       │ DB: nextacad │          │ DB 0: app    │
       │ DB: twenty   │          │ DB 1: twenty │
       └──────────────┘          └──────────────┘
```

**Key points:**
- `output: 'standalone'` in `next.config.ts` — no `node_modules` in runner image
- `push: true` in `payload.config.ts` — schema syncs on startup, no manual migration commands
- `instrumentation.ts` calls `getPayload()` eagerly so schema push completes BEFORE any HTTP request
- Admin user is auto-seeded via `onInit` if `PAYLOAD_ADMIN_EMAIL` + `PAYLOAD_ADMIN_PASSWORD` are set

---

## 2. Docker Services (docker-compose.yml)

| Service         | Image               | Ports   | Volumes                 | Depends On       |
|-----------------|----------------------|---------|-------------------------|------------------|
| `app`           | Custom Dockerfile    | 3001    | —                       | postgres, redis  |
| `postgres`      | postgres:16-alpine   | 5432    | `pgdata`, init script   | —                |
| `redis`         | redis:7-alpine       | 6379    | `redisdata`             | —                |
| `nginx`         | nginx:alpine         | 80, 443 | certs, `nginx.conf`     | app, twenty-server |
| `certbot`       | certbot/certbot      | —       | certs                   | —                |
| `twenty-server` | twentycrm/twenty     | 3000    | `twenty_local_data`     | postgres, redis  |
| `twenty-worker` | twentycrm/twenty     | —       | `twenty_local_data`     | twenty-server    |

---

## 3. Environment Variables (Coolify Dashboard)

Set these in **Coolify → Service → Environment Variables**:

### Required (app won't start without these)

| Variable | Notes |
|---|---|
| `DATABASE_URI` | Internal Docker network: `postgres://user:pass@db-container:5432/postgres` |
| `PAYLOAD_SECRET` | ≥32 char crypto random hex |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | `https://nextacademyedu.com` |
| `NEXT_PUBLIC_SERVER_URL` | `https://nextacademyedu.com` |
| `REDIS_URL` | Internal Docker network: `redis://default:pass@redis-container:6379/0` |

### Payment

| Variable | Notes |
|---|---|
| `PAYMOB_API_KEY` | Server-only secret key (`egy_sk_live_...`) |
| `PAYMOB_PUBLIC_KEY` | Public key for Unified Checkout (`egy_pk_live_...`) |
| `PAYMOB_INTEGRATION_ID` | Card payment integration |
| `PAYMOB_WALLET_INTEGRATION_ID` | Mobile wallet integration |
| `PAYMOB_IFRAME_ID` | Legacy iframe reference |
| `PAYMOB_HMAC_SECRET` | Webhook HMAC verification |
| `EASYKASH_API_TOKEN` | EasyKash Cash API key |
| `EASYKASH_HMAC_SECRET` | EasyKash webhook secret |

### Email

| Variable | Notes |
|---|---|
| `RESEND_API_KEY` | `re_...` key from Resend dashboard |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `RESEND_FROM_NAME` | Display name (e.g. `Next Academy`) |

### Auth

| Variable | Notes |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `PAYLOAD_ADMIN_EMAIL` | Initial admin email (auto-seeded on first boot) |
| `PAYLOAD_ADMIN_PASSWORD` | Initial admin password |

### Twenty CRM

| Variable | Notes |
|---|---|
| `TWENTY_APP_SECRET` | ≥32 char random string (e.g. `openssl rand -base64 32`) |
| `TWENTY_SERVER_URL` | `https://crm.nextacademyedu.com` |
| `TWENTY_CRM_URL` | Same as above (used by app to call Twenty API) |
| `TWENTY_CRM_API_KEY` | API key generated from Twenty UI Settings |
| `TWENTY_TAG` | Docker image tag, default `latest` |

### Security

| Variable | Notes |
|---|---|
| `CRON_SECRET` | Protects cron API endpoints |

---

## 4. Dockerfile Rules

The Dockerfile uses multi-stage build:

```
Stage 1: base       → node:22-alpine + pnpm
Stage 2: deps       → pnpm install --frozen-lockfile
Stage 3: builder    → pnpm build (Next.js standalone output)
Stage 4: runner     → Minimal Alpine image, copies .next/standalone + .next/static + public
```

### What to copy into the runner stage

```dockerfile
# These MUST be copied — they're needed at runtime:
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/messages ./src/messages  # ← i18n JSON files
```

### Healthcheck

```dockerfile
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=30s \
  CMD node -e "const h=require('http');const r=h.get('http://localhost:3001/api/health',s=>{process.exit(s.statusCode===200?0:1)});r.on('error',()=>process.exit(1));r.setTimeout(4000,()=>process.exit(1))"
```

> **⚠️ NEVER use wget** — `node:22-alpine` does not include it.
> **⚠️ Must also set the same healthcheck in docker-compose.yml** — Compose overrides Dockerfile.

---

## 5. Nginx Configuration

File: `nginx/nginx.conf`

**What it does:**
- HTTP → HTTPS redirect (port 80 → 443) for both domains
- SSL termination with Let's Encrypt certs
- Security headers (X-Frame-Options, HSTS, X-Content-Type-Options, etc.)
- Proxy `nextacademyedu.com` → `http://nextapp` (upstream → `app:3001`)
- Proxy `crm.nextacademyedu.com` → `http://twentyapp` (upstream → `twenty-server:3000`)
- Cache static assets (`/_next/static/` — 1 year, immutable)
- Max upload: 25MB (`client_max_body_size`)
- `server_tokens off` — hides nginx version

**SSL certs locations:**
```
/etc/letsencrypt/live/nextacademyedu.com/fullchain.pem
/etc/letsencrypt/live/crm.nextacademyedu.com/fullchain.pem
```

**Note on duplicate headers:** Both `nginx.conf` and `next.config.ts` set security headers. This is intentional — nginx covers static files, Next.js covers dynamic routes.

---

## 6. Known Issues & Solutions (from errors.md)

| Issue | Root Cause | Fix |
|---|---|---|
| Healthcheck fails, container killed | `wget` not in Alpine; Compose overrides Dockerfile | Use `node -e` in **both** Dockerfile AND docker-compose.yml |
| `/admin` returns 500 | Tables don't exist — `push: true` runs lazily | `instrumentation.ts` eagerly calls `getPayload()` before requests |
| `@payload-config` not found at runtime | TS path aliases don't resolve in standalone | Use relative imports: `./payload.config` |
| `pnpm-lock.yaml` stale after version change | `--frozen-lockfile` in Dockerfile fails | Always `pnpm install` after package.json changes; commit lockfile |
| DB empty after deployment | Coolify doesn't run Payload migrations | Manually run migration SQL via `psql` inside the `db` container |
| i18n keys missing, Footer crash | `src/messages/` not copied to runner stage | Add `COPY src/messages` to Dockerfile runner stage |

---

## 7. Deployment Workflow

### First Deployment

```text
1. Push code to GitHub repo linked to Coolify
2. Create DNS A record: crm.nextacademyedu.com → VPS IP
3. In Coolify dashboard:
   a. Create new service → Docker Compose
   b. Set all environment variables (§3 above, incl. Twenty CRM vars)
   c. Deploy
4. Wait for build + healthcheck pass
5. If DB already has data (existing pgdata volume):
   a. SSH into VPS
   b. docker exec -it nextacademy-db psql -U <DB_USER> -c "CREATE DATABASE twenty;"
   c. Restart twenty-server: docker compose restart twenty-server
6. Obtain SSL cert for CRM subdomain:
   docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d crm.nextacademyedu.com
7. Reload nginx: docker compose exec nginx nginx -s reload
8. Verify:
   - https://nextacademyedu.com → homepage loads
   - https://nextacademyedu.com/admin → login with PAYLOAD_ADMIN_EMAIL
   - https://nextacademyedu.com/api/health → returns 200
   - https://crm.nextacademyedu.com → Twenty CRM login
   - https://crm.nextacademyedu.com/healthz → returns 200
9. In Twenty UI: generate API key, set TWENTY_CRM_API_KEY in Coolify, restart app
```

### Subsequent Deployments

```text
1. Push to main → Coolify auto-deploys (if webhook configured)
   OR: Coolify dashboard → Deploy manually
2. Schema changes: push:true handles them automatically on next startup
3. If migration fails: check logs, run SQL manually if needed
4. Rollback: Coolify → Deployments → Redeploy previous successful build
```

---

## 8. Coolify-Specific Settings

```text
Build Pack:        Docker Compose
Docker Compose:    docker-compose.yml (root of repo)
Health Check Path: /api/health (on port 3001, internal)
Ports Exposed:     80 (HTTP), 443 (HTTPS) — via Nginx
Proxy:             Coolify manages reverse proxy at the edge
SSL:               Let's Encrypt via certbot container
Restart Policy:    unless-stopped (all services)
```

---

## 9. Troubleshooting

### Container keeps restarting
1. Check logs: `docker logs <container-name>`
2. Common causes: missing env vars, DB connection refused (db not ready), healthcheck failing
3. Solution: ensure `depends_on` with `condition: service_healthy` for db and redis

### Schema push not running
1. Check `instrumentation.ts` — must use relative import `./payload.config`
2. Check that `getPayload()` runs at startup (look for `[onInit]` log)
3. If stuck: `docker exec -it <db-container> psql -U postgres` → run migration SQL

### SSL cert expired
1. `docker compose run --rm certbot renew`
2. `docker compose exec nginx nginx -s reload`
3. Set up cron: `0 0 */60 * * docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload`

---

## 10. Security Reminders

- `X-Frame-Options: SAMEORIGIN` (nginx) / `DENY` (Next.js CSP `frame-ancestors 'none'`)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- CSP blocks external scripts except `accept.paymob.com`
- `server_tokens off` in nginx
- `poweredByHeader: false` in next.config.ts
- Admin panel restricted by user role — no public registration
- All API routes behind Payload access control
