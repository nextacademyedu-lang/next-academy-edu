"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Home, Video, Clock, Users, ArrowLeft, LogOut, Bell, Settings, DollarSign, User } from 'lucide-react';
import styles from './instructor.module.css';
import { useAuth } from '@/context/auth-context';

const INSTRUCTOR_NAV_LINKS = [
  { name: 'Overview',      mobileLabel: 'Home',      href: '/instructor',                    icon: Home       },
  { name: 'Sessions',      mobileLabel: 'Sessions',  href: '/instructor/sessions',           icon: Video      },
  { name: 'Consultations', mobileLabel: 'Bookings',  href: '/instructor/bookings',           icon: Users      },
  { name: 'Earnings',      mobileLabel: 'Earnings',  href: '/instructor/earnings',           icon: DollarSign },
  { name: 'Services',      mobileLabel: 'Services',  href: '/instructor/consultation-types', icon: Settings   },
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

  const displayName   = user ? `${user.firstName} ${user.lastName}`.trim() : '…';
  const avatarInitial = user?.firstName?.[0]?.toUpperCase() ?? '?';

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  const isActive = (href: string) => pathname.includes(href);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</div>
    </div>
  );

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
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
    </div>
  );
}
