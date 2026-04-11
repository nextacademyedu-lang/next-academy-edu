import React from 'react';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Category, Program, Round } from '@/payload-types';
import { CatalogPage, type CatalogCard } from '@/components/pages/catalog-page';
import { getInstructorNames } from '@/lib/instructor-helpers';

export const dynamic = 'force-dynamic';

function getCategoryLabel(category: Program['category'], locale: string): string {
  if (!category || typeof category === 'number') return locale === 'ar' ? 'عام' : 'General';
  const typedCategory = category as Category;
  return locale === 'ar'
    ? typedCategory.nameAr
    : typedCategory.nameEn || typedCategory.nameAr || 'General';
}

function getBestRound(rounds: Round[]): Round | null {
  if (!rounds.length) return null;
  const now = Date.now();
  const sorted = [...rounds].sort(
    (a, b) => new Date(a.startDate ?? 0).getTime() - new Date(b.startDate ?? 0).getTime(),
  );
  return sorted.find((round) => round.startDate && new Date(round.startDate).getTime() >= now) || sorted[0];
}

export default async function WorkshopsPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });

  let cards: CatalogCard[] = [];

  try {
    const programsResult = await payload.find({
      collection: 'programs',
      depth: 2,
      limit: 100,
      sort: '-createdAt',
      where: {
        and: [
          { isActive: { equals: true } },
          { type: { equals: 'workshop' } },
        ],
      },
    });

    const programs = programsResult.docs as Program[];
    const programIds = programs.map((program) => program.id);
    const roundsByProgram = new Map<number, Round[]>();

    if (programIds.length > 0) {
      const roundsResult = await payload.find({
        collection: 'rounds',
        depth: 0,
        limit: 500,
        sort: 'startDate',
        where: { program: { in: programIds } },
      });
      const rounds = roundsResult.docs as Round[];
      for (const round of rounds) {
        const programId = typeof round.program === 'number' ? round.program : round.program?.id;
        if (!programId) continue;
        const current = roundsByProgram.get(programId) || [];
        current.push(round);
        roundsByProgram.set(programId, current);
      }
    }

    cards = programs.slice(0, 12).map((program) => {
      const rounds = roundsByProgram.get(program.id) || [];
      const selectedRound = getBestRound(rounds);
      const title = locale === 'ar'
        ? program.titleAr || program.titleEn || 'Workshop'
        : program.titleEn || program.titleAr || 'Workshop';
      const rating = Number(program.averageRating || 0);
      const enrollments = rounds.reduce((sum, round) => sum + (round.currentEnrollments || 0), 0);

      return {
        id: String(program.id),
        title,
        kind: locale === 'ar' ? 'ورشة' : 'Workshop',
        category: getCategoryLabel(program.category, locale).toUpperCase(),
        enrolled: enrollments.toLocaleString(),
        rating: rating > 0 ? rating.toFixed(1) : 'New',
        instructor: getInstructorNames(program.instructor, locale === 'ar' ? 'فريق نكست' : 'Next Team'),
        schedule: selectedRound?.startDate
          ? new Date(selectedRound.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
              month: 'short',
              day: 'numeric',
            })
          : locale === 'ar'
            ? 'قريباً'
            : 'Soon',
        price: selectedRound?.price != null
          ? `${selectedRound.price.toLocaleString()} ${selectedRound.currency || 'EGP'}`
          : locale === 'ar'
            ? 'يُحدّد لاحقاً'
            : 'TBA',
        href: `/${locale}/programs/${program.slug || program.id}`,
      };
    });
  } catch (error) {
    console.error('[WorkshopsPage] Failed to fetch workshops:', error);
  }

  return (
    <CatalogPage
      locale={locale}
      eyebrow={locale === 'ar' ? 'ورش تطبيقية' : 'Hands-on Workshops'}
      title={locale === 'ar' ? 'ورش مباشرة لتنفيذ أسرع' : 'Live Workshops For Fast Skill Growth'}
      subtitle={
        locale === 'ar'
          ? 'جلسات قصيرة ومكثفة يقودها خبراء السوق مع تركيز كامل على التطبيق العملي.'
          : 'Short, intensive, instructor-led sessions focused on practical execution for teams and professionals.'
      }
      cards={cards}
    />
  );
}
