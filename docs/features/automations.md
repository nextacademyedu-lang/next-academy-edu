# Next Academy — Automations & Notifications System

> Last Updated: 2026-03-05 00:28
> Integrations: Evolution API (WhatsApp), Resend (Email), Google Calendar API

---

## 1. Post-Booking Automations (بعد الحجز والدفع)

### A) WhatsApp Group Invite

```text
Trigger: Payment confirmed (Paymob webhook → booking.status = "confirmed")
Flow:
1. Admin adds WhatsApp Group Link to each Round/Course in Payload CMS.
   → Field: `whatsapp_group_link` (URL) on the Rounds collection.
2. After payment confirmed:
   → System sends WhatsApp message via Evolution API to user's phone number:
      "🎉 مبروك يا [Name]! تم تأكيد حجزك في [Program Name].
       انضم لجروب الواتساب: [Group Link]"
   → Same link also appears on the Checkout Success page.
   → Link saved in user's Booking Details page (/dashboard/bookings/:id).
```

### B) Google Calendar / Meet Event (Primary Integration)

```text
Trigger: Admin scheduling a session OR Payment confirmed
Flow:
1. Admin creates/schedules a Session in Payload CMS (Date & Time).
2. System calls **Google Calendar API** to:
   → Auto-create a Calendar Event: "[Program Name] - Session [#]".
   → Auto-generate a Google Meet Link attached to the event.
   → Save this Meet Link in the Payload CMS Session record.
3. After user payment confirmed:
   → System adds the user's email as a "Guest" to that specific Google Calendar event.
   → The user receives an official Google Calendar invite + the event appears on their calendar.
   → The generated Meet link is what gets embedded as an `<iframe>` in the `/live` page for In-App viewing.
```

---

## 2. Email Automations (Resend)

### Transactional Emails (Immediate)

| Trigger              | Email Content                                               | Timing  |
| -------------------- | ----------------------------------------------------------- | ------- |
| Registration         | Welcome email + complete your profile CTA                   | Instant |
| Payment confirmed    | Booking confirmation + WhatsApp group link + Calendar links | Instant |
| Installment approved | "Your installment plan is approved, click to pay deposit"   | Instant |
| Installment rejected | "Unfortunately your request was declined" + support contact | Instant |
| Payment failed       | "Payment declined, try again" + retry link                  | Instant |
| Password reset       | Reset link (expires 1hr)                                    | Instant |

### Reminder Emails (Scheduled)

| Trigger             | Email Content                                                 | Timing                 |
| ------------------- | ------------------------------------------------------------- | ---------------------- |
| Session upcoming    | "Your session [Title] starts tomorrow at [Time]" + Zoom link  | 24 hours before        |
| Session upcoming    | "Starting in 1 hour! Join now" + Zoom link                    | 1 hour before          |
| Installment due     | "Your next installment of [Amount] is due on [Date]"          | 3 days before due date |
| Installment overdue | "Your payment was due on [Date]. Pay now to avoid suspension" | 1 day after due date   |

### Engagement / Re-engagement Emails (Lifecycle)

| Trigger                  | Email Content                                                      | Timing                    |
| ------------------------ | ------------------------------------------------------------------ | ------------------------- |
| New program added        | "🔥 New: [Program Name] just launched! Early bird seats available" | On publish                |
| Program updated          | "Update: [Program Name] schedule has been revised"                 | On significant update     |
| Inactive user (30 days)  | "We miss you, [Name]! Here's what's new at Next Academy"           | 30 days no login          |
| Post-course completion   | "How was [Program Name]? Leave a review" + feedback link           | 3 days after last session |
| Upcoming round promotion | "Only [X] seats left in [Program Name]!"                           | When seats < 20% capacity |
| Birthday (if collected)  | "Happy Birthday [Name]! 🎂 Here's 10% off your next course"        | On birth date             |

---

## 3. WhatsApp Automations (Evolution API)

### Transactional Messages

| Trigger             | Message                                         | Timing          |
| ------------------- | ----------------------------------------------- | --------------- |
| Payment confirmed   | Booking confirmation + WhatsApp group link      | Instant         |
| Session reminder    | "جلستك [Title] هتبدأ بكرة الساعة [Time] 🎯"     | 24 hours before |
| Installment due     | "تذكير: القسط القادم [Amount] مستحق يوم [Date]" | 3 days before   |
| Installment overdue | "⚠️ القسط متأخر! ادفع دلوقتي عشان حجزك ميتعلقش" | 1 day after     |

### Engagement Messages

| Trigger            | Message                              | Timing           |
| ------------------ | ------------------------------------ | ---------------- |
| New program launch | "🚀 برنامج جديد: [Name]! سجل دلوقتي" | On publish       |
| Seats running low  | "آخر [X] مقاعد في [Program Name]!"   | When seats < 20% |

---

