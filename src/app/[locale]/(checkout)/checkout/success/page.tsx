'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function CheckoutSuccessPage() {
  const locale = useLocale();
  const params = useSearchParams();
  const bookingId = params.get('bookingId');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <CheckCircle size={64} color="#00e397" style={{ margin: '0 auto 24px' }} />

        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
          تم الدفع بنجاح! 🎉
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '32px', lineHeight: 1.6 }}>
          تم تأكيد حجزك. هتوصلك رسالة تأكيد على إيميلك دلوقتي.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href={`/${locale}/dashboard/bookings`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '14px', borderRadius: '8px',
              background: 'var(--accent-primary)', color: '#fff',
              border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            }}>
              عرض حجوزاتي
            </button>
          </Link>
          <Link href={`/${locale}/programs`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '14px', borderRadius: '8px',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: '15px', cursor: 'pointer',
            }}>
              تصفح برامج تانية
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
