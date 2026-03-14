'use client';

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
      gap: 16,
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    }}>
      <h2 style={{ fontSize: '1.5rem' }}>حدث خطأ في لوحة التحكم</h2>
      <p style={{ color: 'var(--text-muted)' }}>{error.message}</p>
      <button
        onClick={reset}
        style={{
          padding: '10px 24px',
          background: 'var(--accent-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
        }}
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}
