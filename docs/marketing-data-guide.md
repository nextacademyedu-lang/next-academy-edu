# 📋 دليل بيانات الموقع لفريق الماركتينج

> كل البيانات دي بتتضاف من **الأدمن بانل**: `https://www.nextacademyedu.com/admin`

---

## 🔴 أولاً: بيانات لازم تتملأ قبل اللانش (أساسية)

---

### 1. المدربين (Instructors) — `/admin/collections/instructors`

لكل مدرب/speaker محتاج:

| الحقل | الوصف | مطلوب |
|---|---|---|
| `firstName` | الاسم الأول | ✅ |
| `lastName` | الاسم الأخير | ✅ |
| `slug` | رابط فريد (مثال: `ahmed-hassan`) | ✅ |
| `jobTitle` | المسمى الوظيفي (مثال: "خبير تسويق رقمي") | مهم |
| `tagline` | جملة قصيرة تحته (مثال: "١٥ سنة خبرة في التسويق") | مهم |
| `bioAr` | نبذة بالعربي (Rich Text — يدعم bold/links/lists) | مهم |
| `bioEn` | نبذة بالإنجليزي | اختياري |
| `picture` | صورة شخصية احترافية (رفع من Media) | مهم جداً |
| `linkedinUrl` | رابط LinkedIn | اختياري |
| `twitterUrl` | رابط Twitter/X | اختياري |
| `email` | إيميل التواصل | اختياري |
| `featuredOrder` | ترتيب الظهور على الصفحة الرئيسية (1 = الأول) | مهم |
| `isActive` | مفعّل ✅ | تلقائي |

---

### 2. التصنيفات (Categories) — `/admin/collections/categories`

قبل ما تضيف برامج، لازم تعمل تصنيفات:

| الحقل | الوصف | مطلوب |
|---|---|---|
| `nameAr` | اسم التصنيف بالعربي (مثال: "التسويق الرقمي") | ✅ |
| `nameEn` | بالإنجليزي | اختياري |
| `slug` | رابط فريد (مثال: `digital-marketing`) | ✅ |
| `descriptionAr` | وصف قصير | اختياري |
| `icon` | اسم أيقونة | اختياري |
| `order` | ترتيب الظهور | اختياري |

---

### 3. البرامج/الكورسات (Programs) — `/admin/collections/programs`

**هذا الأهم — كل كورس/ورشة/ويبنار:**

| الحقل | الوصف | مطلوب |
|---|---|---|
| `type` | نوع: `workshop` / `course` / `webinar` | ✅ |
| `titleAr` | اسم البرنامج بالعربي | ✅ |
| `titleEn` | بالإنجليزي | اختياري |
| `slug` | رابط فريد (مثال: `digital-marketing-101`) | ✅ |
| `descriptionAr` | وصف كامل بالعربي (Rich Text) | مهم |
| `shortDescriptionAr` | وصف مختصر (للكروت) — جملتين تقريباً | مهم |
| `category` | اختيار تصنيف من القائمة | مهم |
| `instructor` | اختيار المدرب | مهم |
| `thumbnail` | صورة مصغرة (للكروت) — 16:9 أفضل | مهم جداً |
| `coverImage` | صورة غلاف كبيرة (لصفحة البرنامج) | مهم |
| `durationHours` | عدد الساعات الإجمالي | مهم |
| `sessionsCount` | عدد الجلسات | مهم |
| `level` | المستوى: `beginner` / `intermediate` / `advanced` | اختياري |
| `language` | اللغة: `ar` / `en` / `both` | تلقائي `ar` |
| `objectives` | أهداف البرنامج (قائمة — كل هدف كنقطة) | مهم |
| `requirements` | المتطلبات المسبقة | اختياري |
| `targetAudience` | الجمهور المستهدف (قائمة) | مهم |
| `tags` | تاجات (اختيار من Tags) | اختياري |
| `isFeatured` | يظهر في "الأكثر طلباً" على الرئيسية | مهم |
| `seoTitle` | عنوان SEO | اختياري |
| `seoDescription` | وصف SEO | اختياري |

---

### 4. الراوندات (Rounds) — `/admin/collections/rounds`

**كل برنامج لازم يكون عنده راوند واحد على الأقل عشان يظهر:**

