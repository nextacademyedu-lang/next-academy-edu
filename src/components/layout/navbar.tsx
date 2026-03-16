'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth-context';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import styles from './navbar.module.css';

export function Navbar() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  /* Cmd/Ctrl + K shortcut */
  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleGlobalKey]);

  return (
    <>
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
            {/* Search trigger */}
            <button
              className={styles.searchTrigger}
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <kbd className={styles.kbdSmall}>⌘K</kbd>
            </button>

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

      {/* Global search modal */}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}

