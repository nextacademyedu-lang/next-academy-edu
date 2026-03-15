import React from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const locale = await getLocale();

  let posts: any[] = [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 50,
      depth: 2,
    });
    posts = result.docs;
  } catch (error) {
    console.error('[BlogPage] Failed to fetch blog posts:', error);
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        {/* Header Hero */}
        <section className={styles.header}>
          <div className={styles.headerContainer}>
            <h1 className={styles.title}>Academy <span className={styles.highlight}>Insights</span></h1>
            <p className={styles.subtitle}>
              Actionable tactics, strategic playbooks, and interviews with leading corporate minds.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        {featured && (
          <section className={styles.featuredSection}>
            <div className={styles.container}>
              <div className={styles.featuredCard}>
                <div className={styles.featuredImage}></div>
                <div className={styles.featuredContent}>
                  {(featured as any).category && (
                    <Badge variant="default" className={styles.categoryBadge}>
                      {(featured as any).category}
                    </Badge>
                  )}
                  <h2 className={styles.featuredTitle}>{(featured as any).title}</h2>
                  {(featured as any).excerpt && (
                    <p className={styles.featuredExcerpt}>{(featured as any).excerpt}</p>
                  )}
                  <div className={styles.metaData}>
                    {(featured as any).author && <span>By {typeof (featured as any).author === 'object' ? `${(featured as any).author.firstName} ${(featured as any).author.lastName}` : (featured as any).author}</span>}
                    {(featured as any).publishedAt && (
                      <>
                        <span className={styles.dot}>•</span>
                        <span>{new Date((featured as any).publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </>
                    )}
                  </div>
                  <Link href={`/${locale}/blog/${(featured as any).slug || featured.id}`} className={styles.readMore}>
                    Read Article &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Posts Grid */}
        {rest.length > 0 && (
          <section className={styles.recentSection}>
            <div className={styles.container}>
              <h3 className={styles.sectionTitle}>Recent Articles</h3>
              <div className={styles.grid}>
                {rest.map(post => (
                  <Link key={post.id} href={`/${locale}/blog/${(post as any).slug || post.id}`} style={{ textDecoration: 'none' }}>
                    <Card interactive className={styles.postCard}>
                      <div className={styles.postImage} />
                      <CardHeader className={styles.cardHeader}>
                        {(post as any).category && (
                          <Badge variant="outline" className={styles.categoryTag}>{(post as any).category}</Badge>
                        )}
                        <CardTitle className={styles.postTitle}>{(post as any).title}</CardTitle>
                      </CardHeader>
                      <CardContent className={styles.cardContent}>
                        {(post as any).excerpt && (
                          <p className={styles.postExcerpt}>{(post as any).excerpt}</p>
                        )}
                      </CardContent>
                      <CardFooter className={styles.cardFooter}>
                        <div className={styles.metaDataSmall}>
                          {(post as any).publishedAt && (
                            <span>{new Date((post as any).publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
            No articles published yet.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
