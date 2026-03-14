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

export default async function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'programs',
    where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
    depth: 3,
    limit: 1,
  });

  const program = docs[0];
  if (!program) notFound();

  const p = program as any;
  const title = p.titleEn || p.titleAr || 'Program';
  const description = p.descriptionEn || p.descriptionAr || '';
  const objectives: string[] = p.objectives ?? [];
  const syllabus: any[] = p.syllabus ?? [];
  const rounds: any[] = p.rounds?.docs ?? p.rounds ?? [];
  const instructorName = typeof p.instructor === 'object'
    ? `${p.instructor.user?.firstName ?? ''} ${p.instructor.user?.lastName ?? ''}`.trim() || p.instructor.name
    : '';

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroMeta}>
              <Badge variant="default">{p.type}</Badge>
              {p.level && <Badge variant="outline">{p.level}</Badge>}
            </div>
            <h1 className={styles.title}>{title}</h1>
            {instructorName && (
              <p className={styles.instructor}>Led by <strong>{instructorName}</strong></p>
            )}
          </div>
        </section>

        <div className={styles.contentLayout}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {description && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>About the Program</h2>
                <p className={styles.paragraph}>{description}</p>
              </section>
            )}

            {objectives.length > 0 && (
              <section className={styles.sectionBlock}>
                <h3 className={styles.subTitle}>What you&apos;ll learn:</h3>
                <ul className={styles.list}>
                  {objectives.map((obj, i) => (
                    <li key={i} className={styles.listItem}>{obj}</li>
                  ))}
                </ul>
              </section>
            )}

            {syllabus.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Syllabus</h2>
                <div className={styles.syllabusList}>
                  {syllabus.map((item: any, i: number) => (
                    <Card key={i} className={styles.syllabusCard}>
                      <CardHeader>
                        {item.day && <span className={styles.dayTag}>{item.day}</span>}
                        <CardTitle className={styles.topicTitle}>{item.topic || item.title}</CardTitle>
                      </CardHeader>
                      {item.desc && (
                        <CardContent>
                          <p className={styles.paragraph} style={{ margin: 0 }}>{item.desc}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.stickyBox}>
              <h3 className={styles.sidebarTitle}>Available Rounds</h3>
              {rounds.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No rounds available yet.</p>
              )}
              <div className={styles.roundsList}>
                {rounds.map((round: any) => {
                  const startDate = round.startDate
                    ? new Date(round.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '';
                  const endDate = round.endDate
                    ? new Date(round.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '';
                  const seatsLeft = (round.maxSeats ?? 0) - (round.enrolledCount ?? 0);
                  const price = round.price ?? p.price ?? 0;

                  return (
                    <Card key={round.id} className={styles.roundCard}>
                      <CardHeader className={styles.roundHeader}>
                        {startDate && (
                          <span className={styles.roundDate}>{startDate}{endDate ? ` – ${endDate}` : ''}</span>
                        )}
                        {round.maxSeats && (
                          <Badge variant="success">{seatsLeft} Seats Left</Badge>
                        )}
                      </CardHeader>
                      <CardContent className={styles.roundContent}>
                        {round.format && (
                          <div className={styles.roundInfo}>
                            <span className={styles.label}>Format:</span>
                            <span className={styles.value}>{round.format}</span>
                          </div>
                        )}
                        <div className={styles.roundInfo}>
                          <span className={styles.label}>Price:</span>
                          <span className={styles.price}>{price.toLocaleString()} EGP</span>
                        </div>
                        <Link href={`/${locale}/checkout/${round.id}`} style={{ textDecoration: 'none' }}>
                          <Button fullWidth className={styles.bookBtn}>Book This Round</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
