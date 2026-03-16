### Session 1 — [2026-03-16]
**الهدف:** إصلاح خطأ 500 في صفحة الأدمن `/admin`
**اللي اتعمل:**
- تحليل الكود: Dockerfile, docker-compose, payload.config.ts, migrations
- اكتشاف السبب: الـ DB فاضية على الـ VPS (مفيش tables)
- استخراج SQL من `src/migrations/20260316_020144.ts`
- رفع الملف على الـ VPS عن طريق SCP وتنفيذه في Docker container
- إنشاء 46 table بنجاح + تسجيل الـ migration
- التأكد من إن صفحة `/admin` بتشتغل (بتظهر شاشة Create first user)
**اللي باقي:**
- إنشاء أول admin user
- التأكد من إن الـ admin panel شغال بالكامل
- إعداد migrations تلقائية في الـ deployment pipeline
**ملاحظات:**
- الـ Coolify مش بيشغل migrations تلقائياً — لازم يتعملوا يدوي
- الـ Postgres container اسمه `nextacademy-db` (ID: `g0wckcksgoo484okg4cg804s`)
- الـ Redis container: `l4s8sgcw0wocc8cg0o4ckcs0`
