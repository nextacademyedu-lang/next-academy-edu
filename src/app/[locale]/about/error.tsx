'use client';

export default function AboutError({
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
      background: 'var(--bg-main, #020504)',
      color: 'var(--text-primary, #fff)',
      padding: 24,
    }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Something went wrong</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 400, textAlign: 'center' }}>
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 28px',
          backgroundColor: 'var(--accent-primary, #c51b1b)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Try again
      </button>
    </div>
  );
}
