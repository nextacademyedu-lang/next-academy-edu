# Next Academy — Payment Scenarios & Edge Cases

> Last Updated: 2026-03-13 04:00
> Payment Gateway: Paymob (Egypt)
> Priority: 🔴 CRITICAL

---

## 1. Normal Payment Flows

### 1.1 Full Payment (Card via Paymob)

```text
Happy Path:
1. User → /book/:roundId → selects "Full Payment"
2. Server creates Booking (status: pending) + Payment (status: pending)
3. Server calls Paymob → creates payment intent
4. User redirected to Paymob checkout page
5. User enters card → 3D Secure → success
6. Paymob redirects to /checkout/success?id=<bookingId>
7. Webhook POST /api/webhooks/paymob → verifies HMAC
8. Server updates: Payment (status: paid) → Booking (status: confirmed)
9. Email: booking confirmation + WhatsApp group link
10. CRM: create deal (stage: paid)

Time Limit: Payment intent expires in 30 minutes
```

### 1.2 Full Payment (Wallet — Fawry/Aman via EasyKash)

```text
Happy Path:
1. User selects "Fawry" or "Aman"
2. Server creates payment reference number
3. User shown: "ادفع في أي فرع فوري بالرقم المرجعي: 123456789"
4. User goes to physical store, pays cash
5. EasyKash webhook → confirms payment (may take 1-48 hours)
6. Server processes same as card payment

Key Difference: Payment is ASYNCHRONOUS — user doesn't get instant confirmation
├── Booking status stays "pending_payment" until webhook
├── Email: "في انتظار تأكيد الدفع عن طريق فوري"
├── Seat is RESERVED for 48 hours (not released to others)
└── If 48h pass with no payment → booking auto-cancelled → seat released
```

### 1.3 Installment Payment

```text
Happy Path:
1. User → /book/:roundId → selects installment plan (e.g., "3 أقساط")
2. System checks: does user have approved installment request?
   ├── Yes → proceed to checkout for 1st installment
   └── No → redirect to installment request form
3. Server creates: Booking + 3 Payment records (installment 1/2/3)
4. User pays 1st installment via Paymob
5. Webhook confirms → Booking status: "confirmed"
6. After 30 days → system sends reminder for 2nd installment
7. User pays 2nd installment
8. After 60 days → system sends reminder for 3rd installment
9. User pays 3rd installment → Booking status: "fully_paid"
10. Certificate eligibility unlocked
```

---

## 2. Card Payment Failure Scenarios

### 2.1 Card Declined — Insufficient Funds

```text
Flow:
1. User submits card → Paymob returns "declined: insufficient_funds"
2. Paymob redirects to /checkout/failed?reason=insufficient_funds
3. UI shows: "الكارت مفيهوش رصيد كافي. جرب كارت تاني أو طريقة دفع مختلفة"
4. Buttons: [جرب تاني] [طريقة دفع تانية] [رجوع]
5. Booking stays "pending" — seat still reserved for 30 minutes
6. After 3 failed attempts → show "محتاج مساعدة؟ تواصل معانا" + WhatsApp link
7. After 30 minutes → booking auto-cancelled → seat released

Actions:
├── Log: payment_failed event (user_id, round_id, reason, attempt_count)
├── DB: Payment record updated (status: failed, gateway_response: {reason})
└── NO email sent for declined card (avoid spam)
```

### 2.2 Card Expired

```text
Flow:
1. Paymob returns "declined: expired_card"
2. UI: "الكارت منتهي الصلاحية. استخدم كارت تاني"
3. Same retry flow as 2.1
```

### 2.3 3D Secure Failure

```text
Flow:
1. User enters card → redirected to bank's 3D Secure page
2. User enters wrong OTP or cancels
3. Paymob returns "declined: 3ds_failed"
4. UI: "لم يتم التحقق من بطاقتك. حاول مرة تانية أو استخدم كارت تاني"
5. Allow retry up to 3 times

Edge Case: User closes browser during 3D Secure
├── Payment abandoned
├── Paymob may still send webhook (declined)
├── Booking status stays "pending" → 30 min timeout → cancel
└── If Paymob charges then reverses → handle via refund webhook
```

### 2.4 Bank Timeout / Network Error

