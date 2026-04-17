import {
  mapBookingStatusToDealStage,
  mapConsultationStatusToDealStage,
  mapLifecycleStage,
  mapPaymentStatusToDealStage,
} from './stages.ts';
import { buildExternalId, normalizeId, toIso } from './utils.ts';
import type { CrmEntityType } from './types.ts';

function getString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function extractProgramTitle(round: unknown): string | undefined {
  if (!round || typeof round !== 'object') return undefined;
  const roundObj = round as Record<string, unknown>;
  const program = roundObj.program;
  if (!program || typeof program !== 'object') return undefined;
  const programObj = program as Record<string, unknown>;
  return getString(programObj.titleAr) || getString(programObj.titleEn);
}

function extractInterestedInPrograms(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const titles = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const obj = item as Record<string, unknown>;
      return getString(obj.titleAr) || getString(obj.titleEn) || getString(obj.title) || null;
    })
    .filter(Boolean) as string[];
  return titles.length > 0 ? titles.join(', ') : undefined;
}

function buildUserDisplayName(user?: Record<string, unknown> | null): string | undefined {
  if (!user) return undefined;
  const firstName = getString(user.firstName) || '';
  const lastName = getString(user.lastName) || '';
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;
  return getString(user.email);
}

export function makeEntityExternalId(entityType: CrmEntityType, entityId: string | number): string {
  return buildExternalId(entityType, entityId);
}

export function mapCompanyToCrm(company: Record<string, unknown>) {
  const id = normalizeId(company.id);
  if (!id) throw new Error('Company id is required');

  return {
    externalId: makeEntityExternalId('company', id),
    name: getString(company.name),
    industry: getString(company.industry),
    size: getString(company.size),
    type: getString(company.type),
    website: getString(company.website),
    country: getString(company.country),
    city: getString(company.city),
    logo: getString(company.logo),
    sourceSystem: 'nextacademy',
    lastSyncedAt: new Date().toISOString(),
  };
}

export function mapUserToCrmContact(params: {
  user: Record<string, unknown>;
  profile?: Record<string, unknown> | null;
  company?: Record<string, unknown> | null;
}) {
  const { user, profile, company } = params;
  const id = normalizeId(user.id);
  if (!id) throw new Error('User id is required');

  const companyId = company ? normalizeId(company.id) : null;

  return {
    externalId: makeEntityExternalId('user', id),
    firstName: getString(user.firstName),
    lastName: getString(user.lastName),
    fullName: `${getString(user.firstName) || ''} ${getString(user.lastName) || ''}`.trim(),
    email: getString(user.email),
    phone: getString(user.phone),
    role: getString(user.role),
    lifecycleStage: mapLifecycleStage(getString(user.lifecycleStage)),
    contactSource: getString(user.contactSource) || 'website',
    preferredLanguage: getString(user.preferredLanguage) || 'ar',
    emailVerified: Boolean(user.emailVerified),
    lastLogin: toIso(user.lastLogin),
    createdAt: toIso(user.createdAt),
    newsletterOptIn: Boolean(user.newsletterOptIn),
    whatsappOptIn: Boolean(user.whatsappOptIn),
    instructorExternalId: normalizeId(user.instructorId)
      ? makeEntityExternalId('user', normalizeId(user.instructorId)!)
      : undefined,
    companyExternalId: companyId ? makeEntityExternalId('company', companyId) : undefined,
    profileJobTitle: profile ? getString(profile.jobTitle) : undefined,
    profileWorkField: profile ? getString(profile.workField) : undefined,
    profileCountry: profile ? getString(profile.country) : undefined,
    profileCity: profile ? getString(profile.city) : undefined,
    onboardingCompleted: profile ? Boolean(profile.onboardingCompleted) : undefined,
    sourceSystem: 'nextacademy',
    lastSyncedAt: new Date().toISOString(),
  };
}

/**
 * Map user/profile into Twenty standard "people" object shape.
 * This is used when contacts resource points to the default Twenty object ("people"),
 * which does not include custom fields like `externalId`.
 */
