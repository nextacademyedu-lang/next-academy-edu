# Next Academy — Data Privacy & Retention Policy

> Last Updated: 2026-03-13 04:00
> Jurisdiction: Egypt (potential EU users via international access)
> References: Egyptian Personal Data Protection Law (2020), GDPR (for international reach)

---

## 1. Data Classification

### 1.1 Data Categories

| Category | Examples | Sensitivity | Storage Rules |
|---|---|---|---|
| **PII-HIGH** | National ID number, national ID image | Critical | Encrypted, auto-delete after use, admin-only access |
| **PII** | Name, email, phone, date of birth, address | High | Standard DB storage, access-controlled, maskable |
| **FINANCIAL** | Payment records, transaction IDs, amounts, refund records | High | Immutable records, never delete, audit trail |
| **BEHAVIORAL** | Course progress, quiz scores, attendance, browsing history | Medium | Anonymizable, used for product improvement |
| **BUSINESS** | Company name, industry, employee count, tax ID | Medium | Shared within company context only |
| **TECHNICAL** | IP address, user agent, session tokens, device info | Low | Auto-purge after 90 days |
| **PUBLIC** | Program details, instructor bios, reviews (public), blog content | Public | No restrictions |

### 1.2 Data Collection Inventory

```text
What we collect and WHY:

User Registration:
├── Name → Display, certificates, CRM
├── Email → Auth, notifications, CRM
├── Phone → WhatsApp notifications, emergency contact
├── Password → Authentication (stored as bcrypt hash)
├── Date of Birth (optional) → Demographics, age-appropriate content
└── Preferred Language → UI localization

Onboarding:
├── Company name → B2B features, analytics
├── Job title → Personalization
├── Industry → Recommendations
├── Learning goals (text) → Personalization
├── How did you hear about us → Marketing attribution
└── Experience level → Content recommendations

Booking:
├── Booking details → Service delivery
├── Payment information → Processed by Paymob (we don't store card data)
├── Contact source → Sales attribution
└── Notes → User convenience

Installment Request:
├── National ID number → Identity verification
├── National ID image → Identity verification
├── Reason → Approval decision
└── ⚠️ Both auto-deleted 30 days after approval/rejection

Consultation:
├── Notes/questions → Session preparation
├── Meeting link → Calendar integration
└── Session recording (if enabled) → Review/training

Automatic Collection:
├── IP address → Security, rate limiting
├── Browser/device → Compatibility, analytics
├── Page views → Analytics, UX improvement
├── Click events → UX improvement
└── Error logs → Debugging
```

---

## 2. Data Retention Policy

### 2.1 Retention Periods

| Data Type | Retention Period | After Period |
|---|---|---|
| Active user account data | Indefinite (while active) | Anonymize on deletion |
| Inactive user (no login 2+ years) | 2 years after last login | Email re-engagement → then anonymize |
| Payment records | 7 years | Required by Egyptian tax law |
| Invoices | 7 years | Required by tax law |
| Transaction logs | 7 years | Financial compliance |
| National ID images | 30 days | Auto-delete after installment decision |
| National ID numbers | 30 days | Auto-delete (keep approval record without ID) |
| Session recordings | 1 year | Archive → then delete |
| Error/debug logs | 90 days | Auto-purge |
| Audit logs (auth events) | 1 year | Auto-purge |
| Analytics data | 2 years | Aggregate only (anonymize individual records) |
| Expired payment links | 90 days | Soft-delete → hard-delete after 90 days |
| Failed login attempts | 30 days | Auto-purge |
| WhatsApp message logs | 30 days | Auto-purge |
| Email delivery logs | 90 days | Auto-purge |
| CRM sync logs | 90 days | Auto-purge |

### 2.2 Automated Cleanup Cron

```text
Daily at 3:00 AM (Cairo time):
├── Delete national ID images older than 30 days
├── Delete failed login attempts older than 30 days
├── Soft-delete expired payment links older than 90 days

Weekly (Sunday midnight):
├── Purge error logs older than 90 days
├── Purge WhatsApp logs older than 30 days
├── Archive session recordings older than 1 year

Monthly (1st of month):
├── Identify inactive users (no login 2+ years)
├── Send re-engagement email
├── After 30 days no response → anonymize
└── Generate data retention report for admin
```

---

## 3. User Rights

### 3.1 Right to Access (Data Export)

```text
Flow:
1. User → /dashboard/profile → "تحميل بياناتي" (Download My Data)
2. System generates JSON/PDF with:
   ├── Personal info (name, email, phone)
   ├── Booking history
   ├── Payment history (amounts, dates, no card data)
   ├── Course progress & certificates
   ├── Reviews submitted
   └── Notification preferences
3. Download link sent to verified email
4. Link expires in 24 hours
5. Rate limit: 1 export per 7 days

Admin can also export user data from /admin/users/:id
```

### 3.2 Right to Deletion (Account Deletion)

