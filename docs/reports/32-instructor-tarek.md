# Dr. Tarek — Lead Instructor Audit Report
**Team:** Next Academy Internal  
**Date:** April 16, 2026  
**Scope:** Instructor portal, availability management, Google Calendar sync, agreements, submission review

## My Instructor Experience Assessment

From my perspective as an instructor, the system is a mix of high-automation magic and manual "hope-it-works" procedures. Currently, I use the portal to:
1.  **Define my weekly rhythm**: I set my hours (e.g., Mondays 10 AM - 2 PM) in the "Availability" section. The system then "paves" the next 3 weeks with slots.
2.  **Handle exceptions**: I manually add "Blocked Dates" when I'm traveling or busy.
3.  **Propose new content**: I submit detailed workshop/course proposals through a form.
4.  **Teach**: I see a list of group sessions with automated Google Meet links.

While the "group classes" side of things feels solid, the "personal consultations" side feels disconnected from my actual life (my Google Calendar). I am constantly worried about the "two-calendar problem."

---

## Critical Issues 🔴

1.  **Consultation "Blind Spot" (No Outbound Google Sync)**
    *   **The Issue**: When a student books a 1:1 consultation, it *only* exists in the Next Academy portal. It does not push an event to my Google Calendar.
    *   **Why it breaks my teaching**: I rely on my phone notifications for my life. If I don't check the portal every hour, I will miss a booking. This leads to frustrated students and a poor reputation for me and the academy.
    *   **Technical Root**: `ConsultationBookings` collection lacks the `afterChange` hook found in group `Sessions` that initiates Google Calendar events.

2.  **The "Two-Calendar Conflict" (No Inbound Google Sync)**
    *   **The Issue**: The system is unaware of my external commitments. If I block time in Google Calendar for a university lecture, Next Academy continues to show me as available for consultations during that time.
    *   **Why it breaks my teaching**: I have to manually duplicate every "busy" event from my real life into the "Blocked Dates" section of the portal. If I forget, I get double-booked.
    *   **Technical Root**: `instructor-slot-sync.ts` only respects the internal `instructor-blocked-dates` collection.

---

## Major Issues 🟠

1.  **Stagnant Availability (The 21-Day Cliff)**
    *   **The Issue**: The 21-day availability window is only generated when I manually click "Save" on my availability settings. 
    *   **Friction**: If I don't interact with the portal for 3 weeks, my profile suddenly shows "No available slots" to all students. It should be a rolling window that automatically extends.
    *   **Technical Root**: `syncInstructorConsultationSlots` is triggered by a `PUT` request to the API, not a recurring cron/background task.

2.  **"Where is my contract?" (Agreement Visibility)**
    *   **The Issue**: I know I'm supposed to sign agreements for new courses, but there's no clear "Red Alert" or "Pending Task" on my dashboard when a new version is released.
    *   **Friction**: I often don't realize I haven't signed something until the ops team emails me.
    *   **Observation**: The `InstructorAgreements` collection exists, but the dashboard (`instructor/page.tsx`) doesn't show "Pending Actions."

---

## Minor Issues / Improvements 🟡

1.  **Student Feedback Void**: I can review student work, but I'd love to see a "Reaction Stream" — how students felt about my feedback or my session.
2.  **Enrollment Pulse**: The dashboard shows attendance counts, but not "New Enrollments Today," which would help me get excited about upcoming cohorts.

---

## What's Working Well ✅

*   **Group Sessions**: The Google Meet link generation for classes is flawless and reliable.
*   **Onboarding Flow**: The program submission form is exhaustive and professional; it makes me feel like the academy cares about the quality of content.
*   **Immutable Agreements**: I appreciate that the system keeps a "Frozen Snapshot" of what I signed.

---

## Recommendations

| Priority | Action | Who Fixes It | Effort |
|----------|--------|-------------|--------|
| **🔴 Critical** | Sync 1:1 Bookings to Google Calendar | Backend | Medium |
| **🔴 Critical** | Check Google Calendar for conflicts during Slot Sync | Backend | High |
| **🟠 Major** | Implement a "Rolling Sync" cron job for availability | DevOps | Medium |
| **🟠 Major** | Add "Pending Tasks" (Agreements/Submissions) to Dashboard | Frontend | Low |
| **🟡 Minor** | Multi-lingual support for Bio/Profile updates | Frontend | Low |

---

## Appendix
*   Files Reviewed: `src/collections/ConsultationBookings.ts`, `src/lib/instructor-slot-sync.ts`, `src/app/api/instructor/availability/route.ts`, `src/lib/google-calendar.ts`.
