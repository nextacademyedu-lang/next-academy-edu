/**
 * B2B Manager Notification Helpers
 *
 * Non-blocking notification dispatch for B2B-related events.
 * Always wrapped in try/catch at call sites — failures never break core flows.
 */

type PayloadClient = {
  find: (args: Record<string, unknown>) => Promise<{
    docs: Array<Record<string, unknown>>;
    totalDocs: number;
    totalPages: number;
  }>;
  create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export type B2BNotificationType =
  | 'b2b_member_booked'
  | 'b2b_member_cancelled'
  | 'b2b_invitation_accepted'
  | 'b2b_seats_low'
  | 'b2b_budget_threshold'
  | 'b2b_member_joined'
  | 'b2b_member_removed';

function resolveId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const idValue = (value as { id?: unknown }).id;
    if (typeof idValue === 'number') return idValue;
    if (typeof idValue === 'string') {
      const parsed = Number(idValue);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

/**
 * Finds all B2B manager user IDs for a given company.
 */
async function findCompanyManagerIds(
  payload: PayloadClient,
  companyId: number,
): Promise<number[]> {
  // Find profiles linked to this company
  const profilesResult = await payload.find({
    collection: 'user-profiles',
    where: { company: { equals: companyId } },
    depth: 1,
    limit: 200,
    overrideAccess: true,
  });

  const managerIds: number[] = [];

  for (const profile of profilesResult.docs as Array<{ user?: unknown }>) {
    const userRelation = profile.user;
    if (!userRelation || typeof userRelation !== 'object') continue;

    const user = userRelation as { id?: unknown; role?: string | null };
    if (user.role !== 'b2b_manager') continue;

    const userId = resolveId(user.id);
    if (userId) managerIds.push(userId);
  }

  return managerIds;
}

/**
 * Sends a notification to all B2B managers of a company.
 * Non-blocking — failures are logged but never thrown.
 */
export async function notifyB2BManagers(
  payload: PayloadClient,
  params: {
    companyId: number;
    type: B2BNotificationType;
    title: string;
    message: string;
    actionUrl?: string;
  },
): Promise<void> {
  const { companyId, type, title, message, actionUrl } = params;

  const managerIds = await findCompanyManagerIds(payload, companyId);
  if (managerIds.length === 0) return;

  const createPromises = managerIds.map((userId) =>
    payload
      .create({
        collection: 'notifications',
        data: {
          user: userId,
          type,
          title,
          message,
          ...(actionUrl ? { actionUrl } : {}),
          isRead: false,
        },
        overrideAccess: true,
      })
      .catch((err: unknown) => {
        console.error(
          `[b2b-notifications] Failed to create notification for user ${userId}:`,
          err,
        );
      }),
  );

  await Promise.allSettled(createPromises);
}

// ─── Specific notification shortcuts ────────────────────────────

export async function notifyMemberBooked(
  payload: PayloadClient,
  params: {
    companyId: number;
    memberName: string;
    programTitle: string;
  },
): Promise<void> {
  await notifyB2BManagers(payload, {
    companyId: params.companyId,
    type: 'b2b_member_booked',
    title: 'New Booking',
    message: `${params.memberName} booked "${params.programTitle}"`,
    actionUrl: '/b2b/bookings',
  });
}

export async function notifyMemberCancelled(
  payload: PayloadClient,
  params: {
    companyId: number;
    memberName: string;
    programTitle: string;
  },
): Promise<void> {
  await notifyB2BManagers(payload, {
    companyId: params.companyId,
    type: 'b2b_member_cancelled',
    title: 'Booking Cancelled',
    message: `${params.memberName} cancelled "${params.programTitle}"`,
    actionUrl: '/b2b/bookings',
  });
}

export async function notifyInvitationAccepted(
  payload: PayloadClient,
  params: {
    companyId: number;
    memberName: string;
    memberEmail: string;
  },
): Promise<void> {
  await notifyB2BManagers(payload, {
    companyId: params.companyId,
    type: 'b2b_invitation_accepted',
    title: 'Invitation Accepted',
    message: `${params.memberName} (${params.memberEmail}) joined the team`,
    actionUrl: '/b2b/team',
  });
}

export async function notifySeatsLow(
  payload: PayloadClient,
  params: {
    companyId: number;
    remaining: number;
    total: number;
  },
): Promise<void> {
  await notifyB2BManagers(payload, {
    companyId: params.companyId,
    type: 'b2b_seats_low',
    title: 'Seats Running Low',
    message: `Only ${params.remaining} of ${params.total} seats remaining`,
    actionUrl: '/b2b/seats',
  });
}

export async function notifyBudgetThreshold(
  payload: PayloadClient,
  params: {
    companyId: number;
    spent: number;
    limit: number;
    percentage: number;
  },
): Promise<void> {
  await notifyB2BManagers(payload, {
    companyId: params.companyId,
    type: 'b2b_budget_threshold',
    title: 'Budget Alert',
    message: `Monthly spending reached ${params.percentage}% (${params.spent} / ${params.limit} EGP)`,
    actionUrl: '/b2b/dashboard',
  });
}

export async function notifyMemberJoined(
  payload: PayloadClient,
  params: {
    companyId: number;
    memberName: string;
  },
): Promise<void> {
  await notifyB2BManagers(payload, {
    companyId: params.companyId,
    type: 'b2b_member_joined',
    title: 'New Team Member',
    message: `${params.memberName} has been added to the team`,
    actionUrl: '/b2b/team',
  });
}

export async function notifyMemberRemoved(
  payload: PayloadClient,
  params: {
    companyId: number;
    memberName: string;
  },
): Promise<void> {
  await notifyB2BManagers(payload, {
    companyId: params.companyId,
    type: 'b2b_member_removed',
    title: 'Team Member Removed',
    message: `${params.memberName} has been removed from the team`,
    actionUrl: '/b2b/team',
  });
}
