# Next Academy — Error Handling Strategy

> Last Updated: 2026-03-13 04:00
> Priority: 🔴 CRITICAL

---

## 1. Error Handling Philosophy

```text
Principles:
├── 1. NEVER show technical details to users (stack traces, SQL errors)
├── 2. ALWAYS show friendly, actionable messages in Arabic (primary) + English
├── 3. ALWAYS log full error details server-side
├── 4. Graceful degradation: partial failure ≠ full failure
├── 5. Retry transient errors automatically (network, timeouts)
├── 6. Alert on persistent errors (3+ retries failed)
└── 7. Every error has a recovery path for the user
```

---

## 2. Frontend Error Handling

### 2.1 Error Boundary Strategy

```text
Error Boundary Hierarchy:
├── Root Layout → catches entire app crash
│   └── "حصلت مشكلة غير متوقعة. جاري التحميل من جديد"
│       + Auto-reload after 5 seconds
│       + "إعادة التحميل" manual button
├── Route Group → catches page-level errors
│   ├── (dashboard)/error.tsx → "مشكلة في لوحة التحكم"
│   ├── (checkout)/error.tsx → "مشكلة في صفحة الدفع — حجزك آمن"
│   ├── (instructor)/error.tsx → "مشكلة في بوابة المحاضر"
│   └── (auth)/error.tsx → "مشكلة في صفحة الدخول"
├── Section Level → catches component-level errors
│   ├── FeaturedPrograms → shows placeholder cards
│   ├── InstructorsPreview → shows "تعذر تحميل المحاضرين"
│   └── VideoTestimonials → hides section entirely
└── Form Level → inline validation errors (no boundary)
    └── Shows field-level errors without crashing
```

### 2.2 Network Error States

| Scenario | User Message (AR) | User Message (EN) | Action |
|---|---|---|---|
| No internet | "مفيش اتصال بالإنترنت. تأكد من الشبكة وحاول تاني" | "No internet connection" | Retry button |
| API timeout (10s) | "السيرفر بطيء. جاري المحاولة..." | "Server is slow. Retrying..." | Auto-retry × 3 |
| API 500 error | "حصلت مشكلة. جرب تاني كمان شوية" | "Something went wrong" | Retry button + support link |
| API 403 | "مش مسموحلك توصل للصفحة دي" | "Access denied" | Redirect to dashboard |
| API 404 | "الصفحة مش موجودة" | "Page not found" | Home button + search |
| API rate limit (429) | "طلبات كتير. استنى شوية وجرب تاني" | "Too many requests" | Auto-retry after 30s |

### 2.3 Form Validation

```text
Validation Strategy:
├── Inline validation: on blur (field loses focus)
├── Form-level validation: on submit
├── Server-side validation: always re-validate
├── Show errors below field in red (var(--error))
├── Scroll to first error on submit
└── Keep valid data when form has errors

Field-Specific Messages:
├── Email:
│   ├── Empty: "الإيميل مطلوب"
│   ├── Invalid: "أدخل إيميل صحيح"
│   └── Taken: "الإيميل ده مستخدم بالفعل"
├── Password:
│   ├── Short: "الباسورد لازم يكون 8 حروف على الأقل"
│   ├── Weak: "الباسورد لازم يحتوي على حرف كبير ورقم"
│   └── Mismatch: "الباسوردات مش متطابقين"
├── Phone:
│   ├── Empty: "رقم الموبايل مطلوب"
│   ├── Invalid: "أدخل رقم موبايل صحيح (مثال: 01012345678)"
│   └── Too short: "الرقم لازم يكون 11 رقم"
├── Name:
│   ├── Empty: "الاسم مطلوب"
│   ├── Short: "الاسم لازم يكون أكتر من حرفين"
│   └── Invalid chars: "الاسم ممكن يحتوي على حروف فقط"
├── Discount Code:
│   ├── Invalid: "الكود ده مش صحيح"
│   ├── Expired: "الكود ده انتهت صلاحيته"
│   ├── Used: "الكود ده اتستخدم العدد المسموح"
│   └── Not applicable: "الكود ده مش للبرنامج ده"
└── File Upload:
    ├── Too large: "الملف أكبر من [X] ميجا"
    ├── Wrong type: "نوع الملف مش مدعوم. الأنواع المسموحة: JPG, PNG, PDF"
    └── Upload failed: "فشل رفع الملف. جرب تاني"
```

