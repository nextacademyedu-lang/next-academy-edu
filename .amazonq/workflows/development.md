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
- Follow the Design System tokens defined in `docs/Design System.md`.
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
/* Colors */
--bg-primary: #020504;
--bg-secondary: #0a0f0c;
--bg-card: #111916;
--accent-primary: #00d47e;
--accent-hover: #00b86b;
--text-primary: #f5f5f5;
--text-secondary: #a3a3a3;
--border: #1e2a25;
--error: #ff4444;
--warning: #ffb800;
--success: #00d47e;

/* Typography */
--font-ar: "Cairo", sans-serif;
--font-en: "Inter", sans-serif;

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

Before implementing ANY feature, read the corresponding doc:

- `docs/prd.md` → Requirements.
- `docs/data-flow.md` → Data sources, flows, edge cases.
- `docs/roles-permissions.md` → Who can do what.
- `docs/automations.md` → Notification triggers.
- `docs/certificates.md` → Quiz + certificate logic.
- `docs/platform-features.md` → Search, PWA, Sales, Email, Errors.
- `docs/wireframes/pages/` → UI structure for each page.
