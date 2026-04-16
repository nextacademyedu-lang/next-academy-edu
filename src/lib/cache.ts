import { getRedis } from './redis';

export const CACHE_TTL = {
  PROGRAMS_LIST: 5 * 60,      // 5 minutes
  PROGRAM_DETAIL: 10 * 60,    // 10 minutes
  INSTRUCTORS_LIST: 10 * 60,  // 10 minutes
  INSTRUCTOR_DETAIL: 15 * 60, // 15 minutes
  HOMEPAGE: 5 * 60,           // 5 minutes
} as const;

interface CacheOptions {
  ttl?: number; // seconds
  prefix?: string;
}

/**
 * Get item from Redis cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedis();
    if (!redis) return null;

    const data = await redis.get(key);
    if (!data) return null;

    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`[cache] Get failed for key ${key}:`, err);
    return null;
  }
}

/**
 * Set item in Redis cache
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  options?: CacheOptions
): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;

    const ttl = options?.ttl ?? 300; // default 5 minutes
    const serialized = JSON.stringify(data);

    if (ttl > 0) {
      await redis.set(key, serialized, 'EX', ttl);
    } else {
      await redis.set(key, serialized);
    }
  } catch (err) {
    console.error(`[cache] Set failed for key ${key}:`, err);
  }
}

/**
 * Invalidate cache by pattern
 */
export async function cacheInvalidate(pattern: string): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;

    // Use SCAN to avoid blocking Redis on large datasets
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.error(`[cache] Invalidate failed for pattern ${pattern}:`, err);
  }
}

/**
 * Get from cache or fetch and set if miss (Higher-order utility)
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss → fetch
  const data = await fetcher();

  // Store in cache (fire and forget)
  cacheSet(key, data, options).catch((err) =>
    console.error(`[cache] Background set failed for key ${key}:`, err)
  );

  return data;
}
