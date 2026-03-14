import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './page.module.css';

const MOCK_INSTRUCTORS = [
  { id: '1', name: 'Dr. Sarah Chen', title: 'VP of Marketing @ TechCorp', stats: '2.5k Students' },
  { id: '2', name: 'James Rodriguez', title: 'Managing Partner @ FinVentures', stats: '1.2k Students' },
  { id: '3', name: 'Elena Rostova', title: 'Head of Product @ BuildIt', stats: '850 Students' },
  { id: '4', name: 'Michael Chang', title: 'CTO @ Innovate AI', stats: '3.1k Students' },
  { id: '5', name: 'Amira Hassan', title: 'Director of HR @ MENA Corp', stats: '900 Students' },
  { id: '6', name: 'David Smith', title: 'Lead Enterprise Sales', stats: '1.5k Students' },
];

export default function InstructorsPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Header Hero */}
        <section className={styles.header}>
          <div className={styles.headerContainer}>
            <h1 className={styles.title}>Meet Our <span className={styles.highlight}>Experts</span></h1>
            <p className={styles.subtitle}>
              Learn from practitioners who have actually built, scaled, and exited businesses globally.
            </p>
            
            <div className={styles.searchBar}>
              <Input 
                id="search"
                type="text" 
                placeholder="Search by name, expertise, or company..." 
              />
            </div>
          </div>
        </section>

        {/* Grid Layout */}
        <section className={styles.content}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {MOCK_INSTRUCTORS.map(instructor => (
                <Card key={instructor.id} interactive className={styles.card}>
                  <CardContent className={styles.cardContent}>
                    <div className={styles.avatarPlaceholder}>
                      {instructor.name.charAt(0)}
                    </div>
                    <h3 className={styles.name}>{instructor.name}</h3>
                    <p className={styles.role}>{instructor.title}</p>
                    <p className={styles.stats}>👥 {instructor.stats}</p>
                    
                    <div className={styles.cardActions}>
                      <Link href={`/instructors/${instructor.id}`} className={styles.linkWrapper}>
                        <Button variant="outline" fullWidth>View Profile</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* CTA Section */}
            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Want to join as an instructor?</h3>
              <p className={styles.ctaText}>Share your expertise with thousands of corporate professionals.</p>
              <Link href="/contact">
                <Button variant="primary" size="lg">Apply to Teach</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
