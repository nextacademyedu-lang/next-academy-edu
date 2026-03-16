/**
 * Global search helper — parallel search across Programs, Instructors, and Blog Posts.
 *
 * Uses the Payload REST API (public read access on all three collections).
 */

export type SearchCategory = 'programs' | 'instructors' | 'blog';

export interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle?: string;
  url: string;
  thumbnail?: string;
}

const SEARCH_LIMIT = 5;

function payloadUrl(): string {
  // In the browser use relative URL; on the server fall back to env var.
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
}

/**
 * Search all three collections in parallel and return a merged, categorized
 * list of results.
 */
export async function searchAll(
  query: string,
  locale: 'ar' | 'en',
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const base = payloadUrl();
  const q = encodeURIComponent(query.trim());

  /* ── Programs ──────────────────────────────────────────────── */
  const titleField = locale === 'ar' ? 'titleAr' : 'titleEn';
  const programsUrl =
    `${base}/api/programs?where[${titleField}][like]=${q}&limit=${SEARCH_LIMIT}&depth=1`;

  /* ── Instructors ───────────────────────────────────────────── */
  const instructorsUrl =
    `${base}/api/instructors?where[firstName][like]=${q}&limit=${SEARCH_LIMIT}&depth=1`;

  /* ── Blog Posts ────────────────────────────────────────────── */
  // BlogPosts uses `title` (localized) — Payload auto-selects locale via ?locale=
  const blogUrl =
    `${base}/api/blog-posts?where[title][like]=${q}&locale=${locale}&limit=${SEARCH_LIMIT}&depth=1`;

  const [programsRes, instructorsRes, blogRes] = await Promise.allSettled([
    fetch(programsUrl).then((r) => r.json()),
    fetch(instructorsUrl).then((r) => r.json()),
    fetch(blogUrl).then((r) => r.json()),
  ]);

  const results: SearchResult[] = [];

  /* --- map Programs --- */
  if (programsRes.status === 'fulfilled' && programsRes.value?.docs) {
    for (const doc of programsRes.value.docs) {
      results.push({
        id: doc.id,
        category: 'programs',
        title: doc[titleField] ?? doc.titleAr ?? doc.titleEn ?? '',
        subtitle: doc.type
          ? doc.type.charAt(0).toUpperCase() + doc.type.slice(1)
          : undefined,
        url: `/${locale}/programs/${doc.slug}`,
        thumbnail:
          typeof doc.thumbnail === 'object'
            ? doc.thumbnail?.url
            : undefined,
      });
    }
  }

  /* --- map Instructors --- */
  if (instructorsRes.status === 'fulfilled' && instructorsRes.value?.docs) {
    for (const doc of instructorsRes.value.docs) {
      results.push({
        id: doc.id,
        category: 'instructors',
        title: `${doc.firstName ?? ''} ${doc.lastName ?? ''}`.trim(),
        subtitle: doc.jobTitle ?? undefined,
        url: `/${locale}/instructors/${doc.slug}`,
        thumbnail:
          typeof doc.picture === 'object' ? doc.picture?.url : undefined,
      });
    }
  }

  /* --- map Blog Posts --- */
  if (blogRes.status === 'fulfilled' && blogRes.value?.docs) {
    for (const doc of blogRes.value.docs) {
      results.push({
        id: doc.id,
        category: 'blog',
        title: doc.title ?? '',
        subtitle: doc.excerpt
          ? doc.excerpt.length > 60
            ? doc.excerpt.slice(0, 60) + '…'
            : doc.excerpt
          : undefined,
        url: `/${locale}/blog/${doc.slug}`,
        thumbnail:
          typeof doc.featuredImage === 'object'
            ? doc.featuredImage?.url
            : undefined,
      });
    }
  }

  return results;
}