```text
Flow:
1. Paymob sends request to bank → timeout (30 seconds)
2. Payment status: UNKNOWN (not confirmed, not declined)
3. *** DANGEROUS STATE — money may or may not have been charged ***

Handling:
├── UI: "حاجة حصلت غلط. لو اتخصم مبلغ هيترجعلك تلقائياً خلال 7 أيام عمل"
├── DB: Payment record (status: processing)
├── Cron: After 5 minutes → poll Paymob API for transaction status
│   ├── Confirmed → process as success
│   ├── Declined → update to failed
│   └── Still unknown → retry after 15 min, then 1 hour, then manual
├── Alert: If unknown > 1 hour → Slack/email alert to admin
├── DO NOT allow user to retry immediately (double-charge risk)
└── Show: "جاري التأكد من حالة الدفع. هنأكدلك خلال 30 دقيقة بالإيميل"
```

### 2.5 Partial Authorization

```text
Flow:
1. Bank authorizes less than requested amount (rare but possible)
2. Paymob returns success with amount < expected

Handling:
├── REJECT the payment → void/refund the partial amount
├── Log: "Partial authorization detected" (security flag)
├── Treat as failed payment
├── UI: "حصلت مشكلة في الدفع. جرب تاني أو تواصل معانا"
└── Never accept partial payment as full
```

---

## 3. Webhook Scenarios

### 3.1 Webhook Never Arrives

```text
Scenario: Paymob processed payment but webhook failed (network issue, server down)

Handling:
├── Cron Job: Every 5 minutes → check for bookings with:
│   ├── status: "pending"
│   ├── created_at > 30 minutes ago
│   └── No matching payment (status: paid)
├── For each → poll Paymob API: GET /transactions/:id
│   ├── If paid → process webhook manually
│   └── If not paid → cancel booking after timeout
├── Fallback: User clicks "Check Payment Status" on /checkout/pending page
└── Daily Reconciliation: Compare all DB payments with Paymob settlement report
```

### 3.2 Duplicate Webhook

```text
Scenario: Paymob sends same webhook twice (retry on timeout)

Handling:
├── BEFORE processing → check if transaction_id exists in payments
├── If exists with status "paid" → return 200 (acknowledge but skip)
├── If exists with status "pending" → process normally
├── Use database transaction + unique constraint on transaction_id
└── Log: "Duplicate webhook received" (info level, not error)
```

### 3.3 Webhook with Wrong Amount

```text
Scenario: Webhook reports amount different from expected

Handling:
├── Compare webhook amount with DB booking.total_amount (or installment amount)
├── If amounts DON'T match:
│   ├── DO NOT confirm the booking
│   ├── Log: "Amount mismatch" (CRITICAL alert)
│   ├── Mark payment as "review_required"
│   ├── Admin notification: "Payment amount mismatch on booking BK-XXX"
│   └── Manual resolution required
├── Tolerance: Allow ±0.01 EGP (rounding differences)
└── Possible causes: currency conversion, Paymob fee deduction, tampering
```

### 3.4 Webhook During Server Downtime

```text
Scenario: Server was down when Paymob sent webhook

Handling:
├── Paymob retries webhooks: immediately, 15min, 1hr, 4hr, 24hr
├── If all retries fail → Paymob marks as "undelivered"
├── Our cron job (check pending bookings) catches these
├── Manual recovery: Admin can trigger "re-process webhook" from Paymob dashboard
└── Monitoring: Alert if webhook endpoint returns non-200 for > 30 min
```

---

## 4. Refund Scenarios

### 4.1 User Requests Refund (Before Round Starts)

```text
Refund Policy:
├── > 7 days before round start → 100% refund
├── 3-7 days before → 75% refund
├── 1-3 days before → 50% refund
├── < 24 hours before → No refund
└── After round started → No refund (case-by-case by admin)

Flow:
1. User → /dashboard/bookings/:id → "طلب استرداد"
2. User fills reason (required, min 20 chars)
3. System creates refund request (status: pending)
4. Admin notification (email + in-app)
5. Admin reviews → /admin/refund-requests
6. Approve → System calls Paymob Refund API
   ├── Full refund → booking.status = "refunded"
   ├── Partial refund → booking.status = "partially_refunded"
   ├── Refund to SAME payment method (Paymob requirement)
   └── Processing time: 7-14 business days
7. User email: "تم الموافقة على طلب الاسترداد. المبلغ [X] ج.م هيوصلك خلال 7-14 يوم عمل"
8. Reject → User email: "تم رفض طلب الاسترداد بسبب: [reason]"
9. Update CRM deal stage
```

### 4.2 Refund with Installments

