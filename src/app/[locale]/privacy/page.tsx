import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import styles from './page.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: April 2026</p>
          </div>

          <div className={styles.contentLayout}>
            {/* Table of Contents Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.stickyNav}>
                <h3 className={styles.navTitle}>Contents</h3>
                <ul className={styles.navList}>
                  <li><a href="#information-collection">1. Information Collection</a></li>
                  <li><a href="#data-usage">2. Data Usage</a></li>
                  <li><a href="#third-parties">3. Third-Party Sharing</a></li>
                  <li><a href="#security">4. Data Security</a></li>
                  <li><a href="#rights">5. Your Rights (GDPR/CCPA)</a></li>
                </ul>
              </div>
            </aside>

            {/* Document Content */}
            <article className={styles.document}>
              <section id="information-collection" className={styles.docSection}>
                <h2>1. Information Collection</h2>
                <p>We collect information that you provide directly to us, including when you create an account, register for a program, or communicate with our support team. This may include your name, email address, phone number, company name, and job title.</p>
                <p>We also automatically collect certain technical data when you visit our platform, including IP addresses, browser types, and interaction metrics.</p>
              </section>

              <section id="data-usage" className={styles.docSection}>
                <h2>2. Data Usage</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services.</li>
                  <li>Process transactions and send related information.</li>
                  <li>Send technical notices, updates, and administrative messages.</li>
                  <li>Respond to your comments, questions, and customer service requests.</li>
                  <li>Communicate with you about products, services, offers, and events.</li>
                </ul>
              </section>

              <section id="third-parties" className={styles.docSection}>
                <h2>3. Third-Party Sharing</h2>
                <p>We do not sell your personal data. We may share information with trusted third-party vendors who assist us in operating our platform, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>
              </section>

              <section id="security" className={styles.docSection}>
                <h2>4. Data Security</h2>
                <p>We implement robust security measures designed to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted and processed through our PCI-compliant payment gateway (Paymob).</p>
              </section>

              <section id="rights" className={styles.docSection}>
                <h2>5. Your Rights</h2>
                <p>Depending on your location, you may have the right to access, correct, or delete your personal data. You may also object to processing or request data portability. To exercise these rights, please contact us at privacy@nextacademyedu.com.</p>
              </section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
