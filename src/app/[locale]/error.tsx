'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      textAlign: 'center',
      padding: '24px',
    }}>
      {/* Error icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(197, 27, 27, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
      }}>
        ⚠️
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
        حدث خطأ ما
      </h2>

      <p style={{
        color: 'var(--text-muted)',
        fontSize: '1rem',
        maxWidth: '480px',
        lineHeight: 1.7,
        margin: 0,
      }}>
        نعتذر عن هذا الخطأ. جرّب تحديث الصفحة أو ارجع للصفحة الرئيسية.
      </p>

      {error.digest && (
        <p style={{
          color: '#555',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          direction: 'ltr',
        }}>
          Error ID: {error.digest}
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={reset}
          style={{
            padding: '12px 28px',
            background: 'var(--accent-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'inherit',
          }}
        >
          حاول مرة أخرى
        </button>

        <Link
          href="/"
          style={{
            padding: '12px 28px',
            background: 'transparent',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid var(--border)',
          }}
        >
          الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
