# Next Academy — Security Documentation

> Last Updated: 2026-03-13 04:00
> Priority: 🔴 CRITICAL — Must be implemented before ANY public deployment

---

## 1. Authentication Security

### 1.1 Password Policy

```text
Requirements:
├── Minimum length: 8 characters
├── Must contain: 1 uppercase + 1 lowercase + 1 number
├── Optional but recommended: 1 special character
├── Password history: Last 3 passwords cannot be reused
├── Max age: No forced rotation (NIST 800-63B recommendation)
└── Compromised password check: Compare against HaveIBeenPwned API (top 100k list)
```

**Payload CMS Implementation:**
```typescript
// collections/Users.ts → auth config
auth: {
  tokenExpiration: 7200,        // 2 hours
  maxLoginAttempts: 5,          // lockout after 5 failed attempts
  lockTime: 900000,             // 15 minutes lockout (ms)
  useAPIKey: true,
  verify: true,                 // email verification required
  forgotPassword: {
    generateEmailHTML: generateResetEmail,
  },
},
```

### 1.2 Brute Force Protection

| Layer | Mechanism | Config |
|---|---|---|
| **Payload CMS** | `maxLoginAttempts` + `lockTime` | 5 attempts → 15 min lock |
| **Rate Limiting** | IP-based throttle on `/api/users/login` | 10 req/min per IP |
| **Monitoring** | Alert on 20+ failed logins from same IP in 1 hour | Sentry/Slack alert |
| **Response** | Generic error: "بيانات الدخول غير صحيحة" | Never reveal if email exists |

### 1.3 Session Management

```text
Token Strategy:
├── Type: HTTP-only secure cookie (`payload-token`)
├── Expiration: 2 hours (sliding window)
├── Refresh: Auto-refresh on activity (Payload built-in)
├── Rotation: New token issued on login (invalidates old)
├── Concurrent Sessions: Allowed (max 3 devices)
│   └── On 4th login → oldest session invalidated
├── Logout: Cookie cleared + server-side token blacklist
├── Sensitive Actions: Re-authentication required for:
│   ├── Password change
│   ├── Email change
│   ├── Account deletion
│   └── Payment method change
└── Session Fixation: Token regenerated after successful login
```

### 1.4 CSRF Protection

```text
Strategy:
├── SameSite=Strict on auth cookies
├── CSRF token in all POST/PUT/DELETE forms
├── Double-submit cookie pattern for API routes
├── Origin header validation on webhooks
└── Referrer Policy: strict-origin-when-cross-origin
```

### 1.5 OAuth Security (Google Sign-In)

```text
Protections:
├── state parameter for CSRF prevention
├── nonce for replay attack prevention
├── Validate id_token signature server-side
├── Check token issuer = accounts.google.com
├── Check audience = our client_id
├── Extract email → check if account already exists
│   ├── Exists → link accounts (if same email)
│   └── New → create account + skip email verification
└── Never trust client-side authentication alone
```

---

## 2. Authorization & Access Control

### 2.1 Payload CMS Collection Access

```typescript
// *** CRITICAL: Every collection MUST have proper access controls ***

// Pattern for user-owned resources:
const isOwner = ({ req: { user }, id }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return { user_id: { equals: user.id } };
};

// Pattern for role-based access:
const isAdmin = ({ req: { user } }) => user?.role === 'admin';
const isInstructor = ({ req: { user } }) => 
  user?.role === 'instructor' || user?.role === 'admin';
const isAuthenticated = ({ req: { user } }) => !!user;

// Apply to collections:
// Users: read own, update own, admin CRUD
// Bookings: read own, create (logged in), admin all
// Payments: read own, admin all, create (system only)
// Programs: read all (public), create/update/delete (admin)
// Rounds: read all (public), create/update/delete (admin)
// ConsultationBookings: read own + instructor's own, admin all
// Leads: admin only
// DiscountCodes: admin only
// Notifications: read own, create (system only)
```

### 2.2 IDOR Prevention Matrix

| Resource | Attack | Prevention |
|---|---|---|
| `/dashboard/bookings/:id` | User A views User B's booking | Server-side: verify `booking.user_id === req.user.id` |
| `/dashboard/payments/:id` | View others' payments | Server-side: verify payment's booking owner |
| `/instructor/bookings/:id` | Instructor views other instructor's bookings | Verify `booking.instructor_id === req.user.instructorId` |
| `/api/users/:id` | Access other user's profile | Only return own profile unless admin |
| `PUT /api/bookings/:id` | Modify booking status | Only admin can change status |
| `PUT /api/users/:id` | Escalate own role to admin | `role` field: admin-only writable |
| `/api/payments` | Create fake payment record | System-only creation via webhook |

