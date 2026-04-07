'use server'

import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'
import { BookingConfirmation } from '@/emails/BookingConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getAvailableSlots(dateStr: string, durationMinutes: number, eventTypeId?: string) {
    const supabase = await createClient();
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    // 0. Fetch event type settings if provided (for buffer/limits/increments)
    let bufferBefore = 0, bufferAfter = 0, maxPerDay: number | null = null, increment = 30, minNoticeHours = 0;
    if (eventTypeId) {
        const { data: et } = await supabase.from('event_types').select('buffer_before, buffer_after, max_per_day, start_time_increment, min_notice_hours').eq('id', eventTypeId).single();
        if (et) {
            bufferBefore = et.buffer_before || 0;
            bufferAfter = et.buffer_after || 0;
            maxPerDay = et.max_per_day;
            increment = et.start_time_increment || 30;
            minNoticeHours = et.min_notice_hours || 0;
        }
    }

    // 0.5 Check for date overrides
    const { data: overrides } = await supabase.from('availability_overrides').select('*').eq('date', dateStr);
    let useOverride = false;
    let overrideSlots: any[] = [];
    if (overrides && overrides.length > 0) {
        useOverride = true;
        overrideSlots = overrides[0].slots || [];
        if (overrideSlots.length === 0) return []; // Date marked as unavailable
    }

    // 1. Get availability for this day (or override)
    let segments: { start_time: string; end_time: string }[] = [];
    if (useOverride) {
        segments = overrideSlots.map((s: any) => ({ start_time: s.start, end_time: s.end }));
    } else {
        const { data: availabilities } = await supabase.from('availability').select('*').eq('day_of_week', dayOfWeek);
        if (!availabilities || availabilities.length === 0) return [];
        segments = availabilities.map(a => ({ start_time: a.start_time, end_time: a.end_time }));
    }

    // 2. Generate all possible slots
    const slots: string[] = [];
    const now = new Date();
    const minNoticeTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);

    for (const seg of segments) {
        let currentTime = new Date(`${dateStr}T${seg.start_time}`);
        const endTime = new Date(`${dateStr}T${seg.end_time}`);

        while (currentTime.getTime() + durationMinutes * 60000 <= endTime.getTime()) {
            const timeString = currentTime.toTimeString().substring(0, 5);
            const passesNotice = currentTime > minNoticeTime;
            if (passesNotice && !slots.includes(timeString)) {
                slots.push(timeString);
            }
            currentTime = new Date(currentTime.getTime() + increment * 60000);
        }
    }

    slots.sort();

    // 2.5 Filter Google Calendar conflicts
    // Using a separate variable instead of mutating slots (mutation via length=0/push is broken in server action)
    let filteredSlots: string[] = [...slots];
    try {
        const { checkCalendarConflicts } = await import('@/utils/google');
        filteredSlots = await checkCalendarConflicts(dateStr, slots, durationMinutes);
    } catch (e) {
        console.error("Google Calendar conflict check failed, continuing without it.", e);
    }

    // 3. Fetch existing local bookings
    const { data: bookings } = await supabase.from('bookings').select('start_time, end_time').eq('booking_date', dateStr);

    if (!bookings || bookings.length === 0) {
        if (maxPerDay !== null && maxPerDay <= 0) return [];
        return filteredSlots;
    }



    // Check max_per_day
    if (maxPerDay !== null) {
        const eventBookings = eventTypeId
            ? (await supabase.from('bookings').select('id').eq('booking_date', dateStr).eq('event_type_id', eventTypeId)).data?.length || 0
            : bookings.length;
        if (eventBookings >= maxPerDay) return [];
    }

    // 4. Filter overlapping (with buffer support)
    const availableSlots = slots.filter(slot => {
        const slotStart = new Date(`${dateStr}T${slot}:00`);
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
        const bufferedStart = new Date(slotStart.getTime() - bufferBefore * 60000);
        const bufferedEnd = new Date(slotEnd.getTime() + bufferAfter * 60000);

        for (const booking of bookings) {
            const bookingStart = new Date(`${dateStr}T${booking.start_time}`);
            const bookingEnd = new Date(`${dateStr}T${booking.end_time}`);

            if (
                (bufferedStart >= bookingStart && bufferedStart < bookingEnd) ||
                (bufferedEnd > bookingStart && bufferedEnd <= bookingEnd) ||
                (bufferedStart <= bookingStart && bufferedEnd >= bookingEnd)
            ) {
                return false;
            }
        }
        return true;
    });

    return availableSlots;
}

