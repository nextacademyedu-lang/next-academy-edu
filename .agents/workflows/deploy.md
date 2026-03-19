---
description: Full deployment workflow to Coolify (Docker Compose on VPS) — first deploy, redeploy, rollback
---

// turbo-all

# Deploy to Coolify — Full Workflow

> **CRITICAL RULES** — Read `docs/engineering/coolify-deployment.md` BEFORE any deploy work.
> Architecture: Docker Compose → Next.js (standalone) + PostgreSQL 16 + Redis 7 + Nginx

---

## 0. Pre-Deploy Gate (ALWAYS run first)

Run `/pre-deploy-check` workflow. Only proceed if ALL checks pass.

---

## 1. FIRST Deployment

### 1.1 — Prepare GitHub Repo
1. Ensure `main` branch is clean and all tests pass:
   ```
   pnpm build
   ```
2. Confirm these files exist in repo root:
   - `Dockerfile` (multi-stage: base → deps → builder → runner)
   - `docker-compose.yml`
   - `nginx/nginx.conf`

### 1.2 — Coolify Dashboard Setup
1. Log in to Coolify dashboard
2. Create **New Service → Docker Compose**
3. Connect GitHub repo
4. Set **Docker Compose file**: `docker-compose.yml`
5. Set **Health Check Path**: `/api/health` (port 3001, internal)
6. Set **Exposed Ports**: `80` (HTTP), `443` (HTTPS) — via Nginx

### 1.3 — Set Environment Variables in Coolify UI
> ⚠️ NEVER put real secrets in `.env` files committed to git.
> All secrets go in **Coolify → Service → Environment Variables** only.

Set ALL variables from the table in `docs/engineering/coolify-deployment.md §3`:

| Category | Key Variables |
|---|---|
| **Required** | `DATABASE_URI`, `PAYLOAD_SECRET`, `NODE_ENV=production`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SERVER_URL`, `REDIS_URL` |
| **Payment** | `PAYMOB_API_KEY`, `PAYMOB_PUBLIC_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_WALLET_INTEGRATION_ID`, `PAYMOB_IFRAME_ID`, `PAYMOB_HMAC_SECRET`, `EASYKASH_API_TOKEN`, `EASYKASH_HMAC_SECRET` |
| **Email** | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME` |
| **Auth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PAYLOAD_ADMIN_EMAIL`, `PAYLOAD_ADMIN_PASSWORD` |
| **Security** | `CRON_SECRET` |

### 1.4 — Deploy
1. Click **Deploy** in Coolify
2. Watch build logs. Expected stages: `base → deps → builder → runner`
3. Wait for **healthcheck to pass** (checks `/api/health` on port 3001)

### 1.5 — Post-Deploy Verification
```bash
# 1. Homepage loads
curl -I https://nextacademyedu.com

# 2. Health endpoint
curl https://nextacademyedu.com/api/health  # → 200 OK

# 3. Admin panel
# Visit https://nextacademyedu.com/admin → should redirect to login
# Login with PAYLOAD_ADMIN_EMAIL + PAYLOAD_ADMIN_PASSWORD

# 4. Check logs for schema push (Payload push:true)
docker logs <app-container> | grep "onInit"
```

### 1.6 — If DB Is Empty (schema tables not created)
```bash
# SSH into VPS
ssh user@vps

# Enter the postgres container
docker exec -it <postgres-container> psql -U postgres

# Run migration SQL from the repo
# (check src/migrations/ for SQL files)
```
> Note: `push: true` in `payload.config.ts` + `instrumentation.ts` calls `getPayload()` eagerly.
> Schema should push automatically before the first HTTP request.

---

## 2. REDEPLOY (Subsequent Deployments)

### Automatic (preferred)
1. Push to `main` branch → Coolify webhook auto-triggers deploy
2. Monitor via Coolify dashboard → **Deployments** tab

### Manual
1. Coolify dashboard → Service → **Deploy** button
2. OR: SSH + `docker compose pull && docker compose up -d`

### After a Schema Change
- No action needed. `push: true` in Payload config handles schema sync on next startup.
- If migration fails: check `docker logs <app>`, then run SQL manually in the `db` container.

### After a Package.json Version Change
```bash
# ALWAYS run this locally before pushing:
pnpm install        # updates pnpm-lock.yaml
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
git push
```
> Dockerfile uses `--frozen-lockfile`. Stale lockfile = build failure.

---

## 3. ROLLBACK

1. Coolify dashboard → Service → **Deployments** tab
2. Find the last successful deployment
3. Click **Redeploy**
4. Verify health check passes after rollback

---

## 4. SSL Certificate Renewal

```bash
# Renew cert (run on VPS)
docker compose run --rm certbot renew

# Reload nginx to pick up new cert
docker compose exec nginx nginx -s reload

# Cron job (set once on the VPS):
0 0 */60 * * docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload
```

---

## 5. Helpful Docker Commands (run on VPS via SSH)

```bash
# View all containers
docker compose ps

# View app logs (live)
docker compose logs -f app

# View postgres logs
docker compose logs -f db

# Enter app container shell
docker exec -it <app-container> sh

# Enter postgres CLI
docker exec -it <db-container> psql -U postgres

# Restart a single service
docker compose restart app

# Force rebuild + redeploy (if image cache is stale)
docker compose build --no-cache app
docker compose up -d app
```

---

## 6. Common Deploy Failures & Fixes

| Symptom | Root Cause | Fix |
|---|---|---|
| Healthcheck fails, container restarts | `wget` used instead of `node -e` in healthcheck | Fix healthcheck in BOTH `Dockerfile` AND `docker-compose.yml` |
| Build fails: `--frozen-lockfile` | `pnpm-lock.yaml` stale | Run `pnpm install` locally, commit lockfile |
| `/admin` returns 500 after deploy | Schema not pushed (tables missing) | Check `instrumentation.ts` uses relative import `./payload.config` |
| `@payload-config` module not found | TS alias not resolved in standalone build | Change to relative import `./payload.config` |
| i18n keys missing in UI | `src/messages/` not copied to runner stage | Add `COPY src/messages` to Dockerfile runner stage |
| App starts but DB connection fails | `DATABASE_URI` using wrong container name | Use internal Docker network hostname (service name in compose) |
| Container restarts in a loop | Missing env var or DB not ready | Check `depends_on: condition: service_healthy` in docker-compose.yml |

---

## 7. Architecture Reference

```
Internet → Nginx (80/443) → app:3001 → PostgreSQL:5432
                                      → Redis:6379
```

- App port: **3001** (internal only, never expose publicly)
- Nginx handles SSL, security headers, static cache
- `push: true` in Payload = no manual migrations
- Admin auto-seeded via `onInit` if PAYLOAD_ADMIN_EMAIL + PAYLOAD_ADMIN_PASSWORD set

---

## After Deployment — Always Update Logs

```
☐ docs/logs/changelog.md — entry with date, what was deployed
☐ docs/logs/tasks.md — mark deployment task [x]
☐ docs/logs/errors.md — if any error was hit during deploy
```
