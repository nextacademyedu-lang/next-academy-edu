import { submitBooking } from '../actions';

async function test() {
    const formData = new FormData();
    formData.append('event_type_id', '3fd1245f-8e9f-461e-ac7c-3796e1b96a66');
    formData.append('date', '2026-03-12');
    formData.append('time', '10:00');
    formData.append('duration_minutes', '30');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'Booking');
    formData.append('email', 'muhammed.mekky.test@gmail.com');
    formData.append('notes', 'This is a test');

    console.log("Submitting booking...");
    const res = await submitBooking(formData);
    console.log("Result:", res);
}

test();
