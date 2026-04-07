import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Program, Round, Instructor, Session, Partner, Media } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookRoundButton } from '@/components/checkout/book-round-button';
import { EarlyBirdCountdown } from '@/components/ui/early-bird-countdown';
import { InstructorCard } from '@/components/sections/instructor-card';
import { buildYouTubeEmbedUrl, buildYouTubeThumbnailUrl } from '@/lib/youtube';
import { MediaPlayer } from '@/components/ui/media-player';
import { getInstructorNames, getFirstInstructor } from '@/lib/instructor-helpers';
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
  const title =
    locale === 'ar'
      ? program.titleAr || program.titleEn || 'Program'
      : program.titleEn || program.titleAr || 'Program';
  const description =
    locale === 'ar'
      ? program.shortDescriptionAr || program.shortDescriptionEn || ''
      : program.shortDescriptionEn || program.shortDescriptionAr || '';
  const objectives = (program.objectives ?? []).filter(
    (obj): obj is { item: string; id?: string | null } => typeof obj.item === 'string',
  );

  function getMediaUrl(media: Program['thumbnail'] | Program['coverImage']): string | null {
    if (!media || typeof media === 'number') return null;
    return (media as Media).url || null;
  }

  const coverImageUrlFromMedia = getMediaUrl(program.coverImage) || getMediaUrl(program.thumbnail);

  // Instructor — hasMany field, extract first instructor and combined names
  const instructor = getFirstInstructor(program.instructor);
  const instructorName = getInstructorNames(program.instructor);

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
  const watchRecordingLabel = locale === 'ar' ? 'مشاهدة التسجيل' : 'Watch Recording';
  const openOnYoutubeLabel = locale === 'ar' ? 'فتح على YouTube' : 'Open on YouTube';
  const noRecordingEmbedLabel =
    locale === 'ar' ? 'الرابط لا يدعم العرض المضمن، افتحه على YouTube.' : 'This link cannot be embedded. Open it on YouTube.';
  const firstRecordingRound = rounds.find(
    (round) => typeof round.meetingUrl === 'string' && round.meetingUrl.trim().length > 0,
  );
  const coverImageUrl =
    coverImageUrlFromMedia ||
    (firstRecordingRound?.meetingUrl ? buildYouTubeThumbnailUrl(firstRecordingRound.meetingUrl, 'hqdefault') : null);

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.heroSection}>
          {coverImageUrl && (
            <div className={styles.heroCover}>
              <Image
                src={coverImageUrl}
                alt={title}
                fill
                priority
                className={styles.heroCoverImage}
                sizes="100vw"
              />
              <div className={styles.heroCoverOverlay} />
            </div>
          )}
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

            {/* Speakers / Hosts */}
            {program.speakers && program.speakers.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>
                  {locale === 'ar' ? 'المتحدثون' : 'Speakers & Hosts'}
                </h2>
                <div className={styles.speakersGrid}>
                  {program.speakers.map((speaker, i) => {
                    const photoUrl = speaker.photo && typeof speaker.photo === 'object'
                      ? (speaker.photo as Media).url
                      : null;
                    const roleLabels: Record<string, string> = locale === 'ar'
                      ? { speaker: 'متحدث', host: 'مقدم', panelist: 'عضو لجنة', moderator: 'مدير جلسة' }
                      : { speaker: 'Speaker', host: 'Host', panelist: 'Panelist', moderator: 'Moderator' };
                    return (
                      <div key={speaker.id ?? i} className={styles.speakerCard}>
                        {photoUrl ? (
                          <Image src={photoUrl} alt={speaker.name} width={64} height={64} className={styles.speakerAvatar} />
                        ) : (
                          <div className={styles.speakerAvatarFallback}>
                            {speaker.name[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          <p className={styles.speakerName}>{speaker.name}</p>
                          {speaker.title && <p className={styles.speakerTitle}>{speaker.title}</p>}
                          {speaker.role && (
                            <Badge variant="outline">{roleLabels[speaker.role] || speaker.role}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Event Agenda */}
            {program.agenda && program.agenda.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>
                  {locale === 'ar' ? 'جدول الأعمال' : 'Agenda'}
                </h2>
                <div className={styles.agendaList}>
                  {program.agenda.map((slot, i) => (
                    <div key={slot.id ?? i} className={styles.agendaItem}>
                      <span className={styles.agendaTime}>{slot.time}</span>
                      <div className={styles.agendaContent}>
                        <p className={styles.agendaTitle}>
                          {locale === 'ar' ? slot.titleAr : (slot.titleEn || slot.titleAr)}
                        </p>
                        {slot.descriptionAr && (
                          <p className={styles.agendaDesc}>
                            {locale === 'ar' ? slot.descriptionAr : slot.descriptionAr}
                          </p>
                        )}
                        {slot.speaker && (
                          <span className={styles.agendaSpeaker}>👤 {slot.speaker}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Retreat Itinerary */}
            {program.itinerary && program.itinerary.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>
                  {locale === 'ar' ? 'البرنامج اليومي' : 'Daily Itinerary'}
                </h2>
                <div className={styles.itineraryList}>
                  {program.itinerary.map((day, i) => (
                    <div key={day.id ?? i} className={styles.itineraryDay}>
                      <div className={styles.itineraryDayHeader}>
                        <span className={styles.dayTag}>
                          {locale === 'ar' ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}
                        </span>
                        <h3 className={styles.itineraryDayTitle}>
                          {locale === 'ar' ? day.titleAr : (day.titleEn || day.titleAr)}
                        </h3>
                      </div>
                      {day.activities && day.activities.length > 0 && (
                        <ul className={styles.activityList}>
                          {day.activities.map((activity, j) => (
                            <li key={activity.id ?? j} className={styles.activityItem}>
                              {activity.time && (
                                <span className={styles.activityTime}>{activity.time}</span>
                              )}
                              <span className={styles.activityText}>
                                {locale === 'ar' ? activity.activityAr : (activity.activityEn || activity.activityAr)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Includes / Excludes */}
            {((program.includes && program.includes.length > 0) || (program.excludes && program.excludes.length > 0)) && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>
                  {locale === 'ar' ? 'ماذا يشمل' : 'What\'s Included'}
                </h2>
                <div className={styles.includesExcludesGrid}>
                  {program.includes && program.includes.length > 0 && (
                    <div>
                      <h3 className={styles.subTitle}>{locale === 'ar' ? '✅ يشمل' : '✅ Includes'}</h3>
                      <ul className={styles.list}>
                        {program.includes.map((inc, i) => (
                          <li key={inc.id ?? i} className={styles.listItem}>{inc.item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {program.excludes && program.excludes.length > 0 && (
                    <div>
                      <h3 className={styles.subTitle}>{locale === 'ar' ? '❌ لا يشمل' : '❌ Not Included'}</h3>
                      <ul className={styles.excludeList}>
                        {program.excludes.map((exc, i) => (
                          <li key={exc.id ?? i} className={styles.excludeItem}>{exc.item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Sponsors */}
            {program.sponsors && program.sponsors.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>
                  {locale === 'ar' ? 'الرعاة والشركاء' : 'Sponsors & Partners'}
                </h2>
                <div className={styles.sponsorsGrid}>
                  {program.sponsors.map((sponsor) => {
                    if (typeof sponsor === 'number') return null;
                    const partnerDoc = sponsor as Partner;
                    const logoUrl = partnerDoc.logo && typeof partnerDoc.logo === 'object'
                      ? (partnerDoc.logo as Media).url
                      : null;
                    return (
                      <a
                        key={partnerDoc.id}
                        href={partnerDoc.website || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.sponsorCard}
                      >
                        {logoUrl ? (
                          <Image src={logoUrl} alt={partnerDoc.name} width={120} height={48} className={styles.sponsorLogo} />
                        ) : (
                          <span className={styles.sponsorName}>{partnerDoc.name}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </section>
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
                  const isPastRound = round.startDate ? new Date(round.startDate) < new Date() : false;
                  const hasRecordingLink = typeof round.meetingUrl === 'string' && round.meetingUrl.trim().length > 0;
                  const showWebinarRecording =
                    program.type === 'webinar' &&
                    hasRecordingLink &&
                    (round.status === 'completed' || isPastRound);
                  const recordingEmbedUrl = showWebinarRecording && round.meetingUrl
                    ? buildYouTubeEmbedUrl(round.meetingUrl)
                    : null;
                  const recordingAnchorId = `recording-${round.id}`;

                  return (
                    <Card key={round.id} className={styles.roundCard}>
                      <CardHeader className={styles.roundHeader}>
                        {startDate && (
                          <span className={styles.roundDate}>{startDate}{endDate ? ` – ${endDate}` : ''}</span>
                        )}
                        {round.maxCapacity > 0 && !isPastRound && round.status !== 'completed' && (
                          <Badge variant="success">{t('seatsLeft', { count: seatsLeft })}</Badge>
                        )}
                      </CardHeader>
                      <CardContent className={styles.roundContent}>
                        {round.locationType && (
                          <div className={styles.roundInfo}>
                            <span className={styles.label}>{t('format')}</span>
                            <span className={styles.value}>
                              {round.locationType === 'online'
                                ? (locale === 'ar' ? 'أونلاين' : 'Online')
                                : round.locationType === 'in-person'
                                  ? (locale === 'ar' ? 'حضوري' : 'In-Person')
                                  : (locale === 'ar' ? 'حضوري + أونلاين' : 'Hybrid')}
                            </span>
                          </div>
                        )}
                        {(round.locationType === 'in-person' || round.locationType === 'hybrid') && round.locationName && (
                          <div className={styles.roundInfo}>
                            <span className={styles.label}>{locale === 'ar' ? 'المكان' : 'Venue'}</span>
                            <span className={styles.value}>{round.locationName}</span>
                          </div>
                        )}
                        {(round.locationType === 'in-person' || round.locationType === 'hybrid') && round.locationAddress && (
                          <div className={styles.roundInfo}>
                            <span className={styles.label}>{locale === 'ar' ? 'العنوان' : 'Address'}</span>
                            <span className={styles.value}>
                              {round.locationMapUrl ? (
                                <a href={round.locationMapUrl} target="_blank" rel="noreferrer" className={styles.mapLink}>
                                  {round.locationAddress} 📍
                                </a>
                              ) : (
                                round.locationAddress
                              )}
                            </span>
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
                        {showWebinarRecording && (
                          <div id={recordingAnchorId} className={styles.recordingWrap}>
                            {recordingEmbedUrl ? (
                              <MediaPlayer
                                src={recordingEmbedUrl}
                                title={`${title} - ${watchRecordingLabel}`}
                                thumbnailUrl={round.meetingUrl ? (buildYouTubeThumbnailUrl(round.meetingUrl) ?? undefined) : undefined}
                              />
                            ) : (
                              <p className={styles.recordingFallback}>{noRecordingEmbedLabel}</p>
                            )}
                          </div>
                        )}

                        {showWebinarRecording && recordingEmbedUrl ? (
                          <a href={`#${recordingAnchorId}`} className={styles.recordingActionLink}>
                            {watchRecordingLabel}
                          </a>
                        ) : showWebinarRecording && hasRecordingLink ? (
                          <a
                            href={round.meetingUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.recordingActionLink}
                          >
                            {openOnYoutubeLabel}
                          </a>
                        ) : (
                          <BookRoundButton
                            locale={locale}
                            roundId={round.id}
                            programSlug={program.slug || String(program.id)}
                            label={t('bookRound')}
                            className={styles.bookBtn}
                          />
                        )}
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
