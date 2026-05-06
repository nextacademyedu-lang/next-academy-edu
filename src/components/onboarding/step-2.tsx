'use client';

import { useTranslations, useLocale } from 'next-intl';
import styles from './onboarding.module.css';

interface Step2Data {
  country: string;
  city: string;
  phone: string;
  company: string;
  companySize: string;
}

interface Step2Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}

export const MENA_COUNTRIES = [
  { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', dialCode: '+20' },
  { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', dialCode: '+966' },
  { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE', dialCode: '+971' },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', dialCode: '+965' },
  { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', dialCode: '+974' },
  { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', dialCode: '+973' },
  { code: 'OM', nameAr: 'عمان', nameEn: 'Oman', dialCode: '+968' },
  { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', dialCode: '+962' },
  { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', dialCode: '+212' },
  { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', dialCode: '+213' },
  { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', dialCode: '+216' },
  { code: 'OTHER', nameAr: 'دولة أخرى', nameEn: 'Other', dialCode: '' }
];

export function OnboardingStep2({ data, onChange }: Step2Props) {
  const t = useTranslations('Auth');
  const locale = useLocale();

  const update = (field: keyof Step2Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const countryObj = MENA_COUNTRIES.find(c => c.code === countryCode);
    const newCountryName = countryObj ? (locale === 'ar' ? countryObj.nameAr : countryObj.nameEn) : countryCode;
    
    // Auto-update phone code if phone is empty or exactly matches another dial code
    let newPhone = data.phone;
    if (countryObj && countryObj.dialCode) {
      const existingDialCodes = MENA_COUNTRIES.map(c => c.dialCode).filter(Boolean);
      if (!newPhone || existingDialCodes.includes(newPhone.trim())) {
        newPhone = countryObj.dialCode;
      }
    }

    onChange({
      ...data,
      country: newCountryName,
      phone: newPhone
    });
  };

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-country">
            {t('country')}
          </label>
          <select
            id="ob-country"
            className={styles.select}
            value={MENA_COUNTRIES.find(c => c.nameAr === data.country || c.nameEn === data.country)?.code || ''}
            onChange={handleCountryChange}
          >
            <option value="">{locale === 'ar' ? 'اختر الدولة...' : 'Select Country...'}</option>
            {MENA_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {locale === 'ar' ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
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

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="ob-phone">
          {t('phoneLabel')}
        </label>
        <input
          id="ob-phone"
          className={styles.input}
          type="tel"
          dir="ltr"
          placeholder={t('phonePlaceholder')}
          value={data.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-company">
            {locale === 'ar' ? 'اسم الشركة / المؤسسة' : 'Company Name'}
          </label>
          <input
            id="ob-company"
            className={styles.input}
            type="text"
            placeholder={locale === 'ar' ? 'أدخل اسم الشركة' : 'Enter company name'}
            value={data.company}
            onChange={(e) => update('company', e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ob-companySize">
            {locale === 'ar' ? 'حجم الشركة' : 'Company Size'}
          </label>
          <select
            id="ob-companySize"
            className={styles.select}
            value={data.companySize}
            onChange={(e) => update('companySize', e.target.value)}
          >
            <option value="">{locale === 'ar' ? 'اختر الحجم...' : 'Select size...'}</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export type { Step2Data };

