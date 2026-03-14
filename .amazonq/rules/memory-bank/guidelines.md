# Next Academy — Development Guidelines

## Code Quality Standards

### TypeScript
- `strict: true` is enforced — no `any` type, ever. Use `unknown` + type guards.
- All component props must have explicit typed interfaces extending appropriate HTML element types when relevant:
  ```tsx
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }
  ```
- Export types separately: `export type { MyType }`
- Import `.ts` extensions explicitly in collection files (Payload requirement):
  ```ts
  import { isAdmin } from '../lib/access-control.ts';
  ```

### Naming Conventions
| Type | Convention | Example |
|---|---|---|
| Components | `PascalCase.tsx` | `DashboardLayout.tsx` |
| Styles | `kebab-case.module.css` | `dashboard.module.css` |
| API Routes | `kebab-case/route.ts` | `send-reminder/route.ts` |
| Collections | `PascalCase.ts` | `PaymentPlans.ts` |
| Hooks | `camelCase` with `use` prefix | `useBookings.ts` |
| Lib utilities | `kebab-case.ts` | `access-control.ts` |
| Collection fields | `camelCase` | `titleAr`, `isFeatured`, `viewCount` |
| Collection slugs | `kebab-case` | `'payment-plans'`, `'consultation-types'` |

---

## React / Next.js Patterns

### Server Components by Default
- Every page and layout is a Server Component unless it needs hooks or event handlers.
- Add `'use client'` only at the leaf component level, not at layout level.
- Route group layouts are thin wrappers that delegate to a named layout component:
  ```tsx
  // app/[locale]/(dashboard)/layout.tsx
  import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
  
  export default function DashboardGroupBoundary({ children }: { children: React.ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  ```

### Route Group Structure (Mandatory)
Every route group MUST have all three files:
```
(group)/
  layout.tsx    ← wraps portal layout component
  error.tsx     ← error boundary
  loading.tsx   ← loading skeleton
```

### Metadata
Every public page must export `generateMetadata()` or a static `metadata` object:
```tsx
export const metadata: Metadata = {
  title: 'Dashboard - Next Academy',
  description: 'Manage your learning progress and bookings.',
};
```

### Navigation & Images
- Always use `next/link` (or the locale-aware `Link` from `@/i18n/routing`) for internal navigation.
- Always use `next/image` for images.
- Never use `<a>` for internal links or `<img>` tags.

---

## Payload CMS Collection Patterns

### Collection Definition Structure
```ts
import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  admin: { useAsTitle: 'titleAr' },  // or 'email', 'name', etc.
  access: {
    read: isPublic,       // or isAuthenticated, isAdmin, isAdminOrOwner
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // ... fields
  ],
};
```

### Access Control (MANDATORY for every collection)
All access control uses helpers from `src/lib/access-control.ts`. Never inline access logic:

```ts
// ✅ Correct
import { isAdmin, isAdminOrOwner } from '../lib/access-control.ts';
access: { read: isAdminOrOwner, create: isAuthenticated, update: isAdminOrOwner, delete: isAdmin }

// ❌ Wrong — never inline
access: { read: ({ req: { user } }) => user?.role === 'admin' }
```

Available helpers:
- `isPublic` — no auth (public catalog pages)
- `isAuthenticated` — any logged-in user
- `isAdmin` — admin role only
- `isAdminOrInstructor` — admin or instructor
- `isAdminOrOwner` — admin or record owner (returns Payload query constraint for filtering)
- `isAdminOrOwnerByField(fieldName)` — owner check on a custom field name
- `isAdminOrOwnInstructor` — instructor sees only own records (matches via `instructor` relationship)
- `isAdminOrB2BManager` — admin or b2b_manager
- `adminOnlyField` — field-level access (FieldAccess type)

### Field Patterns
```ts
// Bilingual text fields — always pair Ar + En
{ name: 'titleAr', type: 'text', required: true },
{ name: 'titleEn', type: 'text' },

// Select with label/value objects (for display labels)
{ name: 'type', type: 'select', options: [
  { label: 'Workshop', value: 'workshop' },
  { label: 'Course', value: 'course' },
]}

// Select with string array (simple enums)
{ name: 'level', type: 'select', options: ['beginner', 'intermediate', 'advanced'] }

// Relationship
{ name: 'instructor', type: 'relationship', relationTo: 'instructors' }
{ name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true }

// Upload (media)
{ name: 'thumbnail', type: 'upload', relationTo: 'media' }

// Array of items
{ name: 'objectives', type: 'array', fields: [{ name: 'item', type: 'text' }] }

// Read-only computed/synced fields
{ name: 'viewCount', type: 'number', defaultValue: 0, admin: { readOnly: true } }
{ name: 'twentyCrmContactId', type: 'text', admin: { readOnly: true } }

// Field-level access restriction
{
  name: 'role',
  type: 'select',
  access: { update: ({ req: { user } }) => Boolean(user && user.role === 'admin') },
}
```

