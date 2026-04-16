# Mohamed — Sales Coordinator Audit Report
**Team:** Next Academy Internal 🏫  
**Date:** 2026-04-16  
**Scope:** Consultation booking flow, lead management, installment requests, sales automation

## My Sales Workflow Assessment
The sales workflow is currently a "reactive" model. We receive leads and consultations, but the system doesn't proactively help us close them. I spend a significant portion of my day manually checking the Admin panel for new Consultation Bookings and Installment Requests because the automated notification system is incomplete.

## Critical Issues 🔴
1. **The "Silent" Booking Trap**: When a student pays for a consultation, the system updates the CRM, but it does NOT send me (the Sales Coordinator) an email alert. I have to manually refresh the `ConsultationBookings` collection to see new confirmed sessions.  
   *Evidence: `src/collections/ConsultationBookings.ts` lacks email hooks.*
2. **Missing Reminder Automation**: We have a `reminderSent` checkbox in the database, but there is NO background job (cron) that actually sends the 24h or 1h reminders to students. This results in a high "No-Show" rate, wasting instructor time and losing sales opportunities.

## Major Issues 🟠
1. **Manual Installment Approval**: The `InstallmentRequests` collection records the student's request, but the "Approval" process is entirely manual and disconnected from the payment gateway. I have to manually approve it, then manually create a `PaymentLink` for the first installment. This should be a single "Approve & Invoice" action.
2. **Leads without context**: When a lead comes from the Contact form, we see their message but we don't see which courses they were looking at right before they clicked "Contact". This "Intent Data" is missing, meaning I start every sales call with zero context.

## Minor Issues / Improvements 🟡
1. **Google Calendar Sync Lag**: Occasionally, a consultation is booked but doesn't appear on the instructor's Google Calendar for 10-15 minutes because the sync depends on the CRM worker cycle.

## What's Working Well ✅
- **Secure Consultation Checkout**: The integration with Paymob for consultation fees is robust and prevents "double-booking" during the 20-minute checkout window.
- **Instructor Availability Slots**: The system for instructors to define their specific slots is easy to manage and prevents scheduling conflicts.

## Automation Scorecard
| Stage | Automated? | Manual Step Required? |
|-------|-----------|----------------------|
| Lead capture | ✅ | None |
| Consultation booking confirmation | ⚠️ | CRM sync is auto, but team email is missing. |
| 24h reminder | ❌ | **Entirely Manual** |
| Post-consultation follow-up | ❌ | **Entirely Manual** |
| Installment request approval | ⚠️ | Capture is auto, approval is manual. |
| CRM stage update after enrollment | ✅ | Auto via CRM sync queue. |

## Recommendations
| Priority | Action | Effort |
|----------|--------|--------|
| **🔴 P1** | Implement a cron-job for automated 24h/1h consultation reminders. | Medium |
| **🔴 P1** | Add email notifications to the Sales team for new bookings/requests. | Low |
| **🟠 P2** | Add a "One-click Approve" button for installments that generates a Paymob link. | Medium |
| **🟠 P2** | Pass "Last Viewed Course" data into the Lead record. | Low |

## Appendix
- `src/collections/ConsultationBookings.ts` (Notification gap)
- `src/app/api/consultation/checkout/route.ts` (Booking logic)
