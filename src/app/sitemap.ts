import type { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { BlogPost, Event, Instructor, Program } from '@/payload-types';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com').replace(/\/$/, '');
const locales: Array<'ar' | 'en'> = ['ar', 'en'];

const staticLocaleRoutes = [
  '',
  '/about',
  '/courses',
  '/programs',
  '/workshops',
  '/events',
  '/webinars',
  '/retreats',
  '/corporate-training',
  '/instructors',
  '/for-business',
  '/blog',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/unsubscribe',
];

function withBase(path: string): string {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (path: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number) => {
    entries.set(withBase(path), {
      url: withBase(path),
      lastModified: now,
      changeFrequency,
      priority,
    });
  };

  // Canonical non-localized page used by OAuth verification.
  add('/privacy-policy', 'yearly', 0.2);

  for (const locale of locales) {
    for (const route of staticLocaleRoutes) {
      add(`/${locale}${route}`, route === '' ? 'daily' : 'weekly', route === '' ? 1 : 0.7);
    }
  }

  try {
    const payload = await getPayload({ config });
    const [programsResult, eventsResult, instructorsResult, postsResult] = await Promise.all([
      payload.find({
        collection: 'programs',
        where: { isActive: { equals: true } },
        depth: 0,
        limit: 1000,
      }),
      payload.find({
        collection: 'events',
        where: { isActive: { equals: true } },
        depth: 0,
        limit: 1000,
      }),
      payload.find({
        collection: 'instructors',
        where: { isActive: { equals: true } },
        depth: 0,
        limit: 1000,
      }),
      payload.find({
        collection: 'blog-posts',
        where: { status: { equals: 'published' } },
        depth: 0,
        limit: 1000,
      }),
    ]);

    const programs = programsResult.docs as Program[];
    const events = eventsResult.docs as Event[];
    const instructors = instructorsResult.docs as Instructor[];
    const posts = postsResult.docs as BlogPost[];

    for (const locale of locales) {
      for (const program of programs) {
        const slug = program.slug || String(program.id);
        add(`/${locale}/programs/${slug}`, 'weekly', 0.8);
      }

      for (const event of events) {
        const slug = event.slug || String(event.id);
        add(`/${locale}/events/${slug}`, 'weekly', 0.8);
      }

      for (const instructor of instructors) {
        const slug = instructor.slug || String(instructor.id);
        add(`/${locale}/instructors/${slug}`, 'weekly', 0.8);
      }

      for (const post of posts) {
        const slug = post.slug || String(post.id);
        add(`/${locale}/blog/${slug}`, 'weekly', 0.7);
      }
    }
  } catch (error) {
    // Keep sitemap generation resilient in case DB is temporarily unavailable.
    console.error('[sitemap] Failed to enrich dynamic URLs:', error);
  }

  return Array.from(entries.values());
}
