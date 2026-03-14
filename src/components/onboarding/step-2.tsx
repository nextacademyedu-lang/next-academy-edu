'use client';

import { useTranslations } from 'next-intl';
import styles from './onboarding.module.css';

interface Step2Data {
  company: string;
  companySize: string;
  companyType: string;
  country: string;
  city: string;
}

interface Step2Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}

const COMPANY_SIZE_OPTIONS = ['', '1-10', '11-50', '51-200', '201-500', '500+'];

export function OnboardingStep2({ data, onChange }: Step2Props) {
  const t = useTranslations('Auth');

  const update = (field: keyof Step2Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const COMPANY_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: t('selectType') },
    { value: 'startup', label: t('typeStartup') },
    { value: 'sme', label: t('typeSME') },
    { value: 'enterprise', label: t('typeEnterprise') },
    { value: 'government', label: t('typeGovernment') },
    { value: 'freelancer', label: t('typeFreelancer') },
  ];

  return (
    <div className={styles.form}>
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="ob-company">
          {t('companyName')}
        </label>
        <input
          id="ob-company"
          className={styles.input}
          type="text"
          placeholder={t('companyPlaceholder')}
          value={data.company}
          onChange={(e) => update('company', e.target.value)}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-companySize">
            {t('companySize')}
          </label>
          <select
            id="ob-companySize"
            className={styles.select}
            value={data.companySize}
            onChange={(e) => update('companySize', e.target.value)}
          >
            {COMPANY_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt ? t('employeesUnit', { range: opt }) : t('selectSize')}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-companyType">
            {t('companyType')}
          </label>
          <select
            id="ob-companyType"
            className={styles.select}
            value={data.companyType}
            onChange={(e) => update('companyType', e.target.value)}
          >
            {COMPANY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-country">
            {t('country')}
          </label>
          <input
            id="ob-country"
            className={styles.input}
            type="text"
            placeholder={t('countryPlaceholder')}
            value={data.country}
            onChange={(e) => update('country', e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-city">
            {t('city')}
          </label>
          <input
            id="ob-city"
            className={styles.input}
            type="text"
            placeholder={t('cityPlaceholder')}
            value={data.city}
            onChange={(e) => update('city', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export type { Step2Data };
