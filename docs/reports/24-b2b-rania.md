# Rania — B2B Strategy Analyst Audit Report
**Team:** Marketing & Business Agency 📈  
**Date:** 2026-04-16  
**Scope:** Corporate training features, B2B onboarding, seat management, enterprise readiness

## Executive Summary
Next Academy has a solid "MVP+" foundation for B2B operations. By building a custom corporate dashboard directly on top of Payload CMS, the platform avoids the high costs of enterprise LMS licensing. The current system handles team invitations, seat management, and financial snapshots effectively. However, it lacks the "Enterprise Grade" features (SSO, Bulk Import, Granular Reporting) required to close deals with large multinationals or Egyptian conglomerates.

## Critical Issues 🔴
1. **Lack of Single Sign-On (SSO)**: Major corporate clients (e.g., Vodafone, CIB) expect to use their own credentials (Azure AD, Okta) to log in. Currently, their employees must create local accounts, which is a major security and onboarding friction point for IT departments.
2. **High-Touch Onboarding**: There is no self-serve "Create Company Account" for new B2B clients. All company profiles must be manually created by the Next Academy Admin. This limits scalability for SME (Small-to-Medium Enterprise) adoption.

## Major Issues 🟠
1. **No Bulk Employee Import**: The B2B Dashboard only supports inviting members one-by-one (`inviteB2BTeamMember`). For a company enrolling a department of 100 people, this is a manual bottleneck.
2. **Missing Progress Transparency**: Corporate admins can see *who* is enrolled and *what* was paid, but they cannot see how far each employee has progressed through their assigned program (e.g., "70% complete", "Exam passed"). Enterprise HR teams require this for ROI calculations.
3. **No Self-Serve Seat Reassignment**: If an employee leaves the company, the B2b Manager currently has to contact Next Academy support to revoke and reassign that paid "Seat" to a new hire.  
   *Evidence: `src/lib/b2b-seats.ts` (implied lack of self-serve revocation logic for paid seats).*

## Minor Issues / Improvements 🟡
1. **B2B Landing Page Conversion**: The "For Business" page is mostly static. Adding a demo booking calendar for the Sales team would improve the lead funnel.
2. **Reporting Export**: Add a "Download as CSV" button for B2B Managers to export their team's training records for internal audit.

## Enterprise Readiness Scorecard
| Feature | Status | Gap |
|---------|--------|-----|
| Self-serve signup | ❌ | Requires Admin setup first. |
| Seat management | ⚠️ | Manual for paid seats, auto for free ones. |
| Reporting & analytics | ⚠️ | High-level stats only; no per-employee progress. |
| Invoice-based billing | ✅ | Well supported via `PaymentLinks`. |
| SSO / LDAP | ❌ | **Missing** (SAML/OpenID required). |
| Contract management | ⚠️ | Metadata exists but no electronic signature flow. |
| Completion tracking | ❌ | No data passed to B2B Dashboard. |

## Recommendations
| Priority | Action | Effort |
|----------|--------|--------|
| **🔴 P1** | Implement Bulk CSV Member Invite for B2B Managers. | Medium |
| **🔴 P1** | Pass "Course Progress" percentages to the B2B Dashboard. | Large |
| **🟠 P2** | Add SSO support (Azure AD/Okta) for Enterprise role. | X-Large |
| **🟡 P3** | Enable automated "Company Profile Request" to lower Sales friction. | Low |

## Appendix
**Files Reviewed:**  
- `src/lib/b2b-api.ts` (API capabilities)
- `src/collections/BulkSeatAllocations.ts` (Revenue leakage check)
- `src/app/[locale]/(b2b)/dashboard/page.tsx` (Dashboard scope)
