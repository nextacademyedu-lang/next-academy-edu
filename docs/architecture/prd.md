# Next Academy — Product Requirements Document (PRD)
**Version:** 3.0 Final  
**Date:** March 4, 2026  
**Project:** Next Academy Platform Refactoring

---

## Executive Summary

Next Academy هي منصة تعليمية B2B تقدم ورش عمل، كورسات، وويبينارات لرواد الأعمال وأصحاب المشاريع والشركات. المنصة تحتاج refactoring كامل مع إضافة نظام CRM متكامل، booking system مع تقسيط، user dashboard، وadmin panel احترافي.

**الهدف الأساسي:** بناء منصة موحدة تدمج الموقع العام، نظام الحجوزات، إدارة العملاء، وإرسال الإيميلات في تجربة سلسة بدون تكاليف اشتراكات شهرية.

---

## Business Goals

### 1. زيادة الحجوزات
- تسهيل عملية الحجز من 5 خطوات لـ 3 خطوات
- إضافة خيار التقسيط لزيادة conversion rate بنسبة 40%+
- عرض الـ rounds المتاحة بوضوح لكل برنامج

### 2. تحسين إدارة العملاء
- دمج leads من واتس اب، سوشيال ميديا، والموقع في CRM واحد
- تتبع lifecycle كل عميل من lead لـ repeat customer
- segmentation للعملاء حسب الاهتمامات والمجال

### 3. أتمتة العمليات
- إيميلات تأكيد الحجز تلقائية
- تذكيرات الدفع للأقساط
- إشعارات قبل بدء الـ sessions
- sync تلقائي بين الموقع والـ CRM

### 4. Zero Operational Cost
- استخدام free tiers فقط في البداية
- self-hosted CRM بدون اشتراكات
- scalable architecture يكبر مع النمو

---

## Target Users

### Persona 1: رائد الأعمال
- **العمر:** 25-40 سنة
- **الاحتياج:** تطوير مهارات البيزنس (مبيعات، تسويق، قيادة)
- **Pain Points:** الأسعار عالية، مواعيد غير مرنة، صعوبة الدفع دفعة واحدة
- **الحل:** تقسيط، rounds متعددة، محتوى عملي

### Persona 2: صاحب شركة صغيرة/متوسطة
- **العمر:** 30-50 سنة
- **الاحتياج:** تدريب الفريق، حل مشاكل محددة
- **Pain Points:** عدم وجود خصومات للشركات، صعوبة تتبع موظفين متعددين
- **الحل:** company profiles، bulk booking (مستقبلاً)

### Persona 3: Freelancer / Consultant
- **العمر:** 22-35 سنة
- **الاحتياج:** upskilling، networking
- **Pain Points:** ميزانية محدودة
- **الحل:** early bird pricing، تقسيط، webinars مجانية

---

## System Architecture

### Tech Stack

| الطبقة | الأداة | السبب |
|---|---|---|
| **Frontend + Backend** | Next.js 15 (App Router) | SSR للـ SEO، Server Actions، API Routes |
| **CMS + Admin Panel** | Payload CMS 3.0 | يتنصب جوا Next.js، admin panel جاهز، TypeScript native |
| **Database** | PostgreSQL (Neon) | Free tier دائم، مفيش auto-pause، serverless-friendly |
| **CRM** | Twenty CRM | Open source، TypeScript + NestJS، REST + GraphQL API |
| **Transactional Email** | Resend | 3,000 email/شهر مجاناً، integration سهل مع Next.js |
| **Payments** | Paymob | للسوق المصري، عمولة على المعاملات فقط |
| **Hosting (Website)** | Vercel | Zero config مع Next.js، free tier سخي |
| **Hosting (CRM)** | Railway | $5/شهر بعد 30 يوم trial، one-click deploy |

### الـ Deployment Architecture

```
nextacademyedu.com (Vercel)
└── Next.js 15 + Payload CMS
        ├── Public Website
        ├── User Dashboard
        ├── Instructor Portal ⭐ NEW
        ├── Admin Panel
        └── API Routes
        
        ↕ (Neon PostgreSQL)

crm.nextacademyedu.com (Railway)
└── Twenty CRM
        ├── Contacts Management
        ├── Leads Tracking
        ├── Companies
        └── GraphQL API
        
        ↕ (PostgreSQL + Redis on Railway)
```

**Sync Flow:**
```
User registers → Next.js creates user → API call → Twenty CRM creates contact
Lead from WhatsApp → Admin adds in Twenty → can convert to user later
User books round → Next.js creates booking → Twenty creates deal
Instructor manages consultations → Auto-creates consultation slots
User books consultation → Payment → Confirmation email with meeting link
```

---

## Database Schema

### Core Entities Overview

```
programs (workshops / courses / webinars)
    └── rounds (النسخ المتكررة)
            ├── sessions (المحاضرات جوا الـ round)
            ├── payment_plans (خطط التقسيط)
            │       └── installments
            └── bookings (الحجوزات)
                    └── payments (الدفعات)

users
    ├── role: user / admin / instructor ⭐ NEW
    └── user_profiles
            └── companies

instructors → programs
    └── consultations ⭐ NEW
            ├── consultation_types
            ├── consultation_availability
            ├── instructor_blocked_dates
            └── consultation_bookings

categories → programs
tags ↔ programs / users (many-to-many)
leads → users (conversion)
notifications → users
payment_links ⭐ NEW
installment_requests ⭐ NEW
```

---

## 1. users
المستخدمين الأساسيين (Payload Auth Collection)

| الحقل | النوع | التفاصيل | Required |
|---|---|---|---|
| id | uuid | PK | ✓ |
| email | varchar | unique | ✓ |
| password | varchar | hashed | ✓ |
| first_name | varchar | | ✓ |
| last_name | varchar | | ✓ |
| phone | varchar | للواتس اب والتواصل | ✓ |
| gender | enum | male / female | |
| picture | relation → media | صورة البروفايل | |
| **role** | **enum** | **user / admin / instructor** ⭐ | ✓ |
| **instructor_id** | **FK → instructors** | **للربط مع بروفايل المحاضر** ⭐ | |
| preferred_language | enum | ar / en | |
| newsletter_opt_in | boolean | default: false | |
| lifecycle_stage | enum | lead / prospect / customer / repeat | |
| contact_source | enum | website / whatsapp / social / referral | |
| twenty_crm_contact_id | varchar | للـ sync | |
| email_verified | boolean | | |
| last_login | timestamp | | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

