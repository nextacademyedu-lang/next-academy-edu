"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getDashboardPath, getSafeRedirectPath } from '@/lib/role-redirect';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslations('Auth');
  const locale = useLocale();
  const redirectParam = searchParams.get('redirect');
  const registerHref = redirectParam
    ? `/${locale}/register?redirect=${encodeURIComponent(redirectParam)}`
    : `/${locale}/register`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const fallbackPath = getDashboardPath(user.role, locale);
      const redirectPath = getSafeRedirectPath(
        redirectParam,
        fallbackPath,
      );
      router.push(redirectPath);
    }
  }, [isAuthenticated, authLoading, router, locale, user, redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('fillAllFields'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success && result.data) {
        const loginData = result.data as { user?: { role: 'user' | 'admin' | 'instructor' | 'b2b_manager' } };
        const role = loginData.user?.role ?? 'user';
        const fallbackPath = getDashboardPath(role, locale);
        const redirectPath = getSafeRedirectPath(
          redirectParam,
          fallbackPath,
        );
        router.push(redirectPath);
      } else if (result.error === 'EMAIL_NOT_VERIFIED') {
        const verifyParams = new URLSearchParams({ email });
        if (redirectParam) {
          verifyParams.set('redirect', redirectParam);
        }
        router.push(`/${locale}/verify-email?${verifyParams.toString()}`);
      } else {
        setError(t('invalidCredentials'));
      }
    } catch {
      setError(t('invalidCredentials'));
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
        <h1 className={styles.title}>{t('loginTitle')}</h1>
        <p className={styles.subtitle}>
          {t('loginSubtitle')}
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
        
        <div className={styles.inputGroup}>
          <div className={styles.passwordHeader}>
            <Label htmlFor="password" className={styles.label}>{t('password')}</Label>
            <Link href={`/${locale}/forgot-password`} className={styles.forgotLink}>
              {t('forgotPassword')}
            </Link>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder={t('passwordPlaceholder')}
            className={styles.input}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            disabled={isLoading}
          />
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              {t('signingIn')}
            </>
          ) : (
            t('signIn')
          )}
        </Button>
      </form>




      <p className={styles.footerText}>
        {t('noAccount')} <Link href={registerHref} className={styles.footerLink}>{t('register')}</Link>
      </p>
    </motion.div>
  );
}
