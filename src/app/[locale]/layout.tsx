import type { Metadata } from 'next';
import { Montserrat, Cairo, Cinzel } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ClerkProvider } from '@clerk/nextjs';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { PopupManager } from '@/components/marketing/popup-manager';
import { CookieConsent } from '@/components/cookie-consent';
import { SourceTracker } from '@/components/source-tracker';
import '../globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
});

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '800', '900'], // Including 900 for Cairo Black
});

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://nextacademyedu.com'),
  title: 'Next Academy',
  description: 'B2B Educational Platform for Entrepreneurs',
  other: {
    'facebook-domain-verification': 'fbphl02fxa6p06kjwce9vw24thiz44',
  },
};

/* Inline script to prevent FOUC — runs before React hydration */
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('next-academy-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch(e) {}
})();
`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} data-app="frontend" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${cairo.variable} ${montserrat.variable} ${cinzel.variable}`} suppressHydrationWarning>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#c9a96e',
              colorBackground: '#0a0a0a',
              colorText: '#ffffff',
              colorInputBackground: '#141414',
              colorInputText: '#ffffff',
              colorShimmer: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-montserrat)',
            },
            elements: {
              card: {
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              },
              formButtonPrimary: {
                backgroundColor: '#c9a96e',
                color: '#000000',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: '#b09460',
                }
              },
              footerActionLink: {
                color: '#c9a96e',
                '&:hover': {
                  color: '#b09460',
                }
              },
              headerTitle: {
                color: '#ffffff',
              },
              headerSubtitle: {
                color: '#999999',
              },
              formFieldLabel: {
                color: '#cccccc',
              },
              dividerLine: {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
              dividerText: {
                color: '#888888',
              },
              socialButtonsBlockButton: {
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#141414',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#1f1f1f',
                }
              },
              identityPreviewEditButtonIcon: {
                color: '#c9a96e',
              }
            }
          }}
        >
          <NextIntlClientProvider messages={messages}>
            <AuthProvider>
              <ThemeProvider>
                {children}
                <PopupManager />
                <CookieConsent />
                <SourceTracker />
              </ThemeProvider>
            </AuthProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
