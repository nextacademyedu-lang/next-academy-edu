# 🐛 Next Academy — Error Log

> كل error بيتسجل هنا بالـ root cause والـ fix — عشان منكررش نفس الغلطة.

---

## 📌 Legend

| Icon | المعنى |
|---|---|
| 🔴 | Error خطير |
| 🟡 | Warning / تحذير |
| 🟢 | تم الحل |
| ❌ | المشكلة |
| ✅ | الحل |

---

#

### [2025-07-21 02:30] - 🟢 Payload Admin Panel CSS Not Rendering
**السبب:** الـ root `layout.tsx` كان بيعمل wrap في `<html><body>` وPayload's `RootLayout` كمان بيعمل `<html data-theme><body>`. ده أنتج double-nested `<html>` tags.
**الحل:** خلّينا الـ root `layout.tsx` يرجع `children` مباشرة بدون `<html>/<body>` wrapping.
**ملاحظة:** ده pattern معروف في Payload CMS v3 — كل route group لازم يحط `<html>/<body>` بنفسه.

### [2026-07-20 17:00] - 🟢 pnpm-lock.yaml stale after Next.js downgrade — deployment fail

**السبب:** بعد ما عملنا downgrade لـ `next` من `16.1.6` لـ `15.4.11` في `package.json`، الـ `pnpm-lock.yaml` ماتعملش regenerate — فضل فيه الـ version القديم. الـ Dockerfile بيستخدم `--frozen-lockfile` فالـ build بيفشل.
**الحل:** `pnpm install --no-frozen-lockfile` عشان يعمل regenerate للـ lockfile.
**ملاحظة:** لازم **دايماً** نعمل `pnpm install` بعد أي تعديل على versions في `package.json` — والـ `pnpm-lock.yaml` لازم يتعمل commit معاه.

### [2026-03-16 04:30] - Admin Panel 500 Server Error

**السبب:** قاعدة البيانات PostgreSQL على الـ VPS كانت فاضية تماماً — مفيش أي tables. الـ Payload CMS كان بيحاول يعمل query على `users` table اللي مش موجودة.
**الحل:** تم استخراج الـ SQL من `src/migrations/20260316_020144.ts` وتنفيذه مباشرة في الـ Docker container عن طريق `psql`. اتعملوا 46 table + migration record في `payload_migrations`.
**ملاحظة:** الـ Coolify deployment مش بيشغل migrations تلقائياً. لو حصل deploy جديد والـ DB اتمسحت، لازم يتعمل migration يدوي.

## 🟢 [2026-03-16 02:33] — Schema Push Fails in Standalone Mode (@payload-config alias)

| | |
| --- | --- |
| ❌ **Error** | `relation "users" does not exist` persists in production even after adding `instrumentation.ts` with eager `getPayload()` |
| 🔍 **Root Cause** | `instrumentation.ts` imported `@payload-config` — a TypeScript path alias. In Next.js standalone runtime, TS path aliases are NOT resolved. The import fails silently inside the try/catch, so schema push never runs. |
| ✅ **Fix** | (1) Changed import to relative `./payload.config`. (2) Added retry loop (5×, 3s delay). (3) `process.exit(1)` on total failure so container restarts. |
| 📝 **Note** | **Never use TypeScript path aliases in `instrumentation.ts`** — standalone mode only resolves raw module paths. Always use relative imports for Payload config in runtime hooks. |

---

| | |
|---|---|
| ❌ **Error** | `/admin` returns 500 Server Error. Logs show `Footer.login` missing and `relation "users" does not exist` |
| 🔍 **Root Cause** | Two issues: (1) `Footer.login` i18n key was missing from `ar.json`/`en.json`. (2) Payload `push: true` DB schema sync only runs lazily on first `getPayload()` call, which happens AFTER SSR tries to render the page — so tables don't exist when queries execute. |
| ✅ **Fix** | (1) Added `login` key to Footer namespace in both JSON files. (2) Created `src/instrumentation.ts` that calls `getPayload()` eagerly at server startup, ensuring schema push completes before any requests. (3) Updated Dockerfile to copy `src/messages` to runner stage. |
| 📝 **Note** | In Next.js standalone mode, files outside `.next/standalone` must be explicitly copied in the Dockerfile. The `instrumentation.ts` `register()` hook runs before the server accepts requests, guaranteeing Payload init + schema push complete first. |

---

## 🟢 [2026-03-05 01:34] — 404 on favicon.ico

| | |
|---|---|
| ❌ **Error** | `favicon.ico:1 Failed to load resource: 404 (Not Found)` |
| 🔍 **Root Cause** | Next.js فشل في serve الـ favicon من `src/app` بعد نقل الـ `app/` directory لـ `src/` |
| ✅ **Fix** | نسخ `favicon.ico` لـ `public/` directory — بيتعمل serve statically بدون App Router |

---

## 🟢 [2026-07-18 14:00] — TypeScript Strict Mode Build Failures (7 API Routes)

| | |
|---|---|
| ❌ **Error** | `Type 'number \| null' is not assignable to type 'number'` / `Type 'string' is not assignable to type '"pending" \| "approved"'` / `typeof X === 'string'` not matching `number \| User` |
| 🔍 **Root Cause** | Payload CMS generated types use nullable fields (`number \| null`) and relation IDs are `number \| User`, not `string \| User`. Also `Record<K, string>` loses enum literal types. |
| ✅ **Fix** | Use `?? 0` for nullable numbers, `typeof x === 'object'` for relation narrowing, `as const` for enum maps, and `as Record<string, unknown>` for JSON casts |
| 📝 **Note** | Always check Payload's generated types in `src/payload-types.ts` before assuming field types. Relations use numeric IDs. |

---

## 🟢 [2025-07-18 23:30] — Docker Healthcheck Failure on Coolify

| | |
| --- | --- |
| ❌ **Error** | `Health check failed: dial tcp [::1]:3001: connect: connection refused` — container starts then gets killed |
| 🔍 **Root Cause** | `node:22-alpine` لا يحتوي على `wget`. الـ HEALTHCHECK كان `wget -qO- http://localhost:3001/api/health` فكان بيفشل دايماً. كمان `/api/health` endpoint مكانش موجود. |
| ✅ **Fix** | (1) استبدال `wget` بـ `node -e` inline HTTP GET. (2) إنشاء `src/app/api/health/route.ts`. (3) زيادة `--start-period` لـ 30s. |
| 📝 **Note** | في Alpine images، دايماً استخدم `node -e` أو install `curl` صريح. لا تعتمد على `wget`. |

---

## 🟢 [2025-07-18 23:45] — docker-compose.yml Healthcheck Still Using wget

| | |
| --- | --- |
| ❌ **Error** | Coolify deployment healthcheck keeps failing with `connection refused` despite Dockerfile fix |
| 🔍 **Root Cause** | `docker-compose.yml` line 55 still had `wget -qO-` — Coolify uses compose file which overrides the Dockerfile `HEALTHCHECK`. |
| ✅ **Fix** | Replaced `wget` with `node -e` inline HTTP GET in `docker-compose.yml`. Added `start_period: 30s`. |
| 📝 **Note** | عند إصلاح healthcheck، لازم تصلح **الاتنين**: `Dockerfile` و `docker-compose.yml`. Compose overrides Dockerfile HEALTHCHECK. |

---
