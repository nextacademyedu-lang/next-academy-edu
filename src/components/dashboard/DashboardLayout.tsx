"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, CreditCard, User, LogOut, Bell, ArrowLeft } from 'lucide-react';
import styles from './dashboard.module.css';
import { useAuth } from '@/context/auth-context';
import { useLocale } from 'next-intl';

const ROLE_LABELS: Record<string, string> = {
  user: 'Student',
  admin: 'Admin',
  instructor: 'Instructor',
  b2b_manager: 'B2B Manager',
};

const NAV_LINKS = [
  { name: 'Overview',    href: '/dashboard',          icon: Home },
  { name: 'My Bookings', href: '/dashboard/bookings', icon: BookOpen },
  { name: 'Payments',    href: '/dashboard/payments', icon: CreditCard },
  { name: 'Profile',     href: '/dashboard/profile',  icon: User },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = useLocale();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  // Redirect unauthenticated users
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, locale]);

  const displayName   = user ? `${user.firstName} ${user.lastName}`.trim() : '…';
  const displayRole   = user ? (ROLE_LABELS[user.role] ?? user.role) : '';
  const avatarInitial = user?.firstName?.[0]?.toUpperCase() ?? '?';

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  const isActive = (href: string) => pathname.includes(href);

  // Show minimal skeleton while auth resolves
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</div>
      </div>
    );
  }

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
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isDashboardRoot = link.href === '/dashboard' && pathname.endsWith('/dashboard');
            const isSubPage       = link.href !== '/dashboard' && isActive(link.href);
            const activeClass     = isDashboardRoot || isSubPage ? styles.navLinkActive : '';

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

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div>
            <Link href={`/${locale}`} className={styles.logo} style={{ display: 'block' }}>
              Next Academy
            </Link>
          </div>
          <div className={styles.topbarRight}>
            <Link href={`/${locale}/dashboard/notifications`} className={styles.notificationBtn}>
              <Bell size={20} />
            </Link>

            <div className={styles.userProfile}>
              <div className={styles.userInfo} style={{ textAlign: 'right' }}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>{displayRole}</span>
              </div>
              <div className={styles.avatar}>{avatarInitial}</div>
            </div>
          </div>
        </header>

        <div className={styles.pageContainer}>{children}</div>
      </main>

      <Link href={`/${locale}`} className={styles.floatingBackBtn}>
        <ArrowLeft size={16} />
        Back to Site
      </Link>

      {/* Mobile Bottom Bar */}
      <nav className={styles.mobileBottomBar}>
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isDashboardRoot = link.href === '/dashboard' && pathname.endsWith('/dashboard');
          const isSubPage       = link.href !== '/dashboard' && isActive(link.href);
          const activeClass     = isDashboardRoot || isSubPage ? styles.mobileNavLinkActive : '';

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
              <span className={styles.mobileNavLabel}>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
