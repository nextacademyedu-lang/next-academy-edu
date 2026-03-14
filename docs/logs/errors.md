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
