import React from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

const CATEGORIES = ['All', 'Marketing', 'Finance', 'Leadership', 'Sales', 'Technology', 'HR'];
const TYPES = ['All', 'Workshop', 'Course', 'Webinar'];

export default async function ProgramsPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });

  const { docs: programs } = await payload.find({
    collection: 'programs',
    depth: 1,
    limit: 24,
    sort: '-createdAt',
  });

  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Header Hero */}
        <div className={styles.header}>
          <div className={styles.headerContainer}>
            <h1 className={styles.title}>All Programs</h1>
            <p className={styles.subtitle}>Explore our cutting-edge workshops, courses, and webinars designed for high-performing professionals.</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <aside className={styles.sidebar}>
            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Type</h3>
              <div className={styles.filterList}>
                {TYPES.map(type => (
                  <label key={type} className={styles.radioLabel}>
                    <input type="radio" name="type" defaultChecked={type === 'All'} />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            
            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Category</h3>
              <div className={styles.filterList}>
                {CATEGORIES.map(cat => (
                  <label key={cat} className={styles.radioLabel}>
                    <input type="radio" name="category" defaultChecked={cat === 'All'} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            
            <Button variant="outline" fullWidth className={styles.clearBtn}>Clear Filters</Button>
          </aside>

          {/* Grid Layout */}
          <section className={styles.content}>
            <div className={styles.grid}>
              {programs.length === 0 && (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No programs found.</p>
              )}
              {programs.map(program => (
                <Card key={program.id} interactive className={styles.card}>
                  <div className={styles.imageSlot}>
                    <Badge variant="default" className={styles.typeBadge}>{program.type}</Badge>
                  </div>
                  <CardHeader className={styles.cardHeader}>
                    <CardTitle className={styles.cardTitle}>
                      {(program as any).titleEn || (program as any).titleAr || 'Program'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={styles.cardContent}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Type:</span>
                      <span className={styles.infoValue}>{program.type}</span>
                    </div>
                  </CardContent>
                  <CardFooter className={styles.cardFooter}>
                    <Link href={`/${locale}/programs/${(program as any).slug || program.id}`}>
                      <Button variant="primary" size="sm">Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
