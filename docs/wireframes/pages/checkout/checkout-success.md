# Wireframe: Checkout Success (`/checkout/success`)

## Layout

- Centered card on dark background.

## Content

- ✅ Large animated Checkmark icon.
- **Header:** "تم تأكيد حجزك بنجاح!"
- **Transaction Ref:** "#TXN-123456"
- **Program Info:** [Program Name] - Round [#] - Starts [Date]

## Action Buttons (Stacked)

### 1. WhatsApp Group

- **Button:** `📱 انضم لجروب الواتساب` (Green WhatsApp-branded button).
- Opens the `whatsapp_group_link` that the Admin added to this Round in Payload CMS.

### 2. Add to Calendar

- **Button Row:** Three inline buttons:
  - `Google Calendar` → Generates .ics link or uses Google Calendar API to auto-add.
  - `Outlook` → Downloads .ics file.
  - `Apple Calendar` → Downloads .ics file.
- Each creates an event with: Program Name, Session Dates, Zoom/Meet Link.

### 3. Go to Dashboard

- **Button:** `الذهاب للداشبورد` (Primary brand button).
- Redirects to `/dashboard/bookings/:id`.

## Auto-Actions (Invisible to User)

- System sends WhatsApp message via Evolution API with booking confirmation + group link.
- System sends Resend email with booking details + calendar links.
- In-App notification created in notifications table.
