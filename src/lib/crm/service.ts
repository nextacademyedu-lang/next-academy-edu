import {
  mapBookingToCrmDeal,
  mapBulkSeatAllocationPatch,
  mapCompanyToCrm,
  mapConsultationToCrmDeal,
  mapLeadToCrm,
  mapPaymentToCrmDealPatch,
  mapUserToCrmContact,
  mapWaitlistPatch,
  makeEntityExternalId,
} from './mappers.ts';
import { TwentyClient } from './twenty-client.ts';
import type { CrmSyncEventDoc } from './types.ts';
import { isCrmEnabled, normalizeId, safeErrorMessage } from './utils.ts';

type PayloadLike = {
  findByID: (args: any) => Promise<any>;
  find: (args: any) => Promise<{ docs: any[] }>;
  update: (args: any) => Promise<any>;
};

interface ProcessEventResult {
  skipped: boolean;
  reason?: string;
  data?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

export class CRMService {
  private readonly payload: PayloadLike;
  private readonly client: TwentyClient;

  constructor(payload: PayloadLike, client: TwentyClient) {
    this.payload = payload;
    this.client = client;
  }

  static create(payload: PayloadLike): CRMService | null {
    if (!isCrmEnabled()) return null;

    const baseUrl = process.env.TWENTY_CRM_URL!;
    const apiKey = process.env.TWENTY_CRM_API_KEY!;
    const client = new TwentyClient({ baseUrl, apiKey });
    return new CRMService(payload, client);
  }

  async processEvent(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    switch (event.entityType) {
      case 'company':
        return this.syncCompany(event);
      case 'user':
        return this.syncUser(event);
      case 'user_profile':
        return this.syncUserProfile(event);
      case 'lead':
        return this.syncLead(event);
      case 'booking':
        return this.syncBooking(event);
      case 'payment':
        return this.syncPayment(event);
      case 'consultation_booking':
        return this.syncConsultationBooking(event);
      case 'bulk_seat_allocation':
        return this.syncBulkSeatAllocation(event);
      case 'waitlist':
        return this.syncWaitlist(event);
      default:
        return { skipped: true, reason: `Unsupported entity type: ${event.entityType}` };
    }
  }

  private async updateLocalCrmId(params: {
    collection: string;
    id: string;
    field: string;
    value: string;
  }): Promise<void> {
    const { collection, id, field, value } = params;
    if (!value) return;

    const doc = await this.payload.findByID({
      collection,
      id,
      depth: 0,
      overrideAccess: true,
    });
    if (!doc) return;

    const current = doc[field];
    if (typeof current === 'string' && current === value) return;

    await this.payload.update({
      collection,
      id,
      data: {
        [field]: value,
      },
      overrideAccess: true,
      context: {
        skipCrmSync: true,
        isCrmSyncWorker: true,
      },
    });
  }

  private async resolveUserProfile(userId: string): Promise<Record<string, unknown> | null> {
    const result = await this.payload.find({
      collection: 'user-profiles',
      where: {
        user: { equals: userId },
      },
      limit: 1,
      depth: 2,
      overrideAccess: true,
    });
    return result.docs[0] || null;
  }

  private async resolveCompanyFromProfile(profile: Record<string, unknown> | null): Promise<Record<string, unknown> | null> {
    if (!profile) return null;
    const companyValue = profile.company;
    const companyObj = asRecord(companyValue);
    if (companyObj) return companyObj;

    const companyId = normalizeId(companyValue);
    if (!companyId) return null;

    return await this.payload.findByID({
      collection: 'companies',
      id: companyId,
      depth: 1,
      overrideAccess: true,
    });
  }

  private async syncCompany(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const company = await this.payload.findByID({
      collection: 'companies',
      id: event.entityId,
      depth: 1,
      overrideAccess: true,
    });
    if (!company) return { skipped: true, reason: 'Company not found' };

    const payload = mapCompanyToCrm(company);
    const result = await this.client.upsert('companies', payload.externalId, payload);

    if (result.id) {
      await this.updateLocalCrmId({
        collection: 'companies',
        id: event.entityId,
        field: 'twentyCrmCompanyId',
        value: result.id,
      });
    }

    return { skipped: false, data: { companyId: result.id } };
  }

