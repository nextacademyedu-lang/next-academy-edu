# Adel — Legal & Compliance Officer Audit Report

**Team:** Marketing & Business Agency  
**Date:** April 16, 2026  
**Scope:** Privacy policy, data protection (Egyptian Law 151/2020), cookie consent, refund policy, terms of service

## Executive Summary

The legal and compliance audit of Next Academy reveals a platform that has established a solid foundation with professionally translated legal pages (Arabic and English) but faces significant regulatory risks relative to Egyptian and international data protection laws. 

The most critical finding is the **complete absence of a cookie consent mechanism**, which violates the Egyptian Personal Data Protection Law (Law 151 of 2020) and international standards (GDPR) as tracking and UTM processing occur automatically upon page load. Furthermore, while the platform maintains a robust internal data handling system, the public-facing Privacy Policy lacks the transparency required for "informed consent," specifically regarding the names of third-party data processors used.

## Compliance Scorecard

| Requirement | Status | Gap |
|------------|--------|-----|
| Privacy Policy (Arabic) | ✅ | Content is present and well-translated. |
| Privacy Policy (English) | ✅ | Content is present and consistent with Arabic. |
| Terms of Service | ✅ | Covers core usage, IP, and payment terms. |
| Refund Policy | ✅ | Clear, compliant with consumer protection norms. |
| Cookie Consent Banner | ❌ | **CRITICAL GAP:** No banner exists; tracking is automatic. |
| Data Processing Agreements | ⚠️ | Internal logic shows syncs, but public naming is missing. |
| Right to Deletion | ⚠️ | Code supports cleanup, but no public UI for users to trigger. |
| Unsubscribe Mechanism | ✅ | Functional page and API for email/WhatsApp opt-out. |
| Egyptian Law 151/2020 | ⚠️ | Lacks explicit consent for tracking and DPO contact. |
| GDPR (if EU users) | ❌ | Fails on cookie consent and strict processor transparency. |

## Critical Issues 🔴

### 1. Absence of Cookie Consent Banner
The platform utilizes `deriveContactSourceFromSearchParams` in `src/lib/source-tracking.ts` to capture and store marketing source data automatically. Under Law 151/2020 and GDPR, any non-essential tracking requires explicit, opt-in consent *before* data collection begins. Currently, the platform collects this data instantly on landing.
*   **Legal Risk:** High (Fines under Law 151/2020 Article 2).
*   **Recommendation:** Implement a "Glassmorphism" styled cookie consent banner that blocks non-essential pixels/tracking until consent is given.

### 2. Lack of Explicit Consent for Third-Party Sync
User data is automatically synced to **Twenty CRM** and **Resend** upon registration (`src/collections/Users.ts` hooks). While the privacy policy mentions "trusted service providers," it does not explicitly name these entities. Law 151/2020 requires clear disclosure of data processors.
*   **Legal Risk:** Moderate-High.
*   **Recommendation:** Update the Privacy Policy to explicitly list core subprocessors (Resend, Paymob, EasyKash, Twenty CRM).

## Major Issues 🟠

### 1. Right to Erasure (Deletion) Accessibility
The `Users.beforeDelete` hook correctly implements "cascading deletes" for user data (bookings, profiles, etc.). However, there is no mechanism in the user dashboard to request account deletion.
*   **Legal Risk:** Moderate (Compliance with "Right to be Forgotten").
*   **Recommendation:** Add a "Delete Account" request button in the user settings that triggers the deletion workflow.

### 2. Sensitive Data Logging Risk
The `Payments` collection stores `paymentGatewayResponse` as JSON. A review of `payment-api.ts` indicates these are intention responses, but we must ensure no webhook payloads containing PII or semi-sensitive identifiers are logged in clear text without a retention policy.
*   **Recommendation:** Audit the `paymentGatewayResponse` stored in the DB to ensure no sensitive card-holder data (even masked) is persisted beyond necessity.

## Minor Issues / Improvements 🟡

### 1. DPO Contact Information
The current contact for privacy is `privacy@nextacademyedu.com`. For full compliance with Law 151/2020, a "Data Protection Officer" (DPO) or a designated representative should be mentioned in the policy.

### 2. Marketing Opt-In Consistency
While the registration form has an opt-in checkbox, the `Leads` collection also collects data from various sources without an explicit record of the "Consent Timestamp" or the specific version of the Privacy Policy accepted at that time.

## What's Working Well ✅

- **Bilingual Legal Content**: The platform provides high-quality Arabic and English versions of all legal documents, which is essential for the Egyptian market.
- **Refund Policy Clarity**: The 7-day workshop and 14-day course rules are clearly defined and technically enforceable (though I recommend adding logic to check the 20% consumption limit automatically).
- **Automated Cleanup**: The `beforeDelete` hooks show high technical maturity in ensuring no orphaned PII remains after a user is deleted.

## Third-Party Data Sharing Map

| Third Party | Data Shared | Purpose | Documented in Privacy Policy? |
|------------|-------------|---------|-------------------------------|
| **Paymob** | Name, Email, Phone, Amount, Item | Payment Processing | ⚠️ (General) |
| **EasyKash** | Name, Email, Phone, Amount | Payment Processing (Cash/Fawry) | ⚠️ (General) |
| **Resend** | Name, Email | Transactional & Marketing Email | ⚠️ (General) |
| **Twenty CRM** | Full Profile, Leads, Payments | Customer Relationship Management | ❌ (Missing) |
| **Google** | Email (OAuth), Calendar Slots | Authentication & Consultations | ⚠️ (General) |
| **S3/R2** | Uploaded Profile Pictures/Media | Media Storage | ⚠️ (Internal) |

## Recommendations

| Priority | Action | Legal Risk if Ignored | Effort |
|----------|--------|----------------------|--------|
| **High** | Implement a Cookie Consent Banner with opt-in for tracking. | Penalties under Law 151/2020 and GDPR. | Low-Medium |
| **High** | Update Privacy Policy to name Resend, Paymob, and Twenty CRM. | Violation of "Transparency" requirements. | Low |
| **Medium** | Add "Request Account Deletion" in User Dashboard. | Failure to honor "Right to Erasure." | Medium |
| **Medium** | Add DPO designation to the legal pages. | Compliance gap in Egyptian regulatory requirements. | Low |
| **Low** | Implement "Version Tracking" for Policy acceptance. | Evidentiary risk in case of disputes. | Medium |

## Appendix
*   **Law Reference:** Egyptian Personal Data Protection Law No. 151 of 2020.
*   **Audit Tools Used:** Codebase analysis of `src/collections`, `src/lib/crm`, and `src/app/[locale]/legal`.

---
*Disclaimer: This report identifies compliance gaps based on a technical audit and does not constitute legal advice. It is recommended that Next Academy consult with a specialized legal firm for a final review of these documents.*