| الحقل | الوصف | مطلوب |
|---|---|---|
| `program` | اختيار البرنامج | ✅ |
| `roundNumber` | رقم الراوند (1, 2, 3...) | ✅ |
| `title` | عنوان (مثال: "الدفعة الأولى - مارس ٢٠٢٥") | مهم |
| `startDate` | تاريخ البداية | ✅ |
| `endDate` | تاريخ النهاية | اختياري |
| `locationType` | `online` / `in-person` / `hybrid` | تلقائي `online` |
| `locationName` | اسم المكان (لو in-person) | اختياري |
| `meetingUrl` | لينك Zoom/Meet (لو أونلاين) | اختياري |
| `maxCapacity` | الحد الأقصى للمتدربين | ✅ |
| `price` | السعر | ✅ |
| `earlyBirdPrice` | سعر التسجيل المبكر | اختياري |
| `earlyBirdDeadline` | آخر موعد للسعر المبكر | اختياري |
| `currency` | العملة: `EGP` / `USD` / `EUR` | تلقائي `EGP` |
| `status` | `draft` → `open` لما يكون جاهز للحجز | ✅ |

---

## 🟡 ثانياً: بيانات مهمة بس مش عاجلة

---

### 5. الجلسات (Sessions) — `/admin/collections/sessions`

تفاصيل كل جلسة داخل الراوند:

| الحقل | الوصف |
|---|---|
| `round` | الراوند |
| `sessionNumber` | رقم الجلسة |
| `title` | عنوان الجلسة |
| `date` | التاريخ |
| `startTime` / `endTime` | من الساعة كام لكام |
| `meetingUrl` | لينك الجلسة |

---

### 6. التاجات (Tags) — `/admin/collections/tags`

| الحقل | الوصف |
|---|---|
| `nameAr` | الاسم بالعربي (مثال: "القيادة") |
| `nameEn` | بالإنجليزي |
| `slug` | رابط فريد |
| `type` | `interest` / `skill` / `industry` / `topic` |

---

### 7. أنواع الاستشارات (Consultation Types) — `/admin/collections/consultation-types`

لو المدربين بيقدموا استشارات فردية:

| الحقل | الوصف |
|---|---|
| `instructor` | المدرب |
| `titleAr` | عنوان نوع الاستشارة |
| `durationMinutes` | المدة بالدقائق |
| `price` | السعر |
| `meetingType` | `online` / `in-person` / `both` |

---

### 8. مقالات المدونة (Blog Posts) — `/admin/collections/blog-posts`

| الحقل | الوصف |
|---|---|
| `title` | العنوان |
| `slug` | الرابط |
| `excerpt` | ملخص قصير |
| `content` | المحتوى الكامل (Rich Text) |
| `category` | التصنيف |
| `featuredImage` | صورة مميزة |
| `status` | `draft` → `published` |

---

## 🟢 ثالثاً: بيانات تلقائية (مش محتاج يضيفها الماركتينج)

| البيان | السبب |
|---|---|
| Users | المستخدمين بيسجلوا بنفسهم |
| Bookings | بتتعمل تلقائي عند الحجز |
| Payments | بتتعمل عند الدفع |
| Reviews | المتدربين بيكتبوها بعد الكورس |
| Certificates | بتتعمل تلقائي بعد الانتهاء |
| Notifications | النظام بيبعتها |
| Waitlist / Leads | بتتسجل تلقائي |

---

## 📸 الصور المطلوبة (Media)

رفع الصور من `/admin/collections/media` — الأبعاد المقترحة:

| الاستخدام | الأبعاد المقترحة | الصيغة |
|---|---|---|
| صور المدربين | 400×400 px (مربعة) | JPG/PNG |
| صور البرامج (Thumbnail) | 800×450 px (16:9) | JPG/PNG |
| صور الغلاف (Cover) | 1920×600 px (بانر) | JPG/PNG |
| صور المدونة | 1200×630 px (OG Image) | JPG/PNG |

---

## ✅ ترتيب العمل المقترح

```
1. ارفع صور المدربين على Media
2. أنشئ المدربين (Instructors)
3. أنشئ التصنيفات (Categories)
4. أنشئ التاجات (Tags) — لو محتاج
5. أنشئ البرامج (Programs) — وربطها بالمدرب والتصنيف
6. أنشئ الراوندات (Rounds) — وحط السعر والتاريخ
7. غيّر status الراوند لـ "open" عشان يظهر للحجز
8. (اختياري) أنشئ الجلسات والاستشارات والمقالات
```