### 2.4 Loading States

```text
Loading State Strategy:
├── Initial Page Load:
│   ├── loading.tsx → skeleton screens (not spinners)
│   ├── Match the expected layout structure
│   └── Animate: subtle pulse (opacity 0.3 → 0.7)
├── Data Fetching:
│   ├── Skeleton cards for programs/bookings/instructors
│   ├── Skeleton rows for tables (payments, sessions)
│   └── Never show empty page to user
├── Button Actions:
│   ├── Show spinner inside button (replace text)
│   ├── Disable button during loading
│   ├── Set min width to prevent layout shift
│   └── Timeout: if loading > 10s → show error
├── Form Submission:
│   ├── Button: "جاري الحفظ..." with spinner
│   ├── Disable all form inputs during submission
│   └── Re-enable on error
└── Page Transitions:
    ├── Use Next.js loading.tsx for route transitions
    ├── Top progress bar (NProgress style)
    └── Don't flash loading state for < 200ms
```

### 2.5 Empty States

```text
Empty State Messages with CTA:
├── No Bookings: "مفيش حجوزات لسه. تصفح البرامج واحجز أول كورس!"
│   └── CTA: [تصفح البرامج]
├── No Payments: "مفيش مدفوعات مسجلة"
│   └── CTA: (none — informational)
├── No Notifications: "مفيش إشعارات جديدة 🎉"
│   └── (none)
├── No Programs Found (search): "مفيش نتائج لـ '[query]'. جرب كلمات تانية"
│   └── CTA: [إزالة الفلاتر]
├── No Available Rounds: "مفيش جولات متاحة حالياً. سجل عشان نبلغك لما ينزل جديد"
│   └── CTA: [إشعار عند التوفر]
├── No Consultation Slots: "المحاضر مش متاح في الأيام دي. جرب أيام تانية"
│   └── CTA: [عرض كل الأيام]
├── No Reviews: "كن أول شخص يقيّم البرنامج ده!"
│   └── CTA: (only after completion)
├── Instructor: No Bookings: "مفيش حجوزات استشارات لسه"
│   └── CTA: [إضافة أنواع استشارات]
└── Admin: No Leads: "مفيش عملاء محتملين. أضف أول عميل"
    └── CTA: [إضافة عميل]
```

### 2.6 Offline Handling (PWA)

```text
Strategy:
├── Cache critical pages (dashboard shell, program list)
├── Shows: "أنت مش متصل بالإنترنت — بعض المحتوى القديم متاح"
├── Banner at top: yellow warning banner
├── Disable: booking, payment, form submission
├── Enable: browsing cached programs, viewing cached bookings
├── On reconnect: auto-refresh data + hide banner
└── Service Worker: cache-first for static assets, network-first for API
```

---

## 3. Backend Error Handling

### 3.1 API Route Error Pattern

