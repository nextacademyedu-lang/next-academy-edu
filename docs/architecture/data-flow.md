# Next Academy — Data Flow & Sources

## 1. الـ Data Sources (منين الداتا؟)

### A) Admin Input (Payload CMS)

```text
Admin Panel → يدخل يدوياً:
├── Programs (workshops/courses)
├── Rounds (dates, prices, capacity limits)
├── Instructors (bio, LinkedIn)
├── Consultation Types
├── Availability
├── Discount Codes (بدعم تحديد شروط مثل ربطه بشركة معينة Company-specific)
└── Companies (إدارة ومراجعة بيانات الشركات المضافة من المستخدمين)
```

### B) Instructor Input (Instructor Portal)

```
Instructor Portal /instructor:
├── Consultation Types (مدة، سعر)
├── Availability (جدول أسبوعي)
└── Blocked Dates (إجازات)
```

### C) User Generated

```text
Users:
├── User Profiles (onboarding)
├── Companies (إنشاء جديد أثناء الأونبوردينج إذا لم تكن موجودة)
├── Bookings (اختيار round)
├── Consultation Bookings
├── Testimonials (بعد البرنامج)
└── Installment Requests
```

### D) Automated / Computed

```text
System Generated:
├── Consultation Slots (من availability)
├── Payments (Paymob webhook)
├── View Counts (analytics)
├── Ratings (average من testimonials)
├── Booking Status (payment complete)
├── Company Metrics (تجميع إجمالي مبيعات وcontacts لكل شركة)
└── Waitlists (نقل أوتوماتيكي من الانتظار للحجز عند وجود مكان شاغر)
```

## 2. Data Flow Diagram

```
Admin ──────┐
            │ Payload CMS (Neon PostgreSQL)
Instructor ─┼───────────── API Routes (Next.js)
User ───────┤
            │
            └───────────── Frontend (User/Instructor Portals)
                         ↓
                    Twenty CRM (Sync)
```

## 3. الـ Flow التفصيلي

### B2B Company Onboarding Flow:

```text
1. User → /onboarding/step-1 → Types "Pay" in Company input.
2. System → API Call `/api/companies?search=Pay` → Returns ["PayPal", "Paymob"].
3. User selects "PayPal" → User is linked to existing Company ID.
   - OR User types "NewCorp" → API creates new Company "NewCorp", links User.
4. Payload CMS → Company Document aggregates:
   - Contacts: [User1, User2]
   - Total Sales: $500 (مبيعات User1 + User2 محتفظ بها كلقطة تاريخية حال تغيير موظف لشركته Employee Churn)
   - Categories: [Marketing, Sales] (بناءً على الكورسات اللي حجزوها)
```

### Advanced B2B Scenarios (New):

```text
1. HR Managers (Role: b2b_manager):
   - Can access /b2b-dashboard to view only their company's employees.
   - Invite links generate User profiles automatically bound to their Company ID.

2. Waitlists:
   - If round capacity == 0, `Book` button becomes `Join Waitlist`.
   - Entry appended to `Waitlist` collection.
   - If user cancels, top waitlisted user gets email with 24h booking link.

3. Exclusive Promocodes:
   - `Vodafone30` discount only works if `user.companyId == "Vodafone"`.
```

### Guest Checkout Authentication Flow:

```text
1. Guest User → /programs/:slug → Clicks "Book Round".
2. System checks Auth State:
   - If Logged In: Proceed to /book/:roundId.
   - If Guest: Redirect to `/login?redirect=/book/:roundId`.
3. Guest User → Logs in or Signs up at `/login`.
4. If NEW user → Enters Onboarding:
   → The `redirect` param is PERSISTED through all 3 onboarding steps.
   → /onboarding/step-1?redirect=/book/:roundId
   → /onboarding/step-2?redirect=/book/:roundId
   → /onboarding/step-3?redirect=/book/:roundId
   → /onboarding/complete → "Go to Your Booking" button (NOT "Go to Dashboard").
5. System redirects User directly to `/book/:roundId` (User does not lose their selection).
```

### Installment Access Control (Payment Gate):

```text
Scenario: User pays via installments (e.g., 1000 of 3000 upfront).

Access Rules:
├── If installment is PAID and ON-TIME:
│   ├── ✅ Can join live sessions.
│   ├── ✅ Can watch recordings.
│   └── ✅ Can access all course materials.
├── If installment is OVERDUE (missed due date):
│   ├── ❌ BLOCKED from joining live sessions.
│   ├── ❌ BLOCKED from watching recordings.
│   ├── 📢 Dashboard shows: "ادفع القسط المتأخر عشان ترجع تدخل الكورس".
│   └── 🔔 Email + WhatsApp reminder sent automatically.
├── Admin Override:
│   └── Admin can manually UNLOCK a user's access (e.g., user paid cash outside the system).

Certificate:
└── ❌ NO certificate until ALL installments are fully paid.
```

