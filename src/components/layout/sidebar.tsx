import React from 'react';
import Link from 'next/link';
import styles from './sidebar.module.css';

// We will fetch these dynamically later based on role (student vs b2b vs instructor)
const navItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My Bookings', href: '/dashboard/bookings' },
  { label: 'Payments', href: '/dashboard/payments' },
  { label: 'Certificates', href: '/dashboard/certificates' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Dashboard</h2>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={styles.link}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.footer}>
        <button className={styles.logoutBtn}>Log Out</button>
      </div>
    </aside>
  );
}
