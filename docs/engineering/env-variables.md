# Next Academy — Environment Variables Reference

> Last Updated: 2026-03-13 04:00
> File: `.env.local` (development) / Vercel Environment Variables (production)

---

## ⚠️ RULES

```text
1. NEVER commit .env files to git
2. NEVER hardcode secrets in source code
3. NEVER use fallback values for secrets in production
4. All NEXT_PUBLIC_ vars are visible to the browser — never put secrets there
5. Rotate secrets every 6 months (or immediately on suspected compromise)
```

---

## Required Variables

### Database

| Variable | Example | Required | Description |
|---|---|---|---|
| `DATABASE_URI` | `postgresql://user:pass@host:5432/db?sslmode=require` | ✅ | Neon PostgreSQL connection string |

### Payload CMS

| Variable | Example | Required | Description |
|---|---|---|---|
| `PAYLOAD_SECRET` | `a1b2c3d4e5f6...` (min 32 chars) | ✅ | JWT signing secret — crypto random |
| `PAYLOAD_ADMIN_EMAIL` | `admin@nextacademyedu.com` | ✅ | Initial admin email (first run) |
| `PAYLOAD_ADMIN_PASSWORD` | `SecureP@ss123` | ✅ | Initial admin password (first run) |

### Payment — Paymob

| Variable | Example | Required | Description |
|---|---|---|---|
| `PAYMOB_API_KEY` | `ZXlK...` | ✅ | Paymob API key |
| `PAYMOB_INTEGRATION_ID` | `123456` | ✅ | Card payment integration ID |
| `PAYMOB_IFRAME_ID` | `654321` | ✅ | Paymob iframe ID for card form |
| `PAYMOB_HMAC_SECRET` | `abc123...` | ✅ | Webhook HMAC verification key |
| `PAYMOB_WALLET_INTEGRATION_ID` | `789012` | ⬜ | Mobile wallet integration ID |

### Email — Resend

| Variable | Example | Required | Description |
|---|---|---|---|
| `RESEND_API_KEY` | `re_abc123...` | ✅ | Resend API key |
| `RESEND_FROM_EMAIL` | `noreply@nextacademyedu.com` | ✅ | Sender email (verified domain) |
| `RESEND_REPLY_TO` | `support@nextacademyedu.com` | ⬜ | Reply-to address |

### WhatsApp — Evolution API

| Variable | Example | Required | Description |
|---|---|---|---|
| `EVOLUTION_API_URL` | `https://api.evolution.example.com` | ⬜ | Evolution API base URL |
| `EVOLUTION_API_KEY` | `ev_key_123` | ⬜ | Evolution API key |
| `EVOLUTION_INSTANCE` | `nextacademy` | ⬜ | WhatsApp instance name |

### CRM — Twenty CRM

| Variable | Example | Required | Description |
|---|---|---|---|
| `TWENTY_CRM_URL` | `https://crm.nextacademyedu.com` | ⬜ | Twenty CRM base URL |
| `TWENTY_CRM_API_KEY` | `twenty_key_123` | ⬜ | Twenty CRM API key |

### Google Services

| Variable | Example | Required | Description |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | `123456.apps.googleusercontent.com` | ⬜ | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-abc123` | ⬜ | OAuth client secret |
| `GOOGLE_CALENDAR_CREDENTIALS` | `{...}` (JSON) | ⬜ | Service account JSON |

### Storage

| Variable | Example | Required | Description |
|---|---|---|---|
| `S3_BUCKET` | `nextacademy-media` | ⬜ | S3/R2 bucket name |
| `S3_REGION` | `auto` | ⬜ | Region |
| `S3_ACCESS_KEY` | `AKIAIOSFODNN7EXAMPLE` | ⬜ | Access key |
| `S3_SECRET_KEY` | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | ⬜ | Secret key |
| `S3_ENDPOINT` | `https://abc.r2.cloudflarestorage.com` | ⬜ | S3-compatible endpoint |

### Rate Limiting

| Variable | Example | Required | Description |
|---|---|---|---|
| `UPSTASH_URL` | `https://xxx.upstash.io` | ⬜ | Upstash Redis URL |
| `UPSTASH_TOKEN` | `AYxxASQg...` | ⬜ | Upstash Redis token |

### Monitoring

| Variable | Example | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://abc@sentry.io/123` | ⬜ | Sentry DSN (client-safe) |
| `SENTRY_AUTH_TOKEN` | `sntrys_abc...` | ⬜ | Sentry source maps token |

### Public Variables (Client-Safe)

| Variable | Example | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://nextacademyedu.com` | ✅ | Public site URL |
| `NEXT_PUBLIC_SENTRY_DSN` | (see above) | ⬜ | Sentry for browser errors |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | ⬜ | Google Analytics 4 |

---

## Environment Files

```text
.env.local          → Development (gitignored)
.env.test           → Test database config (gitignored)
Vercel Dashboard     → Production secrets
Vercel Preview       → Staging secrets (can differ)
```

---

## Generating Secrets

```bash
# Generate PAYLOAD_SECRET (32+ chars, crypto random)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate PAYMOB_HMAC_SECRET (from Paymob dashboard)
# → Settings → API Credentials → HMAC Secret
```
