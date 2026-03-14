# Wireframe: Refund Request (`/dashboard/refund-request`)

> Last Updated: 2026-03-05 00:38

## User Flow

### Step 1: User Requests Refund

- **Location:** `/dashboard/bookings/:id` → Button: `Request Refund` (visible only if booking is eligible).
- **Form:**
  - Reason for refund (Dropdown: Changed plans, Not satisfied, Technical issue, Other).
  - Additional details (Textarea).
  - CTA: `Submit Refund Request`.
- **After Submit:** Status shows "Refund Pending" on booking card. User gets confirmation email.

### Step 2: Admin Reviews (Payload CMS)

- **Location:** `/admin/refund-requests` (new collection).
- **List View:** Table showing User Name, Program, Amount, Reason, Date Requested, Status.
- **Detail View:**
  - Full user info + booking info + payment history.
  - Reason & details submitted by user.
  - **Admin Actions:**
    - `✅ Approve Refund` → Admin enters refund amount (partial or full) → Processes refund via Paymob API → Status = "Refunded".
    - `❌ Reject Refund` → Admin writes rejection reason (required text field) → Status = "Rejected".

### Step 3: User Sees Result

- **If Approved:**
  - Booking card shows "Refunded - [Amount]".
  - **If user was on installment plan → System auto-cancels ALL remaining scheduled installments.**
  - No further payment reminders are sent for this booking.
  - Email + WhatsApp: "تم استرداد [Amount] لحسابك بنجاح."
- **If Rejected:**
  - Booking card shows "Refund Rejected".
  - **User can read the Admin's rejection reason** displayed on their booking details.
  - Email: "للأسف طلب الاسترداد تم رفضه. السبب: [Admin Reason]."

## Eligibility Rules (Configurable by Admin)

```text
├── Refund allowed within X days of purchase (default: 7 days)
├── Refund NOT allowed if user attended any session
├── Partial refund if user attended < 50% sessions
└── Admin can override any rule manually
```
