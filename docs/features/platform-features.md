# Next Academy — Platform Features

> Last Updated: 2026-03-05 00:38

---

## 1. Global Search

### UI

- Search icon in Navbar → Expands to full-width search overlay (Cmd+K / Ctrl+K shortcut).
- Real-time results as user types (debounced 300ms).

### Results Categories

| Category    | Fields Searched          | Display                        |
| ----------- | ------------------------ | ------------------------------ |
| Programs    | Title, Description, Tags | Card: Image + Title + Type     |
| Instructors | Name, Bio, Specialty     | Card: Photo + Name + Title     |
| Blog Posts  | Title, Content           | Card: Thumbnail + Title + Date |

### Implementation

- Server-side search via Payload CMS Local API.
- Future: Algolia or Meilisearch for faster fuzzy search.

---

## 2. PWA (Progressive Web App)

### Features

- **Installable:** User can "Add to Home Screen" on mobile.
- **Offline:** Cache critical pages (Dashboard shell, Bookings list).
- **Push Notifications:** Web Push API for session reminders and new programs.

### Implementation

- `next-pwa` package for Next.js.
- Service Worker registration.
- Web App Manifest (`manifest.json`):
  - Name: "Next Academy"
  - Theme Color: `#020504`
  - Background: `#020504`
  - Icons: 192x192 + 512x512 (brand logo).
- Push via Resend Web Push or OneSignal (free tier).

---

## 3. Sales Attribution & Referral System

### Sales Team Tracking

- Each Sales Rep has a unique referral code (e.g., `?ref=salah`).
- When a lead registers via that link, `user.referredBy = "salah"` is saved.
- If that user books → the sale is attributed to Salah.

### Admin Visibility

- `/admin/analytics` → Sales Team Performance table.
- Columns: Rep Name, Leads, Conversions, Revenue, Commission.

### Sales Rep Referral Flow

```text
1. Admin creates Sales Rep in Payload → assigns unique ref code.
2. Rep shares link: nextacademy.com/?ref=salah
3. User registers via link → ref code saved to user profile.
4. User books a program → Sale attributed to "salah".
5. Admin sees attribution in Analytics dashboard.
6. Commission calculated (configurable % per program or flat).
```

### Internal Referral (User-to-User)

- Each user gets a personal referral link from their Dashboard.
- If a friend registers AND books → referrer gets a discount code (e.g., 10% off next booking).
- Referred user also gets a welcome discount.

---

## 4. Email Templates (Resend)

### Template Structure

- All emails use a consistent branded HTML template.
- **Header:** Next Academy logo + dark background strip.
- **Body:** Clean white/cream card with content.
- **Footer:** Social icons + Unsubscribe link + Contact info.
- **Font:** Cairo (Arabic) / Inter (English).

### Templates Needed

| Template             | Merge Tags                                                            |
| -------------------- | --------------------------------------------------------------------- |
| Welcome              | `{{first_name}}`                                                      |
| Booking Confirmation | `{{first_name}}`, `{{program_name}}`, `{{date}}`, `{{whatsapp_link}}` |
| Payment Receipt      | `{{amount}}`, `{{ref_id}}`, `{{date}}`                                |
| Session Reminder     | `{{session_title}}`, `{{time}}`, `{{zoom_link}}`                      |
| Installment Due      | `{{amount}}`, `{{due_date}}`                                          |
| Installment Overdue  | `{{amount}}`, `{{days_overdue}}`                                      |
| Refund Approved      | `{{amount}}`, `{{program_name}}`                                      |
| Refund Rejected      | `{{reason}}`, `{{program_name}}`                                      |
| Review Request       | `{{program_name}}`, `{{review_link}}`                                 |
| New Program          | `{{program_name}}`, `{{start_date}}`, `{{price}}`                     |
| Re-engagement        | `{{first_name}}`, `{{days_inactive}}`                                 |
| Certificate Ready    | `{{program_name}}`, `{{download_link}}`                               |
| Broadcast (Custom)   | `{{first_name}}`, `{{company_name}}`, `{{custom_content}}`            |

---

## 5. Error Pages

### 404 — Not Found

- Dark background matching brand.
- Illustration or icon.
- **Text:** "الصفحة مش موجودة" / "Page Not Found".
- **CTA:** `Go to Homepage` + Search bar.

### 500 — Server Error

- **Text:** "حصل مشكلة! جاري الإصلاح" / "Something went wrong".
- **CTA:** `Try Again` + `Contact Support`.

### Maintenance Mode

- **Text:** "الموقع تحت الصيانة وهنرجع قريب!" / "We'll be back soon".
- **Estimated time** (configurable by Admin).
- **Social links** to stay updated.

---

## 6. In-App Live Streaming (PWA / Web)

### The Problem

If a user is using the mobile PWA or web app, sending them out to the Zoom/Google Meet app breaks the UX.

### The Solution (Embedded Sessions)

- **Integration (Primary):** **Google Meet API**. When the Admin schedules a session in Payload CMS, the system automatically creates a Google Meet Event and generates the link.
- **Location:** `/dashboard/bookings/:id/live`
- **UX Flow:**
  1. Admin sets session date/time in Payload CMS → Server calls Google Calendar/Meet API → Auto-generates Google Meet Link.
  2. 15 minutes before the session, the student's `Join Google Meet` button changes to `▶ Join Live Class (In-App)`.
  3. Clicking it opens a dedicated page inside Next Academy (`/live`).
  4. The Google Meet video player is embedded via an `<iframe>` directly in the browser (no external app download needed, keeps user inside the PWA).

---

## 7. Backup & Disaster Recovery

### Strategy

Since data is the core of an educational platform, we implement a robust 3-tier backup strategy:

1. **Daily Incremental (Database Level):**
   - Managed automatically by **Neon PostgreSQL**.
   - Point-in-Time Recovery (PITR) up to 7 days (allows restoring the DB to any exact minute).
2. **Weekly Full Export (Application Level):**
   - Payload CMS plugin generates a JSON/CSV dump of all critical collections (Users, Bookings, Companies, Payments).
   - Automatically uploaded to an encrypted S3 bucket or Google Drive.
3. **Media & Assets Backups:**
   - All uploaded PDFs, images, and videos are stored in Cloudflare R2 / AWS S3 with **versioning enabled** (prevents accidental data deletion or overwrites).

---

## 8. Guided Onboarding Tour

### Trigger

- Fires **only once**, immediately after the user logs into `/dashboard` for the very first time.

### UX (Tooltips via standard library like `driver.js` or `react-joyride`)

1. **Step 1 (Sidebar):** "هنا تقدر تتابع كل حجوزاتك ومدفوعاتك."
2. **Step 2 (Notification Bell):** "هنبهرك بإشعارات قبل أي جلسة بساعة."
3. **Step 3 (Profile):** "كمل بيانات شركتك عشان تستفيد بخصومات الشركات."
4. **Step 4 (CTA):** "أنت جاهز! تصفح أحدث البرامج دلوقتي." (Points to programs link).

- User can click "Skip Tour" (`تخطي`) at any point.
