import { vi, describe, it, expect, beforeEach } from 'vitest'
import { POST as paymobPOST } from '@/app/api/webhooks/paymob/route'
import { POST as easykashPOST } from '@/app/api/webhooks/easykash/route'
import { verifyPaymobHmac, verifyEasyKashHmac } from '@/lib/payment-api'
import { processSuccessfulPayment } from '@/lib/payment-helper'
import { NextRequest } from 'next/server'

vi.mock('@/lib/payment-api', () => ({
  verifyPaymobHmac: vi.fn(),
  verifyEasyKashHmac: vi.fn(),
}))

vi.mock('@/lib/payment-helper', () => ({
  processSuccessfulPayment: vi.fn().mockResolvedValue(true),
}))

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [{ id: 'payment-1', booking: 'booking-1' }] }),
    findByID: vi.fn().mockResolvedValue({ id: 'payment-1', booking: 'booking-1' }),
    update: vi.fn().mockResolvedValue({}),
  }),
}))

// Mock @payload-config
vi.mock('@payload-config', () => ({ default: {} }))

describe('Paymob Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if HMAC is invalid', async () => {
    vi.mocked(verifyPaymobHmac).mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/webhooks/paymob', {
      method: 'POST',
      body: JSON.stringify({ hmac: 'invalid', obj: { id: 123 } }),
    })

    const res = await paymobPOST(req)
    expect(res.status).toBe(401)
  })

  it('should return 401 if HMAC is missing', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/paymob', {
      method: 'POST',
      body: JSON.stringify({ obj: { id: 123 } }),
    })

    const res = await paymobPOST(req)
    expect(res.status).toBe(401)
  })

  it('should return 200 and process successful payment', async () => {
    vi.mocked(verifyPaymobHmac).mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/webhooks/paymob', {
      method: 'POST',
      body: JSON.stringify({
        hmac: 'valid',
        obj: {
          id: 123,
          success: true,
          amount_cents: 10000,
          special_reference: 'booking-1',
          extras: { payment_id: 'payment-1' }
        }
      }),
    })

    const res = await paymobPOST(req)
    expect(res.status).toBe(200)
    expect(processSuccessfulPayment).toHaveBeenCalledWith(expect.objectContaining({
      paymentId: 'payment-1',
      bookingId: 'booking-1',
    }))
  })
})

describe('EasyKash Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if HMAC is invalid', async () => {
    vi.mocked(verifyEasyKashHmac).mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/webhooks/easykash', {
      method: 'POST',
      body: JSON.stringify({ signatureHash: 'invalid' }),
    })

    const res = await easykashPOST(req)
    expect(res.status).toBe(401)
  })

  it('should skip processing if status is not PAID', async () => {
    vi.mocked(verifyEasyKashHmac).mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/webhooks/easykash', {
      method: 'POST',
      body: JSON.stringify({ status: 'FAILED' }),
    })

    const res = await easykashPOST(req)
    expect(res.status).toBe(200)
    expect(processSuccessfulPayment).not.toHaveBeenCalled()
  })

  it('should return 200 and process successful payment', async () => {
    vi.mocked(verifyEasyKashHmac).mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/webhooks/easykash', {
      method: 'POST',
      body: JSON.stringify({
        status: 'PAID',
        easykashRef: 'ek-123',
        Amount: '100.00',
        customerReference: '123-timestamp' // Use numeric prefix to match logic
      }),
    })

    const res = await easykashPOST(req)
    expect(res.status).toBe(200)
    expect(processSuccessfulPayment).toHaveBeenCalled()
  })
})
