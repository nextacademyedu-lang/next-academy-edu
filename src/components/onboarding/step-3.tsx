'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './onboarding.module.css';

interface Step3Data {
  interests: string[];
  customInterests: string;
  learningGoals: string;
  howDidYouHear: string;
  howDidYouHearOther: string;
}

interface Step3Props {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  availableTags: Array<{ id: string; name: string }>;
}

export function OnboardingStep3({ data, onChange, availableTags }: Step3Props) {
  const t = useTranslations('Auth');
  const [customTagInput, setCustomTagInput] = useState('');

  const toggleInterest = (tagId: string) => {
    const current = data.interests;
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    onChange({ ...data, interests: updated });
  };

  const addCustomInterest = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    // Store custom interests as a comma-separated string
    const existing = data.customInterests
      ? data.customInterests.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (!existing.includes(trimmed)) {
      existing.push(trimmed);
    }
    onChange({ ...data, customInterests: existing.join(', ') });
    setCustomTagInput('');
  };

  const removeCustomInterest = (interest: string) => {
    const existing = data.customInterests
      ? data.customInterests.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const updated = existing.filter((i) => i !== interest);
    onChange({ ...data, customInterests: updated.join(', ') });
  };

  const customInterestList = data.customInterests
    ? data.customInterests.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const HOW_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: t('selectOption') },
    { value: 'website', label: t('howWebsite') },
    { value: 'whatsapp', label: t('howWhatsApp') },
    { value: 'social', label: t('howSocial') },
    { value: 'friend', label: t('howFriend') },
    { value: 'google', label: t('howGoogle') },
    { value: 'linkedin', label: t('howLinkedIn') },
    { value: 'youtube', label: t('howYouTube') },
    { value: 'other', label: t('howOther') },
  ];

  return (
    <div className={styles.form}>
      {/* Interests from DB Tags */}
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

      {/* Custom interests the user can type */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>{t('customInterestsLabel')}</label>
        <div className={styles.customTagRow}>
          <input
            className={styles.input}
            type="text"
            placeholder={t('customInterestsPlaceholder')}
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomInterest();
              }
            }}
          />
          <button
            type="button"
            className={styles.addTagBtn}
            onClick={addCustomInterest}
          >
            {t('add')}
          </button>
        </div>
        {customInterestList.length > 0 && (
          <div className={styles.tagsContainer} style={{ marginTop: '8px' }}>
            {customInterestList.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`${styles.tagChip} ${styles.selected}`}
                onClick={() => removeCustomInterest(interest)}
              >
                {interest} ✕
              </button>
            ))}
          </div>
        )}
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
          onChange={(e) => {
            onChange({
              ...data,
              howDidYouHear: e.target.value,
              howDidYouHearOther: e.target.value !== 'other' ? '' : data.howDidYouHearOther,
            });
          }}
        >
          {HOW_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {data.howDidYouHear === 'other' && (
          <input
            id="ob-how-other"
            className={`${styles.input} ${styles.otherInput}`}
            type="text"
            placeholder={t('howDidYouHearOtherPlaceholder')}
            value={data.howDidYouHearOther}
            onChange={(e) => onChange({ ...data, howDidYouHearOther: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}

export type { Step3Data };
