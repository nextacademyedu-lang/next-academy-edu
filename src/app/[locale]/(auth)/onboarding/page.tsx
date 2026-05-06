'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';
import { OnboardingStep1, type Step1Data } from '@/components/onboarding/step-1';
import { OnboardingStep2, type Step2Data } from '@/components/onboarding/step-2';
import { OnboardingStep3, type Step3Data } from '@/components/onboarding/step-3';
import { getDashboardPath } from '@/lib/role-redirect';
import styles from '@/components/onboarding/onboarding.module.css';

const TOTAL_STEPS = 3;

interface Tag {
  id: string;
  name: string;
}

const REQUIRED_STEP_FIELDS: Record<number, string[]> = {
  1: ['firstName', 'lastName', 'jobTitle', 'workField'],
  2: ['phone', 'country', 'company'],
  3: [],
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const t = useTranslations('Auth');
  const locale = useLocale();

  const stepLabelKeys = [
    t('stepProfessionalInfo'),
    locale === 'ar' ? 'معلومات الشركة والموقع' : 'Location & Company',
    t('stepLearningGoals'),
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Capture Role
  const role = searchParams.get('role') === 'instructor' ? 'instructor' : 'student';

  // Step data
  const [step1, setStep1] = useState<Step1Data>({
    title: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    workField: '',
    workFieldOther: '',
    yearsOfExperience: '',
    gender: '',
  });

  const [step2, setStep2] = useState<Step2Data>({
    phone: '',
    country: '',
    city: '',
    company: '',
    companySize: '',
  });

  const [step3, setStep3] = useState<Step3Data>({
    interests: [],
    customInterests: '',
    learningGoals: '',
    howDidYouHear: '',
    howDidYouHearOther: '',
  });

  // Fetch metadata for onboarding form
  useEffect(() => {
    async function fetchOnboardingMetadata() {
      try {
        const tagsRes = await fetch('/api/tags?limit=100&depth=0');
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          const tags = (tagsData.docs || [])
            .map((tag: { id: string; nameAr?: string; nameEn?: string }) => ({
              id: String(tag.id),
              name: tag.nameAr || tag.nameEn || '',
            }))
            .filter((tag: Tag) => tag.name.length > 0);
          setAvailableTags(tags);
        }
      } catch {
        // Non-critical
      }
    }
    fetchOnboardingMetadata();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      router.replace(`/${locale}`);
    }
  }, [isLoaded, user, router, locale]);

  // Prefill user data from Clerk
  useEffect(() => {
    if (user && (!step1.firstName && !step1.lastName)) {
      setStep1(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));
    }
  }, [user]);

  const isStepValid = (step: number): boolean => {
    const fields = REQUIRED_STEP_FIELDS[step];
    if (!fields) return true;

    const dataMap: Record<number, Record<string, unknown>> = {
      1: step1 as unknown as Record<string, unknown>,
      2: step2 as unknown as Record<string, unknown>,
      3: step3 as unknown as Record<string, unknown>,
    };
    const data = dataMap[step];

    return fields.every((f) => {
      const val = data[f];
      return typeof val === 'string' && val.trim().length > 0;
    });
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      setError(t('fillAllFields'));
      return;
    }
    setError('');
    setCurrentStep((c) => Math.min(c + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((c) => Math.max(c - 1, 1));
  };

  const handleComplete = async () => {
    if (!isStepValid(currentStep)) {
      setError(t('fillAllFields'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const saveRes = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step1: { ...step1, ...step2 },
          step3,
          role,
        }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({}));
        throw new Error(errData?.error || 'Save failed');
      }

      await user?.reload(); // Refresh clerk user data
      
      const dashboardPath = getDashboardPath(role as any, locale);
      router.push(dashboardPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || !user) return <div style={{display:'flex', justifyContent:'center', marginTop:'100px'}}><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('onboardingTitle')}</h1>
        <p className={styles.subtitle}>{t('onboardingSubtitle')}</p>
      </div>

      {/* Progress Dots */}
      <div className={styles.progress}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const stepNum = i + 1;
          return (
            <React.Fragment key={stepNum}>
              <div
                className={`${styles.stepDot} ${
                  stepNum === currentStep ? styles.active : ''
                } ${stepNum < currentStep ? styles.completed : ''}`}
              >
                {stepNum < currentStep ? '' : stepNum}
              </div>
              {stepNum < TOTAL_STEPS && (
                <div
                  className={`${styles.stepLine} ${
                    stepNum < currentStep ? styles.completedLine : ''
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <p className={styles.stepLabel}>
        {t('stepLabel', {
          current: currentStep,
          total: TOTAL_STEPS,
          name: stepLabelKeys[currentStep - 1],
        })}
      </p>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {currentStep === 1 && (
            <OnboardingStep1 data={step1} onChange={setStep1} />
          )}
          {currentStep === 2 && (
            <OnboardingStep2 data={step2} onChange={setStep2} />
          )}
          {currentStep === 3 && (
            <OnboardingStep3
              data={step3}
              onChange={setStep3}
              availableTags={availableTags}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className={styles.actions}>
        {currentStep > 1 && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
          >
            {t('back')}
          </button>
        )}

        {(!REQUIRED_STEP_FIELDS[currentStep] || REQUIRED_STEP_FIELDS[currentStep].length === 0) && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={currentStep < TOTAL_STEPS ? handleNext : handleComplete}
            disabled={isLoading}
          >
            {locale === 'ar' ? 'تخطي' : 'Skip'}
          </button>
        )}

        {currentStep < TOTAL_STEPS ? (
          <button
            type="button"
            className={styles.nextBtn}
            onClick={handleNext}
          >
            {t('next')}
          </button>
        ) : (
          <button
            type="button"
            className={styles.nextBtn}
            onClick={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                {t('saving')}
              </>
            ) : (
              t('complete')
            )}
          </button>
        )}
      </div>
    </div>
  );
}
