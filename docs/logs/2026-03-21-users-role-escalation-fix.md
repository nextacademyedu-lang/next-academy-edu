# 2026-03-21 Security Patch - User Role Escalation

## Vulnerability
`POST /api/users` allowed self-assigned privileged roles (`admin`, `b2b_manager`, `instructor`) from unauthenticated/public requests.

## Root Cause
`Users.beforeChange` returned early when `req.user` was missing, so public create payloads could pass `role` directly.

## Fix
- Hardened `src/collections/Users.ts`:
  - On `create`: if caller is not admin and no trusted context bypass, force:
    - `role = 'user'`
    - `instructorId = null`
  - On `update`: non-admin/non-bypass cannot change `role` or `instructorId`.
- Added trusted internal bypass context for legitimate bootstrapping paths:
  - `src/payload.config.ts` (`onInit` admin bootstrap)
  - `src/app/api/seed-admin/route.ts`
  - `scripts/seed-admin.ts`

## Validation
- Type check passed: `pnpm.cmd exec tsc --noEmit`

## Security Impact
- Public registration can no longer escalate privileges through request body.
- Admin seed/bootstrap flows still work through explicit trusted context.
