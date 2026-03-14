import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import styles from './page.module.css';

export default function TermsPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Terms & Conditions</h1>
            <p className={styles.lastUpdated}>Last Updated: October 2026</p>
          </div>

          <div className={styles.contentLayout}>
            {/* Table of Contents Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.stickyNav}>
                <h3 className={styles.navTitle}>Contents</h3>
                <ul className={styles.navList}>
                  <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                  <li><a href="#services">2. Description of Services</a></li>
                  <li><a href="#registration">3. Registration & Security</a></li>
                  <li><a href="#payments">4. Payments & Installments</a></li>
                  <li><a href="#intellectual-property">5. Intellectual Property</a></li>
                </ul>
              </div>
            </aside>

            {/* Document Content */}
            <article className={styles.document}>
              <section id="acceptance" className={styles.docSection}>
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing or using the Next Academy platform, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you may not access our services.</p>
              </section>

              <section id="services" className={styles.docSection}>
                <h2>2. Description of Services</h2>
                <p>Next Academy provides premium corporate education through workshops, courses, webinars, and 1:1 consultations. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without notice.</p>
              </section>

              <section id="registration" className={styles.docSection}>
                <h2>3. Registration & Security</h2>
                <p>To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
              </section>

              <section id="payments" className={styles.docSection}>
                <h2>4. Payments & Installments</h2>
                <p>All fees are listed on the individual program pages. If you select an installment plan, you agree to be billed repeatedly according to the agreed-upon schedule. Failure to pay an installment may result in immediate suspension of access to program materials.</p>
              </section>

              <section id="intellectual-property" className={styles.docSection}>
                <h2>5. Intellectual Property</h2>
                <p>All content provided by Next Academy, including videos, documents, slide decks, and code snippets, is the exclusive property of Next Academy and its Instructors. Content is for personal, non-commercial use only and may not be distributed or downloaded without explicit permission.</p>
              </section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