### Collection Registration
All collections must be imported and registered in `src/payload.config.ts`. Never leave a collection defined but unregistered.

---

## i18n Patterns

### Routing Setup
```ts
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',  // Arabic is ALWAYS the default
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

### Using Translations
```tsx
// Server Component
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('namespace');

// Client Component
import { useTranslations } from 'next-intl';
const t = useTranslations('namespace');
```

- Never hardcode user-facing text in components — always use `t('key')`.
- All keys must exist in both `src/messages/ar.json` AND `src/messages/en.json`.
- Use the locale-aware `Link` from `@/i18n/routing` (not `next/link`) for internal navigation to preserve locale prefix.

---

## CSS / Styling Patterns

### CSS Modules (Always)
Every component with styles has a co-located `.module.css` file:
```
button.tsx
button.module.css
```

### Class Name Composition
```tsx
// Pattern used in Button component — filter + join
const cn = [
  styles.btn,
  styles[`btn-${variant}`],
  styles[`btn-${size}`],
  fullWidth ? styles.fullWidth : '',
  className
].filter(Boolean).join(' ');
```

### Mobile-First (Non-Negotiable)
```css
/* ✅ Correct — mobile first */
.container { padding: 1rem; }
@media (min-width: 768px) { .container { padding: 2rem; } }

/* ❌ Wrong — desktop first */
.container { padding: 2rem; }
@media (max-width: 768px) { .container { padding: 1rem; } }
```

- Touch targets minimum 44×44px
- No horizontal scroll on mobile
- Bottom nav for dashboards on mobile/tablet (not sidebar)
- Dark theme is the default

---

## Security Patterns

### Environment Variables
```ts
// ✅ Correct — throw on missing required vars
if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI environment variable is required');

// ❌ Wrong — never use fallback secrets
const secret = process.env.PAYLOAD_SECRET || 'fallback-secret';
```

### API Routes
Every API route must have:
1. Server-side role verification before any operation
2. try/catch with proper HTTP status codes
3. Input sanitization before database operations

```ts
// Pattern for protected API routes
export async function POST(req: Request) {
  try {
    const { user } = await getPayloadUser(req);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ... operation
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Content Security Policy
Defined globally in `next.config.ts`. When adding new external services, update the CSP headers there — never bypass them.

---

## Payload Import Map

The files `src/app/(payload)/admin/importMap.js` and `src/app/importMap.js` are **auto-generated by Payload**. Never edit them manually. Regenerate with:
```bash
pnpm generate:importmap
# or as part of build:
pnpm build  # runs payload generate:importmap first
```

---

## Implementation Order (Mandatory for Every Feature)

```
1. Collection schema (fields, types, enums matching PRD exactly)
2. Access control rules (using helpers from access-control.ts)
3. Hooks (beforeChange, afterChange)
4. Input validation
5. API route (if custom endpoint needed)
6. Server-side data fetching (page.tsx)
7. UI components + CSS Modules
8. i18n strings (ar.json + en.json)
9. error.tsx + loading.tsx
10. Tests
```

---

## Semantic Patterns

### Bilingual Field Naming
All content fields that need translation follow the `fieldNameAr` / `fieldNameEn` pattern:
- `titleAr` / `titleEn`
- `descriptionAr` / `descriptionEn`
- `shortDescriptionAr` / `shortDescriptionEn`
- `bioAr` / `bioEn`

### Boolean Flag Naming
Active/feature flags use `is` prefix with camelCase:
- `isActive`, `isFeatured`, `isActive`, `newsletterOptIn`, `emailVerified`

### Computed/Synced Fields
Fields populated by hooks or external systems use `admin: { readOnly: true }`:
- `viewCount`, `averageRating`, `reviewCount`, `twentyCrmContactId`, `lastLogin`

### Status Enums
Status fields follow consistent patterns across collections:
- Bookings: `pending / confirmed / cancelled / completed / refunded / payment_failed`
- Payments: `pending / paid / overdue / failed / refunded`
- Rounds: `draft / upcoming / open / full / in_progress / cancelled / completed`
- Consultation bookings: `pending / confirmed / completed / cancelled / no_show`
- Leads: `new / contacted / qualified / nurturing / converted / lost`

### Path Alias Usage
Always use `@/` alias for imports from `src/`:
```ts
import { isAdmin } from '@/lib/access-control';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
```
Exception: within `src/collections/`, use relative imports with `.ts` extension (Payload requirement).

---

## Logs Maintenance (Required)

Update these files every 5-10 tool calls:
- `docs/logs/changelog.md` — after every significant change
- `docs/logs/tasks.md` — when starting `[/]` or finishing `[x]` a task
- `docs/logs/errors.md` — when encountering and solving an error
- `docs/logs/plan.md` — when making and tracking a plan
- `docs/logs/sessions/` — full summary after every chat session
