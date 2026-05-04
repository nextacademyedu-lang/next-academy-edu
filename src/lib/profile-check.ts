/**
 * Profile completeness check for booking flow.
 * Validates that user has essential info before allowing a booking.
 */

export interface ProfileCheckResult {
  complete: boolean;
  missing: string[];
}

export async function checkProfileCompleteness(): Promise<ProfileCheckResult> {
  try {
    const res = await fetch('/api/users/me', { credentials: 'include' });
    if (!res.ok) return { complete: false, missing: ['auth'] };

    const data = await res.json();
    const user = data?.user;
    if (!user) return { complete: false, missing: ['auth'] };

    const missing: string[] = [];

    if (!user.firstName || !user.firstName.trim()) missing.push('firstName');
    if (!user.lastName || !user.lastName.trim()) missing.push('lastName');
    if (!user.phone || !user.phone.trim()) missing.push('phone');

    return { complete: missing.length === 0, missing };
  } catch {
    return { complete: false, missing: ['network'] };
  }
}

export function buildProfileRedirectUrl(locale: string, returnTo: string): string {
  return `/${locale}/dashboard/profile?returnTo=${encodeURIComponent(returnTo)}&incomplete=1`;
}

export function getMissingFieldsMessage(missing: string[], locale: string): string {
  const isAr = locale === 'ar';
  
  const labels: Record<string, { ar: string; en: string }> = {
    firstName: { ar: 'الاسم الأول', en: 'First Name' },
    lastName: { ar: 'اسم العائلة', en: 'Last Name' },
    phone: { ar: 'رقم الموبايل', en: 'Phone Number' },
  };

  const fieldNames = missing
    .filter(f => labels[f])
    .map(f => isAr ? labels[f].ar : labels[f].en);

  if (isAr) {
    return `برجاء إكمال بياناتك أولاً: ${fieldNames.join('، ')}`;
  }
  return `Please complete your profile first: ${fieldNames.join(', ')}`;
}