### Waitlist Cascade Logic:

```text
1. User cancels booking → Spot opens in the Round.
2. System picks User #1 from Waitlist (ordered by join date).
3. Email + WhatsApp sent: "مكان فضي ليك! احجز خلال 24 ساعة."
4. Cron Job runs every hour to check expiry:
   - If 24 hours pass and User #1 did NOT book:
     → User #1's waitlist entry marked as "expired".
     → System automatically picks User #2 and sends the same notification.
     → Repeat cascade until someone books or waitlist is empty.
```

### Timezone Convention (UTC Storage):

```text
RULE: ALL dates/times stored in PostgreSQL as UTC.
├── Sessions, Consultation Slots, Installment Due Dates → stored as UTC.
├── Frontend renders using user's browser timezone (Intl.DateTimeFormat).
├── Instructors see their own timezone in the Instructor Portal.
└── Admin panel always shows Africa/Cairo (EET) timezone.
```

### Programs Data Flow:

```text
1. Admin → /admin/programs → Create Program
2. Admin → /admin/rounds → Add Rounds (dates/prices)
3. Users → /programs → Browse + View (view_count++)
4. Users → /book/:roundId → Create Booking (System sums value to User's Company profile)
5. Paymob → Payment Complete → Booking Confirmed
6. System → Email + Twenty CRM Deal Update (Sync Company/Contact)
```

### Protected Video Recording Flow (Content Security):

```text
1. Session ends → Admin downloads recording from Google Meet.
2. Admin uploads video to Bunny.net Stream (or Cloudflare Stream).
3. Admin copies Video Stream ID → Pastes into Payload CMS /admin/sessions/:id.
4. Admin toggles "Complete Session" → Recording becomes visible to enrolled students.
5. Student → /dashboard/bookings/:id → Clicks "▶ Watch Recording".
6. System checks:
   - Is user enrolled in this Round? ✅
   - Is payment confirmed? ✅
7. System generates Signed URL (expires in 2 hours).
8. Video renders in Embedded Player with dynamic watermark:
   → "[User Full Name] | [user@email.com] | [2026-03-05]"
9. No download button. No direct file URL exposed. Right-click disabled on player.
10. If user shares link → Expired. If user screen-records → Watermark traces back.
```

### Consultations Data Flow:

```
1. Instructor → /instructor/availability → Set Schedule
2. System Cron → Generate Slots (30 days ahead)
3. User → /instructors/:slug → Browse Available Slots
4. User → /consultation/book/:instructor → Select Slot
5. Paymob → Payment → Slot Status = 'booked'
6. System → Email + Notification to Instructor
7. 24h before → Reminder Email
```

### Installment Requests Flow:

```
1. User → Booking Page → [طلب تقسيط]
2. Form → installment_requests (status: pending)
3. Admin Notification → /admin/installment-requests
4. Admin → Approve → Email to User
5. User → Complete Booking (installment unlocked)
```

## 4. Initial Seed Data (للـ Launch)

```
Users:
├── 2 Admins
├── 3 Instructors (صلاح، كريم، أمل)
└── 10 Test Users

Instructors:
├── صلاح خليل (Sales Expert)
├── كريم تركي (Marketing)
└── أمل السيد (Leadership)

Programs:
├── ورشة المبيعات المتقدمة
├── كورس التسويق الرقمي
├── ويبينار القيادة الفعالة

Rounds:
├── 3 Rounds لكل program (مختلف dates)

Consultation Types:
├── جلسة 1:1 (60 دقيقة - 500 جنيه)
├── Group Session (90 دقيقة - 200 جنيه)

Availability:
├── صلاح: السبت + الأحد 10-5
├── كريم: الثلاثاء + الأربعاء

Slots Generated: 50 slot (أول شهر)
```

## 5. Real Data Import Plan

```
Phase 1 (Week 1):
├── Export من Google Sheets (Programs, Instructors)
├── CSV Import لـ Payload
└── Manual instructor accounts

Phase 2 (Week 2):
├── Historical bookings → CSV import
├── Leads من WhatsApp → /admin/leads
└── Testimonials → Manual entry

Phase 3 (Post Launch):
├── Paymob transaction history
└── Google Analytics import
```

## 6. Database Backup Strategy

```
Daily: Neon Automated
Weekly: Payload Export → Google Drive
Monthly: Full Schema Dump
```

**Data Flow COMPLETE ✅**
