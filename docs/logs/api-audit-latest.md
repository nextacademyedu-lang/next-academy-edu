# API Audit Latest Snapshot

- Base URL: `https://nextacademyedu.com`
- Last updated: `2026-03-21 19:13` (Africa/Cairo)
- Scope: consolidated view for all audit passes executed on `2026-03-21`

## Round Summary

| Round | File | Total | Passed | Failed | Skipped |
|---|---|---:|---:|---:|---:|
| Baseline full sweep | `docs/logs/api-audit-20260321-184721.json` | 150 | 145 | 5 | 5 |
| Auth/role gap verification | `docs/logs/api-audit-auth-gap-2026-03-21T16-50-05-996Z.json` | 26 | 26 | 0 | 6 |
| Gap-fix verification | `docs/logs/api-audit-gap-fixes-2026-03-21T16-51-59-051Z.json` | 22 | 22 | 0 | 0 |
| Instructor coverage | `docs/logs/api-instructor-coverage-2026-03-21-1653.json` | 8 | 8 | 0 | 0 |

## Notes

- Baseline run captured the initial gaps before fixes.
- Follow-up verification passes for auth/role and gap-fixes completed with `0 failed`.
- Instructor-specific endpoint coverage also completed with `0 failed`.

## Related Fix Docs

- `docs/logs/2026-03-21-work-summary.md`
- `docs/logs/2026-03-21-checkout-intent-fix.md`
- `docs/logs/2026-03-21-users-role-escalation-fix.md`
