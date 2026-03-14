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

export default async function InstructorsPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });

  const { docs: instructors } = await payload.find({
    collection: 'instructors',
    depth: 1,
    limit: 24,
    sort: '-createdAt',
  });

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
                const user = typeof (instructor as any).user === 'object' ? (instructor as any).user : null;
                const name = user ? `${user.firstName} ${user.lastName}`.trim() : (instructor as any).name || 'Instructor';
                const initial = name[0]?.toUpperCase() ?? '?';
                const slug = (instructor as any).slug || instructor.id;

                return (
                  <Card key={instructor.id} interactive className={styles.card}>
                    <CardContent className={styles.cardContent}>
                      <div className={styles.avatarPlaceholder}>{initial}</div>
                      <h3 className={styles.name}>{name}</h3>
                      {(instructor as any).title && (
                        <p className={styles.role}>{(instructor as any).title}</p>
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