### 2.3 Role Escalation Prevention

```typescript
// Users collection → role field
{
  name: 'role',
  type: 'select',
  options: ['user', 'admin', 'instructor', 'b2b_manager'],
  defaultValue: 'user',
  required: true,
  access: {
    // Only admins can change roles
    update: ({ req: { user } }) => user?.role === 'admin',
    // Never allow self-elevation
    create: ({ req: { user }, data }) => {
      if (!user || user.role !== 'admin') {
        data.role = 'user'; // Force default
      }
      return true;
    },
  },
}
```

### 2.4 Middleware Route Protection

```typescript
// proxy.ts (Next.js 16 middleware)
const protectedRoutes = {
  '/dashboard':   ['user', 'admin', 'b2b_manager'],
  '/instructor':  ['instructor', 'admin'],
  '/b2b-dashboard': ['b2b_manager', 'admin'],
  '/admin':       ['admin'],
  '/checkout':    ['user', 'admin', 'b2b_manager'],
  '/onboarding':  ['user', 'admin', 'b2b_manager', 'instructor'],
};

// Flow:
// 1. Check if route is protected
// 2. If no token → redirect to /login?redirect=<current_path>
// 3. If token → verify token server-side (Payload API)
// 4. If role not allowed → redirect to appropriate dashboard
// 5. Log unauthorized access attempts
```

---

## 3. Input Validation & Sanitization

### 3.1 Validation Rules per Field

| Field | Type | Validation | Sanitization |
|---|---|---|---|
| `email` | string | RFC 5322 regex + MX record check | lowercase, trim |
| `phone` | string | E.164 format: `+20XXXXXXXXXX` (10-15 digits) | strip spaces/dashes |
| `firstName/lastName` | string | 2-50 chars, no numbers, no special chars | trim, escape HTML |
| `password` | string | 8+ chars, complexity rules above | never log, bcrypt hash |
| `slug` | string | lowercase, alphanumeric + hyphens only | auto-generate from title |
| `notes/description` | text | Max 5000 chars | sanitize HTML (DOMPurify) |
| `richText` | richtext | Payload Lexical editor (safe by design) | strip script tags |
| `amount/price` | number | > 0, max 999999.99, 2 decimal places | parseFloat + round |
| `date` | date | ISO 8601, must be in future (for new bookings) | normalize to UTC |
| `url` | string | Valid URL format, `https://` only | sanitize, no `javascript:` |
| `nationalIdNumber` | string | 14 digits (Egyptian national ID) | digits only |
| `discountCode` | string | alphanumeric, 4-20 chars, uppercase | toUpperCase, trim |

### 3.2 File Upload Security

```text
Allowed File Types:
├── Images: .jpg, .jpeg, .png, .webp, .svg (NO .gif to prevent XSS via GIF)
├── Documents: .pdf only (NO .doc, .docx, .xls — macro risks)
├── Videos: via external service (Bunny.net/Cloudflare Stream) — NOT uploaded to our server
└── National ID: .jpg, .png, .pdf only

File Size Limits:
├── Profile Picture: 5 MB max
├── Program Thumbnail: 10 MB max
├── Certificate Template: 10 MB max
├── National ID Image: 5 MB max
└── Session Materials (PDF): 25 MB max

Additional Protections:
├── Strip EXIF data from images (location, device info)
├── Validate file magic bytes (not just extension)
├── Store files outside web root (S3/R2)
├── Generate random filenames (UUID) — never use original
├── Scan with ClamAV or VirusTotal API (production)
├── Content-Disposition: attachment (prevent inline execution)
└── No directory listing on storage bucket
```

### 3.3 XSS Prevention

```text
Strategy (Defense in Depth):
├── React: JSX auto-escapes by default ✅
├── Rich Text: Payload Lexical editor sanitizes output ✅
├── User Input Display: Never use dangerouslySetInnerHTML
├── URL Parameters: Never inject into DOM without encoding
├── CSP Header: Content-Security-Policy → restrict inline scripts
├── API Responses: Set Content-Type: application/json (not text/html)
└── Cookies: HttpOnly + Secure + SameSite=Strict
```

### 3.4 SQL Injection Prevention

```text
Payload CMS uses parameterized queries via Drizzle ORM ✅
Additional Rules:
├── NEVER construct raw SQL from user input
├── Use Payload Local API for all data operations
├── If raw SQL needed → use parameterized queries ONLY
├── Database user has LIMITED permissions (no DROP, no GRANT)
└── Monitor slow queries for injection patterns
```

