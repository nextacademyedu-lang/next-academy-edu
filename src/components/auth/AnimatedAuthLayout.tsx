"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import styles from './auth-layout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

type PanelData = {
  image: string;
  badges: string[];
  title: string;
  subtitle: string;
  stats: Array<{ value: string; label: string }>;
};

function getPanelData(isSignUpPage: boolean, isArabic: boolean): PanelData {
  if (isSignUpPage) {
    return {
      image: '/images/auth/signup-visual.svg',
      badges: isArabic ? ['مسار عملي', 'تعلّم مباشر'] : ['Practice First', 'Live Learning'],
      title: isArabic
        ? 'ابدأ حسابك واختصر طريق التعلّم'
        : 'Create Your Account And Start Faster',
      subtitle: isArabic
        ? 'محتوى تطبيقي ومسارات واضحة للطالب، المدرب، ومدير الشركات.'
        : 'Practical content and clear tracks for students, instructors, and B2B managers.',
      stats: isArabic
        ? [
            { value: '22+', label: 'جلسة ويبينار متاحة' },
            { value: '3', label: 'أنواع حسابات ذكية' },
            { value: '1', label: 'مسار تسجيل سريع' },
          ]
        : [
            { value: '22+', label: 'Webinars Available' },
            { value: '3', label: 'Smart Account Types' },
            { value: '1', label: 'Fast Signup Flow' },
          ],
    };
  }

  return {
    image: '/images/auth/signin-visual.svg',
    badges: isArabic ? ['متابعة الأداء', 'نتائج ملموسة'] : ['Progress Tracking', 'Real Outcomes'],
    title: isArabic
      ? 'ارجع وكمل من حيث توقّفت'
      : 'Come Back And Continue Where You Left Off',
    subtitle: isArabic
      ? 'تابع الدورات، الجلسات، وتقدمك من لوحة واحدة.'
      : 'Track your rounds, sessions, and progress from one focused workspace.',
    stats: isArabic
      ? [
          { value: '100%', label: 'متابعة تقدمك' },
          { value: '24/7', label: 'وصول فوري للحساب' },
          { value: '1', label: 'لوحة تحكم موحدة' },
        ]
      : [
          { value: '100%', label: 'Progress Visibility' },
          { value: '24/7', label: 'Instant Access' },
          { value: '1', label: 'Unified Dashboard' },
        ],
  };
}

export function AnimatedAuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const isArabic = pathname.startsWith('/ar');
  const isSignUpPage = pathname.includes('register') || pathname.includes('signup');
  const panelData = getPanelData(isSignUpPage, isArabic);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.layoutWrapper}>
        <motion.div
          className={styles.brandPanel}
          animate={{
            x: isSignUpPage ? '0%' : '100%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className={styles.brandContent}>
            <div className={styles.brandVisual}>
              <Image
                src={panelData.image}
                alt={isSignUpPage ? 'Sign up visual' : 'Sign in visual'}
                fill
                priority
                className={styles.brandVisualImage}
                sizes="50vw"
              />
            </div>
            <div className={styles.brandOverlay} />

            <div className={styles.brandCopy}>
              <div className={styles.badges}>
                {panelData.badges.map((badge) => (
                  <span key={badge} className={styles.badge}>
                    {badge}
                  </span>
                ))}
              </div>
              <h2 className={styles.brandTitle}>{panelData.title}</h2>
              <p className={styles.brandSubtitle}>{panelData.subtitle}</p>

              <div className={styles.statsGrid}>
                {panelData.stats.map((item) => (
                  <div key={item.label} className={styles.statItem}>
                    <span>{item.value}</span>
                    <small>{item.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.formContainerWrapper}
          animate={{
            x: isSignUpPage ? '100%' : '0%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className={styles.formContent}>{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
