/**
 * Rate limiter — ioredis sliding window (VPS/production) with in-memory fallback (dev).
 * Uses Redis ZADD + ZREMRANGEBYSCORE for atomic sliding window.
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInMs: number;
}

import { getRedis } from './redis';

async function redisLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redis = await getRedis();
  if (!redis) throw new Error('Redis unavailable');
  
  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `rl:${key}`;

  // Atomic sliding window via pipeline
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(redisKey, '-inf', windowStart);
  pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
  pipeline.zcard(redisKey);
  pipeline.pexpire(redisKey, windowMs);

  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) ?? limit + 1;

  if (count > limit) {
    // Get oldest entry to calculate reset time
    const oldest = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
    const oldestTs = oldest[1] ? parseInt(oldest[1]) : now;
    return { success: false, remaining: 0, resetInMs: windowMs - (now - oldestTs) };
  }

  return { success: true, remaining: limit - count, resetInMs: 0 };
}

// ─── In-memory fallback (dev / no Redis) ────────────────────────────────────

const store = new Map<string, number[]>();

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of store.entries()) {
    if (!timestamps.length || now - timestamps[timestamps.length - 1] > 60_000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

function memoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    return { success: false, remaining: 0, resetInMs: windowMs - (now - timestamps[0]) };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { success: true, remaining: limit - timestamps.length, resetInMs: 0 };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (process.env.REDIS_URL) {
    try {
      return await redisLimit(key, limit, windowMs);
    } catch {
      // Redis unavailable → fallback
    }
  }
  return memoryLimit(key, limit, windowMs);
}
