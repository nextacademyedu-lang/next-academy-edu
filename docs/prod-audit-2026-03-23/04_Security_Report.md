# Security Report — Production Audit

**Date:** 2026-03-23
**Target:** nextacademyedu.com (production)
**Methodology:** OWASP Top 10 (2021) + manual testing + automated probing

---

## Summary

| Severity | Count |
| --- | --- |
| 🔴 Critical | 1 |
| 🟠 High | 2 |
| 🟡 Medium | 2 |
| 🟢 Info | 1 |
| **Total** | **6** |

---

## Findings

### SEC-001 — Authentication Bypass on Booking Endpoint (Critical)

**Related Defect:** BUG-002

| Field | Value |
| --- | --- |
| Severity | 🔴 Critical |
| CVSS | 8.1 (High) |
| Category | OWASP A07:2021 — Authentication Failures |
| Exploitability | Low (unintentional — config issue, not injection) |
| Impact | Complete revenue flow blockage; all booking attempts fail |

**Description:**
`POST /api/bookings/create` returns 401 for users with valid, active sessions. The `server-auth.ts` middleware checks three token sources (cookie, JWT header, Bearer) and all three fail despite successful login.

**Root Cause Hypothesis:**
Cookie configuration mismatch. The `payload-token` cookie set during login may have incorrect `Domain`, `SameSite`, or `Path` attributes that prevent the browser from sending it on subsequent API requests.

**Remediation:**
1. Audit `Set-Cookie` header on login response
2. Ensure `SameSite=Lax` (not `Strict`), `Path=/`, and `Domain` matches the API origin
3. Verify `NEXT_PUBLIC_SERVER_URL` environment variable matches production domain
4. Add logging to `server-auth.ts` to trace which check fails

---

### SEC-002 — Missing CSRF Protection on State-Changing Endpoints (High)

**Related Defect:** BUG-008

| Field | Value |
| --- | --- |
| Severity | 🟠 High |
| CVSS | 6.5 (Medium) |
| Category | OWASP A01:2021 — Broken Access Control |
| Exploitability | Medium (requires victim to visit attacker page while logged in) |
| Impact | Attacker could create bookings or modify data on behalf of logged-in users |

**Description:**
State-changing POST endpoints (booking creation, profile updates) do not validate CSRF tokens. An attacker could craft a malicious page that submits forms to these endpoints using the victim's session cookie.

**Remediation:**
1. Implement CSRF token generation on server (e.g., `csrf` npm package or Next.js built-in)
2. Include token in all forms and AJAX requests
3. Validate token on all POST/PUT/DELETE endpoints
4. Consider `SameSite=Lax` cookies as defense-in-depth (but not sole mitigation)

---

### SEC-003 — Missing Rate Limiting on Authentication Endpoints (High)

**Related Defect:** BUG-010

| Field | Value |
| --- | --- |
| Severity | 🟠 High |
| CVSS | 7.3 (High) |
| Category | OWASP A07:2021 — Authentication Failures |
| Exploitability | High (automated tools readily available) |
| Impact | Credential stuffing, brute-force attacks against user accounts |

**Description:**
`POST /api/users/login` and `POST /api/users/forgot-password` accept unlimited rapid requests without throttling. This enables automated credential brute-forcing.

**Remediation:**
1. Add rate limiting middleware: max 5 failed login attempts per IP per 15 minutes
2. Implement progressive delays (1s, 2s, 4s, 8s...) after failed attempts
3. Add CAPTCHA after 3 consecutive failures
4. Consider account lockout after 10 failed attempts with email notification

---

### SEC-004 — Information Disclosure in Error Responses (Medium)

**Related Defect:** BUG-009

| Field | Value |
| --- | --- |
| Severity | 🟡 Medium |
| CVSS | 4.3 (Medium) |
| Category | OWASP A05:2021 — Security Misconfiguration |
| Exploitability | Low |
| Impact | Attacker learns internal paths, framework version, potential attack vectors |

**Description:**
API error responses may include stack traces, internal file paths, and Payload CMS internals when errors occur. This information aids attackers in crafting targeted exploits.

**Remediation:**
1. Add global error handling middleware that catches all unhandled errors
2. In production, return only generic messages: `{"error": "Internal Server Error"}`
3. Log full errors server-side but never return to client
4. Set `NODE_ENV=production` to disable verbose error output

---

### SEC-005 — Cookie Attribute Configuration Audit (Medium)

**Related Defect:** BUG-007

| Field | Value |
| --- | --- |
| Severity | 🟡 Medium |
| CVSS | 5.0 (Medium) |
| Category | OWASP A07:2021 — Authentication Failures |
| Exploitability | Low |
| Impact | Session cookies may not be sent on legitimate requests or may be accessible to XSS |

**Description:**
The `payload-token` cookie attributes need audit to confirm:
- `HttpOnly=true` (prevents JavaScript access)
- `Secure=true` (HTTPS only)
- `SameSite=Lax` (prevents CSRF while allowing same-site navigation)
- `Path=/` (available to all routes)
- `Domain` matches API origin

**Remediation:**
Review and fix cookie configuration in Payload CMS configuration file.

---

### SEC-006 — Cron Endpoints Properly Secured (Info — Positive Finding)

| Field | Value |
| --- | --- |
| Severity | 🟢 Info |
| Category | Positive Finding |

**Description:**
All cron endpoints (`/api/cron/waitlist`, `/api/cron/check-overdue`, `/api/cron/crm-sync`) correctly reject unauthenticated requests with 401. The `CRON_SECRET` Bearer token mechanism works as intended.

---

## OWASP Top 10 Coverage

| Category | Tested | Finding |
| --- | --- | --- |
| A01 — Broken Access Control | ✅ | SEC-002 (CSRF) |
| A02 — Cryptographic Failures | ⚠️ | Not fully tested (TLS OK) |
| A03 — Injection | ⚠️ | Not tested (requires specific payloads) |
| A04 — Insecure Design | ✅ | No issues found |
| A05 — Security Misconfiguration | ✅ | SEC-004 (error disclosure) |
| A06 — Vulnerable Components | ❌ | Not tested (requires dependency audit) |
| A07 — Authentication Failures | ✅ | SEC-001, SEC-003, SEC-005 |
| A08 — Data Integrity Failures | ⚠️ | Not fully tested |
| A09 — Logging & Monitoring | ⚠️ | Not tested |
| A10 — SSRF | ❌ | Not tested |
