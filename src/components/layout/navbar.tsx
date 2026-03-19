'use client';

import React, { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { useAuth } from '@/context/auth-context';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import styles from './navbar.module.css';

export function Navbar() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const otherLocale = locale === 'ar' ? 'en' : 'ar';

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

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const switchLocale = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.container}>
          <NextLink href={`/${locale}`} className={styles.logo}>
            Next Academy
          </NextLink>
          <nav className={styles.navLinks}>
            <NextLink href={`/${locale}/programs`} className={styles.link}>{t('programs')}</NextLink>
            <NextLink href={`/${locale}/instructors`} className={styles.link}>{t('instructors')}</NextLink>
            <NextLink href={`/${locale}/blog`} className={styles.link}>{t('blog')}</NextLink>
            <NextLink href={`/${locale}/about`} className={styles.link}>{t('about')}</NextLink>
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

            {/* Theme toggle — desktop */}
            <ThemeToggle />

            {/* Language toggle — desktop */}
            <button
              className={styles.langToggle}
              onClick={switchLocale}
              aria-label={t('langToggle')}
            >
              {t('langToggle')}
            </button>

            {/* Auth buttons — desktop */}
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <NextLink href={`/${locale}/dashboard`}>
                    <Button variant="ghost">
                      {user?.firstName || 'حسابي'}
                    </Button>
                  </NextLink>
                  <Button variant="primary" onClick={() => logout()}>
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <NextLink href={`/${locale}/login`}>
                    <Button variant="ghost">{t('login')}</Button>
                  </NextLink>
                  <NextLink href={`/${locale}/register`}>
                    <Button variant="primary">{t('register')}</Button>
                  </NextLink>
                </>
              )
            )}

            {/* Hamburger — mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t('close') : t('menu')}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                /* X icon */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ────────────────────────────────── */}
      {menuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu}>
          <nav
            className={styles.mobileMenu}
            onClick={(e) => e.stopPropagation()}
          >
            <NextLink href={`/${locale}/programs`} className={styles.mobileLink} onClick={closeMobileMenu}>{t('programs')}</NextLink>
            <NextLink href={`/${locale}/instructors`} className={styles.mobileLink} onClick={closeMobileMenu}>{t('instructors')}</NextLink>
            <NextLink href={`/${locale}/blog`} className={styles.mobileLink} onClick={closeMobileMenu}>{t('blog')}</NextLink>
            <NextLink href={`/${locale}/about`} className={styles.mobileLink} onClick={closeMobileMenu}>{t('about')}</NextLink>

            <div className={styles.mobileDivider} />

            <div className={styles.mobileToggles}>
              <ThemeToggle />
              <button className={styles.langToggle} onClick={() => { switchLocale(); closeMobileMenu(); }}>
                {t('langToggle')}
              </button>
            </div>

            {!isLoading && (
              isAuthenticated ? (
                <div className={styles.mobileActions}>
                  <NextLink href={`/${locale}/dashboard`} onClick={closeMobileMenu}>
                    <Button variant="ghost" fullWidth>
                      {user?.firstName || 'حسابي'}
                    </Button>
                  </NextLink>
                  <Button variant="primary" fullWidth onClick={() => { logout(); closeMobileMenu(); }}>
                    {t('logout')}
                  </Button>
                </div>
              ) : (
                <div className={styles.mobileActions}>
                  <NextLink href={`/${locale}/login`} onClick={closeMobileMenu}>
                    <Button variant="ghost" fullWidth>{t('login')}</Button>
                  </NextLink>
                  <NextLink href={`/${locale}/register`} onClick={closeMobileMenu}>
                    <Button variant="primary" fullWidth>{t('register')}</Button>
                  </NextLink>
                </div>
              )
            )}
          </nav>
        </div>
      )}

      {/* Global search modal */}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
