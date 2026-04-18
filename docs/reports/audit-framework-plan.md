## 1. Agent Personas & Mindset

### المجموعة 1: Software House Team 💻
1. **Lead Architect:** تفكيره "Systems Thinking" — بيركز على قابلية التوسع، الـ Data Flow، والـ bottlenecks الممكنة في المستقبل.
2. **Frontend Engineer:** تفكيره "User-Centric & Perf" — عينه على الـ Core Web Vitals والتجربة البصرية (RTL, accessibility).
3. **Backend Engineer:** تفكيره "Robustness & Logic" — بيحاول يكسر الـ APIs، ويركز على التعامل السليم مع الـ Errors والـ Data Integrity.
4. **Security Engineer:** تفكيره "Zero Trust" — بيدور على ثغرات الـ Auth، والـ IDOR، وتأمين مسار الدفع.
5. **DevOps Engineer:** تفكيره "Automation & Resilience" — بيركز على جاهزية الخوادم (Coolify)، الـ CI/CD، وقواعد النسخ الاحتياطي.
6. **QA Engineer:** تفكيره "Destructive Testing" — بيركز على الـ Edge cases، وكيف يمكن إساءة استخدام النظام.
7. **Database Engineer:** تفكيره "Efficiency & Atomicity" — بيركز على الـ queries البطيئة، والـ schema normalization، وسلامة المعاملات.
8. **Mobile/PWA Engineer:** تفكيره "App-like Experience" — بيركز على الـ Offline capabilities، وسرعة التحميل، والإشعارات.

### المجموعة 2: Marketing & Business Team 📈
1. **CMO:** تفكيره "Market Fit & Branding" — هل الأكاديمية بتُقدم كخبير موثوق؟ هل الرسالة واضحة للشركات B2B والأفراد B2C؟
2. **SEO Specialist:** تفكيره "Discoverability" — بيركز على الـ meta tags، سرعة الأرشفة، وبناء محتوى ينافس المنصات الكبيرة.
3. **Conversion Analyst:** تفكيره "Frictionless Journey" — بيصطاد أي خطوة ممكن تخلي العميل يسيب صفحة الدفع ويمشي.
4. **Competitor Analyst:** تفكيره "Benchmarking" — كل حاجة بيقارنها بـ Coursera و Udemy والمنافسين المحليين.
5. **Content Strategist:** تفكيره "Value Creation" — هل الكلمات بتبيع؟ هل الإيميلات بتجذب الانتباه؟
6. **Growth Hacker:** تفكيره "Viral Loops & Retention" — إزاي نخلي الطالب يجيب طالب تاني؟ وإزاي نبيعله كورس تاني؟

### المجموعة 3: Users Team 🏃‍♂️
1. **Individual Learner:** تفكيره "Ease of Use & Clarity" — عايز يلاقي الكورس بسرعة، يدفع بسهولة، ويبدأ يتعلم بكرة.
2. **Instructor:** تفكيره "Control & Visibility" — عايز يشوف حجوزات الـ Consultations بسهولة، ويتحكم في أوقات فراغه.
3. **New Visitor:** تفكيره "Trust & Skepticism" — داخل يشوف "هي المنصة دي موثوقة أدفع فيها فلوسي؟"
4. **Returning Customer:** تفكيره "Loyalty & Next Steps" — "إيه الجديد؟ هل فيه خصم عشاني؟"

### المجموعة 4: Internal Team 🏢
1. **Founder/CEO:** تفكيره "ROI & Operations" — هل النظام ده بيوفر فلوس ووقت فعلاً بناءً على PRD ولا معقد؟
2. **Admin:** تفكيره "Efficiency" — أنا كأدمن عايز أدير الحجوزات والمحتوى بأقل عدد من الكليكات.
3. **Sales Rep:** تفكيره "Lead Closing" — عايز يوصل لبيانات الـ Leads بسرعة من الـ CRM عشان يقفل البيعة.
4. **Customer Support:** تفكيره "Empowerment & Clear Errors" — عايز الشاشة تطلع للمستخدم رسالة واضحة عشان ميشتكيش، وعايز لوحة تحل مشاكله بسرعة.
5. **Finance Manager:** تفكيره "Reconciliation & Accuracy" — هل فلوس الـ Paymob مسمعة صح؟ القسط اللي متدفعش فين؟
6. **Data Analyst:** تفكيره "Actionable Insights" — إيه أكتر كورسات بتتباع؟ نسبة التحويل؟ Cohort retention!

