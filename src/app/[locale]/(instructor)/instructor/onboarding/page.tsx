"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import styles from './page.module.css';

/* ─────────────────────────────────────────────────────
   Agreement Clauses — 10 total (6 official + 4 platform)
   ───────────────────────────────────────────────────── */
const AGREEMENT_CLAUSES = [
  {
    id: 'financial_partnership',
    titleAr: 'بند الشراكة المالية',
    titleEn: 'Financial Partnership',
    textAr:
      'أوافق على أن تكون حصتي كمحاضر وشريك نجاح هي 30% من صافي أرباح الكورسات أو الورش، ويتم تسويتها حسب النظام المالي المعتمد في نكست أكاديمي.',
    textEn:
      'I agree that my share as an instructor and success partner is 30% of net course/workshop profits, settled per Next Academy\'s approved financial system.',
  },
  {
    id: 'co_marketing',
    titleAr: 'بند التسويق المشترك',
    titleEn: 'Co-Marketing',
    textAr:
      'أتعهد بالمشاركة الفعّالة في الحملة التسويقية للكورس من خلال تصوير فيديوهات قصيرة (ريلز)، ونشر التصميمات والبوستات التي ستوفرها لي إدارة نكست أكاديمي على منصاتي وحساباتي الشخصية لدعم المبيعات.',
    textEn:
      'I commit to actively participate in course marketing by filming short videos (reels) and sharing designs/posts provided by Next Academy on my personal platforms to support sales.',
  },
  {
    id: 'broadcast_quality',
    titleAr: 'بند التفاعل وجودة البث',
    titleEn: 'Interaction & Broadcast Quality',
    textAr:
      'ألتزم التزاماً تاماً بفتح الكاميرا الخاصة بي طوال مدة المحاضرة الأونلاين من البداية للنهاية، لضمان أعلى جودة تواصل وبناء ثقة مع المتدربين.',
    textEn:
      'I fully commit to keeping my camera ON throughout the entire online lecture from start to finish, to ensure maximum communication quality and build trust with trainees.',
  },
  {
    id: 'classroom_management',
    titleAr: 'بند إدارة القاعة الافتراضية',
    titleEn: 'Virtual Classroom Management',
    textAr:
      'أتعهد بتوجيه المتدربين وإلزامهم بفتح كاميراتهم أثناء الشرح والمناقشات، لضمان تركيزهم الكامل وخلق بيئة تفاعلية قوية تليق بمستوى نكست أكاديمي.',
    textEn:
      'I commit to directing trainees to keep their cameras on during instruction and discussions, ensuring full focus and creating a strong interactive environment befitting Next Academy\'s standards.',
  },
  {
    id: 'materials_branding',
    titleAr: 'بند المادة العلمية والهوية',
    titleEn: 'Course Materials & Branding',
    textAr:
      'أوافق على تسليم المادة العلمية والعروض التقديمية لإدارة الأكاديمية قبل موعد الانطلاق بوقت كافٍ، مع الالتزام باستخدام القوالب والهوية البصرية الخاصة بنكست أكاديمي أثناء الشرح.',
    textEn:
      'I agree to deliver course materials and presentations to the academy well before the launch date, and commit to using Next Academy\'s templates and visual branding during instruction.',
  },
  {
    id: 'professionalism',
    titleAr: 'بند الالتزام والاحترافية',
    titleEn: 'Commitment & Professionalism',
    textAr:
      'أتعهد بالالتزام الصارم بمواعيد بدء وانتهاء الجلسات، واحترام وقت المتدربين، وعدم الترويج لأي جهات أو خدمات خارجية منافسة أثناء المحاضرة.',
    textEn:
      'I commit to strict adherence to session start/end times, respecting trainees\' time, and not promoting any competing external services during lectures.',
  },
  {
    id: 'consultations',
    titleAr: 'بند الاستشارات',
    titleEn: 'Consultations',
    textAr:
      'يحصل المدرب على 50% من صافي إيرادات الاستشارات الفردية.',
    textEn:
      'The instructor receives 50% of net individual consultation revenue.',
  },
  {
    id: 'cancellation_policy',
    titleAr: 'بند سياسة الإلغاء',
    titleEn: 'Cancellation Policy',
    textAr:
      'لا يمكن إلغاء الدورات أو الراوندات قبل موعد البدء بأقل من 15 يوماً.',
    textEn:
      'Courses/rounds cannot be cancelled less than 15 days before the start date.',
  },
  {
    id: 'financial_settlement',
    titleAr: 'بند التسوية المالية',
    titleEn: 'Financial Settlement',
    textAr:
      'يتم تحويل المستحقات شهرياً عن الدورات والاستشارات المكتملة.',
    textEn:
      'Payments are processed monthly for completed courses and consultations.',
  },
  {
    id: 'termination',
    titleAr: 'بند إنهاء الاتفاقية',
    titleEn: 'Agreement Termination',
    textAr:
      'يمكن لأي طرف إنهاء الاتفاقية بإشعار كتابي قبل 30 يوماً.',
    textEn:
      'Either party may terminate the agreement with 30 days\' written notice.',
  },
];

