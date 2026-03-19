---
description: Production debugging — diagnose container crashes, auth issues, schema failures, and email problems
---

// turbo-all

# Debug Production Issues

> Use this workflow when something is broken in the live Coolify deployment.
> Always start with logs. Never guess — read the evidence first.

---

## 1. Container Crashing / Restarting in a Loop

### Diagnose
```bash
# SSH into VPS
ssh user@vps-ip

# View container status
docker compose ps

# Get logs for the crashing container
docker compose logs --tail=100 app
docker compose logs --tail=50 db
docker compose logs --tail=50 redis
```

### Common Causes

| Symptom in logs | Root Cause | Fix |
|---|---|---|
| `ECONNREFUSED db:5432` | DB not ready at app start | Ensure `depends_on: condition: service_healthy` in compose |
| `ECONNREFUSED redis:6379` | Redis not started | Same fix — depends_on redis with service_healthy |
| `MODULE_NOT_FOUND @payload-config` | TS alias in standalone | Change to relative import in `instrumentation.ts` |
| `HealthCheck failed` | healthcheck using wget | Fix to `node -e` in BOTH Dockerfile and docker-compose.yml |
| `Invalid environment variable` | Missing required env var | Add missing var in Coolify → Environment Variables → redeploy |
| `PAYLOAD_SECRET must be set` | Missing secret | Set `PAYLOAD_SECRET` in Coolify |

---

## 2. `/admin` Returns 500 or Tables Don't Exist

### Diagnose
```bash
# Check if tables exist in postgres
docker exec -it <db-container> psql -U postgres -c "\dt"
```

### Fix: Force Schema Push
```bash
# Restart the app — instrumentation.ts runs getPayload() eagerly
docker compose restart app

# Watch logs for schema push
docker compose logs -f app | grep -E "onInit|push|schema|error"
```

### Fix: Manual Migration (last resort)
```bash
docker exec -it <db-container> psql -U postgres

# Run migration SQL files from src/migrations/
\i /path/to/migration.sql
```

---

## 3. Auth / Login Issues

### Symptom: Can't log in after creating account

**Root cause from past debugging:** Payload auth uses `PAYLOAD_SECRET` to sign session JWTs.
If `PAYLOAD_SECRET` changes between deploys, ALL sessions are invalidated.

**Checklist:**
```
☐ PAYLOAD_SECRET is stable (same value across deploys)
☐ User was created via Payload admin (not frontend registration form)
☐ Cookies are cleared in the browser
☐ Correct email/password (check PAYLOAD_ADMIN_EMAIL in Coolify)
```

### Symptom: Password reset email not sending

**Checklist:**
```
☐ RESEND_API_KEY set correctly in Coolify
☐ RESEND_FROM_EMAIL is a verified domain in Resend dashboard
☐ Check src/lib/resend.ts for correct template IDs
☐ Run: curl https://nextacademyedu.com/api/test-email (if test endpoint exists)
```

**Debug Resend:**
```bash
# Check app logs for email errors
docker compose logs app | grep -i "resend\|email\|ECONNREFUSED"
```

---

## 4. SSL / HTTPS Issues

### Cert Expired
```bash
# Check cert status
docker compose exec nginx openssl s_client -connect nextacademyedu.com:443 | grep "notAfter"

# Renew
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

### Nginx Not Starting
```bash
docker compose logs nginx

# Common: cert files don't exist yet (first deploy)
# Solution: comment out SSL blocks in nginx.conf, deploy, get cert, uncomment
```

---

## 5. Performance / Slow Responses

### Check Resource Usage
```bash
# CPU and memory
docker stats

# Specific container
docker stats <app-container>
```

### Check Postgres Query Performance
```bash
docker exec -it <db-container> psql -U postgres

-- Slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND (now() - pg_stat_activity.query_start) > interval '5 seconds';

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 6. Email Templates Not Working (Resend)

### Diagnose
1. Go to Resend dashboard → Emails → check delivery status
2. Check logs: `docker compose logs app | grep -i resend`
3. Check template IDs match what's in `src/lib/resend.ts`

### Common Issues

| Problem | Fix |
|---|---|
| `domain not verified` | Verify domain DNS records in Resend |
| `template_id not found` | Check template IDs in Resend dashboard vs code |
| `401 Unauthorized` | RESEND_API_KEY is wrong or expired |
| Email goes to spam | Check SPF/DKIM records for sending domain |

---

## 7. Viewing Full Deployment Logs

```bash
# All logs since last deploy
docker compose logs --since="2h" app

# Filter to errors only
docker compose logs app 2>&1 | grep -i "error\|failed\|unhandled"

# Save logs to file
docker compose logs app > /tmp/app-logs-$(date +%Y%m%d-%H%M).txt
```

---

## 8. Emergency: Full Restart

```bash
# Restart all services (downtime: ~30s)
docker compose restart

# Full stop and start
docker compose down && docker compose up -d

# Force rebuild (takes 5-10 min)
docker compose build --no-cache app && docker compose up -d
```

---

## 9. Rollback (When Nothing Else Works)

1. Coolify dashboard → Service → **Deployments** tab
2. Find last **green** (successful) deployment
3. Click **Redeploy**
4. Confirm health check passes

---

## 10. After Fixing — Always

```bash
# Update logs
# docs/logs/errors.md  — document the error, root cause, fix
# docs/logs/changelog.md — document what was changed
```

Report format for `errors.md`:
```markdown
### [YYYY-MM-DD HH:MM] — [Short description]
- **Error:** [exact error message]
- **Root cause:** [why it happened]
- **Fix:** [what was done]
- **Prevention:** [how to avoid next time]
```
