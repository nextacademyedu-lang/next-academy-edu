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
