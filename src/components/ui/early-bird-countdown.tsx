'use client';

import { useEffect, useState } from 'react';

interface Props {
  deadline: string; // ISO date string
  earlyBirdPrice: number;
  regularPrice: number;
  currency?: string;
}

function getTimeLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export function EarlyBirdCountdown({ deadline, earlyBirdPrice, regularPrice, currency = 'EGP' }: Props) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  // Early bird expired — don't render
  if (!timeLeft) return null;

  const saving = regularPrice - earlyBirdPrice;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(255, 180, 0, 0.4)',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '16px' }}>🐦</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: '13px',
            color: '#FFB400',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Early Bird Price
        </span>
        {saving > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              background: '#FFB400',
              color: '#000',
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            Save {saving.toLocaleString()} {currency}
          </span>
        )}
      </div>

      {/* Prices */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFB400' }}>
          {earlyBirdPrice.toLocaleString()} {currency}
        </span>
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'line-through',
          }}
        >
          {regularPrice.toLocaleString()} {currency}
        </span>
      </div>

      {/* Countdown */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hrs', value: timeLeft.hours },
          { label: 'Min', value: timeLeft.minutes },
          { label: 'Sec', value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              flex: 1,
              background: 'rgba(255,180,0,0.1)',
              border: '1px solid rgba(255,180,0,0.25)',
              borderRadius: '6px',
              padding: '4px 0',
              textAlign: 'center',
            }}
          >
            <div
              style={{ fontWeight: 800, fontSize: '18px', color: '#FFB400', lineHeight: 1 }}
            >
              {String(value).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
