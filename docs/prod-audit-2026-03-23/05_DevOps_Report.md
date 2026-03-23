# DevOps Report — Production Audit

**Date:** 2026-03-23
**Target:** nextacademyedu.com (Coolify VPS)
**Stack:** Next.js 15 + Payload CMS 3 + PostgreSQL + Redis + Docker Compose

---

## SSL / TLS

| Domain | Status | Details |
| --- | --- | --- |
| `nextacademyedu.com` | ✅ Valid | Let's Encrypt cert, auto-renewed via Traefik |
| `www.nextacademyedu.com` | ✅ Valid | Same cert, redirects to non-www |
| `crm.nextacademyedu.com` | 🔴 INVALID | Self-signed `CN=TRAEFIK DEFAULT CERT` — Traefik is using fallback cert because the real cert was never issued or has expired |

**Fix for CRM domain:**
1. Check Coolify → Services → Twenty CRM → domain configuration
2. Ensure the domain `crm.nextacademyedu.com` has DNS A record pointing to VPS IP
3. Force cert re-issue via Traefik or Coolify UI
4. Verify with: `curl -vI https://crm.nextacademyedu.com/healthz 2>&1 | grep "subject:"`

---

## Build & Runtime

| Check | Result | Notes |
| --- | --- | --- |
| Health endpoint | ✅ 200 | `/api/health` returns `{"status":"ok"}` |
| Next.js production mode | ✅ | No development warnings observed |
| Static asset serving | ✅ | `/_next/static/` files served with proper hashing |
| Image optimization | ✅ | Next.js Image component working |
| Environment variables | ⚠️ | `NEXT_PUBLIC_SERVER_URL` suspected mismatch (see BUG-002) |

---

## Session / Cookie Configuration

| Attribute | Expected | Observed | Status |
| --- | --- | --- | --- |
| Cookie name | `payload-token` | `payload-token` | ✅ |
| `HttpOnly` | `true` | Needs verification via DevTools | ⚠️ |
| `Secure` | `true` | Needs verification | ⚠️ |
| `SameSite` | `Lax` | Suspected `Strict` or missing (BUG-007) | 🔴 |
| `Path` | `/` | Needs verification | ⚠️ |
| `Domain` | `.nextacademyedu.com` | Needs verification | ⚠️ |

**Impact:** If `SameSite=Strict`, cookies won't be sent on cross-origin redirects (e.g., from Paymob callback). If `Domain` is wrong, API calls from subpaths won't include the cookie.

**Fix:**
```typescript
// In payload.config.ts or server config
cookie: {
  secure: true,
  sameSite: 'lax',
  domain: '.nextacademyedu.com',
  path: '/',
}
```

---

## Container / Service Health

| Service | Status | Notes |
| --- | --- | --- |
| Next.js app | ✅ Running | Responding on port 443 |
| PostgreSQL | ✅ Running | Data serving correctly through Payload |
| Redis | ✅ Running | Session/cache working (login persists) |
| Twenty CRM | 🔴 Down | Port 443 returns 503, self-signed cert |
| Traefik proxy | ✅ Running | Routing all domains |

---

## Config Drift Analysis

| Config | Source of Truth | Production | Match |
| --- | --- | --- | --- |
| `DATABASE_URL` | `.env.production` | N/A (not accessible) | ⚠️ Cannot verify |
| `PAYLOAD_SECRET` | `.env.production` | N/A | ⚠️ Cannot verify |
| `NEXT_PUBLIC_SERVER_URL` | `.env.production` | Suspected mismatch | 🔴 Needs audit |
| `CRON_SECRET` | `.env.production` | Working (cron endpoints reject without it) | ✅ |
| `PAYMOB_HMAC_SECRET` | `.env.production` | N/A (webhook not tested) | ⚠️ |

---

## Logs Analysis

| Log Area | Finding |
| --- | --- |
| Application errors | No 500 errors observed during testing (healthy) |
| Booking API | 401 responses logged — consistent with BUG-002 |
| CRM sync cron | Expected to fail silently due to CRM being down |
| Build warnings | None observed in production bundle |

---

## Recommendations

| Priority | Action |
| --- | --- |
| P0 | Audit and fix `payload-token` cookie attributes |
| P0 | Fix `NEXT_PUBLIC_SERVER_URL` if it doesn't match `https://nextacademyedu.com` |
| P1 | Issue valid TLS cert for `crm.nextacademyedu.com` |
| P1 | Restart Twenty CRM container and verify health |
| P2 | Add `Cache-Control` headers via Traefik for static assets |
| P3 | Set up healthcheck alerts for all containers |
| P3 | Implement log aggregation (e.g., Loki + Grafana) |