  private async syncUser(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const user = await this.payload.findByID({
      collection: 'users',
      id: event.entityId,
      depth: 1,
      overrideAccess: true,
      showHiddenFields: true,
    });
    if (!user) return { skipped: true, reason: 'User not found' };

    if (user.role === 'admin') {
      return { skipped: true, reason: 'Admin users are excluded from CRM sync' };
    }

    const profile = await this.resolveUserProfile(event.entityId);
    const company = await this.resolveCompanyFromProfile(profile);

    // Ensure company record exists before linking contact
    if (company && normalizeId(company.id)) {
      await this.syncCompany({
        ...event,
        entityType: 'company',
        entityId: normalizeId(company.id)!,
      });
    }

    const contactPayload = mapUserToCrmContact({ user, profile, company });
    const result = await this.client.upsert(
      'contacts',
      contactPayload.externalId,
      contactPayload,
    );

    if (result.id) {
      await this.updateLocalCrmId({
        collection: 'users',
        id: event.entityId,
        field: 'twentyCrmContactId',
        value: result.id,
      });
    }

    return { skipped: false, data: { contactId: result.id } };
  }

  private async syncUserProfile(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const profile = await this.payload.findByID({
      collection: 'user-profiles',
      id: event.entityId,
      depth: 2,
      overrideAccess: true,
    });
    if (!profile) return { skipped: true, reason: 'User profile not found' };

    const userId = normalizeId(profile.user);
    if (!userId) return { skipped: true, reason: 'Profile user id is missing' };

    return this.syncUser({
      ...event,
      entityType: 'user',
      entityId: userId,
    });
  }

  private async syncLead(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const lead = await this.payload.findByID({
      collection: 'leads',
      id: event.entityId,
      depth: 2,
      overrideAccess: true,
    });
    if (!lead) return { skipped: true, reason: 'Lead not found' };

    const leadPayload = mapLeadToCrm(lead);
    const result = await this.client.upsert('leads', leadPayload.externalId, leadPayload);

    if (result.id) {
      await this.updateLocalCrmId({
        collection: 'leads',
        id: event.entityId,
        field: 'twentyCrmLeadId',
        value: result.id,
      });
    }

    return { skipped: false, data: { leadId: result.id } };
  }

  private async syncBooking(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const booking = await this.payload.findByID({
      collection: 'bookings',
      id: event.entityId,
      depth: 3,
      overrideAccess: true,
    });
    if (!booking) return { skipped: true, reason: 'Booking not found' };

    const userId = normalizeId(booking.user);
    if (!userId) return { skipped: true, reason: 'Booking user id is missing' };

    await this.syncUser({
      ...event,
      entityType: 'user',
      entityId: userId,
    });

    const user = asRecord(booking.user) ||
      (await this.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 1,
        overrideAccess: true,
      }));

    const profile = await this.resolveUserProfile(userId);
    const company = await this.resolveCompanyFromProfile(profile);

    const dealPayload = mapBookingToCrmDeal({ booking, user, company });
    const result = await this.client.upsert('deals', dealPayload.externalId, dealPayload);

    if (result.id) {
      await this.updateLocalCrmId({
        collection: 'bookings',
        id: event.entityId,
        field: 'twentyCrmDealId',
        value: result.id,
      });
    }

