'use client';

import { useTranslations } from 'next-intl';
import styles from './onboarding.module.css';

interface Step3Data {
  interests: string[];
  learningGoals: string;
  howDidYouHear: string;
}

interface Step3Props {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  availableTags: Array<{ id: string; name: string }>;
}

export function OnboardingStep3({ data, onChange, availableTags }: Step3Props) {
  const t = useTranslations('Auth');

  const toggleInterest = (tagId: string) => {
    const current = data.interests;
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    onChange({ ...data, interests: updated });
  };

  const HOW_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: t('selectOption') },
    { value: 'website', label: t('howWebsite') },
    { value: 'whatsapp', label: t('howWhatsApp') },
    { value: 'social', label: t('howSocial') },
    { value: 'friend', label: t('howFriend') },
    { value: 'google', label: t('howGoogle') },
    { value: 'other', label: t('howOther') },
  ];

  return (
    <div className={styles.form}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>{t('interests')}</label>
        <div className={styles.tagsContainer}>
          {availableTags.length > 0 ? (
            availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`${styles.tagChip} ${data.interests.includes(tag.id) ? styles.selected : ''}`}
                onClick={() => toggleInterest(tag.id)}
              >
                {tag.name}
              </button>
            ))
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {t('noTagsAvailable')}
            </span>
          )}
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="ob-goals">
          {t('learningGoalsLabel')}
        </label>
        <textarea
          id="ob-goals"
          className={styles.textarea}
          placeholder={t('learningGoalsPlaceholder')}
          value={data.learningGoals}
          onChange={(e) => onChange({ ...data, learningGoals: e.target.value })}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="ob-how">
          {t('howDidYouHear')}
        </label>
        <select
          id="ob-how"
          className={styles.select}
          value={data.howDidYouHear}
          onChange={(e) => onChange({ ...data, howDidYouHear: e.target.value })}
        >
          {HOW_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export type { Step3Data };