**ملحوظة:** المحاضر بيكون ليه user account عادي بـ role = `instructor` وبيتربط بـ record في جدول `instructors` عن طريق `instructor_id`.

---

## 2. user_profiles
بيانات الـ Onboarding المكملة (One-to-One مع users)

| الحقل | النوع | التفاصيل | Onboarding Step |
|---|---|---|---|
| id | uuid | PK | - |
| user_id | FK → users | unique | - |
| title | enum | Mr / Mrs / Dr / Eng / Prof | 1 |
| job_title | varchar | مثل: Marketing Manager | 1 |
| work_field | enum | Marketing / Sales / Tech / Finance / Operations / HR / Legal / Other | 1 |
| years_of_experience | enum | 0-2 / 3-5 / 6-10 / 10+ | 2 |
| education | enum | High School / Bachelor / Master / MBA / PhD / Other | 2 |
| year_of_birth | integer | للتحليلات الديموغرافية | 2 |
| country | varchar | | 2 |
| city | varchar | | 2 |
| company_id | FK → companies | nullable | 1 |
| company_size | enum | 1-10 / 11-50 / 51-200 / 201-500 / 500+ | 1 |
| company_type | enum | startup / sme / enterprise / government / freelancer | 1 |
| linkedin_url | varchar | optional | 3 |
| learning_goals | text | "عايز أتعلم المبيعات عشان..." | 3 |
| interests | array of tags | للتوصيات | 3 |
| how_did_you_hear | enum | website / whatsapp / social / friend / google / other | 3 |
| onboarding_completed | boolean | default: false | - |
| onboarding_step | integer | 1 / 2 / 3 | - |
| created_at | timestamp | | - |
| updated_at | timestamp | | - |

---

## 3. companies
الشركات المرتبطة بالمستخدمين

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| name | varchar | required |
| industry | varchar | مثل: E-commerce, SaaS, Retail |
| size | enum | 1-10 / 11-50 / 51-200 / 201-500 / 500+ |
| type | enum | startup / sme / enterprise / government / freelancer |
| website | varchar | |
| country | varchar | |
| city | varchar | |
| logo | relation → media | |
| twenty_crm_company_id | varchar | للـ sync |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 4. instructors
المحاضرون (صلاح خليل، كريم تركي، إلخ)

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| first_name | varchar | required |
| last_name | varchar | required |
| bio_ar | richtext | نبذة بالعربي |
| bio_en | richtext | نبذة بالإنجليزي |
| job_title | varchar | مثل: Sales Expert, CEO of X |
| **tagline** | **varchar** | **"خبير مبيعات B2B بخبرة +15 سنة"** ⭐ |
| picture | relation → media | صورة احترافية |
| linkedin_url | varchar | |
| twitter_url | varchar | |
| email | varchar | للتواصل الداخلي |
| **featured_order** | **integer** | **للترتيب في صفحة /instructors** ⭐ |
| is_active | boolean | default: true |
| created_at | timestamp | |
| updated_at | timestamp | |

**Computed Fields (Virtual):**
- `total_views` → SUM of `view_count` من programs المرتبطة
- `total_students` → COUNT DISTINCT of users في bookings على rounds بتاعته
- `programs_count` → COUNT of active programs

---

## 5. categories
تصنيفات الـ programs

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| name_ar | varchar | required |
| name_en | varchar | |
| slug | varchar | unique |
| description_ar | text | |
| description_en | text | |
| icon | varchar | اسم الأيقونة أو SVG |
| parent_id | FK → categories | للـ subcategories (nullable) |
| order | integer | للترتيب |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 6. programs ⭐
الجدول الموحد للـ workshops, courses, webinars

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| **type** | enum | **workshop / course / webinar** |
| title_ar | varchar | required |
| title_en | varchar | |
| slug | varchar | unique |
| description_ar | richtext | وصف كامل |
| description_en | richtext | |
| short_description_ar | text | 2-3 سطور للكارد |
| short_description_en | text | |
| category_id | FK → categories | |
| instructor_id | FK → instructors | |
| thumbnail | relation → media | 16:9 ratio |
| cover_image | relation → media | للصفحة الداخلية |
| duration_hours | integer | إجمالي الساعات |
| sessions_count | integer | عدد الجلسات (courses خاصة) |
| level | enum | beginner / intermediate / advanced |
| language | enum | ar / en / both |
| objectives | array of text | "هتتعلم إزاي..." |
| requirements | array of text | "محتاج تكون عارف..." |
| target_audience | array of text | "الورشة دي ليك لو أنت..." |
| is_featured | boolean | لعرضه في الصفحة الرئيسية |
| is_active | boolean | |
| view_count | integer | لتتبع الشعبية |
| seo_title | varchar | |
| seo_description | text | |
| seo_keywords | array | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 7. rounds ⭐
النسخ المتكررة من البرنامج — قلب النظام

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| program_id | FK → programs | required |
| round_number | integer | الراوند رقم كام؟ |
| title | varchar | اسم مخصص للراوند (اختياري) |
| start_date | date | required |
| end_date | date | |
| timezone | varchar | Africa/Cairo default |
| location_type | enum | online / in-person / hybrid |
| location_name | varchar | اسم المكان / الفندق / إلخ |
| location_address | varchar | |
| location_map_url | varchar | Google Maps link |
| meeting_url | varchar | Zoom / Teams link |
| max_capacity | integer | required |
| current_enrollments | integer | computed field |
| price | decimal | required |
| early_bird_price | decimal | nullable |
| early_bird_deadline | date | |
| currency | enum | EGP / USD / EUR |
| status | enum | draft / upcoming / open / full / in_progress / cancelled / completed |
| is_active | boolean | |
| auto_close_on_full | boolean | يقفل تلقائي لما يمتلئ |
| reminder_sent | boolean | للإشعارات قبل البدء |
| notes | text | ملاحظات داخلية للأدمن |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 8. sessions
المحاضرات الفردية جوا الـ round

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| round_id | FK → rounds | required |
| session_number | integer | 1, 2, 3... |
| title | varchar | عنوان الجلسة |
| description | text | ملخص المحاضرة |
| date | date | required |
| start_time | time | required |
| end_time | time | required |
| duration_minutes | integer | computed |
| location_type | enum | online / in-person / hybrid |
| location_name | varchar | ممكن يختلف عن الـ round |
| location_address | varchar | |
| meeting_url | varchar | |
| instructor_id | FK → instructors | ممكن محاضر مختلف لكل session |
| recording_url | varchar | بعد انتهاء الجلسة |
| materials | array of relations → media | ملفات PDF / slides |
| is_cancelled | boolean | |
| cancellation_reason | text | |
| attendees_count | integer | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 9. payment_plans
خطط التقسيط — يحددها الأدمن لكل round

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| round_id | FK → rounds | required |
| name | varchar | "تقسيط على مرتين" |
| name_en | varchar | "2 Installments" |
| installments_count | integer | 2 / 3 / 4 |
| description | text | "ادفع 50% دلوقتي و50% بعد 30 يوم" |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 10. payment_plan_installments
تفاصيل كل قسط

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| payment_plan_id | FK → payment_plans | required |
| installment_number | integer | 1, 2, 3... |
| percentage | integer | 50 / 30 / 20 |
| due_days_from_booking | integer | 0 = فوري، 30 = بعد شهر |
| description | varchar | "القسط الأول" |
| created_at | timestamp | |

