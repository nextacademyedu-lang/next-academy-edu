'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './checkout.module.css';
import { getProgramTitle as getProgramTitleFromBooking, formatCurrency } from '@/lib/dashboard-api';
import type { PayloadBooking } from '@/lib/dashboard-api';

const PAYMENT_OPTIONS = [
  {
    id: 'card-wallet',
    label: 'كارت / محفظة إلكترونية',
    subtitle: 'Visa, Mastercard, فودافون كاش، أورنج كاش',
    method: 'card' as const,
  },
  {
    id: 'fawry',
    label: 'فوري / أمان (كاش)',
    subtitle: 'ادفع كاش في أي فرع فوري أو أمان',
    method: 'fawry' as const,
  },
];

function formatAmountByCurrency(amount: number, currency: string, locale: string): string {
  const normalized = (currency || 'EGP').toUpperCase();
  if (normalized === 'EGP') {
    return formatCurrency(amount);
  }
  const localeCode = locale === 'ar' ? 'ar-EG' : 'en-US';
  return `${new Intl.NumberFormat(localeCode, { maximumFractionDigits: 2 }).format(amount)} ${normalized}`;
}

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<PayloadBooking | null>(null);
  const availablePaymentOptions = PAYMENT_OPTIONS;

  const [selectedOptionId, setSelectedOptionId] = useState(
    availablePaymentOptions[0]?.id ?? 'card-wallet',
  );
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<{ amount: number; newTotal: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [removeDiscountLoading, setRemoveDiscountLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}?depth=2`, {
          credentials: 'include',
        });

        if (!isMounted) return;

        if (res.status === 401 || res.status === 403) {
          setAccessDenied(true);
          setBooking(null);
          return;
        }

        if (res.status === 404) {
          setBooking(null);
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || 'تعذر تحميل بيانات الحجز.');
          setBooking(null);
          return;
        }

        setBooking(data as PayloadBooking);
      } catch {
        if (!isMounted) return;
        setError('تعذر تحميل بيانات الحجز. حاول مرة أخرى.');
        setBooking(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadBooking();

    return () => {
      isMounted = false;
    };
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

      // Refetch booking so payment records reflect the persisted discounted amount
      const refreshRes = await fetch(`/api/bookings/${bookingId}?depth=2`, { credentials: 'include' });
      if (refreshRes.ok) {
        const refreshedBooking = await refreshRes.json();
        setBooking(refreshedBooking as PayloadBooking);
      }
    } catch (err: any) {
      const errorMessage =
        typeof err?.message === 'string' && err.message.trim().length > 0
          ? err.message
          : 'كود غير صالح';
      setDiscountError(errorMessage);
    } finally {
      setDiscountLoading(false);
    }
  }

  const handleRemoveDiscount = useCallback(async () => {
    if (!booking || removeDiscountLoading) return;
    setRemoveDiscountLoading(true);
    setDiscountError('');
    try {
      const res = await fetch('/api/discount-codes/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إزالة الخصم');

      // Reset discount state
      setDiscountApplied(null);
      setDiscountCode('');

      // Refetch booking to get restored amounts
      const refreshRes = await fetch(`/api/bookings/${bookingId}?depth=2`, { credentials: 'include' });
      if (refreshRes.ok) {
        setBooking(await refreshRes.json() as PayloadBooking);
      }
    } catch (err: any) {
      setDiscountError(err.message || 'حصلت مشكلة أثناء إزالة الخصم');
    } finally {
      setRemoveDiscountLoading(false);
    }
  }, [booking, bookingId, removeDiscountLoading]);

  async function handleProceed() {
    if (!booking || submitting) return;
    setSubmitting(true);
    setError('');

    const selectedOption = availablePaymentOptions.find((o) => o.id === selectedOptionId);
    if (!selectedOption) { setSubmitting(false); return; }

    try {
      const apiPath = selectedOption.method === 'fawry' ? '/api/checkout/easykash' : '/api/checkout/paymob';
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId, method: selectedOption.method, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إنشاء الدفع');

      if (selectedOption.method === 'fawry') {
        router.push(
          `/${locale}/checkout/pending?bookingId=${bookingId}&voucher=${data.voucher}&provider=${data.provider}&expiryDate=${encodeURIComponent(data.expiryDate)}`,
        );
      } else {
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
    const checkoutPath = `/${locale}/checkout/${bookingId}`;
    const loginPath = `/${locale}/login?redirect=${encodeURIComponent(checkoutPath)}`;

    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>الحجز مش موجود أو مش ليك.</p>
          <p className={styles.emptyHint}>
            {accessDenied
              ? 'يبدو إن الجلسة انتهت أو مش متسجل دخول.'
              : error || 'تأكد إنك فاتح الرابط من نفس الحساب اللي عمل الحجز.'}
          </p>
          <div className={styles.emptyActions}>
            <button
              className={styles.proceedBtn}
              onClick={() => router.push(loginPath)}
            >
              تسجيل الدخول
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => router.push(`/${locale}/dashboard/bookings`)}
            >
              حجوزاتي
            </button>
            <button
              className={styles.ghostBtn}
              onClick={() => router.push(`/${locale}`)}
            >
              العودة للموقع
            </button>
          </div>
        </div>
      </div>
    );
  }

  const programTitle = getProgramTitleFromBooking(booking);
  const hasPersistedDiscount = (booking.discountAmount ?? 0) > 0;
  const amount = discountApplied ? discountApplied.newTotal : booking.finalAmount;
  const bookingCurrency =
    booking.round && typeof booking.round === 'object'
      ? String((booking.round as { currency?: string | null }).currency || 'EGP')
      : 'EGP';

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
            {availablePaymentOptions.map((opt) => (
              <div
                key={opt.id}
                className={`${styles.paymentOption} ${selectedOptionId === opt.id ? styles.selected : ''}`}
                onClick={() => setSelectedOptionId(opt.id)}
              >
                <div className={styles.radioGroup}>
                  <div className={styles.radioCustom} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.subtitle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedOptionId === 'fawry' && (
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
              <span>{formatAmountByCurrency(booking.totalAmount, bookingCurrency, locale)}</span>
            </div>

            {(booking.discountAmount > 0 || discountApplied) && (
              <div className={styles.summaryRow}>
                <span style={{ color: '#00e397' }}>خصم</span>
                <span style={{ color: '#00e397' }}>
                  - {formatAmountByCurrency(discountApplied?.amount ?? booking.discountAmount, bookingCurrency, locale)}
                </span>
              </div>
            )}

            <div className={styles.discountInputWrapper}>
              <input
                type="text"
                placeholder="كود الخصم"
                className={styles.discountInput}
                value={discountCode}
                onChange={(e) => { setDiscountCode(e.target.value); setDiscountApplied(null); setDiscountError(''); }}
                disabled={!!discountApplied || hasPersistedDiscount}
              />
              {(discountApplied || hasPersistedDiscount) ? (
                <button
                  className={styles.removeCoupon}
                  onClick={handleRemoveDiscount}
                  disabled={removeDiscountLoading}
                  title="إزالة الخصم"
                >
                  {removeDiscountLoading ? '…' : <X size={16} />}
                </button>
              ) : (
                <button
                  className={styles.applyBtn}
                  onClick={handleApplyDiscount}
                  disabled={discountLoading}
                >
                  {discountLoading ? '…' : 'تطبيق'}
                </button>
              )}
            </div>
            {hasPersistedDiscount && !discountApplied && (
              <p style={{ color: '#00e397', fontSize: '12px', marginTop: '4px' }}>
                ✓ الخصم مطبق مسبقًا على هذا الحجز.
              </p>
            )}
            {discountError && (
              <p style={{ color: 'var(--accent-primary)', fontSize: '12px', marginTop: '4px' }}>{discountError}</p>
            )}
            {discountApplied && (
              <p style={{ color: '#00e397', fontSize: '12px', marginTop: '4px' }}>✓ تم تطبيق الخصم</p>
            )}

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span>الإجمالي</span>
              <span style={{ fontSize: '24px', color: 'var(--text-primary)' }}>
                {formatAmountByCurrency(amount, bookingCurrency, locale)}
              </span>
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
            {submitting ? 'جاري التحويل…' : selectedOptionId === 'fawry' ? 'احصل على رقم الدفع' : 'انتقل للدفع الآمن'}
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
