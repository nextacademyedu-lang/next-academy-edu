'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import styles from './navbar.module.css';

export function Navbar() {
  const t = useTranslations('Nav');

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Next Academy
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/workshops" className={styles.link}>{t('workshops')}</Link>
          <Link href="/courses" className={styles.link}>{t('courses')}</Link>
          <Link href="/instructors" className={styles.link}>{t('instructors')}</Link>
        </nav>
        <div className={styles.actions}>
          <Link href="/login">
            <Button variant="ghost">{t('login')}</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary">{t('register')}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
