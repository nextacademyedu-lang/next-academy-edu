import type { Metadata } from 'next';

const APP_NAME = 'Next Academy';
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com').replace(/\/$/, '');

type SupportedLocale = 'ar' | 'en';

type BuildPageMetadataArgs = {
  locale: string;
  path: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  noIndex?: boolean;
};

function normalizeLocale(locale: string): SupportedLocale {
  return locale === 'ar' ? 'ar' : 'en';
}

function normalizePath(path: string): string {
  if (!path || path === '/') return '';
  return path.startsWith('/') ? path : `/${path}`;
}

function withBase(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildPageMetadata(args: BuildPageMetadataArgs): Metadata {
  const locale = normalizeLocale(args.locale);
  const path = normalizePath(args.path);
  const title = locale === 'ar' ? args.titleAr : args.titleEn;
  const description = locale === 'ar' ? args.descriptionAr : args.descriptionEn;
  const localizedPath = `/${locale}${path}`;
  const canonical = withBase(localizedPath);

  return {
    title: `${title} | ${APP_NAME}`,
    description,
    alternates: {
      canonical,
      languages: {
        ar: withBase(`/ar${path}`),
        en: withBase(`/en${path}`),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: APP_NAME,
      type: 'website',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: args.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
