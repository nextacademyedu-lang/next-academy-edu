'use server';

import { calculateAvailability, DayAvailability } from '../../lib/booking-engine';

export async function getInstructorAvailability(
  consultationTypeId: string,
  startDateStr: string, // YYYY-MM-DD
  daysToFetch: number = 7,
  clientTimezone: string = 'Africa/Cairo'
): Promise<{ success: boolean; data?: DayAvailability[]; error?: string }> {
  try {
    const availability = await calculateAvailability(consultationTypeId, startDateStr, daysToFetch, clientTimezone);
    return { success: true, data: availability };
  } catch (error: any) {
    console.error('[Server Action: getInstructorAvailability] Error:', error);
    return { success: false, error: error.message || 'Failed to fetch availability' };
  }
}
