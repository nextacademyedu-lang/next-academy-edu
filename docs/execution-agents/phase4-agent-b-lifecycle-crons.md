# Phase 4 — Agent B: Session Reminder Emails + Abandoned Cart Recovery (Cron Jobs)

## Your Role
You are a backend engineer. Your task is to implement two critical lifecycle email cron jobs: session reminders and abandoned cart recovery.

## Context
- **Framework:** Next.js 15 + Payload CMS 3 + TypeScript
- **Email:** Resend via `src/lib/email/email-core.ts`
- **Cron:** Existing cron setup — check `src/app/api/cron/` for pattern
- **Vercel Cron:** Uses `GET` handler with `Authorization: Bearer CRON_SECRET` header
- **Current problem:** Students miss sessions because no reminders. Abandoned checkouts have zero recovery.

## Files to Create/Modify

### 1. Session Reminder Cron

**`[NEW] src/lib/email/reminder-emails.ts`**
```typescript
export async function sendSessionReminder(data: {
  to: string;
  studentName: string;
  programName: string;
  sessionDate: string; // formatted, e.g. "Monday, April 21 at 7:00 PM"
  instructorName: string;
  joinLink?: string | null;
  hoursUntil: 24 | 1;
  locale?: string | null;
}): Promise<void>
```

**`[NEW] src/app/api/cron/session-reminders/route.ts`**
Logic:
1. Authenticate with `CRON_SECRET` (check existing cron routes for pattern)
2. Find all confirmed bookings where session starts in 24h–25h (for 24h reminder)
3. Find all confirmed bookings where session starts in 1h–1.5h (for 1h reminder)  
4. For each booking, skip if `reminderSent24h` / `reminderSent1h` is already true
5. Send reminder email
6. Mark the booking as reminded

**`[MODIFY] src/collections/Bookings.ts`**
Add reminder tracking fields:
```typescript
{ name: 'reminderSent24h', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
{ name: 'reminderSent1h', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
```

### 2. Abandoned Cart Recovery Cron

**`[NEW] src/lib/email/abandoned-cart-emails.ts`**
```typescript
export async function sendAbandonedCartEmail(data: {
  to: string;
  studentName: string;
  programName: string;
  price: number;
  checkoutUrl: string;
  followUp: boolean; // false = 1hr email, true = 24hr follow-up
  locale?: string | null;
}): Promise<void>
```

**`[NEW] src/app/api/cron/abandoned-cart/route.ts`**
Logic:
1. Find bookings with status `pending` where `createdAt` is 1h ago (and `cartRecovery1hSent` is false)
2. Send first recovery email (gentle nudge: "You left something behind")
3. Find bookings with status `pending` where `createdAt` is 24h ago (and `cartRecovery24hSent` is false)  
4. Send follow-up (urgency: "Spots filling up for [Program Name]")
5. Mark the fields

**`[MODIFY] src/collections/Bookings.ts`**
Add:
```typescript
{ name: 'cartRecovery1hSent', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
{ name: 'cartRecovery24hSent', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
{ name: 'checkoutStartedAt', type: 'date', admin: { readOnly: true } },
```

**`[MODIFY] vercel.json`** (or check if it exists at project root)
Add cron schedule:
```json
{
  "crons": [
    { "path": "/api/cron/session-reminders", "schedule": "0 * * * *" },
    { "path": "/api/cron/abandoned-cart", "schedule": "*/30 * * * *" }
  ]
}
```

## How to Approach This
1. Read existing cron route for pattern:
   - `src/app/api/cron/` — check what cron routes exist
   - `src/lib/email/instructor-emails.ts` — email pattern
   - `src/collections/Bookings.ts` — existing booking fields
2. Follow exact same auth pattern as existing cron routes
3. Use `getPayload({ config })` for DB queries

## Acceptance Criteria
- [ ] `GET /api/cron/session-reminders` sends 24h and 1h reminder emails
- [ ] `GET /api/cron/abandoned-cart` sends 1h and 24h recovery emails
- [ ] Both crons skip already-processed bookings (idempotent)
- [ ] Reminders not sent for cancelled/refunded bookings
- [ ] Bookings collection has all 5 new tracking fields
- [ ] Email templates bilingual (AR/EN)
- [ ] `pnpm tsc --noEmit` zero new errors

## Constraints
- Use `asPayloadRequest` NOT `req as any`
- Follow existing email template patterns
- Do NOT modify payment logic or auth flows
- Cron auth: `Authorization: Bearer ${process.env.CRON_SECRET}`
