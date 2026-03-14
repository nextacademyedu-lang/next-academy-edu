'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Copy, CheckCircle } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';

export default function CheckoutPendingPage() {
  const locale = useLocale();
  const params = useSearchParams();
  const voucher = params.get('voucher');
  const provider = params.get('provider') || 'فوري';
  const expiryDate = params.get('expiryDate');
  const bookingId = params.get('bookingId');
  const [copied, setCopied] = useState(false);

  function copyVoucher() {
    if (!voucher) return;
    navigator.clipboard.writeText(voucher);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Clock size={56} color="var(--accent-gold)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            في انتظار الدفع
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
            حجزك محجوز ليك لمدة 48 ساعة. ادفع في أي فرع {provider} بالرقم المرجعي اللي تحت.
          </p>
        </div>

        {/* Voucher Card */}
        {voucher && (
          <div style={{
            background: 'rgba(214, 163, 43, 0.08)',
            border: '1px solid rgba(214, 163, 43, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
              الرقم المرجعي — {provider}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '4px', color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                {voucher}
              </span>
              <button onClick={copyVoucher} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {copied ? <CheckCircle size={20} color="#00e397" /> : <Copy size={20} />}
              </button>
            </div>
            {expiryDate && (
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
                صالح حتى: {expiryDate}
              </p>
            )}
          </div>
        )}

        {/* Steps */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            خطوات الدفع:
          </p>
          {[
            `روح أي فرع ${provider} قريب منك`,
            `قول للموظف "دفع فوري" وادي الرقم المرجعي`,
            'ادفع المبلغ المطلوب',
            'هيوصلك تأكيد الحجز على إيميلك تلقائياً',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
              <span style={{
                minWidth: '24px', height: '24px', borderRadius: '50%',
                background: 'rgba(214, 163, 43, 0.15)', color: 'var(--accent-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
              }}>{i + 1}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href={`/${locale}/dashboard/bookings`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: 'var(--accent-primary)', color: '#fff',
              border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}>
              عرض حجوزاتي
            </button>
          </Link>
          <Link href={`/${locale}/programs`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.08)', fontSize: '14px', cursor: 'pointer',
            }}>
              رجوع للبرامج
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
