import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { BlogPost, Media, User } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { buildPageMetadata } from '@/lib/seo/metadata';

function getAuthorName(author: BlogPost['author']): string {
  if (!author || typeof author === 'number') return '';
  const typedAuthor = author as User;
  return `${typedAuthor.firstName || ''} ${typedAuthor.lastName || ''}`.trim();
}

function getImageUrl(image: BlogPost['featuredImage']): string | null {
  if (!image || typeof image === 'number') return null;
  return (image as Media).url || null;
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

type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  format?: number;
  url?: string;
  listType?: 'number' | 'bullet' | 'check';
  children?: LexicalNode[];
};

function renderTextNode(node: LexicalNode, key: string): React.ReactNode {
  let content: React.ReactNode = node.text || '';
  const format = Number(node.format || 0);

  if (format & 1) content = <strong key={`${key}-b`}>{content}</strong>;
  if (format & 2) content = <em key={`${key}-i`}>{content}</em>;
  if (format & 8) content = <u key={`${key}-u`}>{content}</u>;
  if (format & 16) content = <code key={`${key}-c`}>{content}</code>;

  return <React.Fragment key={key}>{content}</React.Fragment>;
}

function renderNodes(nodes: LexicalNode[] | undefined, keyPrefix = 'node'): React.ReactNode[] {
  if (!Array.isArray(nodes)) return [];

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    const children = renderNodes(node.children, `${key}-child`);

    switch (node.type) {
      case 'paragraph':
        return <p key={key}>{children}</p>;
      case 'heading': {
        const tag = node.tag === 'h1' || node.tag === 'h2' || node.tag === 'h3' || node.tag === 'h4'
          ? node.tag
          : 'h3';
        return React.createElement(tag, { key }, children);
      }
      case 'quote':
        return <blockquote key={key}>{children}</blockquote>;
      case 'list':
        if (node.listType === 'number') return <ol key={key}>{children}</ol>;
        return <ul key={key}>{children}</ul>;
      case 'listitem':
        return <li key={key}>{children}</li>;
      case 'link':
        return (
          <a key={key} href={node.url || '#'} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      case 'linebreak':
        return <br key={key} />;
      case 'text':
        return renderTextNode(node, key);
      default:
        return <React.Fragment key={key}>{children}</React.Fragment>;
    }
  });
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
      collection: 'blog-posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
        ],
      },
      depth: 0,
      limit: 1,
    });

    const post = docs[0] as BlogPost | undefined;
    if (!post) {
      return buildPageMetadata({
        locale,
        path: `/blog/${slug}`,
        titleAr: 'تفاصيل المقال',
        titleEn: 'Article Details',
        descriptionAr: 'صفحة تفاصيل المقال.',
        descriptionEn: 'Article details page.',
      });
    }

    return buildPageMetadata({
      locale,
      path: `/blog/${post.slug || post.id}`,
      titleAr: post.title || 'تفاصيل المقال',
      titleEn: post.title || 'Article Details',
      descriptionAr: post.excerpt || 'مقال من مدونة Next Academy.',
      descriptionEn: post.excerpt || 'Article from Next Academy blog.',
    });
  } catch {
    return buildPageMetadata({
      locale,
      path: `/blog/${slug}`,
      titleAr: 'تفاصيل المقال',
      titleEn: 'Article Details',
      descriptionAr: 'صفحة تفاصيل المقال.',
      descriptionEn: 'Article details page.',
    });
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: {
      and: [
        { status: { equals: 'published' } },
        { or: [{ slug: { equals: slug } }, { id: { equals: slug } }] },
      ],
    },
    depth: 2,
    limit: 1,
  });

  const post = docs[0] as BlogPost | undefined;
  if (!post) notFound();

  const authorName = getAuthorName(post.author);
  const imageUrl = getImageUrl(post.featuredImage);
  const contentNodes = post.content?.root?.children as LexicalNode[] | undefined;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '860px', margin: '0 auto', padding: '60px 24px', width: '100%' }}>
        <Link
          href={`/${locale}/blog`}
          style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '28px',
          }}
        >
          {isAr ? '← العودة للمدونة' : '← Back to Blog'}
        </Link>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Badge variant="default">{formatCategory(post.category, locale)}</Badge>
          {post.publishedAt && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {new Date(post.publishedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          {authorName && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {isAr ? 'بقلم' : 'By'} {authorName}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '20px' }}>
          {post.title}
        </h1>

        {post.excerpt && (
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '28px' }}>
            {post.excerpt}
          </p>
        )}

        {imageUrl && (
          <div style={{ position: 'relative', width: '100%', height: '420px', marginBottom: '30px', borderRadius: '14px', overflow: 'hidden' }}>
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 860px) 100vw, 860px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <article style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
          {contentNodes && contentNodes.length > 0 ? (
            <div>{renderNodes(contentNodes)}</div>
          ) : (
            <p>{isAr ? 'لا يوجد محتوى متاح لهذا المقال.' : 'No content is available for this article.'}</p>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
