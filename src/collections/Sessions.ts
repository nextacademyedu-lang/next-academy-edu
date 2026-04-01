import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';
import { isGoogleCalendarEnabled } from '../lib/google-auth.ts';
import { createSessionEvent, deleteEvent } from '../lib/google-calendar.ts';

type SessionLike = {
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled' | null;
  isCancelled?: boolean | null;
  attendanceCount?: number | null;
  attendeesCount?: number | null;
};

function parseTimeToMinutes(value?: string | null): number | null {
  const raw = (value || '').trim();
  if (!raw) return null;

  const match12h = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(raw);
  if (match12h) {
    let hour = Number(match12h[1]);
    const minute = Number(match12h[2]);
    const period = match12h[3].toUpperCase();
    if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return null;
    }
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  }

  const match24h = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (match24h) {
    const hour = Number(match24h[1]);
    const minute = Number(match24h[2]);
    if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }
    return hour * 60 + minute;
  }

  return null;
}

function getSessionWindow(session: SessionLike): { startAt: number; endAt: number } | null {
  if (!session.date) return null;
  const parsedDate = new Date(session.date);
  if (Number.isNaN(parsedDate.getTime())) return null;

  const dayStart = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0, 0);
  const startMinutes = parseTimeToMinutes(session.startTime);
  const endMinutes = parseTimeToMinutes(session.endTime);

  if (startMinutes == null && endMinutes == null) {
    return {
      startAt: dayStart.getTime(),
      endAt: dayStart.getTime() + 24 * 60 * 60 * 1000 - 1,
    };
  }

  const safeStartMinutes = startMinutes ?? 0;
  let safeEndMinutes = endMinutes ?? safeStartMinutes + 60;
  if (safeEndMinutes <= safeStartMinutes) {
    safeEndMinutes = safeStartMinutes + 60;
  }

  return {
    startAt: dayStart.getTime() + safeStartMinutes * 60 * 1000,
    endAt: dayStart.getTime() + safeEndMinutes * 60 * 1000,
  };
}

function normalizeStatus(session: SessionLike): 'scheduled' | 'live' | 'completed' | 'cancelled' {
  if (session.isCancelled || session.status === 'cancelled') return 'cancelled';
  if (session.status === 'completed') return 'completed';

  const now = Date.now();
  const window = getSessionWindow(session);

  if (window) {
    if (now >= window.endAt) {
      return 'completed';
    }
    if (now >= window.startAt) {
      return 'live';
    }
    return 'scheduled';
  }

  const dateValue = session.date ? new Date(session.date).getTime() : Number.NaN;
  if (Number.isFinite(dateValue) && dateValue < now) {
    return 'completed';
  }

  if (session.status === 'live') return 'live';

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