export function mapUserToTwentyPerson(params: {
  user: Record<string, unknown>;
  profile?: Record<string, unknown> | null;
}) {
  const { user, profile } = params;

  const firstName = getString(user.firstName) || '';
  const lastName = getString(user.lastName) || '';
  const email = getString(user.email) || '';
  const phoneRaw = getString(user.phone) || '';
  const phoneNormalized = phoneRaw
    .replace(/\s+/g, '')
    .replace(/^(\+?20)/, '')
    .replace(/^0/, '');

  return {
    name: {
      firstName,
      lastName,
    },
    emails: {
      primaryEmail: email,
      additionalEmails: [],
    },
    phones: {
      primaryPhoneNumber: phoneNormalized,
      primaryPhoneCountryCode: phoneNormalized ? 'EG' : '',
      primaryPhoneCallingCode: phoneNormalized ? '+20' : '',
      additionalPhones: [],
    },
    jobTitle: (profile ? getString(profile.jobTitle) : undefined) || '',
    city: (profile ? getString(profile.city) : undefined) || '',
    createdAt: toIso(user.createdAt) || '',
    gender: (user ? getString(user.gender) : undefined),
    yearsOfExperience: (profile ? getString(profile.experience) : undefined),
    specialization: (profile ? getString(profile.workField) : undefined),
    lifecycleStage: mapLifecycleStage(getString(user.lifecycleStage)),
    contactSource: getString(user.contactSource) || 'website',
  };
}

export function mapLeadToCrm(lead: Record<string, unknown>) {
  const id = normalizeId(lead.id);
  if (!id) throw new Error('Lead id is required');

  return {
    externalId: makeEntityExternalId('lead', id),
    firstName: getString(lead.firstName),
    lastName: getString(lead.lastName),
    fullName: `${getString(lead.firstName) || ''} ${getString(lead.lastName) || ''}`.trim(),
    email: getString(lead.email),
    phone: getString(lead.phone),
    company: getString(lead.company),
    jobTitle: getString(lead.jobTitle),
    source: getString(lead.source),
    sourceDetails: getString(lead.sourceDetails),
    status: getString(lead.status) || 'new',
    priority: getString(lead.priority) || 'medium',
    lostReason: getString(lead.lostReason),
    interestedInPrograms: extractInterestedInPrograms(lead.interestedIn),
    convertedAt: toIso(lead.convertedAt),
    convertedUserExternalId: normalizeId(lead.convertedUser)
      ? makeEntityExternalId('user', normalizeId(lead.convertedUser)!)
      : undefined,
    assignedToExternalId: normalizeId(lead.assignedTo)
      ? makeEntityExternalId('user', normalizeId(lead.assignedTo)!)
      : undefined,
    sourceSystem: 'nextacademy',
    lastSyncedAt: new Date().toISOString(),
  };
}

/**
 * Maps Payload CMS Lead to Twenty's default `people` object schema.
 */
export function mapLeadToTwentyPerson(lead: Record<string, unknown>) {
  const firstName = getString(lead.firstName) || '';
  const lastName = getString(lead.lastName) || '';
  const email = getString(lead.email) || '';
  const phoneRaw = getString(lead.phone) || '';
  const phoneNormalized = phoneRaw
    .replace(/\s+/g, '')
    .replace(/^(\+?20)/, '')
    .replace(/^0/, '');

  return {
    name: {
      firstName,
      lastName,
    },
    emails: {
      primaryEmail: email,
      additionalEmails: [],
    },
    phones: {
      primaryPhoneNumber: phoneNormalized,
      primaryPhoneCountryCode: phoneNormalized ? 'EG' : '',
      primaryPhoneCallingCode: phoneNormalized ? '+20' : '',
      additionalPhones: [],
    },
    jobTitle: getString(lead.jobTitle) || '',
    lifecycleStage: 'lead',
    contactSource: getString(lead.source) || 'lead_form',
  };
}

