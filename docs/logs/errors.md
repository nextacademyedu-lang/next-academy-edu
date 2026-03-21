# Next Academy — Error Log

> Format: `### [YYYY-MM-DD HH:MM] - Error Title` + error message + root cause + fix

---

### [2026-03-20 03:42] - CRM Domain Unhealthy: Self-Signed TLS + Upstream 503

**Error:**
- `https://crm.nextacademyedu.com/healthz` returns `503 Service Unavailable` with response body `no available server`.
- HTTPS certificate is not trusted (`CN=TRAEFIK DEFAULT CERT`, self-signed).
- Node clients fail on TLS handshake with `DEPTH_ZERO_SELF_SIGNED_CERT`.

**Root Cause:**
1. CRM domain is serving Traefik fallback/default certificate instead of valid CA-issued cert.
2. Reverse proxy has no healthy upstream available for the Twenty app route (`no available server`).
3. Even if route recovers, current certificate state alone will break secure API calls from strict HTTPS clients.

**Fix (required):**
1. In Coolify/Traefik, issue a valid certificate for `crm.nextacademyedu.com` (Let's Encrypt DNS/HTTP challenge).
2. Verify Twenty service target port/router health checks and ensure at least one healthy backend instance.
3. Re-test:
   - `curl -I https://crm.nextacademyedu.com/healthz` should return `200`.
   - Node `fetch('https://crm.nextacademyedu.com/healthz')` should succeed without TLS overrides.
4. Rotate leaked credentials and redact tracked `docs/logs/coolify/Variables.md`.

---

### [2026-03-16 ~20:00] - Coolify Deployment Failures (Batch)

Extracted from deployment logs. See `docs/engineering/coolify-deployment.md` §6 for full table.

| # | Error | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | `Cannot find module '@payloadcms/richtext-lexical/client'` | Missing `sharp` + Payload generate step | Add `sharp` to deps, run `pnpm payload generate:importmap` in build |
| 2 | `HEALTHCHECK` failing with `wget` | Alpine doesn't have `wget` | Use `node -e "fetch('http://localhost:3001/api/health')..."` |
| 3 | `nginx: host not found in upstream "nextacademy-app"` | Service name mismatch | Match `container_name` with nginx `proxy_pass` upstream |
| 4 | `password authentication failed for user "postgres"` | Wrong `DATABASE_URI` credentials | Verify `POSTGRES_USER` / `POSTGRES_PASSWORD` match across services |
| 5 | `ECONNREFUSED` to Redis | Redis not in same Docker network | Ensure `REDIS_URL=redis://redis:6379` and same network |
| 6 | Build OOM / timeout | Coolify default limits too low | Set build memory ≥ 4GB, timeout ≥ 600s |

---

### [2026-03-16 ~18:00] - Payload Admin CSS Broken by globals.css Resets

**Error:** Payload admin panel UI was completely broken — white text on white background, buttons unstyled, layout collapsed.

**Root Cause:** `globals.css` had global resets (`* { margin: 0 }`, `background: var(--bg-primary)` dark color, `button { border: none }`) that overrode Payload's internal styles.

**Fix V1 (failed):** Wrapped resets in `@layer frontend` — Next.js CSS bundler stripped layer content in production.

**Fix V2 (working):** Scoped all destructive resets under `html[data-app="frontend"]`. The `[locale]/layout.tsx` adds `data-app="frontend"` on `<html>`. Payload admin doesn't have this attribute, so resets don't apply there.

**Files:** `src/app/globals.css`, `src/app/[locale]/layout.tsx`, `src/app/(payload)/custom.scss`

---

### [2026-03-17 ~13:00] - Admin Users Cannot Sign In After Creation

**Error:** Newly created admin users get "Invalid credentials" when trying to login. Initial admin also cannot log back in after logging out.

**Root Cause:** Multiple issues combined:

1. `login/route.ts` returned `401` for ALL errors (including DB failures), masking the real problem
2. `.env` had `NEXT_PUBLIC_SERVER_URL=https://nextacademyedu.com` — local dev was authenticating against production domain
3. `reset-admin/route.ts` was searching for the wrong email (`nextacademyedu@gmail.com` instead of `admin@nextacademyedu.com`)

**Fix:**

1. Fixed error handling in `login/route.ts` — auth errors → 401, server errors → 500
2. Created `.env.local` with `localhost:3000` URLs
3. Deleted `reset-admin/route.ts` (also had hardcoded plain-text password — security risk)

---

### [2026-03-17 ~22:00] - Security: Hardcoded Password in `reset-admin/route.ts`

**Error:** `reset-admin/route.ts` contained `NextAcademy@2026!` as plain text in source code AND returned the new password in the HTTP response body.

**Root Cause:** Quick-fix route created without security review. Used a weak secret (`reset-next-academy-2026`) for authorization.

**Fix:** Deleted the file entirely. `seed-admin/route.ts` provides the same functionality securely (protected by `PAYLOAD_SECRET`, reads credentials from env vars).

---

### [2026-03-16 09:00] - Login Route 500 Error on Admin Panel

**Error:** `SyntaxError: Unexpected token '-', "------WebK"... is not valid JSON`

**Root Cause:** Payload CMS admin panel sends login requests as `multipart/form-data` with a `_payload` field containing JSON. The custom login route at `src/app/api/users/login/route.ts` only handled `application/json`, and called `req.json()` directly on the multipart body, causing a parse error.

**Fix:** Updated the login route to detect `Content-Type: multipart/form-data` and parse the `_payload` field via `req.formData()`, while falling back to `req.json()` for standard JSON requests.

**Files:** `src/app/api/users/login/route.ts`
