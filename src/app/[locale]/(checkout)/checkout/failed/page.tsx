'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function CheckoutFailedPage() {
  const locale = useLocale();
  const params = useSearchParams();
  const bookingId = params.get('bookingId');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <XCircle size={64} color="var(--accent-primary)" style={{ margin: '0 auto 24px' }} />

        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
          لم يتم الدفع
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
          حصلت مشكلة في عملية الدفع. حجزك لسه محجوز ليك — جرب تاني أو اختار طريقة دفع تانية.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookingId && (
            <Link href={`/${locale}/checkout/${bookingId}`} style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%', padding: '14px', borderRadius: '8px',
                background: 'var(--accent-primary)', color: '#fff',
                border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
              }}>
                جرب تاني
              </button>
            </Link>
          )}
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <button style={{
              width: '100%', padding: '14px', borderRadius: '8px',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: '15px', cursor: 'pointer',
            }}>
              تواصل معانا على واتساب
            </button>
          </a>
          <Link href={`/${locale}/programs`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '8px',
              background: 'transparent', color: 'var(--text-muted)',
              border: 'none', fontSize: '14px', cursor: 'pointer',
            }}>
              رجوع للبرامج
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
