'use client';

import { useTranslations, useLocale } from 'next-intl';
import styles from './onboarding.module.css';

export interface Step1Data {
  title: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  workField: string;
  workFieldOther: string;
  yearsOfExperience: string;
  gender: string;
}

interface Step1Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}

const TITLE_OPTIONS = ['', 'Mr', 'Mrs', 'Dr', 'Eng', 'Prof'];
const EXPERIENCE_OPTIONS = ['', '0-2', '3-5', '6-10', '10+'];

export function OnboardingStep1({ data, onChange }: Step1Props) {
  const t = useTranslations('Auth');
  const locale = useLocale();

  const update = (field: keyof Step1Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const WORK_FIELD_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: t('selectField') },
    { value: 'Marketing', label: t('fieldMarketing') },
    { value: 'Sales', label: t('fieldSales') },
    { value: 'Tech', label: t('fieldTech') },
    { value: 'Finance', label: t('fieldFinance') },
    { value: 'Operations', label: t('fieldOperations') },
    { value: 'HR', label: t('fieldHR') },
    { value: 'Legal', label: t('fieldLegal') },
    { value: 'Education', label: t('fieldEducation') },
    { value: 'Healthcare', label: t('fieldHealthcare') },
    { value: 'Engineering', label: t('fieldEngineering') },
    { value: 'Design', label: t('fieldDesign') },
    { value: 'Entrepreneurship', label: t('fieldEntrepreneurship') },
    { value: 'Consulting', label: t('fieldConsulting') },
    { value: 'Media', label: t('fieldMedia') },
    { value: 'Other', label: t('fieldOther') },
  ];

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-firstName">
            {locale === 'ar' ? 'الاسم الأول' : 'First Name'}
          </label>
          <input
            id="ob-firstName"
            className={styles.input}
            type="text"
            placeholder={locale === 'ar' ? 'أدخل اسمك الأول' : 'Enter first name'}
            value={data.firstName}
            onChange={(e) => update('firstName', e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-lastName">
            {locale === 'ar' ? 'الاسم الأخير' : 'Last Name'}
          </label>
          <input
            id="ob-lastName"
            className={styles.input}
            type="text"
            placeholder={locale === 'ar' ? 'أدخل اسم العائلة' : 'Enter last name'}
            value={data.lastName}
            onChange={(e) => update('lastName', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-title">
            {t('titleLabel')}
          </label>
          <select
            id="ob-title"
            className={styles.select}
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
          >
            {TITLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt || t('selectTitle')}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-experience">
            {t('experienceLabel')}
          </label>
          <select
            id="ob-experience"
            className={styles.select}
            value={data.yearsOfExperience}
            onChange={(e) => update('yearsOfExperience', e.target.value)}
          >
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt ? t('yearsUnit', { range: opt }) : t('selectExperience')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-jobTitle">
            {t('jobTitleLabel')}
          </label>
          <input
            id="ob-jobTitle"
            className={styles.input}
            type="text"
            placeholder={t('jobTitlePlaceholder')}
            value={data.jobTitle}
            onChange={(e) => update('jobTitle', e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-gender">
            {t('genderLabel')}
          </label>
          <select
            id="ob-gender"
            className={styles.select}
            value={data.gender}
            onChange={(e) => update('gender', e.target.value)}
          >
            <option value="">{t('selectGender')}</option>
            <option value="male">{t('genderMale')}</option>
            <option value="female">{t('genderFemale')}</option>
          </select>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="ob-workField">
          {t('workFieldLabel')}
        </label>
        <select
          id="ob-workField"
          className={styles.select}
          value={data.workField}
          onChange={(e) => {
            const newField = e.target.value;
            onChange({
              ...data,
              workField: newField,
              workFieldOther: newField !== 'Other' ? '' : data.workFieldOther,
            });
          }}
        >
          {WORK_FIELD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {data.workField === 'Other' && (
          <input
            id="ob-workFieldOther"
            className={`${styles.input} ${styles.marginTop || ''}`}
            style={{ marginTop: '10px' }}
            type="text"
            placeholder={t('workFieldOtherPlaceholder')}
            value={data.workFieldOther}
            onChange={(e) => update('workFieldOther', e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
