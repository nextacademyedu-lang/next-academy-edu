# 2026-03-21 Checkout Intent & Redirect Fix

## Problem
1. User clicked booking CTA while logged out, then after login got redirected to dashboard instead of returning to checkout/program intent.
2. Program page was linking to `/checkout/{roundId}` while checkout route expects `/checkout/{bookingId}`, causing 404/400 and "الحجز مش موجود أو مش ليك".

## Fix Applied
- Added safe redirect helper:
  - `src/lib/role-redirect.ts` -> `getSafeRedirectPath`
- Updated auth pages to preserve and use redirect intent:
  - `src/app/[locale]/(auth)/login/page.tsx`
  - `src/app/[locale]/(auth)/register/page.tsx`
  - `src/app/[locale]/(auth)/verify-email/page.tsx`
- Updated program booking CTA flow:
  - `src/app/[locale]/programs/[slug]/page.tsx`
  - `src/components/checkout/book-round-button.tsx` (new)

## Validation
- Local type check passed: `pnpm.cmd exec tsc --noEmit`.
- Logic now:
  - Logged-out user pressing book -> redirected to login with preserved intent.
  - After login/register/verify, user returns to intended path.
  - Booking CTA now creates booking first, then opens checkout with the correct `bookingId`.
