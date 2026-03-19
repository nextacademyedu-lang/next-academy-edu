---
description: Pre-deployment checklist — run before every deploy to Coolify to catch build failures early
---

// turbo-all

# Pre-Deploy Checklist

> Run this BEFORE every deployment. A failed deploy is more expensive than a failed check.
> If any step fails, STOP and fix it before pushing.

---

## Step 1 — Build Passes Locally

```bash
# Clean build (simulates Dockerfile builder stage)
pnpm build
```

**Expected:** Zero TypeScript errors. Zero build errors. Standalone output in `.next/standalone/`.

**Common errors and fixes:**
- `@payload-config not found` → Change to relative import `../../payload.config`
- `Cannot find module` → Check import paths, run `pnpm install`
- TypeScript strict errors → Fix all `any` types before pushing

---

## Step 2 — Lockfile Is Synced

```bash
# Check for uncommitted lockfile changes
git diff pnpm-lock.yaml
```

**Expected:** No diff. If there is a diff:
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: sync lockfile"
```

> **Why this matters:** Dockerfile uses `--frozen-lockfile`. A stale lockfile = build failure in CI/Coolify.

---

## Step 3 — Dockerfile Healthcheck Is Correct

Open `Dockerfile` and confirm the HEALTHCHECK uses `node -e`, NOT `wget` or `curl`:

```dockerfile
# ✅ CORRECT
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=30s \
  CMD node -e "const h=require('http');const r=h.get('http://localhost:3001/api/health',s=>{process.exit(s.statusCode===200?0:1)});r.on('error',()=>process.exit(1));r.setTimeout(4000,()=>process.exit(1))"

# ❌ WRONG — Alpine doesn't have wget
HEALTHCHECK CMD wget -qO- http://localhost:3001/api/health
```

Also confirm `docker-compose.yml` has the SAME `node -e` healthcheck for the `app` service.
> Compose overrides Dockerfile. Both must be correct.

---

## Step 4 — Runtime Files Are Copied to Runner Stage

In `Dockerfile`, the runner stage must copy:

```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/messages ./src/messages   # ← i18n — NEVER forget this
```

If `src/messages/` is missing from the runner stage: i18n keys will be undefined and the UI will crash.

---

## Step 5 — instrumentation.ts Uses Relative Import

```bash
grep -n "payload-config\|payload.config" src/instrumentation.ts
```

**Expected:** `./payload.config` (relative path)
**NOT:** `@payload-config` (TS alias — doesn't resolve in standalone mode)

---

## Step 6 — Environment Variables Are Set in Coolify

Cross-check against `docs/engineering/coolify-deployment.md §3`.
Required minimum set:

```
☐ DATABASE_URI
☐ PAYLOAD_SECRET (≥32 chars)
☐ NODE_ENV=production
☐ NEXT_PUBLIC_APP_URL
☐ NEXT_PUBLIC_SERVER_URL
☐ REDIS_URL
☐ RESEND_API_KEY
☐ PAYLOAD_ADMIN_EMAIL
☐ PAYLOAD_ADMIN_PASSWORD
☐ CRON_SECRET
```

> Do NOT commit secrets to git. Set them in Coolify UI only.

---

## Step 7 — Health Endpoint Exists

```bash
# Test locally
pnpm dev &
sleep 5
curl http://localhost:3000/api/health
```

**Expected:** `200 OK` with JSON response.

If the endpoint doesn't exist:
- Check `src/app/api/health/route.ts`
- The endpoint must return `{ status: 'ok' }` with HTTP 200

---

## Step 8 — No console.log Left in Production Code

```bash
# Scan for leftover console.log
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v ".test."
```

Remove any `console.log` not guarded by `process.env.NODE_ENV !== 'production'`.

---

## Step 9 — i18n Keys Exist in Both Languages

Any new UI text must be in BOTH files:
```bash
# Check ar.json and en.json are in sync
diff <(node -e "const k=Object.keys(require('./src/messages/ar.json'));k.sort();console.log(k.join('\n'))") \
     <(node -e "const k=Object.keys(require('./src/messages/en.json'));k.sort();console.log(k.join('\n'))")
```

---

## Step 10 — Git Status Is Clean

```bash
git status
git log --oneline -5
```

**Expected:** Working tree clean. All changes committed on the correct branch.

```bash
# Push to main (triggers Coolify auto-deploy if webhook is set)
git push origin main
```

---

## ✅ All Checks Passed?

Proceed to `/deploy` workflow.

## ❌ Any Check Failed?

Fix it NOW. Do NOT deploy broken code to production.
Update `docs/logs/errors.md` if you encountered a new error pattern.
