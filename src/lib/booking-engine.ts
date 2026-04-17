import { getPayload } from 'payload';
import config from '@payload-config';
import { getFreeBusy } from './google-calendar';
import { addMinutes, addDays, startOfDay, endOfDay, isBefore, isAfter, parseISO, format, parse } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export interface BookingSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isoStart: string;  // Full ISO
  isoEnd: string;    // Full ISO
  available: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  slots: BookingSlot[];
}

export async function calculateAvailability(
  consultationTypeId: string,
  startDateStr: string, // YYYY-MM-DD
  daysToFetch: number = 7,
  clientTimezone: string = 'Africa/Cairo'
): Promise<DayAvailability[]> {
  const payload = await getPayload({ config });

  // 1. Fetch Consultation Type & Instructor
  const consultationType = await payload.findByID({
    collection: 'consultation-types',
    id: consultationTypeId,
    depth: 1, // Get instructor
  });

  if (!consultationType || !consultationType.isActive) {
    throw new Error('Consultation type is not available.');
  }

  const instructor = typeof consultationType.instructor === 'object' ? consultationType.instructor : null;
  if (!instructor) {
    throw new Error('Instructor not found.');
  }

  // Find User record for the instructor to get Google Auth
  const users = await payload.find({
    collection: 'users',
    where: {
      instructorId: { equals: instructor.id },
    },
    depth: 0,
    limit: 1,
  });

  const instructorUser = users.docs[0];
  const googleRefreshToken = instructorUser?.googleRefreshToken;

  if (!googleRefreshToken) {
    throw new Error('Instructor has not connected their Google Calendar.');
  }

  // 2. Setup Boundaries
  const duration = consultationType.durationMinutes || 30;
  const bufferBefore = consultationType.bufferBefore || 0;
  const bufferAfter = consultationType.bufferAfter || 0;
  const increment = consultationType.startTimeIncrement || 30;
  const maxPerDay = consultationType.maxPerDay || 999;
  const availableDaysTokens = (consultationType.availableDays as string[]) || [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const minNoticeHours = consultationType.minNoticeHours || 24;

  const now = new Date();
  const noticeBoundary = addMinutes(now, minNoticeHours * 60);

  // Define generation window
  const startDate = parseISO(startDateStr);
  const endDate = addDays(startDate, daysToFetch - 1);
  const timeMin = startOfDay(startDate).toISOString();
  const timeMax = endOfDay(endDate).toISOString();

  // 3. Fetch Google Calendar Free/Busy
  let busyPeriods: { start: string; end: string }[] = [];
  try {
    busyPeriods = await getFreeBusy(timeMin, timeMax, googleRefreshToken, instructorUser.googleCalendarEmail || 'primary');
  } catch (err) {
    console.error('[Booking Engine] Failed to fetch Google Free/Busy:', err);
    // If it fails, assume no Google blocks or throw. For strictness, let's throw to prevent double booking.
    throw new Error('Cannot sync with instructor calendar at this moment.');
  }

  // 4. Fetch platform's own Confirmed/Pending bookings to enforce maxPerDay limits
  // (Google Free/Busy only gives us blocked times, but we also need to count HOW MANY bookings of *this* type occurred today)
  const existingBookings = await payload.find({
    collection: 'consultation-bookings',
    where: {
      and: [
        { instructor: { equals: instructor.id } },
        { consultationType: { equals: consultationTypeId } }, // limit to this type if maxPerDay is per-type
        { bookingDate: { greater_than_equal: startOfDay(startDate).toISOString() } },
        { bookingDate: { less_than_equal: endOfDay(endDate).toISOString() } },
        { status: { in: ['pending', 'confirmed'] } },
      ]
    },
    pagination: false,
  });

  // Calculate booking counts per day
  const bookingsPerDay: Record<string, number> = {};
  existingBookings.docs.forEach(b => {
    const dStr = typeof b.bookingDate === 'string' ? b.bookingDate.split('T')[0] : '';
    if (dStr) {
      bookingsPerDay[dStr] = (bookingsPerDay[dStr] || 0) + 1;
    }
  });

  // 5. Generate Time Slots
  const availability: DayAvailability[] = [];

  // Configured default working hours (could be parameterized later)
  const workingHourStart = 9;  // 09:00 AM
  const workingHourEnd = 17;   // 05:00 PM

  for (let i = 0; i < daysToFetch; i++) {
    const currentDay = addDays(startDate, i);
    const currentDayStr = format(currentDay, 'yyyy-MM-dd');
    const dayOfWeekName = format(currentDay, 'EEEE'); // e.g., 'Monday'

    const slots: BookingSlot[] = [];

    // Check if day is allowed by `availableDays`
    if (!availableDaysTokens.includes(dayOfWeekName)) {
      availability.push({ date: currentDayStr, slots: [] });
      continue;
    }

    // Check maxPerDay limit
    if ((bookingsPerDay[currentDayStr] || 0) >= maxPerDay) {
      availability.push({ date: currentDayStr, slots: [] }); // Limit reached
      continue;
    }

    // Generate slots for the working day
    let currentSlotStart = new Date(currentDay);
    currentSlotStart.setHours(workingHourStart, 0, 0, 0);

    const endOfWorkingDay = new Date(currentDay);
    endOfWorkingDay.setHours(workingHourEnd, 0, 0, 0);

    while (isBefore(currentSlotStart, endOfWorkingDay)) {
      const slotEnd = addMinutes(currentSlotStart, duration);
      
      // Stop if slot exceeds working day
      if (isAfter(slotEnd, endOfWorkingDay)) break;

      // Actual time the instructor needs (including buffers) to check against Free/Busy
      const blockedStart = addMinutes(currentSlotStart, -bufferBefore);
      const blockedEnd = addMinutes(slotEnd, bufferAfter);

      let isAvailable = true;
      let reason = '';

      // Check minNoticeHours
      if (isBefore(currentSlotStart, noticeBoundary)) {
        isAvailable = false;
        reason = 'Notice period violated';
      }

      // Check Google Free/Busy intersection
      if (isAvailable) {
        for (const busy of busyPeriods) {
          const busyStart = parseISO(busy.start);
          const busyEnd = parseISO(busy.end);

          // A overlaps B if A.start < B.end AND A.end > B.start
          if (isBefore(blockedStart, busyEnd) && isAfter(blockedEnd, busyStart)) {
            isAvailable = false;
            reason = 'Calendar conflict';
            break;
          }
        }
      }

      if (isAvailable) {
        slots.push({
          startTime: format(currentSlotStart, 'HH:mm'),
          endTime: format(slotEnd, 'HH:mm'),
          isoStart: currentSlotStart.toISOString(),
          isoEnd: slotEnd.toISOString(),
          available: true,
        });
      }

      // Move forward by increment
      currentSlotStart = addMinutes(currentSlotStart, increment);
    }

    availability.push({ date: currentDayStr, slots });
  }

  return availability;
}
