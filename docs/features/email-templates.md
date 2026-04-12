# Next Academy — Email & WhatsApp Templates

> Last Updated: 2026-03-13 14:17
> Email Provider: Resend
> WhatsApp Provider: Evolution API

---

## 1. Email Templates Master List

### 1.1 Transactional Emails (لا يمكن إلغاء الاشتراك فيها)

| # | Template ID | Trigger | Subject (AR) | Subject (EN) |
|---|---|---|---|---|
| 1 | `welcome` | User registration | مرحباً بك في Next Academy! | Welcome to Next Academy! |
| 2 | `email-verification` | Registration / email change | أكّد بريدك الإلكتروني | Verify your email |
| 3 | `password-reset` | Forgot password | إعادة تعيين كلمة المرور | Reset your password |
| 4 | `booking-confirmation` | Booking confirmed (payment received) | ✅ تم تأكيد حجزك — {programName} | Booking Confirmed — {programName} |
| 5 | `payment-receipt` | Each successful payment | إيصال الدفع — {amount} ج.م | Payment Receipt — EGP {amount} |
| 6 | `installment-request-received` | User submits installment request | تم استلام طلب التقسيط | Installment Request Received |
| 7 | `installment-approved` | Admin approves | ✅ تم الموافقة على طلب التقسيط | Installment Request Approved |
| 8 | `installment-rejected` | Admin rejects | ❌ لم يتم قبول طلب التقسيط | Installment Request Rejected |
| 9 | `payment-reminder` | 3 days before installment due | ⏰ تذكير: قسط مستحق بعد 3 أيام | Payment Reminder: Installment Due in 3 Days |
| 10 | `payment-overdue` | 1 day after due date | ⚠️ قسط متأخر — ادفع دلوقتي | Overdue Installment — Pay Now |
| 11 | `consultation-confirmed` | Consultation booking confirmed | ✅ تم حجز الاستشارة — {instructorName} | Consultation Confirmed — {instructorName} |
| 12 | `consultation-reminder-24h` | 24h before consultation | ⏰ استشارتك بكرة الساعة {time} | Your Consultation is Tomorrow at {time} |
| 13 | `consultation-reminder-1h` | 1h before consultation | 🔔 استشارتك بعد ساعة! | Your Consultation is in 1 Hour! |
| 14 | `consultation-cancelled` | Consultation cancelled | ❌ تم إلغاء الاستشارة | Consultation Cancelled |
| 15 | `refund-approved` | Admin approves refund | ✅ تم الموافقة على طلب الاسترداد | Refund Request Approved |
| 16 | `refund-rejected` | Admin rejects refund | ❌ تم رفض طلب الاسترداد | Refund Request Rejected |
| 17 | `booking-cancelled` | Booking cancelled | ❌ تم إلغاء حجزك — {programName} | Booking Cancelled — {programName} |
| 18 | `account-deletion-confirm` | User requests deletion | تأكيد حذف الحساب | Account Deletion Confirmation |
| 19 | `account-deleted` | Account deleted after 24h | تم حذف حسابك | Your Account Has Been Deleted |
| 20 | `email-changed` | Email address changed | تم تغيير بريدك الإلكتروني | Your Email Has Been Changed |
| 21 | `security-alert` | Suspicious login attempt | ⚠️ تنبيه أمني — محاولة دخول غير معتادة | Security Alert — Unusual Login Attempt |

### 1.2 Engagement Emails (يمكن إلغاء الاشتراك)

| # | Template ID | Trigger | Subject (AR) |
|---|---|---|---|
| 22 | `review-request` | 3 days after round completion | ⭐ قيّم تجربتك في {programName} |
| 23 | `review-reminder` | 7 days after completion (if no review) | ⭐ رأيك يهمنا — قيّم {programName} |
| 24 | `waitlist-spot-available` | Seat opened for waitlist user | 🎉 مكان متاح في {programName}! |
| 25 | `certificate-ready` | Quiz passed + certificate generated | 🎓 شهادتك جاهزة! — {programName} |
| 26 | `round-reminder-3d` | 3 days before round start | 📅 الجولة بتبدأ بعد 3 أيام — {programName} |
| 27 | `round-reminder-1d` | 1 day before round start | 📅 بكرة! جهز نفسك لـ {programName} |
| 28 | `installment-approval-expiring` | 2 days before approval expires | ⏰ موافقة التقسيط بتنتهي بعد يومين! |
| 29 | `inactive-user` | No login for 30 days | 🔔 وحشتنا! شوف البرامج الجديدة |
| 30 | `new-program-announcement` | New program published | 🆕 برنامج جديد: {programName} |
| 31 | `round-cancelled` | Admin cancels round | ❌ للأسف الجولة اتلغت — {programName} |

