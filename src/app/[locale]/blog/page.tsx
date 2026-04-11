import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { BlogPost, Media, User } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';
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
    path: '/blog',
    titleAr: 'المدونة',
    titleEn: 'Blog',
    descriptionAr: 'مقالات تطبيقية ورؤى عملية من فريق Next Academy وخبراء السوق.',
    descriptionEn: 'Practical insights and actionable articles from Next Academy and market experts.',
  });
}

function formatCategory(category: BlogPost['category'], locale: string): string {
  const value = (category || 'general').toString();
  const labelsAr: Record<string, string> = {
    strategy: 'استراتيجية',
    leadership: 'قيادة',
    marketing: 'تسويق',
    technology: 'تقنية',
    finance: 'مالية',
    hr: 'موارد بشرية',
    general: 'عام',
  };

  if (locale === 'ar') return labelsAr[value] || labelsAr.general;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getImageUrl(image: BlogPost['featuredImage']): string | null {
  if (!image || typeof image === 'number') return null;
  return (image as Media).url || null;
}

function getAuthorName(author: BlogPost['author']): string {
  if (!author || typeof author === 'number') return '';
  const typedAuthor = author as User;
  return `${typedAuthor.firstName || ''} ${typedAuthor.lastName || ''}`.trim();
}

export default async function BlogPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  let posts: BlogPost[] = [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 50,
      depth: 2,
    });
    posts = result.docs as BlogPost[];
  } catch (error) {
    console.error('[BlogPage] Failed to fetch blog posts:', error);
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.header}>
          <div className={styles.headerContainer}>
            <h1 className={styles.title}>
              {isAr ? 'رؤى' : 'Academy'} <span className={styles.highlight}>{isAr ? 'الأكاديمية' : 'Insights'}</span>
            </h1>
            <p className={styles.subtitle}>
              {isAr
                ? 'مقالات تطبيقية، مقابلات، وأفكار تنفيذية من خبراء السوق.'
                : 'Actionable tactics, strategic playbooks, and interviews with leading corporate minds.'}
            </p>
          </div>
        </section>

        {featured && (
          <section className={styles.featuredSection}>
            <div className={styles.container}>
              <div className={styles.featuredCard}>
                <div
                  className={styles.featuredImage}
                  style={getImageUrl(featured.featuredImage) ? {
                    backgroundImage: `url(${getImageUrl(featured.featuredImage)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : undefined}
                />
                <div className={styles.featuredContent}>
                  <Badge variant="default" className={styles.categoryBadge}>
                    {formatCategory(featured.category, locale)}
                  </Badge>
                  <h2 className={styles.featuredTitle}>{featured.title}</h2>
                  {featured.excerpt && <p className={styles.featuredExcerpt}>{featured.excerpt}</p>}
                  <div className={styles.metaData}>
                    {getAuthorName(featured.author) && <span>{isAr ? 'بقلم' : 'By'} {getAuthorName(featured.author)}</span>}
                    {featured.publishedAt && (
                      <>
                        <span className={styles.dot}>•</span>
                        <span>
                          {new Date(featured.publishedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </>
                    )}
                  </div>
                  <Link href={`/${locale}/blog/${featured.slug || featured.id}`} className={styles.readMore}>
                    {isAr ? 'اقرأ المقال' : 'Read Article'} &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section className={styles.recentSection}>
            <div className={styles.container}>
              <h3 className={styles.sectionTitle}>{isAr ? 'أحدث المقالات' : 'Recent Articles'}</h3>
              <div className={styles.grid}>
                {rest.map((post) => (
                  <Link key={post.id} href={`/${locale}/blog/${post.slug || post.id}`} style={{ textDecoration: 'none' }}>
                    <Card interactive className={styles.postCard}>
                      <div
                        className={styles.postImage}
                        style={getImageUrl(post.featuredImage) ? {
                          backgroundImage: `url(${getImageUrl(post.featuredImage)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        } : undefined}
                      />
                      <CardHeader className={styles.cardHeader}>
                        <Badge variant="outline" className={styles.categoryTag}>
                          {formatCategory(post.category, locale)}
                        </Badge>
                        <CardTitle className={styles.postTitle}>{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className={styles.cardContent}>
                        {post.excerpt && <p className={styles.postExcerpt}>{post.excerpt}</p>}
                      </CardContent>
                      <CardFooter className={styles.cardFooter}>
                        <div className={styles.metaDataSmall}>
                          {post.publishedAt && (
                            <span>
                              {new Date(post.publishedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {posts.length === 0 && (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {isAr ? 'لا توجد مقالات منشورة حالياً.' : 'No articles published yet.'}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
