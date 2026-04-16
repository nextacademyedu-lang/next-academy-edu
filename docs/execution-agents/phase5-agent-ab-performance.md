# Phase 5 — Agent A: Redis Caching for High-Read Data

## Your Role
You are a performance engineer. Your task is to implement Redis caching for the most frequently read data to reduce database load.

## Context
- **Framework:** Next.js 15 + Payload CMS 3 + TypeScript
- **Redis:** Already configured — check `src/lib/redis.ts` or `src/lib/rate-limit.ts` for the client
- **ORM:** Drizzle via Payload CMS
- **Current problem:** Every page load hits the database for programs, instructors, and courses — causes high DB load on Neon's connection limit

## Files to Create/Modify

### 1. `[NEW] src/lib/cache.ts` — Redis caching utility

```typescript
// A typed, generic Redis cache with get/set/invalidate
import { redis } from './redis'; // existing redis client

interface CacheOptions {
  ttl?: number; // seconds
  prefix?: string;
}

export async function cacheGet<T>(key: string): Promise<T | null>
export async function cacheSet<T>(key: string, data: T, options?: CacheOptions): Promise<void>
export async function cacheInvalidate(pattern: string): Promise<void>
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T>
```

TTL constants:
```typescript
export const CACHE_TTL = {
  PROGRAMS_LIST: 5 * 60,      // 5 minutes
  PROGRAM_DETAIL: 10 * 60,    // 10 minutes
  INSTRUCTORS_LIST: 10 * 60,  // 10 minutes
  INSTRUCTOR_DETAIL: 15 * 60, // 15 minutes
  HOMEPAGE: 5 * 60,           // 5 minutes
} as const;
```

### 2. Add cache to program listing API
Find and modify the route that serves programs/courses to public:
- Check `src/app/api/programs/` or similar
- Wrap the Payload query with `cacheGetOrSet('programs:list', fetcher, { ttl: CACHE_TTL.PROGRAMS_LIST })`

### 3. Add cache to instructor listing API
Find and modify the route that serves instructor list:
- Wrap with `cacheGetOrSet('instructors:list', fetcher, { ttl: CACHE_TTL.INSTRUCTORS_LIST })`

### 4. Add cache invalidation hooks to collections
In `src/collections/Programs.ts` and `src/collections/Instructors.ts`:
```typescript
hooks: {
  afterChange: [
    async () => {
      await cacheInvalidate('programs:*');
    },
  ],
},
```

## How to Approach This
1. Read these files first:
   - `src/lib/redis.ts` (or wherever Redis is initialized) — use that client, DON'T create a new one
   - `src/lib/rate-limit.ts` — shows how Redis is used currently
   - `src/app/api/` — find the programs and instructors public APIs
   - `src/collections/Programs.ts` — for adding hooks
2. Create the cache utility
3. Wire it into existing APIs
4. Add invalidation hooks

## Acceptance Criteria
- [ ] `src/lib/cache.ts` exports `cacheGet`, `cacheSet`, `cacheInvalidate`, `cacheGetOrSet`
- [ ] Program listing endpoint uses Redis cache with 5-min TTL
- [ ] Instructor listing endpoint uses Redis cache with 10-min TTL
- [ ] Cache is invalidated when programs/instructors are updated in CMS
- [ ] Graceful degradation: if Redis is down, falls back to direct DB query (no crash)
- [ ] `pnpm tsc --noEmit` zero new errors

## Constraints
- Use the EXISTING Redis client — do NOT add `ioredis` or any new Redis package
- Do NOT cache authenticated/user-specific data
- Do NOT modify payment or auth logic
- Cache ONLY public read endpoints (listing + detail pages)

---

# Phase 5 — Agent B: Neon Connection Pool + Production Config

## Your Role
You are a DevOps/infrastructure engineer. Your task is to configure the database connection pool correctly for production, following Neon Postgres best practices.

## Context
- **Database:** PostgreSQL on Neon (serverless)
- **ORM:** Drizzle via Payload CMS 3
- **Current problem:** No explicit connection pool limits, dev-mode schema push might be running in production

## Files to Modify

### 1. `src/payload.config.ts` — Connection pool configuration
Find the `db` configuration (Neon adapter) and add:
```typescript
db: neonAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL,
    max: 10,           // max concurrent connections to Neon
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  push: process.env.NODE_ENV !== 'production', // DISABLE push in production
}),
```

### 2. `.env.example` — Document Neon pooler URL
Add comment explaining that production should use Neon's pooler endpoint:
```
# Production: use Neon pooler URL (ends in -pooler.neon.tech) for better connection handling
# Development: direct connection URL is fine
DATABASE_URL=postgresql://...
```

### 3. `docs/MIGRATIONS.md` — Document migration workflow
Create a short guide:

```markdown
# Database Migration Workflow

## Development
Schema changes are automatically pushed in development (`push: true`).

## Production
1. Make your collection changes in `src/collections/`
2. Run: `pnpm payload migrate:create` to generate migration
3. Review generated migration in `src/migrations/`
4. Deploy — migrations run automatically on startup

## Never
- Never run `push: true` in production
- Never edit migration files manually
- Never delete migration files
```

## Acceptance Criteria
- [ ] `pool: { max: 10 }` set in payload.config.ts
- [ ] `push: process.env.NODE_ENV !== 'production'` in payload.config.ts
- [ ] `.env.example` documents Neon pooler URL
- [ ] `docs/MIGRATIONS.md` exists with migration workflow
- [ ] `pnpm tsc --noEmit` zero new errors

## Constraints
- Do NOT modify any collection files (only payload.config.ts)
- Do NOT touch any email, payment, or auth code
- Check what Neon adapter is currently imported — use same import syntax
