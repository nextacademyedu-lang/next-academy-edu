import React from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import styles from './page.module.css';

export default async function ForBusinessPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const pillars = isAr
    ? [
        {
          title: 'مسارات تعلم حسب الدور الوظيفي',
          desc: 'ابنِ مسارات تدريب للمبيعات والتسويق والعمليات والقيادة مع نتائج قابلة للقياس.',
        },
        {
          title: 'لوحات متابعة للمديرين',
          desc: 'تابع التسجيل والإنجاز ومؤشرات الأداء من لوحة تشغيل واحدة.',
        },
        {
          title: 'نمط تقديم مرن',
          desc: 'امزج بين الورش والدورات والندوات بما يناسب جداول الفرق وأولويات العمل.',
        },
      ]
    : [
        {
          title: 'Role-Based Learning Tracks',
          desc: 'Create paths for sales, marketing, operations, and leadership teams with measurable outcomes.',
        },
        {
          title: 'Manager Dashboards',
          desc: 'Track enrollment, completion, and performance signals from one operational view.',
        },
        {
          title: 'Flexible Delivery',
          desc: 'Mix live workshops, courses, and webinars to match team schedules and business priorities.',
        },
      ];

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>{isAr ? 'حلول الشركات' : 'Business Solutions'}</p>
            <h1 className={styles.title}>
              {isAr ? 'طوّر أداء فريقك بنتائج أعمال قابلة للقياس' : 'Upskill Teams With Measurable Business Impact'}
            </h1>
            <p className={styles.subtitle}>
              {isAr
                ? 'ابنِ خطة تعلم موجهة لشركتك من خلال برامج عملية متوافقة مع أهدافك وأدوار فريقك.'
                : 'Build targeted learning plans for your company using practical programs aligned with your goals and team roles.'}
            </p>
            <div className={styles.actions}>
              <Link href={`/${locale}/contact`}>
                <Button variant="primary" size="md">{isAr ? 'اطلب عرض توضيحي' : 'Request Demo'}</Button>
              </Link>
              <Link href={`/${locale}/b2b-dashboard`}>
                <Button variant="secondary" size="md">{isAr ? 'افتح لوحة الشركات' : 'Open B2B Dashboard'}</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {pillars.map((item) => (
                <Card key={item.title} className={styles.card}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={styles.cardText}>{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
