import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type {
  ConsultationAvailability,
  ConsultationSlot,
  ConsultationType,
  Instructor,
  Media,
  Program,
  Round,
} from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingSidebar } from '@/components/instructor/booking-sidebar';
import styles from './page.module.css';
import { buildPageMetadata } from '@/lib/seo/metadata';

function getMediaUrl(media: Instructor['picture'] | Program['thumbnail'] | Program['coverImage']): string | null {
  if (!media || typeof media === 'number') return null;
  const typedMedia = media as Media;
  return typedMedia.url || null;
}

function extractRichTextPlainText(value: unknown): string {
  const root = (value as { root?: { children?: unknown[] } } | null)?.root;
  if (!root || !Array.isArray(root.children)) return '';

  const walk = (nodes: unknown[]): string[] => {
    const collected: string[] = [];
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;

      const textValue = (node as { text?: unknown }).text;
      if (typeof textValue === 'string' && textValue.trim()) {
        collected.push(textValue.trim());
      }

      const children = (node as { children?: unknown[] }).children;
      if (Array.isArray(children)) {
        collected.push(...walk(children));
      }
    }
    return collected;
  };

  return walk(root.children).join(' ').replace(/\s+/g, ' ').trim();
}

function buildProgramTypeLabel(type: Program['type'], locale: string): string {
  if (locale === 'ar') {
    if (type === 'course') return 'دورة';
    if (type === 'workshop') return 'ورشة';
    if (type === 'camp') return 'معسكر';
    if (type === 'webinar') return 'ندوة';
    return type ?? 'برنامج';
  }
  if (type === 'course') return 'Course';
  if (type === 'workshop') return 'Workshop';
  if (type === 'camp') return 'Camp';
  if (type === 'webinar') return 'Webinar';
  return type ?? 'Program';
}