---

## 11. bookings
الحجوزات — الوصلة بين user والـ round

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| booking_code | varchar | unique, auto-generated (e.g., BK-2026-001234) |
| user_id | FK → users | required |
| round_id | FK → rounds | required |
| payment_plan_id | FK → payment_plans | nullable = دفع كامل |
| **installment_request_id** | **FK → installment_requests** | **للربط بطلب التقسيط** ⭐ |
| status | enum | pending / confirmed / cancelled / completed / refunded / payment_failed |
| total_amount | decimal | السعر الإجمالي |
| paid_amount | decimal | computed |
| remaining_amount | decimal | computed |
| discount_code | varchar | كود خصم (إن وجد) |
| discount_amount | decimal | |
| final_amount | decimal | بعد الخصم |
| booking_source | enum | website / whatsapp / admin / phone / payment_link ⭐ |
| booked_by_admin | FK → users | لو الأدمن اللي عمل الحجز |
| notes | text | ملاحظات المستخدم |
| internal_notes | text | ملاحظات الأدمن (مش ظاهرة لليوزر) |
| twenty_crm_deal_id | varchar | للـ sync |
| confirmation_email_sent | boolean | |
| reminder_email_sent | boolean | |
| cancelled_at | timestamp | |
| cancellation_reason | text | |
| refund_amount | decimal | |
| refund_date | date | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 12. payments
كل دفعة منفردة (full payment أو installment)

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| payment_code | varchar | unique (PAY-2026-001234) |
| booking_id | FK → bookings | required |
| installment_number | integer | 1, 2, 3... (null = full payment) |
| amount | decimal | required |
| due_date | date | متى المفروض يدفع |
| paid_date | timestamp | متى دفع فعلاً |
| status | enum | pending / paid / overdue / failed / refunded |
| payment_method | enum | paymob / cash / bank_transfer / voucher |
| transaction_id | varchar | Paymob reference |
| payment_gateway_response | jsonb | الرد الكامل من Paymob |
| receipt_url | varchar | لينك الإيصال |
| receipt_number | varchar | رقم الإيصال |
| notes | text | |
| reminder_sent_count | integer | عدد التذكيرات المرسلة |
| last_reminder_sent | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 13. leads
الـ Leads من واتس اب / سوشيال ميديا — تتسنك مع Twenty CRM

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| first_name | varchar | |
| last_name | varchar | |
| email | varchar | nullable |
| phone | varchar | required |
| company | varchar | |
| job_title | varchar | |
| source | enum | whatsapp / facebook / instagram / linkedin / referral / cold_call / event / other |
| source_details | text | مثلاً: "WhatsApp Community - Business Group" |
| status | enum | new / contacted / qualified / nurturing / converted / lost |
| interested_in | array | workshop IDs / course IDs |
| notes | text | |
| twenty_crm_lead_id | varchar | required للـ sync |
| converted_user_id | FK → users | لما يتحول لـ user |
| converted_at | timestamp | |
| assigned_to | FK → users (admin) | مسؤول عنه مين |
| last_contact_date | date | |
| next_follow_up_date | date | |
| priority | enum | low / medium / high / urgent |
| lost_reason | text | ليه اتلغى |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 14. tags
للـ interests وتصنيف المحتوى

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| name_ar | varchar | required |
| name_en | varchar | |
| slug | varchar | unique |
| type | enum | interest / skill / industry / topic |
| usage_count | integer | عدد المرات اللي اتستخدم فيها |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 15. user_interests (Junction Table)
| user_id | FK → users |
| tag_id | FK → tags |
| created_at | timestamp |

---

## 16. program_tags (Junction Table)
| program_id | FK → programs |
| tag_id | FK → tags |
| created_at | timestamp |

---

## 17. notifications
إشعارات الـ User Dashboard

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| user_id | FK → users | required |
| type | enum | booking_confirmed / payment_reminder / payment_received / round_starting / session_reminder / booking_cancelled / round_cancelled / **consultation_confirmed** ⭐ / **consultation_reminder** ⭐ |
| title | varchar | |
| message | text | |
| action_url | varchar | لينك لصفحة معينة |
| is_read | boolean | default: false |
| read_at | timestamp | |
| created_at | timestamp | |

---

## 18. discount_codes
أكواد الخصم

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| code | varchar | unique, uppercase |
| type | enum | percentage / fixed |
| value | decimal | 20 = 20% أو 500 = 500 جنيه |
| max_uses | integer | nullable = unlimited |
| current_uses | integer | |
| valid_from | date | |
| valid_until | date | |
| applicable_to | enum | all / specific_programs / specific_categories / **consultations** ⭐ |
| programs | array of FK | nullable |
| categories | array of FK | nullable |
| min_purchase_amount | decimal | |
| is_active | boolean | |
| created_by | FK → users (admin) | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 19. media
ملفات الوسائط (Payload built-in)

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| filename | varchar | |
| mimeType | varchar | |
| filesize | integer | |
| width | integer | للصور |
| height | integer | |
| url | varchar | |
| alt | varchar | للـ SEO |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 20. payment_links ⭐ NEW
روابط الدفع المخصصة للواتس اب والسوشيال ميديا

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| code | varchar | unique slug مثلاً `mastering-sales-march` |
| title | varchar | اسم مخصص للينك |
| round_id | FK → rounds | محدد |
| payment_plan_id | FK → payment_plans | اختياري — تحدد الخطة مسبقاً |
| discount_code | varchar | كود خصم مطبق تلقائياً |
| expires_at | timestamp | تاريخ انتهاء اللينك |
| max_uses | integer | حد أقصى للاستخدام |
| current_uses | integer | عداد تلقائي |
| is_active | boolean | |
| created_by | FK → users (admin) | |
| created_at | timestamp | |
| updated_at | timestamp | |

