# Phase 3 — Agent C: Finance Data Model Improvements

## Your Role
You are a backend/database engineer. Your task is to improve the payment data model to support proper financial reconciliation and refund tracking.

## Context
- **Framework:** Next.js 15 + Payload CMS 3 + PostgreSQL (Neon) + TypeScript
- **ORM:** Drizzle via Payload
- **Migrations:** `src/migrations/` — Payload auto-generates, you run `payload generate:types` after changes
- **Current problem:** No net revenue tracking, no refund audit trail, no B2C/B2B distinction

## Files to Modify/Create

### 1. `src/collections/Payments.ts` — Add financial fields
Add these new fields to the Payments collection:
```typescript
{
  name: 'netAmount',
  type: 'number',
  admin: {
    description: 'Amount after gateway fees (= amount - gatewayFee)',
    readOnly: true, // calculated field
  },
},
{
  name: 'gatewayFee',
  type: 'number',
  admin: {
    description: 'Fee charged by payment gateway (Paymob/EasyKash)',
  },
},
{
  name: 'currency',
  type: 'select',
  defaultValue: 'EGP',
  options: ['EGP', 'USD', 'SAR'],
},
{
  name: 'reconciliationStatus',
  type: 'select',
  defaultValue: 'pending',
  options: [
    { label: 'Pending', value: 'pending' },
    { label: 'Matched', value: 'matched' },
    { label: 'Mismatch', value: 'mismatch' },
    { label: 'Skipped', value: 'skipped' },
  ],
  admin: {
    description: 'Result of daily reconciliation check against payment gateway',
  },
},
```

### 2. `[NEW] src/collections/RefundRequests.ts` — Refund audit trail
Create a new Payload collection for tracking refund requests:
```typescript
// Fields needed:
// - booking: relationship to Bookings
// - payment: relationship to Payments  
// - requestedBy: relationship to Users
// - amount: number (amount requested for refund)
// - reason: textarea
// - status: select (pending | approved | rejected | processed)
// - approvedBy: relationship to Users (admin who approved)
// - gatewayRefundId: text (ID returned from Paymob/EasyKash after refund processed)
// - processedAt: date
// - adminNotes: textarea
// - createdAt: handled by Payload automatically
```

### 3. `src/collections/Bookings.ts` — Add B2C/B2B flag
Add a simple flag:
```typescript
{
  name: 'bookingType',
  type: 'select',
  defaultValue: 'b2c',
  options: [
    { label: 'B2C (Individual)', value: 'b2c' },
    { label: 'B2B (Corporate)', value: 'b2b' },
  ],
  admin: {
    description: 'Whether this booking is an individual or corporate enrollment',
  },
},
```

### 4. `src/payload.config.ts` — Register RefundRequests collection
Add `RefundRequests` to the `collections` array.

### 5. Generate migration
After all collection changes, run:
```bash
pnpm payload generate:importmap
```
(Payload 3 auto-generates migrations on next startup — you don't need to manually create them)

## How to Approach This
1. Read current files first:
   - `src/collections/Payments.ts`
   - `src/collections/Bookings.ts`
   - `src/payload.config.ts`
   - One existing collection (e.g. `src/collections/Users.ts`) as a reference for collection structure
2. Add fields to Payments and Bookings
3. Create RefundRequests collection following the exact same pattern as existing collections
4. Register in payload.config.ts

## Acceptance Criteria
- [ ] `Payments` collection has `netAmount`, `gatewayFee`, `currency`, `reconciliationStatus` fields
- [ ] `RefundRequests` collection exists and is registered in payload.config.ts
- [ ] RefundRequests has all 10 required fields
- [ ] `Bookings` has `bookingType` field
- [ ] `pnpm tsc --noEmit` has zero new errors in `src/collections/`
- [ ] No existing fields removed or renamed

## Constraints
- Do NOT modify any API routes
- Do NOT touch the email or CRM modules
- Do NOT run `pnpm build` — type-check is sufficient
- Follow existing collection patterns exactly (look at `src/collections/Payments.ts` as reference)