```text
Flow:
1. User → /dashboard/profile → "حذف حسابي" (Delete My Account)
2. System shows what will be deleted/preserved:
   ├── ❌ Deleted: profile, preferences, notifications, learning goals
   ├── ❌ Deleted: CRM contact (marked as deleted)
   ├── 🔒 Preserved: payment records (legal requirement) — anonymized
   ├── 🔒 Preserved: booking history (anonymized user reference)
   ├── 🔒 Preserved: reviews (author changed to "مستخدم محذوف")
   └── ❌ Deleted: certificates (revoked)

3. Pre-conditions (must be met before deletion allowed):
   ├── No active bookings (must cancel first)
   ├── No pending installments (must settle first)
   ├── No upcoming consultations (must cancel first)
   └── No pending refund requests (must complete first)

4. Confirmation:
   ├── User types "حذف" (or "DELETE" in English)
   ├── Email confirmation sent (24-hour link)
   ├── 24-hour grace period (can cancel)
   └── After 24h → execution

5. Execution:
   ├── Anonymize: name → "مستخدم محذوف #[hash]"
   ├── Anonymize: email → sha256(email)@deleted.nextacademy.com
   ├── Clear: phone, address, DOB, company, photo
   ├── Delete: notification records
   ├── Delete: learning preferences
   ├── Invalidate: all sessions
   ├── Update: CRM contact status → "deleted"
   ├── Send: final "Account Deleted" email (to original email, cached)
   └── Log: account deletion event (audit)
```

### 3.3 Right to Rectification (Data Correction)

```text
Users can update their own data:
├── Name, phone, email → /dashboard/profile
├── Company info → /dashboard/profile
├── Password → /dashboard/profile (requires current password)
└── Contact admin for data corrections they can't make themselves

Email change requires:
├── Verification of new email
├── Notification to old email
├── CRM sync update
└── Password re-entry for security
```

### 3.4 Communication Preferences

```text
Users can control:
├── Marketing emails: opt-in/opt-out → /dashboard/profile
├── Program recommendations: opt-in/opt-out
├── WhatsApp notifications: opt-in/opt-out (on by default)
├── Promotional SMS: opt-out only (never auto-opt-in)

Users CANNOT opt out of:
├── Booking confirmation emails
├── Payment receipts
├── Installment reminders (financial obligation)
├── Security alerts (password change, suspicious login)
└── Legal/policy change notifications
```

---

## 4. Third-Party Data Sharing

### 4.1 Data Processors

| Vendor | Data Shared | Purpose | Agreement |
|---|---|---|---|
| **Paymob** | Name, email, phone, payment amount | Payment processing | PCI-DSS compliant, DPA signed |
| **Resend** | Email address, name | Transactional/marketing email | DPA available |
| **Neon** | All database records | Database hosting | SOC2, encrypted at rest |
| **Vercel** | Access logs, IP | Hosting, CDN | DPA available |
| **Sentry** | Error data (no PII in config) | Error tracking | SOC2, DPA available |
| **Twenty CRM** | Name, email, phone, company | CRM management | Self-hosted (Railway) |
| **Google** | OAuth email | Authentication | Google Privacy Policy |

### 4.2 Rules

```text
├── NEVER sell user data
├── NEVER share data for advertising
├── Only share minimum data needed for service
├── All processors must have DPA (Data Processing Agreement)
├── Self-hosted services preferred (Twenty CRM on Railway)
├── Regular audit of third-party access
└── Immediately revoke access on vendor change
```

---

## 5. Cookie Policy

```text
Cookies Used:
├── payload-token → Auth session (HttpOnly, Secure, SameSite=Strict)
├── NEXT_LOCALE → Language preference (Session cookie)
├── __vercel_live_token → Vercel preview (development only)
└── Analytics cookies → Only with consent (Google Analytics)

Cookie Consent:
├── Show cookie banner on first visit
├── Essential cookies: no consent needed (payload-token, NEXT_LOCALE)
├── Analytics cookies: require opt-in
├── Remember preference for 1 year
└── Compliance: Egyptian data protection + GDPR (if EU users)
```

---

## 6. Breach Notification

```text
If personal data breach occurs:
├── Internal: Notify admin + technical team within 1 hour
├── Assessment: Determine scope within 4 hours
│   ├── What data was exposed?
│   ├── How many users affected?
│   ├── Is financial data involved?
│   └── Is the breach contained?
├── Users: Notify affected users within 72 hours
│   ├── What happened
│   ├── What data was affected
│   ├── What we're doing about it
│   └── Steps they should take (change password, etc.)
├── Authorities: If legally required (Egypt's data protection authority)
├── Paymob: If payment data involved
└── Document: Full post-mortem in errors.md
```

---

## 7. Privacy UI Requirements

```text
Pages to Implement:
├── /privacy → Full privacy policy (Arabic + English)
├── /terms → Terms of service (Arabic + English)
├── /cookies → Cookie policy
├── /dashboard/profile → Data management section
│   ├── Download my data
│   ├── Delete my account
│   ├── Communication preferences
│   └── Connected accounts
└── Footer links: Privacy Policy, Terms, Cookie Policy (on every page)
```