export async function submitBooking(formData: FormData) {
    const event_type_id = formData.get('event_type_id') as string;
    const booking_date = formData.get('date') as string;
    const start_time = formData.get('time') as string;
    const duration_minutes = parseInt(formData.get('duration_minutes') as string);

    // Support both old (name) and new (first_name + last_name) forms
    const firstName = formData.get('first_name') as string || '';
    const lastName = formData.get('last_name') as string || '';
    const client_name = (formData.get('name') as string) || `${firstName} ${lastName}`.trim();
    const client_email = formData.get('email') as string;
    const notes = formData.get('notes') as string;

    // Calculate end time
    const startDate = new Date(`${booking_date}T${start_time}:00`);
    const endDate = new Date(startDate.getTime() + duration_minutes * 60000);
    const end_time = endDate.toTimeString().substring(0, 8);

    const supabase = await createClient();

    // Verify slot is still available
    const availableSlots = await getAvailableSlots(booking_date, duration_minutes, event_type_id);
    if (!availableSlots.includes(start_time.substring(0, 5))) {
        return { error: 'Sorry, this time slot was just booked by someone else. Please select another.' };
    }

    // Fetch event type for title
    const { data: eventType } = await supabase.from('event_types').select('title, description').eq('id', event_type_id).single();

    // Build custom answers from questions
    const answers: Record<string, string> = {};
    if (notes) answers.notes = notes;
    // Collect custom question answers
    for (const [key, val] of formData.entries()) {
        if (key.startsWith('question_')) {
            answers[key] = val as string;
        }
    }

    // Create Google Calendar Event
    let meeting_link = 'Not generated yet';
    try {
        const { createGoogleCalendarEvent } = await import('@/utils/google');
        const googleEvent = await createGoogleCalendarEvent({
            title: `${eventType?.title || 'Meeting'} with ${client_name}`,
            description: `Booked via website.\nAnswers: ${JSON.stringify(answers)}`,
            startTime: startDate,
            endTime: endDate,
            clientEmail: client_email
        });
        if (googleEvent?.hangoutLink) meeting_link = googleEvent.hangoutLink;
        else if (googleEvent?.htmlLink) meeting_link = googleEvent.htmlLink;
    } catch (e: any) {
        console.error("Failed to create Google Calendar event", e);
    }

    // Insert booking
    const { error } = await supabase.from('bookings').insert([{
        event_type_id,
        booking_date,
        start_time: `${start_time}:00`,
        end_time,
        client_name,
        client_email,
        custom_answers: answers,
        payment_status: 'pending',
        meeting_link
    }]);

    if (error) {
        console.error('Booking insertion error:', error);
        return { error: 'There was an issue processing your booking.' };
    }

    // Send confirmation email
    try {
        const { render } = await import('@react-email/render');
        const emailHtml = await render(BookingConfirmation({
            name: client_name,
            date: booking_date,
            time: start_time,
            meetLink: meeting_link
        }));

        await resend.emails.send({
            from: 'Muhammed Mekky <contact@muhammedmekky.com>',
            to: client_email,
            subject: `Booking Confirmed — ${eventType?.title || 'Meeting'}`,
            html: emailHtml
        });
    } catch (emailError: any) {
        console.error('Failed to send booking confirmation email:', emailError);
    }

    return { success: true };
}
