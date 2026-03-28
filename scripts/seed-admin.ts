/**
 * Seed script — creates an admin user via Payload Local API.
 *
 * Usage:   pnpm seed:admin
 *
 * Env vars are loaded via --env-file flags in the npm script.
 * Uses PAYLOAD_ADMIN_EMAIL / PAYLOAD_ADMIN_PASSWORD from .env / .env.local
 * (or falls back to the defaults below).
 */


import { getPayload } from 'payload';
import config from '../src/payload.config.ts';

const EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@nextacademyedu.com';
const PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || 'SecureP@ss123';

async function seed() {
  console.log('⏳ Initialising Payload (local API)…');

  const payload = await getPayload({ config });

  console.log('🔍 Checking for existing admin user…');

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: EMAIL } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    console.log(`✅ Admin user already exists: ${EMAIL} (id: ${existing.docs[0].id})`);

    // Ensure the user has admin role
    if (existing.docs[0].role !== 'admin') {
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: { role: 'admin' },
        overrideAccess: true,
        context: { allowPrivilegedRoleWrite: true },
      });
      console.log('   → Promoted to admin role.');
    }
  } else {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: EMAIL,
        password: PASSWORD,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        signupIntent: 'student',
        emailVerified: true,
      },
      overrideAccess: true,
      context: { allowPrivilegedRoleWrite: true },
    });
    console.log(`✅ Created admin user: ${EMAIL} (id: ${user.id})`);
  }

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
