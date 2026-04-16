# Phase 3 — Agent B: CRM Sync Failure Alerts + Re-Sync Button

## Your Role
You are a backend engineer. Your task is to add failure alerting and manual re-sync capability to the CRM sync pipeline.

## Context
- **Framework:** Next.js 15 + Payload CMS 3 + TypeScript
- **CRM pipeline:** `src/lib/crm/` (processor.ts, queue.ts, service.ts)
- **Email:** Resend via `src/lib/email/`
- **Current problem:** When CRM sync fails silently, the ops team has no idea. No alerting, no way to manually retry.

## Files to Modify/Create

### 1. `src/lib/crm/processor.ts` — Add failure tracking + alerting
- Track consecutive failure count per user (use a field in the CRM sync record or a simple in-memory counter with Redis fallback)
- After **3 consecutive failures** for any user, send an admin alert email
- The alert email should include: user ID, user email, error message, timestamp, failure count

### 2. `[NEW] src/app/api/admin/crm-resync/route.ts` — Manual re-sync endpoint
```typescript
// POST /api/admin/crm-resync
// Body: { userId: string }
// Auth: Admin only
// Action: Queue a fresh CRM sync for the specified user
```
Requirements:
- Authenticate with admin role (`src/lib/access-control.ts` → `isAdminUser`)  
- Accept `{ userId: string }` in request body
- Call the CRM service to re-queue sync for that user
- Return `{ success: true, queued: true }` or appropriate error

### 3. `src/lib/email/admin-alerts.ts` — [NEW] Admin alert email
Create a new email module for operational alerts:
```typescript
export async function sendCrmSyncFailureAlert(data: {
  userId: string;
  userEmail: string;
  failureCount: number;
  lastError: string;
  timestamp: string;
}): Promise<void>
```
Use the existing `buildEmailLayout` + `send` from `src/lib/email/email-core.ts`.
Send to: `process.env.ADMIN_ALERT_EMAIL || 'ops@nextacademyedu.com'`

## How to Approach This
1. Read these files first:
   - `src/lib/crm/processor.ts`
   - `src/lib/crm/queue.ts`
   - `src/lib/crm/service.ts`
   - `src/lib/email/email-core.ts`
   - `src/lib/access-control.ts`
2. Understand the existing sync flow
3. Add failure tracking minimally — don't rewrite the processor
4. Create the alert email following existing email patterns

## Acceptance Criteria
- [ ] Alert email sent when CRM sync fails 3+ consecutive times for same user
- [ ] Alert includes: userId, userEmail, error message, failure count, timestamp
- [ ] `POST /api/admin/crm-resync` endpoint exists and requires admin auth
- [ ] Re-sync endpoint successfully queues sync for specified user
- [ ] `pnpm tsc --noEmit` has zero new errors
- [ ] Existing CRM sync behavior unchanged

## Constraints
- Do NOT rewrite the CRM processor — minimal additions only
- Do NOT modify `src/collections/` files
- Do NOT add new npm dependencies — use existing Redis (ioredis) if needed for counters
- Alert email should follow the same pattern as `src/lib/email/instructor-emails.ts`
