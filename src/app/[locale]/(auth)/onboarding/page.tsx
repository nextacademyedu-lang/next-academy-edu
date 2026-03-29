'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/context/auth-context';
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

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('Auth');
  const locale = useLocale();

  const stepLabelKeys = [
    t('stepProfessionalInfo'),
    t('stepCompanyLocation'),
    t('stepLearningGoals'),
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Step data
  const [step1, setStep1] = useState<Step1Data>({
    title: '',
    jobTitle: '',
    workField: '',
    yearsOfExperience: '',
  });

  const [step2, setStep2] = useState<Step2Data>({
    company: '',
    companySize: '',
    companyType: '',
    country: '',
    city: '',
  });

  const [step3, setStep3] = useState<Step3Data>({
    interests: [],
    learningGoals: '',
    howDidYouHear: '',
  });

  // Fetch tags for Step 3
  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch('/api/tags?limit=50&depth=0');
        if (res.ok) {
          const data = await res.json();
          const tags = (data.docs || []).map((tag: { id: string; name?: string; title?: string }) => ({
            id: tag.id,
            name: tag.name || tag.title || 'Unnamed',
          }));
          setAvailableTags(tags);
        }
      } catch {
        // Non-critical: tags just won't appear
      }
    }
    fetchTags();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.replace(`/${locale}/login`);
    }
  }, [user, router, locale]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError('');
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const resolveCompanyId = async (): Promise<number | undefined> => {
        const companyName = step2.company.trim();
        if (!companyName) return undefined;

        const findRes = await fetch(
          `/api/companies?where[name][equals]=${encodeURIComponent(companyName)}&limit=1&depth=0`,
        );

        if (findRes.ok) {
          const findData = await findRes.json();
          const existingId = findData?.docs?.[0]?.id;
          if (existingId) return Number(existingId);
        }

        const createRes = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: companyName,
            size: step2.companySize || undefined,
            type: step2.companyType || undefined,
            country: step2.country || undefined,
            city: step2.city || undefined,
          }),
        });

        if (!createRes.ok) return undefined;
        const createData = await createRes.json();
        const createdId = createData?.doc?.id;
        if (!createdId) return undefined;
        return Number(createdId);
      };

      const companyId = await resolveCompanyId();
      if (user?.role === 'b2b_manager' && !companyId) {
        setError('Company name is required for B2B manager onboarding.');
        setIsLoading(false);
        return;
      }

      // Find or create user profile
      const profileRes = await fetch(
        `/api/user-profiles?where[user][equals]=${user?.id}&depth=0`,
      );
      const profileData = await profileRes.json();
      const existingProfile = profileData.docs?.[0];

      const profilePayload = {
        user: user?.id,
        title: step1.title || undefined,
        jobTitle: step1.jobTitle || undefined,
        workField: step1.workField || undefined,
        yearsOfExperience: step1.yearsOfExperience || undefined,
        company: companyId || undefined,
        companySize: step2.companySize || undefined,
        companyType: step2.companyType || undefined,
        country: step2.country || undefined,
        city: step2.city || undefined,
        interests: step3.interests.length > 0 ? step3.interests : undefined,
        learningGoals: step3.learningGoals || undefined,
        howDidYouHear: step3.howDidYouHear || undefined,
        onboardingCompleted: true,
        onboardingStep: TOTAL_STEPS,
      };

      // Remove undefined keys
      const cleanPayload = Object.fromEntries(
        Object.entries(profilePayload).filter(([, v]) => v !== undefined),
      );

      if (existingProfile) {
        await fetch(`/api/user-profiles/${existingProfile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanPayload),
        });
      } else {
        await fetch('/api/user-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanPayload),
        });
      }

      const role = user?.role || 'user';
      const dashboardPath = getDashboardPath(role, locale);
      router.push(dashboardPath);
    } catch {
      setError(t('somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    const role = user?.role || 'user';
    const dashboardPath = getDashboardPath(role, locale);
    router.push(dashboardPath);
  };

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

      <div className={styles.skipLink}>
        <button type="button" onClick={handleSkip}>
          {t('skipForNow')}
        </button>
      </div>
    </div>
  );
}
