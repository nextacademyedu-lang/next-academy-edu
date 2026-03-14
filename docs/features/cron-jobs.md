# Next Academy — Cron Jobs & Scheduled Tasks

> Last Updated: 2026-03-13 14:17
> Platform: Vercel Cron Jobs (vercel.json)
> Timezone: Africa/Cairo (UTC+2)

---

## 1. Cron Jobs Master List

| # | Job Name | Schedule | Endpoint | Priority | Description |
|---|---|---|---|---|---|
| 1 | `booking-timeout` | Every 5 min | `/api/cron/booking-timeout` | 🔴 Critical | Cancel reserved bookings (unpaid > 15 min). Release seats back to pool |
| 2 | `payment-reminders` | Every 6 hours | `/api/cron/payment-reminders` | 🔴 Critical | Send installment reminders (3 days before due) — Email + WhatsApp |
| 3 | `overdue-checker` | Daily 8:00 AM | `/api/cron/overdue-checker` | 🔴 Critical | Mark overdue installments, block access after 7 days, cancel after 30 days |
| 4 | `consultation-reminders` | Every hour | `/api/cron/consultation-reminders` | 🟡 High | Send 24h and 1h consultation reminders — Email + WhatsApp |
| 5 | `slot-generation` | Daily midnight | `/api/cron/slot-generation` | 🟡 High | Generate consultation slots 30 days ahead for all active instructors |
| 6 | `waitlist-cascade` | Every hour | `/api/cron/waitlist-cascade` | 🟡 High | Process waitlist when seats open, notify next in line, check 24h expiry |
| 7 | `session-reminders` | Daily 6:00 PM | `/api/cron/session-reminders` | 🟡 High | Send "tomorrow's session" reminders for all confirmed bookings |
| 8 | `reconciliation` | Daily 2:00 AM | `/api/cron/reconciliation` | 🟡 High | Compare Paymob transactions with DB payments, flag mismatches |
| 9 | `review-requests` | Daily 10:00 AM | `/api/cron/review-requests` | 🟢 Normal | Send review requests 3 days after round completion |
| 10 | `crm-sync` | Every 30 min | `/api/cron/crm-sync` | 🟢 Normal | Retry failed CRM sync operations from the queue |
| 11 | `installment-expiry` | Daily 9:00 AM | `/api/cron/installment-expiry` | 🟢 Normal | Expire installment approvals > 7 days old, send expiring-soon warnings |
| 12 | `cleanup` | Daily 3:00 AM | `/api/cron/cleanup` | 🟢 Normal | Delete national ID images > 30 days, purge old logs, soft-delete expired links |
| 13 | `inactive-users` | Weekly Sunday midnight | `/api/cron/inactive-users` | 🟢 Normal | Re-engagement emails for users inactive 30+ days |
| 14 | `fawry-check` | Every 30 min | `/api/cron/fawry-check` | 🟡 High | Check pending Fawry/EasyKash payments (async payment confirmation) |

---

## 2. Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/booking-timeout", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/payment-reminders", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/overdue-checker", "schedule": "0 6 * * *" },
    { "path": "/api/cron/consultation-reminders", "schedule": "0 * * * *" },
    { "path": "/api/cron/slot-generation", "schedule": "0 22 * * *" },
    { "path": "/api/cron/waitlist-cascade", "schedule": "30 * * * *" },
    { "path": "/api/cron/session-reminders", "schedule": "0 16 * * *" },
    { "path": "/api/cron/reconciliation", "schedule": "0 0 * * *" },
    { "path": "/api/cron/review-requests", "schedule": "0 8 * * *" },
    { "path": "/api/cron/crm-sync", "schedule": "*/30 * * * *" },
    { "path": "/api/cron/installment-expiry", "schedule": "0 7 * * *" },
    { "path": "/api/cron/cleanup", "schedule": "0 1 * * *" },
    { "path": "/api/cron/inactive-users", "schedule": "0 22 * * 0" },
    { "path": "/api/cron/fawry-check", "schedule": "15,45 * * * *" }
  ]
}
```

> **Note:** Vercel cron uses UTC. Cairo = UTC+2, so midnight Cairo = 22:00 UTC.

---

## 3. Cron Job Security

```typescript
// All cron endpoints must verify the request source

