import React from 'react';

/**
 * Root layout — required by Next.js 15 for every route tree.
 *
 * Route groups like (payload) and [locale] have their own layouts
 * that override this. This only exists to satisfy Next.js's root-
 * layout requirement for pages at the app root (e.g. /privacy-policy).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
