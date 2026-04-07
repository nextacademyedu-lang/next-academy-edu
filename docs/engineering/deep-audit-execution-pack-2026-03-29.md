# Next Academy Deep Audit Execution Pack (2026-03-29)

## 1) Objective

Run a deep, no-guess audit of the whole codebase with zero production breakage risk, validating:

1. API correctness and real behavior.
2. Access control and role scoping.
3. Data relationships and side effects.
4. End-to-end business flows.
5. Security/reliability posture.

All conclusions must be backed by official framework docs and reproducible tests.

---

## 2) Hard Guardrails (Non-Negotiable)

1. No destructive commands on production data.
2. No schema-breaking changes during audit phase.
3. Production tests must be read-only unless explicitly whitelisted with `RUN_ID` and guaranteed cleanup.
4. Every finding must include:
   - exact reproduction steps
   - observed vs expected behavior
   - root cause location
   - official documentation reference URL
5. No "best guess" claims.

---

## 3) Documentation Baseline (Must Use)

Use official docs and cite exact URL per finding:

1. Next.js docs: `https://nextjs.org/docs`
2. Payload CMS docs: `https://payloadcms.com/docs`
3. React docs: `https://react.dev`
4. PostgreSQL docs: `https://www.postgresql.org/docs/`
5. Playwright docs: `https://playwright.dev/docs/intro`
6. OWASP API Security Top 10: `https://owasp.org/API-Security/`

Project runtime baseline from code:

1. Next.js `15.4.11`
2. Payload `3.79.0`
3. React `19.2.3`

---

## 4) Execution Plan (Phased)

## Phase 0: Safe Setup

1. Freeze target commit SHA.
2. Create audit branch from that SHA.
3. Confirm staging/test DB availability.
4. Define `RUN_ID` strategy for any write tests.
5. Create evidence folder for logs/screenshots/reports.

Output:

- `AUDIT_BASELINE.md`

## Phase 1: Static System Mapping

1. Inventory all routes under `src/app/api/**`.
2. Map each endpoint to:
   - input schema
   - auth/role requirement
   - touched collections/tables
   - side effects (email, webhooks, cron, queue)
3. Build dependency map between endpoints, hooks, collections, and frontend consumers.

Output:

- `API_CATALOG.md`
- `DEPENDENCY_MAP.md`

## Phase 2: Contract + RBAC Audit

1. Build RBAC matrix per endpoint (`admin`, `instructor`, `b2b_manager`, `user`, anonymous).
2. Validate API response contracts against frontend usage.
3. Validate collection access hooks vs intended business roles.

Output:

- `RBAC_MATRIX.md`
- `CONTRACT_GAP_REPORT.md`

## Phase 3: Dynamic API Audit (API-first)

1. Positive tests for each endpoint.
2. Negative tests:
   - unauthorized/forbidden
   - invalid payload
   - invalid ownership scope
   - rate limit behavior
3. Idempotency and retry behavior for write endpoints.
4. Verify error format consistency and status codes.

Output:

- `API_TEST_RESULTS.md`
- machine-readable JSON report

## Phase 4: Full E2E Business Flows

Run realistic flows for:

1. Student onboarding + booking + payment.
2. Instructor onboarding + profile submit + admin moderation + services/sessions.
3. B2B manager onboarding + company/team invitation + seat allocation.
4. Admin moderation queues and lifecycle transitions.

Output:

- `E2E_FLOW_REPORT.md`
- screenshots/videos indexed by scenario

## Phase 5: Security + Reliability

1. OWASP API checks: BOLA/IDOR, auth bypass, excessive data exposure.
2. Rate limiting and abuse controls.
3. Cron/webhook reliability and replay/failure handling.
4. Migration and deployment safety checks.

Output:

- `SECURITY_RELIABILITY_REPORT.md`

## Phase 6: Findings + Remediation Plan

1. Consolidate all findings with severity:
   - `P0` critical
   - `P1` high
   - `P2` medium
   - `P3` low
2. For each finding: fix strategy + rollback-safe rollout order.
3. Produce quick-win patch batch first (high impact, low risk).

Output:

- `FINDINGS_REGISTER.csv`
- `REMEDIATION_PLAN.md`
- `REGRESSION_TEST_PLAN.md`

---

## 5) Work Package Split (for Claude)

Use parallel tracks:

1. Track A: API inventory + dependency graph.
2. Track B: RBAC + access-control verification.
3. Track C: API dynamic test suite.
4. Track D: E2E scenario execution.
5. Track E: Security/reliability review.

Daily merge point:

1. Normalize evidence format.
2. De-duplicate findings.
3. Re-score severity by business impact.

---

## 6) Acceptance Criteria (Audit Done Definition)

Audit is complete only if:

1. Every active endpoint has coverage in `API_CATALOG.md`.
2. Every role/endpoint permission is documented and tested.
3. Every critical business flow has at least one successful E2E run.
4. Every finding includes official-doc citation and reproduction evidence.
5. Remediation plan is prioritized and executable without downtime.

---

## 7) Copy/Paste Master Prompt for Claude

```text
You are running a deep, no-guess technical audit for Next Academy.

Rules:
1) Do not rely on assumptions.
2) Every technical claim must include an official documentation URL.
3) Do not perform destructive actions.
4) Production write tests are forbidden unless marked with RUN_ID and full cleanup steps.
5) Prioritize reproducible evidence over narrative.

Goals:
1) Build a complete API catalog with auth, contracts, side effects, and dependencies.
2) Build RBAC matrix and verify each endpoint access behavior.
3) Execute API-first tests (positive + negative + edge cases).
4) Execute full E2E flows (student, instructor, b2b manager, admin).
5) Produce security/reliability findings based on OWASP API guidance.
6) Deliver a prioritized remediation plan with rollback-safe order.

Required outputs:
- API_CATALOG.md
- DEPENDENCY_MAP.md
- RBAC_MATRIX.md
- CONTRACT_GAP_REPORT.md
- API_TEST_RESULTS.md
- E2E_FLOW_REPORT.md
- SECURITY_RELIABILITY_REPORT.md
- FINDINGS_REGISTER.csv
- REMEDIATION_PLAN.md
- REGRESSION_TEST_PLAN.md

Severity model:
- P0: critical data/security/business outage
- P1: high business or security impact
- P2: medium functional inconsistency
- P3: low risk or cleanup

For each finding include:
- ID
- Severity
- Component/Endpoint
- Reproduction steps
- Observed behavior
- Expected behavior
- Root cause (file/path)
- Official doc URL
- Proposed fix
- Regression test

Start with Phase 0 + Phase 1, then report progress before moving forward.
```

---

## 8) Suggested Reporting Format (Daily)

1. Completed today.
2. In-progress.
3. Blockers.
4. New findings by severity.
5. Risks for next phase.
6. Planned next 24h actions.

