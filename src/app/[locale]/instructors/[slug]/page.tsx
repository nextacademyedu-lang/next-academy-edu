import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

// Mock data (To be sourced via Payload CMS)
const instructorData = {
  name: 'Dr. Sarah Chen',
  title: 'VP of Marketing @ TechCorp',
  avatar: 'S',
  bio: `Dr. Sarah Chen is a seasoned marketing executive with over 15 years of experience scaling B2B SaaS companies. She previously served as CMO at three unicorns and has a proven track record of growing ARR from $1M to $50M through highly engineered marketing funnels.`,
  socials: ['LinkedIn', 'Twitter'],
  activePrograms: [
    { id: '1', title: 'Advanced Strategic Marketing', type: 'Workshop', date: 'Oct 15 - Oct 17' },
    { id: '2', title: 'B2B Sales Masterclass', type: 'Course', date: 'Dec 01 - Dec 14' }
  ],
  consultations: [
    { id: 'c1', type: '30min Strategy Call', price: '$150' },
    { id: 'c2', type: '1-Hour Deep Dive', price: '$250' }
  ]
};

export default function InstructorProfilePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroCover}></div>
          <div className={styles.heroContent}>
            <div className={styles.avatarMain}>
              {instructorData.avatar}
            </div>
            <h1 className={styles.name}>{instructorData.name}</h1>
            <p className={styles.title}>{instructorData.title}</p>
            <div className={styles.socials}>
              {instructorData.socials.map((social, i) => (
                <Badge key={i} variant="outline" className={styles.socialBadge}>{social}</Badge>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.contentLayout}>
          {/* Main Content Column */}
          <div className={styles.mainContent}>
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>About {instructorData.name.split(' ')[0]}</h2>
              <p className={styles.bioText}>{instructorData.bio}</p>
            </section>

            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Active Programs</h2>
              <div className={styles.programsGrid}>
                {instructorData.activePrograms.map(program => (
                  <Card key={program.id} className={styles.programCard} interactive>
                    <CardHeader>
                      <Badge variant="default" className={styles.typeBadge}>{program.type}</Badge>
                      <CardTitle className={styles.programTitle}>{program.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={styles.programDate}>🗓 Custom Schedule: {program.date}</p>
                      <Link href={`/programs/${program.id}`}>
                        <Button variant="outline" size="sm" className={styles.viewBtn}>View Program</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / Consultations */}
          <aside className={styles.sidebar}>
            <div className={styles.stickyBox}>
              <h3 className={styles.sidebarTitle}>1:1 Consultations</h3>
              <p className={styles.sidebarDesc}>Book a private session for tailored business advice.</p>
              
              <div className={styles.consultationsList}>
                {instructorData.consultations.map(consultation => (
                  <Card key={consultation.id} className={styles.consultCard}>
                    <CardHeader className={styles.consultHeader}>
                      <CardTitle className={styles.consultTitle}>{consultation.type}</CardTitle>
                      <span className={styles.consultPrice}>{consultation.price}</span>
                    </CardHeader>
                    <CardContent className={styles.consultContent}>
                      <Button fullWidth variant="primary">Book Session</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
