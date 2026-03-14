import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './page.module.css';

export default function ContactPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Contact <span className={styles.highlight}>Us</span></h1>
            <p className={styles.subtitle}>
              Have questions about our programs or team training? Reach out to our 
              admissions team and we'll get back to you shortly.
            </p>
          </div>

          <div className={styles.grid}>
            {/* Contact Form */}
            <div className={styles.formColumn}>
              <Card className={styles.formCard}>
                <CardContent className={styles.formContent}>
                  <form className={styles.form}>
                    <div className={styles.formGroup}>
                      <Input id="name" label="Full Name" placeholder="John Doe" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Input id="email" type="email" label="Work Email" placeholder="john@company.com" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Input id="subject" label="Subject" placeholder="How can we help?" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="message">Message<span className={styles.required}>*</span></label>
                      <textarea 
                        id="message" 
                        className={styles.textarea} 
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        required
                      ></textarea>
                    </div>
                    <Button type="button" variant="primary" size="lg" fullWidth>Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className={styles.infoColumn}>
              <div className={styles.infoBlock}>
                <h3 className={styles.infoTitle}>Headquarters</h3>
                <p className={styles.infoText}>
                  Dubai Design District (D3)<br />
                  Building 4, Office 302<br />
                  Dubai, UAE
                </p>
              </div>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoTitle}>Direct Contact</h3>
                <p className={styles.infoText}>
                  <strong>Email:</strong> admissions@nextacademy.com<br />
                  <strong>Phone:</strong> +971 4 123 4567
                </p>
              </div>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoTitle}>Quick Support</h3>
                <p className={styles.infoText}>
                  Need a faster response? Chat with our admission specialists directly on WhatsApp.
                </p>
                <div style={{ marginTop: '16px' }}>
                  <Button variant="outline" size="md">Chat on WhatsApp</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