## 4. In-App Notifications (Dashboard Bell Icon)

| Trigger                      | Notification Text                              | Route                     |
| ---------------------------- | ---------------------------------------------- | ------------------------- |
| Session in 1 hour            | "جلستك [Title] هتبدأ كمان ساعة"                | `/dashboard/bookings/:id` |
| Recording available          | "تسجيل جلسة [Title] بقى متاح"                  | `/dashboard/bookings/:id` |
| Installment due in 3 days    | "القسط القادم مستحق يوم [Date]"                | `/dashboard/payments`     |
| New program matches interest | "برنامج جديد في [Category] ممكن يعجبك!"        | `/programs/:slug`         |
| Waitlist → Seat available    | "مكان فضي ليك في [Program]! احجز خلال 24 ساعة" | `/book/:roundId`          |

---

## 4b. Consultation Notifications (للمحاضر/الخبير)

> When a user books a consultation, the **instructor** must be notified immediately across all channels.

### Email (Resend → Instructor)

| Trigger                 | Email Content                                                         | Timing          |
| ----------------------- | --------------------------------------------------------------------- | --------------- |
| New consultation booked | "📅 حجز جديد: [Client Name] حجز جلسة [Type] يوم [Date] الساعة [Time]" | Instant         |
| Consultation in 24h     | "تذكير: عندك جلسة مع [Client Name] بكرة الساعة [Time]"                | 24 hours before |
| Consultation in 1h      | "جلستك مع [Client Name] هتبدأ كمان ساعة! رابط الميتينج: [Link]"       | 1 hour before   |
| Consultation cancelled  | "⚠️ [Client Name] ألغى جلسته يوم [Date]"                              | Instant         |

### WhatsApp (Evolution API → Instructor)

| Trigger                 | Message                                                     | Timing          |
| ----------------------- | ----------------------------------------------------------- | --------------- |
| New consultation booked | "🔔 حجز جديد! [Client Name] حجز [Type] يوم [Date] - [Time]" | Instant         |
| Consultation in 24h     | "تذكير: جلسة مع [Client Name] بكرة الساعة [Time]"           | 24 hours before |

### In-App (Instructor Dashboard Bell)

| Trigger                 | Notification Text                           | Route                      |
| ----------------------- | ------------------------------------------- | -------------------------- |
| New consultation booked | "حجز جديد: [Client Name] - [Type] - [Date]" | `/instructor/bookings/:id` |
| Consultation in 1 hour  | "جلستك مع [Client Name] هتبدأ كمان ساعة"    | `/instructor/bookings/:id` |
| Client cancelled        | "[Client Name] ألغى جلسته"                  | `/instructor/bookings`     |

---

## 5. Admin Configuration (Payload CMS)

### Per-Round Settings

```text
Round Collection Fields:
├── whatsapp_group_link: URL (required for WhatsApp automation)
├── zoom_link: URL (for sessions)
├── google_meet_link: URL (alternative)
├── enable_whatsapp_reminders: Boolean (default: true)
├── enable_email_reminders: Boolean (default: true)
└── reminder_schedule: Array [{hours_before: 24}, {hours_before: 1}]
```

### Global Automation Settings (/admin/settings)

```text
├── Evolution API Key: Encrypted string
├── Resend API Key: Encrypted string
├── Google Calendar Client ID: Encrypted string
├── Default reminder timing: 24h + 1h
├── Enable birthday emails: Boolean
├── Inactive user threshold: 30 days (configurable)
└── Seats urgency threshold: 20% (configurable)
```

---

## 7. Labels & Targeted Broadcasts (CRM-lite)

> Full wireframe: `wireframes/pages/admin/admin-labels-broadcasts.md`

```text
Labels System:
├── Auto Labels: company-based, course-based, category, cohort, payment behavior
├── Manual Labels: VIP, speaker, partner, blacklisted (Admin assigns)
└── Auto-assign Rules: Condition builder (IF field = value → apply label)

Broadcast System:
├── Step 1: Select target labels (AND/OR logic + exclude)
├── Step 2: Pick channels (Email ☑️ / WhatsApp ☑️ / In-App ☑️)
├── Step 3: Compose message per channel (merge tags: {{first_name}}, etc.)
├── Step 4: Send Now or Schedule
└── Report: Delivery stats, open rate, click rate
```

---

## 8. Automation Architecture

```text
                    ┌─────────────────┐
                    │   Payload CMS   │
                    │  (Admin Config) │
                    │  Labels + Rules │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Next.js API    │
                    │  Routes/Crons   │
                    │  + Broadcasts   │
                    └────┬───┬───┬────┘
                         │   │   │
              ┌──────────┘   │   └──────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ Resend API │  │ Evolution  │  │ Google Cal │
     │  (Email)   │  │ API (WA)   │  │    API     │
     └────────────┘  └────────────┘  └────────────┘
```
