# Phase 5 — Agent C: Payment Reconciliation Cron

## Your Role
You are a fintech backend engineer. Your task is to implement a daily payment reconciliation cron job that detects mismatches between the internal database and the payment gateway.

## Context
- **Framework:** Next.js 15 + Payload CMS 3 + TypeScript
- **Payment gateways:** Paymob, EasyKash
- **Paymob API base:** `https://accept.paymob.com/api/` — check existing webhook/API code for auth patterns
- **Internal DB:** `Payments` collection in Payload
- **Current problem:** If a payment succeeds at the gateway but fails to be recorded internally (network error, crash), it becomes undetected revenue with no enrollment

## Files to Create

### 1. `[NEW] src/lib/payment-reconciliation.ts`
Core reconciliation logic:
```typescript
interface ReconciliationResult {
  checked: number;
  matched: number;
  mismatches: PaymentMismatch[];
  errors: string[];
}

interface PaymentMismatch {
  internalId: string;
  gatewayId: string;
  internalStatus: string;
  gatewayStatus: string;
  amount: number;
  reason: string;
}

export async function reconcilePaymentsWindow(
  fromDate: Date,
  toDate: Date
): Promise<ReconciliationResult>
```

Logic:
1. Query internal `Payments` collection for all payments in the window
2. For each payment, fetch status from gateway API (Paymob or EasyKash based on `provider` field)
3. Compare statuses
4. If mismatch found: update `reconciliationStatus` to `'mismatch'` in DB
5. If matched: update to `'matched'`
6. Return summary

**Paymob transaction status check:**
```typescript
// GET https://accept.paymob.com/api/acceptance/transactions/{gateway_order_id}
// Headers: Authorization: Token <PAYMOB_SECRET_KEY>
```

### 2. `[NEW] src/app/api/cron/reconcile-payments/route.ts`
```typescript
// GET /api/cron/reconcile-payments
// Schedule: daily at 06:00 UTC
// Auth: CRON_SECRET

export async function GET(req: NextRequest) {
  // 1. Authenticate with CRON_SECRET
  // 2. Reconcile last 48 hours
  // 3. If any mismatches, send alert email to finance team
  // 4. Return { checked, matched, mismatches: count }
}
```

### 3. `[MODIFY] src/lib/email/admin-alerts.ts`
Add (or create if not exists from P3-B):
```typescript
export async function sendReconciliationAlert(data: {
  mismatches: PaymentMismatch[];
  windowStart: string;
  windowEnd: string;
}): Promise<void>
```

### 4. `[MODIFY] vercel.json` — Add cron schedule
```json
{ "path": "/api/cron/reconcile-payments", "schedule": "0 6 * * *" }
```

## How to Approach This
1. Read these files first:
   - `src/app/api/webhooks/paymob/route.ts` — how Paymob auth works
   - `src/collections/Payments.ts` — understand payment schema (especially after P3-C adds new fields)
   - `src/app/api/cron/` — existing cron pattern
   - `src/lib/email/email-core.ts` — email utility
2. Keep gateway API calls minimal — one call per payment
3. Handle rate limiting gracefully (add 100ms delay between API calls)

## Acceptance Criteria
- [ ] `GET /api/cron/reconcile-payments` is authenticated and functional
- [ ] Checks last 48h of payments against gateway
- [ ] Updates `reconciliationStatus` in DB for each payment checked
- [ ] Alert email sent to finance team when mismatches found
- [ ] Gracefully handles gateway API errors (logs, continues to next)
- [ ] `pnpm tsc --noEmit` zero new errors

## Constraints
- Use `asPayloadRequest` NOT `req as any`
- Make it defensive: a single gateway error should NOT crash the whole job
- Only reconcile Paymob payments for now (EasyKash can follow same pattern)
- Follow existing cron auth pattern exactly