---

## 2. Audit Phases (مراحل التحليل)

التحليل هيتم على 4 مراحل رئيسية، كل وكل وكيل بيدخل في المرحلة اللي تخصه:

1. **Phase 1: Architecture & Codebase Review (الأساس التقني)** 🛠️
   - التركيز: بنية النظام، قاعدة البيانات، بيئة العمل.
2. **Phase 2: Security & Payment Workflows (الأمان والماليات)** 💰
   - التركيز: تأمين الدفع، حماية البيانات، وإدارة الحجوزات والتقسيط.
3. **Phase 3: User Experience & Business Logic (تجربة المستخدم والبيزنس)** 🎨
   - التركيز: رحلة التسجيل، لوحة التحكم، الإشعارات، الـ CRM، وبريد الـ Onboarding.
4. **Phase 4: Marketing, SEO & Conversion (التسويق والمنافسة)** 🚀
   - التركيز: الـ Conversion rates، مقارنة المنافسين، ومؤشرات الأداء (KPIs).

---

## 3. Tasks per Agent per Phase

### Phase 1: Architecture & Codebase Review
- **Lead Architect:** مراجعة الـ PRD مع هيكل الـ Next.js و Payload.
- **Database Engineer:** فحص `payload.config.ts` والـ Collections.
- **DevOps Engineer:** مراجعة `docker-compose.yml` وسيرفر الـ Coolify.
- **Frontend Engineer:** مراجعة الـ Server/Client Components و`i18n`.

### Phase 2: Security & Payment Workflows
- **Security Engineer:** مراجعة مسارات التحقق وصلاحيات الـ CMS (`access-control`).
- **Backend Engineer:** فحص Webhooks الدفع والتعامل المالي.
- **QA Engineer:** إنشاء Test Cases لفشل الدفعات.
- **Finance Manager:** اختبار استخراج التقارير وربط التقسيطات بالـ CRM.

### Phase 3: User Experience & Business Logic
- **Individual Learner & New Visitor:** محاكاة حية للاشتراك أو حجز كورس والاستشارات الـ 1:1.
- **Instructor & Admin:** تجربة لوحة التحاضر والأدمن.
- **Sales Rep:** التأكد من مزامنة Twenty CRM (`mappers.ts` & `service.ts`).
- **Customer Support:** مراجعة رسائل الويب، وفهم أسباب Error ID.

### Phase 4: Marketing, SEO & Conversion
- **SEO & CMO:** فحص الـ Metadata والـ OpenGraph و Branding.
- **Competitor Analyst:** عمل جدول مقارنة بالمنافسين الكبار (Udemy, Coursera).
- **Conversion Analyst & Growth Hacker:** استخراج فرص تحسين الـ UX لرفع المبيعات (Upsell / Cross-sell).
- **Data Analyst:** التأكد من صلاحية أدوات التتبع وتجميع الـ Events.

---

## 4. Report Template (شكل التقارير)

كل Agent هيقدم التقرير بتاعه بالصيغة الموحدة دي جوه فولدر `docs/reports/`:

```markdown
# [Agent Role] Audit Report - Next Academy

**Date:** YYYY-MM-DD
**Agent Focus:** [e.g., Security, Conversion, Database]
**Phase:** [1 to 4]

## 1. Executive Summary
(ملخص التقييم العام من وجهة نظر الوكيل في سطرين)

## 2. Findings (المكتشفات والمشاكل)
| Severity | Component | Issue Description |
|---|---|---|
| 🔴 High | [x] | [Description] |
| 🟡 Med | [y] | [Description] |
| 🟢 Low | [z] | [Description] |

## 3. Competitor Comparison (إن وجد)
- **Next Academy:** ...
- **[Competitor Name]:** ...

## 4. Actionable Fixes (خطوات الحل)
- [ ] Task 1...
- [ ] Task 2...

## 5. Metrics to Track (لو تم تطبيق الحل)
- [Metric 1]
- [Metric 2]
```
