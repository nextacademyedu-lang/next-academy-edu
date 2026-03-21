#!/usr/bin/env node

/**
 * Coolify runtime env validator for NextAcademy.
 * Use with: node --env-file=.env.production scripts/check-coolify-env.mjs
 */

const required = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'REDIS_PASSWORD',
  'TWENTY_APP_SECRET',
  'DATABASE_URI',
  'PAYLOAD_SECRET',
  'PAYLOAD_ADMIN_EMAIL',
  'PAYLOAD_ADMIN_PASSWORD',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SERVER_URL',
  'REDIS_URL',
  'PAYMOB_API_KEY',
  'PAYMOB_PUBLIC_KEY',
  'PAYMOB_INTEGRATION_ID',
  'PAYMOB_WALLET_INTEGRATION_ID',
  'PAYMOB_HMAC_SECRET',
  'EASYKASH_API_TOKEN',
  'EASYKASH_HMAC_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'CRON_SECRET',
];

const optionalButRecommended = [
  'RESEND_FROM_NAME',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'TWENTY_CRM_URL',
  'TWENTY_CRM_API_KEY',
];

const placeholderPattern =
  /^(<.*>|\$\{.*\}|change[-_ ]?me|example|placeholder|xxx)$/i;

const errors = [];
const warnings = [];

const getValue = (key) => (process.env[key] ?? '').trim();

for (const key of required) {
  const value = getValue(key);
  if (!value) {
    errors.push(`${key} is missing`);
    continue;
  }
  if (placeholderPattern.test(value)) {
    errors.push(`${key} is still a placeholder (${value})`);
  }
}

for (const key of optionalButRecommended) {
  const value = getValue(key);
  if (!value) {
    warnings.push(`${key} is not set`);
    continue;
  }
  if (placeholderPattern.test(value)) {
    warnings.push(`${key} looks like a placeholder (${value})`);
  }
}

const ensureHttps = (key) => {
  const value = getValue(key);
  if (!value) return;
  if (!value.startsWith('https://')) {
    errors.push(`${key} must start with https:// (current: ${value})`);
  }
};

const ensurePrefix = (key, prefix) => {
  const value = getValue(key);
  if (!value) return;
  if (!value.startsWith(prefix)) {
    errors.push(`${key} must start with ${prefix} (current: ${value})`);
  }
};

ensureHttps('NEXT_PUBLIC_APP_URL');
ensureHttps('NEXT_PUBLIC_SERVER_URL');
ensurePrefix('DATABASE_URI', 'postgres');
ensurePrefix('REDIS_URL', 'redis://');
ensurePrefix('RESEND_API_KEY', 're_');

const payloadSecret = getValue('PAYLOAD_SECRET');
if (payloadSecret && payloadSecret.length < 32) {
  errors.push('PAYLOAD_SECRET must be at least 32 characters');
}

const cronSecret = getValue('CRON_SECRET');
if (cronSecret && cronSecret.length < 32) {
  errors.push('CRON_SECRET must be at least 32 characters');
}

const twentyAppSecret = getValue('TWENTY_APP_SECRET');
if (twentyAppSecret && twentyAppSecret.length < 32) {
  errors.push('TWENTY_APP_SECRET must be at least 32 characters');
}

if (errors.length === 0) {
  console.log('Environment validation passed.');
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
  process.exit(0);
}

console.error('Environment validation failed:');
for (const error of errors) {
  console.error(`- ${error}`);
}

if (warnings.length > 0) {
  console.error('\nWarnings:');
  for (const warning of warnings) {
    console.error(`- ${warning}`);
  }
}

process.exit(1);
