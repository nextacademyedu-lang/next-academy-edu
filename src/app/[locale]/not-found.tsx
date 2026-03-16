import Link from 'next/link';
import { useTranslations } from 'next-intl';

/**
 * Locale-level 404 page.
 * Uses i18n translations for proper AR/EN text.
 */
export default function NotFound() {
  const t = useTranslations('errors');

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

      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        margin: 0,
      }}>
        {t('notFound.title')}
      </h1>

      <p style={{
        color: 'var(--text-muted)',
        fontSize: '1rem',
        maxWidth: '480px',
        lineHeight: 1.7,
        margin: 0,
      }}>
        {t('notFound.description')}
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '8px',
          padding: '12px 32px',
          background: 'var(--accent-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontSize: '1rem',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  );
}