// lib/cron-auth.ts
export function verifyCronRequest(req: Request): boolean {
  // Vercel sends this header for cron jobs
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

// Usage in each cron route:
export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... cron logic
}
```

---

## 4. Detailed Job Specifications

### 4.1 Booking Timeout (Every 5 min)

```text
Query: bookings WHERE status = 'reserved' AND created_at < NOW() - 15 minutes
Action for each:
├── Update booking status → 'expired'
├── Decrement round.current_enrollments
├── Cancel any pending payment intents in Paymob
├── Check waitlist for this round → notify next user
└── Log: "Booking {id} expired due to payment timeout"

Expected volume: 0-5 bookings per run
Max duration: 10 seconds
```

### 4.2 Overdue Checker (Daily 8 AM)

```text
Query: payments WHERE status = 'pending' AND due_date < NOW()
Actions by overdue duration:
├── Day 1-6: Mark payment status → 'overdue' (if not already)
│   └── Send overdue notification (email + WhatsApp + in-app)
├── Day 7: Block user access
│   ├── booking.access_blocked = true
│   ├── In-app notification: "تم تعليق وصولك"
│   └── Email: "ادفع القسط عشان ترجع"
├── Day 14: Admin alert for manual follow-up
├── Day 30: Auto-cancel booking
│   ├── booking.status = 'cancelled_overdue'
│   ├── Release seat
│   ├── CRM deal → 'lost'
│   └── Final notification to user

Expected volume: 5-20 payments per run
Max duration: 30 seconds
```

### 4.3 Waitlist Cascade (Every hour)

```text
Query: waitlist entries for rounds with available seats AND notification_sent = false
Action for each:
├── Check: round.current_enrollments < round.max_capacity
├── If seats available:
│   ├── Notify first in queue (email + WhatsApp + in-app)
│   ├── Set notification_sent = true
│   ├── Set notification_expires_at = NOW() + 24 hours
│   └── Log: "Waitlist user {userId} notified for round {roundId}"
├── If notification_expires_at < NOW() (24h passed, no action):
│   ├── Move to next person in queue
│   ├── Mark expired entry: waitlist_status = 'expired'
│   └── Notify next
└── If round has started → stop cascade, close waitlist

Expected volume: 0-10 entries per run
Max duration: 15 seconds
```

### 4.4 Reconciliation (Daily 2 AM)

```text
Process:
1. Fetch last 24h transactions from Paymob API
2. For each Paymob transaction:
   ├── Find matching DB payment (by transaction_id)
   ├── If found → verify amounts match
   │   ├── Match → ✅ skip
   │   └── Mismatch → 🔴 flag for manual review
   └── If not found → 🟡 missed webhook → create payment record
3. For each DB payment (status: paid) in last 24h:
   ├── Find matching in Paymob
   └── If not found → 🔴 flag as potential fake payment
4. Generate daily report:
   ├── Total transactions: X
   ├── Matched: X
   ├── Mismatches: X (with details)
   ├── Missing webhooks recovered: X
   └── Send report to admin email

Expected volume: 10-100 transactions per run
Max duration: 60 seconds
```

### 4.5 Cleanup (Daily 3 AM)

```text
Tasks:
├── Delete national ID images WHERE created_at < NOW() - 30 days
│   └── Keep the installment_request record (without image)
├── Soft-delete expired payment links WHERE expires_at < NOW() - 90 days
├── Purge notification records WHERE created_at < NOW() - 90 days AND is_read = true
├── Delete failed login attempts WHERE timestamp < NOW() - 30 days
├── Archive session recordings WHERE created_at < NOW() - 1 year
└── Log cleanup summary: "Cleaned: X images, X links, X notifications"

Expected volume: 0-50 items per category
Max duration: 30 seconds
```

---

## 5. Error Handling & Monitoring

```text
Each cron job MUST:
├── Log start time: "[CRON] {jobName} started at {timestamp}"
├── Wrap in try-catch (never let cron crash silently)
├── Log end time + stats: "[CRON] {jobName} completed: {processed} items in {duration}ms"
├── On error: log full error + continue with remaining items
├── On complete failure: send admin alert (Slack/email)
├── Track execution in DB table: cron_logs
│   ├── job_name, started_at, completed_at, status, items_processed, errors
│   └── Use for: admin dashboard, missed execution detection
└── Heartbeat: if cron_logs has no entry for expected schedule → alert admin

Monitoring Dashboard (Admin):
├── Last run time for each cron
├── Success/failure rate (last 7 days)
├── Average execution time
├── Items processed per run
└── Alert: "Cron {name} hasn't run in {expected_interval × 2}"
```
