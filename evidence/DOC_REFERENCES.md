# DOC_REFERENCES.md

**Commit SHA**: `66f0b3952b7aaef0f2274648d69e3fd125aa0d9e`  
**Generated at**: 2026-03-29T17:48:00Z (UTC) / 2026-03-29T19:48:00+02:00 (Cairo)  
**Audit scope**: Classification rules and their official references  
**Verification status**: Verified (reference URLs validated at generation time)

---

## 1. Next.js (App Router)

| Rule / Classification | Official URL | Short Note |
|----------------------|-------------|------------|
| Only `route.ts` files are endpoints | https://nextjs.org/docs/app/building-your-application/routing/route-handlers | `_scope.ts`, `_helpers.ts` etc. are not route handlers — only `route.ts` exports `GET/POST/etc`. |
| Middleware `matcher` controls routing | https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher | The matcher regex excludes `/api` from locale middleware. This does NOT provide auth protection for API routes. |
| Route handlers do not inherit middleware | https://nextjs.org/docs/app/building-your-application/routing/route-handlers#caching | API route handlers run independently. Auth must be implemented within each handler. |
| Dynamic route segments `[id]` | https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes | Parameters like `[id]` in `/api/instructor/consultation-types/[id]` are extracted from the URL segment. |
| `NextRequest` cookies / headers | https://nextjs.org/docs/app/api-reference/functions/next-request | Used by all route handlers to read auth cookies (`payload-token`). |
| Route handler HTTP methods | https://nextjs.org/docs/app/building-your-application/routing/route-handlers#supported-http-methods | Exported functions `GET`, `POST`, `PUT`, `PATCH`, `DELETE` map to HTTP methods. |

## 2. Payload CMS (v3)

| Rule / Classification | Official URL | Short Note |
|----------------------|-------------|------------|
| Auto-generated REST API | https://payloadcms.com/docs/rest-api/overview | Every collection automatically gets `GET`, `POST`, `PATCH`, `DELETE` endpoints at `/api/<slug>`. |
| Collection `access` control | https://payloadcms.com/docs/access-control/collections | `read`, `create`, `update`, `delete` functions gate access per-operation. |
| `payload.auth()` — Cookie/JWT verification | https://payloadcms.com/docs/authentication/overview | `payload.auth({ headers })` verifies the `payload-token` cookie and returns the user object. |
| Collection Hooks (`beforeChange`, `afterChange`, `beforeDelete`) | https://payloadcms.com/docs/hooks/collections | Hooks execute automatically on CRUD operations — they are invisible side effects. |
| `overrideAccess: true` | https://payloadcms.com/docs/queries/overview#local-api | Bypasses collection access control. Used in server-side operations where the route handler has already validated permissions. |
| `depth` parameter | https://payloadcms.com/docs/queries/depth | Controls related document population depth. Affects data size and performance. |
| Authentication token (cookie) | https://payloadcms.com/docs/authentication/token | Token stored as `payload-token` cookie, verified via HS256 HMAC using `PAYLOAD_SECRET`. |

## 3. OWASP API Security Top 10 (2023)

| Rule / Classification | Official URL | Short Note |
|----------------------|-------------|------------|
| **API1:2023 — Broken Object Level Authorization** | https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/ | Endpoints like B2B bookings/team must enforce tenant isolation (company scope). Failure = cross-tenant data leak. |
| **API2:2023 — Broken Authentication** | https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/ | OTP verification and Google OAuth callback are authentication boundaries. Custom JWT signing (HS256) must use timing-safe comparison. |
| **API3:2023 — Broken Object Property Level Authorization** | https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/ | `Users.beforeChange` hook must prevent `role` escalation via PATCH. Filtering writable fields is critical. |
| **API4:2023 — Unrestricted Resource Consumption** | https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/ | OTP endpoints have rate limiting (`3 per 10min` for send, `5 per 15min` for verify). Seed endpoints without rate limits are at risk. |
| **API5:2023 — Broken Function Level Authorization** | https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/ | `/api/seed-instructors` and `/api/seed-partners` are UNPROTECTED seed endpoints that can create data without any auth check. |
| **API6:2023 — Unrestricted Access to Sensitive Business Flows** | https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/ | Booking creation and seat allocation are sensitive business flows. CSRF token validation (`assertTrustedWriteRequest`) is present for bookings but MISSING for seat allocation. |
| **API8:2023 — Security Misconfiguration** | https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/ | Seed routes exposed in production without environment guards. Missing CSRF on some authenticated write endpoints. |
| **API9:2023 — Improper Inventory Management** | https://owasp.org/API-Security/editions/2023/en/0xa9-improper-assets-management/ | This audit document itself addresses this risk by cataloguing all 103 endpoint-methods. |

## 4. React / Frontend (Context for Fetch Wrappers)

| Rule / Classification | Official URL | Short Note |
|----------------------|-------------|------------|
| `credentials: 'include'` in fetch | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included | Frontend fetch wrappers use `credentials: 'include'` to send cookies cross-origin for authenticated requests. |
| SameSite cookie attribute | https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value | `payload-token` uses `SameSite=Lax`. This prevents CSRF from external sites but allows top-level navigation. |

## 5. General Security References

| Rule / Classification | Official URL | Short Note |
|----------------------|-------------|------------|
| PKCE for OAuth 2.0 | https://datatracker.ietf.org/doc/html/rfc7636 | Google OAuth flow uses S256 code challenge. Code verifier stored in HttpOnly cookie. |
| Timing-safe comparison | https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b | Used in nonce validation for OAuth callback (`isSameNonce` function). |
| HMAC-SHA256 webhook verification | https://datatracker.ietf.org/doc/html/rfc2104 | External webhook payloads from Paymob/EasyKash are verified using HMAC signatures. |
