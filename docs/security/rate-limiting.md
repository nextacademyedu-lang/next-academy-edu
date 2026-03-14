# Next Academy — Rate Limiting Strategy

> Last Updated: 2026-03-13 04:00
> Implementation: Custom middleware (or `next-rate-limit` / `upstash/ratelimit`)

---

## 1. Rate Limiting Overview

```text
Purpose:
├── Prevent brute force attacks on login/registration
├── Prevent API abuse (scraping, DDoS)
├── Protect payment endpoints from rapid-fire requests
├── Prevent spam (reviews, support requests, notifications)
├── Fair usage for shared resources (search, CRM sync)
└── Protect against automated enumeration (user existence, discount codes)
```

---

## 2. Rate Limits by Endpoint

### Authentication (Strictest)

| Endpoint | Limit | Window | Key | Blocking |
|---|---|---|---|---|
| `POST /api/users/login` | 10 req | 1 min | IP | 429 + Retry-After |
| `POST /api/users/login` | 50 req | 1 hour | IP | 429 + 15 min block |
| `POST /api/users` (register) | 5 req | 1 min | IP | 429 |
| `POST /api/users/forgot-password` | 3 req | 5 min | IP | 429 |
| `POST /api/users/forgot-password` | 3 req | 1 hour | Email | 429 (silent) |

### Payment (Critical)

| Endpoint | Limit | Window | Key | Blocking |
|---|---|---|---|---|
| `POST /api/payments/:id/process` | 5 req | 5 min | User | 429 + "انتظر شوية" |
| `POST /api/webhooks/paymob` | 100 req | 1 min | IP whitelist | 401 if not Paymob |
| `POST /api/discount-codes/validate` | 20 req | 5 min | User | 429 |
| `POST /api/bookings` | 10 req | 5 min | User | 429 |

### Public API (Moderate)

| Endpoint | Limit | Window | Key | Blocking |
|---|---|---|---|---|
| `GET /api/programs` | 60 req | 1 min | IP | 429 |
| `GET /api/search` | 30 req | 1 min | IP | 429 |
| `GET /api/instructors/:slug/availability` | 30 req | 1 min | IP | 429 |
| `GET /api/programs/:slug` | 30 req | 1 min | IP | 429 |

### User Actions (Standard)

| Endpoint | Limit | Window | Key | Blocking |
|---|---|---|---|---|
| `POST /api/reviews` | 5 req | 1 hour | User | 429 |
| `POST /api/refund-requests` | 3 req | 1 hour | User | 429 |
| `POST /api/installment-requests` | 5 req | 1 hour | User | 429 |
| `POST /api/waitlist` | 10 req | 5 min | User | 429 |
| `POST /api/consultation-bookings` | 10 req | 5 min | User | 429 |
| `PUT /api/users/me` | 10 req | 5 min | User | 429 |

### File Upload

| Endpoint | Limit | Window | Key | Blocking |
|---|---|---|---|---|
| `POST /api/media` | 20 req | 1 hour | User | 429 |
| Total upload size | 100 MB | 1 hour | User | 413 |

---

## 3. Implementation

### 3.1 Middleware Pattern

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({ url: process.env.UPSTASH_URL, token: process.env.UPSTASH_TOKEN });

export const rateLimits = {
  auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m') }),
  payment: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '5 m') }),
  api: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m') }),
  search: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m') }),
  upload: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, '1 h') }),
};

// Usage in API routes:
const { success, limit, remaining, reset } = await rateLimits.auth.limit(ip);
if (!success) {
  return Response.json(
    { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'طلبات كتير. استنى شوية' } },
    { status: 429, headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) } }
  );
}
```

### 3.2 Response Headers

```text
All rate-limited responses include:
├── X-RateLimit-Limit: 60 (max requests)
├── X-RateLimit-Remaining: 45 (remaining)
├── X-RateLimit-Reset: 1709251200 (reset timestamp)
└── Retry-After: 30 (seconds until retry, on 429 only)
```

---

## 4. Abuse Detection & Response

### 4.1 Suspicious Patterns

| Pattern | Detection | Response |
|---|---|---|
| 50+ login failures from 1 IP | Rate limit counter | Block IP for 1 hour + alert |
| 100+ API calls in 1 min from 1 IP | Rate limit counter | Block IP for 30 min |
| Discount code enumeration (rapid validation) | 20+ validations in 5 min | Block user + alert admin |
| Scraping (sequential program pages) | Pattern detection | CAPTCHA challenge |
| Payment link brute force | 10+ attempts on invalid links | Block IP + alert |

### 4.2 IP Banning

```text
Automatic Ban:
├── 3 × rate limit violations in 1 hour → 4 hour ban
├── Webhook from unauthorized IP → permanent block
├── Detected SQL injection attempt → permanent block + alert
└── 5 × failed payment link access → 24 hour ban

Manual Ban:
├── Admin can ban IP from Payload admin panel
├── Ban list stored in Redis for O(1) lookup
└── Banned IPs get 403 on ALL endpoints
```

---

## 5. DDoS Mitigation

```text
Layers:
├── Layer 1: Vercel Edge Network (automatic DDoS protection)
├── Layer 2: Rate limiting (per-route, as defined above)
├── Layer 3: Cloudflare (optional, if under sustained attack)
│   ├── Under Attack Mode
│   ├── Bot Fight Mode
│   └── WAF rules
└── Layer 4: Application-level circuit breaker
    ├── If request queue > 1000 → return 503
    └── If DB connections exhausted → return 503 + "الموقع مشغول"
```
