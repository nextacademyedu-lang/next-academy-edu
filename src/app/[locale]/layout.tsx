import type { Metadata } from 'next';
import { Montserrat, Cairo, Cinzel } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
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
      </body>
    </html>
  );
}
