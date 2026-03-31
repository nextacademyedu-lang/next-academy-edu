"use client";

import React, { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './page.module.css';

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const intent = searchParams.get('intent');
    const instructor = searchParams.get('instructor');
    if (intent === 'consultation' && !subject) {
      setSubject('Consultation request');
      if (instructor && !message) {
        setMessage(`I want to request a consultation with instructor: ${instructor}`);
      }
    }
  }, [message, searchParams, subject]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; sent?: boolean }
        | null;

      if (!response.ok) {
        setError(data?.error || 'Failed to send message');
        setSending(false);
        return;
      }

      setSuccess('Message sent successfully. We will get back to you soon.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

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
                  <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <Input
                        id="name"
                        name="name"
                        label="Full Name"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        label="Work Email"
                        placeholder="john@company.com"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <Input
                        id="subject"
                        name="subject"
                        label="Subject"
                        placeholder="How can we help?"
                        required
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="message">Message<span className={styles.required}>*</span></label>
                      <textarea 
                        name="message"
                        id="message" 
                        className={styles.textarea} 
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        required
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                      />
                    </div>
                    {error ? <p style={{ color: '#ff4d4f', margin: 0 }}>{error}</p> : null}
                    {success ? <p style={{ color: '#22c55e', margin: 0 }}>{success}</p> : null}
                    <Button type="submit" variant="primary" size="lg" fullWidth disabled={sending}>
                      {sending ? 'Sending…' : 'Send Message'}
                    </Button>
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
