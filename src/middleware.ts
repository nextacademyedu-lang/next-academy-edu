import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  // Redirect www → non-www to avoid cookie domain mismatches
  const host = req.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const newUrl = req.nextUrl.clone();
    newUrl.host = host.replace(/^www\./, '');
    return NextResponse.redirect(newUrl, 301);
  }

  const pathname = req.nextUrl.pathname;
  // Do not run intlMiddleware on /api or /admin
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Define protected routes
  // Match any locale followed by /dashboard
  const isDashboardRoute = /^\/(ar|en)\/dashboard(\/.*)?$/.test(pathname);
  const isOnboardingRoute = /^\/(ar|en)\/onboarding(\/.*)?$/.test(pathname);

  // Check onboarding status from JWT custom claims
  const metadata = sessionClaims?.metadata as any;
  const onboardingComplete = metadata?.onboardingComplete === true;

  if (isDashboardRoute) {
    if (!userId) return redirectToSignIn();
    
    if (!onboardingComplete) {
      const locale = pathname.split('/')[1] || 'ar';
      const url = new URL(`/${locale}/onboarding`, req.url);
      return NextResponse.redirect(url);
    }
  }

  if (isOnboardingRoute) {
    if (!userId) return redirectToSignIn();

    if (onboardingComplete) {
      const locale = pathname.split('/')[1] || 'ar';
      const dashboardPath = metadata?.role === 'instructor' 
        ? `/${locale}/dashboard/instructor` 
        : `/${locale}/dashboard`;
      const url = new URL(dashboardPath, req.url);
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
