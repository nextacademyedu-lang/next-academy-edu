# Phase 5: Dashboard Backend Wiring

Replace all hardcoded mock data in the 4 dashboard pages + layout with real Payload CMS data fetched via the existing `/api/*` proxy. The `AuthContext` (`useAuth()`) already provides the logged-in user; we need to use it and fetch user-specific bookings, payments, and notifications.

## User Review Required

> [!IMPORTANT]
> **API Fetching Strategy:** All dashboard pages are `"use client"` components. We'll fetch data via `fetch('/api/...')` with `credentials: 'include'` (same pattern as `auth-api.ts`). The existing proxy in `proxy.ts` forwards to Payload CMS with the `payload-token` cookie.

> [!IMPORTANT]
> **Payments access control:** The `payments` collection uses `isAdminOrOwnerByField('booking.user')`, so Payload automatically filters payments to only return those owned by the authenticated user. No explicit `where[user]` filter needed — just authenticated requests.

> [!WARNING]
> **No Payload data yet:** If no bookings/payments exist in the database, the dashboard will show empty states instead of mock data. This is expected — we'll add graceful empty-state UI.

---

## Proposed Changes

### Dashboard API Helpers

#### [NEW] [dashboard-api.ts](file:///d:/projects/nextacademy/src/lib/dashboard-api.ts)

Create a typed fetch helper for dashboard data:
- `getUserBookings()` → `GET /api/bookings?depth=2&sort=-createdAt` (auto-filtered by Payload access control; populates `round` → `program`)
- `getUserPayments()` → `GET /api/payments?depth=2&sort=-dueDate` (auto-filtered by `booking.user`)
- `getUserNotifications()` → `GET /api/notifications?sort=-createdAt&limit=5` (auto-filtered by `user`)
- `updateUserProfile(id, data)` → `PATCH /api/users/<id>`
- `changeUserPassword(id, oldPassword, newPassword)` → `PATCH /api/users/<id>` (Payload handles password hashing)

Each returns typed responses matching collection schemas:

| Collection | Key fields used in dashboard |
|---|---|
| `bookings` | `bookingCode`, `status`, `totalAmount`, `paidAmount`, `round` (rel), `paymentPlan` (rel) |
| `payments` | `amount`, `dueDate`, `paidDate`, `status`, `paymentMethod`, `installmentNumber` |
| `notifications` | `title`, `message`, `type`, `isRead`, `actionUrl` |
| `rounds` | `title`, `startDate`, `endDate`, `meetingUrl`, `locationType`, `program` (rel) |
| `users` | `firstName`, `lastName`, `email`, `phone`, `gender`, `role`, `picture` |

---

### Dashboard Layout

#### [MODIFY] [DashboardLayout.tsx](file:///d:/projects/nextacademy/src/components/dashboard/DashboardLayout.tsx)

- Remove `MOCK_USER` constant
- Import `useAuth()` from `@/context/auth-context`
- Display real `user.firstName`, `user.role`, and avatar initial from user data
- Wire the "Sign Out" button to `logout()` from auth context
- Show loading skeleton while `isLoading` is true
- Redirect to `/login` if `!isAuthenticated && !isLoading`

---

### Overview Page

#### [MODIFY] [page.tsx](file:///d:/projects/nextacademy/src/app/[locale]/(dashboard)/dashboard/page.tsx)

- Remove all `MOCK_*` constants
- Use `useAuth()` for the greeting name
- Fetch bookings via `getUserBookings()` → compute stats (active, completed, progress)
- Fetch payments via `getUserPayments()` → compute payment totals and pending
- Fetch notifications via `getUserNotifications()`
- Add loading states and empty states
- Map real booking data to the existing card UI

---

### Bookings Page

#### [MODIFY] [page.tsx](file:///d:/projects/nextacademy/src/app/[locale]/(dashboard)/dashboard/bookings/page.tsx)

- Remove `BOOKINGS` mock array
- Fetch via `getUserBookings()` with `depth=2` to populate `round` → `program`
- Map fields: `round.program.titleEn` → title, `round.locationType` → type, `round.title` → round name, `booking.status` → status
- Compute progress from sessions attended vs total
- Show Zoom link from `round.meetingUrl` if available
- Add empty state when no bookings

---

### Payments Page

#### [MODIFY] [page.tsx](file:///d:/projects/nextacademy/src/app/[locale]/(dashboard)/dashboard/payments/page.tsx)

- Remove `INSTALLMENTS` and `PAST_PAYMENTS` mock arrays
- Fetch via `getUserPayments()` with `depth=2`
- Map fields: `amount`, `dueDate`, `paidDate`, `status`, `paymentMethod`, `installmentNumber`
- Show real transaction history
- Add empty state when no payments

--

### Profile Page

#### [MODIFY] [page.tsx](file:///d:/projects/nextacademy/src/app/[locale]/(dashboard)/dashboard/profile/page.tsx)

- Remove hardcoded "Ahmed Ali" / "ahmed.ali@example.com" defaults
- Use `useAuth()` to populate form fields with real user data (`firstName`, `lastName`, `email`, `phone`, `gender`)
- Wire "Save Changes" button to `updateUserProfile()` API call
- Wire "Update Password" to `changeUserPassword()` (Payload handles hashing)
- Show success/error toasts on save
- Pre-fill avatar initial from real name

---

## Verification Plan

### Manual Verification
1. Login with a real user → Dashboard layout shows correct name/role
2. Dashboard overview shows real stats (or empty states if no data)
3. Profile page pre-fills with real user data
4. Profile save updates user in Payload admin panel
5. Sign Out button logs out and redirects to login
6. Bookings and payments pages show empty states or real data