**الـ URL:** `/pay/:code`

---

## 21. installment_requests ⭐ NEW
طلبات التقسيط من المستخدمين — تحتاج موافقة الأدمن

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| user_id | FK → users | |
| round_id | FK → rounds | |
| payment_plan_id | FK → payment_plans | اللي عايزه |
| status | enum | pending / approved / rejected |
| reason | text | ليه بيطلب تقسيط؟ |
| national_id_number | varchar | للتحقق (اختياري) |
| national_id_image | relation → media | |
| user_notes | text | أي ملاحظات |
| admin_notes | text | رد الأدمن |
| reviewed_by | FK → users (admin) | |
| reviewed_at | timestamp | |
| approval_expires_at | timestamp | الموافقة صالحة لحد امتى |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 22. consultation_types ⭐ NEW
أنواع الكونسالتيشن التي يقدمها كل instructor

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| instructor_id | FK → instructors | required |
| title_ar | varchar | "جلسة استشارية 1:1" |
| title_en | varchar | |
| description_ar | text | |
| description_en | text | |
| duration_minutes | integer | 30 / 60 / 90 |
| price | decimal | |
| currency | enum | EGP / USD |
| meeting_type | enum | online / in-person / both |
| meeting_platform | varchar | Zoom / Google Meet / إلخ |
| max_participants | integer | 1 = فردي، 2+ = group |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 23. consultation_availability ⭐ NEW
الأوقات المتاحة لكل instructor (template أسبوعي)

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| instructor_id | FK → instructors | required |
| day_of_week | enum | saturday / sunday / monday / tuesday / wednesday / thursday / friday |
| start_time | time | 10:00 |
| end_time | time | 17:00 |
| buffer_minutes | integer | وقت راحة بين كل جلسة (15 دقيقة مثلاً) |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 24. instructor_blocked_dates ⭐ NEW
أيام محددة المحاضر يبلوكها (إجازة / سفر)

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| instructor_id | FK → instructors | required |
| date | date | اليوم المحجوب |
| reason | varchar | "إجازة" / "سفر" (داخلي فقط) |
| created_at | timestamp | |

---

## 25. consultation_slots ⭐ NEW
السلوتات الفعلية المتاحة للحجز (generated من الـ availability)

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| consultation_type_id | FK → consultation_types | required |
| instructor_id | FK → instructors | required |
| date | date | required |
| start_time | time | required |
| end_time | time | required |
| status | enum | available / booked / blocked / cancelled |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 26. consultation_bookings ⭐ NEW
حجوزات الكونسالتيشن

| الحقل | النوع | التفاصيل |
|---|---|---|
| id | uuid | PK |
| booking_code | varchar | CB-2026-001234 |
| user_id | FK → users | required |
| slot_id | FK → consultation_slots | required |
| consultation_type_id | FK → consultation_types | required |
| instructor_id | FK → instructors | required |
| status | enum | pending / confirmed / completed / cancelled / no_show |
| amount | decimal | required |
| payment_status | enum | pending / paid / refunded |
| transaction_id | varchar | Paymob ref |
| meeting_url | varchar | يتبعت بعد الدفع |
| user_notes | text | "عايز أتكلم عن..." |
| instructor_notes | text | ملاحظات بعد الجلسة |
| cancelled_by | enum | user / instructor / admin |
| cancellation_reason | text | |
| reminder_sent | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## ERD Summary

```
┌─────────────┐
│   users     │ (role: user / admin / instructor)
└──────┬──────┘
       │ 1:1
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
│user_profiles│  │  bookings   │  │ instructor (FK)  │
│             │  │             │  └──────────────────┘
│  ├─company  │  │  ├─round    │
└─────────────┘  │  ├─payments │
                 └─────────────┘

┌─────────────┐
│ instructors │
│             │
│  ├─consultation_types
│  ├─consultation_availability
│  ├─instructor_blocked_dates
│  └─consultation_slots → consultation_bookings
└─────────────┘

┌─────────────┐
│  programs   │ (workshops/courses/webinars)
│             │
│  ├─category │
│  ├─instructor
│  ├─tags     │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│   rounds    │
│             │
│  ├─sessions │
│  ├─payment_plans ─┬─ installments
│  └─bookings      │
└─────────────┘

┌─────────────┐
│payment_links│ → round
└─────────────┘

┌──────────────────┐
│installment_requests│ → user, round, payment_plan
└──────────────────┘

┌─────────────┐
│    leads    │ → converts to → users
│             │
│  ├─assigned_to (admin)
└─────────────┘
```

---

## User Flows

### 1. Registration & Onboarding Flow

```
Landing Page
    ↓
[Sign Up] (email, password, name, phone)
    ↓
Onboarding Step 1/3
├─ Title, Job, Work Field
├─ Company Name, Size, Type
    ↓
Onboarding Step 2/3
├─ Country, City, Birth Year
├─ Education, Experience
    ↓
Onboarding Step 3/3
├─ Interests (tags)
├─ Learning Goals
├─ How did you hear
    ↓
[Complete] → Dashboard
    ↓
API Call → Twenty CRM (create contact)
```

---

### 2. Browsing & Booking Flow (Programs)

```
Homepage → Browse Programs
    ↓
Filter by:
├─ Type (workshop/course/webinar)
├─ Category
├─ Level
├─ Price Range
└─ Date Range
    ↓
Program Page
├─ Description
├─ Instructor Bio
├─ Objectives & Requirements
├─ Available Rounds ⭐
    ↓
[Select Round]
├─ Date & Time
├─ Location
├─ Available Seats
├─ Price
    ↓
Booking Page
├─ Review Details
├─ Choose Payment Method:
│   ├─ Full Payment
│   ├─ Installment Plan (if available)
│   └─ [Request Installment] ⭐ → فورم طلب
    ↓
Payment (Paymob)
    ↓
[Success]
    ↓
├─ Confirmation Email (Resend)
├─ Booking appears in Dashboard
└─ Twenty CRM: Create Deal
```

---

### 3. Payment Link Flow ⭐ NEW

```
Admin creates payment link
├─ /admin/payment-links
├─ Selects round, optional discount
├─ Generates /pay/:code
└─ Shares via WhatsApp / Social
    ↓
User clicks link
    ↓
Redirects to /pay/:code
├─ Round details pre-filled
├─ Discount auto-applied
└─ [Login / Register] → Checkout
    ↓
Payment → Confirmed
```

