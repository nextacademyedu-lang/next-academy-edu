import { vi, describe, it, expect, beforeEach } from 'vitest'
import { processSuccessfulPayment } from '@/lib/payment-helper'
import { getPayload } from 'payload'
import { atomicIncrement } from '@/lib/atomic-db'

// Mock dependencies
vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    findByID: vi.fn(),
    update: vi.fn(),
  }),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/lib/email', () => ({ sendBookingConfirmation: vi.fn() }))
vi.mock('@/lib/atomic-db', () => ({ atomicIncrement: vi.fn() }))

describe('processSuccessfulPayment - Amount Validation', () => {
  let mockPayload: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockPayload = await getPayload({ config: {} as any })
    // Default success for atomicIncrement
    vi.mocked(atomicIncrement).mockResolvedValue(100)
  })

  it('should accept full price payment (exact amount)', async () => {
    const payment = { id: 'p1', amount: 100, status: 'pending', booking: 'b1' }
    mockPayload.findByID.mockResolvedValueOnce(payment) // 1. fetch payment
    mockPayload.findByID.mockResolvedValueOnce({ id: 'b1', finalAmount: 100 }) // 2. fetch booking (after increment)
    
    const result = await processSuccessfulPayment({
      paymentId: 'p1',
      bookingId: 'b1',
      receivedAmountCents: 10000, // 100 * 100
      transactionId: 'tx1',
      gatewayResponse: {},
    })

    expect(result).toBe(true)
    expect(mockPayload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'payments',
      id: 'p1',
      data: expect.objectContaining({ status: 'paid' })
    }))
  })

  it('should reject genuine underpayment', async () => {
    const payment = { id: 'p1', amount: 100, status: 'pending', booking: 'b1' }
    mockPayload.findByID.mockResolvedValueOnce(payment)
    
    const result = await processSuccessfulPayment({
      paymentId: 'p1',
      bookingId: 'b1',
      receivedAmountCents: 9000, // 90 instead of 100
      transactionId: 'tx1',
      gatewayResponse: {},
    })

    expect(result).toBe(false)
    expect(mockPayload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'payments',
      id: 'p1',
      data: expect.objectContaining({ status: 'failed' })
    }))
  })

  it('should accept overpayment (e.g. including fees)', async () => {
    const payment = { id: 'p1', amount: 100, status: 'pending', booking: 'b1' }
    mockPayload.findByID.mockResolvedValueOnce(payment)
    mockPayload.findByID.mockResolvedValueOnce({ id: 'b1', finalAmount: 100 })
    
    // 102.50 received (overpayment)
    const result = await processSuccessfulPayment({
      paymentId: 'p1',
      bookingId: 'b1',
      receivedAmountCents: 10250,
      transactionId: 'tx1',
      gatewayResponse: {},
    })

    expect(result).toBe(true)
    expect(mockPayload.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'paid' })
    }))
  })

  it('should handle small differences (floating point) gracefully', async () => {
    const payment = { id: 'p1', amount: 100, status: 'pending', booking: 'b1' }
    mockPayload.findByID.mockResolvedValueOnce(payment)
    mockPayload.findByID.mockResolvedValueOnce({ id: 'b1', finalAmount: 100 })
    
    // 99.99 received (within 1 cent threshold)
    const result = await processSuccessfulPayment({
      paymentId: 'p1',
      bookingId: 'b1',
      receivedAmountCents: 9999,
      transactionId: 'tx1',
      gatewayResponse: {},
    })

    expect(result).toBe(true)
  })
})
