import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Redirect www → non-www to avoid cookie domain mismatches
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const newUrl = request.nextUrl.clone();
    newUrl.host = host.replace(/^www\./, '');
    return NextResponse.redirect(newUrl, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except:
  // - /api (API routes — must not be locale-redirected)
  // - /admin (Payload CMS admin panel)
  // - /_next (Next.js internals)
  // - /favicon.ico, /robots.txt, etc.
  matcher: [
    '/((?!api|admin|_next|_vercel|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
};
