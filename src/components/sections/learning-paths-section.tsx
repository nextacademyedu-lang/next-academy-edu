import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { LearningPathsCarousel } from './learning-paths-carousel';
import { buildYouTubeThumbnailUrl } from '@/lib/youtube';

function mediaUrl(value: any): string {
  if (!value || typeof value === 'number') return '/placeholder-course.jpg';
  return value.url || '/placeholder-course.jpg';
}

export async function LearningPathsSection({ locale = 'en' }: { locale?: string }) {
  const isAr = locale === 'ar';
  const payload = await getPayload({ config: configPromise });

  // Fetch active learning paths
  const pathsRes = await payload.find({
    collection: 'learning-paths',
    where: { isActive: { equals: true } },
    sort: 'order',
    limit: 10,
    depth: 1, // To get programs count/details
  });

  let rawPaths = pathsRes.docs;

  // Fallback dummy data if no paths exist yet (for demo/design purposes)
  if (rawPaths.length === 0) {
    rawPaths = [
      {
        id: 'dummy-1',
        titleAr: 'برنامج اللغة الإنجليزية للأعمال',
        titleEn: 'Business English',
        descriptionAr: 'هذا البرنامج عبارة عن مجموعة من الكورسات المصممة لتطوير مهاراتك في اللغة الإنجليزية للاستخدام الفعال في بيئات العمل المختلفة.',
        descriptionEn: 'The "Business English" bundle is a collection of courses designed to develop your English skills for effective use in various professional environments.',
        programs: [1, 2, 3, 4, 5],
        coverImage: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop' },
      } as any,
      {
        id: 'dummy-2',
        titleAr: 'إتقان الإنجليزية المتقدمة',
        titleEn: 'Advanced English Mastery',
        descriptionAr: 'برنامج متقدم لتطوير مهارات المحادثة والكتابة باحترافية عالية.',
        descriptionEn: 'The "Advanced English Mastery" bundle includes courses to build fluency and confidence in English, write professional emails, and more.',
        programs: [1, 2, 3, 4],
        coverImage: { url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2940&auto=format&fit=crop' },
      } as any,
      {
        id: 'dummy-3',
        titleAr: 'أساسيات القيادة',
        titleEn: 'Leadership Essentials',
        descriptionAr: 'مجموعة من الدورات لبناء شخصية القائد وإدارة الفرق بفعالية.',
        descriptionEn: 'A collection of courses to build your leadership persona and manage teams effectively.',
        programs: [1, 2, 3],
        coverImage: { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2940&auto=format&fit=crop' },
      } as any,
    ];
  }

  const mappedPaths = rawPaths.map((path) => {
    const title = isAr ? (path.titleAr || path.titleEn || '') : (path.titleEn || path.titleAr || '');
    const desc = isAr ? (path.descriptionAr || path.descriptionEn || '') : (path.descriptionEn || path.descriptionAr || '');
    const img = mediaUrl(path.coverImage) || mediaUrl(path.thumbnail);
    const coursesCount = Array.isArray(path.programs) ? path.programs.length : 0;
    
    // In a real app, duration would be calculated by summing program durations. Hardcoded for now based on image.
    const durationStr = isAr ? '15 س 11 د' : '15h 11mins';

    return {
      id: String(path.id),
      title,
      description: desc,
      coursesCount,
      durationStr,
      image: img,
      href: `/${locale}/paths/${path.slug || path.id}`,
    };
  });

  if (mappedPaths.length === 0) return null;

  return (
    <section style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)' }}>
      <LearningPathsCarousel
        title={isAr ? 'البرامج التعليمية' : 'Learning programs'}
        subtitle={isAr ? 'اكتشف مجموعة كورسات مصممة لبناء المهارات الأساسية.' : 'Discover grouped courses designed to build essential skills.'}
        paths={mappedPaths}
        showAllLabel={isAr ? 'عرض كل البرامج' : 'Show All Programs'}
        showAllHref={`/${locale}/paths`}
        showProgramLabel={isAr ? 'عرض البرنامج' : 'Show Program'}
      />
    </section>
  );
}