```typescript
// Standard API response format
type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;         // machine-readable: "BOOKING_FULL"
    message: string;      // user-friendly Arabic message
    message_en: string;   // user-friendly English message
    details?: unknown;    // additional context (admin only)
  };
  meta?: {
    pagination?: { page: number; limit: number; total: number; };
  };
};

// Standard error handler
function handleAPIError(error: unknown, context: string): Response {
  // 1. Log full error server-side
  console.error(`[API Error] ${context}:`, error);
  
  // 2. Determine error type
  if (error instanceof ValidationError) {
    return Response.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'البيانات المدخلة غير صحيحة',
        message_en: 'Invalid input data',
        details: error.details,
      }
    }, { status: 400 });
  }
  
  if (error instanceof AuthenticationError) {
    return Response.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'يجب تسجيل الدخول أولاً',
        message_en: 'Authentication required',
      }
    }, { status: 401 });
  }
  
  if (error instanceof ForbiddenError) {
    return Response.json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'مش مسموحلك تعمل العملية دي',
        message_en: 'You do not have permission',
      }
    }, { status: 403 });
  }
  
  if (error instanceof NotFoundError) {
    return Response.json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'العنصر المطلوب غير موجود',
        message_en: 'Resource not found',
      }
    }, { status: 404 });
  }
  
  // 3. Unknown errors — never expose details
  return Response.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'حصلت مشكلة. جرب تاني كمان شوية',
      message_en: 'Something went wrong. Please try again later',
    }
  }, { status: 500 });
}
```

### 3.2 Error Codes Reference

| Code | HTTP | Arabic Message | Cause |
|---|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | بيانات الدخول غير صحيحة | Wrong email/password |
| `AUTH_ACCOUNT_LOCKED` | 423 | الحساب مقفول. جرب بعد 15 دقيقة | Too many failed logins |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | لازم تأكد إيميلك الأول | Unverified email |
| `AUTH_SESSION_EXPIRED` | 401 | جلستك انتهت. سجل دخول تاني | Token expired |
| `BOOKING_ROUND_FULL` | 409 | الأماكن كلها خلصت في الجولة دي | No seats |
| `BOOKING_ALREADY_EXISTS` | 409 | أنت محجوز بالفعل في الجولة دي | Duplicate booking |
| `BOOKING_ROUND_CLOSED` | 400 | الحجز مقفول للجولة دي | Round not open |
| `BOOKING_ROUND_STARTED` | 400 | الجولة بدأت بالفعل | Round already started |
| `PAYMENT_FAILED` | 402 | فشل الدفع. جرب تاني أو استخدم كارت تاني | Card declined |
| `PAYMENT_AMOUNT_MISMATCH` | 400 | مبلغ الدفع مش مطابق | Tampering attempt |
| `PAYMENT_ALREADY_PAID` | 409 | الدفعة دي مدفوعة بالفعل | Double payment |
| `DISCOUNT_INVALID` | 400 | كود الخصم مش صحيح | Invalid code |
| `DISCOUNT_EXPIRED` | 400 | كود الخصم انتهت صلاحيته | Expired code |
| `DISCOUNT_MAX_USED` | 400 | كود الخصم وصل لأقصى عدد استخدامات | Code exhausted |
| `DISCOUNT_NOT_APPLICABLE` | 400 | الكود مش للبرنامج ده | Wrong program |
| `INSTALLMENT_NOT_APPROVED` | 403 | محتاج موافقة على طلب التقسيط الأول | No approval |
| `INSTALLMENT_APPROVAL_EXPIRED` | 400 | موافقة التقسيط انتهت. قدم طلب جديد | Approval expired |
| `INSTALLMENT_OVERDUE` | 403 | عندك قسط متأخر. ادفعه الأول | Overdue |
| `CONSULTATION_SLOT_TAKEN` | 409 | الموعد اتحجز بالفعل. اختار وقت تاني | Slot taken |
| `CONSULTATION_SLOT_BLOCKED` | 400 | المحاضر مش متاح في الوقت ده | Instructor blocked |
| `UPLOAD_TOO_LARGE` | 413 | الملف أكبر من الحجم المسموح | File too big |
| `UPLOAD_INVALID_TYPE` | 400 | نوع الملف مش مدعوم | Wrong file type |
| `RATE_LIMIT_EXCEEDED` | 429 | طلبات كتير. استنى شوية | Rate limited |
| `WAITLIST_ALREADY_JOINED` | 409 | أنت في قائمة الانتظار بالفعل | Duplicate waitlist |
| `REFUND_NOT_ELIGIBLE` | 400 | مش مؤهل للاسترداد حسب السياسة | Refund policy |
| `REVIEW_ALREADY_SUBMITTED` | 409 | أنت عملت تقييم بالفعل | Duplicate review |

