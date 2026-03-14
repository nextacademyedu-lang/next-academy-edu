DO $$
DECLARE
  prog_id INT;
  round_id INT;
  booking_id INT;
BEGIN
  INSERT INTO programs (type, title_ar, title_en, slug, language, is_active, is_featured, view_count, average_rating, review_count, updated_at, created_at)
  VALUES ('workshop', 'برنامج تجريبي', 'Test Program', 'test-program', 'ar', true, false, 0, 0, 0, NOW(), NOW())
  RETURNING id INTO prog_id;

  INSERT INTO rounds (program_id, round_number, start_date, max_capacity, price, currency, status, is_active, auto_close_on_full, reminder_sent, current_enrollments, timezone, location_type, updated_at, created_at)
  VALUES (prog_id, 1, NOW() + INTERVAL '7 days', 10, 100, 'EGP', 'open', true, true, false, 0, 'Africa/Cairo', 'online', NOW(), NOW())
  RETURNING id INTO round_id;

  INSERT INTO bookings (user_id, round_id, status, total_amount, paid_amount, remaining_amount, discount_amount, final_amount, access_blocked, booking_source, confirmation_email_sent, reminder_email_sent, updated_at, created_at)
  VALUES (2, round_id, 'pending', 100, 0, 100, 0, 100, false, 'website', false, false, NOW(), NOW())
  RETURNING id INTO booking_id;

  INSERT INTO payments (booking_id, amount, due_date, status, reminder_sent_count, updated_at, created_at)
  VALUES (booking_id, 100, NOW() + INTERVAL '1 day', 'pending', 0, NOW(), NOW());

  RAISE NOTICE 'Done. Booking ID: %', booking_id;
END $$;
