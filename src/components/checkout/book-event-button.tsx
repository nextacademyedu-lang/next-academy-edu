'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type ExistingBookingDoc = {
  id: string | number;
  status?: string;
};

type ExistingBookingsResponse = {
  docs?: ExistingBookingDoc[];
};

type CreateBookingResponse = {
  bookingId?: string | number;
  isFree?: boolean;
  error?: string;
};

type Props = {
  locale: string;
  eventId: string | number;
  eventSlug: string;
  label: string;
  className?: string;
};

function buildIntentPath(locale: string, eventSlug: string, eventId: string | number): string {
  return `/${locale}/events/${eventSlug}?bookEvent=${encodeURIComponent(String(eventId))}`;
}

function findActiveBookingId(payload: ExistingBookingsResponse): string | null {
  const docs = Array.isArray(payload.docs) ? payload.docs : [];
  const active = docs.find((doc) => !['cancelled', 'refunded'].includes(String(doc.status || '')));
  if (!active?.id) return null;
  return String(active.id);
}

function autoSkipKey(eventId: string | number): string {
  return `na_skip_auto_checkout_event_${String(eventId)}`;
}

export function BookEventButton({
  locale,
  eventId,
  eventSlug,
  label,
  className,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const autoTriggeredRef = useRef(false);

  const startCheckout = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    const intentPath = buildIntentPath(locale, eventSlug, eventId);
    const loginPath = `/${locale}/login?redirect=${encodeURIComponent(intentPath)}`;

    try {
      const createRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId }),
      });

      const createData = (await createRes.json().catch(() => ({}))) as CreateBookingResponse;

      if (createRes.status === 401) {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(autoSkipKey(eventId), '1');
        }
        router.push(loginPath);
        return;
      }

      if (createRes.ok && createData?.bookingId != null) {
        if (createData.isFree) {
          router.push(`/${locale}/checkout/success?bookingId=${createData.bookingId}`);
          return;
        }
        router.push(`/${locale}/checkout/${createData.bookingId}`);
        return;
      }

      const duplicateBooking =
        createRes.status === 400 &&
        typeof createData?.error === 'string' &&
        createData.error.includes('لديك حجز مسبق');

      if (duplicateBooking) {
        const listRes = await fetch(
          `/api/bookings?where[event][equals]=${encodeURIComponent(String(eventId))}&sort=-createdAt&limit=10&depth=0`,
          { credentials: 'include' },
        );
        const listData = (await listRes.json().catch(() => ({}))) as ExistingBookingsResponse;

        if (listRes.ok) {
          const existingId = findActiveBookingId(listData);
          if (existingId) {
            router.push(`/${locale}/checkout/${existingId}`);
            return;
          }
        }
      }

      setError(createData?.error || 'تعذر بدء الحجز الآن. حاول مرة أخرى.');
    } catch {
      setError('تعذر بدء الحجز الآن. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, locale, eventSlug, eventId, router]);

  useEffect(() => {
    const requestedEvent = searchParams.get('bookEvent');
    if (requestedEvent !== String(eventId)) return;
    if (autoTriggeredRef.current) return;
    if (typeof window !== 'undefined') {
      const key = autoSkipKey(eventId);
      if (window.sessionStorage.getItem(key) === '1') {
        window.sessionStorage.removeItem(key);
        return;
      }
    }

    autoTriggeredRef.current = true;
    void startCheckout();
  }, [eventId, searchParams, startCheckout]);

  return (
    <>
      <Button
        fullWidth
        className={className}
        onClick={() => void startCheckout()}
        disabled={isLoading}
      >
        {isLoading ? 'جاري تجهيز الحجز…' : label}
      </Button>
      {error && (
        <p
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--accent-primary)',
          }}
        >
          {error}
        </p>
      )}
    </>
  );
}
