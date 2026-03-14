"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, Clock, Users, ArrowLeft, LogOut, Bell, Settings } from 'lucide-react';
import styles from './instructor.module.css';

// Mocking user role for now until auth context is wired up
const MOCK_USER = {
  name: 'Dr. Sarah Chen',
  role: 'Instructor',
  avatar: 'S',
  roleSlug: 'instructor'
};

const INSTRUCTOR_NAV_LINKS = [
  { name: 'Overview', href: '/instructor', icon: Home },
  { name: 'Sessions', href: '/instructor/sessions', icon: Video },
  { name: 'Consultations', href: '/instructor/bookings', icon: Users },
  { name: 'Services', href: '/instructor/consultation-types', icon: Settings },
  { name: 'Availability', href: '/instructor/availability', icon: Clock },
];

export function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname.includes(href);
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
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
                href={`/en${link.href}`}
                className={`${styles.navLink} ${activeClass}`}
              >
                <Icon size={20} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.navLink} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
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
            <Link href="/" className={styles.logo} style={{ display: 'block' }}>
              <span className="hidden-desktop">Next Academy</span>
            </Link>
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.notificationBtn}>
              <Bell size={20} />
              <span className={styles.badge}></span>
            </button>

            <div className={styles.userProfile}>
              <div className={styles.userInfo} style={{ textAlign: 'right' }}>
                <span className={styles.userName}>{MOCK_USER.name}</span>
                <span className={styles.userRole}>{MOCK_USER.role}</span>
              </div>
              <div className={styles.avatar}>
                {MOCK_USER.avatar}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className={styles.pageContainer}>
          {children}
        </div>
      </main>

      <Link href="/" className={styles.floatingBackBtn}>
        <ArrowLeft size={16} />
        Back to Site
      </Link>

      {/* Mobile Bottom Bar (Hidden on Desktop via CSS) */}
      <nav className={styles.mobileBottomBar} style={{ display: 'none' }}>
         {INSTRUCTOR_NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isDashboardRoot = link.href === '/instructor' && pathname.endsWith('/instructor');
            const isSubPage = link.href !== '/instructor' && isActive(link.href);
            const activeClass = isDashboardRoot || isSubPage ? styles.mobileNavLinkActive : '';

            return (
              <Link 
                key={link.name} 
                href={`/en${link.href}`}
                className={`${styles.mobileNavLink} ${activeClass}`}
              >
                <Icon size={24} />
                <span style={{ fontSize: '10px' }}>{link.name}</span>
              </Link>
            );
          })}
      </nav>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 900px) {
            .${styles.mobileBottomBar} {
              display: flex !important;
            }
            .hidden-desktop {
               display: inline-block;
            }
          }
          @media (min-width: 901px) {
            .hidden-desktop {
              display: none;
            }
          }
        `
      }} />
    </div>
  );
}
