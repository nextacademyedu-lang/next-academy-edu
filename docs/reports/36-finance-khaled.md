# Khaled — Finance & Revenue Ops Manager Audit Report
**Team:** Next Academy Internal  
**Date:** 2026-04-16  
**Scope:** Payment records, installment tracking, refund management, revenue reporting, reconciliation

## My Finance Workflow Assessment

After auditing the codebase, the Current financial workflow is largely **webhook-dependent and manual** for anything beyond standard enrollment. 

1. **Checkout**: The system correctly generates `Payments` records for the first installment or full amount.
2. **Installments**: The system creates a schedule of "pending" payments. A daily cron job (`/api/cron/check-overdue`) proactively marks these as `overdue` and blocks access—this is a strong automated point.
3. **Tracking**: We rely on atomic database increments to track the `paidAmount` on bookings, which prevents double-counting if a webhook hits twice.
4. **Reporting**: Currently, there is **zero internal financial reporting** in the frontend code. I would need to manually export CSVs from Payload CMS or look at Paymob/EasyKash dashboards directly.

## Financial Data Completeness

| Data Point | Available? | Location | Gap |
|-----------|-----------|----------|-----|
| Gateway transaction ID | ✅ | Payments.ts | Present as `transactionId`. |
| Payment amount (EGP) | ✅ | Payments.ts | Stored as `amount`. |
| Discount applied | ✅ | Bookings.ts | Stored as text/number; not relinked to specific code rules. |
| Refund status | ✅ | Payments.ts | Available as a status, but no reversal amount trace. |
| Installment schedule | ✅ | Payments.ts | Tracked via `installmentNumber` and `dueDate`. |
| B2C vs. B2B flag | ❌ | Payments.ts | Implicit via booking; not easily filterable for reporting. |
| **Gross vs. Net (Fees)** | ❌ | - | **Critical Gap**: We don't record the gateway's cut. |
| **VAT/Tax** | ❌ | - | No separation of tax vs revenue. |

## Critical Issues 🔴

1. **No Gateway Reconciliation**: The system is 100% reliant on webhooks. If Paymob fails to send a webhook or our server is down during its retries, we lose that payment record. There is no background task to poll the gateway for "missed" successful transactions.
2. **Missing Net Revenue Tracking**: We record the `amount` the student paid, but not the amount deposited in our bank (minus processing fees). This makes monthly reconciliation a nightmare for the accounting team.
3. **No Audit Trail for Refunds**: While a status can be set to "refunded", there is no "Reversal" record or "Refund Request" collection to track *who* authorized the refund and *why*. 

## Major Issues 🟠

1. **Hardcoded Currency**: The system assumes EGP. If we expand to USD or SAR, the data model lacks a `currency` field in the `Payments` collection.
2. **Brittle Discount Reporting**: Discounts are stored as total amounts on the Booking. We can't easily see "Which campaign generated the most revenue?" without complex multi-collection joins.
3. **Installment Overdue Logic is Binary**: Users are blocked immediately when overdue. There is no "grace period" or "partial payment" handling for installments.

## Minor Issues / Improvements 🟡

1. **Duplicate Reminders**: The cron job sends reminders for payments due in 3 days. If the cron runs twice, it has some basic protection (`reminderSentCount`), but no log of *what* was sent.
2. **Manual Settlement**: No tracking of "Settlement Date" (when the money actually hits the academy bank account).

## What's Working Well ✅

1. **Atomic Payment Increments**: The implementation of `atomicIncrement` in `payment-helper.ts` is solid and prevents double-counting payments due to race conditions.
2. **Automated Blocking**: The system's ability to automatically block access for overdue payments prevents "leakage" where students keep learning without paying.
3. **Reference ID Storage**: Storing the raw `paymentGatewayResponse` JSON ensures we have evidence for disputes.

## Recommendations

| Priority | Action | Who Fixes It | Effort |
|----------|--------|-------------|--------|
| **High** | Implement a "Reconciliation Task" to sync statuses with Paymob/EasyKash API daily. | Backend | Medium |
| **High** | Add `netAmount` and `gatewayFee` fields to the `Payments` collection. | Backend | Low |
| **Medium** | Create a `RefundRequests` collection to track approvals and reversal transaction IDs. | Backend | Medium |
| **Medium** | Build a "Finance Overview" dashboard summarizing total revenue, refunds, and overdue amounts. | Frontend | High |
| **Low** | Add `currency` support to all financial collections. | Backend | Low |

## Appendix
- Check for `src/lib/payment-helper.ts:113` for atomic logic.
- Related cron: `src/app/api/cron/check-overdue/route.ts`.