```text
Scenario: User paid 2 of 3 installments, requests refund

Handling:
├── Refund 1st installment: Full amount via Paymob
├── Refund 2nd installment: Full amount via Paymob
├── 3rd installment: Cancel (was never paid)
├── Total refund = amount_paid × refund_percentage (based on policy)
│   Example: Paid 2000 of 3000, 7+ days before → Refund 2000 × 100% = 2000
├── Remaining installments cancelled (status: cancelled)
├── Booking status: refunded
└── Access revoked immediately
```

### 4.3 Admin-Initiated Refund (Round Cancelled)

```text
Flow:
1. Admin cancels round → system identifies all confirmed bookings
2. For each booking:
   ├── Calculate total paid amount
   ├── Auto-create refund request (status: approved)
   ├── Trigger Paymob refund for each payment
   ├── Email user: "للأسف الورشة اتلغت. هيتم استرداد المبلغ كاملاً"
   ├── Offer: "حجز جولة تانية بخصم 10%"
   └── Move pending installments to cancelled
3. Update Round status: cancelled
4. Waitlist users notified: "الورشة اتلغت"
5. CRM: Update all related deals
```

### 4.4 Chargeback (User Disputes with Bank)

```text
Flow:
1. User disputes charge with their bank
2. Bank reverses the payment → notifies Paymob
3. Paymob sends chargeback webhook
4. System:
   ├── Mark payment: status = "chargeback"
   ├── Mark booking: status = "suspended"
   ├── Revoke access immediately
   ├── Admin alert (CRITICAL)
   ├── Flag user account for review
   └── Log: security incident
5. Admin investigates:
   ├── Legitimate dispute → update records, no further action
   ├── Fraud → ban user account + report to payment processor
   └── Provide evidence to Paymob for dispute response
```

---

## 5. Discount Code Edge Cases

### 5.1 Code Expires During Checkout

```text
Flow:
1. User applies code → discount shown on checkout page
2. User spends 20 minutes filling details
3. User clicks "Pay" → code expired 5 minutes ago

Handling:
├── Server-side: RE-VALIDATE code at payment time (not just at apply time)
├── If expired:
│   ├── Return error: "كود الخصم انتهت صلاحيته"
│   ├── Show updated price WITHOUT discount
│   ├── User must confirm new price before proceeding
│   └── DO NOT auto-proceed with full price
└── Frontend: Show countdown timer if code has near expiry (< 1 hour)
```

### 5.2 Code Max Uses Reached During Concurrent Checkout

```text
Flow:
1. Code "SALE50" has max_uses = 100, current_uses = 99
2. User A and User B both apply code (current_uses shows 99)
3. Both proceed to checkout → both attempt to use the code

Handling:
├── Use database atomic operation:
│   UPDATE discount_codes 
│   SET current_uses = current_uses + 1 
│   WHERE code = 'SALE50' AND current_uses < max_uses
│   RETURNING current_uses
├── If affected rows = 0 → code exhausted → reject
├── Only increment usage AFTER payment is confirmed (not at apply time)
├── If payment fails → decrement usage count
└── Never check count in application code → always use DB constraint
```

### 5.3 Discount Stacking Rules

```text
Rules:
├── Early Bird Price + Discount Code = ❌ NOT ALLOWED
│   └── If early bird active, discount codes are blocked for that round
├── Company-specific Code + General Code = ❌ only ONE code per booking
├── Referral Discount + Discount Code = ❌ only ONE discount per booking
├── Payment Link discount + manual code = Payment link discount takes priority
├── Multiple codes = ❌ Only 1 code per booking
└── UI: Code input disabled after one is applied; "إزالة" button to try another

Exception:
├── Company bulk discount (volume pricing) stacks with nothing
└── Admin override: can apply manual discount from /admin/bookings
```

### 5.4 Discount Makes Total = 0 (Free Booking)

```text
Flow:
1. Discount = 100% → final_amount = 0
2. Skip payment step entirely
3. Auto-confirm booking (status: confirmed)
4. Create payment record (amount: 0, status: paid, method: voucher)
5. Normal confirmation email (without payment details)
6. CRM deal created (amount: 0)
```

### 5.5 Discount on Installment Plan

```text
Calculation:
├── Total after discount = round.price - discount
├── Installments recalculated based on NEW total
│   Example:
│   ├── Price: 3000 EGP
│   ├── Discount: 20% → New total: 2400 EGP
│   ├── Plan: 3 installments (50%, 25%, 25%)
│   ├── Inst 1: 1200 EGP (not 1500)
│   ├── Inst 2: 600 EGP (not 750)
│   └── Inst 3: 600 EGP (not 750)
└── Discount applied to TOTAL, not individual installments
```

