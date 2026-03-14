# Next Academy — Monitoring & Logging Strategy

> Last Updated: 2026-03-13 04:00
> Tools: Sentry (errors), Vercel Analytics (performance), Custom logging

---

## 1. Monitoring Layers

```text
Layer 1: Error Tracking (Sentry)
├── Client-side JavaScript errors
├── Server-side API errors
├── Unhandled promise rejections
├── Source maps for stack traces
└── User context (ID + role, never PII)

Layer 2: Performance Monitoring (Vercel Analytics)
├── Core Web Vitals (LCP, FID, CLS)
├── Server-side rendering time
├── API response times
├── Geographic distribution
└── Device/browser breakdown

Layer 3: Application Logging (Custom)
├── Auth events (login, logout, failures)
├── Payment events (success, failure, refund)
├── Booking lifecycle events
├── Integration health (CRM, email, WhatsApp)
└── Cron job execution logs

Layer 4: Infrastructure (Vercel + Neon)
├── Deployment status
├── Build failures
├── Database metrics (connections, queries, storage)
├── Edge function execution
└── Bandwidth usage
```

---

## 2. Logging Format

### 2.1 Structured Logging

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  timestamp: string;      // ISO 8601 UTC
  level: LogLevel;
  event: string;          // dot-notation: "payment.webhook.received"
  message: string;        // human-readable
  actor?: {
    id: string;           // user ID
    role: string;         // user role
    ip?: string;          // request IP (masked in logs)
  };
  resource?: {
    type: string;         // "booking", "payment", "user"
    id: string;
  };
  metadata?: Record<string, unknown>;  // additional context
  duration_ms?: number;                // for performance tracking
  error?: {
    name: string;
    message: string;
    stack?: string;       // only in development
  };
}

// Usage:
logger.info('payment.completed', 'Payment processed successfully', {
  actor: { id: userId, role: 'user' },
  resource: { type: 'payment', id: paymentId },
  metadata: { amount: 3000, method: 'card', transaction_id: 'txn_123' },
});
```

### 2.2 PII Masking

```text
Never log:
├── Passwords (plain or hashed)
├── National ID numbers
├── Full credit card numbers
├── API keys or secrets
└── Session tokens

Mask in logs:
├── Email: "a***d@example.com"
├── Phone: "+20101***5678"
├── Name: Use user ID instead
└── IP: "1.2.X.X" (last octet masked)
```

---

## 3. Alert Rules

### 3.1 Critical Alerts (Immediate — Slack + Email)

| Alert | Condition | Action |
|---|---|---|
| Payment webhook failed | HMAC verification fails | Investigate — possible fraud |
| Database down | Health check fails 3 consecutive times | Check Neon status, restart if needed |
| Error rate spike | >5% of requests return 500 | Check Sentry, potential outage |
| Unauthorized admin access | Failed admin login from new IP | Review auth logs |
| Paymob API down | 3 consecutive failures | Enable alternative payment message |

### 3.2 Warning Alerts (1 hour — Slack only)

| Alert | Condition | Action |
|---|---|---|
| High error rate | >1% of requests return 500 | Review Sentry |
| Slow API responses | P95 > 2 seconds | Check DB queries |
| Email delivery failures | >10% bounce rate | Check Resend dashboard |
| CRM sync backlog | >50 unsynced records | Check CRM health |
| Cron job missed | Expected cron didn't run | Check Vercel cron logs |

### 3.3 Info Alerts (Daily digest — Email)

| Alert | Condition | Action |
|---|---|---|
| New user registrations | Daily count | Track growth |
| Bookings created | Daily count + revenue | Business metrics |
| Payment reconciliation | Mismatches found | Manual review |
| Overdue installments | Count of overdue | Follow up |
| Storage usage | >80% capacity | Plan upgrade |

---

## 4. Dashboards

### 4.1 Business Dashboard (Admin Panel)

```text
Real-time Metrics:
├── Total users (today, this week, this month)
├── Active bookings count
├── Revenue (today, this week, this month)
├── Conversion rate (visitors → bookings)
├── Top programs by bookings
├── Overdue installments count
├── Waitlist queue size
└── Upcoming sessions this week
```

### 4.2 Technical Dashboard (Vercel/Sentry)

```text
Sentry:
├── Error count by type
├── Affected users count
├── Error trends (7-day graph)
└── Release health (crash-free rate)

Vercel:
├── Core Web Vitals scores
├── Request count and latency
├── Build times
└── Edge function usage
```

---

## 5. Health Checks

### 5.1 Endpoint: GET /api/health

```typescript
// Runs every 30 seconds via uptime monitor
export async function GET() {
  const checks = {
    database: await checkDatabase(),    // SELECT 1
    paymob: await checkPaymob(),        // Ping API
    resend: await checkResend(),        // Verify API key
    crm: await checkCRM(),              // Ping Twenty CRM
    whatsapp: await checkWhatsApp(),    // Ping Evolution API
  };

  const allHealthy = Object.values(checks).every(c => c === 'ok');
  const criticalDown = checks.database !== 'ok' || checks.paymob !== 'ok';

  return Response.json({
    status: criticalDown ? 'down' : allHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
  }, { status: criticalDown ? 503 : 200 });
}
```

### 5.2 External Monitoring

```text
Uptime Monitor (e.g., Betterstack/UptimeRobot):
├── URL: https://nextacademyedu.com/api/health
├── Interval: 1 minute
├── Alert: if status != 200 for 3 consecutive checks
├── Notify: Slack + Email + SMS (for critical)
└── Status page: status.nextacademyedu.com (optional)
```

---

## 6. Log Retention

```text
├── Error logs: 90 days (Sentry)
├── Application logs: 30 days (Vercel)
├── Audit logs (auth, payments): 1 year (database)
├── Access logs: 30 days (Vercel)
├── Build logs: 90 days (Vercel)
└── Cron logs: 30 days
```
