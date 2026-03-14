"use client";

export default function B2BError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>Something went wrong.</p>
      <button onClick={reset} style={{ padding: '10px 20px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px' }}>
        Try again
      </button>
    </div>
  );
}
