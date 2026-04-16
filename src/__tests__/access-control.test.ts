import { vi, describe, it, expect, beforeEach } from 'vitest'
import { 
  isAdminUser, 
  isAdmin, 
  isAdminOrSelf,
  isAdminOrInstructor,
  isAdminOrB2BManager,
  isAuthenticated
} from '@/lib/access-control'

describe('Access Control - isAdminUser', () => {
  it('should return true for user with role admin', () => {
    expect(isAdminUser({ role: 'admin' })).toBe(true)
  })

  it('should return true if email is in PAYLOAD_ADMIN_EMAIL', () => {
    process.env.PAYLOAD_ADMIN_EMAIL = 'admin@nextacademy.edu'
    expect(isAdminUser({ email: 'admin@nextacademy.edu' })).toBe(true)
  })

  it('should return false for regular student', () => {
    expect(isAdminUser({ role: 'student', email: 'student@example.com' })).toBe(false)
  })

  it('should return false if no user is provided', () => {
    expect(isAdminUser(null)).toBe(false)
  })
})

describe('Access Control - isAdmin', () => {
  it('should allow admin user', async () => {
    const req = { user: { role: 'admin' } } as any
    const result = await isAdmin({ req })
    expect(result).toBe(true)
  })

  it('should deny non-admin user', async () => {
    const req = { user: { role: 'student' }, payload: { findByID: vi.fn().mockResolvedValue(null) } } as any
    const result = await isAdmin({ req })
    expect(result).toBe(false)
  })
})

describe('Access Control - isAdminOrSelf', () => {
  it('should allow admin to access any record', async () => {
    const req = { user: { role: 'admin' } } as any
    const result = await isAdminOrSelf({ req, id: 999 })
    expect(result).toBe(true)
  })

  it('should return query constraint for self access', async () => {
    const req = { user: { id: 1, role: 'student' } } as any
    const result = await isAdminOrSelf({ req, id: 1 })
    expect(result).toEqual({ id: { equals: 1 } })
  })

  it('should deny unauthenticated access', async () => {
    const req = { user: null } as any
    const result = await isAdminOrSelf({ req, id: 1 })
    expect(result).toBe(false)
  })
})

describe('Access Control - isAdminOrInstructor', () => {
  it('should allow instructor', async () => {
    const req = { user: { role: 'instructor' } } as any
    const result = await isAdminOrInstructor({ req })
    expect(result).toBe(true)
  })
})

describe('Access Control - isAdminOrB2BManager', () => {
  it('should return company constraint for B2B manager', async () => {
    const req = { 
      user: { id: 'm1', role: 'b2b_manager' },
      payload: {
        find: vi.fn().mockResolvedValue({ docs: [{ company: 42 }] })
      }
    } as any
    const result = await isAdminOrB2BManager({ req })
    expect(result).toEqual({ company: { equals: 42 } })
  })

  it('should deny regular student', async () => {
    const req = { user: { role: 'student' } } as any
    const result = await isAdminOrB2BManager({ req })
    expect(result).toBe(false)
  })
})
