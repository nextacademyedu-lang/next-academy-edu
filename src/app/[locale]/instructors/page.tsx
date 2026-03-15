import React from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import styles from './page.module.css';

interface InstructorDoc {
  id: string;
  firstName?: string;
  lastName?: string;
  slug?: string;
  jobTitle?: string;
  isActive?: boolean;
}

export default async function InstructorsPage() {
  const locale = await getLocale();

  let instructors: InstructorDoc[] = [];
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'instructors',
      depth: 1,
      limit: 24,
      sort: '-createdAt',
      where: { isActive: { equals: true } },
    });
    instructors = result.docs as unknown as InstructorDoc[];
  } catch {
    // Payload init may fail during build or if DB is unreachable
    instructors = [];
  }

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.header}>
          <div className={styles.headerContainer}>
            <h1 className={styles.title}>Meet Our <span className={styles.highlight}>Experts</span></h1>
            <p className={styles.subtitle}>
              Learn from practitioners who have actually built, scaled, and exited businesses globally.
            </p>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {instructors.length === 0 && (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No instructors found.</p>
              )}
              {instructors.map(instructor => {
                const firstName = instructor.firstName || '';
                const lastName = instructor.lastName || '';
                const name = `${firstName} ${lastName}`.trim() || 'Instructor';
                const initial = name[0]?.toUpperCase() ?? '?';
                const slug = instructor.slug || instructor.id;

                return (
                  <Card key={instructor.id} interactive className={styles.card}>
                    <CardContent className={styles.cardContent}>
                      <div className={styles.avatarPlaceholder}>{initial}</div>
                      <h3 className={styles.name}>{name}</h3>
                      {instructor.jobTitle && (
                        <p className={styles.role}>{instructor.jobTitle}</p>
                      )}
                      <div className={styles.cardActions}>
                        <Link href={`/${locale}/instructors/${slug}`} className={styles.linkWrapper}>
                          <Button variant="outline" fullWidth>View Profile</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Want to join as an instructor?</h3>
              <p className={styles.ctaText}>Share your expertise with thousands of corporate professionals.</p>
              <Link href={`/${locale}/contact`}>
                <Button variant="primary" size="lg">Apply to Teach</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