### 3.3 Database Error Handling

```text
Postgres Errors:
├── Connection timeout → retry 3 times with exponential backoff (1s, 2s, 4s)
├── Connection pool exhausted → log CRITICAL + return 503
├── Unique constraint violation → return 409 with friendly message
├── Foreign key violation → return 400 "البيانات المرتبطة غير موجودة"
├── Deadlock detected → retry once after 100ms
├── Query timeout (30s) → log + return 504
└── Neon cold start → first query may timeout → retry with warm-up query

Mitigation:
├── Connection pooling: max 10 connections (Neon free tier limit)
├── Query timeout: 30 seconds max
├── Transaction timeout: 60 seconds max
├── Health check: /api/health → SELECT 1 (every 30s)
└── Circuit breaker: if 5 consecutive failures → mark DB as down → 503 for 30s
```

### 3.4 Payload CMS Hook Errors

```text
Hook Error Strategy:
├── beforeChange hooks → error stops the operation
│   ├── Validation error → return error to client
│   └── External API error → log + return generic error
├── afterChange hooks → error does NOT undo the operation
│   ├── CRM sync fails → queue for retry, don't fail the booking
│   ├── Email fails → queue for retry, don't fail the action
│   └── WhatsApp fails → log warning, don't affect operation
└── Error in hooks should NEVER cause data inconsistency
```

---

## 4. Integration Error Handling

### 4.1 Paymob Errors

| Error | Detection | Recovery |
|---|---|---|
| API down | HTTP 5xx / timeout | Show alternative payment methods |
| Invalid credentials | HTTP 401 | Admin alert + check env vars |
| Payment intent creation fails | API error response | Retry × 2, then show error |
| Webhook signature invalid | HMAC mismatch | Reject + log security alert |
| Refund API fails | API error response | Queue for retry + admin alert |

### 4.2 Resend (Email) Errors

| Error | Detection | Recovery |
|---|---|---|
| API down | HTTP 5xx / timeout | Queue email for retry (in 5 min) |
| Rate limited | HTTP 429 | Respect Retry-After header |
| Invalid email | HTTP 400 | Mark user email as invalid + log |
| Template error | HTML rendering failure | Send plain-text fallback |
| Quota exhausted | HTTP 429 (monthly) | Admin alert + switch to backup |

```text
Email Queue Strategy:
├── Primary: Send immediately via Resend
├── On failure: Add to retry queue (in-memory or Redis)
├── Retry: 3 attempts with backoff (5min, 30min, 2hr)
├── After 3 failures: log error + admin notification
├── NEVER lose transactional emails (booking confirmation, payment receipt)
└── Marketing emails: acceptable to skip on failure
```

### 4.3 Evolution API (WhatsApp) Errors

| Error | Detection | Recovery |
|---|---|---|
| API down | Connection refused | Skip WhatsApp, rely on email |
| Invalid phone number | API error | Skip + log warning |
| Message not delivered | Delivery report | Retry once, then skip |
| Rate limited | API 429 | Wait + batch messages |
| Number not on WhatsApp | API error | Skip + mark in user profile |

```text
WhatsApp Rule: WhatsApp is a BEST-EFFORT channel
├── Never block critical flows for WhatsApp failure
├── Email is always the primary notification channel
├── WhatsApp failures are logged but don't raise alerts
└── User should never see "WhatsApp failed" error
```

### 4.4 Twenty CRM Sync Errors

