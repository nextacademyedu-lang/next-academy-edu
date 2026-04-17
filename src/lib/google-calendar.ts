/**
 * Google Calendar Service
 *
 * Used for both Admin system Calendar events (sessions) and
 * Native Instructor Booking engine (fetching Free/Busy, creating bookings).
 */

import { google, type calendar_v3 } from 'googleapis';
import { getAdminAuthClient, getUserAuthClient } from './google-auth';

function getCalendarClient(refreshToken?: string | null): calendar_v3.Calendar | null {
  const auth = refreshToken ? getUserAuthClient(refreshToken) : getAdminAuthClient();
  if (!auth) return null;
  return google.calendar({ version: 'v3', auth });
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CreateEventParams {
  title: string;
  description?: string;
  date: string;          // ISO date "2025-06-15"
  startTime: string;     // "10:00"
  endTime: string;       // "12:00"
  timezone?: string;     // "Africa/Cairo"
  attendeeEmails?: string[];
  refreshToken?: string | null; // Pass to use specific user's calendar, otherwise uses Admin
}

export interface EventResult {
  eventId: string;
  meetingUrl: string | null;
}

// ─────────────────────────────────────────────
// Core operations
// ─────────────────────────────────────────────

/**
 * Check Free/Busy for a specific time range.
 * Returns an array of busy periods, or an empty array if completely free.
 */
export async function getFreeBusy(
  timeMin: string, // ISO datetime
  timeMax: string, // ISO datetime
  refreshToken: string, // REQUIRED: Instructor's refresh token
  calendarId: string = 'primary',
): Promise<{ start: string; end: string }[]> {
  const calendar = getCalendarClient(refreshToken);
  if (!calendar) throw new Error('Missing Google Calendar authorization client.');

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  });

  const calendars = res.data.calendars || {};
  return calendars[calendarId]?.busy || [];
}

/**
 * Create a Calendar event with an auto-generated Google Meet link.
 * Returns the event ID and meeting URL.
 */
export async function createSessionEvent(params: CreateEventParams): Promise<EventResult | null> {
  const calendar = getCalendarClient(params.refreshToken);
  if (!calendar) return null;

  const tz = params.timezone || 'Africa/Cairo';

  // Build datetime strings: "2025-06-15T10:00:00"
  const dateOnly = params.date.split('T')[0]; // handle both ISO and date strings
  const startDateTime = `${dateOnly}T${params.startTime}:00`;
  const endDateTime = `${dateOnly}T${params.endTime}:00`;

  const attendees = (params.attendeeEmails || []).map((email) => ({ email }));

  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary: params.title,
      description: params.description || '',
      start: { dateTime: startDateTime, timeZone: tz },
      end: { dateTime: endDateTime, timeZone: tz },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    },
  });

  const meetingUrl = event.data.conferenceData?.entryPoints?.find(
    (ep) => ep.entryPointType === 'video',
  )?.uri ?? null;

  return {
    eventId: event.data.id || '',
    meetingUrl,
  };
}

/**
 * Add an attendee to an existing Calendar event.
 */
export async function addAttendee(eventId: string, email: string, refreshToken?: string | null): Promise<void> {
  const calendar = getCalendarClient(refreshToken);
  if (!calendar) return;

  const existing = await calendar.events.get({
    calendarId: 'primary',
    eventId,
  });

  const currentAttendees = existing.data.attendees || [];

  // Don't add duplicates
  if (currentAttendees.some((a) => a.email?.toLowerCase() === email.toLowerCase())) {
    return;
  }

  await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    sendUpdates: 'all',
    requestBody: {
      attendees: [...currentAttendees, { email }],
    },
  });
}

/**
 * Remove an attendee from an existing Calendar event.
 */
export async function removeAttendee(eventId: string, email: string, refreshToken?: string | null): Promise<void> {
  const calendar = getCalendarClient(refreshToken);
  if (!calendar) return;

  const existing = await calendar.events.get({
    calendarId: 'primary',
    eventId,
  });

  const currentAttendees = existing.data.attendees || [];
  const filtered = currentAttendees.filter(
    (a) => a.email?.toLowerCase() !== email.toLowerCase(),
  );

  // Nothing to remove
  if (filtered.length === currentAttendees.length) return;

  await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    sendUpdates: 'all',
    requestBody: {
      attendees: filtered,
    },
  });
}

/**
 * Remove an attendee from multiple Calendar events at once.
 * Used on booking cancellation/refund.
 */
export async function removeAttendeeFromAllEvents(
  eventIds: string[],
  email: string,
  refreshToken?: string | null,
): Promise<void> {
  for (const eventId of eventIds) {
    try {
      await removeAttendee(eventId, email, refreshToken);
    } catch (err) {
      console.error(`[Google Calendar] Failed to remove ${email} from event ${eventId}:`, err);
    }
  }
}

/**
 * Add an attendee to multiple Calendar events at once.
 * Used on booking confirmation.
 */
export async function addAttendeeToAllEvents(
  eventIds: string[],
  email: string,
  refreshToken?: string | null,
): Promise<void> {
  for (const eventId of eventIds) {
    try {
      await addAttendee(eventId, email, refreshToken);
    } catch (err) {
      console.error(`[Google Calendar] Failed to add ${email} to event ${eventId}:`, err);
    }
  }
}

/**
 * Delete a Calendar event. Used when a session is deleted.
 */
export async function deleteEvent(eventId: string, refreshToken?: string | null): Promise<void> {
  const calendar = getCalendarClient(refreshToken);
  if (!calendar) return;

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  } catch (err) {
    console.error(`[Google Calendar] Failed to delete event ${eventId}:`, err);
  }
}
