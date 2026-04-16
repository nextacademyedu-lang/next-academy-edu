export type ContactSource = 'website' | 'whatsapp' | 'social' | 'referral';
export type BookingSource = 'website' | 'whatsapp' | 'admin' | 'phone' | 'payment_link';

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function hasAnyToken(value: string, tokens: string[]): boolean {
  const normalized = normalizeToken(value);
  return tokens.some((token) => normalized.includes(token));
}

export function normalizeContactSource(input?: string | null): ContactSource {
  if (!input) return 'website';
  const value = normalizeToken(input);

  if (hasAnyToken(value, ['whatsapp', 'wa', 'wapp', 'واتساب', 'واتس'])) return 'whatsapp';
  if (hasAnyToken(value, ['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'social', 'meta', 'x', 'twitter'])) {
    return 'social';
  }
  if (hasAnyToken(value, ['friend', 'referral', 'refer', 'word-of-mouth', 'mouth', 'colleague', 'صديق', 'إحالة'])) {
    return 'referral';
  }
  return 'website';
}

type SearchParamReader = {
  get: (name: string) => string | null;
};

export function deriveContactSourceFromSearchParams(params: SearchParamReader): ContactSource {
  const candidates = [
    params.get('utm_source'),
    params.get('source'),
    params.get('from'),
    params.get('ref'),
    params.get('channel'),
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.trim()) {
      return normalizeContactSource(candidate);
    }
  }

  return 'website';
}

export function mapContactToBookingSource(source?: string | null): BookingSource {
  const normalized = normalizeContactSource(source);
  if (normalized === 'whatsapp') return 'whatsapp';
  return 'website';
}

/**
 * Persists the contact source to localStorage IF user has consented to cookies.
 * Also listens for the 'cookie-consent-accepted' event for retroactive tracking.
 */
export function initializeSourceTracking() {
  if (typeof window === 'undefined') return;

  const track = () => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'declined') return;
    if (consent !== 'accepted') return;

    // Derived from current URL params
    const params = new URLSearchParams(window.location.search);
    const source = deriveContactSourceFromSearchParams(params);
    
    // We only store it if it's not the default 'website' or if it's already stored
    if (source !== 'website') {
      localStorage.setItem('na-source-tracking', source);
    }
  };

  // Run on load
  track();

  // Respond to consent being granted later
  window.addEventListener('cookie-consent-accepted', track);
}

/**
 * Helper to get the persisted source, respecting consent.
 */
export function getPersistedContactSource(): ContactSource {
  if (typeof window === 'undefined') return 'website';
  
  const consent = localStorage.getItem('cookie-consent');
  if (consent !== 'accepted') return 'website';
  
  return (localStorage.getItem('na-source-tracking') as ContactSource) || 'website';
}
