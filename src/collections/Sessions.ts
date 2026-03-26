import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';
import { isGoogleCalendarEnabled } from '../lib/google-auth.ts';
import { createSessionEvent, deleteEvent } from '../lib/google-calendar.ts';

type SessionLike = {
  date?: string | null;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled' | null;
  isCancelled?: boolean | null;
  attendanceCount?: number | null;
  attendeesCount?: number | null;
};

function normalizeStatus(session: SessionLike): 'scheduled' | 'live' | 'completed' | 'cancelled' {
  if (session.status) return session.status;
  if (session.isCancelled) return 'cancelled';

  const dateValue = session.date ? new Date(session.date).getTime() : null;
  if (dateValue && !Number.isNaN(dateValue) && dateValue < Date.now()) {
    return 'completed';
  }

  return 'scheduled';
}

function normalizeAttendanceCount(session: SessionLike): number {
  if (typeof session.attendanceCount === 'number' && Number.isFinite(session.attendanceCount)) {
    return session.attendanceCount;
  }
  if (typeof session.attendeesCount === 'number' && Number.isFinite(session.attendeesCount)) {
    return session.attendeesCount;
  }
  return 0;
}

function normalizeRelationId(value: unknown): number | string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value.trim();
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const nested = (value as { id?: unknown }).id;
    if (typeof nested === 'number' && Number.isFinite(nested)) return nested;
    if (typeof nested === 'string' && nested.trim().length > 0) {
      const numeric = Number(nested);
      return Number.isFinite(numeric) ? numeric : nested.trim();
    }
  }
  return null;
}



export const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: { useAsTitle: 'title' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const next = { ...(data || {}) } as SessionLike;
        const prev = (originalDoc || {}) as SessionLike;

        if (next.status === 'cancelled') {
          next.isCancelled = true;
        } else if (next.isCancelled === true && !next.status) {
          next.status = 'cancelled';
        }

        const merged = { ...prev, ...next } as SessionLike;
        const status = normalizeStatus(merged);
        next.status = status;

        const attendanceCount = normalizeAttendanceCount(merged);
        next.attendanceCount = attendanceCount;
        next.attendeesCount = attendanceCount;

        return next;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Auto-create Google Calendar event for new sessions
        if (operation !== 'create') return doc;
        if (!isGoogleCalendarEnabled()) return doc;
        if ((doc as any).googleEventId) return doc; // already linked

        try {
          const result = await createSessionEvent({
            title: (doc as any).title || 'Session',
            description: (doc as any).description || '',
            date: (doc as any).date,
            startTime: (doc as any).startTime,
            endTime: (doc as any).endTime,
          });

          if (result) {
            // Patch the session with event ID + meeting URL
            await req.payload.update({
              collection: 'sessions',
              id: (doc as any).id,
              data: {
                googleEventId: result.eventId,
                meetingUrl: result.meetingUrl || (doc as any).meetingUrl || '',
              } as any, // googleEventId added at runtime; types updated after next importmap generation
              overrideAccess: true,
              req,
            });
          }
        } catch (err) {
          console.error('[Sessions] Failed to create Google Calendar event:', err);
        }

        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        try {
          const eventId = (doc as any)?.googleEventId;
          if (eventId && isGoogleCalendarEnabled()) {
            await deleteEvent(eventId);
          }
        } catch (err) {
          console.error('[Sessions] Failed to delete Google Calendar event (non-blocking):', err);
        }
      },
    ],

    afterRead: [
      ({ doc }) => {
        const current = (doc || {}) as SessionLike;
        const status = normalizeStatus(current);
        const attendanceCount = normalizeAttendanceCount(current);

        return {
          ...doc,
          status,
          attendanceCount,
          attendeesCount: attendanceCount,
          isCancelled: status === 'cancelled',
        };
      },
    ],
  },
  fields: [
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'sessionNumber', type: 'number', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'date', type: 'date', required: true },
    { name: 'startTime', type: 'text', required: true },
    { name: 'endTime', type: 'text', required: true },
    {
      name: 'locationType',
      type: 'select',
      options: ['online', 'in-person', 'hybrid'],
      defaultValue: 'online',
    },
    { name: 'locationName', type: 'text' },
    { name: 'locationAddress', type: 'text' },
    { name: 'meetingUrl', type: 'text' },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors' },
    { name: 'recordingUrl', type: 'text' },
    { name: 'materials', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'status',
      type: 'select',
      options: ['scheduled', 'live', 'completed', 'cancelled'],
      defaultValue: 'scheduled',
    },
    { name: 'isCancelled', type: 'checkbox', defaultValue: false },
    { name: 'cancellationReason', type: 'textarea' },
    { name: 'attendanceCount', type: 'number', defaultValue: 0 },
    { name: 'attendeesCount', type: 'number', defaultValue: 0 },
    { name: 'googleEventId', type: 'text', admin: { readOnly: true, description: 'Google Calendar event ID (auto-set)' } },
  ],
};
