import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

// Mock data (To be sourced via Payload CMS)
const programData = {
  title: 'Advanced Strategic Marketing',
  type: 'Workshop',
  level: 'Advanced',
  duration: '3 Days',
  instructor: 'Dr. Sarah Chen',
  description: 'A deep dive into B2B marketing strategies for high-growth tech companies. Move beyond the basics and understand how to drive multi-million dollar pipelines.',
  objectives: [
    'Build a scalable Go-To-Market framework.',
    'Understand account-based marketing (ABM) fundamentals.',
    'Align sales and marketing teams for pipeline generation.'
  ],
  rounds: [
    { id: 'R1', date: 'Oct 15 - Oct 17', type: 'Online', seats: 5, price: '$850' },
    { id: 'R2', date: 'Nov 05 - Nov 07', type: 'In-Person (Dubai)', seats: 12, price: '$1200' }
  ],
  syllabus: [
    { day: 'Day 1', topic: 'GTM & Positioning', desc: 'Crafting the narrative and identifying target ICPs.' },
    { day: 'Day 2', topic: 'Account-Based Marketing', desc: 'Tactical execution of ABM at scale.' },
    { day: 'Day 3', topic: 'Sales Alignment & Metrics', desc: 'Measuring success and working with revenue leaders.' }
  ]
};

export default function ProgramDetailsPage({
  // Next.js App Router dynamic route params
  params
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Header Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroMeta}>
              <Badge variant="default">{programData.type}</Badge>
              <Badge variant="outline">{programData.level}</Badge>
              <span className={styles.duration}>⏱ {programData.duration}</span>
            </div>
            
            <h1 className={styles.title}>{programData.title}</h1>
            <p className={styles.instructor}>Led by <strong>{programData.instructor}</strong></p>
            
            <div className={styles.heroActions}>
              <Button size="lg" variant="primary">View Available Rounds</Button>
            </div>
          </div>
        </section>

        <div className={styles.contentLayout}>
          {/* Main Content Column */}
          <div className={styles.mainContent}>
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>About the Program</h2>
              <p className={styles.paragraph}>{programData.description}</p>
              
              <h3 className={styles.subTitle}>What you'll learn:</h3>
              <ul className={styles.list}>
                {programData.objectives.map((obj, i) => (
                  <li key={i} className={styles.listItem}>{obj}</li>
                ))}
              </ul>
            </section>

            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Syllabus</h2>
              <div className={styles.syllabusList}>
                {programData.syllabus.map((item, i) => (
                  <Card key={i} className={styles.syllabusCard}>
                    <CardHeader>
                      <span className={styles.dayTag}>{item.day}</span>
                      <CardTitle className={styles.topicTitle}>{item.topic}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={styles.paragraph} style={{ margin: 0 }}>{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / Sticky Actions */}
          <aside className={styles.sidebar}>
            <div className={styles.stickyBox}>
              <h3 className={styles.sidebarTitle}>Available Rounds</h3>
              <div className={styles.roundsList}>
                {programData.rounds.map(round => (
                  <Card key={round.id} className={styles.roundCard}>
                    <CardHeader className={styles.roundHeader}>
                      <span className={styles.roundDate}>{round.date}</span>
                      <Badge variant="success">{round.seats} Seats Left</Badge>
                    </CardHeader>
                    <CardContent className={styles.roundContent}>
                      <div className={styles.roundInfo}>
                        <span className={styles.label}>Format:</span>
                        <span className={styles.value}>{round.type}</span>
                      </div>
                      <div className={styles.roundInfo}>
                        <span className={styles.label}>Price:</span>
                        <span className={styles.price}>{round.price}</span>
                      </div>
                      <Button fullWidth className={styles.bookBtn}>Book This Round</Button>
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
