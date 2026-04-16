# Youssef — Product Analytics Audit Report
**Team:** Marketing & Business 📈  
**Date:** 2026-04-16  
**Scope:** Lead tracking, Attribution, CRM synchronization, Data consistency, Conversion funnels

## Executive Summary
The Next Academy data infrastructure is heavily centered around the custom Twenty CRM integration. While the synchronization pipeline is technically robust—featuring sophisticated deduplication and lifecycle mapping—there is a critical gap in marketing attribution. The platform currently lacks automated UTM capture, making it impossible to calculate ROAS (Return on Ad Spend) or trace conversion sources beyond manual user entry.

## Critical Issues 🔴
- **Mission Attribution Blind Spot (UTM Gap)**: Neither the `leads` nor the `users` collections capture UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, etc.) from the URL. Attribution is currently limited to a manual `source` dropdown (WhatsApp, Facebook). This is a fatal flaw for growth analytics, as we cannot distinguish between "Organic Facebook" and "Paid Facebook Ad #4".  
  *Recommendation: Implement a global UTM capture script and add these fields to all lead-capture collections.*
- **Unreachable "Lost" Analytics**: The `lostReason` field in Leads is a free-text textarea. This prevents any meaningful aggregate analysis of why leads are dropping off (e.g., price vs. schedule vs. curriculum).  
  *Recommendation: Change `lostReason` to a predefined Select field with an 'Other' option.*

## Major Issues 🟠
- **CRM Sync Cascading latency**: The `syncBooking` service triggers a synchronous `syncUser` call. This creates deeply nested API chains that can easily hit Twenty CRM rate limits during high-traffic enrollment windows (e.g., new round launches).
- **Missing Abandoned Cart Tracking**: There is no dedicated collection or CRM event for "Checkout Started but not Completed". We currently only track `leads` and `bookings`. Users who drop mid-checkout are lost to the analytics system unless they manually joined the Waitlist or a Lead form.
- **Inconsistent Phone Formatting**: Egyptian phone numbers are normalized differently across mappers (`mapUserToTwentyPerson` vs. `normalizeEasyKashPhone`). This can lead to duplicate contacts in the CRM because "010..." and "10..." might be treated as different entities depending on the provider.

## Minor Issues / Improvements 🟡
- **Deduplication Strategy**: The reliance on `primaryEmail` for deduplication is good, but Egyptian users frequently use different emails for payment (Paymob) than for registration.  
  *Recommendation: Add Phone Number as a secondary deduplication key in `lib/crm/dedupe.ts`.*
- **Missing Activity Timeline**: The CRM receives "State Changes" (Booking Created, Status Updated) but lacks "Intent Signals" (Program Page Viewed, Curriculum Downloaded), which are vital for sales prioritizing.

## What's Working Well ✅
- **Atomic Sync Queue**: The `enqueueCrmSyncEvent` pattern with `afterChange` hooks is excellent. It ensures that every record change in the DB is eventually processed by the CRM without blocking the user's web request.
- **Fingerprint-Based Dedupe**: The use of a `fingerprint` (combining status, updatedAt, and priority) prevents redundant sync calls if no meaningful data has changed.
- **Role Isolation**: Admin users are strictly excluded from CRM sync, ensuring the sales pipeline isn't cluttered with internal test data.

## Recommendations
| Priority | Action | Effort |
|----------| -------- | -------- |
| **🔴 Critical** | Implement automated UTM/URL-parameter capture. | Low |
| **🔴 Critical** | Set up "Checkout Started" lead capture event. | Medium |
| **🟠 Major** | Standardize E164 phone normalization across the app. | Medium |
| **🟠 Major** | Un-nest CRM sync calls (move to fully async events). | Medium |

## Appendix
**Files Reviewed:**  
- `src/lib/crm/mappers.ts` (Mapping logic)
- `src/lib/crm/service.ts` (Sync execution)
- `src/collections/Leads.ts` (Attribution gap)
- `src/collections/Bookings.ts` (Conversion logic)
