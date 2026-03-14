# Next Academy — Product Overview

## Project Purpose & Value Proposition

Next Academy is a bilingual (Arabic-first, RTL) B2B educational platform serving entrepreneurs, business owners, and corporate teams in Egypt and the Arab world. It delivers workshops, courses, and webinars with a fully integrated booking system, installment payments, CRM sync, and instructor consultation booking — all in a single self-hosted platform with zero recurring SaaS costs.

**Core value:** Replace fragmented tools (separate CMS, CRM, payment processor, email service) with one unified Next.js + Payload CMS platform that handles the full learner lifecycle from lead capture to repeat customer.

---

## Key Features & Capabilities

### Learning Catalog
- Programs unified under one schema: `workshop`, `course`, `webinar`
- Rounds system: each program can have multiple recurring rounds with independent dates, pricing, capacity, and location
- Sessions within rounds for multi-day courses
- Instructor profiles with computed stats (total students, programs count, views)

### Booking & Payments
- Full payment or installment plans (admin-defined per round)
- Installment request workflow: user submits → admin approves/rejects → 7-day booking window
- Payment Links: admin generates `/pay/:code` links for WhatsApp/social sharing with pre-applied discounts
- Paymob integration for Egyptian market (EGP/USD/EUR)
- Discount codes (percentage or fixed, scoped to programs/categories/consultations)
- Waitlist for full rounds

### Consultation System
- Instructors define consultation types (1:1 or group, 30/60/90 min, price, platform)
- Weekly availability templates + blocked dates
- Auto-generated time slots (30 days ahead via cron)
- Booking flow with Paymob payment → Zoom link delivery
- 24h and 1h reminder emails

### User Portals
- **Student Dashboard** (`/dashboard`): bookings, consultations, payments, installment requests, notifications
- **Instructor Portal** (`/instructor`): availability management, consultation types, bookings, session materials, profile
- **B2B Manager Dashboard** (`/b2b-dashboard`): bulk seat purchasing, employee management, company spend tracking
- **Admin Panel** (`/admin`): full Payload CMS — all collections, reports, lead management, payment link generation

### CRM & Automation
- Twenty CRM sync: contacts created on registration, deals created on booking
- Resend transactional emails: booking confirmation, payment receipts, reminders, consultation confirmations
- Cron jobs: payment reminders (3 days before due), consultation reminders (24h + 1h), slot generation (daily midnight)
- Leads management: import from WhatsApp/social, convert to users

### Internationalization
- Arabic (RTL) as default language
- English as secondary language
- next-intl for routing and translations (`/ar/...`, `/en/...`)
- All user-facing strings in `messages/ar.json` + `messages/en.json`

---

## Target Users

| Persona | Description | Key Need |
|---|---|---|
| Entrepreneur (25-40) | Wants business skills (sales, marketing, leadership) | Installment plans, flexible rounds |
| SME Owner (30-50) | Needs team training | Company profiles, bulk booking (Phase 2) |
| Freelancer/Consultant (22-35) | Upskilling on budget | Early bird pricing, webinars |
| B2B HR Manager | Manages employee training | B2B dashboard, seat assignment |
| Instructor | Delivers training + consultations | Instructor portal, availability management |
| Admin | Manages entire platform | Full Payload CMS access |

---

## Business Model

- Per-transaction payment processing (Paymob)
- No recurring SaaS costs (self-hosted CRM, Payload CMS embedded in Next.js)
- Free tiers: Neon PostgreSQL (always-on), Resend (3,000 emails/month), Vercel hosting
- Twenty CRM on Railway (~$5/month after trial)

---

## Deployment

- **Website:** Vercel (Next.js standalone output)
- **Database:** Neon PostgreSQL (serverless)
- **CRM:** Railway (Twenty CRM)
- **Email:** Resend
- **Payments:** Paymob
- **Domain:** nextacademyedu.com
