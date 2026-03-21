"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { LayoutDashboard, Users, BookOpen, Package, LogOut, Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import styles from './b2b-layout.module.css';

const NAV_ITEMS = [
  { label: 'Overview',    href: '/b2b-dashboard',            icon: LayoutDashboard },
  { label: 'Team',        href: '/b2b-dashboard/team',       icon: Users           },
  { label: 'Bookings',    href: '/b2b-dashboard/bookings',   icon: BookOpen        },
  { label: 'Bulk Seats',  href: '/b2b-dashboard/bulk-seats', icon: Package         },
];

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = useLocale();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(`/${locale}/login`);
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div>Loading…</div>
      </div>
    );
  }

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Manager';
  const avatarInitial = user?.firstName?.[0]?.toUpperCase() ?? 'M';
  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    if (href === '/b2b-dashboard') return pathname === fullPath;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandRow}>
            <Building2 size={20} color="var(--accent-primary)" />
            <div>
              <div className={styles.brandName}>{displayName}</div>
              <div className={styles.brandSub}>B2B Dashboard</div>
            </div>
          </div>
        </div>

        <nav className={styles.navLinks}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                <div className={styles.navIconWrap}>
                  <Icon size={18} />
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <Link href={`/${locale}`} className={styles.siteLink}>
            Next Academy
          </Link>
          <div className={styles.userProfile}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userRole}>B2B Manager</span>
            </div>
            <div className={styles.avatar}>{avatarInitial}</div>
          </div>
        </header>

        <div className={styles.pageContainer}>
          {children}
        </div>
      </main>

      <Link href={`/${locale}`} className={styles.floatingBackBtn}>
        <ArrowLeft size={16} />
        Back to Site
      </Link>

      <nav className={styles.mobileBottomBar}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
              aria-label={item.label}
            >
              <span className={styles.mobileNavIconWrap}>
                <Icon size={20} />
              </span>
              <span className={styles.mobileNavLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