---

## 6. Booking Race Conditions

### 6.1 Last Seat — Two Users Simultaneously

```text
Scenario: Round has 1 seat left. User A and User B both in checkout.

Handling:
├── Seat Reservation: When user clicks "Book" → reserve seat for 15 minutes
│   ├── Atomic operation: 
│   │   UPDATE rounds SET current_enrollments = current_enrollments + 1
│   │   WHERE id = :roundId AND current_enrollments < max_capacity
│   │   RETURNING current_enrollments
│   ├── If affected rows = 0 → round is full → redirect with error
│   └── Booking created with status: "reserved" (not pending_payment)
├── First to book gets the seat
├── Second user sees: "للأسف الأماكن كلها خلصت" + Waitlist option
├── If first user doesn't pay within 15 min → reservation released
│   └── Next user in waitlist gets notification
└── NEVER allow overbooking (unless admin explicitly enables it)
```

### 6.2 Double-Click Prevention

```text
Frontend:
├── Disable button on first click
├── Show loading spinner
├── Debounce: ignore clicks within 2 seconds
└── React: useTransition for server actions

Backend:
├── Idempotency key in request header
├── Check: does booking with same (user_id + round_id) + status "reserved/pending" exist?
│   ├── Yes → return existing booking (don't create new)
│   └── No → create new booking
└── Database: UNIQUE constraint on (user_id, round_id) WHERE status NOT IN ('cancelled', 'refunded')
```

### 6.3 User Already Booked Same Round

```text
Scenario: User tries to book a round they already have active booking for

Handling:
├── Check BEFORE creating booking
├── If active booking exists → redirect to existing booking page
├── Message: "أنت محجوز بالفعل في الجولة دي"
├── Button: [عرض حجزي] [تصفح برامج تانية]
└── Cancelled/refunded bookings → still allow re-booking
```

---

## 7. Manual Payment Scenarios

### 7.1 Cash Payment

```text
Flow:
1. Admin receives cash from user (in person or via company)
2. Admin → /admin/bookings → find booking (or create new)
3. Admin clicks "Mark as Paid" → selects "Cash"
4. System:
   ├── Creates payment (method: cash, status: paid, notes: "Paid in cash to [admin name]")
   ├── Updates booking (status: confirmed)
   ├── Sends confirmation email to user
   └── Logs: "Manual payment marked by admin [name]" (audit trail)
5. Receipt: Admin can download/print receipt
```

### 7.2 Bank Transfer

```text
Flow:
1. User selects "تحويل بنكي" during checkout
2. System shows: bank name, account number, IBAN, amount, reference code
3. User transfers money and takes screenshot
4. User uploads transfer receipt in /dashboard/bookings/:id
5. Admin reviews receipt in /admin/bookings
6. Admin verifies amount matches → "Mark as Paid"
7. Same as cash flow from step 4

Edge Cases:
├── Wrong amount transferred → Admin contacts user, marks partial + creates remaining payment
├── Transfer to wrong account → Admin helps user, extends reservation
├── No receipt uploaded for 48h → reminder email
└── No payment for 5 days → booking auto-cancelled
```

### 7.3 Corporate Invoice

```text
Flow:
1. B2B Manager books for team → selects "Corporate Invoice"
2. System generates invoice:
   ├── Company name + tax ID (from company profile)
   ├── Amount + VAT (14% Egyptian tax)
   ├── Payment terms: Net 30
   ├── Reference: INV-2026-000123
   └── PDF download available
3. Invoice sent to company email
4. Company processes payment via bank transfer
5. Admin marks invoice as paid
6. All associated bookings confirmed

VAT Calculation:
├── Base price: 3000 EGP
├── VAT (14%): 420 EGP
├── Total: 3420 EGP
└── VAT applied to final amount AFTER discounts
```

---

## 8. Installment-Specific Edge Cases

### 8.1 User Misses Installment Due Date

