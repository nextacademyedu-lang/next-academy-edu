import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Event, Partner, Media } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

function getMediaUrl(media: Event['coverImage'] | Event['thumbnail']): string | null {
  if (!media || typeof media === 'number') return null;
  return (media as Media).url || null;
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ar: { event: 'فعالية', retreat: 'خلوة', corporate_training: 'تدريب مؤسسي' },
  en: { event: 'Event', retreat: 'Retreat', corporate_training: 'Corporate Training' },
};

const LOCATION_LABELS: Record<string, Record<string, string>> = {
  ar: { online: 'أونلاين', in_person: 'حضوري', hybrid: 'حضوري وأونلاين' },
  en: { online: 'Online', in_person: 'In Person', hybrid: 'Hybrid' },
};

const ROLE_LABELS: Record<string, Record<string, string>> = {
  ar: { speaker: 'متحدث', host: 'مقدم', panelist: 'عضو لجنة', moderator: 'مدير جلسة' },
  en: { speaker: 'Speaker', host: 'Host', panelist: 'Panelist', moderator: 'Moderator' },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'events',
      where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
      depth: 0,
      limit: 1,
    });

    const event = docs[0] as Event | undefined;
    if (!event) {
      return buildPageMetadata({
        locale,
        path: `/events/${slug}`,
        titleAr: 'تفاصيل الفعالية',
        titleEn: 'Event Details',
        descriptionAr: 'صفحة تفاصيل الفعالية.',
        descriptionEn: 'Event details page.',
      });
    }

    return buildPageMetadata({
      locale,
      path: `/events/${event.slug || event.id}`,
      titleAr: event.titleAr || event.titleEn || 'تفاصيل الفعالية',
      titleEn: event.titleEn || event.titleAr || 'Event Details',
      descriptionAr: event.shortDescriptionAr || event.shortDescriptionEn || 'تفاصيل الفعالية وجدولها.',
      descriptionEn: event.shortDescriptionEn || event.shortDescriptionAr || 'Event details and schedule.',
    });
  } catch {
    return buildPageMetadata({
      locale,
      path: `/events/${slug}`,
      titleAr: 'تفاصيل الفعالية',
      titleEn: 'Event Details',
      descriptionAr: 'صفحة تفاصيل الفعالية.',
      descriptionEn: 'Event details page.',
    });
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const dateLocale = isAr ? 'ar-EG' : 'en-US';
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'events',
    where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
    depth: 2,
    limit: 1,
  });

  const event: Event | undefined = docs[0];
  if (!event) notFound();

  // --- Derived values ---
  const title = isAr
    ? event.titleAr || event.titleEn || 'فعالية'
    : event.titleEn || event.titleAr || 'Event';

  const description = isAr
    ? event.shortDescriptionAr || event.shortDescriptionEn || ''
    : event.shortDescriptionEn || event.shortDescriptionAr || '';

  const typeLabel = TYPE_LABELS[locale]?.[event.type] || event.type;
  const locationLabel = LOCATION_LABELS[locale]?.[event.locationType || 'in_person'] || '';

  const coverImageUrl = getMediaUrl(event.coverImage) || getMediaUrl(event.thumbnail);

  const startDate = new Date(event.eventDate).toLocaleDateString(dateLocale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dateRange = event.eventEndDate
    ? `${new Date(event.eventDate).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric' })} – ${new Date(event.eventEndDate).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}`
    : startDate;

  const venue = event.venue || (isAr ? 'يُحدد لاحقاً' : 'TBA');
  const priceText = event.price
    ? `${event.price.toLocaleString()} ${event.currency || 'EGP'}`
    : isAr ? 'مجاني' : 'Free';

  const deadline = event.registrationDeadline
    ? new Date(event.registrationDeadline).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const isRegistrationOpen = event.registrationDeadline
    ? new Date(event.registrationDeadline) >= new Date()
    : new Date(event.eventDate) >= new Date();

  const speakers = event.speakers ?? [];
  const agenda = event.agenda ?? [];
  const itinerary = event.itinerary ?? [];
  const includes = event.eventIncludes ?? [];
  const excludes = event.eventExcludes ?? [];
  const audience = event.targetAudience ?? [];

  const sponsors: Partner[] = [];
  if (event.sponsors) {
    for (const s of event.sponsors) {
      if (s && typeof s === 'object' && 'name' in s) sponsors.push(s as Partner);
    }
  }

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.main}>
        {/* ──── HERO ──── */}
        <section className={styles.heroSection}>
          {coverImageUrl && (
            <div className={styles.heroCover}>
              <Image src={coverImageUrl} alt={title} fill priority className={styles.heroCoverImage} sizes="100vw" />
              <div className={styles.heroCoverOverlay} />
            </div>
          )}
          <div className={styles.heroContainer}>
            <div className={styles.heroMeta}>
              <Badge variant="default">{typeLabel}</Badge>
              <Badge variant="outline">{locationLabel}</Badge>
            </div>
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.heroDescription}>{description}</p>}

            <div className={styles.heroInfoGrid}>
              <div className={styles.heroInfoItem}>
                <span className={styles.heroInfoIcon}>📅</span>
                <span className={styles.heroInfoLabel}>{dateRange}</span>
              </div>
              <div className={styles.heroInfoItem}>
                <span className={styles.heroInfoIcon}>📍</span>
                <span className={styles.heroInfoLabel}>{venue}</span>
              </div>
              {event.durationHours && (
                <div className={styles.heroInfoItem}>
                  <span className={styles.heroInfoIcon}>⏱</span>
                  <span>{event.durationHours} {isAr ? 'ساعة' : 'hours'}</span>
                </div>
              )}
              {event.language && (
                <div className={styles.heroInfoItem}>
                  <span className={styles.heroInfoIcon}>🗣</span>
                  <span>{event.language === 'ar' ? 'العربية' : event.language === 'en' ? 'English' : isAr ? 'عربي وإنجليزي' : 'Arabic & English'}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className={styles.contentLayout}>
          {/* ──── MAIN CONTENT ──── */}
          <div className={styles.mainContent}>

            {/* Speakers */}
            {speakers.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>{isAr ? 'المتحدثون' : 'Speakers & Hosts'}</h2>
                <div className={styles.speakersGrid}>
                  {speakers.map((speaker, i) => {
                    const photoUrl = speaker.photo && typeof speaker.photo === 'object'
                      ? (speaker.photo as Media).url
                      : null;
                    return (
                      <div key={speaker.id ?? i} className={styles.speakerCard}>
                        {photoUrl ? (
                          <Image src={photoUrl} alt={speaker.name} width={64} height={64} className={styles.speakerAvatar} />
                        ) : (
                          <div className={styles.speakerAvatarFallback}>
                            {speaker.name[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className={styles.speakerInfo}>
                          <p className={styles.speakerName}>{speaker.name}</p>
                          {speaker.title && <p className={styles.speakerTitle}>{speaker.title}</p>}
                          {speaker.role && (
                            <Badge variant="outline">{ROLE_LABELS[locale]?.[speaker.role] || speaker.role}</Badge>
                          )}
                          {speaker.bio && <p className={styles.speakerBio}>{speaker.bio}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Agenda (events & corporate training) */}
            {agenda.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>{isAr ? 'جدول الأعمال' : 'Agenda'}</h2>
                <div className={styles.agendaList}>
                  {agenda.map((slot, i) => (
                    <div key={slot.id ?? i} className={styles.agendaItem}>
                      <span className={styles.agendaTime}>{slot.time}</span>
                      <div className={styles.agendaContent}>
                        <p className={styles.agendaTitle}>
                          {isAr ? slot.titleAr : (slot.titleEn || slot.titleAr)}
                        </p>
                        {slot.descriptionAr && (
                          <p className={styles.agendaDesc}>{slot.descriptionAr}</p>
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

            {/* Itinerary (retreats) */}
            {itinerary.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>{isAr ? 'البرنامج اليومي' : 'Daily Itinerary'}</h2>
                <div className={styles.itineraryList}>
                  {itinerary.map((day, i) => (
                    <div key={day.id ?? i} className={styles.itineraryDay}>
                      <div className={styles.itineraryDayHeader}>
                        <span className={styles.dayTag}>
                          {isAr ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}
                        </span>
                        <h3 className={styles.itineraryDayTitle}>
                          {isAr ? day.titleAr : (day.titleEn || day.titleAr)}
                        </h3>
                      </div>
                      {day.activities && day.activities.length > 0 && (
                        <ul className={styles.activityList}>
                          {day.activities.map((activity, j) => (
                            <li key={activity.id ?? j} className={styles.activityItem}>
                              {activity.time && <span className={styles.activityTime}>{activity.time}</span>}
                              <span>{isAr ? activity.activityAr : (activity.activityEn || activity.activityAr)}</span>
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
            {(includes.length > 0 || excludes.length > 0) && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>{isAr ? 'ماذا يشمل' : "What's Included"}</h2>
                <div className={styles.includesExcludesGrid}>
                  {includes.length > 0 && (
                    <div className={styles.includesColumn}>
                      <h3>{isAr ? '✅ يشمل' : '✅ Includes'}</h3>
                      <ul className={styles.includesList}>
                        {includes.map((inc, i) => (
                          <li key={inc.id ?? i} className={styles.includeItem}>{inc.item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {excludes.length > 0 && (
                    <div className={styles.excludesColumn}>
                      <h3>{isAr ? '❌ لا يشمل' : '❌ Not Included'}</h3>
                      <ul className={styles.excludesList}>
                        {excludes.map((exc, i) => (
                          <li key={exc.id ?? i} className={styles.excludeItem}>{exc.item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Target Audience */}
            {audience.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>{isAr ? 'الفئة المستهدفة' : 'Who Is This For?'}</h2>
                <ul className={styles.audienceList}>
                  {audience.map((item, i) => (
                    <li key={item.id ?? i} className={styles.audienceItem}>{item.item}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Sponsors */}
            {sponsors.length > 0 && (
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>{isAr ? 'الرعاة والشركاء' : 'Sponsors & Partners'}</h2>
                <div className={styles.sponsorsGrid}>
                  {sponsors.map((partner) => {
                    const logoUrl = partner.logo && typeof partner.logo === 'object'
                      ? (partner.logo as Media).url
                      : null;
                    return (
                      <a
                        key={partner.id}
                        href={partner.website || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.sponsorCard}
                      >
                        {logoUrl ? (
                          <Image src={logoUrl} alt={partner.name} width={120} height={48} className={styles.sponsorLogo} />
                        ) : (
                          <span className={styles.sponsorName}>{partner.name}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ──── SIDEBAR ──── */}
          <aside className={styles.sidebar}>
            <div className={styles.stickyBox}>
              <div className={styles.registrationCard}>
                <h3 className={styles.registrationTitle}>
                  {isAr ? 'التسجيل' : 'Registration'}
                </h3>

                <div className={styles.priceTag}>
                  {priceText}
                  {event.price ? (
                    <small> / {isAr ? 'شخص' : 'person'}</small>
                  ) : null}
                </div>

                <div className={styles.registrationInfo}>
                  <div className={styles.registrationInfoItem}>
                    <span className={styles.registrationInfoIcon}>📅</span>
                    <span>{dateRange}</span>
                  </div>
                  <div className={styles.registrationInfoItem}>
                    <span className={styles.registrationInfoIcon}>📍</span>
                    <span>{venue}</span>
                  </div>
                  {event.maxCapacity && event.maxCapacity > 0 && (
                    <div className={styles.registrationInfoItem}>
                      <span className={styles.registrationInfoIcon}>👥</span>
                      <span>{event.maxCapacity} {isAr ? 'مقعد' : 'seats'}</span>
                    </div>
                  )}
                </div>

                {deadline && (
                  <p className={styles.deadlineNotice}>
                    ⏰ {isAr ? `آخر موعد للتسجيل: ${deadline}` : `Registration deadline: ${deadline}`}
                  </p>
                )}

                {isRegistrationOpen ? (
                  <Link
                    href={`/${locale}/contact?event=${encodeURIComponent(title)}`}
                    className={styles.registerButton}
                  >
                    {isAr ? 'سجّل الآن' : 'Register Now'}
                  </Link>
                ) : (
                  <p className={styles.capacityNotice}>
                    {isAr ? 'التسجيل مغلق' : 'Registration closed'}
                  </p>
                )}

                {event.maxCapacity && event.maxCapacity > 0 && (
                  <p className={styles.capacityNotice}>
                    {isAr
                      ? `${event.attendeesCount || 0} من ${event.maxCapacity} مسجل`
                      : `${event.attendeesCount || 0} of ${event.maxCapacity} registered`}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