    return { skipped: false, data: { dealId: result.id } };
  }

  private async syncPayment(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const payment = await this.payload.findByID({
      collection: 'payments',
      id: event.entityId,
      depth: 2,
      overrideAccess: true,
    });
    if (!payment) return { skipped: true, reason: 'Payment not found' };

    const bookingId = normalizeId(payment.booking);
    if (!bookingId) return { skipped: true, reason: 'Payment booking id is missing' };

    await this.syncBooking({
      ...event,
      entityType: 'booking',
      entityId: bookingId,
    });

    const booking = await this.payload.findByID({
      collection: 'bookings',
      id: bookingId,
      depth: 2,
      overrideAccess: true,
    });
    if (!booking) return { skipped: true, reason: 'Booking not found for payment sync' };

    const dealPatch = mapPaymentToCrmDealPatch({ payment, booking });
    const externalId = makeEntityExternalId('booking', bookingId);
    const result = await this.client.upsert('deals', externalId, {
      externalId,
      ...dealPatch,
    });

    if (result.id) {
      await this.updateLocalCrmId({
        collection: 'bookings',
        id: bookingId,
        field: 'twentyCrmDealId',
        value: result.id,
      });
    }

    return { skipped: false, data: { bookingId, dealId: result.id } };
  }

  private async syncConsultationBooking(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const consultation = await this.payload.findByID({
      collection: 'consultation-bookings',
      id: event.entityId,
      depth: 3,
      overrideAccess: true,
    });
    if (!consultation) return { skipped: true, reason: 'Consultation booking not found' };

    const userId = normalizeId(consultation.user);
    if (!userId) return { skipped: true, reason: 'Consultation user id is missing' };

    await this.syncUser({
      ...event,
      entityType: 'user',
      entityId: userId,
    });

    const user = asRecord(consultation.user) ||
      (await this.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 1,
        overrideAccess: true,
      }));
    const instructor = asRecord(consultation.instructor);
    const consultationType = asRecord(consultation.consultationType);
    const slot = asRecord(consultation.slot);

    const dealPayload = mapConsultationToCrmDeal({
      consultation,
      user,
      instructor,
      consultationType,
      slot,
    });
    const result = await this.client.upsert('deals', dealPayload.externalId, dealPayload);

    if (result.id) {
      await this.updateLocalCrmId({
        collection: 'consultation-bookings',
        id: event.entityId,
        field: 'twentyCrmDealId',
        value: result.id,
      });
    }

    return { skipped: false, data: { consultationDealId: result.id } };
  }

  private async syncBulkSeatAllocation(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const allocation = await this.payload.findByID({
      collection: 'bulk-seat-allocations',
      id: event.entityId,
      depth: 2,
      overrideAccess: true,
    });
    if (!allocation) return { skipped: true, reason: 'Bulk seat allocation not found' };

    const companyId = normalizeId(allocation.company);
    if (!companyId) return { skipped: true, reason: 'Allocation company id is missing' };

    const company = await this.payload.findByID({
      collection: 'companies',
      id: companyId,
      depth: 1,
      overrideAccess: true,
    });
    if (!company) return { skipped: true, reason: 'Company not found for bulk allocation sync' };

    await this.syncCompany({
      ...event,
      entityType: 'company',
      entityId: companyId,
    });

    const companyPayload = mapCompanyToCrm(company);
    const patch = mapBulkSeatAllocationPatch(allocation);
    const result = await this.client.upsert('companies', companyPayload.externalId, {
      ...companyPayload,
      ...patch,
    });

    if (result.id) {
      await this.updateLocalCrmId({
        collection: 'companies',
        id: companyId,
        field: 'twentyCrmCompanyId',
        value: result.id,
      });
    }

    return { skipped: false, data: { companyId, companyCrmId: result.id } };
  }

  private async syncWaitlist(event: CrmSyncEventDoc): Promise<ProcessEventResult> {
    const waitlist = await this.payload.findByID({
      collection: 'waitlist',
      id: event.entityId,
      depth: 2,
      overrideAccess: true,
    });
    if (!waitlist) return { skipped: true, reason: 'Waitlist entry not found' };

    const userId = normalizeId(waitlist.user);
    if (!userId) return { skipped: true, reason: 'Waitlist user id is missing' };

    await this.syncUser({
      ...event,
      entityType: 'user',
      entityId: userId,
    });

    const patch = mapWaitlistPatch(waitlist);
    const externalId = makeEntityExternalId('user', userId);
    const result = await this.client.upsert('contacts', externalId, {
      externalId,
      ...patch,
    });

    return { skipped: false, data: { userId, contactId: result.id } };
  }
}

export async function processCrmEventOrThrow(
  payload: PayloadLike,
  event: CrmSyncEventDoc,
): Promise<ProcessEventResult> {
  const service = CRMService.create(payload);
  if (!service) {
    return { skipped: true, reason: 'CRM is not configured' };
  }

  try {
    return await service.processEvent(event);
  } catch (error) {
    throw new Error(`[crm][service] ${safeErrorMessage(error)}`);
  }
}
