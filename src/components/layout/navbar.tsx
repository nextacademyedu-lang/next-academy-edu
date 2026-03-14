'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth-context';
import styles from './navbar.module.css';

export function Navbar() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href={`/${locale}`} className={styles.logo}>
          Next Academy
        </Link>
        <nav className={styles.navLinks}>
          <Link href={`/${locale}/programs`} className={styles.link}>{t('programs')}</Link>
          <Link href={`/${locale}/instructors`} className={styles.link}>{t('instructors')}</Link>
          <Link href={`/${locale}/blog`} className={styles.link}>{t('blog')}</Link>
          <Link href={`/${locale}/about`} className={styles.link}>{t('about')}</Link>
        </nav>
        <div className={styles.actions}>
          {!isLoading && (
            isAuthenticated ? (
              <>
                <Link href={`/${locale}/dashboard`}>
                  <Button variant="ghost">
                    {user?.firstName || 'حسابي'}
                  </Button>
                </Link>
                <Button variant="primary" onClick={() => logout()}>
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost">{t('login')}</Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button variant="primary">{t('register')}</Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
