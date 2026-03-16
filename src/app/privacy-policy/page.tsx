import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – Next Academy',
  description: 'Privacy policy for Next Academy educational platform.',
};

/**
 * Direct /privacy-policy page (no locale prefix).
 * Required by Google OAuth branding verification —
 * Google crawlers expect a plain HTML page at this exact URL
 * without redirects.
 */
export default function PrivacyPolicyPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Privacy Policy – Next Academy</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #020504; color: #e0e0e0; line-height: 1.8;
            padding: 60px 24px 120px;
          }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { font-size: 36px; font-weight: 800; color: #fff; margin-bottom: 8px; }
          .updated { color: #888; font-size: 14px; margin-bottom: 40px; }
          h2 { font-size: 22px; color: #fff; margin: 32px 0 12px; font-weight: 700; }
          p, li { color: #bbb; font-size: 16px; margin-bottom: 12px; }
          ul { padding-left: 24px; }
          a { color: #4ade80; }
          hr { border: none; border-top: 1px solid #222; margin: 40px 0; }
          .footer { text-align: center; color: #666; font-size: 13px; margin-top: 60px; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="updated">Last Updated: March 2026</p>

          <h2>1. Information Collection</h2>
          <p>
            We collect information that you provide directly to us, including
            when you create an account, register for a program, or communicate
            with our support team. This may include your name, email address,
            phone number, company name, and job title.
          </p>
          <p>
            We also automatically collect certain technical data when you visit
            our platform, including IP addresses, browser types, and interaction
            metrics.
          </p>

          <h2>2. Data Usage</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services.</li>
            <li>Process transactions and send related information.</li>
            <li>Send technical notices, updates, and administrative messages.</li>
            <li>Respond to your comments, questions, and customer service requests.</li>
            <li>Communicate with you about products, services, offers, and events.</li>
          </ul>

          <h2>3. Third-Party Sharing</h2>
          <p>
            We do not sell your personal data. We may share information with
            trusted third-party vendors who assist us in operating our platform,
            conducting our business, or servicing you, so long as those parties
            agree to keep this information confidential.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement robust security measures designed to protect your
            personal information from unauthorized access, alteration,
            disclosure, or destruction. All payment transactions are encrypted
            and processed through our PCI-compliant payment gateway (Paymob).
          </p>

          <h2>5. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access,
            correct, or delete your personal data. You may also object to
            processing or request data portability. To exercise these rights,
            please contact us at{' '}
            <a href="mailto:privacy@nextacademyedu.com">privacy@nextacademyedu.com</a>.
          </p>

          <hr />
          <p className="footer">
            © {new Date().getFullYear()} Next Academy. All rights reserved.
            <br />
            <a href="https://www.nextacademyedu.com">www.nextacademyedu.com</a>
          </p>
        </div>
      </body>
    </html>
  );
}
