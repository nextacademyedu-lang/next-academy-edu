import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import styles from './page.module.css';

export default function RefundPolicyPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Refund Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: April 2026</p>
          </div>

          <div className={styles.contentLayout}>
            {/* Table of Contents Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.stickyNav}>
                <h3 className={styles.navTitle}>Contents</h3>
                <ul className={styles.navList}>
                  <li><a href="#general">1. General Policy</a></li>
                  <li><a href="#workshops">2. Workshops & Live Rounds</a></li>
                  <li><a href="#courses">3. Pre-recorded Courses</a></li>
                  <li><a href="#process">4. Request Process</a></li>
                </ul>
              </div>
            </aside>

            {/* Document Content */}
            <article className={styles.document}>
              <section id="general" className={styles.docSection}>
                <h2>1. General Policy</h2>
                <p>At Next Academy, we are committed to providing elite educational experiences. If you are not satisfied with a program, you may be eligible for a refund depending on the specific criteria detailed below.</p>
              </section>

              <section id="workshops" className={styles.docSection}>
                <h2>2. Workshops & Live Rounds</h2>
                <p>For live, cohort-based, or in-person workshops, refund requests are accepted up to <strong>7 days prior</strong> to the scheduled start date. No refunds will be issued for requests made within 7 days of the start date, as your seat has been reserved and cannot be easily refilled.</p>
              </section>

              <section id="courses" className={styles.docSection}>
                <h2>3. Pre-recorded Courses</h2>
                <p>For fully pre-recorded video courses, you have a <strong>14-day money-back guarantee</strong>, provided you have viewed less than 20% of the course content. If our systems show that you have consumed a significant portion of the course material, the refund request will be denied.</p>
              </section>

              <section id="process" className={styles.docSection}>
                <h2>4. Request Process</h2>
                <p>To initiate a refund, please navigate to your User Dashboard, select the specific booking, and click "Request Refund". Our admin team will review your request within 48 hours. Approved refunds are processed back to the original payment method (via Paymob) and may take 5-10 business days to appear on your statement.</p>
              </section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
