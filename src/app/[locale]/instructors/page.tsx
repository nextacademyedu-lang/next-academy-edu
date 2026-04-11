import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Instructor, Program, Round, Media } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import styles from './page.module.css';
import { getInstructorIds } from '@/lib/instructor-helpers';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/instructors',
    titleAr: 'المدربون',
    titleEn: 'Instructors',
    descriptionAr: 'تعرّف على مدربي Next Academy وخبراتهم العملية وبرامجهم المتاحة.',
    descriptionEn: 'Meet Next Academy instructors, their practical experience, and available programs.',
  });
}

function getInstructorPictureUrl(picture: Instructor['picture']): string | null {
  if (!picture || typeof picture === 'number') return null;
  const media = picture as Media;
  return media.url || null;
}

export default async function InstructorsPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });

  let instructors: Instructor[] = [];
  let programs: Program[] = [];
  let rounds: Round[] = [];

  try {
    const instructorsResult = await payload.find({
      collection: 'instructors',
      depth: 1,
      limit: 80,
      sort: 'featuredOrder',
      where: { isActive: { equals: true } },
    });
    instructors = instructorsResult.docs as Instructor[];

    const instructorIds = instructors.map((instructor) => instructor.id);
    if (instructorIds.length > 0) {
      const programsResult = await payload.find({
        collection: 'programs',
        depth: 0,
        limit: 400,
        sort: '-createdAt',
        where: {
          and: [
            { isActive: { equals: true } },
            { instructor: { in: instructorIds } },
          ],
        },
      });
      programs = programsResult.docs as Program[];

      const programIds = programs.map((program) => program.id);
      if (programIds.length > 0) {
        const roundsResult = await payload.find({
          collection: 'rounds',
          depth: 0,
          limit: 700,
          sort: '-startDate',
          where: { program: { in: programIds } },
        });
        rounds = roundsResult.docs as Round[];
      }
    }
  } catch (error) {
    console.error('[InstructorsPage] Failed to fetch data:', error);
  }

  const programInstructorMap = new Map<number, number[]>();
  const programsCountByInstructor = new Map<number, number>();
  for (const program of programs) {
    const instructorIds = getInstructorIds(program.instructor);
    programInstructorMap.set(program.id, instructorIds);
    for (const iid of instructorIds) {
      programsCountByInstructor.set(iid, (programsCountByInstructor.get(iid) || 0) + 1);
    }
  }

  const learnersCountByInstructor = new Map<number, number>();
  for (const round of rounds) {
    const programId = typeof round.program === 'number' ? round.program : round.program?.id;
    if (!programId) continue;

    const instructorIds = programInstructorMap.get(programId) || [];
    for (const instructorId of instructorIds) {
      const currentLearners = learnersCountByInstructor.get(instructorId) || 0;
      learnersCountByInstructor.set(instructorId, currentLearners + (round.currentEnrollments || 0));
    }
  }

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.header}>
          <div className={styles.headerContainer}>
            <p className={styles.eyebrow}>{locale === 'ar' ? 'قادة وخبراء السوق' : 'Market Experts'}</p>
            <h1 className={styles.title}>
              {locale === 'ar' ? 'تعلّم من مدربين حقيقيين' : 'Learn From Real Builders'}
            </h1>
            <p className={styles.subtitle}>
              {locale === 'ar'
                ? 'مدربونا يقودون شركات ومشاريع فعلية، وينقلون لك الخبرة التطبيقية مباشرة.'
                : 'Our instructors are active practitioners with field-tested frameworks, not theory-only trainers.'}
            </p>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {instructors.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar' ? 'لا يوجد مدربون متاحون حالياً.' : 'No instructors available right now.'}
                </p>
              )}

              {instructors.map((instructor) => {
                const fullName = `${instructor.firstName} ${instructor.lastName}`.trim();
                const imageUrl = getInstructorPictureUrl(instructor.picture);
                const programCount = programsCountByInstructor.get(instructor.id) || 0;
                const learnersCount = learnersCountByInstructor.get(instructor.id) || 0;

                return (
                  <article key={instructor.id} className={styles.card}>
                    <div className={styles.media}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={fullName}
                          fill
                          unoptimized
                          className={styles.avatar}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className={styles.fallbackAvatar}>
                          {fullName[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span className={styles.ribbon}>
                        {locale === 'ar' ? 'مدرب معتمد' : 'Featured Mentor'}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <h2 className={styles.name}>{fullName}</h2>
                      <p className={styles.role}>{instructor.jobTitle || instructor.tagline || (locale === 'ar' ? 'مدرب خبير' : 'Expert Instructor')}</p>

                      <div className={styles.metrics}>
                        <div className={styles.metric}>
                          <span>{programCount}</span>
                          <small>{locale === 'ar' ? 'برامج' : 'Tracks'}</small>
                        </div>
                        <div className={styles.metric}>
                          <span>{learnersCount.toLocaleString()}</span>
                          <small>{locale === 'ar' ? 'متعلم' : 'Learners'}</small>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <Link href={`/${locale}/instructors/${instructor.slug}`} className={styles.profileLink}>
                        <Button variant="primary" fullWidth>
                          {locale === 'ar' ? 'عرض الملف الكامل' : 'View Full Profile'}
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className={styles.ctaSection}>
              <h3>{locale === 'ar' ? 'هل تريد الانضمام كمدرب؟' : 'Want To Join As Instructor?'}</h3>
              <p>
                {locale === 'ar'
                  ? 'شارك خبرتك مع آلاف المتعلمين عبر برامج وورش عملية.'
                  : 'Share your expertise through practical courses and workshops.'}
              </p>
              <Link href={`/${locale}/register?intent=instructor`}>
                <Button variant="secondary" size="lg">
                  {locale === 'ar' ? 'قدّم الآن' : 'Apply Now'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
