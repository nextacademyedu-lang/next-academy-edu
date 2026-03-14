# Next Academy — Project Structure

## Directory Overview

```
nextacademy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (payload)/          # Payload CMS admin routes (auto-generated)
│   │   ├── [locale]/           # All user-facing pages under locale prefix
│   │   │   ├── (auth)/         # Route group: login, register, onboarding, verify-email
│   │   │   ├── (b2b)/          # Route group: B2B manager dashboard
│   │   │   ├── (checkout)/     # Route group: checkout flow + success/failed/pending
│   │   │   ├── (dashboard)/    # Route group: student dashboard
│   │   │   ├── (instructor)/   # Route group: instructor portal
│   │   │   ├── about/          # Public marketing pages
│   │   │   ├── blog/
│   │   │   ├── contact/
│   │   │   ├── instructors/[slug]/
│   │   │   ├── programs/[slug]/
│   │   │   ├── privacy/ terms/ refund-policy/
│   │   │   ├── layout.tsx      # Root locale layout (navbar + footer)
│   │   │   ├── error.tsx       # Root error boundary
│   │   │   └── page.tsx        # Homepage
│   │   ├── api/                # Next.js API routes
│   │   ├── globals.css         # Global styles
│   │   └── importMap.js        # Payload import map (auto-generated)
│   │
│   ├── collections/            # Payload CMS collection definitions (27 collections)
│   ├── components/             # Shared React components
│   │   ├── auth/               # Auth layout components
│   │   ├── b2b/                # B2B dashboard layout
│   │   ├── dashboard/          # Student dashboard layout
│   │   ├── instructor/         # Instructor portal layout
│   │   ├── layout/             # Navbar, footer, sidebar
│   │   ├── onboarding/         # 3-step onboarding wizard components
│   │   ├── sections/           # Homepage sections (hero, featured, stats, etc.)
│   │   └── ui/                 # Primitive UI components (button, card, input, badge)
│   │
│   ├── context/
│   │   └── auth-context.tsx    # React context for auth state
│   ├── i18n/
│   │   ├── routing.ts          # next-intl locale routing config
│   │   └── request.ts          # next-intl server request config
│   ├── lib/                    # Shared utilities and API helpers
│   │   ├── access-control.ts   # Payload access control helpers (isAdmin, isOwner, etc.)
│   │   ├── auth-api.ts         # Auth-related API calls
│   │   ├── b2b-api.ts          # B2B API calls
│   │   ├── dashboard-api.ts    # Dashboard data fetching
│   │   ├── instructor-api.ts   # Instructor portal API calls
│   │   ├── payment-api.ts      # Paymob payment integration
│   │   ├── rate-limit.ts       # Redis-based rate limiting
│   │   └── resend-email-adapter.ts  # Resend email adapter
│   ├── messages/
│   │   ├── ar.json             # Arabic translations (default)
│   │   └── en.json             # English translations
│   └── payload.config.ts       # Payload CMS configuration
│
├── docs/                       # Project documentation
│   ├── architecture/           # PRD, roles-permissions, data-flow, sitemap
│   ├── business/               # Company info, B2B programs
│   ├── design/                 # Design system, i18n, accessibility, performance
│   ├── engineering/            # API contracts, deployment, env vars, error handling
│   ├── features/               # Feature specs (payments, consultations, certs, etc.)
│   ├── logs/                   # changelog, tasks, errors, plan, sessions
│   ├── security/               # Security, rate-limiting, data-privacy docs
│   └── wireframes/pages/       # Page wireframes
│
├── .amazonq/rules/             # Amazon Q rules and memory bank
├── .agents/                    # Agent workflows and rules
├── nginx/nginx.conf            # Nginx reverse proxy config
├── scripts/                    # SQL seed scripts
├── docker-compose.yml          # Docker compose for local dev
├── Dockerfile                  # Production Docker image
├── next.config.ts              # Next.js config (withPayload + withNextIntl)
├── tsconfig.json               # TypeScript strict config
└── package.json
```

