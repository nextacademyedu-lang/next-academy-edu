# Next Academy — Deployment Guide (DEPRECATED)

> ⚠️ **DEPRECATED:** This guide was written for a Vercel + Neon setup.
> The project has migrated to **Coolify (self-hosted Docker Compose on VPS)**.
> **Use [`coolify-deployment.md`](file:///d:/projects/nextacademy/docs/engineering/coolify-deployment.md) instead.**

> Last Updated: 2026-03-17 15:40 (deprecated)
> ~~Hosting: Vercel (website) + Railway (CRM) + Neon (Database)~~
> Current Hosting: **Coolify** — see `docs/engineering/coolify-deployment.md`

---

## 1. Infrastructure Overview

```text
┌─────────────────────────┐
│     Vercel (Frontend)   │
│  nextacademyedu.com     │
│  ├── Next.js 15         │
│  ├── Payload CMS Admin  │
│  ├── API Routes         │
│  └── Cron Jobs          │
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌────────────┐
│ Neon   │   │ Railway    │
│ DB     │   │ Twenty CRM │
│(Postgres)  │(Optional)  │
└────────┘   └────────────┘
    ▲
    │
┌───┴──────────────┐
│ Cloudflare R2    │
│ (Media Storage)  │
└──────────────────┘
```

---

## 2. Pre-Deployment Checklist

### 2.1 Environment & Secrets
- [ ] All env vars set in Vercel dashboard
- [ ] `PAYLOAD_SECRET` is crypto-random (≥32 chars)
- [ ] `DATABASE_URI` points to Neon production DB
- [ ] No fallback values in production code
- [ ] `.env` files NOT in git

### 2.2 Database
- [ ] Neon project created in production region (closest to Egypt: `eu-central-1`)
- [ ] Database schema migrated (Payload auto-creates tables on first run)
- [ ] Initial admin user seeded
- [ ] Indexes created (from `prd.md` SQL indexing section)
- [ ] Connection pooling configured (Neon auto-handles)
- [ ] Point-in-Time Recovery enabled

### 2.3 Domain & SSL
- [ ] Domain `nextacademyedu.com` configured in Vercel
- [ ] SSL auto-provisioned by Vercel
- [ ] `www` redirects to non-www (or vice-versa)
- [ ] HSTS header configured
- [ ] DNS propagation verified

### 2.4 Payment Gateway
- [ ] Paymob production API keys set
- [ ] Webhook URL registered: `https://nextacademyedu.com/api/webhooks/paymob`
- [ ] HMAC secret configured
- [ ] Test transaction successful
- [ ] Refund API tested

### 2.5 Email
- [ ] Domain verified in Resend
- [ ] SPF, DKIM, DMARC records added
- [ ] Test email sent from production
- [ ] Email templates tested (all 13)

### 2.6 Security
- [ ] Security headers configured in `next.config.ts`
- [ ] Rate limiting enabled (Upstash Redis)
- [ ] Admin panel accessible only to admin role
- [ ] Payload CMS admin path optionally changed (e.g., `/admin-panel`)
- [ ] File upload size limits enforced
- [ ] CORS policy configured

### 2.7 Monitoring
- [ ] Sentry configured with production DSN
- [ ] Source maps uploaded to Sentry
- [ ] Health check endpoint working: `/api/health`
- [ ] Error alerting configured (Slack/email)
- [ ] Vercel Analytics enabled

### 2.8 Build
- [ ] `pnpm build` passes with zero errors
- [ ] No TypeScript `any` types
- [ ] Bundle size within budget (<250KB first load)
- [ ] No console.log statements in production
- [ ] Image optimization configured

---

## 3. Deployment Steps

### 3.1 First Deployment

```bash
# 1. Create Vercel project
vercel link

# 2. Set environment variables
vercel env add DATABASE_URI production
vercel env add PAYLOAD_SECRET production
# ... (all required vars)

# 3. Deploy
vercel deploy --prod

# 4. Run initial setup
# Visit https://nextacademyedu.com/admin
# Create first admin account using PAYLOAD_ADMIN_EMAIL/PASSWORD

# 5. Seed initial data
# Programs, instructors, categories via admin panel
# Or run seed script: pnpm seed

# 6. Verify
# Test login, booking flow, payment (sandbox first)
```

### 3.2 Subsequent Deployments

```text
Automatic (Recommended):
├── Push to main branch → Vercel auto-deploys
├── Preview deployments on PR branches
├── Rollback: Vercel dashboard → Deployments → Promote previous

Manual:
├── vercel deploy --prod
├── Verify: check /api/health
└── Monitor: check Sentry for new errors
```

---

## 4. Database Migrations

```text
Payload CMS handles migrations automatically:
├── On first deploy → creates all tables
├── On schema change → Payload generates and applies migration
├── Migration files: src/migrations/
├── ALWAYS backup before migration
└── Test migration on preview/staging first

Manual Migration (if needed):
├── Connect to Neon dashboard
├── Run SQL in SQL Editor
├── NEVER run destructive SQL on production without backup
└── Document in changelog.md
```

---

## 5. Rollback Procedure

```text
If deployment breaks production:
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production" (instant rollback)
4. If DB migration was involved:
   ├── Neon → Branches → restore from backup
   └── OR Neon → PITR → select timestamp before migration
5. Document incident in errors.md
```

---

## 6. Scaling Strategy

```text
Phase 1 (Launch): Free/Hobby Tier
├── Vercel: Hobby (adequate for initial traffic)
├── Neon: Free tier (0.5 GB, auto-suspend)
├── Resend: Free (3000 emails/month)
└── Expected: <1000 users, <100 bookings/month

Phase 2 (Growth): Pro Tier
├── Vercel: Pro ($20/month for team features)
├── Neon: Pro ($19/month, 10 GB, no auto-suspend)
├── Resend: Pro ($25/month, 50,000 emails)
├── Upstash Redis: Pay-per-use for rate limiting
└── Expected: 1000-10,000 users

Phase 3 (Scale): Enterprise
├── Vercel: Enterprise (custom)
├── Neon: Scale (100 GB+, read replicas)
├── Dedicated search (Algolia/Meilisearch)
├── CDN for media (Cloudflare)
└── Expected: 10,000+ users
```
