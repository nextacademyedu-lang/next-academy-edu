import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SEO, SITE } from '@/lib/constants';
import LenisProvider from '@/components/LenisProvider';
import NoiseOverlay from '@/components/NoiseOverlay';
import FloatingCTA from '@/components/FloatingCTA';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: false,
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SEO.title,
  description: SEO.description,
  keywords: SEO.keywords,
  authors: [{ name: 'Muhammed Mekky' }],
  openGraph: {
    type: 'website',
    url: SITE.url,
    title: SEO.title,
    description: SEO.description,
    images: [{ url: SEO.image, width: 1200, height: 630, alt: SEO.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.title,
    description: SEO.description,
    images: [SEO.image],
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body suppressHydrationWarning>
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Muhammed Mekky",
              "url": SITE.url,
              "image": `${SITE.url}${SEO.image}`,
              "jobTitle": "Marketing Automation Strategist",
              "description": SEO.description,
              "knowsAbout": [
                "Artificial Intelligence", "Marketing Automation", "Web Development",
                "Shopify", "ChatGPT", "n8n", "SEO"
              ],
              "sameAs": [
                "https://www.linkedin.com/in/muhammedmekky",
                "https://github.com/m2kky"
              ]
            })
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X6PE0BH0QF"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-X6PE0BH0QF');
          `}
        </Script>
        <NoiseOverlay />
        <LenisProvider>{children}</LenisProvider>
        <FloatingCTA />
        <Analytics />
      </body>
    </html>
  );
}
