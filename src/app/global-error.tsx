'use client';

/**
 * Root-level global error boundary (500-level errors).
 * Self-contained HTML — must render its own <html>/<body>
 * since Next.js unmounts the entire layout tree on global errors.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>خطأ — Next Academy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        background: '#020504',
        color: '#F1F6F1',
        fontFamily: "'Cairo', sans-serif",
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

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          margin: 0,
        }}>
          حدث خطأ غير متوقع
        </h1>

        <p style={{
          color: '#888888',
          fontSize: '1rem',
          maxWidth: '480px',
          lineHeight: 1.7,
          margin: 0,
        }}>
          نعتذر عن هذا الخطأ. جرّب تحديث الصفحة أو ارجع للصفحة الرئيسية.
          <br />
          <span style={{ direction: 'ltr', display: 'inline-block' }}>
            An unexpected error occurred. Try refreshing or go back to the homepage.
          </span>
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

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={reset}
            style={{
              padding: '12px 28px',
              background: '#C51B1B',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            حاول مرة أخرى
          </button>

          <a
            href="/"
            style={{
              padding: '12px 28px',
              background: 'transparent',
              color: '#F1F6F1',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(197, 197, 197, 0.2)',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            الصفحة الرئيسية
          </a>
        </div>

        {/* Branding */}
        <p style={{
          position: 'absolute',
          bottom: '24px',
          color: '#888888',
          fontSize: '0.8rem',
        }}>
          Next Academy
        </p>
      </body>
    </html>
  );
}
