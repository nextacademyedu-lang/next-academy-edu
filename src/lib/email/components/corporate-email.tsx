import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import { type EmailContent, type LayoutOptions, APP_URL, SUPPORT_EMAIL } from '../email-core';

interface CorporateEmailProps {
  content: EmailContent;
  options: LayoutOptions;
}

export const CorporateEmail = ({ content, options }: CorporateEmailProps) => {
  const locale = options.locale || 'ar';
  const isRTL = locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const bodyParagraphs = content.body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <Html dir={dir} lang={locale}>
      <Head>
        <style>
          {`
            body {
              font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
            }
          `}
        </style>
      </Head>
      <Preview>{content.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>
              <span style={logoNext}>Next</span> <span style={logoAcademy}>Academy</span>
            </Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Heading style={titleStyle}>{content.title}</Heading>

            {bodyParagraphs.map((paragraph, index) => (
              <Text key={index} style={text}>
                {paragraph}
              </Text>
            ))}

            {content.infoBox && content.infoBox.length > 0 && (
              <Section style={infoBoxStyle}>
                {content.infoBox.map(([label, value], i) => (
                  <Text key={i} style={infoRow}>
                    <strong style={infoLabel}>{label}:</strong>{' '}
                    <span style={infoValue}>{value}</span>
                  </Text>
                ))}
              </Section>
            )}

            {content.alert && (
              <Section style={alertBoxStyle}>
                <Text style={alertText}>{content.alert}</Text>
              </Section>
            )}

            {content.cta && (
              <Section style={ctaContainer}>
                <Button href={content.cta.url} style={button}>
                  {content.cta.text}
                </Button>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerText}>
              © {new Date().getFullYear()} Next Academy. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </Text>
            <Text style={footerText}>
              {locale === 'ar' ? 'تواصل معنا:' : 'Contact us:'}{' '}
              <Link href={`mailto:${SUPPORT_EMAIL}`} style={footerLink}>
                {SUPPORT_EMAIL}
              </Link>
            </Text>
            {options.showUnsubscribe && (
              <Text style={footerText}>
                <Link href={`${APP_URL()}/${locale}/unsubscribe`} style={unsubscribeLink}>
                  {locale === 'ar' ? 'إلغاء الاشتراك' : 'Unsubscribe'}
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#f4f4f5',
  margin: '0',
  padding: '40px 0',
  fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#09090b',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const logoText = {
  margin: '0',
  fontSize: '28px',
  fontWeight: '800',
  letterSpacing: '-0.5px',
};

const logoNext = {
  color: '#ffffff',
};

const logoAcademy = {
  color: '#e11d48', // Corporate red/rose
};

const contentSection = {
  padding: '40px',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#09090b',
  margin: '0 0 24px 0',
  lineHeight: '1.3',
};

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#3f3f46',
  margin: '0 0 16px 0',
};

const infoBoxStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
};

const infoRow = {
  margin: '0 0 10px 0',
  fontSize: '15px',
  color: '#334155',
};

const infoLabel = {
  fontWeight: '600',
  color: '#0f172a',
};

const infoValue = {
  color: '#475569',
};

const alertBoxStyle = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
};

const alertText = {
  margin: '0',
  color: '#b91c1c',
  fontSize: '15px',
  fontWeight: '500',
};

const ctaContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 16px 0',
};

const button = {
  backgroundColor: '#e11d48',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const footer = {
  backgroundColor: '#fafafa',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 0 24px 0',
};

const footerText = {
  fontSize: '13px',
  color: '#71717a',
  margin: '0 0 8px 0',
  lineHeight: '1.5',
};

const footerLink = {
  color: '#e11d48',
  textDecoration: 'none',
};

const unsubscribeLink = {
  color: '#a1a1aa',
  textDecoration: 'underline',
};
