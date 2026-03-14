/**
 * Resend Email Adapter for Payload CMS
 *
 * Payload expects: `({ payload }) => { name, defaultFromAddress, defaultFromName, sendEmail }`
 * This adapter wraps Resend so Payload's built-in forgot-password & verify-email
 * flows send real transactional emails.
 */
import type { EmailAdapter, SendEmailOptions } from 'payload';
import { Resend } from 'resend';

export const resendAdapter: EmailAdapter = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromRaw =
    process.env.RESEND_FROM_EMAIL || 'Next Academy <noreply@nextacademy.com>';

  // Parse "Name <email>" format
  const nameMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
  const defaultFromName = nameMatch ? nameMatch[1].trim() : 'Next Academy';
  const defaultFromAddress = nameMatch
    ? nameMatch[2].trim()
    : 'noreply@nextacademy.com';

  if (!apiKey) {
    console.warn(
      '[resend-adapter] RESEND_API_KEY not set — emails will be logged to console only.',
    );
  }

  const resend = apiKey ? new Resend(apiKey) : null;

  return {
    name: 'resend',
    defaultFromAddress,
    defaultFromName,

    sendEmail: async (message: SendEmailOptions) => {
      const to = Array.isArray(message.to)
        ? message.to.map((t: string | { address?: string }) =>
            typeof t === 'string' ? t : t.address || '',
          )
        : typeof message.to === 'string'
          ? [message.to]
          : message.to?.address
            ? [message.to.address]
            : [];

      const from =
        typeof message.from === 'string'
          ? message.from
          : message.from?.address || `${defaultFromName} <${defaultFromAddress}>`;

      if (!resend) {
        console.log('[resend-adapter] Would send email:', {
          to,
          from,
          subject: message.subject,
        });
        return;
      }

      try {
        const result = await resend.emails.send({
          from,
          to,
          subject: message.subject || '(no subject)',
          html:
            typeof message.html === 'string'
              ? message.html
              : typeof message.text === 'string'
                ? message.text
                : '',
        });

        return result;
      } catch (error) {
        console.error('[resend-adapter] Failed to send email:', error);
        throw error;
      }
    },
  };
};
