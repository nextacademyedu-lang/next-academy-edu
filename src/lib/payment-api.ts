/**
 * Payment API — shared types + server-side helpers
 * Used by /api/checkout/* and /api/webhooks/* routes
 */

import type { PayloadBooking, PayloadRound, PayloadProgram } from './dashboard-api';
import crypto from 'crypto';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type PaymentMethod = 'card' | 'wallet' | 'fawry' | 'aman';

export interface CheckoutSession {
  bookingId: string;
  paymentId: string;
  method: PaymentMethod;
  amount: number; // in EGP
  programTitle: string;
  userEmail: string;
  userName: string;
  userPhone: string;
}

export interface PaymobIntentionResponse {
  client_secret: string;
  payment_keys?: string[];
}

export interface EasyKashCashResponse {
  voucher: string;       // reference number user takes to Fawry/Aman
  expiryDate: string;
  provider: string;      // "Fawry" or "Aman"
  easykashRef: string;
}

// ─────────────────────────────────────────────
// Paymob — Unified Checkout URL
// ─────────────────────────────────────────────

export function getPaymobCheckoutUrl(clientSecret: string): string {
  const publicKey = process.env.PAYMOB_PUBLIC_KEY!;
  return `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;
}

// ─────────────────────────────────────────────
// Paymob — Create Intention
// ─────────────────────────────────────────────

export async function createPaymobIntention(
  session: CheckoutSession,
  method: 'card' | 'wallet',
): Promise<PaymobIntentionResponse> {
  const integrationId =
    method === 'wallet'
      ? process.env.PAYMOB_WALLET_INTEGRATION_ID!
      : process.env.PAYMOB_INTEGRATION_ID!;

  const body = {
    amount: Math.round(session.amount * 100), // Paymob uses cents (piastres)
    currency: 'EGP',
    payment_methods: [parseInt(integrationId)],
    items: [
      {
        name: session.programTitle,
        amount: Math.round(session.amount * 100),
        description: `Booking ${session.bookingId}`,
        quantity: 1,
      },
    ],
    billing_data: {
      email: session.userEmail,
      first_name: session.userName.split(' ')[0] || session.userName,
      last_name: session.userName.split(' ').slice(1).join(' ') || 'N/A',
      phone_number: session.userPhone || 'N/A',
      country: 'EG',
      street: 'N/A',
      city: 'Cairo',
      state: 'Cairo',
    },
    customer: {
      email: session.userEmail,
      first_name: session.userName.split(' ')[0] || session.userName,
      last_name: session.userName.split(' ').slice(1).join(' ') || 'N/A',
    },
    extras: {
      booking_id: session.bookingId,
      payment_id: session.paymentId,
    },
    special_reference: session.bookingId,
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paymob`,
    redirection_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paymob/redirect`,
  };

  const res = await fetch('https://accept.paymob.com/v1/intention/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PAYMOB_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Paymob intention failed: ${err}`);
  }

  return res.json();
}

// ─────────────────────────────────────────────
// EasyKash — Create Cash Payment
// ─────────────────────────────────────────────

export async function createEasyKashPayment(
  session: CheckoutSession,
): Promise<EasyKashCashResponse> {
  const body = {
    payerEmail: session.userEmail,
    payerMobile: session.userPhone || '01000000000',
    payerName: session.userName,
    amount: session.amount,
    expiryDuration: 48,
    apiKey: process.env.EASYKASH_API_TOKEN!,
    VoucherData: session.programTitle,
    type: 'in',
  };

  const res = await fetch('https://back.easykash.net/api/cash-api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`EasyKash cash create failed: ${err}`);
  }

  return res.json();
}

// ─────────────────────────────────────────────
// EasyKash — HMAC Verification
// ─────────────────────────────────────────────

export function verifyEasyKashHmac(payload: Record<string, string>): boolean {
  const { ProductCode, Amount, ProductType, PaymentMethod, status, easykashRef, customerReference, signatureHash } = payload;

  const dataStr = [ProductCode, Amount, ProductType, PaymentMethod, status, easykashRef, customerReference].join('');

  const calculated = crypto
    .createHmac('sha512', process.env.EASYKASH_HMAC_SECRET!)
    .update(dataStr)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(signatureHash, 'hex'));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Paymob — HMAC Verification
// ─────────────────────────────────────────────

export function verifyPaymobHmac(params: Record<string, string>, receivedHmac: string): boolean {

  // Paymob HMAC: sort keys alphabetically, concat values, SHA512
  const hmacKeys = [
    'amount_cents', 'created_at', 'currency', 'error_occured',
    'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
    'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
    'is_voided', 'order', 'owner', 'pending',
    'source_data_pan', 'source_data_sub_type', 'source_data_type', 'success',
  ];

  const dataStr = hmacKeys.map((k) => params[k] ?? '').join('');

  const calculated = crypto
    .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET!)
    .update(dataStr)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(receivedHmac, 'hex'));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getBookingProgramTitle(booking: PayloadBooking): string {
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return 'Program';
  const program = round.program as PayloadProgram;
  if (!program || typeof program === 'string') return round.title || 'Program';
  return program.titleAr || program.titleEn || 'Program';
}