---

### 4. Installment Request Flow ⭐ NEW

```
User browses round
    ↓
Sees installment option → [Request Installment]
    ↓
Fills form:
├─ Reason
├─ National ID (optional)
└─ Notes
    ↓
Submit → status: pending
    ↓
Admin notification (Resend)
    ↓
Admin reviews /admin/installment-requests
├─ Approve → email to user
│           → installment option unlocked for 7 days
│           → user completes checkout
└─ Reject  → email with reason
```

---

### 5. Consultation Booking Flow ⭐ NEW

```
User visits /instructors/:slug
    ↓
Sees instructor bio + stats (views, students, programs)
    ↓
[Book Consultation]
    ↓
/consultation/book/:instructorSlug
├─ Select type (1:1 / group)
├─ Select date (calendar)
├─ Select available time slot
└─ Enter notes "What do you want to discuss?"
    ↓
/consultation/checkout/:bookingId
├─ Payment (Paymob)
    ↓
Success
├─ Confirmation email with Zoom link
├─ "Add to Calendar" button
└─ Appears in /dashboard/consultations
    ↓
Reminders:
├─ 24 hours before → email + notification
└─ 1 hour before → email + notification
```

---

### 6. Instructor Portal Flow ⭐ NEW

```
Instructor logs in (role: instructor)
    ↓
/instructor Dashboard
├─ Upcoming consultations
├─ Upcoming sessions (from rounds)
└─ Quick stats
    ↓
/instructor/consultation-types
├─ Create consultation type
│   ├─ Title, description
│   ├─ Duration (30/60/90 min)
│   ├─ Price
│   ├─ Meeting type (online/in-person)
│   └─ Max participants
└─ Edit / deactivate existing types
    ↓
/instructor/availability
├─ Set weekly schedule
│   ├─ Days (Saturday - Friday)
│   ├─ Hours (10:00 - 17:00)
│   └─ Buffer between sessions (15 min)
└─ System auto-generates slots
    ↓
/instructor/blocked-dates
├─ Block specific dates (vacation, travel)
└─ Slots automatically hidden for those dates
    ↓
/instructor/bookings
├─ View all consultation bookings
├─ See booking details
├─ Add post-session notes
└─ Cancel if needed
    ↓
/instructor/sessions
├─ View upcoming training sessions (from rounds)
└─ Access materials, meeting links
    ↓
/instructor/profile
├─ Edit bio, tagline
├─ Update picture
└─ Manage social links
```

---

### 7. User Dashboard Flow

```
Dashboard Home
├─ Upcoming Sessions (next 7 days)
├─ My Bookings (grouped by status)
│   ├─ Upcoming
│   ├─ Completed
│   └─ Cancelled
├─ My Consultations ⭐ NEW
│   ├─ Upcoming consultations
│   └─ Past consultations
├─ Payment Status
│   ├─ Pending Payments
│   └─ Payment History
├─ Installment Requests ⭐ NEW
│   ├─ Pending
│   ├─ Approved
│   └─ Rejected
└─ Notifications

Profile Settings
├─ Personal Info (editable)
├─ Company Info
├─ Change Password
├─ Preferences (language, notifications)
└─ Delete Account

Booking Details Page
├─ Program Info
├─ Round Details
├─ Sessions Schedule
├─ Payment Breakdown
├─ Receipts Download
├─ Join Meeting Button (if online)
└─ [Cancel Booking]
```

---

### 8. Admin Panel Flow (Payload CMS)

```
Admin Login → Dashboard

Programs Management
├─ Create Program (workshop/course/webinar)
│   ├─ Basic Info (title, description, category)
│   ├─ Instructor
│   ├─ Media (thumbnail, cover)
│   ├─ Details (duration, level, language)
│   └─ SEO Settings
├─ Create Round
│   ├─ Select Program
│   ├─ Date & Time
│   ├─ Location
│   ├─ Pricing
│   ├─ Capacity
│   └─ Payment Plans
├─ Create Sessions (for courses)
│   ├─ Title & Description
│   ├─ Date & Time
│   ├─ Instructor (can differ)
│   └─ Materials Upload
└─ Manage Status (draft/open/full/completed)

Bookings Management
├─ View All Bookings (filterable)
├─ Booking Details
│   ├─ User Info
│   ├─ Payment Status
│   ├─ Send Manual Email
│   ├─ Mark as Paid (manual payment)
│   ├─ Cancel Booking
│   └─ Issue Refund
├─ Payment Tracking
└─ Export Reports (CSV/Excel)

Users Management
├─ View All Users
├─ User Profile
│   ├─ Contact Info
│   ├─ Booking History
│   ├─ Payment History
│   └─ Link to Twenty CRM
├─ Send Email to User
├─ User Segmentation
└─ Create Instructor Account ⭐

Leads Management
├─ Import from WhatsApp/Social
├─ Lead Details
│   ├─ Contact Info
│   ├─ Source
│   ├─ Status
│   ├─ Interested Programs
│   ├─ Follow-up Notes
│   └─ Convert to User
├─ Assign to Admin
└─ Sync with Twenty CRM

Payment Links ⭐ NEW
├─ Create custom payment link
│   ├─ Select round
│   ├─ Set discount
│   ├─ Expiration date
│   └─ Max uses
├─ View usage stats
└─ Deactivate links

Installment Requests ⭐ NEW
├─ View pending requests
├─ Review request details
│   ├─ User info
│   ├─ Reason
│   ├─ National ID (if provided)
│   └─ Notes
├─ Approve (sets 7-day expiry)
├─ Reject (with reason)
└─ View history

Consultations Management ⭐ NEW
├─ View all consultation bookings
├─ Monitor instructor availability
├─ Handle cancellations
└─ Generate reports

Content Management
├─ Instructors
├─ Categories
├─ Tags
├─ Media Library
└─ Discount Codes

Reports & Analytics
├─ Revenue Dashboard
├─ Bookings by Program
├─ Consultation Revenue ⭐
├─ Conversion Rates
├─ Popular Programs
└─ User Demographics
```

---

### 9. Twenty CRM Sync Flow

**On User Registration:**
```
Next.js
├─ User created in Payload
├─ Server Action triggered
└─ POST /api/crm/contacts
    ↓
Twenty CRM
├─ Create Contact
├─ Set Properties:
│   ├─ Name, Email, Phone
│   ├─ Company
│   ├─ Source: "website"
│   └─ Custom Fields (work_field, interests)
└─ Return contact_id
    ↓
Next.js
└─ Update user.twenty_crm_contact_id
```

