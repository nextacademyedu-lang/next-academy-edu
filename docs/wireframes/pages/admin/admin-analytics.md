# Wireframe: Admin Analytics Dashboard (`/admin/analytics`)

> Last Updated: 2026-03-05 00:38
> Data Source: PostgreSQL (primary) + Google Analytics 4 (behavior)

## 1. Top KPI Cards (4 Cards Row)

- **Total Revenue (This Month):** $12,500 ↑ 15% vs last month
- **New Users (This Month):** 142 ↑ 8%
- **Active Bookings:** 87
- **Conversion Rate:** 4.2% (visitors → bookings)

## 2. Revenue Chart

- **Type:** Area/Line chart (monthly revenue over 12 months).
- **Toggle:** By program type (Workshops / Courses / Webinars / Consultations).

## 3. Top Programs Table

- **Columns:** Program Name, Total Bookings, Revenue, Avg Rating, Fill Rate %.
- **Sortable** by any column.

## 4. User Growth Chart

- **Type:** Bar chart (new registrations per month).
- **Overlay:** Active users vs Total users.

## 5. Sales Team Performance (Sales Attribution)

- **Table:** Sales Rep Name, Leads Assigned, Deals Closed, Revenue Generated, Conversion Rate.
- **Filter:** By date range.

## 6. Company Leaderboard (B2B)

- **Table:** Company Name, Total Employees Enrolled, Total Spend, Top Category.

## 7. GA4 Integration Panel

- Embedded or API-fetched widgets:
  - Page views (top pages).
  - Traffic sources (organic, paid, social, direct).
  - Bounce rate.
  - Avg session duration.

## 8. Installment Health

- **Pie chart:** On-time payments vs Overdue vs Pending.
- **Table:** Overdue installments with user name, amount, days overdue.
