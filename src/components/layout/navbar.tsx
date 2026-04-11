'use client';

import React, { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { useAuth } from '@/context/auth-context';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { getDashboardPath } from '@/lib/role-redirect';
import styles from './navbar.module.css';

type NavItem = {
  href: string;
  label: string;
};

export function Navbar() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCoursesOpen, setDesktopCoursesOpen] = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);

  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const accountHref = user
    ? user.role === 'user'
      ? `/${locale}/dashboard/profile`
      : getDashboardPath(user.role, locale)
    : `/${locale}/dashboard`;
  const accountName = user?.firstName?.trim() || (locale === 'ar' ? 'حسابي' : 'My Account');
  const accountInitial = user?.firstName?.[0]?.toUpperCase() || 'U';
  const accountImageUrl = (() => {
    const picture = user?.picture as unknown;
    if (picture && typeof picture === 'object' && 'url' in picture) {
      const url = (picture as { url?: unknown }).url;
      if (typeof url === 'string' && url.trim()) return url;
    }
    return undefined;
  })();

  const courseCategories = [
    { slug: 'marketing', label: 'Marketing' },
    { slug: 'business', label: 'Business & Management' },
    { slug: 'tech', label: 'Technology' },
  ];

  const desktopPrimaryLinks: NavItem[] = [
    { href: `/${locale}/instructors`, label: t('instructors') },
    { href: `/${locale}/for-business`, label: t('forBusiness') },
  ];

  const exploreLinks: NavItem[] = [
    { href: `/${locale}/workshops`, label: t('workshops') },
    { href: `/${locale}/events`, label: t('events') },
    { href: `/${locale}/webinars`, label: t('webinars') },
    { href: `/${locale}/retreats`, label: t('retreats') },
    { href: `/${locale}/corporate-training`, label: t('corporateTraining') },
  ];

  const resourceLinks: NavItem[] = [
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/faq`, label: t('faq') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  const moreLinks: NavItem[] = [...exploreLinks, ...resourceLinks];
  const mobileMainLinks: NavItem[] = [
    { href: `/${locale}/workshops`, label: t('workshops') },
    { href: `/${locale}/events`, label: t('events') },
    { href: `/${locale}/webinars`, label: t('webinars') },
    { href: `/${locale}/retreats`, label: t('retreats') },
    { href: `/${locale}/corporate-training`, label: t('corporateTraining') },
    { href: `/${locale}/instructors`, label: t('instructors') },
    { href: `/${locale}/for-business`, label: t('forBusiness') },
  ];

  const closeAllMenus = useCallback(() => {
    setMobileMenuOpen(false);
    setMobileCoursesOpen(false);
    setDesktopCoursesOpen(false);
    setDesktopMoreOpen(false);
  }, []);

  const switchLocale = useCallback(() => {
    router.replace(pathname, { locale: otherLocale });
  }, [otherLocale, pathname, router]);

  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleGlobalKey]);

  useEffect(() => {
    closeAllMenus();
  }, [pathname, closeAllMenus]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.leftGroup}>
            <NextLink href={`/${locale}`} className={styles.logo}>
              Next Academy
            </NextLink>

            <nav className={styles.desktopNav} aria-label="Primary">
              <div
                className={styles.navItemWithPanel}
                onMouseEnter={() => setDesktopCoursesOpen(true)}
                onMouseLeave={() => setDesktopCoursesOpen(false)}
              >
                <button
                  className={styles.navButton}
                  aria-haspopup="true"
                  aria-expanded={desktopCoursesOpen}
                  onClick={() => setDesktopCoursesOpen((v) => !v)}
                >
                  {t('courses')}
                  <ChevronDown />
                </button>

                {desktopCoursesOpen && (
                  <div className={styles.megaPanel}>
                    <div className={styles.panelGrid}>
                      <div className={styles.panelSection}>
                        <p className={styles.panelTitle}>{t('courses')}</p>
                        {courseCategories.map((cat) => (
                          <NextLink
                            key={cat.slug}
                            href={`/${locale}/courses?category=${cat.slug}`}
                            className={styles.panelLink}
                            onClick={() => setDesktopCoursesOpen(false)}
                          >
                            <span>{cat.label}</span>
                            <span className={styles.linkPill}>Explore</span>
                          </NextLink>
                        ))}
                      </div>

                      <div className={styles.panelSection}>
                        <p className={styles.panelTitle}>{t('quickAccess')}</p>
                        <NextLink href={`/${locale}/courses`} className={styles.panelLink} onClick={() => setDesktopCoursesOpen(false)}>
                          <span>{t('allCourses')}</span>
                        </NextLink>
                        <NextLink href={`/${locale}/workshops`} className={styles.panelLink} onClick={() => setDesktopCoursesOpen(false)}>
                          <span>{t('workshops')}</span>
                        </NextLink>
                        <NextLink href={`/${locale}/for-business`} className={styles.panelLink} onClick={() => setDesktopCoursesOpen(false)}>
                          <span>{t('forTeams')}</span>
                        </NextLink>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {desktopPrimaryLinks.map((item) => (
                <NextLink key={item.href} href={item.href} className={styles.navLink}>
                  {item.label}
                </NextLink>
              ))}

              <div
                className={styles.navItemWithPanel}
                onMouseEnter={() => setDesktopMoreOpen(true)}
                onMouseLeave={() => setDesktopMoreOpen(false)}
              >
                <button
                  className={styles.navButton}
                  aria-haspopup="true"
                  aria-expanded={desktopMoreOpen}
                  onClick={() => setDesktopMoreOpen((v) => !v)}
                >
                  {t('more')}
                  <ChevronDown />
                </button>

                {desktopMoreOpen && (
                  <div className={styles.dropdownPanel}>
                    {moreLinks.map((item) => (
                      <NextLink
                        key={item.href}
                        href={item.href}
                        className={styles.dropdownLink}
                        onClick={() => setDesktopMoreOpen(false)}
                      >
                        {item.label}
                      </NextLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className={styles.actions}>
            <div className={styles.desktopActions}>
              <button className={styles.searchTrigger} onClick={() => setSearchOpen(true)} aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              <ThemeToggle />

              <button className={styles.langToggle} onClick={switchLocale} aria-label={t('langToggle')}>
                {t('langToggle')}
              </button>

              {!isLoading && (
                isAuthenticated ? (
                  <>
                    <NextLink href={accountHref} className={styles.authLink}>
                      <Button variant="secondary" size="sm" className={styles.accountButton}>
                        <span className={styles.accountAvatar} aria-hidden="true">
                          {accountImageUrl ? (
                            <img src={accountImageUrl} alt="" className={styles.accountAvatarImage} />
                          ) : accountInitial}
                        </span>
                        {accountName}
                      </Button>
                    </NextLink>
                    <Button variant="outline" size="sm" onClick={() => logout()}>
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <NextLink href={`/${locale}/login`} className={styles.authLink}>
                      <Button variant="secondary" size="sm">{t('login')}</Button>
                    </NextLink>
                    <NextLink href={`/${locale}/register`} className={styles.authLink}>
                      <Button variant="primary" size="sm">{t('register')}</Button>
                    </NextLink>
                  </>
                )
              )}
            </div>

            <button
              className={styles.hamburger}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? t('close') : t('menu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className={styles.mobileBackdrop} onClick={closeAllMenus}>
          <aside className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileHeader}>
              <span className={styles.mobileTitle}>{t('menu')}</span>
              <button className={styles.mobileClose} onClick={closeAllMenus} aria-label={t('close')}>
                <CloseIcon />
              </button>
            </div>

            <button
              className={styles.mobileSearch}
              onClick={() => {
                setSearchOpen(true);
                closeAllMenus();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {t('search')}
            </button>

            <nav className={styles.mobileLinks} aria-label="Mobile">
              <button
                className={styles.mobileAccordionButton}
                onClick={() => setMobileCoursesOpen((v) => !v)}
                aria-expanded={mobileCoursesOpen}
              >
                <span>{t('courses')}</span>
                <ChevronDown rotated={mobileCoursesOpen} />
              </button>

              {mobileCoursesOpen && (
                <div className={styles.mobileSubList}>
                  {courseCategories.map((cat) => (
                    <NextLink key={cat.slug} href={`/${locale}/courses?category=${cat.slug}`} className={styles.mobileSubLink} onClick={closeAllMenus}>
                      {cat.label}
                    </NextLink>
                  ))}
                  <NextLink href={`/${locale}/courses`} className={styles.mobileSubLink} onClick={closeAllMenus}>
                    {t('allCourses')}
                  </NextLink>
                </div>
              )}

              {mobileMainLinks.map((item) => (
                <NextLink key={item.href} href={item.href} className={styles.mobileLink} onClick={closeAllMenus}>
                  {item.label}
                </NextLink>
              ))}

              <div className={styles.mobileDivider} />

              {resourceLinks.map((item) => (
                <NextLink key={item.href} href={item.href} className={styles.mobileLink} onClick={closeAllMenus}>
                  {item.label}
                </NextLink>
              ))}
            </nav>

            <div className={styles.mobileUtilities}>
              <ThemeToggle />
              <button className={styles.langToggle} onClick={() => { switchLocale(); closeAllMenus(); }}>
                {t('langToggle')}
              </button>
            </div>

            {!isLoading && (
              isAuthenticated ? (
                <div className={styles.mobileAuth}>
                  <NextLink href={accountHref} onClick={closeAllMenus}>
                    <Button variant="secondary" fullWidth className={styles.accountButton}>
                      <span className={styles.accountAvatar} aria-hidden="true">
                        {accountImageUrl ? (
                          <img src={accountImageUrl} alt="" className={styles.accountAvatarImage} />
                        ) : accountInitial}
                      </span>
                      {accountName}
                    </Button>
                  </NextLink>
                  <Button variant="outline" fullWidth onClick={() => { logout(); closeAllMenus(); }}>
                    {t('logout')}
                  </Button>
                </div>
              ) : (
                <div className={styles.mobileAuth}>
                  <NextLink href={`/${locale}/login`} onClick={closeAllMenus}>
                    <Button variant="secondary" fullWidth>{t('login')}</Button>
                  </NextLink>
                  <NextLink href={`/${locale}/register`} onClick={closeAllMenus}>
                    <Button variant="primary" fullWidth>{t('register')}</Button>
                  </NextLink>
                </div>
              )
            )}
          </aside>
        </div>
      )}

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function ChevronDown({ rotated = false }: { rotated?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginInlineStart: 4, transform: rotated ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