**On Booking Created:**
```
Next.js
├─ Booking created
└─ POST /api/crm/deals
    ↓
Twenty CRM
├─ Create Deal
├─ Link to Contact
├─ Set Properties:
│   ├─ Deal Name: "[Program] - [User]"
│   ├─ Amount: booking.total_amount
│   ├─ Stage: "pending_payment" / "paid"
│   └─ Close Date: round.start_date
└─ Return deal_id
    ↓
Next.js
└─ Update booking.twenty_crm_deal_id
```

**On Consultation Booking:**
```
Next.js
├─ Consultation booking created
└─ POST /api/crm/deals
    ↓
Twenty CRM
├─ Create Deal
├─ Link to Contact
├─ Set Properties:
│   ├─ Deal Name: "Consultation - [Instructor] - [User]"
│   ├─ Amount: consultation.amount
│   ├─ Stage: "pending_payment" / "paid"
│   └─ Close Date: slot.date
└─ Return deal_id
```

---

## Email Automation (Resend)

### Transactional Emails

| الحدث | Email Type | المحتوى |
|---|---|---|
| User registers | Welcome Email | Welcome + onboarding checklist + browse programs CTA |
| Booking confirmed | Booking Confirmation | Booking details, round info, payment breakdown, calendar invite |
| Payment received | Payment Receipt | Receipt number, amount, remaining balance, download PDF |
| Payment reminder | Payment Due | "قسطك القادم بـ 500 جنيه مستحق بعد 3 أيام" + pay now link |
| Payment overdue | Overdue Notice | "قسطك تأخر، الرجاء الدفع لتجنب إلغاء الحجز" |
| 3 days before round | Round Reminder | "ورشتك هتبدأ يوم [date]" + location/meeting link |
| Session starting soon | Session Reminder | "جلستك هتبدأ بعد ساعة" + join button |
| Booking cancelled | Cancellation Notice | Cancelled details + refund info if applicable |
| Round cancelled | Round Cancellation | "للأسف الورشة اتلغت" + refund/reschedule options |
| Password reset | Reset Password | Password reset link (expires in 1 hour) |
| **Installment request submitted** ⭐ | **Request Confirmation** | "طلبك تحت المراجعة، هنرد عليك خلال 24 ساعة" |
| **Installment approved** ⭐ | **Approval Notice** | "تم الموافقة! اكمل الحجز خلال 7 أيام" + booking link |
| **Installment rejected** ⭐ | **Rejection Notice** | "نأسف، طلبك لم يتم قبوله" + reason + contact support |
| **Consultation confirmed** ⭐ | **Consultation Confirmation** | Date + time + Zoom link + "Add to Calendar" |
| **24h before consultation** ⭐ | **Consultation Reminder** | "جلستك بكرة الساعة X" + meeting link |
| **1h before consultation** ⭐ | **Consultation Reminder** | "جلستك بعد ساعة" + meeting link + join button |
| **Consultation cancelled** ⭐ | **Cancellation Notice** | Cancellation details + refund info |

---

## Payment Integration (Paymob)

### Payment Flow

```
User clicks "Proceed to Payment"
    ↓
Next.js Server Action
├─ Create payment intent in DB (status: pending)
├─ POST to Paymob API
│   ├─ amount
│   ├─ currency
│   ├─ customer info
│   └─ callback URLs
└─ Return payment URL
    ↓
Redirect to Paymob
    ↓
User pays
    ↓
Paymob callback → /api/webhooks/paymob
    ↓
Next.js verifies signature
├─ Update payment (status: paid)
├─ Update booking (paid_amount += payment.amount)
├─ If fully paid → booking.status = confirmed
├─ Send payment receipt email
└─ Sync with Twenty CRM (update deal stage)
```

---

## Installment Payment Logic

### Auto-generate Payments on Booking

```typescript
async function createBooking(userId, roundId, paymentPlanId) {
  // Create booking
  const booking = await payload.create({
    collection: 'bookings',
    data: {
      user_id: userId,
      round_id: roundId,
      payment_plan_id: paymentPlanId,
      total_amount: round.price,
      status: 'pending'
    }
  });
  
  // Get payment plan installments
  const plan = await getPaymentPlan(paymentPlanId);
  const installments = await getInstallments(paymentPlanId);
  
  // Create payment records
  for (const inst of installments) {
    const amount = (round.price * inst.percentage) / 100;
    const dueDate = addDays(new Date(), inst.due_days_from_booking);
    
    await payload.create({
      collection: 'payments',
      data: {
        booking_id: booking.id,
        installment_number: inst.installment_number,
        amount: amount,
        due_date: dueDate,
        status: inst.installment_number === 1 ? 'pending' : 'pending'
      }
    });
  }
  
  return booking;
}
```

---

## Consultation Slot Generation Logic ⭐ NEW

### Auto-generate Slots from Availability

```typescript
async function generateConsultationSlots(instructorId, daysAhead = 30) {
  const instructor = await getInstructor(instructorId);
  const availability = await getAvailability(instructorId);
  const blockedDates = await getBlockedDates(instructorId);
  const consultationTypes = await getConsultationTypes(instructorId);
  
  const today = new Date();
  const endDate = addDays(today, daysAhead);
  
  for (let date = today; date <= endDate; date = addDays(date, 1)) {
    const dayOfWeek = getDayOfWeek(date);
    const isBlocked = blockedDates.some(b => isSameDay(b.date, date));
    
    if (isBlocked) continue;
    
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek && a.is_active);
    
    if (!dayAvailability) continue;
    
    // Generate slots for each consultation type
    for (const type of consultationTypes.filter(t => t.is_active)) {
      let currentTime = dayAvailability.start_time;
      const endTime = dayAvailability.end_time;
      
      while (addMinutes(currentTime, type.duration_minutes) <= endTime) {
        const slotEndTime = addMinutes(currentTime, type.duration_minutes);
        
        // Check if slot already exists
        const existing = await findSlot(instructorId, date, currentTime);
        
        if (!existing) {
          await payload.create({
            collection: 'consultation_slots',
            data: {
              consultation_type_id: type.id,
              instructor_id: instructorId,
              date: date,
              start_time: currentTime,
              end_time: slotEndTime,
              status: 'available'
            }
          });
        }
        
        // Move to next slot with buffer
        currentTime = addMinutes(slotEndTime, dayAvailability.buffer_minutes);
      }
    }
  }
}
```

---

## Cron Jobs

### Payment Reminder Cron

