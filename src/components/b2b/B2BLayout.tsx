"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { LayoutDashboard, Users, BookOpen, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const NAV_ITEMS = [
  { label: 'Overview', href: '/b2b-dashboard',          icon: LayoutDashboard },
  { label: 'Team',     href: '/b2b-dashboard/team',     icon: Users           },
  { label: 'Bookings', href: '/b2b-dashboard/bookings', icon: BookOpen        },
];

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = useLocale();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(`/${locale}/login`);
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0',
      }}>
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={22} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.firstName ?? 'Manager'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>B2B Dashboard</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === `/${locale}${item.href}` || (item.href !== '/b2b-dashboard' && pathname.includes(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={`/${locale}${item.href}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: active ? 'rgba(197,27,27,0.1)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '14px', fontWeight: active ? 600 : 400,
                  transition: 'all 0.2s',
                }}>
                  <Icon size={18} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 12px' }}>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '14px',
            }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>

    </div>
  );
}
