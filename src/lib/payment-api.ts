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
export type EasyKashCurrency = 'EGP' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'QAR' | 'AED';

export interface CheckoutSession {
  bookingId: string;
  paymentId: string;
  method: PaymentMethod;
  amount: number; // in booking currency (EGP / USD / EUR currently in app)
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

export interface EasyKashDirectPayResponse {
  redirectUrl: string;
}

const EASYKASH_DIRECT_PAY_OPTIONS: Record<'card' | 'wallet' | 'fawry' | 'aman', number> = {
  aman: 1,
  card: 2,
  wallet: 4,
  fawry: 5,
};

function resolveAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.SERVER_URL ||
    'http://localhost:3000'
  );
}

function normalizeEasyKashCurrency(value?: string | null): EasyKashCurrency {
  const normalized = (value || 'EGP').toUpperCase();
  if (normalized === 'USD') return 'USD';
  if (normalized === 'EUR') return 'EUR';
  if (normalized === 'GBP') return 'GBP';
  if (normalized === 'SAR') return 'SAR';
  if (normalized === 'QAR') return 'QAR';
  if (normalized === 'AED') return 'AED';
  return 'EGP';
}

function normalizeEasyKashPhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return '01000000000';
  return trimmed;
}

function buildEasyKashRedirectUrl(params: { bookingId: string; locale?: string }): string {
  const locale = (params.locale || 'ar').trim() || 'ar';
  const url = new URL('/api/webhooks/easykash/redirect', resolveAppBaseUrl());
  url.searchParams.set('bookingId', String(params.bookingId));
  url.searchParams.set('locale', locale);
  return url.toString();
}

function asMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function asString(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

export function extractEasyKashProductCode(redirectUrl: string): string | null {
  try {
    const parsed = new URL(redirectUrl);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : null;
  } catch {
    return null;
  }
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
    payerMobile: normalizeEasyKashPhone(session.userPhone),
    payerName: session.userName,
    amount: asMoney(session.amount),
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
// EasyKash — Direct Pay (Card / Wallet / etc)
// ─────────────────────────────────────────────

export async function createEasyKashDirectPay(
  session: CheckoutSession,
  options?: {
    currency?: string | null;
    locale?: string;
    customerReference?: string | number;
    paymentOptionsOverride?: number[];
  },
): Promise<EasyKashDirectPayResponse> {
  const apiKey = process.env.EASYKASH_API_TOKEN;
  if (!apiKey) {
    throw new Error('Missing EASYKASH_API_TOKEN');
  }

  const normalizedCurrency = normalizeEasyKashCurrency(options?.currency);
  const fallbackMethod = session.method === 'wallet' ? 'wallet' : 'card';
  const optionFromMethod = EASYKASH_DIRECT_PAY_OPTIONS[fallbackMethod];
  const requestedOptions = options?.paymentOptionsOverride?.length
    ? options.paymentOptionsOverride
    : [optionFromMethod];

  const rawReference = options?.customerReference ?? session.paymentId;
  const numericReference = Number(rawReference);
  const customerReference = Number.isFinite(numericReference)
    ? numericReference
    : asString(rawReference);

  const body = {
    amount: asMoney(session.amount),
    currency: normalizedCurrency,
    paymentOptions: requestedOptions,
    cashExpiry: 48,
    name: session.userName || 'Customer',
    email: session.userEmail || 'customer@example.com',
    mobile: normalizeEasyKashPhone(session.userPhone),
    redirectUrl: buildEasyKashRedirectUrl({
      bookingId: session.bookingId,
      locale: options?.locale,
    }),
    customerReference,
  };

  const res = await fetch('https://back.easykash.net/api/directpayv1/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`EasyKash direct pay failed: ${err}`);
  }

  const data = await res.json() as Partial<EasyKashDirectPayResponse>;
  if (!data.redirectUrl || typeof data.redirectUrl !== 'string') {
    throw new Error('EasyKash direct pay failed: missing redirectUrl');
  }

  return { redirectUrl: data.redirectUrl };
}

// ─────────────────────────────────────────────
// EasyKash — HMAC Verification
// ─────────────────────────────────────────────

export function verifyEasyKashHmac(payload: Record<string, unknown>): boolean {
  const ProductCode = asString(payload.ProductCode);
  const Amount = asString(payload.Amount);
  const ProductType = asString(payload.ProductType);
  const PaymentMethod = asString(payload.PaymentMethod);
  const status = asString(payload.status);
  const easykashRef = asString(payload.easykashRef);
  const customerReference = asString(payload.customerReference);
  const signatureHash = asString(payload.signatureHash).trim().toLowerCase();

  if (!signatureHash || !/^[0-9a-f]{128}$/.test(signatureHash)) {
    return false;
  }

  const dataStr = [ProductCode, Amount, ProductType, PaymentMethod, status, easykashRef, customerReference].join('');

  const calculated = crypto
    .createHmac('sha512', process.env.EASYKASH_HMAC_SECRET!)
    .update(dataStr)
    .digest('hex')
    .toLowerCase();

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

export function getBookingCurrency(booking: PayloadBooking): EasyKashCurrency {
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return 'EGP';
  const currency =
    (round as PayloadRound & { currency?: string | null }).currency ||
    (round as unknown as { currency?: string | null }).currency ||
    null;
  return normalizeEasyKashCurrency(currency);
}
