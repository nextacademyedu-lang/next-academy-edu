# Production E2E (Instructor + Admin) - Full Coverage

## Setup

1. Copy `.env.example` to `.env` and fill admin credentials.
2. Export env vars in your shell (`E2E_BASE_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`).

## Run

```bash
npm run test
```

## Scenario Coverage

The suite executes 20 production scenarios for instructor flows:

1. Instructors CTA to instructor-intent signup.
2. Public register cannot escalate role/instructor relation.
3. Invalid signup intent normalizes to student.
4. Student signup + OTP (no instructor auto-link).
5. Fresh instructor signup + OTP (auto-create + auto-link).
6. Prelinked email auto-links to existing profile.
7. Duplicate instructor profiles block auto-link safely.
8. Conflict with already-linked user blocks takeover.
9. OTP invalid format and invalid code rejection.
10. OTP verify rate-limit (429).
11. OTP send rate-limit (429).
12. Incomplete profile submit validation.
13. Submit pending profile + admin queue visibility.
14. Rejected profile edit resets to draft.
15. Resubmit -> approve -> approved cannot resubmit.
16. Student/unlinked user forbidden from instructor APIs.
17. Secondary instructor account setup for ownership checks.
18. Consultation service validation + CRUD + boundary checks.
19. Availability validation + persistence + forbidden checks.
20. Program submissions lifecycle + boundaries + 404 behavior.

## Cleanup Behavior

- The suite uses a unique `RUN_ID` and attempts cleanup in `afterAll`.
- Instructor/availability/program/service/verification-code records are cleaned.
- User deletion currently fails on production due a `users.beforeDelete` hook issue (`400: The following path cannot be queried: user`), so test users may remain.

## Reports

- JSON: `reports/test-results.json`
- HTML: `reports/html/index.html`
