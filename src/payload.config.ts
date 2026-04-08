import { buildConfig } from 'payload';
import type { EmailAdapter, SendEmailOptions } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { Resend } from 'resend';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Users } from './collections/Users.ts';
import { Media } from './collections/Media.ts';
import { Companies } from './collections/Companies.ts';
import { UserProfiles } from './collections/UserProfiles.ts';
import { Tags } from './collections/Tags.ts';
import { Categories } from './collections/Categories.ts';
import { Instructors } from './collections/Instructors.ts';
import { Programs } from './collections/Programs.ts';
import { Events } from './collections/Events.ts';
import { Rounds } from './collections/Rounds.ts';
import { Sessions } from './collections/Sessions.ts';
import { PaymentPlans } from './collections/PaymentPlans.ts';
import { Bookings } from './collections/Bookings.ts';
import { Payments } from './collections/Payments.ts';
import { InstallmentRequests } from './collections/InstallmentRequests.ts';
import { Notifications } from './collections/Notifications.ts';
import { DiscountCodes } from './collections/DiscountCodes.ts';
import { ConsultationTypes } from './collections/ConsultationTypes.ts';
import { ConsultationAvailability } from './collections/ConsultationAvailability.ts';
import { ConsultationSlots } from './collections/ConsultationSlots.ts';
import { ConsultationBookings } from './collections/ConsultationBookings.ts';
import { Leads } from './collections/Leads.ts';
import { Waitlist } from './collections/Waitlist.ts';
import { Reviews } from './collections/Reviews.ts';
import { Certificates } from './collections/Certificates.ts';
import { PaymentLinks } from './collections/PaymentLinks.ts';
import { InstructorBlockedDates } from './collections/InstructorBlockedDates.ts';
import { VerificationCodes } from './collections/VerificationCodes.ts';
import { BlogPosts } from './collections/BlogPosts.ts';
import { BulkSeatAllocations } from './collections/BulkSeatAllocations.ts';
import { Popups } from './collections/Popups.ts';
import { AnnouncementBars } from './collections/AnnouncementBars.ts';
import { UpcomingEventsConfig } from './collections/UpcomingEventsConfig.ts';
import { CrmSyncEvents } from './collections/CrmSyncEvents.ts';
import { Partners } from './collections/Partners.ts';
import { InstructorProgramSubmissions } from './collections/InstructorProgramSubmissions.ts';
import { CompanyInvitations } from './collections/CompanyInvitations.ts';
import { CompanyGroups } from './collections/CompanyGroups.ts';
import { CompanyGroupMembers } from './collections/CompanyGroupMembers.ts';
import { CompanyPolicies } from './collections/CompanyPolicies.ts';
import { migrations } from './migrations/index.ts';

if (!process.env.DATABASE_URI) {
  throw new Error('DATABASE_URI environment variable is required');
}
if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET environment variable is required');
}

/** Resend Email Adapter — inlined to avoid tsx ESM resolution issues on Node 24 */
const resendAdapter: EmailAdapter = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromRaw =
    process.env.RESEND_FROM_EMAIL || 'Next Academy <noreply@nextacademyedu.com>';

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

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(__dirname),
    },
  },
  async onInit(payload) {
    // Seed first admin user from env vars so there's always a way to bootstrap
    const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL;
    const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD;
    const syncAdminPassword = process.env.PAYLOAD_ADMIN_SYNC_PASSWORD === 'true';
    if (!adminEmail || !adminPassword) return;

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: adminEmail,
          password: adminPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          signupIntent: 'student',
          emailVerified: true,
        },
        context: { allowPrivilegedRoleWrite: true },
      });
      payload.logger.info(`[onInit] Created admin user: ${adminEmail}`);
    } else {
      const existingUser = existing.docs[0];
      const shouldPromote = existingUser.role !== 'admin';
      const shouldVerifyEmail = existingUser.emailVerified !== true;

      if (!shouldPromote && !shouldVerifyEmail && !syncAdminPassword) return;

      await payload.update({
        collection: 'users',
        id: existingUser.id,
        data: {
          role: 'admin',
          emailVerified: true,
          ...(syncAdminPassword ? { password: adminPassword } : {}),
        },
        overrideAccess: true,
        context: { allowPrivilegedRoleWrite: true },
      });

      const notes = [
        shouldPromote ? 'role=admin' : null,
        shouldVerifyEmail ? 'emailVerified=true' : null,
        syncAdminPassword ? 'password synced from env' : null,
      ]
        .filter(Boolean)
        .join(', ');

      payload.logger.info(`[onInit] Admin sync for ${adminEmail}: ${notes}`);
    }
  },
  collections: [
    Users,
    Media,
    Companies,
    UserProfiles,
    Tags,
    Categories,
    Instructors,
    Programs,
    Events,
    Rounds,
    Sessions,
    PaymentPlans,
    Bookings,
    Payments,
    InstallmentRequests,
    Notifications,
    DiscountCodes,
    ConsultationTypes,
    ConsultationAvailability,
    ConsultationSlots,
    ConsultationBookings,
    Leads,
    Waitlist,
    Reviews,
    Certificates,
    PaymentLinks,
    InstructorBlockedDates,
    VerificationCodes,
    BlogPosts,
    BulkSeatAllocations,
    Popups,
    AnnouncementBars,
    UpcomingEventsConfig,
    CrmSyncEvents,
    Partners,
    InstructorProgramSubmissions,
    CompanyInvitations,
    CompanyGroups,
    CompanyGroupMembers,
    CompanyPolicies,
  ],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    // In production, postgresAdapter does not run schema push.
    // Wire generated migrations so schema evolves automatically on boot.
    prodMigrations: migrations,
    push: true,
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  secret: process.env.PAYLOAD_SECRET,
  email: resendAdapter,
});
