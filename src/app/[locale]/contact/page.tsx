"use client";

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './page.module.css';

type ContactScenario =
  | 'general_support'
  | 'sales_programs'
  | 'corporate_training'
  | 'partnerships'
  | 'complaint';

type PreferredChannel = 'email' | 'phone' | 'whatsapp';

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

type ContactCopy = {
  pageTitlePrimary: string;
  pageTitleHighlight: string;
  pageSubtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  scenarioLabel: string;
  scenarioOptions: Array<{ value: ContactScenario; label: string }>;
  companyLabel: string;
  companyPlaceholder: string;
  preferredChannelLabel: string;
  preferredChannelOptions: Array<{ value: PreferredChannel; label: string }>;
  preferredTimeLabel: string;
  preferredTimePlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitText: string;
  submittingText: string;
  successText: string;
  failureText: string;
  invalidEmailText: string;
  invalidPhoneText: string;
  quickSupportTitle: string;
  quickSupportBody: string;
  headquartersTitle: string;
  directContactTitle: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 16;
}

export default function ContactPage() {
  const localeValue = useLocale();
  const locale = localeValue === 'en' ? 'en' : 'ar';
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const instructorSlug = (searchParams.get('instructor') || '').trim();
  const payment = searchParams.get('payment');
  const consultationBookingId = searchParams.get('consultationBookingId');
  const isConsultationMode = intent === 'consultation' && Boolean(instructorSlug);
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/97141234567';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [scenario, setScenario] = useState<ContactScenario>('general_support');
  const [company, setCompany] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<PreferredChannel>('email');
  const [preferredTime, setPreferredTime] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [consultationLoading, setConsultationLoading] = useState(false);
  const [consultationSubmitting, setConsultationSubmitting] = useState(false);
  const [consultationError, setConsultationError] = useState('');
  const [consultationInfo, setConsultationInfo] = useState<ConsultationOptionsResponse | null>(null);
  const typeIdParam = searchParams.get('typeId');
  const slotParam = searchParams.get('slot');

  const [selectedTypeId, setSelectedTypeId] = useState(typeIdParam || '');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedSlotStr, setSelectedSlotStr] = useState(slotParam || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const contactCopy: ContactCopy = useMemo(
    () =>
      locale === 'ar'
        ? {
            pageTitlePrimary: 'تواصل',
            pageTitleHighlight: 'معنا',
            pageSubtitle:
              'حدد نوع طلبك وسنوجّه الرسالة للفريق المناسب، مع رد تلقائي على بريدك خلال دقائق.',
            fullNameLabel: 'الاسم بالكامل',
            fullNamePlaceholder: 'مثال: محمد أحمد',
            emailLabel: 'البريد الإلكتروني',
            emailPlaceholder: 'name@company.com',
            phoneLabel: 'رقم الهاتف',
            phonePlaceholder: '+20 10 0000 0000',
            scenarioLabel: 'نوع الطلب',
            scenarioOptions: [
              { value: 'general_support', label: 'دعم عام' },
              { value: 'sales_programs', label: 'البرامج والدورات' },
              { value: 'corporate_training', label: 'تدريب مؤسسي للشركات' },
              { value: 'partnerships', label: 'شراكات وتعاون' },
              { value: 'complaint', label: 'شكوى' },
            ],
            companyLabel: 'الشركة (اختياري)',
            companyPlaceholder: 'اسم الشركة',
            preferredChannelLabel: 'قناة التواصل المفضلة',
            preferredChannelOptions: [
              { value: 'email', label: 'الإيميل' },
              { value: 'phone', label: 'مكالمة هاتفية' },
              { value: 'whatsapp', label: 'واتساب' },
            ],
            preferredTimeLabel: 'أفضل وقت للتواصل (اختياري)',
            preferredTimePlaceholder: 'مثال: 10 ص - 2 م',
            subjectLabel: 'الموضوع (اختياري)',
            subjectPlaceholder: 'ملخص سريع للطلب',
            messageLabel: 'تفاصيل الرسالة',
            messagePlaceholder: 'اكتب كل التفاصيل التي تساعدنا نحل طلبك بسرعة...',
            submitText: 'إرسال الطلب',
            submittingText: 'جاري الإرسال...',
            successText: 'تم إرسال طلبك بنجاح. سيصلك رد قريبًا على بريدك الإلكتروني.',
            failureText: 'تعذر إرسال الطلب. حاول مرة أخرى.',
            invalidEmailText: 'يرجى إدخال بريد إلكتروني صحيح.',
            invalidPhoneText: 'يرجى إدخال رقم هاتف صحيح.',
            quickSupportTitle: 'دعم سريع',
            quickSupportBody: 'للحالات العاجلة يمكنك التواصل مباشرة عبر واتساب.',
            headquartersTitle: 'المقر الرئيسي',
            directContactTitle: 'تواصل مباشر',
          }
        : {
            pageTitlePrimary: 'Contact',
            pageTitleHighlight: 'Us',
            pageSubtitle:
              'Choose your request type and we will route it to the right team with a fast email confirmation.',
            fullNameLabel: 'Full Name',
            fullNamePlaceholder: 'e.g. John Doe',
            emailLabel: 'Email Address',
            emailPlaceholder: 'name@company.com',
            phoneLabel: 'Phone Number',
            phonePlaceholder: '+1 555 000 0000',
            scenarioLabel: 'Request Type',
            scenarioOptions: [
              { value: 'general_support', label: 'General Support' },
              { value: 'sales_programs', label: 'Programs & Courses' },
              { value: 'corporate_training', label: 'Corporate Training' },
              { value: 'partnerships', label: 'Partnerships' },
              { value: 'complaint', label: 'Complaint' },
            ],
            companyLabel: 'Company (optional)',
            companyPlaceholder: 'Company name',
            preferredChannelLabel: 'Preferred Channel',
            preferredChannelOptions: [
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone Call' },
              { value: 'whatsapp', label: 'WhatsApp' },
            ],
            preferredTimeLabel: 'Preferred Time (optional)',
            preferredTimePlaceholder: 'e.g. 10:00 AM - 2:00 PM',
            subjectLabel: 'Subject (optional)',
            subjectPlaceholder: 'Short summary of your inquiry',
            messageLabel: 'Message Details',
            messagePlaceholder: 'Share all details so we can help faster...',
            submitText: 'Send Request',
            submittingText: 'Sending...',
            successText: 'Your request has been sent successfully. We will reply soon.',
            failureText: 'Failed to send your request. Please try again.',
            invalidEmailText: 'Please enter a valid email address.',
            invalidPhoneText: 'Please enter a valid phone number.',
            quickSupportTitle: 'Quick Support',
            quickSupportBody: 'For urgent matters, contact us directly on WhatsApp.',
            headquartersTitle: 'Headquarters',
            directContactTitle: 'Direct Contact',
          },
    [locale],
  );

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
        if (options.consultationTypes.length > 0 && !typeIdParam) {
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
    const current = `/${locale}/contact${typeof window !== 'undefined' ? window.location.search : ''}`;
    return `/${locale}/login?redirect=${encodeURIComponent(current)}`;
  }, [locale]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError(contactCopy.invalidEmailText);
      return;
    }

    if (!isValidPhone(phone)) {
      setError(contactCopy.invalidPhoneText);
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          locale,
          name,
          email: normalizedEmail,
          phone,
          scenario,
          company,
          preferredChannel,
          preferredTime,
          subject,
          message,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; sent?: boolean }
        | null;

      if (!response.ok) {
        setError(data?.error || contactCopy.failureText);
        setSending(false);
        return;
      }

      setSuccess(contactCopy.successText);
      setName('');
      setEmail('');
      setPhone('');
      setScenario('general_support');
      setCompany('');
      setPreferredChannel('email');
      setPreferredTime('');
      setSubject('');
      setMessage('');
    } catch {
      setError(contactCopy.failureText);
    } finally {
      setSending(false);
    }
  };

  const handleConsultationCheckout = async () => {
    if ((!selectedSlotId && !selectedSlotStr) || !selectedType) {
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
          slotId: selectedSlotId || undefined,
          typeId: selectedTypeId || undefined,
          slot: selectedSlotStr || undefined,
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
            <h1 className={styles.title}>
              {isConsultationMode ? (
                <>
                  Contact <span className={styles.highlight}>Us</span>
                </>
              ) : (
                <>
                  {contactCopy.pageTitlePrimary}{' '}
                  <span className={styles.highlight}>{contactCopy.pageTitleHighlight}</span>
                </>
              )}
            </h1>
            <p className={styles.subtitle}>
              {isConsultationMode
                ? 'Choose your consultation service, pick an available slot, and complete payment securely.'
                : contactCopy.pageSubtitle}
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
                            {selectedSlotStr ? (
                                <div style={{
                                  border: '1px solid var(--accent-primary)',
                                  background: 'rgba(231, 76, 60, 0.12)',
                                  color: 'var(--text-primary)',
                                  borderRadius: '10px',
                                  padding: '10px 12px',
                                }}>
                                  <strong>
                                    {new Date(selectedSlotStr).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                      weekday: 'long',
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </strong>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                                    {new Date(selectedSlotStr).toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </div>
                            ) : consultationSlots.length === 0 ? (
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
                          (!selectedSlotId && !selectedSlotStr)
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
                          label={contactCopy.fullNameLabel}
                          placeholder={contactCopy.fullNamePlaceholder}
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
                          label={contactCopy.emailLabel}
                          placeholder={contactCopy.emailPlaceholder}
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          label={contactCopy.phoneLabel}
                          placeholder={contactCopy.phonePlaceholder}
                          required
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="scenario">
                          {contactCopy.scenarioLabel}
                          <span className={styles.required}>*</span>
                        </label>
                        <select
                          id="scenario"
                          name="scenario"
                          className={styles.select}
                          required
                          value={scenario}
                          onChange={(event) => setScenario(event.target.value as ContactScenario)}
                        >
                          {contactCopy.scenarioOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <Input
                          id="company"
                          name="company"
                          label={contactCopy.companyLabel}
                          placeholder={contactCopy.companyPlaceholder}
                          value={company}
                          onChange={(event) => setCompany(event.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="preferredChannel">
                          {contactCopy.preferredChannelLabel}
                          <span className={styles.required}>*</span>
                        </label>
                        <select
                          id="preferredChannel"
                          name="preferredChannel"
                          className={styles.select}
                          required
                          value={preferredChannel}
                          onChange={(event) =>
                            setPreferredChannel(event.target.value as PreferredChannel)
                          }
                        >
                          {contactCopy.preferredChannelOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <Input
                          id="preferredTime"
                          name="preferredTime"
                          label={contactCopy.preferredTimeLabel}
                          placeholder={contactCopy.preferredTimePlaceholder}
                          value={preferredTime}
                          onChange={(event) => setPreferredTime(event.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <Input
                          id="subject"
                          name="subject"
                          label={contactCopy.subjectLabel}
                          placeholder={contactCopy.subjectPlaceholder}
                          value={subject}
                          onChange={(event) => setSubject(event.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="message">
                          {contactCopy.messageLabel}
                          <span className={styles.required}>*</span>
                        </label>
                        <textarea
                          name="message"
                          id="message"
                          className={styles.textarea}
                          placeholder={contactCopy.messagePlaceholder}
                          rows={5}
                          required
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                        />
                      </div>
                      {error ? <p style={{ color: '#ff4d4f', margin: 0 }}>{error}</p> : null}
                      {success ? <p style={{ color: '#22c55e', margin: 0 }}>{success}</p> : null}
                      <Button type="submit" variant="primary" size="lg" fullWidth disabled={sending}>
                        {sending ? contactCopy.submittingText : contactCopy.submitText}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className={styles.infoColumn}>
              <div className={styles.infoBlock}>
                <h3 className={styles.infoTitle}>{contactCopy.headquartersTitle}</h3>
                <p className={styles.infoText}>
                  Dubai Design District (D3)<br />
                  Building 4, Office 302<br />
                  Dubai, UAE
                </p>
              </div>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoTitle}>{contactCopy.directContactTitle}</h3>
                <p className={styles.infoText}>
                  <strong>Email:</strong> support@nextacademyedu.com<br />
                  <strong>Phone:</strong> +971 4 123 4567
                </p>
              </div>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoTitle}>{contactCopy.quickSupportTitle}</h3>
                <p className={styles.infoText}>{contactCopy.quickSupportBody}</p>
                <div style={{ marginTop: '16px' }}>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="md">
                      {locale === 'ar' ? 'التواصل عبر واتساب' : 'Chat on WhatsApp'}
                    </Button>
                  </a>
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
