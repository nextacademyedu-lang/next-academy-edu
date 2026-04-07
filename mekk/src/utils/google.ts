import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';

const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`
        : 'http://localhost:3000/api/auth/google/callback';

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export async function getGoogleTokens() {
    const supabase = await createClient();
    const { data } = await supabase.from('settings').select('value').eq('key', 'google_calendar_tokens').single();
    return data?.value || null;
}

export async function setGoogleTokens(tokens: any) {
    const supabase = await createClient();
    // Upsert the tokens into the settings table
    await supabase.from('settings').upsert({ key: 'google_calendar_tokens', value: tokens });
}

export async function getAuthenticatedCalendar() {
    const tokens = await getGoogleTokens();
    if (!tokens) return null;

    const oAuth2Client = getOAuth2Client();
    oAuth2Client.setCredentials(tokens);

    // You can optionally add logic to refresh the token if it's expired,
    // but googleapis usually handles it automatically if a refresh_token is present.

    return google.calendar({ version: 'v3', auth: oAuth2Client });
}

export function getAuthUrl() {
    const oAuth2Client = getOAuth2Client();
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline', // Required to get a refresh token
        prompt: 'consent', // Force consent screen to guarantee getting a refresh token
        scope: [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly'
        ]
    });
}

export async function authorizeWithCode(code: string) {
    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);

    // If we don't get a refresh token, but we already have one saved, keep the old refresh token
    const existingTokens = await getGoogleTokens();
    if (!tokens.refresh_token && existingTokens?.refresh_token) {
        tokens.refresh_token = existingTokens.refresh_token;
    }

    await setGoogleTokens(tokens);
    return tokens;
}

export async function checkCalendarConflicts(dateStr: string, timeSlots: string[], durationMinutes: number): Promise<string[]> {
    const calendar = await getAuthenticatedCalendar();
    if (!calendar) return timeSlots; // If not connected, assume all slots are free (or handle gracefully)

    const freeSlots = [...timeSlots];

    try {
        // Query a wide UTC window (full day ±1 day) to handle any timezone offset
        // so we don't miss events near midnight boundaries
        const timeMin = new Date(`${dateStr}T00:00:00+02:00`); // Cairo UTC+2
        const timeMax = new Date(`${dateStr}T23:59:59+02:00`); // Cairo UTC+2

        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                items: [{ id: 'primary' }],
            }
        });

        const busyIntervals = response.data.calendars?.['primary']?.busy || [];

        // Check each slot against busy intervals.
        // Parse slot times as Cairo time (UTC+2) so comparison with UTC busy intervals is correct.
        for (const slot of timeSlots) {
            const slotStart = new Date(`${dateStr}T${slot}:00+02:00`); // Cairo local time → UTC
            const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

            for (const busy of busyIntervals) {
                const busyStart = new Date(busy.start!); // already UTC from Google
                const busyEnd = new Date(busy.end!);     // already UTC from Google

                // Conflict exists if: slot starts before busy ends AND slot ends after busy starts
                if (slotStart < busyEnd && slotEnd > busyStart) {
                    const index = freeSlots.indexOf(slot);
                    if (index > -1) {
                        freeSlots.splice(index, 1);
                    }
                }
            }
        }
    } catch (e) {
        console.error('Failed to query Google Calendar freebusy', e);
        // Fallback: return all slots if calendar check fails
    }

    return freeSlots;
}

export async function createGoogleCalendarEvent(eventDetails: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    clientEmail: string;
}) {
    const calendar = await getAuthenticatedCalendar();
    if (!calendar) {
        return null;
    }

    try {
        const event = await calendar.events.insert({
            calendarId: 'primary',
            conferenceDataVersion: 1, // Required to create Google Meet link
            requestBody: {
                summary: eventDetails.title,
                description: eventDetails.description,
                start: {
                    dateTime: eventDetails.startTime.toISOString(),
                },
                end: {
                    dateTime: eventDetails.endTime.toISOString(),
                },
                attendees: [
                    { email: eventDetails.clientEmail }
                ],
                conferenceData: {
                    createRequest: {
                        requestId: `booking-${Date.now()}`, // Unique ID for the meeting
                        conferenceSolutionKey: {
                            type: 'hangoutsMeet'
                        }
                    }
                }
            }
        });

        return event.data;
    } catch (e: any) {
        console.error('Failed to create Google Calendar event', e);
        throw e;
    }
}
