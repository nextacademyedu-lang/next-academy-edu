import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <h1 className={styles.title}>Empowering <span className={styles.highlight}>Corporate Excellence</span></h1>
            <p className={styles.subtitle}>
              Next Academy is MENA's premier institution for executive education, 
              connecting ambitious professionals with elite industry practitioners.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className={styles.contentSection}>
          <div className={styles.container}>
            <div className={styles.grid}>
              <Card className={styles.card}>
                <CardContent className={styles.cardContent}>
                  <div className={styles.icon}>🎯</div>
                  <h2 className={styles.cardTitle}>Our Mission</h2>
                  <p className={styles.text}>
                    To bridge the gap between academic theory and actual corporate execution 
                    by providing hyper-practical workshops led by industry veterans.
                  </p>
                </CardContent>
              </Card>

              <Card className={styles.card}>
                <CardContent className={styles.cardContent}>
                  <div className={styles.icon}>👁️</div>
                  <h2 className={styles.cardTitle}>Our Vision</h2>
                  <p className={styles.text}>
                    To become the undisputed corporate standard for professional certification 
                    and skill acceleration across the Middle East and tech ecosystem.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Milestones / Stats */}
        <section className={styles.statsSection}>
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>15k+</span>
                <span className={styles.statLabel}>Graduates</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Expert Instructors</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>120+</span>
                <span className={styles.statLabel}>Corporate Partners</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>Satisfaction Rate</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