```text
Timeline:
├── Day -3: Reminder email + WhatsApp: "القسط القادم بـ [X] ج.م مستحق يوم [Date]"
├── Day 0 (Due Date): No action yet
├── Day +1: Email: "القسط متأخر! ادفع دلوقتي عشان حجزك ميتعلقش"
├── Day +3: WhatsApp: "⚠️ آخر تذكير: القسط اتأخر 3 أيام"
├── Day +7: Access BLOCKED
│   ├── User cannot join live sessions
│   ├── User cannot access recordings
│   ├── Dashboard shows: "ادفع القسط المتأخر عشان ترجع تدخل الكورس"
│   ├── "Pay Now" button prominently displayed
│   └── In-app notification: "تم تعليق وصولك للمحتوى بسبب تأخر القسط"
├── Day +14: Admin notification: "User [X] overdue by 14 days"
├── Day +30: Booking auto-cancelled
│   ├── Email: "تم إلغاء حجزك بسبب عدم السداد"
│   ├── Seat released
│   ├── Previous payments → NO automatic refund (policy)
│   ├── User can contact support for manual resolution
│   └── CRM deal → stage: "lost" + reason: "overdue_cancellation"
└── Admin Override: Admin can manually restore access at any time
```

### 8.2 Early Payoff (Pay All Remaining Installments)

```text
Flow:
1. User → /dashboard/payments → "ادفع كل الأقساط المتبقية"
2. System calculates remaining amount
3. Single payment for full remaining balance
4. All remaining installment records → status: "paid"
5. Certificate eligibility immediately unlocked
6. Email: "تم سداد كل الأقساط! شكراً"
```

### 8.3 Installment Plan Modified After Booking

```text
Rule: NEVER modify active installment plans

Handling:
├── Admin edits payment plan → changes apply to NEW bookings only
├── Existing bookings keep their original plan
├── If admin needs to change individual booking:
│   ├── Manual adjustment via /admin/bookings/:id
│   ├── Edit individual installment amounts/dates
│   ├── Audit log: "Installment modified by admin [name]: [old] → [new]"
│   └── User notification: "تم تعديل جدول أقساطك. اطلع على التفاصيل"
└── History preserved for financial reporting
```

### 8.4 Installment Approval Expires

```text
Flow:
1. Admin approves installment request (approval_expires_at = +7 days)
2. User doesn't complete checkout within 7 days
3. Day 5: Reminder email: "موافقة التقسيط بتنتهي بعد يومين!"
4. Day 7: Approval expires
   ├── installment_request.status = "expired"
   ├── Email: "انتهت صلاحية موافقة التقسيط. قدم طلب جديد"
   └── User CAN reapply (new request)
5. Round is not affected (seat not reserved during approval period)
```

---

## 9. Currency & Pricing Edge Cases

### 9.1 Price Display

```text
Rules:
├── Default currency: EGP (Egyptian Pound)
├── Display format: "3,000 ج.م" (Arabic) / "EGP 3,000" (English)
├── Thousands separator: comma
├── Decimal: 2 places only if not .00 (show 3,000 not 3,000.00)
├── USD programs: "$300" / "300 دولار"
└── Always show currency symbol — never assume
```

### 9.2 Price Change After Booking

```text
Rule: Price at time of booking is LOCKED

Handling:
├── booking.total_amount = price at time of booking
├── If round price increases → existing bookings unaffected
├── If round price decreases → existing bookings unaffected
│   └── (No automatic refund of difference)
├── Admin can manually adjust individual booking amounts
└── Price history preserved in audit log
```

---

## 10. Payment Gateway Downtime

### 10.1 Paymob API Unavailable

```text
Detection:
├── API returns 5xx status code
├── API request times out (> 10 seconds)
└── Health check endpoint fails

Handling:
├── UI: "الدفع الإلكتروني غير متاح مؤقتاً"
├── Show alternatives:
│   ├── "ادفع عن طريق فوري: [reference number]"
│   ├── "تحويل بنكي: [bank details]"
│   └── "تواصل معانا: [WhatsApp link]"
├── Booking stays "pending" — seat reserved for 2 hours (extended)
├── Retry check: every 5 min poll Paymob health
├── Admin alert: Slack/email when Paymob is down
└── When restored: email users with pending bookings → "الدفع متاح دلوقتي!"
```

---

## 11. Payment Reconciliation

### 11.1 Daily Reconciliation Cron

```text
Every day at 2:00 AM (Cairo time):
1. Fetch all Paymob transactions for last 24 hours
2. Compare with DB payment records
3. Report:
   ├── Matched: Paymob + DB agree (normal)
   ├── DB only: payment in DB but not in Paymob (suspicious)
   ├── Paymob only: payment in Paymob but not in DB (missed webhook)
   └── Amount mismatch: same transaction, different amounts (critical)
4. Auto-fix: Paymob-only → create missing payment records
5. Alert: DB-only or amount mismatch → admin notification
6. Monthly: Generate full reconciliation report for accounting
```
