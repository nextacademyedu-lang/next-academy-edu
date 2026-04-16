# Laila — Operations Manager Audit Report
**Team:** Next Academy Internal 🏫  
**Date:** 2026-04-16  
**Scope:** CRM sync reliability, admin panel usability, daily ops workflows, failure visibility

## My Daily Workflow Assessment
As the Ops Manager, I rely on the system to keep student data in sync between our website and Twenty CRM. Currently, when a student pays or a lead is captured, it's put in the `CrmSyncEvents` queue. A background "worker" (running every few minutes via cron) processes these events. 

If everything works, I don't see anything. But if the CRM is down or there's a data mismatch, the event just sits there as "failed". I have to manually go into the `CrmSyncEvents` collection, filter by the "failed" status, check the error message in the `lastError` box, and then decide if I need to run a manual script.

## Critical Issues 🔴
1. **Zero Visibility on Sync Failures**: There is NO proactive alert (Slack/Email) when the CRM sync starts failing. I have to remember to check the `CrmSyncEvents` collection every day. If I forget, and the sync has been failing for 48 hours, our sales team in Twenty CRM is looking at stale data without knowing it.
2. **Missing "Re-Sync Now" Button**: If a student's email was formatted wrong and the sync failed, once I fix the email in the `Users` collection, I can't just click a button to "Retry Sync". I have to wait for the next cron cycle or ask a developer to run the backfill script.

## Major Issues 🟠
1. **Duplicate Student Bloat**: We often get duplicate records in the CRM because the deduplication logic relies heavily on `primaryEmail`. Many Egyptian students use one email for registration and a different one for Paymob/EasyKash. This results in two "Contacts" in Twenty for the same human, making my reports inaccurate.
2. **Lead "Lost" Reason is Text**: When our team marks a lead as "Lost", they type into a text box. I can't easily see a chart of *why* we are losing leads because "too expensive", "expensive", and "price high" are seen as different things by the system.

## Minor Issues / Improvements 🟡
1. **Bulk Invoicing Delay**: Generating payment links for corporate clients is manual. I have to create each `PaymentLink` record one by one. There’s no "Bulk Generate" for a company with 50 students.

## What's Working Well ✅
- **CrmSyncEvents Audit Trail**: Having a dedicated collection for every sync attempt is a lifsaver. I can see exactly what data was sent (`payloadSnapshot`) and what the CRM said back (`resultSnapshot`).
- **Resilient Queue**: The system doesn't just "drop" events. If it fails, it increases the `attempts` count and sets a `nextRetryAt`. This "Retry logic" handles 90% of temporary network blips.

## Recommendations
| Priority | Action | Who Fixes It | Effort |
|----------| -------- | ------------- | -------- |
| **🔴 P1** | Create a simple dashboard showing "Failed Syncs Today" in the admin. | Developer | Low |
| **🔴 P1** | Add a "Sync to CRM" button on User and Booking admin pages. | Developer | Medium |
| **🟠 P2** | Add Phone Number as a secondary key for CRM deduplication. | Developer | Medium |
| **🟠 P2** | Convert "Lost Reason" from a Textarea to a Select dropdown. | Developer | Low |

## Appendix
**Files Reviewed:**  
- `src/collections/CrmSyncEvents.ts` (Risk identification)
- `src/lib/crm/service.ts` (Sync logic checking)
- `src/lib/crm/mappers.ts` (Deduplication gap)
