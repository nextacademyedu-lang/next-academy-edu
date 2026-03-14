import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

// Mock data (will tie to Payload CMS later)
const MOCK_PROGRAMS = [
  { id: '1', title: 'Advanced Strategic Marketing', type: 'Workshop', category: 'Marketing', price: '$850' },
  { id: '2', title: 'Financial Modeling for Startups', type: 'Course', category: 'Finance', price: '$1200' },
  { id: '3', title: 'Leadership in Tech', type: 'Workshop', category: 'Leadership', price: '$450' },
  { id: '4', title: 'B2B Sales Masterclass', type: 'Course', category: 'Sales', price: '$950' },
  { id: '5', title: 'AI for Enterprise Operations', type: 'Webinar', category: 'Technology', price: 'Free' },
  { id: '6', title: 'Scaling Company Culture', type: 'Workshop', category: 'HR', price: '$600' }
];

const CATEGORIES = ['All', 'Marketing', 'Finance', 'Leadership', 'Sales', 'Technology', 'HR'];
const TYPES = ['All', 'Workshop', 'Course', 'Webinar'];

export default function ProgramsPage() {
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
              {MOCK_PROGRAMS.map(program => (
                <Card key={program.id} interactive className={styles.card}>
                  <div className={styles.imageSlot}>
                    <Badge variant="default" className={styles.typeBadge}>{program.type}</Badge>
                  </div>
                  <CardHeader className={styles.cardHeader}>
                    <div className={styles.tags}>
                      <span className={styles.tag}>{program.category}</span>
                    </div>
                    <CardTitle className={styles.cardTitle}>{program.title}</CardTitle>
                  </CardHeader>
                  <CardContent className={styles.cardContent}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Level:</span>
                      <span className={styles.infoValue}>Advanced</span>
                    </div>
                  </CardContent>
                  <CardFooter className={styles.cardFooter}>
                    <span className={styles.price}>{program.price}</span>
                    <Link href={`/programs/${program.id}`}>
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
