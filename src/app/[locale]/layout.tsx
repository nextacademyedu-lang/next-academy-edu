import type { Metadata } from 'next';
import { Montserrat, Cairo, Cinzel } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/context/auth-context';
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
};

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
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${cairo.variable} ${montserrat.variable} ${cinzel.variable}`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
