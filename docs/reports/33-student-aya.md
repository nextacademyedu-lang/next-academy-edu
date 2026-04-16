# Aya — Student Success Manager Audit Report
**Team:** Next Academy Internal  
**Date:** 2026-04-16  
**Scope:** Student journey from registration to certification, dashboard, notifications, support gaps

## Student Journey Map
1. **Registration:** Student fills out form at `/register`, selecting Intent (Student/Instructor). A dynamic password requirement checklist guides them.
2. **Email Verification:** Student is redirected to `/verify-email` with OTP validation.
3. **Onboarding:** Student fills out remaining profile information.
4. **Dashboard:** Student accesses the dashboard overview, which shows upcoming sessions, progress stats, and recent activity.
5. **Booking:** Reserving a program creates a booking with status `pending` or `reserved`. The dashboard prompts them to "Complete Payment".
6. **Enrollment:** Upon confirmation, the backend automatically adds their email to Google Calendar events based on the connected round.
7. **Post-completion:** Student completes the program and the admin generates their certificate.

## Critical Issues 🔴
- **No Self-Service Certificate Download**
  The `Certificates.ts` collection exists in the backend API, but there is absolutely zero UI in the student dashboard (`src/app/[locale]/(dashboard)`) to view or download certificates. The word "certificate" does not even exist in the frontend dashboard codebase. I will have to manually field 100% of "Where is my certificate?" tickets because students literally cannot access them from their portal.
- **Missing Student Notifications on Booking Changes**
  The `Bookings.ts` webhook (`afterChange`) triggers CRM syncs and B2B manager announcements (`notifyMemberBooked`), but it **does not** create an internal `PayloadNotification` for the student. The student's "Recent Activity" feed will be empty when they make or pay for a booking unless an admin manually pushes a notification.

## Major Issues 🟠
- **No Self-Service Cancellation or Refund Requests**
  There is no "Cancel Booking" or "Request Refund" capability in the `bookings/page.tsx` UI. Even for `pending` or `reserved` bookings that haven't been paid for yet, the student cannot cancel their intent to free up the seat—they must contact support. 

## Minor Issues / Improvements 🟡
- **Generic Registration Error Messaging** 
  If an email is already taken, the frontend catches it well, but if the registration fails for other vague reasons, it masks the error behind a generic "registrationFailed" message, driving support tickets like "I can't sign up". 
- **Unused Notification Enums** 
  We have notification types defined in schema like `payment_reminder`, `session_reminder`, and `certificate_ready`, but they are not hooked up to any automated system event.

## What's Working Well ✅
- **Dashboard Usability & Zoom Link Visibility:** The Dashboard gives a very clear "Next Up" widget with a direct Zoom link, which significantly reduces the volume of "Where is the meeting link?" questions prior to a class.
- **Google Calendar Sync:** The automated attendee adding/removing inside `Bookings.ts` via `addAttendeeToAllEvents` is brilliant for ensuring students get meeting invites and reminders instantly upon confirmation without manual tracking.
- **Password Checklist:** The visual password requirements checklist in `register/page.tsx` prevents a lot of friction during sign-up.

## Recommendations
| Priority | Action | Who Fixes It | Effort |
|----------|--------|-------------|--------|
| High | Add a "Certificates" listing component to the dashboard querying `Certificates.ts` so students can download their PDFs. | Frontend Team | Medium |
| High | Dispatch a `booking_confirmed` notification object to the user upon successful payment in the `Bookings.ts` `afterChange` hook. | Backend Team | Low |
| Medium | Add a "Cancel Reservation" button for unpaid/reserved bookings inside the dashboard to naturally free up seats. | Frontend/Backend | Medium |
| Medium | Add a "Request Refund" or "Get Help" action tied to `confirmed` bookings connecting to the support queue. | Frontend Team | Small |
| Low | Implement automated chron-jobs to trigger `payment_reminder` and `session_reminder` notifications. | Backend Team | Medium |
