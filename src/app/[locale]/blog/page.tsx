import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

const MOCK_POSTS = [
  {
    id: '1',
    title: 'The Future of B2B Marketing in MENA',
    category: 'Marketing',
    excerpt: 'An analysis of how top tier startups are shifting budgets from paid Ads to high-value community events and workshops.',
    date: 'Oct 2, 2026',
    author: 'Dr. Sarah Chen'
  },
  {
    id: '2',
    title: 'How to Finance Your Seed Round Without Dilution',
    category: 'Finance',
    excerpt: 'Venture debt and non-dilutive capital are becoming the preferred vehicle for fast-growing SaaS companies.',
    date: 'Sep 28, 2026',
    author: 'James Rodriguez'
  },
  {
    id: '3',
    title: 'Why Culture Eats Strategy for Breakfast',
    category: 'Leadership',
    excerpt: 'A deep dive into building engineering teams that self-manage and deliver product velocity.',
    date: 'Sep 15, 2026',
    author: 'Amira Hassan'
  }
];

export default function BlogPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Header Hero */}
        <section className={styles.header}>
          <div className={styles.headerContainer}>
            <h1 className={styles.title}>Academy <span className={styles.highlight}>Insights</span></h1>
            <p className={styles.subtitle}>
              Actionable tactics, strategic playbooks, and interviews with 
              leading corporate minds.
            </p>
          </div>
        </section>

        {/* Featured Post (Using the first mock post as featured) */}
        <section className={styles.featuredSection}>
          <div className={styles.container}>
            <div className={styles.featuredCard}>
              <div className={styles.featuredImage}></div>
              <div className={styles.featuredContent}>
                <Badge variant="default" className={styles.categoryBadge}>{MOCK_POSTS[0].category}</Badge>
                <h2 className={styles.featuredTitle}>{MOCK_POSTS[0].title}</h2>
                <p className={styles.featuredExcerpt}>{MOCK_POSTS[0].excerpt}</p>
                <div className={styles.metaData}>
                  <span>By {MOCK_POSTS[0].author}</span>
                  <span className={styles.dot}>•</span>
                  <span>{MOCK_POSTS[0].date}</span>
                </div>
                <Link href={`/blog/${MOCK_POSTS[0].id}`} className={styles.readMore}>
                  Read Article &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Posts Grid */}
        <section className={styles.recentSection}>
          <div className={styles.container}>
            <h3 className={styles.sectionTitle}>Recent Articles</h3>
            <div className={styles.grid}>
              {MOCK_POSTS.slice(1).map(post => (
                <Card key={post.id} interactive className={styles.postCard}>
                  <div className={styles.postImage} />
                  <CardHeader className={styles.cardHeader}>
                    <Badge variant="outline" className={styles.categoryTag}>{post.category}</Badge>
                    <CardTitle className={styles.postTitle}>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className={styles.cardContent}>
                    <p className={styles.postExcerpt}>{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className={styles.cardFooter}>
                    <div className={styles.metaDataSmall}>
                      <span>{post.date}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
