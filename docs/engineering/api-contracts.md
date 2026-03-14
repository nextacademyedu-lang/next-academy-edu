# Next Academy — API Contracts

> Last Updated: 2026-03-13 14:31
> Base URL: `/api`
> Auth: Payload CMS token via `payload-token` cookie

---

## Standard Response Format

```typescript
// Success
{ "success": true, "data": T, "meta"?: { pagination } }

// Error
{ "success": false, "error": { "code": string, "message": string, "message_en": string } }

// Pagination (when meta.pagination exists)
interface Pagination {
  page: number;        // Current page (1-indexed)
  limit: number;       // Items per page
  totalDocs: number;   // Total matching documents
  totalPages: number;  // Total pages
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

---

## 1. Auth Endpoints

### POST /api/users/login
```
Body: { email: string, password: string }
200: { success: true, data: { user, token, exp } }
401: AUTH_INVALID_CREDENTIALS
423: AUTH_ACCOUNT_LOCKED (after 5 failures, 15 min)
Rate Limit: 10 req/min per IP
```

### POST /api/users
```
Body: { email, password, firstName, lastName, phone }
201: { success: true, data: { user } }
400: VALIDATION_ERROR (missing/invalid fields)
409: AUTH_EMAIL_EXISTS
Rate Limit: 5 req/min per IP
```

### POST /api/users/forgot-password
```
Body: { email: string }
200: { success: true } (always 200, even if email doesn't exist — security)
Rate Limit: 3 req/min per IP
```

### POST /api/users/reset-password
```
Body: { token: string, password: string }
200: { success: true }
400: AUTH_TOKEN_EXPIRED | AUTH_TOKEN_INVALID
```

### POST /api/users/logout
```
Auth: Required
200: { success: true } (clears cookie)
```

### GET /api/users/me
```
Auth: Required
200: { success: true, data: { user (without password) } }
401: UNAUTHORIZED
```

---

## 2. Programs Endpoints

### GET /api/programs
```
Query: ?type=workshop|course|webinar
       &category=<categoryId>
       &level=beginner|intermediate|advanced
       &q=<search>
       &page=1&limit=12
       &sort=newest|popular|price_asc|price_desc
Auth: Public
200: { success: true, data: [Program], meta: { pagination } }
```

### GET /api/programs/:slug
```
Auth: Public
200: { success: true, data: Program (with rounds, instructor, category) }
404: NOT_FOUND
Side Effect: view_count++ (debounced, one per session)
```

### GET /api/programs/:slug/rounds
```
Auth: Public
Query: ?status=open (default shows only open rounds)
200: { success: true, data: [Round (with payment_plans, seats_available)] }
```

---

## 3. Booking Endpoints

### POST /api/bookings
```
Auth: Required (user)
Body: {
  round_id: string,
  payment_plan_id?: string (null = full payment),
  discount_code?: string,
  installment_request_id?: string,
  notes?: string
}
201: { success: true, data: { booking, payment_url } }
400: BOOKING_ROUND_CLOSED | DISCOUNT_INVALID | DISCOUNT_EXPIRED | INSTALLMENT_NOT_APPROVED
409: BOOKING_ROUND_FULL | BOOKING_ALREADY_EXISTS
Server-Side: Recalculate price, create booking + payment records
```

### GET /api/bookings
```
Auth: Required
Query: ?status=upcoming|completed|cancelled&page=1&limit=10
200: { data: [Booking (with round, program, payments)] }
Scope: Own bookings only (unless admin)
```

### GET /api/bookings/:id
```
Auth: Required (owner or admin)
200: { data: Booking (full details with payments, sessions) }
403: FORBIDDEN (not owner)
404: NOT_FOUND
```

### POST /api/bookings/:id/cancel
```
Auth: Required (owner or admin)
Body: { reason: string (min 10 chars) }
200: { success: true, data: { booking, refund_eligible, refund_amount } }
400: BOOKING_ALREADY_CANCELLED
```

---

## 4. Payment Endpoints

### POST /api/payments/:id/process
```
Auth: Required (owner)
Triggers: Paymob payment intent creation
200: { success: true, data: { payment_url, expires_at } }
402: PAYMENT_FAILED
409: PAYMENT_ALREADY_PAID
```

### POST /api/webhooks/paymob
```
Auth: HMAC signature verification (no user token)
Body: Paymob callback payload
200: acknowledged
401: Invalid signature → logged as security event
Idempotent: transaction_id deduplication
```

### GET /api/payments
```
Auth: Required
Query: ?status=pending|paid|overdue&booking_id=<id>&page=1&limit=20
200: { data: [Payment] }
Scope: Own payments only (unless admin)
```

### POST /api/payments/:id/pay-remaining
```
Auth: Required (owner)
Description: Pay all remaining installments at once
200: { success: true, data: { payment_url, total_remaining } }
```

---

## 5. Installment Request Endpoints

### POST /api/installment-requests
```
Auth: Required (user)
Body: {
  round_id: string,
  payment_plan_id: string,
  reason: string (min 20 chars),
  national_id_number?: string,
  national_id_image?: file,
  notes?: string
}
201: { success: true, data: { request } }
409: REQUEST_ALREADY_EXISTS (pending request for same round)
```

### GET /api/installment-requests
```
Auth: Required
200: { data: [InstallmentRequest] }
Scope: Own requests (user) or all (admin)
```

### PUT /api/installment-requests/:id/approve (Admin only)
```
Auth: Required (admin)
Body: { admin_notes?: string, expires_in_days?: number (default: 7) }
200: { success: true }
Side Effects: Email user, set approval_expires_at
```

### PUT /api/installment-requests/:id/reject (Admin only)
```
Auth: Required (admin)
Body: { admin_notes: string (reason) }
200: { success: true }
Side Effects: Email user with reason
```

---

## 6. Consultation Endpoints

### GET /api/instructors/:slug/availability
```
Auth: Public
Query: ?month=2026-03 (optional)
200: { data: { available_dates: [Date], slots_by_date: { [date]: [Slot] } } }
```

### GET /api/instructors/:slug/consultation-types
```
Auth: Public
200: { data: [ConsultationType] }
```

### POST /api/consultation-bookings
```
Auth: Required (user)
Body: {
  slot_id: string,
  consultation_type_id: string,
  notes?: string,
  discount_code?: string
}
201: { success: true, data: { booking, payment_url } }
409: CONSULTATION_SLOT_TAKEN
400: CONSULTATION_SLOT_BLOCKED
```

### POST /api/consultation-bookings/:id/cancel
```
Auth: Required (owner or instructor or admin)
Body: { reason: string, cancelled_by: "user"|"instructor"|"admin" }
200: { success: true, data: { refund_eligible, refund_amount } }
Refund Policy:
  > 24h before: 100% refund
  12-24h: 50% refund
  < 12h: No refund
  Instructor cancels: Always 100% refund
```

---

## 7. Instructor Portal Endpoints

### GET /api/instructor/dashboard
```
Auth: Required (instructor)
200: {
  upcoming_sessions: [Session],
  upcoming_consultations: [ConsultationBooking],
  stats: { total_students, total_consultations, total_revenue }
}
```

### PUT /api/instructor/availability
```
Auth: Required (instructor)
Body: { availability: [{ day_of_week, start_time, end_time, buffer_minutes, is_active }] }
200: { success: true }
Side Effect: Regenerate future slots
```

### POST /api/instructor/blocked-dates
```
Auth: Required (instructor)
Body: { date: string, reason?: string }
201: { success: true }
Side Effect: Cancel affected slots, notify booked users
```

### DELETE /api/instructor/blocked-dates/:id
```
Auth: Required (instructor, own dates only)
200: { success: true }
Side Effect: Regenerate slots for that date
```

---

## 8. Discount Code Endpoints

### POST /api/discount-codes/validate
```
Auth: Required
Body: { code: string, round_id: string }
200: { success: true, data: { discount_type, value, new_total } }
400: DISCOUNT_INVALID | DISCOUNT_EXPIRED | DISCOUNT_MAX_USED | DISCOUNT_NOT_APPLICABLE
```

---

## 9. Waitlist Endpoints

### POST /api/waitlist
```
Auth: Required (user)
Body: { round_id: string }
201: { success: true, data: { position } }
409: WAITLIST_ALREADY_JOINED | BOOKING_ALREADY_EXISTS
```

### DELETE /api/waitlist/:roundId
```
Auth: Required (own entry)
200: { success: true }
```

---

## 10. Notification Endpoints

### GET /api/notifications
```
Auth: Required
Query: ?unread_only=true&page=1&limit=20
200: { data: [Notification], meta: { unread_count } }
```

### PUT /api/notifications/:id/read
```
Auth: Required (own)
200: { success: true }
```

### PUT /api/notifications/read-all
```
Auth: Required
200: { success: true, data: { marked_count } }
```

---

## 11. Search Endpoint

### GET /api/search
```
Auth: Public
Query: ?q=<query>&type=programs|instructors|blog (optional filter)
200: {
  data: {
    programs: [{ title, slug, type, thumbnail }],
    instructors: [{ name, slug, picture }],
    blog: [{ title, slug, thumbnail }]
  }
}
Debounce: Client-side 300ms
Rate Limit: 30 req/min
```

---

## 12. Refund Endpoints

### POST /api/refund-requests
```
Auth: Required (user)
Body: { booking_id: string, reason: string (min 20 chars) }
201: { success: true, data: { request, estimated_refund } }
400: REFUND_NOT_ELIGIBLE
```

### PUT /api/refund-requests/:id/approve (Admin only)
```
Auth: Required (admin)
Body: { refund_amount: number, admin_notes?: string }
200: { success: true }
Side Effects: Trigger Paymob refund, email user, update booking status
```

---

## 13. Health & Utility

### GET /api/health
```
Auth: None
200: { status, checks: { database, paymob, resend, crm, whatsapp }, version }
```

### GET /api/companies
```
Auth: Required (for onboarding autocomplete)
Query: ?search=<query> (min 2 chars)
200: { data: [{ id, name, industry }] }
Rate Limit: 20 req/min
```

---

## 14. Reviews Endpoints

### POST /api/reviews
```
Auth: Required (user with completed booking for the program)
Body: {
  program: string (program ID),
  round: string (round ID),
  booking: string (booking ID),
  rating: number (1-5),
  title?: string (max 100 chars),
  comment: string (min 20, max 2000 chars)
}
201: { success: true, data: { review } }
400: REVIEW_COMMENT_TOO_SHORT | REVIEW_RATING_INVALID
403: REVIEW_NOT_ELIGIBLE (booking not completed)
409: REVIEW_ALREADY_EXISTS (one review per booking)
Side Effects: Update program averageRating + reviewCount
Rate Limit: 5 req/min
```

### GET /api/reviews
```
Auth: Public
Query: ?program=<programId>&sort=newest|highest|lowest|helpful&page=1&limit=10
200: {
  data: [Review],
  meta: {
    pagination,
    averageRating: number,
    totalReviews: number,
    distribution: { 1: number, 2: number, 3: number, 4: number, 5: number }
  }
}
```

### POST /api/reviews/:id/helpful
```
Auth: Required (user, not review owner)
200: { success: true, data: { helpfulCount } }
409: ALREADY_VOTED
```

### DELETE /api/reviews/:id (Admin only)
```
Auth: Required (admin)
Body: { reason: string }
200: { success: true }
Side Effects: Update program averageRating + reviewCount, notify user
```

---

## 15. Certificate Endpoints

### GET /api/bookings/:id/quiz
```
Auth: Required (owner, booking must be completed)
200: {
  data: {
    quiz: { questions: [{ id, question_ar, question_en, options: [string], type: "single"|"multiple" }] },
    attempts_remaining: number,
    passing_score: number
  }
}
403: QUIZ_NOT_ELIGIBLE (booking not completed or payment overdue)
404: QUIZ_NOT_FOUND (program has no quiz)
```

### POST /api/bookings/:id/quiz/submit
```
Auth: Required (owner)
Body: { answers: [{ question_id: string, selected: number[] }] }
200: {
  success: true,
  data: {
    score: number,
    passed: boolean,
    certificate_url?: string (if passed)
  }
}
400: QUIZ_NO_ATTEMPTS_LEFT
```

### GET /api/certificates/:code/verify
```
Auth: Public
200: {
  data: {
    valid: true,
    student_name: string,
    program_name: string,
    completion_date: string,
    certificate_id: string
  }
}
404: CERTIFICATE_NOT_FOUND
```

---

## 16. Payment Link Endpoints

### GET /api/pay/:code
```
Auth: Public (redirects to login if needed)
200: {
  data: {
    payment_link: PaymentLink,
    round: Round (with program),
    payment_plan?: PaymentPlan,
    discount?: { code, type, value },
    final_price: number
  }
}
404: PAYMENT_LINK_NOT_FOUND
410: PAYMENT_LINK_EXPIRED
409: PAYMENT_LINK_MAX_USES
```

### POST /api/pay/:code/checkout
```
Auth: Required (user)
Body: { notes?: string }
201: { success: true, data: { booking, payment_url } }
Side Effects: Create booking + payment records, increment payment link usage
```

### Admin: POST /api/payment-links (Admin only)
```
Auth: Required (admin)
Body: {
  code: string (slug),
  title: string,
  round: string (round ID),
  paymentPlan?: string,
  discountCode?: string,
  expiresAt?: string (ISO date),
  maxUses?: number
}
201: { success: true, data: { payment_link, url } }
409: PAYMENT_LINK_CODE_EXISTS
```

---

## 17. B2B Manager Endpoints

### GET /api/b2b/dashboard
```
Auth: Required (b2b_manager)
200: {
  data: {
    company: Company,
    team_members: [{ user, bookings_count, total_spent }],
    stats: { total_bookings, total_spent, active_programs },
    recent_bookings: [Booking]
  }
}
```

### GET /api/b2b/team
```
Auth: Required (b2b_manager)
Query: ?page=1&limit=20
200: {
  data: [{ user, profile, bookings_count, last_booking_date }],
  meta: { pagination }
}
Scope: Only users in same company
```

### GET /api/b2b/bookings
```
Auth: Required (b2b_manager)
Query: ?status=all|upcoming|completed&user_id=<id>&page=1&limit=20
200: { data: [Booking (with user, round, program)], meta: { pagination } }
Scope: Only bookings from team members in same company
```

### GET /api/b2b/invoices
```
Auth: Required (b2b_manager)
Query: ?period=2026-03&page=1&limit=20
200: {
  data: [{
    month: string,
    total_amount: number,
    bookings_count: number,
    payments: [Payment]
  }],
  meta: { pagination }
}
```

---

## 18. Onboarding Endpoints

### GET /api/onboarding/status
```
Auth: Required
200: {
  data: {
    completed: boolean,
    current_step: 1|2|3,
    profile: UserProfile (partial)
  }
}
```

### PUT /api/onboarding/step/:stepNumber
```
Auth: Required
Body (step 1): { title, jobTitle, workField, companyName?, companySize?, companyType? }
Body (step 2): { country, city, yearOfBirth?, education?, yearsOfExperience? }
Body (step 3): { linkedinUrl?, learningGoals?, interests?: string[], howDidYouHear? }
200: { success: true, data: { next_step: number|null, completed: boolean } }
400: VALIDATION_ERROR
Side Effects:
  Step 1: Create/update UserProfile + Company
  Step 3: Set onboarding_completed = true, sync to CRM
```

---

## 19. Instructor Profile Endpoint

### GET /api/instructors
```
Auth: Public
Query: ?page=1&limit=12
200: { data: [Instructor (with programs_count)], meta: { pagination } }
```

### GET /api/instructors/:slug
```
Auth: Public
200: {
  data: Instructor (with programs, consultation_types, stats)
}
404: NOT_FOUND
```

---

## 20. Blog Endpoints

### GET /api/blog
```
Auth: Public
Query: ?category=<slug>&tag=<slug>&q=<search>&page=1&limit=12
200: { data: [BlogPost], meta: { pagination } }
```

### GET /api/blog/:slug
```
Auth: Public
200: { data: BlogPost (with related_posts) }
404: NOT_FOUND
Side Effect: view_count++ (debounced)
```

---

## 21. Cron Job Auth

All cron endpoints require `CRON_SECRET` verification:

```
Header: Authorization: Bearer <CRON_SECRET>
401 if missing/invalid

Endpoints (listed in docs/features/cron-jobs.md):
├── GET /api/cron/booking-timeout
├── GET /api/cron/payment-reminders
├── GET /api/cron/overdue-checker
├── GET /api/cron/consultation-reminders
├── GET /api/cron/slot-generation
├── GET /api/cron/waitlist-cascade
├── GET /api/cron/session-reminders
├── GET /api/cron/reconciliation
├── GET /api/cron/review-requests
├── GET /api/cron/crm-sync
├── GET /api/cron/installment-expiry
├── GET /api/cron/cleanup
├── GET /api/cron/inactive-users
└── GET /api/cron/fawry-check

Response (all): 200 { success: true, data: { processed: number, errors: number, duration_ms: number } }
```

---

## Appendix: Field Name Mapping

API field names (snake_case) → Payload collection field names (camelCase):

| API Field | Payload Field | Collection |
|---|---|---|
| `round_id` | `round` | Bookings |
| `payment_plan_id` | `paymentPlan` | Bookings |
| `installment_request_id` | `installmentRequest` | Bookings |
| `discount_code` | `discountCode` | Bookings |
| `booking_code` | `bookingCode` | Bookings |
| `total_amount` | `totalAmount` | Bookings |
| `final_amount` | `finalAmount` | Bookings |
| `booking_source` | `bookingSource` | Bookings |
| `slot_id` | `slot` | ConsultationBookings |
| `consultation_type_id` | `consultationType` | ConsultationBookings |
| `payment_status` | `paymentStatus` | ConsultationBookings |
| `due_date` | `dueDate` | Payments |
| `paid_date` | `paidDate` | Payments |
| `payment_method` | `paymentMethod` | Payments |
| `transaction_id` | `transactionId` | Payments |
| `national_id_number` | `nationalIdNumber` | InstallmentRequests |
| `national_id_image` | `nationalIdImage` | InstallmentRequests |
| `admin_notes` | `adminNotes` | InstallmentRequests |
| `day_of_week` | `dayOfWeek` | ConsultationAvailability |
| `start_time` | `startTime` | ConsultationAvailability |
| `end_time` | `endTime` | ConsultationAvailability |
| `buffer_minutes` | `bufferMinutes` | ConsultationAvailability |

> **Convention:** API requests/responses use `snake_case`. Payload CMS internally uses `camelCase`. The API layer transforms between formats.

