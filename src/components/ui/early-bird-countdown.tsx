'use client';

import { useEffect, useState } from 'react';

interface Props {
  deadline: string;
  earlyBirdPrice: number;
  regularPrice: number;
  currency?: string;
}

function getTimeLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function EarlyBirdCountdown({
  deadline,
  earlyBirdPrice,
  regularPrice,
  currency = 'EGP',
}: Props) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return null;

  const saving = regularPrice - earlyBirdPrice;

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--accent-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Early Bird
        </span>
        {saving > 0 && (
          <span
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--accent-contrast, #fff)',
              borderRadius: '999px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            وفّر {saving.toLocaleString()} {currency}
          </span>
        )}
      </div>

      {/* Prices */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text-primary)',
          }}
        >
          {earlyBirdPrice.toLocaleString()} {currency}
        </span>
        <span
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            textDecoration: 'line-through',
          }}
        >
          {regularPrice.toLocaleString()} {currency}
        </span>
      </div>

      {/* Countdown row */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          ينتهي خلال
        </span>
        {[
          { label: 'ي', value: timeLeft.days },
          { label: 'س', value: timeLeft.hours },
          { label: 'د', value: timeLeft.minutes },
          { label: 'ث', value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '4px 8px',
              minWidth: '36px',
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: '16px',
                color: 'var(--accent-text)',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(value).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
