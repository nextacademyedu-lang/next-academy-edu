"use client";

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './page.module.css';

type ConsultationType = {
  id: string;
  title: string;
  durationMinutes: number;
  price: number;
  currency: string;
};

type ConsultationSlot = {
  id: string;
  consultationTypeId: string;
  date: string;
  startTime: string;
  endTime: string;
};

type ConsultationOptionsResponse = {
  instructor: { id: string; slug: string; name: string };
  consultationTypes: ConsultationType[];
  availableSlots: ConsultationSlot[];
};

export default function ContactPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split('/').filter(Boolean)[0] === 'en' ? 'en' : 'ar';
  const intent = searchParams.get('intent');
  const instructorSlug = (searchParams.get('instructor') || '').trim();
  const payment = searchParams.get('payment');
  const consultationBookingId = searchParams.get('consultationBookingId');
  const isConsultationMode = intent === 'consultation' && Boolean(instructorSlug);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [consultationLoading, setConsultationLoading] = useState(false);
  const [consultationSubmitting, setConsultationSubmitting] = useState(false);
  const [consultationError, setConsultationError] = useState('');
  const [consultationInfo, setConsultationInfo] = useState<ConsultationOptionsResponse | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (intent === 'consultation' && !subject) {
      setSubject('Consultation request');
      if (instructorSlug && !message) {
        setMessage(`I want to request a consultation with instructor: ${instructorSlug}`);
      }
    }
  }, [instructorSlug, intent, message, subject]);

  useEffect(() => {
    if (!isConsultationMode) return;

    setConsultationLoading(true);
    setConsultationError('');
    fetch(`/api/consultation/public-options?instructor=${encodeURIComponent(instructorSlug)}`, {
      credentials: 'include',
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as
          | ConsultationOptionsResponse
          | { error?: string }
          | null;
        if (
          !response.ok ||
          !data ||
          !('consultationTypes' in data) ||
          !Array.isArray(data.consultationTypes)
        ) {
          setConsultationError(data && 'error' in data ? data.error || 'Failed to load consultation options' : 'Failed to load consultation options');
          setConsultationInfo(null);
          return;
        }

        const options = data as ConsultationOptionsResponse;
        setConsultationInfo(options);
        if (options.consultationTypes.length > 0) {
          setSelectedTypeId(options.consultationTypes[0].id);
        }
      })
      .catch(() => setConsultationError('Network error while loading consultation options'))
      .finally(() => setConsultationLoading(false));
  }, [instructorSlug, isConsultationMode]);

  useEffect(() => {
    if (!isConsultationMode) return;
    fetch('/api/users/me?depth=0', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }
        const data = (await response.json().catch(() => null)) as
          | { user?: { id?: string | number } | null }
          | null;
        setIsAuthenticated(Boolean(data?.user?.id));
      })
      .catch(() => setIsAuthenticated(false));
  }, [isConsultationMode]);

  const consultationSlots = useMemo(() => {
    if (!consultationInfo || !selectedTypeId) return [];
    return consultationInfo.availableSlots.filter((slot) => slot.consultationTypeId === selectedTypeId);
  }, [consultationInfo, selectedTypeId]);

  useEffect(() => {
    if (!selectedSlotId) return;
    const stillExists = consultationSlots.some((slot) => slot.id === selectedSlotId);
    if (!stillExists) setSelectedSlotId('');
  }, [consultationSlots, selectedSlotId]);

  const selectedType = useMemo(() => {
    if (!consultationInfo || !selectedTypeId) return null;
    return consultationInfo.consultationTypes.find((type) => type.id === selectedTypeId) || null;
  }, [consultationInfo, selectedTypeId]);

  const loginPath = useMemo(() => {
    const current = `${pathname}${typeof window !== 'undefined' ? window.location.search : ''}`;
    return `/${locale}/login?redirect=${encodeURIComponent(current)}`;
  }, [locale, pathname]);

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

  const handleConsultationCheckout = async () => {
    if (!selectedSlotId || !selectedType) {
      setConsultationError('Please select a service and an available slot');
      return;
    }

    if (!isAuthenticated) {
      window.location.href = loginPath;
      return;
    }

    setConsultationSubmitting(true);
    setConsultationError('');
    try {
      const response = await fetch('/api/consultation/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slotId: selectedSlotId,
          method: paymentMethod,
          locale,
          instructorSlug,
          userNotes: message,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; redirectUrl?: string; consultationBookingId?: string; free?: boolean }
        | null;

      if (response.status === 401) {
        window.location.href = loginPath;
        return;
      }

      if (!response.ok || !data) {
        setConsultationError(data?.error || 'Failed to start consultation checkout');
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      setConsultationError('Unable to start payment flow');
    } catch {
      setConsultationError('Network error while creating consultation booking');
    } finally {
      setConsultationSubmitting(false);
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
              {isConsultationMode
                ? 'Choose your consultation service, pick an available slot, and complete payment securely.'
                : 'Have questions about our programs or team training? Reach out to our admissions team and we will get back to you shortly.'}
            </p>
          </div>

          <div className={styles.grid}>
            {/* Contact Form */}
            <div className={styles.formColumn}>
              <Card className={styles.formCard}>
                <CardContent className={styles.formContent}>
                  {isConsultationMode ? (
                    <div className={styles.form}>
                      <div className={styles.formGroup}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Instructor: <strong style={{ color: 'var(--text-primary)' }}>{consultationInfo?.instructor.name || instructorSlug}</strong>
                        </p>
                      </div>

                      {payment === 'success' ? (
                        <p style={{ color: '#22c55e', margin: 0 }}>
                          Payment completed successfully. Your consultation booking is confirmed.
                          {consultationBookingId ? ` (Ref: ${consultationBookingId})` : ''}
                        </p>
                      ) : null}
                      {payment === 'pending' ? (
                        <p style={{ color: '#f59e0b', margin: 0 }}>
                          Payment is pending. We will confirm your slot once payment is finalized.
                          {consultationBookingId ? ` (Ref: ${consultationBookingId})` : ''}
                        </p>
                      ) : null}
                      {payment === 'failed' ? (
                        <p style={{ color: '#ff4d4f', margin: 0 }}>
                          Payment was not completed. Please choose a slot and try again.
                          {consultationBookingId ? ` (Ref: ${consultationBookingId})` : ''}
                        </p>
                      ) : null}

                      {consultationLoading ? (
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Loading consultation options…</p>
                      ) : (
                        <>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Consultation Service</label>
                            <div style={{ display: 'grid', gap: '8px' }}>
                              {(consultationInfo?.consultationTypes || []).map((type) => (
                                <button
                                  key={type.id}
                                  type="button"
                                  onClick={() => setSelectedTypeId(type.id)}
                                  style={{
                                    textAlign: 'left',
                                    border: selectedTypeId === type.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                    background: selectedTypeId === type.id ? 'rgba(231, 76, 60, 0.12)' : 'var(--bg-surface)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <strong>{type.title}</strong>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                                    {type.durationMinutes} min • {type.price.toLocaleString()} {type.currency}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label}>Available Slots</label>
                            {consultationSlots.length === 0 ? (
                              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                                No available slots for this service right now.
                              </p>
                            ) : (
                              <div style={{ display: 'grid', gap: '8px' }}>
                                {consultationSlots.map((slot) => (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => setSelectedSlotId(slot.id)}
                                    style={{
                                      textAlign: 'left',
                                      border: selectedSlotId === slot.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                      background: selectedSlotId === slot.id ? 'rgba(231, 76, 60, 0.12)' : 'var(--bg-surface)',
                                      color: 'var(--text-primary)',
                                      borderRadius: '10px',
                                      padding: '10px 12px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <strong>
                                      {new Date(slot.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </strong>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Payment Method</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            type="button"
                            variant={paymentMethod === 'card' ? 'primary' : 'outline'}
                            onClick={() => setPaymentMethod('card')}
                          >
                            Card
                          </Button>
                          <Button
                            type="button"
                            variant={paymentMethod === 'wallet' ? 'primary' : 'outline'}
                            onClick={() => setPaymentMethod('wallet')}
                          >
                            Wallet
                          </Button>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="message">Notes (optional)</label>
                        <textarea
                          name="message"
                          id="message"
                          className={styles.textarea}
                          placeholder="Any notes for the instructor..."
                          rows={4}
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                        />
                      </div>

                      {isAuthenticated === false ? (
                        <p style={{ color: '#f59e0b', margin: 0 }}>
                          You need to sign in before checkout.
                        </p>
                      ) : null}

                      {consultationError ? <p style={{ color: '#ff4d4f', margin: 0 }}>{consultationError}</p> : null}

                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={
                          consultationSubmitting ||
                          consultationLoading ||
                          !selectedType ||
                          !selectedSlotId
                        }
                        onClick={handleConsultationCheckout}
                      >
                        {consultationSubmitting
                          ? 'Processing…'
                          : selectedType && selectedType.price <= 0
                            ? 'Confirm Free Booking'
                            : 'Continue to Payment'}
                      </Button>
                    </div>
                  ) : (
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
                  )}
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
