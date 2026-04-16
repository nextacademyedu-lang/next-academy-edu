# Karim — AppSec Engineer Audit Report
**Team:** Software House 🏗️  
**Date:** 2026-04-16  
**Scope:** Authentication, authorization, payment security, webhook validation, secrets management

## Executive Summary
The Next Academy platform demonstrates a strong foundational security posture, particularly in its financial and database interactions. The use of timing-safe HMAC verification for payment webhooks and query-filtered access control for role-based permissions effectively mitigates high-impact risks like payment spoofing and mass IDOR. However, the authentication layer contains a critical bottleneck where rate limiting is handled in-memory, making the platform's OTP flow vulnerable to distributed brute-force attacks.

## Critical Issues 🔴
- **OTP Brute Force (In-Memory Limiter)**: The `api/auth/send-otp` route uses a local `Map` for rate limiting. In the current VPS/horizontal deployment, this limit is easily bypassed. Since OTPs are 6-digit numeric codes, a distributed attack could successfully guess a code within the valid window.  
  *OWASP: A07:2021-Identification and Authentication Failures*
- **Missing verification-otp lockout**: While verification attempts are tracked, there is no "hard lockout" mechanism for accounts that fail verification across multiple sessions or IPs. This allows an attacker to continue probing for valid OTPs without permanent consequence.

## Major Issues 🟠
- **Dynamic Access Control Depth**: The `fetchPersistedUser` helper performs a database lookup if the session user is incomplete. While safe, this "recursive" lookup pattern can be abused to cause Denial of Service (DoS) if many stale sessions are initiated simultaneously, as it triggers un-cached database queries on every restricted route.
- **Payload Admin Email Fallback**: The `isAdminUser` logic checks `PAYLOAD_ADMIN_EMAIL`. While convenient, this creates a situation where an environment variable misconfiguration could accidentally grant full administrative access to an external email address if the variable contains a typo or public domain.

## Minor Issues / Improvements 🟡
- **Buffer Length Safety**: In `verifyPaymobHmac`, the HMAC buffer is created directly from the user-provided string. While timing-safe, it's safer to enforce a hex-regex check (as seen in EasyKash) before buffer creation to prevent internal buffer allocation errors for extremely large strings.
- **Secure Cookie Flags**: Verification of `httpOnly` and `secure` flags on session cookies was confirmed at the code level, but global middleware should enforce `SameSite=Strict` to further harden against CSRF in addition to the existing `assertTrustedWriteRequest`.

## What's Working Well ✅
- **Timing-Safe HMAC**: Payment webhooks for both Paymob and EasyKash use `crypto.timingSafeEqual`. This is a professional implementation that defeats timing-based side-channel attacks.
- **Query-Based Isolation**: Role-based access (like B2B Managers) is enforced via database-level `where` filters in Payload hooks. this is the most secure way to prevent IDOR because the database itself never even sees the unauthorized records.
- **CSRF Defense**: Consistent application of `assertTrustedWriteRequest` across write-heavy API routes.

## Recommendations
| Priority | Vulnerability | OWASP Category | Fix Effort |
|----------|--------------|----------------|------------|
| **🔴 Critical** | Distributed OTP Brute Force | Ident. & Auth Failures | Low (Migrate to Redis) |
| **🟠 Major** | Auth Logic Denial of Service | Software/Data Integrity | Medium |
| **🟠 Major** | Hardened Admin Email Guard | Security Misconfig | Low |
| **🟡 Minor** | Global SameSite=Strict Middleware | CSRF | Low |

## Appendix
**Files Reviewed:**  
- `src/lib/access-control.ts`
- `src/lib/payment-api.ts` (HMAC audit)
- `src/app/api/auth/send-otp/route.ts`
- `src/app/api/webhooks/paymob/route.ts`
