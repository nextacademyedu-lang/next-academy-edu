# CRM Mapping Report — Production Audit

**Date:** 2026-03-23
**CRM:** Twenty CRM (`crm.nextacademyedu.com`)
**Status:** 🔴 CRM domain is DOWN (503 + self-signed cert)

---

## Current State

The CRM (Twenty) is **unreachable** at the time of audit:

```
$ curl -I https://crm.nextacademyedu.com/healthz
HTTP/2 503
subject: CN=TRAEFIK DEFAULT CERT
```

This means:
- **No CRM sync is happening** — new leads, bookings, and contact data are NOT being pushed
- The cron job at `/api/cron/crm-sync` will **fail silently** on each run
- All CRM mapping analysis below is based on **code review only**, not live verification

---

## Payload → CRM Mapping (from code review)

### Contact/Lead Creation

| Payload Field | CRM Field (Twenty) | Sync Trigger | Status |
| --- | --- | --- | --- |
| `user.email` | `person.email` | On registration | ⚠️ Not verifiable (CRM down) |
| `user.firstName` | `person.firstName` | On registration | ⚠️ Not verifiable |
| `user.lastName` | `person.lastName` | On registration | ⚠️ Not verifiable |
| `user.phone` | `person.phone` | On registration | ⚠️ Not verifiable |
| `user.company` | `company.name` | On B2B registration | ⚠️ Not verifiable |

### Booking → Opportunity Mapping

| Payload Field | CRM Field (Twenty) | Sync Trigger | Status |
| --- | --- | --- | --- |
| `booking.program.title` | `opportunity.name` | On booking create | ❌ Blocked by BUG-002 |
| `booking.totalPrice` | `opportunity.amount` | On booking create | ❌ Blocked |
| `booking.status` | `opportunity.stage` | On status change | ❌ Blocked |
| `booking.paymentStatus` | `opportunity.probability` | On payment webhook | ❌ Blocked |

### Payment Event Mapping

| Payload Event | CRM Action | Sync Method | Status |
| --- | --- | --- | --- |
| Payment success (webhook) | Update opportunity to "Won" | Cron / webhook handler | ❌ Not testable |
| Payment failure (webhook) | Update opportunity to "Lost" | Cron / webhook handler | ❌ Not testable |
| Refund processed | Create note on opportunity | Cron | ❌ Not testable |

---

## Identified Gaps (from code analysis)

| # | Gap | Impact | Fix |
| --- | --- | --- | --- |
| GAP-001 | CRM domain down — no data syncing | All leads lost since downtime started | Fix TLS cert + container health (DevOps) |
| GAP-002 | No retry/queue mechanism for failed CRM syncs | If cron fails, data is lost permanently | Implement a sync queue (Redis-backed) with retry logic |
| GAP-003 | No CRM sync status dashboard | Ops has no visibility into sync health | Add sync status endpoint or admin panel widget |
| GAP-004 | No webhook from CRM back to Payload | CRM changes (manual edits) don't reflect in Payload | Implement CRM → Payload webhook handler |
| GAP-005 | Contact deduplication not implemented | Duplicate contacts in CRM when user re-registers | Add email-based dedup check before CRM insert |

---

## Required Fixes (Priority Order)

1. **P0:** Fix CRM domain TLS and verify Twenty container is running
2. **P0:** Implement sync queue with retry (Redis + BullMQ recommended)
3. **P1:** Add sync health monitoring endpoint
4. **P2:** Implement contact deduplication
5. **P3:** Add bidirectional CRM ↔ Payload sync

---

## Verification Plan (after CRM is fixed)

1. Create test user → verify contact appears in Twenty within 1 cron cycle
2. Create test booking → verify opportunity created with correct stage/amount
3. Process test payment → verify opportunity moves to "Won"
4. Trigger sync error → verify retry queue works
5. Check for duplicates after re-registration