function dayLabel(day: string, locale: string): string {
  const normalized = day.toLowerCase();
  const mapAr: Record<string, string> = {
    saturday: 'السبت',
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
  };
  const mapEn: Record<string, string> = {
    saturday: 'Saturday',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
  };

  return locale === 'ar' ? mapAr[normalized] || normalized : mapEn[normalized] || normalized;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'instructors',
      where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
      depth: 0,
      limit: 1,
    });

    const instructor = docs[0] as Instructor | undefined;
    if (!instructor) {
      return buildPageMetadata({
        locale,
        path: `/instructors/${slug}`,
        titleAr: 'ملف المدرب',
        titleEn: 'Instructor Profile',
        descriptionAr: 'تفاصيل المدرب وبرامجه المتاحة.',
        descriptionEn: 'Instructor details and available programs.',
      });
    }

    const fullName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim();
    const titleAr = fullName ? `${fullName} - ملف المدرب` : 'ملف المدرب';
    const titleEn = fullName ? `${fullName} - Instructor Profile` : 'Instructor Profile';
    const role = instructor.jobTitle || instructor.tagline || '';

    return buildPageMetadata({
      locale,
      path: `/instructors/${instructor.slug || instructor.id}`,
      titleAr,
      titleEn,
      descriptionAr: role || 'تفاصيل المدرب وبرامجه المتاحة.',
      descriptionEn: role || 'Instructor details and available programs.',
    });
  } catch {
    return buildPageMetadata({
      locale,
      path: `/instructors/${slug}`,
      titleAr: 'ملف المدرب',
      titleEn: 'Instructor Profile',
      descriptionAr: 'تفاصيل المدرب وبرامجه المتاحة.',
      descriptionEn: 'Instructor details and available programs.',
    });
  }
}

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const now = new Date();

  const { docs } = await payload.find({
    collection: 'instructors',
    where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
    depth: 1,
    limit: 1,
  });

  const instructor = docs[0] as Instructor | undefined;
  if (!instructor) notFound();

  const programsResult = await payload.find({
    collection: 'programs',
    depth: 1,
    limit: 120,
    sort: '-createdAt',
    where: {
      and: [
        { isActive: { equals: true } },
        { instructor: { equals: instructor.id } },
      ],
    },
  });
  const programs = programsResult.docs as Program[];
  const programIds = programs.map((program) => program.id);

  let rounds: Round[] = [];
  if (programIds.length > 0) {
    const roundsResult = await payload.find({
      collection: 'rounds',
      depth: 0,
      limit: 500,
      sort: '-startDate',
      where: { program: { in: programIds } },
    });
    rounds = roundsResult.docs as Round[];
  }

  const consultationTypesResult = await payload.find({
    collection: 'consultation-types',
    depth: 0,
    limit: 50,
    sort: '-createdAt',
    where: {
      and: [
        { instructor: { equals: instructor.id } },
        { isActive: { equals: true } },
      ],
    },
  });
  const consultationTypes = consultationTypesResult.docs as ConsultationType[];
  const consultationTypeIds = consultationTypes.map((type) => type.id);

  const availabilityResult = await payload.find({
    collection: 'consultation-availability',
    depth: 0,
    limit: 100,
    sort: 'dayIndex',
    where: {
      and: [{ instructor: { equals: instructor.id } }, { isActive: { equals: true } }],
    },
  });
  const weeklyAvailability = availabilityResult.docs as ConsultationAvailability[];

  let availableSlots: ConsultationSlot[] = [];
  if (consultationTypeIds.length > 0) {
    const slotsResult = await payload.find({
      collection: 'consultation-slots',
      depth: 0,
      limit: 500,
      sort: 'date',
      where: {
        and: [
          { instructor: { equals: instructor.id } },
          { status: { equals: 'available' } },
          { date: { greater_than_equal: now.toISOString() } },
        ],
      },
    });
    availableSlots = slotsResult.docs as ConsultationSlot[];
  }

  const roundsByProgram = new Map<number, Round[]>();
  for (const round of rounds) {
    const programId = typeof round.program === 'number' ? round.program : round.program?.id;
    if (!programId) continue;
    const existing = roundsByProgram.get(programId) || [];
    existing.push(round);
    roundsByProgram.set(programId, existing);
  }

  const slotCountByType = new Map<number, number>();
  for (const slot of availableSlots) {
    const typeId = typeof slot.consultationType === 'number' ? slot.consultationType : slot.consultationType?.id;
    if (!typeId) continue;
    slotCountByType.set(typeId, (slotCountByType.get(typeId) || 0) + 1);
  }

  const consultationTypeTitleById = new Map<number, string>();
  for (const type of consultationTypes) {
    consultationTypeTitleById.set(
      type.id,
      type.titleEn || type.titleAr || type.title || 'Consultation',
    );
  }

  const totalLearners = rounds.reduce((sum, round) => sum + (round.currentEnrollments || 0), 0);
  const totalViews = programs.reduce((sum, program) => sum + (program.viewCount || 0), 0);
  const totalUpcomingRounds = rounds.filter((round) => round.startDate && new Date(round.startDate) >= now).length;
  const totalCompletedRounds = rounds.filter((round) => round.startDate && new Date(round.startDate) < now).length;
  const totalAvailableSlots = availableSlots.length;
  const profileImage = getMediaUrl(instructor.picture);
  const coverImageUrl = getMediaUrl(instructor.coverImage);

  const fullName = `${instructor.firstName} ${instructor.lastName}`.trim();
  const bioText = locale === 'ar'
    ? extractRichTextPlainText(instructor.bioAr)
    : extractRichTextPlainText(instructor.bioEn) || extractRichTextPlainText(instructor.bioAr);

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          {coverImageUrl && (
            <div className={styles.coverImageWrap}>
              <Image
                src={coverImageUrl}
                alt=""
                fill
                className={styles.coverImage}
                sizes="100vw"
                priority
              />
              <div className={styles.coverOverlay} />
            </div>
          )}
          <div className={styles.heroContainer}>
            <div className={styles.profileBlock}>
              <div className={styles.avatarWrap}>
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={fullName}
                    fill
                    unoptimized
                    className={styles.avatar}
                    sizes="(max-width: 768px) 180px, 220px"
                    priority
                  />
                ) : (
                  <div className={styles.avatarFallback}>{fullName[0]?.toUpperCase() || '?'}</div>
                )}
              </div>

              <div className={styles.heroContent}>
                <p className={styles.eyebrow}>{locale === 'ar' ? 'ملف المدرب' : 'Instructor Profile'}</p>
                <h1 className={styles.name}>{fullName}</h1>
                <p className={styles.title}>{instructor.jobTitle || instructor.tagline || (locale === 'ar' ? 'مدرب خبير' : 'Expert Instructor')}</p>

                <div className={styles.badges}>
                  <Badge variant="default">{locale === 'ar' ? 'عضو هيئة تدريب' : 'Faculty Member'}</Badge>
                  {programs.length > 0 && (
                    <Badge variant="outline">{programs.length} {locale === 'ar' ? 'برامج' : 'Programs'}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.metrics}>
              <div className={styles.metricCard}>
                <span>{totalViews.toLocaleString()}</span>
                <small>{locale === 'ar' ? 'مشاهدة' : 'Views'}</small>
              </div>
              <div className={styles.metricCard}>
                <span>{totalLearners.toLocaleString()}</span>
                <small>{locale === 'ar' ? 'متعلّم' : 'Learners'}</small>
              </div>
              <div className={styles.metricCard}>
                <span>{totalUpcomingRounds}</span>
                <small>{locale === 'ar' ? 'دفعات قادمة' : 'Upcoming Batches'}</small>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={styles.contentLayout}>
            <div className={styles.mainContent}>
              <section className={styles.block}>
                <h2>{locale === 'ar' ? 'نبذة عن المدرب' : 'About Instructor'}</h2>
                <p className={styles.bio}>
                  {bioText || (locale === 'ar'
                    ? 'سيتم إضافة نبذة المدرب قريباً.'
                    : 'Instructor biography will be available soon.')}
                </p>
              </section>

              <section className={styles.block}>
                <div className={styles.blockHeader}>
                  <h2>{locale === 'ar' ? 'الدورات والورش' : 'Courses And Workshops'}</h2>
                  <Link href={`/${locale}/courses`}>
                    <Button variant="outline" size="sm">
                      {locale === 'ar' ? 'تصفح كل الدورات' : 'Browse All Courses'}
                    </Button>
                  </Link>
                </div>

                <div className={styles.programsGrid}>
                  {programs.length === 0 && (
                    <p className={styles.emptyText}>
                      {locale === 'ar' ? 'لا يوجد برامج منشورة لهذا المدرب بعد.' : 'No published programs for this instructor yet.'}
                    </p>
                  )}

                  {programs.map((program) => {
                    const title = program.titleEn || program.titleAr || 'Program';
                    const programImage = getMediaUrl(program.thumbnail) || getMediaUrl(program.coverImage);
                    const programRounds = roundsByProgram.get(program.id) || [];
                    const learnersCount = programRounds.reduce((sum, round) => sum + (round.currentEnrollments || 0), 0);

                    return (
                      <article key={program.id} className={styles.programCard}>
                        <div className={styles.programMedia}>
                          {programImage ? (
                            <Image
                              src={programImage}
                              alt={title}
                              fill
                              className={styles.programImage}
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          ) : (
                            <div className={styles.programFallback} />
                          )}
                          <span className={styles.programType}>{buildProgramTypeLabel(program.type, locale)}</span>
                        </div>

                        <div className={styles.programBody}>
                          <h3>{title}</h3>
                          <div className={styles.programMeta}>
                            <span>{program.durationHours || 0} {locale === 'ar' ? 'ساعة' : 'hrs'}</span>
                            <span>{program.sessionsCount || 0} {locale === 'ar' ? 'جلسة' : 'sessions'}</span>
                            <span>{learnersCount.toLocaleString()} {locale === 'ar' ? 'طالب' : 'learners'}</span>
                          </div>
                        </div>

                        <div className={styles.programFooter}>
                          <Link href={`/${locale}/programs/${program.slug || program.id}`}>
                            <Button variant="primary" size="sm">
                              {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                            </Button>
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className={styles.sidebar}>
              <BookingSidebar
                instructor={{
                  id: String(instructor.id),
                  slug: instructor.slug || String(instructor.id),
                  name: fullName,
                }}
                consultationTypes={consultationTypes.map((t) => ({
                  id: String(t.id),
                  title: t.titleEn || t.titleAr || t.title || 'Consultation',
                  durationMinutes: t.durationMinutes || 0,
                  price: t.price || 0,
                  currency: t.currency || 'EGP',
                }))}
              />
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