```typescript
// cron/payment-reminders.ts
export async function sendPaymentReminders() {
  const upcomingPayments = await payload.find({
    collection: 'payments',
    where: {
      status: { equals: 'pending' },
      due_date: {
        greater_than_equal: new Date(),
        less_than: addDays(new Date(), 3) // 3 days before due
      },
      reminder_sent_count: { less_than: 2 } // max 2 reminders
    }
  });
  
  for (const payment of upcomingPayments.docs) {
    const booking = await getBooking(payment.booking_id);
    const user = await getUser(booking.user_id);
    
    await sendEmail({
      to: user.email,
      template: 'payment-reminder',
      data: { payment, booking, user }
    });
    
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        reminder_sent_count: payment.reminder_sent_count + 1,
        last_reminder_sent: new Date()
      }
    });
  }
}
```

### Consultation Reminder Cron ⭐ NEW

```typescript
// cron/consultation-reminders.ts
export async function sendConsultationReminders() {
  const now = new Date();
  
  // 24 hours before
  const tomorrow = addHours(now, 24);
  const bookings24h = await payload.find({
    collection: 'consultation_bookings',
    where: {
      status: { equals: 'confirmed' },
      'slot.date': { equals: format(tomorrow, 'yyyy-MM-dd') },
      reminder_sent: { equals: false }
    }
  });
  
  for (const booking of bookings24h.docs) {
    await sendEmail({
      to: booking.user.email,
      template: 'consultation-reminder-24h',
      data: { booking }
    });
  }
  
  // 1 hour before
  const oneHourLater = addHours(now, 1);
  const bookings1h = await payload.find({
    collection: 'consultation_bookings',
    where: {
      status: { equals: 'confirmed' },
      'slot.date': { equals: format(now, 'yyyy-MM-dd') },
      'slot.start_time': { equals: format(oneHourLater, 'HH:mm') }
    }
  });
  
  for (const booking of bookings1h.docs) {
    await sendEmail({
      to: booking.user.email,
      template: 'consultation-reminder-1h',
      data: { booking }
    });
  }
}
```

### Slot Generation Cron ⭐ NEW

```typescript
// cron/generate-slots.ts
export async function generateSlotsForAllInstructors() {
  const instructors = await payload.find({
    collection: 'instructors',
    where: { is_active: { equals: true } }
  });
  
  for (const instructor of instructors.docs) {
    // Check if instructor has availability set
    const hasAvailability = await checkAvailability(instructor.id);
    
    if (hasAvailability) {
      await generateConsultationSlots(instructor.id, 30); // 30 days ahead
    }
  }
}

// Schedule: Every day at midnight
```

---

## Search & Filtering

### Programs Search

```typescript
// app/api/programs/search/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  const query = searchParams.get('q');
  const type = searchParams.get('type'); // workshop/course/webinar
  const category = searchParams.get('category');
  const level = searchParams.get('level');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  const where = {
    is_active: { equals: true },
    ...(type && { type: { equals: type } }),
    ...(category && { category_id: { equals: category } }),
    ...(level && { level: { equals: level } }),
    ...(query && {
      or: [
        { title_ar: { contains: query } },
        { description_ar: { contains: query } },
        { title_en: { contains: query } }
      ]
    })
  };
  
  const programs = await payload.find({
    collection: 'programs',
    where,
    depth: 2 // include instructor, category
  });
  
  // Filter by price and date (on rounds)
  const filtered = programs.docs.filter(program => {
    const rounds = program.rounds;
    
    if (!rounds || rounds.length === 0) return false;
    
    return rounds.some(round => {
      const priceMatch = 
        (!minPrice || round.price >= parseFloat(minPrice)) &&
        (!maxPrice || round.price <= parseFloat(maxPrice));
      
      const dateMatch =
        (!startDate || new Date(round.start_date) >= new Date(startDate)) &&
        (!endDate || new Date(round.start_date) <= new Date(endDate));
      
      return priceMatch && dateMatch && round.status === 'open';
    });
  });
  
  return Response.json({ programs: filtered });
}
```

---

## SEO Strategy

### Program Pages

```tsx
// app/programs/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const program = await getProgram(params.slug);
  
  return {
    title: program.seo_title || `${program.title_ar} | Next Academy`,
    description: program.seo_description || program.short_description_ar,
    keywords: program.seo_keywords,
    openGraph: {
      title: program.title_ar,
      description: program.short_description_ar,
      images: [program.thumbnail.url],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: program.title_ar,
      description: program.short_description_ar,
      images: [program.thumbnail.url]
    },
    alternates: {
      canonical: `https://nextacademyedu.com/programs/${program.slug}`
    }
  };
}
```

### Instructor Pages ⭐

```tsx
// app/instructors/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const instructor = await getInstructor(params.slug);
  
  return {
    title: `${instructor.first_name} ${instructor.last_name} | Next Academy`,
    description: instructor.tagline || extractText(instructor.bio_ar, 160),
    openGraph: {
      title: `${instructor.first_name} ${instructor.last_name}`,
      description: instructor.tagline,
      images: [instructor.picture.url],
      type: 'profile'
    }
  };
}
```

---

## Performance Optimization

### Caching Strategy

```typescript
// Next.js App Router - Route Handlers
export const revalidate = 3600; // 1 hour

