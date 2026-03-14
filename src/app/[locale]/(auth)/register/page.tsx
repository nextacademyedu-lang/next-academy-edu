"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Facebook, Apple, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import styles from '../login/login.module.css';

// Password requirement checkers
const hasUppercase = (str: string) => /[A-Z]/.test(str);
const hasLowercase = (str: string) => /[a-z]/.test(str);
const hasNumber = (str: string) => /\d/.test(str);
const hasSpecial = (str: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(str);

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const t = useTranslations('Auth');
  const locale = useLocale();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const reqs = {
    length: password.length >= 8,
    upper: hasUppercase(password),
    lower: hasLowercase(password),
    number: hasNumber(password),
    special: hasSpecial(password),
  };

  const allValid = Object.values(reqs).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError(t('fillAllFields'));
      return;
    }
    if (!allValid) {
      setError(t('meetPasswordRequirements'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await register({ firstName, lastName, email, password });

      if (result.success) {
        // Registration successful — redirect to verify email
        router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        // Handle common errors
        const errMsg = result.error || t('registrationFailed');
        if (errMsg.toLowerCase().includes('already') || errMsg.toLowerCase().includes('unique')) {
          setError(t('emailAlreadyExists'));
        } else {
          setError(errMsg);
        }
      }
    } catch {
      setError(t('forgotPasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className={styles.formContainer}
    >
      <div className={styles.header}>
        <div className={styles.logoSquare}>
          <div className={styles.square1}></div>
          <div className={styles.square2}></div>
        </div>
        <h1 className={styles.title}>{t('registerTitle')}</h1>
        <p className={styles.subtitle}>
          {t('registerSubtitle')}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <Label htmlFor="firstName" className={styles.label}>{t('firstName')}</Label>
            <Input
              id="firstName"
              type="text"
              placeholder={t('firstNamePlaceholder')}
              className={styles.input}
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setError(''); }}
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <Label htmlFor="lastName" className={styles.label}>{t('lastName')}</Label>
            <Input
              id="lastName"
              type="text"
              placeholder={t('lastNamePlaceholder')}
              className={styles.input}
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setError(''); }}
              disabled={isLoading}
            />
          </div>
        </div>

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
        
        <div className={styles.inputGroup}>
          <Label htmlFor="password" className={styles.label}>{t('password')}</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder={t('createPasswordPlaceholder')}
            className={styles.input}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            disabled={isLoading}
          />
        </div>

        {/* Password Requirements Checklist */}
        {password.length > 0 && (
          <div className={styles.pwdReqs}>
            <ReqItem valid={reqs.length} text={t('pwdReqLength')} />
            <ReqItem valid={reqs.upper} text={t('pwdReqUpper')} />
            <ReqItem valid={reqs.lower} text={t('pwdReqLower')} />
            <ReqItem valid={reqs.number} text={t('pwdReqNumber')} />
            <ReqItem valid={reqs.special} text={t('pwdReqSpecial')} />
          </div>
        )}

        {error && <p className={styles.errorMsg}>{error}</p>}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          className={styles.submitBtn}
          disabled={isLoading || (!allValid && password.length > 0)}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              {t('creatingAccount')}
            </>
          ) : (
            t('signUp')
          )}
        </Button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerText}>{t('or')}</span>
      </div>

      <div className={styles.socialAuth}>
        <button
          className={styles.socialBtn}
          type="button"
          onClick={() => { window.location.href = '/api/auth/google'; }}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className={styles.socialIcon} />
        </button>
        <button className={styles.socialBtn} type="button">
          <Facebook className={styles.socialIconWhite} size={20} fill="#1877F2" stroke="none" />
        </button>
        <button className={styles.socialBtn} type="button">
          <Apple className={styles.socialIconWhite} size={20} fill="white" />
        </button>
      </div>

      <p className={styles.footerText}>
        {t('hasAccount')} <Link href={`/${locale}/login`} className={styles.footerLink}>{t('signIn')}</Link>
      </p>
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
