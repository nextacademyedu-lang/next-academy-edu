import React from 'react';

/**
 * Root layout — required by Next.js 15 for every route tree.
 *
 * IMPORTANT: This must NOT render <html> or <body> tags because:
 *  - (payload)/layout.tsx uses Payload's <RootLayout> which renders its own <html>/<body>
 *  - [locale]/layout.tsx also renders its own <html>/<body>
 * Wrapping here would cause double-nested <html> tags, breaking Payload admin CSS.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children as React.JSX.Element;
}
