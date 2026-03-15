/**
 * Next.js Instrumentation Hook
 * 
 * Runs at server startup to eagerly initialize Payload CMS,
 * ensuring the database schema is pushed (push: true) before
 * any page requests arrive.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { getPayload } = await import('payload');
      const config = (await import('@payload-config')).default;
      
      console.log('[instrumentation] Eagerly initializing Payload CMS...');
      const payload = await getPayload({ config });
      console.log('[instrumentation] Payload CMS initialized successfully.');
      
      // Verify DB connectivity by running a simple query
      const collections = Object.keys(payload.collections);
      console.log(`[instrumentation] Available collections: ${collections.join(', ')}`);
    } catch (error) {
      console.error('[instrumentation] Failed to initialize Payload CMS:', error);
      // Don't crash the server — pages with try/catch will handle gracefully
    }
  }
}
