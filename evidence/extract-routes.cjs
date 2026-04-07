const fs = require('fs');
const path = require('path');

function walk(d) {
  let r = [];
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const s = path.join(d, f.name);
    if (f.isDirectory()) r = r.concat(walk(s));
    else if (f.name === 'route.ts') r.push(s);
  }
  return r;
}

const routes = walk('d:/projects/nextacademy/src/app/api');
const results = [];

for (const r of routes) {
  const c = fs.readFileSync(r, 'utf8');
  const exports = [...c.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)/g)].map(m => m[1]);
  const hasPayloadAuth = c.includes('payload.auth');
  const hasAuthenticateReq = c.includes('authenticateRequestUser');
  const hasResolveB2B = c.includes('resolveB2BScope');
  const hasRoleAdmin = c.includes("role === 'admin'") || c.includes("role !== 'admin'");
  const hasRoleB2B = c.includes("b2b_manager");
  const hasCsrf = c.includes('assertTrustedWriteRequest');
  const cols = [...new Set([...c.matchAll(/collection:\s*'([^']+)'/g)].map(m => m[1]))];
  const hasResend = c.includes('Resend') || c.includes('new Resend');
  const hasCrm = c.includes('enqueueCrmSyncEvent');
  const hasAtomicDb = c.includes('atomicIncrement');
  const hasPaymentProcess = c.includes('processSuccessfulPayment');
  const hasGcal = c.includes('addAttendeeToAllEvents');
  const hasPayloadEmail = c.includes('payload.sendEmail') || c.includes('sendEmail');
  const hasCronSecret = c.includes('CRON_SECRET');
  const rel = path.relative('d:/projects/nextacademy/src/app/api', r).replace(/\\/g, '/');
  const apiPath = '/api/' + rel.replace('/route.ts', '');

  results.push({
    path: apiPath,
    methods: exports,
    auth: {
      payloadAuth: hasPayloadAuth,
      authenticateReq: hasAuthenticateReq,
      resolveB2B: hasResolveB2B,
      roleAdminCheck: hasRoleAdmin,
      roleB2BCheck: hasRoleB2B,
      csrf: hasCsrf,
      cronSecret: hasCronSecret,
    },
    collections: cols,
    sideEffects: {
      email: hasResend,
      payloadEmail: hasPayloadEmail,
      crm: hasCrm,
      atomicDb: hasAtomicDb,
      paymentProcess: hasPaymentProcess,
      gcal: hasGcal,
    },
    file: rel,
  });
}

fs.writeFileSync('d:/projects/nextacademy/evidence/route_metadata.json', JSON.stringify(results, null, 2));
console.log(`Extracted metadata for ${results.length} route files`);