export function mapBookingToCrmDeal(params: {
  booking: Record<string, unknown>;
  user?: Record<string, unknown> | null;
  company?: Record<string, unknown> | null;
}) {
  const { booking, user, company } = params;
  const id = normalizeId(booking.id);
  if (!id) throw new Error('Booking id is required');

  const bookingStatus = getString(booking.status) || 'pending';
  const round = booking.round as Record<string, unknown> | undefined;
  const roundId = normalizeId(round?.id ?? booking.round);

  return {
    externalId: makeEntityExternalId('booking', id),
    dealType: 'program_booking',
    dealStage: mapBookingStatusToDealStage(bookingStatus),
    bookingCode: getString(booking.bookingCode),
    bookingStatus,
    totalAmount: getNumber(booking.totalAmount) ?? 0,
    finalAmount: getNumber(booking.finalAmount) ?? 0,
    paidAmount: getNumber(booking.paidAmount) ?? 0,
    remainingAmount: getNumber(booking.remainingAmount) ?? 0,
    discountAmount: getNumber(booking.discountAmount) ?? 0,
    discountCode: getString(booking.discountCode),
    bookingSource: getString(booking.bookingSource) || 'website',
    cancellationReason: getString(booking.cancellationReason),
    cancelledAt: toIso(booking.cancelledAt),
    refundAmount: getNumber(booking.refundAmount),
    refundDate: toIso(booking.refundDate),
    roundExternalId: roundId ? makeEntityExternalId('booking', roundId) : undefined,
    roundStartDate: toIso(round?.startDate),
    roundEndDate: toIso(round?.endDate),
    roundTitle: getString(round?.title),
    programTitle: extractProgramTitle(round),
    contactExternalId: normalizeId(user?.id)
      ? makeEntityExternalId('user', normalizeId(user?.id)!)
      : normalizeId(booking.user)
        ? makeEntityExternalId('user', normalizeId(booking.user)!)
        : undefined,
    companyExternalId: normalizeId(company?.id)
      ? makeEntityExternalId('company', normalizeId(company?.id)!)
      : undefined,
    sourceSystem: 'nextacademy',
    lastSyncedAt: new Date().toISOString(),
  };
}

/**
 * Minimal payload compatible with Twenty default `opportunities` object.
 * We avoid custom fields and keep to a stable baseline so pipeline cards are created.
 */
export function mapBookingToTwentyOpportunity(params: {
  booking: Record<string, unknown>;
  user?: Record<string, unknown> | null;
}) {
  const { booking, user } = params;
  const id = normalizeId(booking.id);
  if (!id) throw new Error('Booking id is required');

  const bookingCode = getString(booking.bookingCode) || `B-${id}`;
  const round = booking.round as Record<string, unknown> | undefined;
  const programTitle = extractProgramTitle(round) || 'Program';
  const userName = buildUserDisplayName(user) || 'User';
  const status = getString(booking.status) || 'pending';

  return {
    name: `${programTitle} | ${userName} | ${bookingCode} | ${status}`,
    bookingType: 'Program',
    promoCode: getString(booking.discountCode),
    discount: getNumber(booking.discountAmount) ? String(getNumber(booking.discountAmount)) : undefined,
    stage: mapBookingStatusToDealStage(status),
  };
}

export function mapPaymentToCrmDealPatch(params: {
  payment: Record<string, unknown>;
  booking?: Record<string, unknown> | null;
}) {
  const { payment, booking } = params;
  const paymentStatus = getString(payment.status) || 'pending';

  return {
    latestPaymentExternalId: normalizeId(payment.id)
      ? makeEntityExternalId('payment', normalizeId(payment.id)!)
      : undefined,
    latestPaymentStatus: paymentStatus,
    latestPaymentMethod: getString(payment.paymentMethod),
    latestTransactionId: getString(payment.transactionId),
    latestPaymentAmount: getNumber(payment.amount) ?? 0,
    latestPaymentDueDate: toIso(payment.dueDate),
    latestPaymentPaidDate: toIso(payment.paidDate),
    dealStage: mapPaymentStatusToDealStage(paymentStatus),
    bookingStatus: booking ? getString(booking.status) : undefined,
    bookingPaidAmount: booking ? getNumber(booking.paidAmount) : undefined,
    bookingRemainingAmount: booking ? getNumber(booking.remainingAmount) : undefined,
    sourceSystem: 'nextacademy',
    lastSyncedAt: new Date().toISOString(),
  };
}

export function mapPaymentToTwentyOpportunityPatch(params: {
  payment: Record<string, unknown>;
  booking?: Record<string, unknown> | null;
}) {
  const { payment, booking } = params;
  const paymentStatus = getString(payment.status) || 'pending';
  const bookingCode = booking ? getString(booking.bookingCode) : undefined;

  return {
    name: bookingCode
      ? `${bookingCode} | payment:${paymentStatus}`
      : `payment:${paymentStatus}`,
  };
}

