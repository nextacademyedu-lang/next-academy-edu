'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './checkout.module.css';
import { getUserBookings, getProgramTitle as getProgramTitleFromBooking, formatCurrency } from '@/lib/dashboard-api';
import type { PayloadBooking } from '@/lib/dashboard-api';

const PAYMENT_OPTIONS = [
  { id: 'card',   label: 'كارت كريدت / ديبت',         provider: 'Paymob',   type: 'paymob' },
  { id: 'wallet', label: 'محفظة إلكترونية (فودافون كاش، إتصالات، أورنج)', provider: 'Paymob', type: 'paymob' },
  { id: 'fawry',  label: 'فوري / أمان (كاش)',          provider: 'EasyKash', type: 'easykash' },
];

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<PayloadBooking | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<{ amount: number; newTotal: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserBookings().then((res) => {
      if (res.success && res.data) {
        const found = res.data.docs.find((b) => String(b.id) === String(bookingId));
        setBooking(found ?? null);
      }
      setLoading(false);
    });
  }, [bookingId]);

  async function handleApplyDiscount() {
    if (!discountCode.trim() || !booking) return;
    setDiscountLoading(true);
    setDiscountError('');
    setDiscountApplied(null);
    try {
      const res = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: discountCode, bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'كود غير صالح');
      setDiscountApplied({ amount: data.discountAmount, newTotal: data.newAmount });
    } catch (err: any) {
      setDiscountError(err.message);
    } finally {
      setDiscountLoading(false);
    }
  }

  async function handleProceed() {
    if (!booking || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      if (selectedMethod === 'fawry') {
        // ── EasyKash Cash ──────────────────────────────────────────
        const res = await fetch('/api/checkout/easykash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ bookingId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل إنشاء الدفع');

        router.push(
          `/${locale}/checkout/pending?bookingId=${bookingId}&voucher=${data.voucher}&provider=${data.provider}&expiryDate=${encodeURIComponent(data.expiryDate)}`,
        );
      } else {
        // ── Paymob Card / Wallet ───────────────────────────────────
        const res = await fetch('/api/checkout/paymob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ bookingId, method: selectedMethod }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل إنشاء الدفع');

        window.location.href = data.redirectUrl;
      }
    } catch (err: any) {
      setError(err.message || 'حصلت مشكلة. حاول تاني.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>جاري التحميل…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--accent-primary)' }}>الحجز مش موجود أو مش ليك.</p>
      </div>
    );
  }

  const programTitle = getProgramTitleFromBooking(booking);
  const amount = discountApplied ? discountApplied.newTotal : booking.finalAmount;

  return (
    <div className={styles.container}>
      <div className={styles.checkoutWrapper}>

        {/* Left — Payment Methods */}
        <div className={styles.paymentSection}>
          <h1 className={styles.header}>أكمل الحجز</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            احجز مكانك في <strong style={{ color: 'var(--text-primary)' }}>{programTitle}</strong>
          </p>

          <h2 className={styles.subHeader}>اختار طريقة الدفع</h2>
          <div className={styles.paymentOptions}>
            {PAYMENT_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                className={`${styles.paymentOption} ${selectedMethod === opt.id ? styles.selected : ''}`}
                onClick={() => setSelectedMethod(opt.id)}
              >
                <div className={styles.radioGroup}>
                  <div className={styles.radioCustom} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Powered by {opt.provider}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedMethod === 'fawry' && (
            <div className={styles.installmentNotice} style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                هتاخد رقم مرجعي تدفع بيه في أي فرع فوري أو أمان. الحجز بيتأكد بعد الدفع تلقائياً (ممكن تاخد من دقايق لـ 48 ساعة).
              </p>
            </div>
          )}
        </div>

        {/* Right — Order Summary */}
        <div className={styles.summarySection}>
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <span className={styles.planTitle}>{programTitle}</span>
            </div>
            <p className={styles.planDesc}>Ref: {booking.bookingCode}</p>
          </div>

          <div style={{ width: '100%' }}>
            <h3 className={styles.summaryTitle}>ملخص الطلب</h3>

            <div className={styles.summaryRow}>
              <span>السعر الأصلي</span>
              <span>{formatCurrency(booking.totalAmount)}</span>
            </div>

            {(booking.discountAmount > 0 || discountApplied) && (
              <div className={styles.summaryRow}>
                <span style={{ color: '#00e397' }}>خصم</span>
                <span style={{ color: '#00e397' }}>- {formatCurrency(discountApplied?.amount ?? booking.discountAmount)}</span>
              </div>
            )}

            <div className={styles.discountInputWrapper}>
              <input
                type="text"
                placeholder="كود الخصم"
                className={styles.discountInput}
                value={discountCode}
                onChange={(e) => { setDiscountCode(e.target.value); setDiscountApplied(null); setDiscountError(''); }}
                disabled={!!discountApplied}
              />
              <button
                className={styles.applyBtn}
                onClick={handleApplyDiscount}
                disabled={discountLoading || !!discountApplied}
              >
                {discountLoading ? '…' : discountApplied ? '✓' : 'تطبيق'}
              </button>
            </div>
            {discountError && (
              <p style={{ color: 'var(--accent-primary)', fontSize: '12px', marginTop: '4px' }}>{discountError}</p>
            )}
            {discountApplied && (
              <p style={{ color: '#00e397', fontSize: '12px', marginTop: '4px' }}>✓ تم تطبيق الخصم</p>
            )}

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span>الإجمالي</span>
              <span style={{ fontSize: '24px', color: 'var(--text-primary)' }}>{formatCurrency(amount)}</span>
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--accent-primary)', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>
              {error}
            </p>
          )}

          <button
            className={styles.proceedBtn}
            onClick={handleProceed}
            disabled={submitting}
            style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'جاري التحويل…' : selectedMethod === 'fawry' ? 'احصل على رقم الدفع' : 'انتقل للدفع الآمن'}
          </button>

          <div className={styles.securityBadge}>
            <ShieldCheck size={16} color="#00e397" />
            <span>المدفوعات مشفرة وآمنة.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
