import * as React from 'react';
import {
  Html, Head, Body, Container, Section, Row, Column,
  Heading, Text, Img, Hr,
} from '@react-email/components';
import type { Locale } from '../email-dictionary';
import { t } from '../email-dictionary';

// ─── Constants ───────────────────────────────────────────────────────────────

const LOGO_URL =
  'https://nextacademy.edu/images/logo-dark.png';

// ─── Props ───────────────────────────────────────────────────────────────────

interface EmailLayoutProps {
  locale: Locale;
  title: string;
  previewText?: string;
  children: React.ReactNode;
}

// ─── Layout Component ────────────────────────────────────────────────────────

export function EmailLayout({
  locale,
  title,
  previewText,
  children,
}: EmailLayoutProps): React.JSX.Element {
  const strings = t(locale);
  const isRTL = locale === 'ar';

  return (
    <Html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </Head>
      <Body style={bodyStyle}>
        {previewText && (
          <Text style={previewStyle}>{previewText}</Text>
        )}
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Img
              src={LOGO_URL}
              alt="Next Academy"
              width={150}
              height={40}
              style={{ margin: '0 auto', display: 'block' }}
            />
          </Section>

          {/* Greeting + Title */}
          <Section style={contentStyle}>
            <Heading as="h1" style={headingStyle}>
              {title}
            </Heading>

            {children}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Hr style={hrStyle} />
            <Text style={footerTextStyle}>
              {strings.allRightsReserved}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#111111',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const previewStyle: React.CSSProperties = {
  display: 'none',
  maxHeight: 0,
  overflow: 'hidden',
  fontSize: 1,
  lineHeight: 1,
  color: '#111111',
};

const containerStyle: React.CSSProperties = {
  maxWidth: 600,
  margin: '0 auto',
  padding: '20px 0',
};

const headerStyle: React.CSSProperties = {
  padding: '24px 0',
  textAlign: 'center',
};

const contentStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  borderRadius: 12,
  padding: '32px 24px',
};

const headingStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: 22,
  fontWeight: 700,
  margin: '0 0 16px',
  lineHeight: 1.4,
};

const footerStyle: React.CSSProperties = {
  padding: '16px 0',
  textAlign: 'center',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#333333',
  margin: '16px 0',
};

const footerTextStyle: React.CSSProperties = {
  color: '#666666',
  fontSize: 12,
  margin: 0,
};
