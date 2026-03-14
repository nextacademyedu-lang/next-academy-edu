import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'instructors',
    where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
    depth: 2,
    limit: 1,
  });

  const instructor = docs[0];
  if (!instructor) notFound();

  const user = typeof (instructor as any).user === 'object' ? (instructor as any).user : null;
  const name = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : (instructor as any).name || 'Instructor';
  const initial = name[0]?.toUpperCase() ?? '?';
  const bio = (instructor as any).bio || '';
  const title = (instructor as any).title || '';
  const consultationTypes: any[] = (instructor as any).consultationTypes?.docs ?? [];
  const programs: any[] = (instructor as any).programs?.docs ?? [];

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroCover}></div>
          <div className={styles.heroContent}>
            <div className={styles.avatarMain}>{initial}</div>
            <h1 className={styles.name}>{name}</h1>
            {title && <p className={styles.title}>{title}</p>}
          </div>
        </section>

        <div className={styles.contentLayout}>
          {/* Main */}
          <div className={styles.mainContent}>
            {bio && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>About {name.split(' ')[0]}</h2>
                <p className={styles.bioText}>{bio}</p>
              </section>
            )}

            {programs.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Active Programs</h2>
                <div className={styles.programsGrid}>
                  {programs.map((program: any) => (
                    <Card key={program.id} className={styles.programCard} interactive>
                      <CardHeader>
                        <Badge variant="default" className={styles.typeBadge}>{program.type}</Badge>
                        <CardTitle className={styles.programTitle}>
                          {program.titleEn || program.titleAr || 'Program'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/${locale}/programs/${program.slug || program.id}`}>
                          <Button variant="outline" size="sm" className={styles.viewBtn}>View Program</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.stickyBox}>
              <h3 className={styles.sidebarTitle}>1:1 Consultations</h3>
              <p className={styles.sidebarDesc}>Book a private session for tailored business advice.</p>
              <div className={styles.consultationsList}>
                {consultationTypes.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No consultations available.</p>
                )}
                {consultationTypes.map((ct: any) => (
                  <Card key={ct.id} className={styles.consultCard}>
                    <CardHeader className={styles.consultHeader}>
                      <CardTitle className={styles.consultTitle}>{ct.title}</CardTitle>
                      <span className={styles.consultPrice}>
                        {ct.price?.toLocaleString()} EGP
                      </span>
                    </CardHeader>
                    <CardContent className={styles.consultContent}>
                      <Button fullWidth variant="primary">Book Session</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
