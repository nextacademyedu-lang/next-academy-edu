# Wireframe: HR / B2B Manager Dashboard (`/b2b-dashboard`)

This dashboard is isolated and only accessible to users with the role `b2b_manager` (assigned manually by Admin via Payload CMS).

> **Important:** This role **inherits** all normal `user` capabilities. The manager can still book for themselves, pay, and use their personal dashboard features. This dashboard **adds** team management on top.

## 1. Global Navigation

- Minimal Sidebar: Team Overview, Seat Allocation, Company Profile, My Bookings (personal).
- Header: Current Logged In Company Name + Manager Name.

## 2. Team Overview (Main View)

- **Top Metrics:** Total Seats Purchased | Total Seats Assigned | Remaining Seats | Company Total Spend.
- **Table:** List of all company employees registered under this `companyId`.
  - Columns: Employee Name, Job Title, Enrolled Programs, Status (Active/Invited).
- **Action CTA (Top Right):** `+ Invite Employee` (Sends email with signup link pre-bound to this company).

## 3. Seat Allocation / Bulk Booking

- **Flow:** Manager selects a Round → Chooses quantity (e.g., 20 seats) → Proceeds to Checkout.
- **After Purchase:** Can assign seats to existing employees from dropdown, or send invite links for new ones.
- **Company-Specific Discounts:** If a promo code is linked to this `companyId`, it auto-applies or is pre-filled.
