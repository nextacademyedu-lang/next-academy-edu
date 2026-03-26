import React from 'react';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Program, Round, Instructor, Session } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookRoundButton } from '@/components/checkout/book-round-button';
import { EarlyBirdCountdown } from '@/components/ui/early-bird-countdown';
import { InstructorCard } from '@/components/sections/instructor-card';
import styles from './page.module.css';

export default async function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('ProgramDetail');
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'programs',
    where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
    depth: 3,
    limit: 1,
  });

  const program: Program | undefined = docs[0];
  if (!program) notFound();

  // --- Derive display values from the typed Program ---
  const title = program.titleEn || program.titleAr || 'Program';
  const description = program.shortDescriptionEn || program.shortDescriptionAr || '';
  const objectives = (program.objectives ?? []).filter(
    (obj): obj is { item: string; id?: string | null } => typeof obj.item === 'string',
  );

  // Instructor — may be a populated Instructor object or just a number (FK)
  const instructor: Instructor | null =
    typeof program.instructor === 'object' && program.instructor !== null
      ? program.instructor
      : null;
  const instructorName = instructor
    ? `${instructor.firstName ?? ''} ${instructor.lastName ?? ''}`.trim()
    : '';

  // Fetch rounds for this program from the separate "rounds" collection
  const { docs: roundDocs } = await payload.find({
    collection: 'rounds',
    where: { program: { equals: program.id } },
    depth: 0,
    limit: 50,
    sort: 'startDate',
  });
  const rounds: Round[] = roundDocs;

  const roundIds = rounds.map((round) => round.id);
  let sessionsByRound = new Map<number, Session[]>();
  if (roundIds.length > 0) {
    const { docs: sessionDocs } = await payload.find({
      collection: 'sessions',
      where: { round: { in: roundIds } },
      depth: 0,
      limit: 500,
      sort: 'date',
    });

    sessionsByRound = (sessionDocs as Session[]).reduce((acc, session) => {
      const roundId = typeof session.round === 'number' ? session.round : session.round?.id;
      if (!roundId) return acc;
      const current = acc.get(roundId) || [];
      current.push(session);
      acc.set(roundId, current);
      return acc;
    }, new Map<number, Session[]>());
  }

  const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroMeta}>
              <Badge variant="default">{program.type}</Badge>
              {program.level && <Badge variant="outline">{program.level}</Badge>}
            </div>
            <h1 className={styles.title}>{title}</h1>
            {instructorName && (
              <p className={styles.instructor}>{t('ledBy')} <strong>{instructorName}</strong></p>
            )}
          </div>
        </section>

        <div className={styles.contentLayout}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {description && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>{t('aboutProgram')}</h2>
                <p className={styles.paragraph}>{description}</p>
              </section>
            )}

            {objectives.length > 0 && (
              <section className={styles.sectionBlock}>
                <h3 className={styles.subTitle}>{t('whatYouLearn')}</h3>
                <ul className={styles.list}>
                  {objectives.map((obj, i) => (
                    <li key={obj.id ?? i} className={styles.listItem}>{obj.item}</li>
                  ))}
                </ul>
              </section>
            )}

            {instructor && (
              <InstructorCard instructor={instructor} locale={locale} />
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.stickyBox}>
              <h3 className={styles.sidebarTitle}>{t('availableRounds')}</h3>
              {rounds.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('noRounds')}</p>
              )}
              <div className={styles.roundsList}>
                {rounds.map((round) => {
                  const startDate = round.startDate
                    ? new Date(round.startDate).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })
                    : '';
                  const endDate = round.endDate
                    ? new Date(round.endDate).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
                    : '';
                  const seatsLeft = round.maxCapacity - (round.currentEnrollments ?? 0);
                  const price = round.price ?? 0;
                  const roundSessions = sessionsByRound.get(round.id) || [];

                  // Early bird logic
                  const hasEarlyBird =
                    round.earlyBirdPrice != null &&
                    round.earlyBirdDeadline != null &&
                    new Date(round.earlyBirdDeadline) > new Date();
                  const displayPrice = hasEarlyBird ? (round.earlyBirdPrice ?? price) : price;

                  return (
                    <Card key={round.id} className={styles.roundCard}>
                      <CardHeader className={styles.roundHeader}>
                        {startDate && (
                          <span className={styles.roundDate}>{startDate}{endDate ? ` – ${endDate}` : ''}</span>
                        )}
                        {round.maxCapacity > 0 && (
                          <Badge variant="success">{t('seatsLeft', { count: seatsLeft })}</Badge>
                        )}
                      </CardHeader>
                      <CardContent className={styles.roundContent}>
                        {round.locationType && (
                          <div className={styles.roundInfo}>
                            <span className={styles.label}>{t('format')}</span>
                            <span className={styles.value}>{round.locationType}</span>
                          </div>
                        )}
                        <div className={styles.roundInfo}>
                          <span className={styles.label}>{t('sessionsCount')}</span>
                          <span className={styles.value}>{roundSessions.length}</span>
                        </div>
                        {hasEarlyBird ? (
                          <EarlyBirdCountdown
                            deadline={round.earlyBirdDeadline!}
                            earlyBirdPrice={round.earlyBirdPrice!}
                            regularPrice={price}
                            currency={t('currency')}
                          />
                        ) : (
                          <div className={styles.roundInfo}>
                            <span className={styles.label}>{t('price')}</span>
                            <span className={styles.price}>{price.toLocaleString()} {t('currency')}</span>
                          </div>
                        )}
                        {roundSessions.length > 0 && (
                          <div className={styles.roundSessions}>
                            <p className={styles.roundSessionsTitle}>{t('roundSessionsTitle')}</p>
                            <ul className={styles.roundSessionsList}>
                              {roundSessions.map((session) => (
                                <li key={session.id} className={styles.roundSessionItem}>
                                  <span className={styles.roundSessionDate}>
                                    {new Date(session.date).toLocaleDateString(dateLocale, {
                                      day: '2-digit',
                                      month: 'short',
                                    })}
                                  </span>
                                  <span className={styles.roundSessionTime}>
                                    {session.startTime} - {session.endTime}
                                  </span>
                                  <span className={styles.roundSessionTitle}>{session.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <BookRoundButton
                          locale={locale}
                          roundId={round.id}
                          programSlug={program.slug || String(program.id)}
                          label={t('bookRound')}
                          className={styles.bookBtn}
                        />
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
