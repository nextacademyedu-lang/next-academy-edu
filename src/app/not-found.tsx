import Link from 'next/link';

/**
 * Root-level 404 page.
 * Self-contained HTML since root layout is a pass-through.
 * Bilingual: shows Arabic primary + English secondary.
 */
export default function NotFound() {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>404 — الصفحة غير موجودة | Next Academy</title>
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
        {/* 404 display */}
        <div style={{
          fontSize: 'clamp(6rem, 20vw, 12rem)',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(180deg, #C51B1B 0%, #6B0F0F 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          userSelect: 'none',
        }}>
          404
        </div>

        {/* Arabic message */}
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          margin: 0,
        }}>
          الصفحة غير موجودة
        </h1>

        <p style={{
          color: '#888888',
          fontSize: '1rem',
          maxWidth: '480px',
          lineHeight: 1.7,
          margin: 0,
        }}>
          الصفحة اللي بتدور عليها مش موجودة أو تم نقلها.
          <br />
          <span style={{ fontFamily: "'Cairo', sans-serif", direction: 'ltr', display: 'inline-block' }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </span>
        </p>

        {/* CTA */}
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '8px',
            padding: '12px 32px',
            background: '#C51B1B',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.2s',
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          العودة للصفحة الرئيسية
        </Link>

        {/* Subtle branding */}
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
