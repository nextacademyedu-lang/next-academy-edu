/**
 * Internal Cron Scheduler — Zero Dependencies
 *
 * Runs inside the Node.js process via instrumentation.ts.
 * Uses setInterval to periodically call our cron API endpoints,
 * since the app runs on Docker/Coolify with no external cron runner.
 *
 * Each job hits its endpoint with the Authorization header so the
 * endpoint's existing auth check passes. Failures are logged but
 * never crash the process.
 */

interface CronJobConfig {
  name: string;
  intervalMs: number;
  path: string;
}

const CRON_JOBS: CronJobConfig[] = [
  // CRM sync — every 30 minutes
  { name: 'crm-sync',     intervalMs: 30 * 60 * 1000, path: '/api/cron/crm-sync' },
  // Check overdue — every 6 hours
  { name: 'check-overdue', intervalMs: 6 * 60 * 60 * 1000, path: '/api/cron/check-overdue' },
  // Waitlist cascade — every hour
  { name: 'waitlist',      intervalMs: 60 * 60 * 1000, path: '/api/cron/waitlist' },
];

async function runJob(
  job: CronJobConfig,
  baseUrl: string,
  cronSecret: string,
): Promise<void> {
  const url = `${baseUrl}${job.path}`;
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${cronSecret}` },
      signal: AbortSignal.timeout(120_000),
    });

    const elapsed = Date.now() - start;
    if (res.ok) {
      console.log(`[cron] ✅ ${job.name} completed (${res.status}) in ${elapsed}ms`);
    } else {
      const body = await res.text().catch(() => '');
      console.error(
        `[cron] ❌ ${job.name} failed (${res.status}) in ${elapsed}ms: ${body.slice(0, 300)}`,
      );
    }
  } catch (error) {
    const elapsed = Date.now() - start;
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[cron] ❌ ${job.name} error after ${elapsed}ms: ${msg}`);
  }
}

export function startCronScheduler(): void {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    console.warn('[cron-scheduler] ⚠️  CRON_SECRET not set — scheduler disabled');
    return;
  }

  // Use internal URL so we don't go through external DNS/proxy
  const baseUrl = process.env.INTERNAL_APP_URL
    || process.env.NEXT_PUBLIC_SERVER_URL
    || 'http://localhost:3000';
  const normalizedBase = baseUrl.replace(/\/+$/, '');

  console.log(`[cron-scheduler] Starting ${CRON_JOBS.length} cron jobs (base: ${normalizedBase})`);

  for (const job of CRON_JOBS) {
    // Run once immediately on startup
    void runJob(job, normalizedBase, cronSecret);

    // Then repeat on interval
    setInterval(() => {
      void runJob(job, normalizedBase, cronSecret);
    }, job.intervalMs);

    const mins = Math.round(job.intervalMs / 60_000);
    console.log(`[cron-scheduler]   📅 ${job.name} → every ${mins} min`);
  }

  console.log('[cron-scheduler] ✅ All cron jobs registered');
}
