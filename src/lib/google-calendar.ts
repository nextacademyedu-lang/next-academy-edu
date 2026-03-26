/**
 * Google Calendar Service
 *
 * Creates Calendar events with Google Meet links, manages attendees.
 * Used by Payload hooks to auto-invite/revoke students.
 */

import { google, type calendar_v3 } from 'googleapis';
import { getAuthClient, isGoogleCalendarEnabled } from './google-auth.ts';

function getCalendarClient(): calendar_v3.Calendar | null {
  const auth = getAuthClient();
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
}

export interface EventResult {
  eventId: string;
  meetingUrl: string | null;
}

// ─────────────────────────────────────────────
// Core operations
// ─────────────────────────────────────────────

/**
 * Create a Calendar event with an auto-generated Google Meet link.
 * Returns the event ID and meeting URL.
 */
export async function createSessionEvent(params: CreateEventParams): Promise<EventResult | null> {
  const calendar = getCalendarClient();
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
          requestId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
export async function addAttendee(eventId: string, email: string): Promise<void> {
  const calendar = getCalendarClient();
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
export async function removeAttendee(eventId: string, email: string): Promise<void> {
  const calendar = getCalendarClient();
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
): Promise<void> {
  for (const eventId of eventIds) {
    try {
      await removeAttendee(eventId, email);
    } catch (err) {
      // Log but don't fail the whole operation for one event
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
): Promise<void> {
  for (const eventId of eventIds) {
    try {
      await addAttendee(eventId, email);
    } catch (err) {
      console.error(`[Google Calendar] Failed to add ${email} to event ${eventId}:`, err);
    }
  }
}

/**
 * Delete a Calendar event. Used when a session is deleted.
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient();
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
