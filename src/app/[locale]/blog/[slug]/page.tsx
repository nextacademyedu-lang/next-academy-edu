import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
    depth: 2,
    limit: 1,
  });

  const post = docs[0] as any;
  if (!post) notFound();

  const authorName = typeof post.author === 'object'
    ? `${post.author.firstName} ${post.author.lastName}`.trim()
    : post.author ?? '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '60px 24px', width: '100%' }}>
        {/* Back */}
        <Link
          href={`/${locale}/blog`}
          style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}
        >
          ← Back to Blog
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          {post.category && <Badge variant="default">{post.category}</Badge>}
          {post.publishedAt && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {authorName && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>By {authorName}</span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '24px' }}>
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '40px', borderLeft: '3px solid var(--accent-primary)', paddingLeft: '20px' }}>
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        {post.content && (
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {typeof post.content === 'string'
              ? post.content
              : JSON.stringify(post.content)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