---

## Core Components & Relationships

### Route Groups (Next.js App Router)
Each portal has its own route group with `layout.tsx`, `error.tsx`, and `loading.tsx`:

| Route Group | Path | Layout Component |
|---|---|---|
| `(auth)` | `/[locale]/(auth)/` | `AnimatedAuthLayout` |
| `(dashboard)` | `/[locale]/(dashboard)/dashboard/` | `DashboardLayout` |
| `(instructor)` | `/[locale]/(instructor)/instructor/` | `InstructorLayout` |
| `(b2b)` | `/[locale]/(b2b)/b2b-dashboard/` | `B2BLayout` |
| `(checkout)` | `/[locale]/(checkout)/checkout/` | Minimal layout |
| `(payload)` | `/admin/` | Payload CMS admin UI |

### Collections Architecture (27 Payload Collections)
```
Users ──────────────────────────────────────────────────────────────────┐
  └── UserProfiles (1:1)                                                 │
  └── Companies (via UserProfiles)                                       │
                                                                         │
Programs ──────────────────────────────────────────────────────────────  │
  └── Rounds (1:N)                                                       │
        ├── Sessions (1:N)                                               │
        ├── PaymentPlans (1:N) → installments (embedded)                 │
        └── Bookings (1:N) ──────────────────────────────────── Users ──┘
              └── Payments (1:N)

Instructors ────────────────────────────────────────────────────────────
  ├── ConsultationTypes (1:N)
  ├── ConsultationAvailability (1:N)
  ├── InstructorBlockedDates (1:N)
  └── ConsultationSlots (1:N) → ConsultationBookings

Categories → Programs
Tags ↔ Programs (many-to-many via Payload relationship fields)
Leads → Users (conversion)
Notifications → Users
PaymentLinks → Rounds
InstallmentRequests → Users + Rounds + PaymentPlans
DiscountCodes (scoped to programs/categories/consultations)
VerificationCodes → Users
Waitlist → Rounds + Users
Reviews → Programs + Users
Certificates → Users + Programs
```

### Access Control Layer
All access control flows through `src/lib/access-control.ts` helpers:
- `isPublic` — no auth required
- `isAuthenticated` — any logged-in user
- `isAdmin` — admin role only
- `isAdminOrInstructor` — admin or instructor
- `isAdminOrOwner` — admin or record owner (returns Payload query constraint)
- `isAdminOrOwnerByField(fieldName)` — owner check on custom field
- `isAdminOrOwnInstructor` — instructor sees only own records
- `isAdminOrB2BManager` — admin or b2b_manager role
- `adminOnlyField` — field-level access for admin-only fields

### i18n Architecture
- next-intl handles locale routing: `/ar/...` (default) and `/en/...`
- `src/i18n/routing.ts` defines locales and default locale
- `src/i18n/request.ts` provides server-side locale resolution
- All translations in `src/messages/ar.json` and `src/messages/en.json`
- `useTranslations()` in Client Components, `getTranslations()` in Server Components

---

## Architectural Patterns

### Server-First Rendering
- Pages are Server Components by default
- `'use client'` only for interactive components needing hooks/event handlers
- Data fetching via lib API functions called directly in Server Components

### CSS Modules (Component-Scoped)
- Every component with styles has a co-located `.module.css` file
- Dark theme as default
- Mobile-first: `@media (min-width: ...)` only

### Payload CMS Integration
- Payload runs embedded inside Next.js (no separate server)
- `withPayload()` wraps Next.js config
- Collections defined in `src/collections/` as TypeScript files
- Admin panel at `/admin` (Payload's built-in UI)
- `payload.config.ts` registers all 27 collections

### Security Headers
Defined in `next.config.ts` — applied globally:
- `X-Frame-Options: DENY`
- `Content-Security-Policy` (restricts to self + Paymob + Google Fonts)
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
