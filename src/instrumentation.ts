/**
 * Next.js Instrumentation Hook
 *
 * Runs at server startup to eagerly initialize Payload CMS,
 * ensuring the database schema is pushed (push: true) before
 * any page requests arrive.
 *
 * Uses a relative import (NOT the @payload-config alias) because
 * TypeScript path aliases are not resolved in Next.js standalone
 * runtime. Retries up to 5 times to tolerate slow DB startup in
 * Docker, and crashes on total failure so Coolify restarts the
 * container instead of running with missing tables.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 3_000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[instrumentation] Attempt ${attempt}/${MAX_RETRIES}: Initializing Payload CMS…`,
        );

        const { getPayload } = await import('payload');
        // IMPORTANT: relative import — @payload-config alias does NOT
        // resolve inside Next.js standalone runtime.
        const configModule = await import('./payload.config');
        const config = configModule.default;

        const payload = await getPayload({ config });

        const collections = Object.keys(payload.collections);
        console.log(
          `[instrumentation] ✅ Payload CMS initialized. Collections: ${collections.join(', ')}`,
        );

        // Start internal cron scheduler after a short delay
        // so the HTTP server is fully ready to accept requests
        setTimeout(async () => {
          try {
            const { startCronScheduler } = await import('./lib/cron-scheduler');
            startCronScheduler();
          } catch (err) {
            console.error('[instrumentation] ⚠️  Failed to start cron scheduler:', err);
          }
        }, 10_000);

        return; // success — exit the retry loop
      } catch (error) {
        console.error(
          `[instrumentation] ❌ Attempt ${attempt}/${MAX_RETRIES} failed:`,
          error,
        );

        if (attempt < MAX_RETRIES) {
          console.log(
            `[instrumentation] Retrying in ${RETRY_DELAY_MS / 1_000}s…`,
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    }

    // All retries exhausted — crash so Coolify restarts the container
    console.error(
      '[instrumentation] 💀 All retries exhausted — cannot initialize Payload CMS. Exiting.',
    );
    process.exit(1);
  }
}
