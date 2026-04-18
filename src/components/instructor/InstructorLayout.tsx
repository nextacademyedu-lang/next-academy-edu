"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Home, Video, Clock, Users, ArrowLeft, LogOut, Bell, Settings, DollarSign, User, BookOpen } from 'lucide-react';
import styles from './instructor.module.css';
import { useAuth } from '@/context/auth-context';

const INSTRUCTOR_NAV_LINKS = [
  { name: 'Overview',      mobileLabel: 'Home',      href: '/instructor',                    icon: Home       },
  { name: 'Sessions',      mobileLabel: 'Sessions',  href: '/instructor/sessions',           icon: Video      },
  { name: 'Consultations', mobileLabel: 'Bookings',  href: '/instructor/bookings',           icon: Users      },
  { name: 'Earnings',      mobileLabel: 'Earnings',  href: '/instructor/earnings',           icon: DollarSign },
  { name: 'Services',      mobileLabel: 'Services',  href: '/instructor/consultation-types', icon: Settings   },
  { name: 'Programs',      mobileLabel: 'Programs',  href: '/instructor/program-submissions', icon: BookOpen  },
  { name: 'Availability',  mobileLabel: 'Hours',     href: '/instructor/availability',       icon: Clock      },
  { name: 'Profile',       mobileLabel: 'Profile',   href: '/instructor/profile',            icon: User       },
];

export function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = useLocale();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push(`/${locale}/login`);
  }, [isLoading, isAuthenticated, router, locale]);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role !== 'instructor') {
      router.push(`/${locale}/dashboard`);
    }
  }, [isLoading, isAuthenticated, user, router, locale]);

  // Onboarding + approval gate:
  // Instructor dashboard navigation is available only after onboarding is completed
  // and instructor profile is approved by admin.
  const isOnboardingPage = pathname.includes('/instructor/onboarding');
  const [accessGate, setAccessGate] = React.useState<{
    loading: boolean;
    onboardingCompleted: boolean;
    verificationStatus: string | null;
  }>({
    loading: true,
    onboardingCompleted: false,
    verificationStatus: null,
  });

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'instructor') {
      fetch('/api/instructor/profile', { credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          const onboardingCompleted = Boolean(data?.profile?.onboardingCompleted);
          const verificationStatus =
            typeof data?.profile?.verificationStatus === 'string'
              ? data.profile.verificationStatus
              : null;

          setAccessGate({
            loading: false,
            onboardingCompleted,
            verificationStatus,
          });

          const isApproved = verificationStatus === 'approved';

          if (!isOnboardingPage && (!onboardingCompleted || !isApproved)) {
            router.push(`/${locale}/instructor/onboarding`);
            return;
          }

          if (isOnboardingPage && onboardingCompleted && isApproved) {
            router.push(`/${locale}/instructor`);
          }
        })
        .catch(() =>
          setAccessGate({
            loading: false,
            onboardingCompleted: false,
            verificationStatus: null,
          }),
        );
    } else if (!isLoading) {
      setAccessGate((prev) => ({ ...prev, loading: false }));
    }
  }, [isLoading, isAuthenticated, user, isOnboardingPage, router, locale]);

  const canAccessInstructorNav =
    accessGate.onboardingCompleted && accessGate.verificationStatus === 'approved';

  const displayName   = user ? `${user.firstName} ${user.lastName}`.trim() : '…';
  const avatarInitial = user?.firstName?.[0]?.toUpperCase() ?? '?';

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  const isActive = (href: string) => pathname.includes(href);

  if (isLoading || accessGate.loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</div>
    </div>
  );

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      {canAccessInstructorNav && (
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Link href={`/${locale}`} className={styles.logo}>
              Next Academy
            </Link>
          </div>

          <nav className={styles.navLinks}>
            {INSTRUCTOR_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isDashboardRoot = link.href === '/instructor' && pathname.endsWith('/instructor');
              const isSubPage = link.href !== '/instructor' && isActive(link.href);
              const activeClass = isDashboardRoot || isSubPage ? styles.navLinkActive : '';

              return (
                <Link
                  key={link.name}
                  href={`/${locale}${link.href}`}
                  className={`${styles.navLink} ${activeClass}`}
                >
                  <Icon size={20} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className={styles.sidebarFooter}>
            <button
              onClick={handleLogout}
              className={styles.navLink}
              style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div>
            <Link href={`/${locale}`} className={styles.logo} style={{ display: 'block' }}>
              Next Academy
            </Link>
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.notificationBtn}>
              <Bell size={20} />
              <span className={styles.badge}></span>
            </button>

            <div className={styles.userProfile}>
              <div className={styles.userInfo} style={{ textAlign: 'right' }}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>Instructor</span>
              </div>
              <div className={styles.avatar}>{avatarInitial}</div>
            </div>

            <button 
              className={styles.logoutBtn} 
              onClick={() => logout().then(() => window.location.href = '/')}
              title="Log Out"
            >
              <LogOut size={18} />
              <span className={styles.logoutLabel}>Log Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className={styles.pageContainer}>
          {children}
        </div>
      </main>

      <Link href={`/${locale}`} className={styles.floatingBackBtn}>
        <ArrowLeft size={16} />
        Back to Site
      </Link>

      {/* Mobile Bottom Bar (Hidden on Desktop via CSS) */}
      {canAccessInstructorNav && (
        <nav className={styles.mobileBottomBar}>
          {INSTRUCTOR_NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isDashboardRoot = link.href === '/instructor' && pathname.endsWith('/instructor');
            const isSubPage = link.href !== '/instructor' && isActive(link.href);
            const activeClass = isDashboardRoot || isSubPage ? styles.mobileNavLinkActive : '';

            return (
              <Link
                key={link.name}
                href={`/${locale}${link.href}`}
                className={`${styles.mobileNavLink} ${activeClass}`}
                aria-label={link.name}
              >
                <span className={styles.mobileNavIconWrap}>
                  <Icon size={20} />
                </span>
                <span className={styles.mobileNavLabel}>{link.mobileLabel}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