### 1.3 Instructor Operational Emails (Transactional)

| # | Template ID | Trigger | Subject (AR) |
|---|---|---|---|
| 32 | `instructor-onboarding-submitted` | Instructor completes onboarding submission | ✅ تم استلام طلب انضمامك كمحاضر |
| 33 | `instructor-profile-approved` | Admin approves instructor profile | 🎉 تم قبول ملفك كمحاضر |
| 34 | `instructor-profile-rejected` | Admin rejects instructor profile | ⚠️ نتيجة مراجعة ملفك كمحاضر |
| 35 | `instructor-program-approved` | Admin approves proposed program | ✅ تمت الموافقة على البرنامج المقترح |
| 36 | `instructor-program-rejected` | Admin requests revisions on proposed program | ❌ تم طلب تعديلات على البرنامج المقترح |

---

## 2. Email Template Structure

### 2.1 Common Layout

```html
<!-- All emails follow this structure -->
<!DOCTYPE html>
<html dir="{direction}" lang="{locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background: #020504; color: #F1F6F1; font-family: Cairo, Arial, sans-serif;">
  <!-- Header: Logo -->
  <div style="text-align: center; padding: 32px;">
    <img src="{logoUrl}" alt="Next Academy" width="150" />
  </div>
  
  <!-- Content -->
  <div style="max-width: 600px; margin: 0 auto; padding: 32px; background: #111111; border-radius: 8px;">
    <h1 style="font-size: 24px; margin-bottom: 16px;">{title}</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #C5C5C5;">{body}</p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{ctaUrl}" style="background: #C51B1B; color: #FFF; padding: 14px 40px; text-decoration: none; border-radius: 4px; font-weight: 700;">{ctaText}</a>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; padding: 24px; color: #888;">
    <p>Next Academy — {year}</p>
    <p><a href="{unsubscribeUrl}" style="color: #888;">إلغاء الاشتراك</a></p>
  </div>
</body>
</html>
```

### 2.2 Template Variables

```text
Common Variables (available in ALL templates):
├── {userName} — User's first name
├── {userEmail} — User's email
├── {locale} — "ar" or "en"
├── {direction} — "rtl" or "ltr"
├── {logoUrl} — Next Academy logo URL
├── {year} — Current year
├── {supportEmail} — support@nextacademyedu.com
├── {supportWhatsApp} — WhatsApp support link
└── {unsubscribeUrl} — Unsubscribe link (engagement emails only)

Booking-specific:
├── {programName} — Program title (in user's language)
├── {roundDate} — Round start date (formatted for locale)
├── {roundTime} — Session time
├── {roundLocation} — Location or "Online"
├── {bookingCode} — BK-XXXXX
└── {whatsappGroupLink} — WhatsApp group invite link

Payment-specific:
├── {amount} — Payment amount (formatted)
├── {currency} — "ج.م" or "EGP"
├── {paymentMethod} — "بطاقة ائتمان" or "فوري" etc.
├── {transactionId} — Paymob transaction ID
├── {dueDate} — Installment due date
└── {paymentUrl} — Direct pay link

Consultation-specific:
├── {instructorName} — Instructor full name
├── {consultationDate} — Session date
├── {consultationTime} — Session time
├── {meetingLink} — Zoom/Meet link
├── {calendarLink} — Add to calendar link
└── {duration} — Session duration (e.g., "60 دقيقة")
```

---

## 3. WhatsApp Templates

### 3.1 Template Messages