---

## 4. Payment Security

### 4.1 Server-Side Price Verification

```typescript
// ⚠️ CRITICAL: NEVER trust client-side prices

async function processPayment(bookingId: string, userId: string) {
  // 1. Fetch round price from DB (server-side)
  const booking = await payload.findByID({ collection: 'bookings', id: bookingId });
  const round = await payload.findByID({ collection: 'rounds', id: booking.round_id });
  
  // 2. Calculate the ACTUAL amount server-side
  let amount = round.price;
  
  // 3. Apply discounts server-side
  if (booking.discount_code) {
    const discount = await validateDiscount(booking.discount_code, round.id);
    amount = applyDiscount(amount, discount);
  }
  
  // 4. For installments, calculate installment amount
  if (booking.payment_plan_id) {
    const plan = await getPaymentPlan(booking.payment_plan_id);
    amount = calculateInstallmentAmount(amount, plan, booking.current_installment);
  }
  
  // 5. Send VERIFIED amount to Paymob — never the client-sent amount
  const paymobPayment = await createPaymobIntent(amount, booking, userId);
  return paymobPayment;
}
```

### 4.2 Webhook Signature Verification

```typescript
// /api/webhooks/paymob/route.ts
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('hmac');
  
  // 1. Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET!)
    .update(body)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    console.error('[SECURITY] Invalid Paymob webhook signature', {
      ip: req.headers.get('x-forwarded-for'),
      timestamp: new Date().toISOString(),
    });
    return new Response('Invalid signature', { status: 401 });
  }
  
  // 2. Idempotency check — prevent double-processing
  const { transaction_id } = JSON.parse(body);
  const existing = await payload.find({
    collection: 'payments',
    where: { transaction_id: { equals: transaction_id } },
  });
  
  if (existing.totalDocs > 0) {
    return new Response('Already processed', { status: 200 });
  }
  
  // 3. Process payment...
}
```

### 4.3 Double Payment Prevention

```text
Strategy:
├── Idempotency Key: Each payment request has a unique key (booking_id + installment_number)
├── Database Lock: Pessimistic lock on booking record during payment
├── UI: Disable "Pay" button after click + loading spinner
├── API: Check payment status BEFORE creating new payment intent
├── Webhook: Check if transaction_id already processed
└── Reconciliation: Daily cron to match Paymob records with DB
```

### 4.4 Payment Link Security

```text
Protections:
├── Short codes: cryptographically random (nanoid, 12 chars)
├── Expiry: enforced server-side (NOT client-side JS check)
├── Max uses: atomic decrement in DB (prevent race condition)
├── Usage logging: IP, user_agent, timestamp for each click
├── Rate limit: Max 5 payment attempts per link per hour
└── Auto-deactivate: if 10+ failed payments (fraud indicator)
```

---

## 5. API Security

### 5.1 Security Headers (next.config.ts)

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.paymob.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://accept.paymob.com https://*.supabase.co",
      "frame-src https://accept.paymob.com",
    ].join('; '),
  },
];
```

### 5.2 CORS Policy

```typescript
// Only allow specific origins
const allowedOrigins = [
  'https://nextacademyedu.com',
  'https://www.nextacademyedu.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000',
].filter(Boolean);

// Webhook endpoints: allow Paymob IPs only
const paymobAllowedIPs = [
  // Add Paymob's production IP ranges
];
```

### 5.3 Request Validation

```text
Every API Route MUST:
├── Validate Content-Type header
├── Parse body with zod/joi schema
├── Check authentication token
├── Check authorization (role + ownership)
├── Validate all input parameters
├── Set response Content-Type: application/json
├── Never expose internal errors to client
└── Log request metadata (IP, user, timestamp)
```

---

## 6. Data Protection

### 6.1 Sensitive Data Handling

| Data | Classification | Storage | Display | Logging |
|---|---|---|---|---|
| Password | SECRET | bcrypt hash only | Never shown | Never logged |
| National ID Number | PII-HIGH | Encrypted at rest | Masked: `***********1234` | Never logged |
| National ID Image | PII-HIGH | Encrypted S3 + auto-delete after 30 days | Admin-only view | Never logged |
| Email | PII | Plain text (indexed) | Full display to owner | Masked in logs |
| Phone | PII | Plain text (indexed) | Full display to owner | Masked in logs |
| Payment card data | PCI | NOT STORED (Paymob handles) | Last 4 digits only | Never logged |
| Transaction ID | FINANCIAL | Plain text | Masked to user | Safe to log |
| API Keys | SECRET | Environment variables only | Never shown in UI | Never logged |
| CRM IDs | INTERNAL | Plain text | Never shown to user | Safe to log |

### 6.2 Encryption

```text
In Transit:
├── TLS 1.3 enforced (HSTS header)
├── Certificate: Vercel auto-managed
└── API calls to Paymob/Resend/CRM: HTTPS only

