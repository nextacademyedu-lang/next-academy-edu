# Nour — Head of Growth Audit Report
**Team:** Marketing & Business Agency  
**Date:** 2026-04-16  
**Scope:** Conversion funnels, lead capture, discount strategy, checkout flow, growth infrastructure

## Executive Summary
Next Academy has built an impressive "Growth Engine" within Payload CMS—particularly the popup and targeting infrastructure which rival third-party SaaS tools like OptinMonster. However, the **checkout funnel** suffers from technical friction, requiring a pre-generated `bookingId` that creates a disconnect between browsing and purchasing. While lead capture is robustly linked to a CRM, the lack of an automated abandoned-cart recovery sequence at the code level is a "leaking bucket" for revenue.

## Critical Issues 🔴
- **Checkout Friction (Pre-Booking Requirement)**: The core checkout route `[bookingId]/page.tsx` implies that a user must create a database record *before* seeing the payment UI. If the booking creation fails or lags, the user never hits the payment gateway. Recommendation: Implement a "Quick Buy" flow for individual courses.
- **Conversion Fragmentation**: The presence of both `/[locale]/for-business` and `/[locale]/corporate-training` creates cognitive load for B2B visitors. One should be a landing page and the other a lead capture/service page, but currently, they appear to compete.
- **Missing Abandoned Cart Logic**: While leads are synced to the CRM, there is no system-level trigger or "checkout-started" event that automatically follows up with users who leave a `pending` booking after 1 hour. This is the #1 missed revenue opportunity.

## Major Issues 🟠
- **Waitlist Conversions**: The `Waitlist` collection is well-structured but lacks an automated "Round Now Open" notification trigger in the backend hooks. Currently, it seems notifications must be triggered manually by an admin, causing delays in re-filling seats.
- **Discount Stacking Risks**: The `DiscountCodes` collection doesn't explicitly enforce non-stackable rules at the schema level. If the payment helper doesn't rigorously check this, power-users could potentially stack multiple discounts.
- **Lead Capture Source Detail**: The `source` field in `Leads.ts` is a fixed select list. While it has `sourceDetails`, it lacks automated UTM parameter capturing directly from the URL, making attribution dependent on manual selection by the user in many cases.

## Minor Issues / Improvements 🟡
- **Popup Over-Targeting**: The `Popups` engine is very powerful, but there is a risk of "popup fatigue." Recommendation: Add a global "Cool down" setting to prevent multiple popups from overlapping even if their targeting rules match.
- **Announcement Bar Dismissal**: There is no tracking for "Announcement Bar Dismissed" in the database, meaning users might see the same urgent banner even after they've acknowledged it, reducing its perceived importance.

## What's Working Well ✅
- **Sophisticated Popups**: The targeting and trigger system (exit intent, scroll depth) is absolute state-of-the-art for a custom build. It allows for high-precision conversion tactics.
- **CRM Integrity**: The `afterChange` hooks on Leads and Waitlists ensure the sales team has real-time data for high-touch closing.
- **Countdown Infrastructure**: Built-in support for urgency timers in popups and sections is a proven conversion booster for Arabic audiences.

## Recommendations
| Priority | Action | Expected Impact | Effort |
|----------| -------- | ----------------- | -------- |
| **High** | Consolidate B2B pages into a single high-converting funnel. | High | Medium |
| **High** | Automate "Round Open" notifications for the Waitlist. | High | Low |
| **Medium** | Implement UTM auto-capture into the `Leads` source details. | Medium | Low |
| **Medium** | Establish a "Checkout Started" CRM event for abandoned cart recovery. | High | Medium |
| **Low** | Audit `payment-helper.ts` for discount stacking loopholes. | Low | Low |