| # | Trigger | Message (AR) |
|---|---|---|
| 1 | Booking confirmed | "✅ تم تأكيد حجزك في {programName}!\n📅 يبدأ يوم {roundDate}\n🔗 رابط الجروب: {whatsappGroupLink}\nلو عندك أي سؤال تواصل معانا" |
| 2 | Payment reminder (3 days) | "⏰ تذكير: القسط اللي بـ {amount} ج.م مستحق يوم {dueDate}.\n💳 ادفع من هنا: {paymentUrl}" |
| 3 | Payment overdue | "⚠️ القسط اتأخر! المبلغ: {amount} ج.م.\nادفع دلوقتي عشان حجزك ميتعلقش: {paymentUrl}" |
| 4 | Consultation reminder 24h | "📅 تذكير: استشارتك مع {instructorName} بكرة الساعة {consultationTime}\n🔗 رابط الاجتماع: {meetingLink}" |
| 5 | Consultation reminder 1h | "🔔 استشارتك بعد ساعة!\n🔗 ادخل من هنا: {meetingLink}" |
| 6 | Waitlist notification | "🎉 مكان اتفتحلك في {programName}!\nاحجز خلال 24 ساعة: {bookingUrl}" |
| 7 | Round reminder 1 day | "📅 بكرة! {programName} بيبدأ الساعة {roundTime}.\nجهز نفسك! 💪" |
| 8 | Certificate ready | "🎓 مبروك! شهادتك في {programName} جاهزة!\n📥 حمّلها من هنا: {certificateUrl}" |
| 9 | Review request | "⭐ عاملك إيه {programName}؟ قيّم تجربتك من هنا: {reviewUrl}" |
| 10 | Installment approved | "✅ تم الموافقة على طلب التقسيط!\nاكمل الحجز خلال 7 أيام: {bookingUrl}" |

### 3.2 WhatsApp Rules

```text
Rules:
├── All messages must be pre-approved WhatsApp Business templates
├── Max message length: 1024 characters
├── No aggressive selling or spam
├── Respect user opt-out (whatsapp_opt_in field)
├── Max 2 messages per day per user
├── No messages between 10 PM - 8 AM (Cairo time)
├── Include opt-out instructions: "رد بـ 'إلغاء' لإيقاف الرسائل"
└── Track delivery status: sent → delivered → read
```

---

## 4. In-App Notification Templates

| # | Type | Icon | Message (AR) | Action |
|---|---|---|---|---|
| 1 | booking_confirmed | ✅ | تم تأكيد حجزك في {programName} | → /dashboard/bookings/{id} |
| 2 | payment_received | 💰 | تم استلام دفعة {amount} ج.م | → /dashboard/payments/{id} |
| 3 | payment_due | ⏰ | القسط التالي بـ {amount} ج.م مستحق {dueDate} | → /dashboard/payments |
| 4 | payment_overdue | ⚠️ | قسطك متأخر! ادفع دلوقتي عشان ما يتعلقش وصولك | → /dashboard/payments |
| 5 | consultation_reminder | 📅 | استشارتك مع {instructorName} بعد ساعة | → meeting link |
| 6 | waitlist_available | 🎉 | مكان اتفتحلك في {programName}! | → /book/{roundId} |
| 7 | review_request | ⭐ | قيّم تجربتك في {programName} | → /dashboard/bookings/{id} |
| 8 | certificate_ready | 🎓 | شهادتك جاهزة للتحميل! | → /dashboard/bookings/{id} |
| 9 | installment_approved | ✅ | تم الموافقة على طلب التقسيط | → /book/{roundId} |
| 10 | installment_rejected | ❌ | لم يتم قبول طلب التقسيط | → /dashboard/installment-requests |
| 11 | refund_approved | 💸 | تم الموافقة على طلب الاسترداد | → /dashboard/bookings/{id} |
| 12 | round_cancelled | ❌ | تم إلغاء الجولة — {programName} | → /dashboard/bookings |
| 13 | session_reminder | 📢 | عندك محاضرة بكرة الساعة {time} | → /dashboard/bookings/{id} |
| 14 | access_blocked | 🚫 | تم تعليق وصولك بسبب تأخر القسط | → /dashboard/payments |
