# Salma — Email Marketing Specialist Audit Report
**Team:** Marketing & Business Agency  
**Date:** April 16, 2026  
**Scope:** Email templates, lifecycle emails, deliverability, personalization, gaps

## Executive Summary

After reviewing the email infrastructure of Next Academy, I’ve found a solid technical foundation using **Resend** and **React Email**. The system correctly handles multi-language support (Arabic/English) and RTL layouts, which is critical for our region. However, from a marketing perspective, the platform is currently "mute" during key student moments. 

We are missing critical lifecycle sequences that drive retention and revenue. Furthermore, we have a **significant compliance risk** as our email templates lack physical addresses and unsubscribe links for non-transactional communications, which could lead to deliverability issues or legal trouble (GDPR/CAN-SPAM).

## Email Template Inventory

| # | Email Type | Template Exists? | Trigger | Arabic? | Mobile? |
|---|-----------|-----------------|---------|---------|---------|
| 1 | OTP Verification | ✅ | `api/auth/send-otp` | ✅ | ✅ |
| 2 | Welcome Email | ❌ | Missing after verification | - | - |
| 3 | B2B Invitation | ✅ | `api/b2b/invitations` | ✅ | ✅ |
| 4 | Consultation Booking | ✅ | `ConsultationBookings` hook | ✅ | ✅ |
| 5 | Enrollment Confirmation| ✅ | `booking-emails.ts` | ✅ | ✅ |
| 6 | Payment Received | ✅ | `payment-emails.ts` | ✅ | ✅ |
| 7 | Payment Failed | ✅ | `payment-emails.ts` | ✅ | ✅ |
| 8 | Contact Form Response | ✅ | `contact-emails.ts` | ✅ | ✅ |
| 9 | Re-Engagement | ✅ | `engagement-emails.ts` | ✅ | ✅ |

## Critical Issues 🔴

1. **Regulatory Non-Compliance**: Our `EmailLayout` footer (`src/lib/email/components/email-layout.tsx`) is missing a physical office address and an "Unsubscribe" link for marketing-adjacent emails (Re-engagement, Upsell). This is a legal requirement for most jurisdictions.
2. **Missing Welcome Sequence**: There is no follow-up after a user verifies their OTP. The first 24 hours are critical for student onboarding. We are missing the chance to guide them to their first course or consultation.
3. **No Abandoned Enrollment Recovery**: We have a "re-engagement" template but no automated trigger for when a user starts a booking/enrollment but doesn't finish. This is the "abandoned cart" of EdTech and is usually high-ROI.

## Major Issues 🟠

1. **Transactional vs. Marketing Separation**: Every email currently flows through the transactional API (Resend). As we scale, sending "Upsell" or "Re-engagement" emails from the same IP/domain as "OTP" codes risks our core system deliverability if users mark them as spam.
2. **Missing Course Completion Emails**: There is no "Congratulations" email or certificate delivery flow identified in the templates. Students lose interest without positive reinforcement.
3. **Static Content**: While we have personalization (names), most templates are quite static. We aren't dynamically recommending courses based on student interests in our re-engagement emails.

## Minor Issues / Improvements 🟡

1. **Sender Attribution**: The default "From" address is sometimes `noreply@`. For edtech, using a persona like "Salma from Next Academy" or "Student Support" improves open rates.
2. **Inconsistency in Triggers**: Some emails are triggered by API routes, others by Payload hooks. This makes it hard to manage the full "Lifecycle Map" in one place.

## What's Working Well ✅

1. **RTL Support**: The Arabic implementation is excellent. The `dir="rtl"` logic and the shared `email-dictionary.ts` ensure a premium experience for our primary audience.
2. **Modern Tooling**: React Email makes templates maintainable and avoids "table-hell" coding, which is great for future iterations.
3. **Design Aesthetics**: The use of dark-mode aesthetics in emails (`#111111` background) aligns well with the premium brand identity of Next Academy.

## Lifecycle Email Map

| Stage | Email Exists? | Needs Improvement? |
|-------|--------------|-------------------|
| Registration | ✅ (OTP) | Yes - Add Welcome flow post-verify |
| Post-OTP Welcome | ❌ | CRITICAL GAP |
| Pre-Session Reminder (24h) | ❌ | Missing for live sessions |
| Pre-Session Reminder (1h) | ❌ | Missing for live sessions |
| Post-Session Follow-up | ❌ | Missing |
| Course Completion | ❌ | Missing |
| Certificate Issued | ❌ | Missing |
| 7-day Inactive | ✅ | Needs better triggers |
| 30-day Inactive | ✅ | Needs better triggers |
| Abandoned Cart | ❌ | MAJOR REVENUE GAP |

## Recommendations

| Priority | Action | Expected Impact | Effort |
|----------|--------|-----------------|--------|
| **High** | Fix Footer Compliance (Address + Unsubscribe) | Protect Deliverability / Legal | Low |
| **High** | Implement 3-part Welcome Sequence | Increase Enrollment Rate | Medium |
| **Medium**| Automate Abandoned Enrollment Reminders | Recapture lost revenue | Medium |
| **Medium**| Setup dedicated subdomain for marketing (e.g., mail.nextacademy.com) | Protect Transactional Reputation | Medium |
| **Low**   | Add Social Proof (Testimonials) to Re-engagement emails | Increase trust/clicks | Low |

## Appendix
- Primary Email Layout: `src/lib/email/components/email-layout.tsx`
- Dictionary/Translations: `src/lib/email/email-dictionary.ts`
- Sending Adapter: `src/lib/resend-email-adapter.ts`
