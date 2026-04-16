import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('Rate Limiter (In-Memory Fallback)', () => {
  // Ensure Redis is not used during these tests
  const originalRedisUrl = process.env.REDIS_URL
  
  beforeEach(() => {
    delete process.env.REDIS_URL
    vi.useFakeTimers()
  })

  afterEach(() => {
    process.env.REDIS_URL = originalRedisUrl
    vi.useRealTimers()
  })

  it('should allow requests under the limit', async () => {
    const key = 'test-key-1'
    const limit = 2
    const windowMs = 60000

    const res1 = await rateLimit(key, limit, windowMs)
    expect(res1.success).toBe(true)
    expect(res1.remaining).toBe(1)

    const res2 = await rateLimit(key, limit, windowMs)
    expect(res2.success).toBe(true)
    expect(res2.remaining).toBe(0)
  })

  it('should block requests at the limit', async () => {
    const key = 'test-key-2'
    const limit = 1
    const windowMs = 60000

    await rateLimit(key, limit, windowMs)
    const res = await rateLimit(key, limit, windowMs)
    
    expect(res.success).toBe(false)
    expect(res.remaining).toBe(0)
    expect(res.resetInMs).toBeGreaterThan(0)
    expect(res.resetInMs).toBeLessThanOrEqual(windowMs)
  })

  it('should allow requests again after cooldown', async () => {
    const key = 'test-key-3'
    const limit = 1
    const windowMs = 1000

    await rateLimit(key, limit, windowMs)
    
    // Advance time by 1.1s
    vi.advanceTimersByTime(1100)
    
    const res = await rateLimit(key, limit, windowMs)
    expect(res.success).toBe(true)
    expect(res.remaining).toBe(0) // 1 - 1 = 0
  })

  it('should maintain independent limits for different keys', async () => {
    const limit = 1
    const windowMs = 60000

    await rateLimit('key-A', limit, windowMs)
    
    const resB = await rateLimit('key-B', limit, windowMs)
    expect(resB.success).toBe(true)
    
    const resA = await rateLimit('key-A', limit, windowMs)
    expect(resA.success).toBe(false)
  })
})
