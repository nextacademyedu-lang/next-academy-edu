'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { verifyOtp, sendVerificationCode } from '@/lib/auth-api';
import { useAuth } from '@/context/auth-context';
import styles from './verify-email.module.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { refreshUser } = useAuth();
  const t = useTranslations('Auth');
  const locale = useLocale();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Ref-based lock to prevent double-submit (state updates are async, refs are sync)
  const verifyingRef = useRef(false);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Accept only digits
      if (value && !/^\d$/.test(value)) return;

      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);
      setError('');

      // Auto-focus next input
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all digits entered (guard against double-submit)
      if (value && newDigits.every((d) => d !== '') && !verifyingRef.current) {
        handleVerify(newDigits.join(''));
      }
    },
    [digits],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === 0) return;

    const newDigits = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);

    // Focus the next empty field or last field
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if full
    if (pasted.length === OTP_LENGTH) {
      handleVerify(pasted);
    }
  }, []);

  const handleVerify = async (code: string) => {
    // Prevent double-submit race condition
    if (verifyingRef.current) return;

    if (!email) {
      setError(t('emailMissing'));
      return;
    }

    verifyingRef.current = true;
    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyOtp(email, code);

      if (result.success) {
        setSuccessMsg(t('emailVerifiedRedirecting'));
        await refreshUser();
        setTimeout(() => {
          router.push(`/${locale}/onboarding`);
        }, 1500);
      } else {
        setError(result.error || t('invalidCode'));
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(t('verificationFailed'));
    } finally {
      setIsVerifying(false);
      verifyingRef.current = false;
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    try {
      await sendVerificationCode(email);
      setResendCooldown(RESEND_COOLDOWN);
      setError('');
      setSuccessMsg(t('newCodeSent'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError(t('resendFailed'));
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={styles.container}
    >
      <div className={styles.iconWrapper}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="rgba(201, 169, 110, 0.15)" />
          <path
            d="M14 18L24 25L34 18"
            stroke="#C9A96E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="12"
            y="16"
            width="24"
            height="16"
            rx="3"
            stroke="#C9A96E"
            strokeWidth="2"
          />
        </svg>
      </div>

      <h1 className={styles.title}>{t('checkEmail')}</h1>
      <p className={styles.subtitle}>
        {t('codeSentTo')}{' '}
        <span className={styles.emailHighlight}>{maskedEmail}</span>
      </p>

      {/* OTP Input */}
      <div className={styles.otpRow}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`${styles.otpInput} ${digit ? styles.filled : ''} ${error ? styles.errorInput : ''}`}
            disabled={isVerifying}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
      {successMsg && <p className={styles.successText}>{successMsg}</p>}

      <Button
        type="button"
        variant="primary"
        fullWidth
        className={styles.verifyBtn}
        disabled={isVerifying || digits.some((d) => !d)}
        onClick={() => handleVerify(digits.join(''))}
      >
        {isVerifying ? t('verifying') : t('verifyEmail')}
      </Button>

      <p className={styles.resendText}>
        {t('didntReceiveCode')}{' '}
        {resendCooldown > 0 ? (
          <span className={styles.cooldown}>
            {t('resendIn', { seconds: resendCooldown })}
          </span>
        ) : (
          <button type="button" className={styles.resendBtn} onClick={handleResend}>
            {t('resendCode')}
          </button>
        )}
      </p>
    </motion.div>
  );
}
