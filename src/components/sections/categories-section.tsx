import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import type { Program, Round } from '@/payload-types';
import { ProgramsCarousel, FeaturedProgram } from './featured';
import styles from './categories-section.module.css';

// Reusing some helpers that were in featured-programs API
import { buildYouTubeThumbnailUrl } from '@/lib/youtube';

function mediaUrl(value: any): string | null {
  if (!value || typeof value === 'number') return null;
  return value.url || null;
}

function categoryLabel(category: any, locale: 'ar' | 'en'): string {
  if (!category || typeof category === 'number') return locale === 'ar' ? 'عام' : 'General';
  return locale === 'ar' ? category.nameAr : (category.nameEn || category.nameAr || 'General');
}

function typeLabel(type: string, locale: 'ar' | 'en'): string {
  if (locale === 'ar') {
    if (type === 'course') return 'دورة';
    if (type === 'workshop') return 'ورشة';
    if (type === 'camp') return 'معسكر';
    return 'ندوة';
  }
  if (type === 'course') return 'Course';
  if (type === 'workshop') return 'Workshop';
  if (type === 'camp') return 'Camp';
  return 'Webinar';
}

function instructorLabel(instructor: any, locale: 'ar' | 'en'): string {
  const fallback = locale === 'ar' ? 'فريق نكست' : 'Next Team';
  if (!instructor) return fallback;
  const items = Array.isArray(instructor) ? instructor : [instructor];
  const names = items
    .filter((item: any) => item && typeof item === 'object')
    .map((doc: any) => `${doc.firstName || ''} ${doc.lastName || ''}`.trim())
    .filter(Boolean);
  return names.length > 0 ? names.join(', ') : fallback;
}

export async function CategoriesSection({ locale = 'en' }: { locale?: string }) {
  const isAr = locale === 'ar';

  const payload = await getPayload({ config: configPromise });

  // 1. Fetch categories that we want to show
  let categoriesRes = await payload.find({
    collection: 'categories',
    where: { isActive: { equals: true }, showOnHome: { equals: true } },
    limit: 6,
    sort: 'order', 
  });

  if (categoriesRes.docs.length === 0) {
    // Fallback if no categories are set to showOnHome yet
    categoriesRes = await payload.find({
      collection: 'categories',
      where: { isActive: { equals: true } },
      limit: 3,
      sort: 'order', 
    });
  }

  const targetCategories = categoriesRes.docs;
  if (!targetCategories.length) return null;

  // 2. Fetch active programs
  const programsRes = await payload.find({
    collection: 'programs',
    where: { isActive: { equals: true } },
    depth: 2,
    limit: 50,
  });

  const allPrograms = programsRes.docs as Program[];

  // 3. Fetch related rounds
  const roundsRes = await payload.find({
    collection: 'rounds',
    where: { program: { in: allPrograms.map(p => p.id) } },
    depth: 0,
    limit: 200,
  });

  const rounds = roundsRes.docs as Round[];
  const roundsByProgram = new Map<number, Round[]>();
  for (const round of rounds) {
    const pId = typeof round.program === 'number' ? round.program : round.program?.id;
    if (!pId) continue;
    const current = roundsByProgram.get(pId) || [];
    current.push(round);
    roundsByProgram.set(pId, current);
  }

  // 4. Map to FeaturedProgram format
  const mappedPrograms = allPrograms.map(program => {
    const pRounds = roundsByProgram.get(program.id) || [];
    const bestRound = [...pRounds].sort((a, b) => new Date(a.startDate ?? 0).getTime() - new Date(b.startDate ?? 0).getTime())[0];
    
    let image = mediaUrl(program.thumbnail) || mediaUrl(program.coverImage);
    if (!image && bestRound?.meetingUrl) {
      image = buildYouTubeThumbnailUrl(bestRound.meetingUrl, 'hqdefault');
    }

    const title = isAr
      ? program.titleAr || program.titleEn || 'برنامج'
      : program.titleEn || program.titleAr || 'Program';

    const priceRaw = bestRound?.price || 0;
    const priceStr = priceRaw > 0 ? `${priceRaw.toLocaleString()} ${bestRound?.currency || 'EGP'}` : (isAr ? 'مجاني' : 'Free');

    let dateStr = isAr ? 'سيتم الإعلان' : 'TBA';
    if (bestRound?.startDate) {
      dateStr = new Date(bestRound.startDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
    }

    return {
      id: String(program.id),
      title,
      kind: typeLabel(program.type, isAr ? 'ar' : 'en'),
      category: categoryLabel(program.category, isAr ? 'ar' : 'en'),
      categoryId: typeof program.category === 'object' && program.category ? program.category.id : program.category,
      audienceCount: program.learnersCount || 0,
      rating: program.averageRating || 0,
      ratingCount: program.reviewCount || 0,
      instructor: instructorLabel(program.instructor, isAr ? 'ar' : 'en'),
      date: dateStr,
      price: priceStr,
      image,
      href: `/${locale}/programs/${program.slug || program.id}`,
    };
  });

  // Group by category
  const categoriesWithPrograms = targetCategories.map(cat => {
    const catPrograms = mappedPrograms.filter(p => p.categoryId === cat.id);
    return {
      id: cat.id,
      title: isAr ? cat.nameAr : (cat.nameEn || cat.nameAr),
      slug: cat.slug || cat.id,
      programs: catPrograms.slice(0, 8), // Show up to 8 per row
    };
  }).filter(c => c.programs.length > 0);

  if (categoriesWithPrograms.length === 0) return null;

  return (
    <>
      {categoriesWithPrograms.map((cat, index) => {
        const isAlternate = index % 2 !== 0;
        return (
          <section key={cat.id} className={styles.section} style={{ background: isAlternate ? 'var(--bg-secondary)' : 'var(--bg-main)' }}>
            <div className={styles.container}>
              <ProgramsCarousel
                title={cat.title}
                programs={cat.programs}
                ctaLabel={isAr ? 'عرض التفاصيل' : 'View Details'}
                instructorLabel={isAr ? 'المدرب' : 'Instructor'}
                dateLabel={isAr ? 'التاريخ' : 'Date'}
                audienceLabel={isAr ? 'متعلم' : 'Learners'}
                noRatingLabel={isAr ? 'جديد' : 'New'}
                viewAllLabel={isAr ? 'عرض الكل' : 'View All'}
                viewAllHref={`/${locale}/courses?category=${cat.slug}`}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}
