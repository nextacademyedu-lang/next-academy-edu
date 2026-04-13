'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './page.module.css';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function UnsubscribePage() {
  const localeValue = useLocale();
  const locale = localeValue === 'en' ? 'en' : 'ar';
  const searchParams = useSearchParams();
  const copy = useMemo(
    () =>
      locale === 'ar'
        ? {
            title: 'إلغاء الاشتراك',
            subtitle: 'أدخل بريدك الإلكتروني لإيقاف رسائل النشرة والتحديثات التسويقية.',
            emailLabel: 'البريد الإلكتروني',
            emailPlaceholder: 'name@example.com',
            submit: 'إلغاء الاشتراك',
            processing: 'جاري التنفيذ...',
            success: 'تم إلغاء الاشتراك بنجاح.',
            errorInvalid: 'يرجى إدخال بريد إلكتروني صحيح.',
            errorGeneric: 'تعذر تنفيذ الطلب حالياً. حاول مرة أخرى.',
          }
        : {
            title: 'Unsubscribe',
            subtitle: 'Enter your email to stop receiving newsletter and marketing updates.',
            emailLabel: 'Email Address',
            emailPlaceholder: 'name@example.com',
            submit: 'Unsubscribe',
            processing: 'Processing...',
            success: 'You have been unsubscribed successfully.',
            errorInvalid: 'Please enter a valid email address.',
            errorGeneric: 'Unable to process your request right now. Please try again.',
          },
    [locale],
  );

  const [email, setEmail] = useState((searchParams.get('email') || '').trim());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError(copy.errorInvalid);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(data?.error || copy.errorGeneric);
        setLoading(false);
        return;
      }

      setSuccess(copy.success);
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <Card className={styles.card}>
            <CardContent className={styles.content}>
              <h1 className={styles.title}>{copy.title}</h1>
              <p className={styles.subtitle}>{copy.subtitle}</p>

              <form className={styles.form} onSubmit={handleSubmit}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label={copy.emailLabel}
                  placeholder={copy.emailPlaceholder}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />

                {error ? <p className={styles.error}>{error}</p> : null}
                {success ? <p className={styles.success}>{success}</p> : null}

                <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                  {loading ? copy.processing : copy.submit}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
