# Next Academy — Certificates System

> Last Updated: 2026-03-05 01:00

## Overview

Each program can have a **custom certificate design**. Upon completion AND passing the quiz, the student can download a personalized PDF certificate from their dashboard.

## Certificate Eligibility (Mandatory Conditions)

```text
ALL conditions must be met:
├── 1. All installments fully paid (no outstanding balance).
├── 2. Round marked as "Completed" by Admin.
└── 3. Student passes the program Quiz/Test.
    ├── Admin creates quiz per program (or per session).
    ├── If PASS → Certificate unlocked → "🎓 Download Certificate" button appears.
    └── If FAIL → No certificate. Student can retake quiz (configurable by Admin).
```

## Quiz System (New)

- **Location:** `/dashboard/bookings/:id/quiz`
- **Admin Setup (Payload CMS):**
  - `/admin/programs/:id` → Quiz Tab.
  - Add Questions: Multiple Choice, True/False, or Short Answer.
  - Set passing score (e.g., 70%).
  - Set max attempts (e.g., 3 attempts, or unlimited).
  - Toggle: "Require quiz for certificate" (Boolean, default: true).
- **Student Experience:**
  - After Round is completed, a "📝 Take Quiz" button appears on booking details.
  - Timer (optional, configurable by Admin).
  - On submit → Instant result: Pass ✅ / Fail ❌.
  - If Pass → "🎓 Download Certificate" button unlocks.
  - If Fail → "Try again" (if attempts remaining) or "Contact support".

## Certificate Fields (Dynamic)

| Field                | Source                           | Example                           |
| -------------------- | -------------------------------- | --------------------------------- |
| Student Full Name    | `user.firstName + user.lastName` | "أحمد محمد خالد"                  |
| Program Title        | `program.title`                  | "ورشة المبيعات المتقدمة"          |
| Program Type         | `program.type`                   | "Workshop" / "Course" / "Webinar" |
| Instructor Name      | `instructor.name`                | "صلاح خليل"                       |
| Completion Date      | `booking.completedAt`            | "2026-03-15"                      |
| Certificate ID       | Auto-generated unique            | "CERT-2026-00142"                 |
| Round Number         | `round.number`                   | "Round 3"                         |
| Total Hours          | `program.totalHours`             | "24 ساعة تدريبية"                 |
| Quiz Score           | `quiz.score`                     | "85%"                             |
| Next Academy Logo    | Static asset                     | Brand logo                        |
| Instructor Signature | `instructor.signatureImage`      | Uploaded image                    |
| QR Code              | Auto-generated                   | Links to verification URL         |

## Certificate Design (Per Program)

- Admin uploads a **custom background template** (PNG/PDF) per program in Payload CMS.
- Fields are overlaid at predefined coordinates on the template.
- This allows each program to have a totally different visual design.

## Verification

- Each certificate has a QR code linking to `/verify/:certificateId`.
- Public page shows: "This certificate was issued to [Name] on [Date] for [Program]."
- Prevents forgery.

## User Flow

```text
1. Student completes all sessions in a Round.
2. Admin marks Round as "Completed" in Payload CMS.
3. Student takes the Quiz from /dashboard/bookings/:id/quiz.
4. If PASS + All payments cleared:
   → System generates certificate.
   → Student sees "🎓 Download Certificate" button in /dashboard/bookings/:id.
   → PDF generates on-the-fly with the student's data overlaid on the program template.
5. If FAIL:
   → No certificate. Student may retry (if attempts remain).
```

## Admin Flow (Payload CMS)

```text
/admin/programs/:id → Certificate Tab:
├── Upload Background Template (PNG/PDF)
├── Set field positions (drag-and-drop or coordinate inputs)
├── Preview with sample data
├── Toggle: Auto-generate on completion (Boolean)
└── Upload Instructor Signature Image

/admin/programs/:id → Quiz Tab:
├── Add Questions (MCQ, True/False, Short Answer)
├── Set Passing Score (default: 70%)
├── Set Max Attempts (default: 3)
├── Set Time Limit (optional)
└── Toggle: Require quiz for certificate (default: true)
```
