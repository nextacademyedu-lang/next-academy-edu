# Wireframe: Admin Labels & Broadcast (`/admin/labels` + `/admin/broadcasts`)

> Last Updated: 2026-03-05 00:31

---

## Part 1: Labels Management (`/admin/labels`)

### What are Labels?

Tags/labels that get attached to users for segmentation and targeted messaging. They can be applied manually by the Admin or automatically by the system.

### Label Types

| Type                | Example                                                 | Applied By                       |
| ------------------- | ------------------------------------------------------- | -------------------------------- |
| Company-based       | `company:vodafone`, `company:paypal`                    | Auto (from onboarding)           |
| Course-based        | `enrolled:sales-workshop`, `completed:marketing-course` | Auto (on booking/completion)     |
| Category-based      | `interest:marketing`, `interest:leadership`             | Auto (from onboarding interests) |
| Registration period | `cohort:2026-Q1`, `cohort:2026-march`                   | Auto (on registration date)      |
| Payment behavior    | `installment-user`, `full-payer`, `overdue`             | Auto (from payment data)         |
| Custom (Manual)     | `vip`, `speaker`, `partner`, `blacklisted`              | Manual by Admin                  |

### UI: Labels List View

- **Table:** Label Name, Color Tag, Users Count, Created Date.
- **Actions:** Edit, Delete, `View Users` (shows filtered list).
- **CTA:** `+ Create Label` button.

### UI: Create/Edit Label

- **Fields:**
  - Label Name (e.g., "VIP Clients").
  - Color Picker (for visual distinction in tables).
  - Auto-assign Rule (Optional):
    - Condition Builder: `IF [field] [operator] [value] THEN apply this label`.
    - Example: IF `company` = "Vodafone" → auto-label `company:vodafone`.
    - Example: IF `registration_date` >= "2026-03-01" → auto-label `cohort:2026-march`.

### Assigning Labels Manually

- From `/admin/users` → Select one or more users → Bulk action: `Add Label`.
- From individual User detail page → Labels field (multi-select tags input).

---

## Part 2: Broadcast Messaging (`/admin/broadcasts`)

### What is a Broadcast?

A custom message sent by the Admin to a targeted group of users (filtered by labels) across one or more channels.

### UI: Broadcasts List View

- **Table:** Subject/Title, Target Label(s), Channel(s), Status (Draft/Sent/Scheduled), Sent Date, Recipients Count.
- **CTA:** `+ New Broadcast`.

### UI: Create Broadcast (Step-by-Step)

#### Step 1: Select Target Audience

- **Label Selector:** Multi-select from existing labels.
  - Example: Select `company:vodafone` + `interest:marketing`.
  - Logic: Users matching **ALL** selected labels (AND) or **ANY** (OR) — toggle switch.
- **Preview:** Shows estimated recipient count (e.g., "This will reach 47 users").
- **Exclude Labels:** Optional — exclude users with specific labels (e.g., exclude `blacklisted`).

#### Step 2: Select Channel(s)

- **Checkboxes:**
  - ☑️ Email (via Resend)
  - ☑️ WhatsApp (via Evolution API)
  - ☑️ In-App Notification
- Admin can select one, two, or all three.

#### Step 3: Compose Message

- **If Email selected:**
  - Subject Line input.
  - Rich Text Editor for email body.
  - Merge tags support: `{{first_name}}`, `{{company_name}}`, `{{last_course}}`.
  - Preview button (shows rendered email).
- **If WhatsApp selected:**
  - Plain text message input (WhatsApp formatting: _bold_, _italic_).
  - Same merge tags: `{{first_name}}`, etc.
  - Character limit indicator.
- **If In-App selected:**
  - Notification title (short).
  - Notification body (1-2 lines).
  - Link/Route to redirect on click (e.g., `/programs/new-course`).

#### Step 4: Schedule & Send

- **Options:**
  - `Send Now` — Immediately dispatches to all channels.
  - `Schedule` — Date + Time picker for future delivery.
- **CTA:** `Send Broadcast` or `Schedule Broadcast`.

### UI: Broadcast Detail / Report

- After sending, shows:
  - Total Recipients.
  - Per-channel delivery stats (Sent / Delivered / Failed).
  - Email: Open Rate, Click Rate (if tracking enabled via Resend).
