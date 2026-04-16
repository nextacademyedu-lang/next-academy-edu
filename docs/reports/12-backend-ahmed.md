# Ahmed — Backend Lead Audit Report
**Team:** Software House 🏗️  
**Date:** 2026-04-16  
**Scope:** API routes, authentication, payments, rate limiting, data integrity

## Executive Summary
The Next Academy backend is technically mature, featuring advanced database primitives like atomic increments for capacity management and payment crediting. However, a critical vulnerability exists in the OTP authentication layer where rate limiting is handled in-memory rather than via the global Redis-backed limiter. This makes the platform susceptible to distributed brute-force attacks. Additionally, while the system handles race conditions well at the database level, it lacks formal "Idempotency Keys" at the API entry point, which could lead to redundant record creation during network retries.

## Critical Issues 🔴
- **In-Memory Rate Limiting (Brute Force Vector)**: The `api/auth/send-otp` route uses a local `Map` for rate limiting. In a horizontally scaled production environment (multiple Node.js processes), this limit is bypassed easily. A malicious actor can rotate IPs or hit different pod instances to brute-force OTP delivery or verification.  
  *Fix: Migrate `send-otp` to use `lib/rate-limit.ts` (Redis-backed).*
- **Missing API Idempotency Keys**: Critical endpoints like `api/bookings/create` do not accept a client-provided idempotency key. While there is a database-level duplicate check, a high-frequency retry during a slow initial request could bypass this check before the first record is committed.  
  *Recommendation: Implement `X-Idempotency-Key` header support for all `POST` requests in `src/app/api`.*

## Major Issues 🟠
- **Lack of Account Lockout**: The OTP verification flow (`verify-otp`) increments attempts but doesn't implement a "hard lockout" (e.g., 24-hour ban) after multiple failed attempts across the entire email entry. This increases the risk for 6-digit code guessing.
- **Fragmented Payment Gateway Logic**: `api/checkout/paymob` contains a hardcoded fallback to EasyKash when `ENABLE_PAYMOB` is false. This "routing" logic should live in a strategy-pattern utility rather than directly in a specific gateway's route handler to ensure maintenance doesn't break both gateways.
- **Waitlist Notify Logic**: The `cron/waitlist` route triggers notifications but doesn't appear to implement a batch-processing limit or a retry mechanism for failed email dispatches, which could lead to "ghost" notifications where a seat is offered but the user never receives the email.

## Minor Issues / Improvements 🟡
- **Seed Routes in Production**: Routes like `api/seed-admin` are protected by a secret, but their mere existence in the production build increases the attack surface.  
  *Recommendation: Move seed logic to a separate CLI script or gate it behind `process.env.NODE_ENV !== 'production'`.*
- **Arabic Translation in Errors**: Some API errors are hardcoded in Arabic (`roundId مطلوب`). Error messages should ideally return a translation key that the frontend can map, ensuring consistent i18n support.

## What's Working Well ✅
- **Atomic Operations**: The use of `atomicIncrementWithCeiling` for round capacity is professional-grade. It perfectly solves the "last seat" race condition problem.
- **CSRF Protection**: The custom `assertTrustedWriteRequest` utility is consistently applied, adding a strong layer of defense against cross-site attacks.
- **Webhook Idempotency**: `processSuccessfulPayment` correctly checks for `paid` status and uses atomic increments for `paidAmount`, ensuring reliable financial record-keeping.

## Recommendations
| Priority | Action | Effort |
|----------| -------- | -------- |
| **🔴 Critical** | Standardize all rate limiting to use Redis via `lib/rate-limit.ts`. | Low |
| **🔴 Critical** | Add global `X-Idempotency-Key` handling middleware. | Medium |
| **🟠 Major** | Refactor payment routing into a `PaymentProviderFactory`. | Medium |
| **🟠 Major** | Add email delivery retry logic to the waitlist cron job. | Medium |
| **🟡 Minor** | Strip `api/seed-*` routes from production builds. | Low |

## Appendix
**Files Reviewed:**  
- `src/app/api/auth/send-otp/route.ts` (Rate limit flaw)
- `src/app/api/bookings/create/route.ts` (Atomic success)
- `src/lib/atomic-db.ts` (Excellent implementation)
- `src/lib/payment-helper.ts` (Robust idempotency)
