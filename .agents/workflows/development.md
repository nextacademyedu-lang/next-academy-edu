---
description: Next Academy development workflow and project rules
---

// turbo-all

# Next Academy — Development Rules & Conventions

## Tech Stack (Mandatory)

- **Framework:** Next.js 15 (App Router with Server Components)
- **CMS:** Payload CMS 3.0 (embedded inside Next.js — NOT standalone)
- **Database:** PostgreSQL (Neon for production, Docker locally)
- **ORM:** Drizzle ORM (via Payload CMS adapter)
- **Language:** TypeScript (strict mode, no `any`)
- **Styling:** Vanilla CSS + CSS Modules (NO TailwindCSS unless user explicitly asks)
- **Package Manager:** pnpm (NOT npm or yarn)
- **Email:** Resend API
- **WhatsApp:** Evolution API
- **Payments:** Paymob
- **CRM Sync:** Twenty CRM (REST/GraphQL API)
- **Video Hosting:** Bunny.net Stream / Cloudflare Stream
- **Calendar:** Google Calendar API + Google Meet API
- **i18n:** next-intl (Arabic RTL default, English LTR)
- **PWA:** next-pwa

## Project Structure

```
nextacademy/
├── .agents/workflows/          # Agent rules
├── docs/                       # Planning & architecture docs
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public)/           # Public pages (home, programs, instructors, blog)
│   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   ├── (onboarding)/       # Multi-step onboarding
│   │   ├── (dashboard)/        # User dashboard (protected)
│   │   ├── (instructor)/       # Instructor portal (protected)
│   │   ├── (b2b)/              # B2B manager dashboard (protected)
│   │   ├── (checkout)/         # Booking & payment flows
│   │   ├── (admin)/            # Payload CMS admin panel
│   │   ├── api/                # API Routes (webhooks, crons, etc.)
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles + design tokens
│   ├── components/
│   │   ├── ui/                 # Atoms: Button, Input, Card, Badge, etc.
│   │   ├── layout/             # Navbar, Footer, Sidebar, MobileNav
│   │   ├── forms/              # Form components (Login, Booking, etc.)
│   │   ├── sections/           # Page sections (Hero, Features, etc.)
│   │   └── shared/             # Reusable composites (ProgramCard, etc.)
│   ├── collections/            # Payload CMS collection definitions
│   ├── lib/                    # Utilities, helpers, API clients
│   │   ├── resend.ts           # Email client
│   │   ├── evolution.ts        # WhatsApp client
│   │   ├── paymob.ts           # Payment client
│   │   ├── google-calendar.ts  # Calendar/Meet client
│   │   └── utils.ts            # General helpers
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── messages/               # i18n JSON files (ar.json, en.json)
│   └── payload.config.ts       # Payload CMS configuration
├── public/                     # Static assets (images, fonts, icons)
├── docker-compose.yml          # Local PostgreSQL
├── .env.local                  # Environment variables
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

## Code Style Rules

### TypeScript

- Always use `strict: true` in tsconfig.
- NEVER use `any`. Use `unknown` and narrow with type guards.
- All components must have typed props interfaces.
- Use `const` by default, `let` only when mutation is needed.
- Export types separately: `export type { MyType }`.

### React / Next.js

- Use Server Components by default. Add `'use client'` only when needed (hooks, event handlers).
- Use `loading.tsx` and `error.tsx` for each route group.
- Use `generateMetadata()` for SEO on every page.
- Use `next/image` for all images (never raw `<img>`).
- Use `next/link` for all internal navigation.

### CSS

- Use CSS Modules (`.module.css`) for component-scoped styles.
- Use CSS Custom Properties (variables) for design tokens in `globals.css`.
- Follow the Design System tokens defined in `docs/design/design-system.md`.
- Dark theme is the DEFAULT. Light theme is secondary.

### Naming Conventions

- **Files:** kebab-case (`program-card.tsx`, `program-card.module.css`).
- **Components:** PascalCase (`ProgramCard`).
- **Hooks:** camelCase with `use` prefix (`useBookings`).
- **API Routes:** kebab-case (`/api/send-reminder`).
- **Collections (Payload):** PascalCase (`InstallmentPlans`).
- **Database fields:** snake_case (`created_at`, `whatsapp_group_link`).

### Git Conventions

- Branch naming: `feature/`, `fix/`, `refactor/`, `docs/`.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Always create a branch, never commit directly to `main`.

## Design System Quick Reference

```css
/* Colors — Corporate Dark Mode (Almentor Reference) */
--bg-primary: #020504;
--bg-main: #020504;
--bg-secondary: #111111;
--bg-card: #111111;
--bg-surface: #111111;
--bg-surface-hover: #1a1a1a;

--accent-primary: #C51B1B;   /* Brand Red — Primary CTAs */
--accent-hover: #a01515;
--accent-gold: #D6A32B;      /* Brand Gold — Highlights/Premium */

--text-primary: #F1F6F1;
--text-secondary: #C5C5C5;
--text-muted: #888888;

--border: rgba(197, 197, 197, 0.2);
--border-subtle: rgba(197, 197, 197, 0.2);

--error: #C51B1B;
--warning: #D6A32B;
--success: #00D47E;

/* Typography */
--font-ar: "Cairo", sans-serif;               /* Arabic body */
--font-en: "Montserrat", sans-serif;           /* English body */
--font-heading-en: "Cinzel", serif;            /* English headings */
--font-heading-ar: "Cairo", sans-serif;        /* Arabic headings (weight 900) */

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;

/* Border Radius */
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;
```

## Security Rules

- NEVER expose API keys in frontend code.
- All API routes must validate authentication before processing.
- Use `httpOnly` cookies for session tokens.
- Sanitize all user inputs before database operations.
- All dates stored as UTC in PostgreSQL.
- Use Signed URLs for video content (expire in 2 hours).
- Role-based access: check `user.role` on every protected route.

## Testing

- Write tests for critical flows: auth, booking, payments, installments.
- Use Playwright for E2E tests.
- Use Jest/Vitest for unit tests.

## Documentation Reference

Before implementing ANY feature, run `/build-checklist` and read the corresponding doc:

- `docs/architecture/prd.md` → Requirements & database schema.
- `docs/architecture/data-flow.md` → Data sources, flows, edge cases.
- `docs/architecture/roles-permissions.md` → Who can do what.
- `docs/architecture/sitemap.md` → All 56 pages.
- `docs/design/design-system.md` → Colors, fonts, spacing, components.
- `docs/design/i18n.md` → Arabic/English, RTL rules.
- `docs/features/automations.md` → Notification triggers.
- `docs/features/certificates.md` → Quiz + certificate logic.
- `docs/features/payment-scenarios.md` → Payment flows, failures, refunds.
- `docs/features/platform-features.md` → Search, PWA, Sales, Email, Errors.
- `docs/engineering/api-contracts.md` → All API endpoints spec.
- `docs/engineering/code-audit.md` → Current code gaps & fixes needed.
- `docs/security/security.md` → Auth, IDOR, XSS, CSRF.
- `docs/wireframes/pages/` → UI structure for each page.
