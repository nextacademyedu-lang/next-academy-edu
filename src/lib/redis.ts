import type { Redis } from 'ioredis';

let redisClient: Redis | null = null;

/**
 * Shared Redis client initialization for use across rate limiting and caching.
 * Uses persistent connection with retry logic and offline queue disabled.
 */
export async function getRedis(): Promise<Redis | null> {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      const { default: Redis } = await import('ioredis');
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      redisClient.on('error', (err) => {
        console.error('[redis] Connection error:', err);
        // Force re-initialization on next call if it failed
        redisClient = null;
      });
    } catch (err) {
      console.error('[redis] Initialization failed:', err);
      redisClient = null;
    }
  }
  return redisClient;
}
