# Next Academy — Technology Stack

## Core Languages & Runtimes

| Technology | Version | Role |
|---|---|---|
| TypeScript | ^5 | Primary language, `strict: true` |
| Node.js | 20+ (via fnm) | Runtime |
| React | 19.2.3 | UI framework |
| Next.js | 16.1.6 | Full-stack framework (App Router) |

---

## Framework & CMS

### Next.js 16 (App Router)
- `output: 'standalone'` for Docker deployment
- Server Components by default, `'use client'` only when needed
- Route groups for portal isolation: `(auth)`, `(dashboard)`, `(instructor)`, `(b2b)`, `(checkout)`
- `generateMetadata()` for SEO on all public pages
- `loading.tsx` + `error.tsx` in every route group

### Payload CMS 3.79
- Embedded inside Next.js (no separate server)
- PostgreSQL adapter (`@payloadcms/db-postgres`)
- Lexical rich text editor (`@payloadcms/richtext-lexical`)
- Admin panel at `/admin`
- TypeScript types auto-generated to `src/payload-types.ts`
- Import map auto-generated via `payload generate:importmap`

---

## Database & Caching

### PostgreSQL 16
- Production: Neon (serverless, always-on free tier)
- Local dev: Docker (`postgres:16-alpine`)
- Connection via `DATABASE_URI` env var (connection string)

### Redis 7
- Local dev: Docker (`redis:7-alpine`) with password auth + AOF persistence
- Used for: rate limiting (`ioredis` ^5.10.0)
- Production: Redis instance (Railway or managed)

---

## Key Dependencies

### Production
| Package | Version | Purpose |
|---|---|---|
| `next-intl` | ^4.8.3 | i18n routing + translations |
| `@payloadcms/db-postgres` | ^3.79.0 | Payload PostgreSQL adapter |
| `@payloadcms/richtext-lexical` | ^3.79.0 | Rich text editor |
| `@payloadcms/ui` | ^3.79.0 | Payload admin UI components |
| `resend` | ^6.9.3 | Transactional email |
| `ioredis` | ^5.10.0 | Redis client for rate limiting |
| `lucide-react` | ^0.577.0 | Icon library |
| `framer-motion` | ^12.35.0 | Animations |
| `gsap` | ^3.14.2 | Advanced animations |
| `embla-carousel-react` | ^8.6.0 | Carousel component |
| `graphql` | ^16.13.1 | GraphQL (Twenty CRM API) |

### Dev Dependencies
| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^5 | Type checking |
| `tsx` | ^4.21.0 | TypeScript execution for scripts |
| `@types/node` | ^20 | Node.js types |
| `@types/react` | ^19 | React types |

---

## TypeScript Configuration

```json
{
  "strict": true,
  "target": "ES2017",
  "module": "esnext",
  "moduleResolution": "bundler",
  "allowImportingTsExtensions": true,
  "paths": {
    "@/*": ["./src/*"],
    "@payload-config": ["./src/payload.config.ts"]
  }
}
```

Key rules enforced by `strict: true`:
- No implicit `any`
- Strict null checks
- No unused locals/parameters

---

## External Services

| Service | Purpose | Integration |
|---|---|---|
| Paymob | Payment processing (Egypt) | REST API via `src/lib/payment-api.ts` |
| Resend | Transactional email | SDK via inline adapter in `payload.config.ts` |
| Twenty CRM | CRM sync | GraphQL/REST API |
| Neon | PostgreSQL hosting | Connection string |
| Vercel | Website hosting | `output: 'standalone'` |
| Railway | Twenty CRM hosting | Docker |
| Cloudinary | Media CDN (optional) | `remotePatterns` in next.config.ts |

---

## Development Commands

```bash
# Install dependencies (pnpm)
pnpm install

# Start development server
pnpm dev

# Build for production (generates import map first)
pnpm build

# Start production server
pnpm start

# Regenerate Payload import map only
pnpm generate:importmap
```

---

## Docker / Production Deployment

### Local Docker Stack
```bash
# Start all services (postgres, redis, app, nginx)
docker compose up -d

# SSL setup (run once)
docker compose --profile ssl run certbot certonly --webroot ...
```

Services in `docker-compose.yml`:
- `postgres` — PostgreSQL 16 Alpine with health check
- `redis` — Redis 7 Alpine with AOF persistence + password
- `app` — Next.js standalone build
- `nginx` — Reverse proxy with SSL termination
- `certbot` — Let's Encrypt SSL (manual profile)

### Environment Variables (Required)
```
DATABASE_URI          # PostgreSQL connection string
PAYLOAD_SECRET        # Payload CMS secret key
RESEND_API_KEY        # Resend email API key
RESEND_FROM_EMAIL     # Sender address (format: "Name <email>")
NEXT_PUBLIC_APP_URL   # Public URL of the app
REDIS_PASSWORD        # Redis auth password
DB_USER / DB_PASSWORD / DB_NAME  # Docker postgres vars
```

---

## Path Aliases

| Alias | Resolves To |
|---|---|
| `@/*` | `./src/*` |
| `@payload-config` | `./src/payload.config.ts` |

---

## Package Manager

pnpm (lockfile: `pnpm-lock.yaml`)
Node version managed via `fnm` (`fnm-run.bat` for Windows)