// For dynamic pages
export const dynamic = 'force-dynamic'; // for dashboard, instructor portal
export const dynamic = 'force-static';  // for marketing pages
```

### Database Indexing

```sql
-- Core indexes
CREATE INDEX idx_programs_type ON programs(type);
CREATE INDEX idx_programs_slug ON programs(slug);
CREATE INDEX idx_programs_category ON programs(category_id);
CREATE INDEX idx_rounds_program ON rounds(program_id);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_rounds_start_date ON rounds(start_date);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_round ON bookings(round_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_sessions_round ON sessions(round_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Consultation indexes ⭐ NEW
CREATE INDEX idx_consultation_slots_instructor ON consultation_slots(instructor_id);
CREATE INDEX idx_consultation_slots_date ON consultation_slots(date);
CREATE INDEX idx_consultation_slots_status ON consultation_slots(status);
CREATE INDEX idx_consultation_bookings_user ON consultation_bookings(user_id);
CREATE INDEX idx_consultation_bookings_instructor ON consultation_bookings(instructor_id);
CREATE INDEX idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX idx_instructor_blocked_dates ON instructor_blocked_dates(instructor_id, date);

-- Payment links indexes ⭐ NEW
CREATE INDEX idx_payment_links_code ON payment_links(code);
CREATE INDEX idx_payment_links_round ON payment_links(round_id);

-- Installment requests indexes ⭐ NEW
CREATE INDEX idx_installment_requests_user ON installment_requests(user_id);
CREATE INDEX idx_installment_requests_status ON installment_requests(status);
```

---

## Security Considerations

### Authentication & Authorization

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('payload-token');
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Verify role: user
  }
  
  // Protect instructor portal ⭐
  if (request.nextUrl.pathname.startsWith('/instructor')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Verify role: instructor
  }
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Verify role: admin
  }
  
  return NextResponse.next();
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/utils/installment-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateInstallments } from '@/lib/installment-calculator';

describe('Installment Calculator', () => {
  it('should calculate 2 installments correctly', () => {
    const result = calculateInstallments(1000, [
      { percentage: 50, due_days: 0 },
      { percentage: 50, due_days: 30 }
    ]);
    
    expect(result[0].amount).toBe(500);
    expect(result[1].amount).toBe(500);
  });
});
```

### Consultation Slot Generation Tests ⭐ NEW

```typescript
// tests/consultations/slot-generation.test.ts
import { describe, it, expect } from 'vitest';
import { generateConsultationSlots } from '@/lib/consultations';

describe('Consultation Slot Generation', () => {
  it('should generate slots based on availability', async () => {
    const instructorId = 'test-instructor';
    const slots = await generateConsultationSlots(instructorId, 7);
    
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toHaveProperty('date');
    expect(slots[0]).toHaveProperty('start_time');
    expect(slots[0].status).toBe('available');
  });
  
  it('should skip blocked dates', async () => {
    const instructorId = 'test-instructor';
    const blockedDate = '2026-03-10';
    
    await blockDate(instructorId, blockedDate);
    const slots = await generateConsultationSlots(instructorId, 7);
    
    const slotsOnBlockedDate = slots.filter(s => s.date === blockedDate);
    expect(slotsOnBlockedDate.length).toBe(0);
  });
});
```

---

## Deployment Checklist

### Pre-Launch

- [ ] جميع الـ collections معرّفة في Payload
- [ ] Database schema مطبق على Neon (including new tables)
- [ ] Twenty CRM مشغّل على Railway
- [ ] Paymob account جاهز (sandbox → production)
- [ ] Resend API key configured
- [ ] Environment variables مضبوطة على Vercel
- [ ] SSL certificates active
- [ ] Domain DNS configured
- [ ] All email templates tested (including consultation emails)
- [ ] Payment flow tested (sandbox)
- [ ] Consultation booking flow tested
- [ ] Instructor portal access tested
- [ ] Webhook endpoints accessible
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics / Plausible)
- [ ] Cron jobs scheduled (payments, consultations, slots)

### Post-Launch

- [ ] Monitor error logs
- [ ] Track conversion rates
- [ ] Check email deliverability
- [ ] Test payment gateway
- [ ] Backup database daily
- [ ] Monitor CRM sync
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Consultation completion rates
- [ ] Instructor satisfaction tracking

---

## Future Enhancements (Phase 2)

### Features to Add Later

1. **Bulk Booking للشركات**
   - Company admin يحجز لموظفين متعددين
   - Team discount codes
   - Corporate invoicing

2. **Certificate Generation**
   - PDF certificates بعد إتمام البرنامج
   - Digital badges
   - LinkedIn integration

3. **Advanced Analytics**
   - Revenue forecasting
   - Cohort analysis
   - Churn prediction
   - User segmentation reports
   - Consultation performance metrics

4. **Mobile App**
   - React Native app
   - Push notifications
   - Offline access to materials

5. **Live Streaming Integration**
   - Built-in video conferencing
   - Recording storage
   - Interactive Q&A

6. **Gamification**
   - Points system
   - Leaderboards
   - Achievements
   - Referral rewards

7. **Multi-language Support**
   - Full English interface
   - French (for North Africa)
   - Auto-translation for content

8. **Advanced CRM Features**
   - Email sequences
   - WhatsApp integration (via API)
   - SMS notifications
   - Lead scoring

9. **Group Consultations**
   - Multi-participant video sessions
   - Breakout rooms
   - Shared whiteboards

10. **Instructor Ratings & Reviews**
    - User reviews after consultations
    - Star ratings
    - Testimonials display

---

## Appendix

### Glossary

| المصطلح | المعنى |
|---|---|
| **Program** | تعريف الورشة/الكورس/الويبينار (مرة واحدة) |
| **Round** | نسخة متكررة من البرنامج بتاريخ ومكان محددين |
| **Session** | محاضرة فردية جوا الـ round |
| **Booking** | حجز اليوزر لـ round معينة |
| **Payment Plan** | خطة التقسيط (عدد الأقساط ونسبها) |
| **Installment** | قسط فردي |
| **Payment Link** | لينك دفع مخصص لـ round معينة |
| **Installment Request** | طلب تقسيط يحتاج موافقة أدمن |
| **Consultation** | جلسة استشارية 1:1 أو group مع محاضر |
| **Consultation Type** | نوع الكونسالتيشن (المدة، السعر، النوع) |
| **Slot** | وقت محدد متاح للحجز |
| **Availability** | جدول المواعيد الأسبوعي للمحاضر |
| **Blocked Date** | يوم محجوب (إجازة/سفر) |
| **Lead** | عميل محتمل لسه مسجلش |
| **Contact** | عميل مسجل في الـ CRM |
| **Deal** | صفقة (حجز) في الـ CRM |
| **Lifecycle Stage** | مرحلة العميل (lead → prospect → customer → repeat) |

---

### User Roles Summary

| الدور | Access | الصفحات الرئيسية |
|---|---|---|
| **user** | User Dashboard | /dashboard, /dashboard/bookings, /dashboard/consultations, /dashboard/payments, /dashboard/profile |
| **instructor** | Instructor Portal | /instructor, /instructor/availability, /instructor/consultation-types, /instructor/bookings, /instructor/profile |
| **admin** | Full Platform | /admin (Payload CMS) — كل الإدارة |

---

### Contact & Support

**Project Owner:** Muhammed Mekky
**Email:** contact@muhammedmekky.com
**Phone:** 201098620547
**Tech Lead:** Mekky
**Repository:** https://github.com/muhammedmekky/nextacademyedu

---

**Document Version History:**
- v1.0: Initial draft
- v2.0: Unified programs table + sessions hierarchy + payment links + installment requests
- v3.0: Instructor portal + consultations system + instructor stats

**Last Updated:** March 4, 2026