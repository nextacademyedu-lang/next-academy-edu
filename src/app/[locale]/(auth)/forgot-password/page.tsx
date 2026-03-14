'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from '@/lib/auth-api';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('enterEmailError'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSent(true);
      } else {
        // Don't reveal if account exists or not
        setSent(true);
      }
    } catch {
      setError(t('forgotPasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={styles.formContainer}
        style={{ alignItems: 'center', textAlign: 'center' }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(201, 169, 110, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24
        }}>
          <Mail size={28} color="#C9A96E" />
        </div>
        <h1 className={styles.title}>{t('checkEmail')}</h1>
        <p className={styles.subtitle} style={{ maxWidth: '100%' }}>
          {t('resetLinkSent', { email })}
        </p>
        <Link href={`/${locale}/login`} style={{
          color: 'var(--accent-primary, #C9A96E)',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 16
        }}>
          <ArrowLeft size={16} />
          {t('backToLogin')}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={styles.formContainer}
    >
      <div className={styles.header}>
        <Link href={`/${locale}/login`} style={{
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 24
        }}>
          <ArrowLeft size={16} />
          {t('backToLogin')}
        </Link>
        <h1 className={styles.title}>{t('forgotPasswordTitle')}</h1>
        <p className={styles.subtitle}>
          {t('forgotPasswordSubtitle')}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <Label htmlFor="email" className={styles.label}>{t('email')}</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder={t('emailPlaceholder')}
            className={styles.input}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            disabled={isLoading}
          />
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <Button type="submit" variant="primary" fullWidth className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              {t('sending')}
            </>
          ) : (
            t('sendResetLink')
          )}
        </Button>
      </form>
    </motion.div>
  );
}
