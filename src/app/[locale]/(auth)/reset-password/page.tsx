'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X, ArrowLeft, ShieldCheck } from 'lucide-react';
import { resetPassword } from '@/lib/auth-api';
import styles from '../login/login.module.css';

const hasUppercase = (str: string) => /[A-Z]/.test(str);
const hasLowercase = (str: string) => /[a-z]/.test(str);
const hasNumber = (str: string) => /\d/.test(str);
const hasSpecial = (str: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(str);

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const t = useTranslations('Auth');
  const locale = useLocale();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reqs = {
    length: password.length >= 8,
    upper: hasUppercase(password),
    lower: hasLowercase(password),
    number: hasNumber(password),
    special: hasSpecial(password),
  };

  const allValid = Object.values(reqs).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(t('resetTokenMissing'));
      return;
    }

    if (!allValid) {
      setError(t('meetPasswordRequirements'));
      return;
    }

    if (!passwordsMatch) {
      setError(t('passwordsNoMatch'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await resetPassword(token, password);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 3000);
      } else {
        setError(result.error || t('resetFailed'));
      }
    } catch {
      setError(t('forgotPasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
          background: 'rgba(0, 227, 151, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24
        }}>
          <ShieldCheck size={28} color="#00e397" />
        </div>
        <h1 className={styles.title}>{t('passwordResetSuccess')}</h1>
        <p className={styles.subtitle} style={{ maxWidth: '100%' }}>
          {t('passwordResetRedirect')}
        </p>
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
        <h1 className={styles.title}>{t('setNewPassword')}</h1>
        <p className={styles.subtitle}>
          {t('setNewPasswordSubtitle')}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <Label htmlFor="password" className={styles.label}>{t('newPassword')}</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder={t('enterNewPassword')}
            className={styles.input}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            disabled={isLoading}
          />
        </div>

        {password.length > 0 && (
          <div className={styles.pwdReqs}>
            <ReqItem valid={reqs.length} text={t('pwdReqLength')} />
            <ReqItem valid={reqs.upper} text={t('pwdReqUpper')} />
            <ReqItem valid={reqs.lower} text={t('pwdReqLower')} />
            <ReqItem valid={reqs.number} text={t('pwdReqNumber')} />
            <ReqItem valid={reqs.special} text={t('pwdReqSpecial')} />
          </div>
        )}

        <div className={styles.inputGroup}>
          <Label htmlFor="confirmPassword" className={styles.label}>{t('confirmPassword')}</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder={t('confirmNewPassword')}
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
            disabled={isLoading}
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <span style={{ color: '#ef4444', fontSize: 13 }}>{t('passwordsNoMatch')}</span>
          )}
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          className={styles.submitBtn}
          disabled={isLoading || !allValid || !passwordsMatch}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              {t('resetting')}
            </>
          ) : (
            t('resetPasswordBtn')
          )}
        </Button>
      </form>
    </motion.div>
  );
}

function ReqItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: valid ? '#00e397' : 'var(--text-muted)' }}>
      {valid ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );
}
