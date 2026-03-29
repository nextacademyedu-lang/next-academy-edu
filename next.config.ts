import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.nextacademyedu.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/api/media/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/api/media/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  // Required by Payload CMS for proper .ts/.tsx resolution
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };
    return webpackConfig;
  },
  redirects: async () => [
    {
      source: '/:locale/privacy-policy',
      destination: '/:locale/privacy',
      permanent: true,
    },
  ],
  headers: async () => [
    // ── Security headers for all pages ───────────────────────────────────
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    },
    // ── Strict CSP for public-facing pages (exclude /admin) ──────────────
    {
      source: '/((?!admin).*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accept.paymob.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://accept.paymob.com https://back.easykash.net",
            "frame-src 'self' https://accept.paymob.com https://www.youtube-nocookie.com https://www.youtube.com",
            "frame-ancestors 'none'",
          ].join('; '),
        },
      ],
    },
  ],
};

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });
