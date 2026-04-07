import { NextResponse } from 'next/server';

export async function GET() {
    const results: Record<string, any> = {};

    // 1. Test Google Calendar
    try {
        const { getAuthenticatedCalendar } = await import('@/utils/google');
        const calendar = await getAuthenticatedCalendar();
        if (!calendar) {
            results.google = { status: 'FAIL', error: 'Not authenticated - no tokens' };
        } else {
            // Try listing 1 event to verify auth works
            const events = await calendar.events.list({
                calendarId: 'primary',
                maxResults: 1,
                timeMin: new Date().toISOString(),
            });
            results.google = {
                status: 'OK',
                calendarAccess: true,
                nextEvent: events.data.items?.[0]?.summary || 'No upcoming events',
            };
        }
    } catch (e: any) {
        results.google = { status: 'ERROR', error: e.message, code: e.code };
    }

    // 2. Test Resend
    try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        if (!process.env.RESEND_API_KEY) {
            results.email = { status: 'FAIL', error: 'RESEND_API_KEY not set' };
        } else {
            // Just verify the API key works by listing domains
            const domains = await resend.domains.list();
            results.email = {
                status: 'OK',
                apiKeyValid: true,
                domains: domains.data?.data?.map((d: any) => d.name) || [],
            };
        }
    } catch (e: any) {
        results.email = { status: 'ERROR', error: e.message };
    }

    return NextResponse.json(results);
}