```text
CRM Sync is ASYNCHRONOUS and BEST-EFFORT:
├── Sync happens in afterChange hooks (non-blocking)
├── On failure: add to retry queue
├── Retry: 3 attempts over 1 hour
├── After 3 failures: create "sync_failed" record for admin
├── Admin can manually trigger re-sync from /admin
├── NEVER block user operations for CRM sync
├── Data in Payload is source of truth, not CRM
└── Daily cron: reconcile Payload ↔ CRM contacts
```

### 4.5 Google Calendar/Meet Errors

```text
Calendar Integration is GRACEFUL-DEGRADATION:
├── If API fails → show manual Zoom link input for Admin
├── If Meet link generation fails → Admin can paste Zoom link manually
├── If adding guest fails → send email with calendar attachment (.ics file)
├── Quota exceeded → batch calendar operations, admin alert
└── Service account token expired → auto-refresh (Google SDK handles this)
```

---

## 5. Cron Job Error Handling

### 5.1 Cron Failure Strategy

```text
Each cron job must:
├── Log start time + context
├── Wrap in try-catch
├── Log completion (success/failure count)
├── Track metrics: items processed, errors, duration
├── Alert if failure rate > 10%
├── Alert if cron didn't run (heartbeat check)
└── Dead letter queue for failed items

Cron Jobs:
├── payment-reminders → runs every 6 hours
│   ├── Failure: individual payment reminder fails → log + skip + continue
│   └── Recovery: next run catches any missed reminders
├── consultation-reminders → runs every hour
│   ├── Failure: skip failed notification → email as backup
│   └── Critical: 1-hour-before reminder is time-sensitive
├── slot-generation → runs daily at midnight
│   ├── Failure: no new slots → admin alert
│   └── Recovery: can run manually via admin endpoint
├── waitlist-cascade → runs every hour
│   ├── Failure: waitlist not processed → try next hour
│   └── Risk: user may miss 24hr window → extend grace period
├── booking-timeout → runs every 5 minutes
│   ├── Cancel reserved bookings > 15 min unpaid
│   └── Release seats back to pool
└── reconciliation → runs daily at 2 AM
    ├── Failure: admin alert + manual reconciliation
    └── Non-blocking: doesn't affect operations
```

---

## 6. Error Monitoring & Alerting

### 6.1 Error Tracking (Sentry)

```text
Sentry Configuration:
├── Environment: production / staging / development
├── DSN: env variable (NEXT_PUBLIC_SENTRY_DSN)
├── Sample rate: 100% for errors, 10% for performance
├── PII redaction: strip emails, phones, passwords from error reports
├── Source maps: uploaded on build
├── Release tracking: tied to git commits
└── User context: user ID + role (never email in Sentry)

Alert Rules:
├── Any P0 error → Slack #alerts-critical + email
├── Error rate > 1% of requests → Slack #alerts
├── New error type → Slack #errors
├── Payment errors → Slack #payments + email to admin
└── Auth errors (brute force pattern) → Slack #security
```

### 6.2 Health Check Endpoints

```text
GET /api/health → 200 OK or 503 Service Unavailable

Response:
{
  "status": "ok" | "degraded" | "down",
  "checks": {
    "database": "ok" | "error",
    "paymob": "ok" | "error",
    "resend": "ok" | "error",
    "crm": "ok" | "error",
    "whatsapp": "ok" | "error"
  },
  "timestamp": "2026-03-13T04:00:00Z",
  "version": "1.0.0"
}

"degraded": one or more non-critical services down (CRM, WhatsApp)
"down": critical service down (database, Paymob)
```

### 6.3 User Error Reporting

```text
In-App Error Reporting:
├── On any error page → "أبلغ عن المشكلة" button
├── Opens modal with:
│   ├── Error context (auto-filled, technical, hidden)
│   ├── "وصف المشكلة" text area
│   ├── Screenshot option (optional)
│   └── Submit → creates support ticket
├── Confirmation: "شكراً! هنراجع المشكلة في أقرب وقت"
└── Creates: Sentry issue + optional email to admin
```