/* ─────────────────────────────────────────────────────
   Form Types
   ───────────────────────────────────────────────────── */
interface ProfileForm {
  firstName: string;
  lastName: string;
  jobTitle: string;
  tagline: string;
  linkedinUrl: string;
  twitterUrl: string;
}

interface ProgramForm {
  type: string;
  titleAr: string;
  titleEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryName: string;
  durationHours: string;
  sessionsCount: string;
  language: string;
  level: string;
  price: string;
  currency: string;
  objectivesText: string;
  requirementsText: string;
  targetAudienceText: string;
  extraNotes: string;
  roundsCount: string;
  previousTraineesCount: string;
  isFirstTimeProgram: 'yes' | 'no';
  teachingExperienceYears: string;
  deliveryHistoryText: string;
}

/* ─────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────── */
export default function InstructorOnboardingPage() {
  const router = useRouter();
  const locale = useLocale();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1 form
  const [profile, setProfile] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    tagline: '',
    linkedinUrl: '',
    twitterUrl: '',
  });

  // Step 2 form
  const [program, setProgram] = useState<ProgramForm>({
    type: 'course',
    titleAr: '',
    titleEn: '',
    shortDescriptionAr: '',
    shortDescriptionEn: '',
    descriptionAr: '',
    descriptionEn: '',
    categoryName: '',
    durationHours: '',
    sessionsCount: '1',
    language: 'ar',
    level: 'beginner',
    price: '',
    currency: 'EGP',
    objectivesText: '',
    requirementsText: '',
    targetAudienceText: '',
    extraNotes: '',
    roundsCount: '1',
    previousTraineesCount: '',
    isFirstTimeProgram: 'yes',
    teachingExperienceYears: '',
    deliveryHistoryText: '',
  });

  // Step 3 agreement
  const [acceptedClauses, setAcceptedClauses] = useState<Set<string>>(new Set());

  const toggleClause = (id: string) => {
    setAcceptedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError('');
  };

  const allClausesAccepted = acceptedClauses.size === AGREEMENT_CLAUSES.length;

  /* ── Validation ──────────────────────────────────── */
  const validateStep1 = () => {
    if (!profile.firstName.trim()) return 'الاسم الأول مطلوب / First name is required';
    if (!profile.lastName.trim()) return 'اسم العائلة مطلوب / Last name is required';
    if (!profile.jobTitle.trim()) return 'المسمى الوظيفي مطلوب / Job title is required';
    if (!profile.tagline.trim()) return 'الشعار مطلوب / Tagline is required';
    if (!profile.linkedinUrl.trim()) return 'رابط LinkedIn مطلوب / LinkedIn URL is required';
    return null;
  };

  const validateStep2 = () => {
    if (!program.type.trim()) return 'نوع البرنامج مطلوب / Program type is required';
    if (!program.titleAr.trim()) return 'عنوان الكورس بالعربي مطلوب / Arabic title is required';
    if (!program.titleEn.trim()) return 'عنوان الكورس بالإنجليزي مطلوب / English title is required';
    if (!program.shortDescriptionAr.trim()) return 'الوصف المختصر بالعربي مطلوب / Arabic short description is required';
    if (!program.shortDescriptionEn.trim()) return 'الوصف المختصر بالإنجليزي مطلوب / English short description is required';
    if (!program.descriptionAr.trim()) return 'الوصف الكامل بالعربي مطلوب / Arabic description is required';
    if (!program.descriptionEn.trim()) return 'الوصف الكامل بالإنجليزي مطلوب / English description is required';
    if (!program.categoryName.trim()) return 'التصنيف مطلوب / Category is required';
    const sc = Number(program.sessionsCount);
    if (!Number.isFinite(sc) || sc <= 0) return 'عدد الجلسات لازم يكون أكبر من 0 / Sessions count must be > 0';
    const duration = Number(program.durationHours);
    if (!Number.isFinite(duration) || duration <= 0) return 'مدة البرنامج بالساعات مطلوبة / Duration must be greater than 0';
    const rounds = Number(program.roundsCount);
    if (!Number.isFinite(rounds) || rounds <= 0) return 'عدد الراوندات مطلوب / Rounds count must be greater than 0';
    const price = Number(program.price);
    if (!Number.isFinite(price) || price <= 0) return 'السعر مطلوب / Price must be greater than 0';
    if (!program.currency.trim()) return 'العملة مطلوبة / Currency is required';
    if (!program.language.trim()) return 'اللغة مطلوبة / Language is required';
    if (!program.level.trim()) return 'المستوى مطلوب / Level is required';
    if (!program.objectivesText.trim()) return 'الأهداف مطلوبة / Objectives are required';
    if (!program.requirementsText.trim()) return 'المتطلبات مطلوبة / Requirements are required';
    if (!program.targetAudienceText.trim()) return 'الجمهور المستهدف مطلوب / Target audience is required';
    if (!program.extraNotes.trim()) return 'الملاحظات الإضافية مطلوبة / Extra notes are required';
    if (!program.previousTraineesCount.trim()) return 'عدد المتدربين السابق مطلوب / Previous trainees count is required';
    const previousTrainees = Number(program.previousTraineesCount);
    if (!Number.isFinite(previousTrainees) || previousTrainees < 0) return 'عدد المتدربين السابق مطلوب / Previous trainees count is required';
    if (program.isFirstTimeProgram !== 'yes' && program.isFirstTimeProgram !== 'no') return 'حدد إذا كانت أول مرة أم لا / Choose yes or no for first-time delivery';
    if (!program.teachingExperienceYears.trim()) return 'سنوات الخبرة مطلوبة / Teaching experience years are required';
    const experienceYears = Number(program.teachingExperienceYears);
    if (!Number.isFinite(experienceYears) || experienceYears < 0) return 'سنوات الخبرة مطلوبة / Teaching experience years are required';
    if (!program.deliveryHistoryText.trim()) return 'ملخص خبرتك السابقة مطلوب / Previous delivery summary is required';
    return null;
  };

  /* ── Navigation ──────────────────────────────────── */
  const goNext = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  /* ── Submit ──────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!allClausesAccepted) {
      setError('يجب الموافقة على جميع البنود / All clauses must be accepted');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/instructor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          profile,
          program: {
            ...program,
            durationHours: Number(program.durationHours),
            sessionsCount: Number(program.sessionsCount),
            price: Number(program.price),
            roundsCount: Number(program.roundsCount),
            previousTraineesCount: Number(program.previousTraineesCount),
            teachingExperienceYears: Number(program.teachingExperienceYears),
          },
          clausesAccepted: Array.from(acceptedClauses),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setSaving(false);
        return;
      }

      // Redirect to instructor dashboard
      router.push(`/${locale}/instructor`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  };

  /* ── Step Indicator ──────────────────────────────── */
  const stepLabels = ['Profile', 'Program', 'Agreement'];

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.header}>
        <h1>Welcome to Next Academy</h1>
        <p>Complete your setup to start teaching</p>
      </div>

      {/* Steps indicator */}
      <div className={styles.steps}>
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          return (
            <React.Fragment key={label}>
              {i > 0 && (
                <div className={`${styles.stepConnector} ${isCompleted ? styles.active : ''}`} />
              )}
              <div
                className={`${styles.stepItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              >
                <div className={styles.stepCircle}>
                  {isCompleted ? <Check size={16} /> : stepNum}
                </div>
                <span>{label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {/* ── Step 1: Profile ────────────────────────── */}
      {step === 1 && (
        <div className={styles.formCard}>
          <h2 className={styles.stepTitle}>بياناتك الشخصية / Your Profile</h2>
          <p className={styles.stepSubtitle}>Basic information about you as an instructor</p>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>الاسم الأول / First Name *</label>
              <input
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="Ahmed"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>اسم العائلة / Last Name *</label>
              <input
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Mohamed"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>المسمى الوظيفي / Job Title *</label>
              <input
                value={profile.jobTitle}
                onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
                placeholder="Software Engineer, Business Coach..."
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>الشعار / Tagline *</label>
              <input
                value={profile.tagline}
                onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
                placeholder="Helping professionals grow..."
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>LinkedIn *</label>
              <input
                type="url"
                value={profile.linkedinUrl}
                onChange={(e) => setProfile((p) => ({ ...p, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>X / Twitter</label>
              <input
                type="url"
                value={profile.twitterUrl}
                onChange={(e) => setProfile((p) => ({ ...p, twitterUrl: e.target.value }))}
                placeholder="https://x.com/yourhandle"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <div />
            <button className={styles.btnPrimary} onClick={goNext}>
              التالي / Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Program ────────────────────────── */}
      {step === 2 && (
        <div className={styles.formCard}>
          <h2 className={styles.stepTitle}>تفاصيل أول كورس / First Program Details</h2>
          <p className={styles.stepSubtitle}>Tell us about the course or workshop you want to offer</p>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>النوع / Type *</label>
              <select
                value={program.type}
                onChange={(e) => setProgram((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="course">Course / دورة</option>
                <option value="workshop">Workshop / ورشة</option>
                <option value="webinar">Webinar / ويبينار</option>
                <option value="camp">Camp / معسكر</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>عدد الجلسات / Sessions *</label>
              <input
                type="number"
                min={1}
                value={program.sessionsCount}
                onChange={(e) => setProgram((p) => ({ ...p, sessionsCount: e.target.value }))}
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>العنوان بالعربي / Arabic Title *</label>
              <input
                value={program.titleAr}
                onChange={(e) => setProgram((p) => ({ ...p, titleAr: e.target.value }))}
                dir="rtl"
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>العنوان بالإنجلش / English Title *</label>
              <input
                value={program.titleEn}
                onChange={(e) => setProgram((p) => ({ ...p, titleEn: e.target.value }))}
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>وصف مختصر بالعربي / Arabic Short Description *</label>
              <textarea
                rows={3}
                value={program.shortDescriptionAr}
                onChange={(e) => setProgram((p) => ({ ...p, shortDescriptionAr: e.target.value }))}
                dir="rtl"
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>وصف مختصر بالإنجلش / English Short Description *</label>
              <textarea
                rows={3}
                value={program.shortDescriptionEn}
                onChange={(e) => setProgram((p) => ({ ...p, shortDescriptionEn: e.target.value }))}
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>الوصف الكامل بالعربي / Arabic Full Description *</label>
              <textarea
                rows={5}
                value={program.descriptionAr}
                onChange={(e) => setProgram((p) => ({ ...p, descriptionAr: e.target.value }))}
                dir="rtl"
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>الوصف الكامل بالإنجلش / English Full Description *</label>
              <textarea
                rows={5}
                value={program.descriptionEn}
                onChange={(e) => setProgram((p) => ({ ...p, descriptionEn: e.target.value }))}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>المدة بالساعات / Duration (hours) *</label>
              <input
                type="number"
                min={0}
                value={program.durationHours}
                onChange={(e) => setProgram((p) => ({ ...p, durationHours: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>عدد الراوندات / Rounds Count *</label>
              <input
                type="number"
                min={1}
                value={program.roundsCount}
                onChange={(e) => setProgram((p) => ({ ...p, roundsCount: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>السعر / Price *</label>
              <input
                type="number"
                min={0}
                value={program.price}
                onChange={(e) => setProgram((p) => ({ ...p, price: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>العملة / Currency *</label>
              <select
                value={program.currency}
                onChange={(e) => setProgram((p) => ({ ...p, currency: e.target.value }))}
              >
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>اللغة / Language *</label>
              <select
                value={program.language}
                onChange={(e) => setProgram((p) => ({ ...p, language: e.target.value }))}
              >
                <option value="ar">عربي / Arabic</option>
                <option value="en">English / إنجليزي</option>
                <option value="both">Both / الاثنين</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>المستوى / Level *</label>
              <select
                value={program.level}
                onChange={(e) => setProgram((p) => ({ ...p, level: e.target.value }))}
              >
                <option value="beginner">مبتدئ / Beginner</option>
                <option value="intermediate">متوسط / Intermediate</option>
                <option value="advanced">متقدم / Advanced</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>التصنيف / Category *</label>
              <input
                value={program.categoryName}
                onChange={(e) => setProgram((p) => ({ ...p, categoryName: e.target.value }))}
                placeholder="Marketing, Leadership..."
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>دربت كام متدرب قبل كده؟ / Previous Trainees Count *</label>
              <input
                type="number"
                min={0}
                value={program.previousTraineesCount}
                onChange={(e) => setProgram((p) => ({ ...p, previousTraineesCount: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>دي أول مرة تقدّم البرنامج؟ / First Time Delivering This Program? *</label>
              <select
                value={program.isFirstTimeProgram}
                onChange={(e) =>
                  setProgram((p) => ({
                    ...p,
                    isFirstTimeProgram: e.target.value === 'no' ? 'no' : 'yes',
                  }))
                }
              >
                <option value="yes">Yes / نعم</option>
                <option value="no">No / لا</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>سنوات الخبرة التدريبية / Teaching Experience (Years) *</label>
              <input
                type="number"
                min={0}
                value={program.teachingExperienceYears}
                onChange={(e) => setProgram((p) => ({ ...p, teachingExperienceYears: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>ملخص خبرتك السابقة / Previous Delivery Summary *</label>
              <textarea
                rows={3}
                value={program.deliveryHistoryText}
                onChange={(e) => setProgram((p) => ({ ...p, deliveryHistoryText: e.target.value }))}
                placeholder="اذكر أمثلة سابقة: نوع البرنامج، القطاع، النتائج..."
                dir="rtl"
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>الأهداف / Objectives *</label>
              <textarea
                rows={3}
                value={program.objectivesText}
                onChange={(e) => setProgram((p) => ({ ...p, objectivesText: e.target.value }))}
                placeholder="What will students learn? (one per line)"
                dir="rtl"
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>المتطلبات / Requirements *</label>
              <textarea
                rows={3}
                value={program.requirementsText}
                onChange={(e) => setProgram((p) => ({ ...p, requirementsText: e.target.value }))}
                placeholder="Prerequisites (one per line)"
                dir="rtl"
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>الجمهور المستهدف / Target Audience *</label>
              <textarea
                rows={3}
                value={program.targetAudienceText}
                onChange={(e) => setProgram((p) => ({ ...p, targetAudienceText: e.target.value }))}
                placeholder="Who is this for? (one per line)"
                dir="rtl"
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label>ملاحظات إضافية / Extra Notes *</label>
              <textarea
                rows={3}
                value={program.extraNotes}
                onChange={(e) => setProgram((p) => ({ ...p, extraNotes: e.target.value }))}
                dir="rtl"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={goBack}>← السابق / Back</button>
            <button className={styles.btnPrimary} onClick={goNext}>
              التالي / Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Agreement ──────────────────────── */}
      {step === 3 && (
        <div className={styles.formCard}>
          <h2 className={styles.stepTitle}>بنود الاتفاقية / Agreement Terms</h2>
          <p className={styles.stepSubtitle}>
            يرجى قراءة كل بند والموافقة عليه / Please read and accept each clause
          </p>

          <div className={styles.agreementSection}>
            {AGREEMENT_CLAUSES.map((clause, i) => (
              <div
                key={clause.id}
                className={`${styles.clauseCard} ${acceptedClauses.has(clause.id) ? styles.accepted : ''}`}
              >
                <div className={styles.clauseHeader}>
                  <div className={styles.clauseNumber}>{i + 1}</div>
                  <h3 className={styles.clauseTitle}>{clause.titleAr} / {clause.titleEn}</h3>
                </div>
                <div className={styles.clauseTexts}>
                  <p className={styles.clauseAr}>{clause.textAr}</p>
                  <p className={styles.clauseEn}>{clause.textEn}</p>
                </div>
                <label className={styles.clauseCheckbox}>
                  <input
                    type="checkbox"
                    checked={acceptedClauses.has(clause.id)}
                    onChange={() => toggleClause(clause.id)}
                  />
                  أوافق على هذا البند / I agree to this clause
                </label>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={goBack}>← السابق / Back</button>
            <button
              className={styles.btnPrimary}
              onClick={handleSubmit}
              disabled={!allClausesAccepted || saving}
            >
              {saving ? 'جاري الحفظ... / Saving...' : 'إتمام التسجيل / Complete Registration ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
