# Next Academy — Roles & Permissions Matrix

> Last Updated: 2026-03-05 00:15

## User Roles

| Role              | Slug          | Assigned By             | Dashboard Route        |
| ----------------- | ------------- | ----------------------- | ---------------------- |
| Student / Learner | `user`        | Default on registration | `/dashboard`           |
| B2B Manager (HR)  | `b2b_manager` | Admin manually promotes | `/b2b-dashboard`       |
| Instructor        | `instructor`  | Admin manually assigns  | `/instructor`          |
| Administrator     | `admin`       | Seeded / Super Admin    | `/admin` (Payload CMS) |

---

## Permissions Matrix

### 🌐 Public (No Auth Required)

- Browse Programs, Workshops, Webinars, Instructors, Blog.
- View Program Details & Round availability.
- Register / Login / Forgot Password.

### 👤 Role: `user` (Student)

| Feature                             | Access                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| View own Dashboard                  | ✅                                                     |
| Book a Round (for self)             | ✅                                                     |
| Book a Consultation                 | ✅                                                     |
| Request Installment Plan            | ✅                                                     |
| Pay via Paymob                      | ✅                                                     |
| Join Waitlist (if Round full)       | ✅                                                     |
| View own Payment History            | ✅                                                     |
| Edit own Profile                    | ✅                                                     |
| Change Company (Employee Churn)     | ✅ (old sales stay with old company)                   |
| Use General Discount Codes          | ✅                                                     |
| Use Company-Specific Discount Codes | ✅ only if `user.companyId` matches code's `companyId` |
| View other users' data              | ❌                                                     |
| Bulk book seats                     | ❌                                                     |
| Invite employees                    | ❌                                                     |

### 🏢 Role: `b2b_manager` (HR / Training Manager)

> **Inherits ALL `user` permissions** plus the following:

| Feature                               | Access                                |
| ------------------------------------- | ------------------------------------- |
| View B2B Dashboard (`/b2b-dashboard`) | ✅                                    |
| See all company employees (contacts)  | ✅ (filtered by own `companyId` only) |
| Purchase Bulk Seats for a Round       | ✅                                    |
| Assign purchased seats to employees   | ✅                                    |
| Send Invite Email to new employees    | ✅ (auto-links them to the company)   |
| View company total spend & categories | ✅                                    |
| Track employee attendance / progress  | ✅ (Phase 2 feature)                  |
| Use Company-Specific Discount Codes   | ✅ automatically                      |
| Manage other companies                | ❌                                    |
| Access Admin Panel                    | ❌                                    |

### 🎓 Role: `instructor`

| Feature                                   | Access |
| ----------------------------------------- | ------ |
| View Instructor Dashboard                 | ✅     |
| Manage own Consultation Types             | ✅     |
| Set weekly Availability                   | ✅     |
| Block specific dates                      | ✅     |
| View own Consultation Bookings            | ✅     |
| Take Session Attendance                   | ✅     |
| Upload session recordings & materials     | ✅     |
| Edit Public Profile (bio, photo, socials) | ✅     |
| Access other instructors' data            | ❌     |
| Access Admin Panel                        | ❌     |

### 🛡️ Role: `admin`

| Feature                                | Access |
| -------------------------------------- | ------ |
| Full Payload CMS access                | ✅     |
| CRUD on all Collections                | ✅     |
| Promote users to `b2b_manager`         | ✅     |
| Assign `instructor` role               | ✅     |
| Approve / Reject Installment Requests  | ✅     |
| Create Company-Specific Discount Codes | ✅     |
| Generate Direct Payment Links          | ✅     |
| View all Companies & Contacts          | ✅     |
| Manage Waitlists                       | ✅     |

---

## Role Assignment Flow

```text
1. User registers → role = "user" (default).
2. Admin wants to promote:
   → /admin → Users Collection → Find user → Change role dropdown.
   → Options: user | b2b_manager | instructor | admin.
3. On next login, the system checks user.role:
   → "user"         → redirect to /dashboard
   → "b2b_manager"  → redirect to /b2b-dashboard
   → "instructor"   → redirect to /instructor
   → "admin"        → redirect to /admin
```

## Employee Churn (Company Change) Rules

```text
1. User goes to /dashboard/profile → Changes company from "Vodafone" to "Orange".
2. System creates a snapshot:
   - All bookings made BEFORE the change stay linked to "Vodafone" metrics.
   - "Vodafone" total sales NOT reduced.
3. New bookings after the change count toward "Orange" metrics.
4. User appears in "Orange" contacts list, removed from "Vodafone" contacts.
```