At Rest:
├── Neon PostgreSQL: Encrypted by default (AES-256)
├── S3/R2 files: Server-side encryption (SSE-S3)
├── National ID images: Additional application-level encryption
└── Backups: Encrypted before upload
```

### 6.3 Data Retention & Deletion

```text
Retention Policy:
├── Active user data: Indefinite (while account exists)
├── Deleted user data:
│   ├── Profile: Anonymized immediately (name → "Deleted User", email → hash)
│   ├── Bookings: Preserved (anonymized user reference) — financial records
│   ├── Payments: Preserved indefinitely (legal requirement)
│   ├── Reviews: Anonymized ("مستخدم محذوف")
│   └── CRM Contact: Marked as "deleted" in Twenty CRM
├── National ID images: Auto-delete 30 days after installment approval/rejection
├── Expired payment links: Soft-delete after 90 days
├── Session recordings: 1 year retention, then archive
├── Logs: 90 days hot storage → 1 year cold storage → purged
├── Failed login attempts: 30 days
└── Webhook logs: 90 days

Account Deletion Flow:
1. User requests deletion → /dashboard/profile → "Delete Account"
2. System checks:
   ├── Active bookings? → "لازم تلغي حجوزاتك الأول"
   ├── Pending installments? → "لازم تسدد أقساطك المستحقة الأول"
   └── Upcoming consultations? → "لازم تلغي استشاراتك الأول"
3. Confirmation: User types "DELETE" (Arabic: "حذف")
4. Email confirmation sent (24-hour grace period)
5. After 24h → anonymize data + clear sessions + notify admin
6. User receives final "Account Deleted" email
```

---

## 7. Audit Logging

### 7.1 Events to Log

```text
Authentication Events:
├── Login success/failure (IP, user_agent, timestamp)
├── Password change
├── Password reset request
├── Account lockout
├── Session creation/destruction
└── OAuth login

Authorization Events:
├── Unauthorized access attempts (user, resource, action)
├── Role changes (who, old_role, new_role, changed_by)
└── Admin actions (CRUD on any collection)

Financial Events:
├── Payment created/completed/failed/refunded
├── Discount code usage (code, user, amount)
├── Installment approval/rejection (admin, user, reason)
├── Manual payment marking (admin, booking, amount)
└── Payment link creation/usage/expiry

Data Events:
├── User data export request
├── Account deletion request/execution
├── Bulk data operations (import/export)
└── National ID upload/view/delete
```

### 7.2 Log Format

```json
{
  "timestamp": "2026-03-13T02:00:00Z",
  "level": "info|warn|error|critical",
  "event": "auth.login.success",
  "actor": { "id": "user_123", "role": "user", "ip": "1.2.3.4" },
  "resource": { "type": "session", "id": "sess_abc" },
  "metadata": { "user_agent": "...", "locale": "ar" },
  "result": "success|failure",
  "reason": null
}
```

---

## 8. Incident Response

### 8.1 Security Incident Severity Levels

| Level | Example | Response Time | Actions |
|---|---|---|---|
| 🔴 P0 Critical | Data breach, payment compromise | Immediate | Shutdown affected service, notify users, contact Paymob |
| 🟠 P1 High | Unauthorized admin access, mass login failures | 1 hour | Block attacker IP, rotate secrets, audit logs |
| 🟡 P2 Medium | XSS found in production, IDOR confirmed | 4 hours | Deploy fix, add tests, notify affected users |
| 🟢 P3 Low | Weak password accepted, missing CSP header | 24 hours | Fix in next deployment, add to security checklist |

### 8.2 Response Checklist

```text
1. DETECT: Monitor alerts (Sentry, rate limit triggers, Paymob alerts)
2. CONTAIN: Disable affected route/feature, block attacker
3. ASSESS: Determine scope (what data exposed? how many users?)
4. FIX: Deploy patch, rotate compromised secrets
5. NOTIFY: Affected users + Paymob (if payment related)
6. DOCUMENT: Add to errors.md + post-mortem
7. PREVENT: Add test case, update security rules, improve monitoring
```