export function mapConsultationToCrmDeal(params: {
  consultation: Record<string, unknown>;
  user?: Record<string, unknown> | null;
  instructor?: Record<string, unknown> | null;
  consultationType?: Record<string, unknown> | null;
}) {
  const { consultation, user, instructor, consultationType } = params;
  const id = normalizeId(consultation.id);
  if (!id) throw new Error('Consultation booking id is required');

  const consultationStatus = getString(consultation.status);
  const paymentStatus = getString(consultation.paymentStatus);
  const instructorName = instructor
    ? `${getString(instructor.firstName) || ''} ${getString(instructor.lastName) || ''}`.trim()
    : undefined;

  return {
    externalId: makeEntityExternalId('consultation_booking', id),
    dealType: 'consultation_booking',
    dealStage: mapConsultationStatusToDealStage(consultationStatus, paymentStatus),
    consultationStatus: consultationStatus || 'pending',
    paymentStatus: paymentStatus || 'pending',
    bookingCode: getString(consultation.bookingCode),
    amount: getNumber(consultation.amount) ?? 0,
    discountAmount: getNumber(consultation.discountAmount) ?? 0,
    meetingUrl: getString(consultation.meetingUrl),
    cancelledBy: getString(consultation.cancelledBy),
    cancellationReason: getString(consultation.cancellationReason),
    slotDate: toIso(consultation.bookingDate),
    slotStartTime: getString(consultation.startTime),
    slotEndTime: getString(consultation.endTime),
    consultationTypeTitle:
      getString(consultationType?.titleAr) ||
      getString(consultationType?.titleEn) ||
      getString(consultationType?.title),
    consultationDuration: getNumber(consultationType?.durationMinutes),
    instructorName,
    contactExternalId: normalizeId(user?.id)
      ? makeEntityExternalId('user', normalizeId(user?.id)!)
      : normalizeId(consultation.user)
        ? makeEntityExternalId('user', normalizeId(consultation.user)!)
        : undefined,
    sourceSystem: 'nextacademy',
    lastSyncedAt: new Date().toISOString(),
  };
}

export function mapConsultationToTwentyOpportunity(params: {
  consultation: Record<string, unknown>;
  user?: Record<string, unknown> | null;
  consultationType?: Record<string, unknown> | null;
}) {
  const { consultation, user, consultationType } = params;
  const id = normalizeId(consultation.id);
  if (!id) throw new Error('Consultation booking id is required');

  const bookingCode = getString(consultation.bookingCode) || `C-${id}`;
  const userName = buildUserDisplayName(user) || 'User';
  const typeTitle =
    getString(consultationType?.titleAr) ||
    getString(consultationType?.titleEn) ||
    getString(consultationType?.title) ||
    'Consultation';
  const status = getString(consultation.status) || 'pending';

  return {
    name: `${typeTitle} | ${userName} | ${bookingCode} | ${status}`,
    bookingType: 'Consultation',
    promoCode: getString(consultation.bookingCode), // Not the strictly right field perhaps but we map bookingCode or discountCode if we had one.
    discount: getNumber(consultation.discountAmount) ? String(getNumber(consultation.discountAmount)) : undefined,
    stage: mapConsultationStatusToDealStage(status, getString(consultation.paymentStatus)),
  };
}

export function mapWaitlistPatch(waitlist: Record<string, unknown>) {
  return {
    waitlistStatus: getString(waitlist.status),
    waitlistPosition: getNumber(waitlist.position),
    waitlistNotifiedAt: toIso(waitlist.notifiedAt),
    waitlistExpiresAt: toIso(waitlist.expiresAt),
    sourceSystem: 'nextacademy',
    lastSyncedAt: new Date().toISOString(),
  };
}

export function mapBulkSeatAllocationPatch(allocation: Record<string, unknown>) {
  const allocations = Array.isArray(allocation.allocations) ? allocation.allocations : [];
  const activeAllocatedSeats = allocations.filter((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const status = getString((entry as Record<string, unknown>).status);
    return status !== 'cancelled';
  }).length;

  return {
    bulkSeatStatus: getString(allocation.status),
    bulkSeatTotalSeats: getNumber(allocation.totalSeats) ?? 0,
    bulkSeatAllocatedSeats: activeAllocatedSeats,
    bulkSeatPurchaseDate: toIso(allocation.purchaseDate),
    sourceSystem: 'nextacademy',
    lastSyncedAt: new Date().toISOString(),
  };
}
