import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_gender" AS ENUM('male', 'female');
  CREATE TYPE "public"."enum_users_role" AS ENUM('user', 'admin', 'instructor', 'b2b_manager');
  CREATE TYPE "public"."enum_users_preferred_language" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_users_lifecycle_stage" AS ENUM('lead', 'prospect', 'customer', 'repeat');
  CREATE TYPE "public"."enum_users_contact_source" AS ENUM('website', 'whatsapp', 'social', 'referral');
  CREATE TYPE "public"."enum_companies_size" AS ENUM('1-10', '11-50', '51-200', '201-500', '500+');
  CREATE TYPE "public"."enum_companies_type" AS ENUM('startup', 'sme', 'enterprise', 'government', 'freelancer');
  CREATE TYPE "public"."enum_user_profiles_title" AS ENUM('Mr', 'Mrs', 'Dr', 'Eng', 'Prof');
  CREATE TYPE "public"."enum_user_profiles_work_field" AS ENUM('Marketing', 'Sales', 'Tech', 'Finance', 'Operations', 'HR', 'Legal', 'Other');
  CREATE TYPE "public"."enum_user_profiles_years_of_experience" AS ENUM('0-2', '3-5', '6-10', '10+');
  CREATE TYPE "public"."enum_user_profiles_education" AS ENUM('High School', 'Bachelor', 'Master', 'MBA', 'PhD', 'Other');
  CREATE TYPE "public"."enum_user_profiles_company_size" AS ENUM('1-10', '11-50', '51-200', '201-500', '500+');
  CREATE TYPE "public"."enum_user_profiles_company_type" AS ENUM('startup', 'sme', 'enterprise', 'government', 'freelancer');
  CREATE TYPE "public"."enum_user_profiles_how_did_you_hear" AS ENUM('website', 'whatsapp', 'social', 'friend', 'google', 'other');
  CREATE TYPE "public"."enum_tags_type" AS ENUM('interest', 'skill', 'industry', 'topic');
  CREATE TYPE "public"."enum_programs_type" AS ENUM('workshop', 'course', 'webinar');
  CREATE TYPE "public"."enum_programs_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_programs_language" AS ENUM('ar', 'en', 'both');
  CREATE TYPE "public"."enum_rounds_location_type" AS ENUM('online', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_rounds_currency" AS ENUM('EGP', 'USD', 'EUR');
  CREATE TYPE "public"."enum_rounds_status" AS ENUM('draft', 'upcoming', 'open', 'full', 'in_progress', 'cancelled', 'completed');
  CREATE TYPE "public"."enum_sessions_location_type" AS ENUM('online', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('reserved', 'pending', 'confirmed', 'cancelled', 'completed', 'refunded', 'payment_failed', 'cancelled_overdue');
  CREATE TYPE "public"."enum_bookings_booking_source" AS ENUM('website', 'whatsapp', 'admin', 'phone', 'payment_link');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('pending', 'paid', 'overdue', 'failed', 'refunded');
  CREATE TYPE "public"."enum_payments_payment_method" AS ENUM('paymob', 'fawry', 'cash', 'bank_transfer', 'voucher');
  CREATE TYPE "public"."enum_installment_requests_status" AS ENUM('pending', 'approved', 'rejected', 'expired');
  CREATE TYPE "public"."enum_notifications_type" AS ENUM('booking_confirmed', 'payment_reminder', 'payment_received', 'round_starting', 'session_reminder', 'booking_cancelled', 'round_cancelled', 'consultation_confirmed', 'consultation_reminder', 'installment_approved', 'installment_rejected', 'certificate_ready', 'waitlist_available', 'payment_overdue', 'access_blocked', 'refund_approved', 'review_request');
  CREATE TYPE "public"."enum_discount_codes_type" AS ENUM('percentage', 'fixed');
  CREATE TYPE "public"."enum_discount_codes_applicable_to" AS ENUM('all', 'specific_programs', 'specific_categories', 'consultations');
  CREATE TYPE "public"."enum_consultation_types_currency" AS ENUM('EGP', 'USD');
  CREATE TYPE "public"."enum_consultation_types_meeting_type" AS ENUM('online', 'in-person', 'both');
  CREATE TYPE "public"."enum_consultation_availability_day_of_week" AS ENUM('saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday');
  CREATE TYPE "public"."enum_consultation_slots_status" AS ENUM('available', 'booked', 'blocked', 'cancelled');
  CREATE TYPE "public"."enum_consultation_bookings_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
  CREATE TYPE "public"."enum_consultation_bookings_payment_status" AS ENUM('pending', 'paid', 'refunded');
  CREATE TYPE "public"."enum_consultation_bookings_cancelled_by" AS ENUM('user', 'instructor', 'admin');
  CREATE TYPE "public"."enum_leads_source" AS ENUM('whatsapp', 'facebook', 'instagram', 'linkedin', 'referral', 'cold_call', 'event', 'other');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost');
  CREATE TYPE "public"."enum_leads_priority" AS ENUM('low', 'medium', 'high', 'urgent');
  CREATE TYPE "public"."enum_waitlist_status" AS ENUM('waiting', 'notified', 'expired', 'converted');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'approved', 'flagged', 'removed');
  CREATE TYPE "public"."enum_verification_codes_type" AS ENUM('email_verification', 'password_reset');
  CREATE TYPE "public"."enum_blog_posts_category" AS ENUM('strategy', 'leadership', 'marketing', 'technology', 'finance', 'hr', 'general');
  CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published', 'archived');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"phone" varchar,
  	"gender" "enum_users_gender",
  	"picture_id" integer,
  	"role" "enum_users_role" DEFAULT 'user' NOT NULL,
  	"instructor_id_id" integer,
  	"preferred_language" "enum_users_preferred_language" DEFAULT 'ar',
  	"newsletter_opt_in" boolean DEFAULT false,
  	"whatsapp_opt_in" boolean DEFAULT false,
  	"lifecycle_stage" "enum_users_lifecycle_stage" DEFAULT 'lead',
  	"contact_source" "enum_users_contact_source",
  	"twenty_crm_contact_id" varchar,
  	"google_id" varchar,
  	"email_verified" boolean DEFAULT false,
  	"last_login" timestamp(3) with time zone,
  	"locked_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"industry" varchar,
  	"size" "enum_companies_size",
  	"type" "enum_companies_type",
  	"website" varchar,
  	"country" varchar,
  	"city" varchar,
  	"logo_id" integer,
  	"twenty_crm_company_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "user_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"title" "enum_user_profiles_title",
  	"job_title" varchar,
  	"work_field" "enum_user_profiles_work_field",
  	"years_of_experience" "enum_user_profiles_years_of_experience",
  	"education" "enum_user_profiles_education",
  	"year_of_birth" numeric,
  	"country" varchar,
  	"city" varchar,
  	"company_id" integer,
  	"company_size" "enum_user_profiles_company_size",
  	"company_type" "enum_user_profiles_company_type",
  	"linkedin_url" varchar,
  	"learning_goals" varchar,
  	"how_did_you_hear" "enum_user_profiles_how_did_you_hear",
  	"onboarding_completed" boolean DEFAULT false,
  	"onboarding_step" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "user_profiles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name_ar" varchar NOT NULL,
  	"name_en" varchar,
  	"slug" varchar NOT NULL,
  	"type" "enum_tags_type" NOT NULL,
  	"usage_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name_ar" varchar NOT NULL,
  	"name_en" varchar,
  	"slug" varchar NOT NULL,
  	"description_ar" varchar,
  	"description_en" varchar,
  	"icon" varchar,
  	"parent_id" integer,
  	"order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "instructors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"bio_ar" jsonb,
  	"bio_en" jsonb,
  	"job_title" varchar,
  	"tagline" varchar,
  	"picture_id" integer,
  	"linkedin_url" varchar,
  	"twitter_url" varchar,
  	"email" varchar,
  	"featured_order" numeric,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "programs_objectives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "programs_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "programs_target_audience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "programs_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE "programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_programs_type" NOT NULL,
  	"title_ar" varchar NOT NULL,
  	"title_en" varchar,
  	"slug" varchar NOT NULL,
  	"description_ar" jsonb,
  	"description_en" jsonb,
  	"short_description_ar" varchar,
  	"short_description_en" varchar,
  	"category_id" integer,
  	"instructor_id" integer,
  	"thumbnail_id" integer,
  	"cover_image_id" integer,
  	"duration_hours" numeric,
  	"sessions_count" numeric,
  	"level" "enum_programs_level",
  	"language" "enum_programs_language" DEFAULT 'ar',
  	"is_featured" boolean DEFAULT false,
  	"is_active" boolean DEFAULT true,
  	"view_count" numeric DEFAULT 0,
  	"average_rating" numeric DEFAULT 0,
  	"review_count" numeric DEFAULT 0,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "programs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "rounds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"program_id" integer NOT NULL,
  	"round_number" numeric NOT NULL,
  	"title" varchar,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"timezone" varchar DEFAULT 'Africa/Cairo',
  	"location_type" "enum_rounds_location_type" DEFAULT 'online',
  	"location_name" varchar,
  	"location_address" varchar,
  	"location_map_url" varchar,
  	"meeting_url" varchar,
  	"max_capacity" numeric NOT NULL,
  	"current_enrollments" numeric DEFAULT 0,
  	"price" numeric NOT NULL,
  	"early_bird_price" numeric,
  	"early_bird_deadline" timestamp(3) with time zone,
  	"currency" "enum_rounds_currency" DEFAULT 'EGP',
  	"status" "enum_rounds_status" DEFAULT 'draft',
  	"is_active" boolean DEFAULT true,
  	"auto_close_on_full" boolean DEFAULT true,
  	"reminder_sent" boolean DEFAULT false,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"round_id" integer NOT NULL,
  	"session_number" numeric NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"location_type" "enum_sessions_location_type" DEFAULT 'online',
  	"location_name" varchar,
  	"location_address" varchar,
  	"meeting_url" varchar,
  	"instructor_id" integer,
  	"recording_url" varchar,
  	"is_cancelled" boolean DEFAULT false,
  	"cancellation_reason" varchar,
  	"attendees_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sessions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "payment_plans_installments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"installment_number" numeric NOT NULL,
  	"percentage" numeric NOT NULL,
  	"due_days_from_booking" numeric DEFAULT 0 NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "payment_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"round_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"name_en" varchar,
  	"installments_count" numeric NOT NULL,
  	"description" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"booking_code" varchar,
  	"user_id" integer NOT NULL,
  	"round_id" integer NOT NULL,
  	"payment_plan_id" integer,
  	"installment_request_id" integer,
  	"status" "enum_bookings_status" DEFAULT 'pending' NOT NULL,
  	"total_amount" numeric NOT NULL,
  	"paid_amount" numeric DEFAULT 0,
  	"remaining_amount" numeric DEFAULT 0,
  	"discount_code" varchar,
  	"discount_amount" numeric DEFAULT 0,
  	"final_amount" numeric NOT NULL,
  	"access_blocked" boolean DEFAULT false,
  	"booking_source" "enum_bookings_booking_source" DEFAULT 'website',
  	"booked_by_admin_id" integer,
  	"notes" varchar,
  	"internal_notes" varchar,
  	"twenty_crm_deal_id" varchar,
  	"confirmation_email_sent" boolean DEFAULT false,
  	"reminder_email_sent" boolean DEFAULT false,
  	"cancelled_at" timestamp(3) with time zone,
  	"cancellation_reason" varchar,
  	"refund_amount" numeric,
  	"refund_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"payment_code" varchar,
  	"booking_id" integer NOT NULL,
  	"installment_number" numeric,
  	"amount" numeric NOT NULL,
  	"due_date" timestamp(3) with time zone NOT NULL,
  	"paid_date" timestamp(3) with time zone,
  	"status" "enum_payments_status" DEFAULT 'pending' NOT NULL,
  	"payment_method" "enum_payments_payment_method",
  	"transaction_id" varchar,
  	"paymob_order_id" varchar,
  	"payment_gateway_response" jsonb,
  	"receipt_url" varchar,
  	"receipt_number" varchar,
  	"notes" varchar,
  	"reminder_sent_count" numeric DEFAULT 0,
  	"last_reminder_sent" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "installment_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"round_id" integer NOT NULL,
  	"payment_plan_id" integer NOT NULL,
  	"status" "enum_installment_requests_status" DEFAULT 'pending' NOT NULL,
  	"reason" varchar NOT NULL,
  	"national_id_number" varchar,
  	"national_id_image_id" integer,
  	"user_notes" varchar,
  	"admin_notes" varchar,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"approval_expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"type" "enum_notifications_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"action_url" varchar,
  	"is_read" boolean DEFAULT false,
  	"read_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "discount_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"type" "enum_discount_codes_type" NOT NULL,
  	"value" numeric NOT NULL,
  	"max_uses" numeric,
  	"current_uses" numeric DEFAULT 0,
  	"valid_from" timestamp(3) with time zone NOT NULL,
  	"valid_until" timestamp(3) with time zone NOT NULL,
  	"applicable_to" "enum_discount_codes_applicable_to" DEFAULT 'all',
  	"min_purchase_amount" numeric,
  	"is_active" boolean DEFAULT true,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "discount_codes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"programs_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "consultation_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instructor_id" integer NOT NULL,
  	"title_ar" varchar NOT NULL,
  	"title_en" varchar,
  	"description_ar" varchar,
  	"description_en" varchar,
  	"duration_minutes" numeric NOT NULL,
  	"price" numeric NOT NULL,
  	"currency" "enum_consultation_types_currency" DEFAULT 'EGP',
  	"meeting_type" "enum_consultation_types_meeting_type" DEFAULT 'online',
  	"meeting_platform" varchar,
  	"max_participants" numeric DEFAULT 1,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "consultation_availability" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instructor_id" integer NOT NULL,
  	"day_of_week" "enum_consultation_availability_day_of_week" NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"buffer_minutes" numeric DEFAULT 15,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "consultation_slots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"consultation_type_id" integer NOT NULL,
  	"instructor_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"status" "enum_consultation_slots_status" DEFAULT 'available' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "consultation_bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"booking_code" varchar,
  	"user_id" integer NOT NULL,
  	"slot_id" integer NOT NULL,
  	"consultation_type_id" integer NOT NULL,
  	"instructor_id" integer NOT NULL,
  	"status" "enum_consultation_bookings_status" DEFAULT 'pending' NOT NULL,
  	"amount" numeric NOT NULL,
  	"payment_status" "enum_consultation_bookings_payment_status" DEFAULT 'pending',
  	"transaction_id" varchar,
  	"meeting_url" varchar,
  	"user_notes" varchar,
  	"instructor_notes" varchar,
  	"cancelled_by" "enum_consultation_bookings_cancelled_by",
  	"cancellation_reason" varchar,
  	"reminder_sent" boolean DEFAULT false,
  	"discount_code" varchar,
  	"discount_amount" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"email" varchar,
  	"phone" varchar NOT NULL,
  	"company" varchar,
  	"job_title" varchar,
  	"source" "enum_leads_source" NOT NULL,
  	"source_details" varchar,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"notes" varchar,
  	"twenty_crm_lead_id" varchar,
  	"converted_user_id" integer,
  	"converted_at" timestamp(3) with time zone,
  	"assigned_to_id" integer,
  	"last_contact_date" timestamp(3) with time zone,
  	"next_follow_up_date" timestamp(3) with time zone,
  	"priority" "enum_leads_priority" DEFAULT 'medium',
  	"lost_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"programs_id" integer
  );
  
  CREATE TABLE "waitlist" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"round_id" integer NOT NULL,
  	"position" numeric NOT NULL,
  	"status" "enum_waitlist_status" DEFAULT 'waiting' NOT NULL,
  	"notified_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"program_id" integer NOT NULL,
  	"round_id" integer NOT NULL,
  	"booking_id" integer NOT NULL,
  	"rating" numeric NOT NULL,
  	"title" varchar,
  	"comment" varchar NOT NULL,
  	"status" "enum_reviews_status" DEFAULT 'pending' NOT NULL,
  	"helpful_count" numeric DEFAULT 0,
  	"is_verified_purchase" boolean DEFAULT true,
  	"admin_notes" varchar,
  	"removed_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "certificates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"certificate_code" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"program_id" integer NOT NULL,
  	"round_id" integer NOT NULL,
  	"booking_id" integer NOT NULL,
  	"quiz_score" numeric,
  	"passing_score" numeric,
  	"issued_at" timestamp(3) with time zone NOT NULL,
  	"pdf_url" varchar,
  	"verification_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payment_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"round_id" integer NOT NULL,
  	"payment_plan_id" integer,
  	"discount_code" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"max_uses" numeric,
  	"current_uses" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "instructor_blocked_dates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instructor_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "verification_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"used" boolean DEFAULT false,
  	"type" "enum_verification_codes_type" DEFAULT 'email_verification' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar,
  	"content" jsonb,
  	"category" "enum_blog_posts_category",
  	"featured_image_id" integer,
  	"author_id" integer,
  	"status" "enum_blog_posts_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"companies_id" integer,
  	"user_profiles_id" integer,
  	"tags_id" integer,
  	"categories_id" integer,
  	"instructors_id" integer,
  	"programs_id" integer,
  	"rounds_id" integer,
  	"sessions_id" integer,
  	"payment_plans_id" integer,
  	"bookings_id" integer,
  	"payments_id" integer,
  	"installment_requests_id" integer,
  	"notifications_id" integer,
  	"discount_codes_id" integer,
  	"consultation_types_id" integer,
  	"consultation_availability_id" integer,
  	"consultation_slots_id" integer,
  	"consultation_bookings_id" integer,
  	"leads_id" integer,
  	"waitlist_id" integer,
  	"reviews_id" integer,
  	"certificates_id" integer,
  	"payment_links_id" integer,
  	"instructor_blocked_dates_id" integer,
  	"verification_codes_id" integer,
  	"blog_posts_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_picture_id_media_id_fk" FOREIGN KEY ("picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_instructor_id_id_instructors_id_fk" FOREIGN KEY ("instructor_id_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_profiles_rels" ADD CONSTRAINT "user_profiles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "user_profiles_rels" ADD CONSTRAINT "user_profiles_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instructors" ADD CONSTRAINT "instructors_picture_id_media_id_fk" FOREIGN KEY ("picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs_objectives" ADD CONSTRAINT "programs_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_requirements" ADD CONSTRAINT "programs_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_target_audience" ADD CONSTRAINT "programs_target_audience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_seo_keywords" ADD CONSTRAINT "programs_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rounds" ADD CONSTRAINT "rounds_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payment_plans_installments" ADD CONSTRAINT "payment_plans_installments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payment_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_installment_request_id_installment_requests_id_fk" FOREIGN KEY ("installment_request_id") REFERENCES "public"."installment_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booked_by_admin_id_users_id_fk" FOREIGN KEY ("booked_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "installment_requests" ADD CONSTRAINT "installment_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "installment_requests" ADD CONSTRAINT "installment_requests_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "installment_requests" ADD CONSTRAINT "installment_requests_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "installment_requests" ADD CONSTRAINT "installment_requests_national_id_image_id_media_id_fk" FOREIGN KEY ("national_id_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "installment_requests" ADD CONSTRAINT "installment_requests_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "discount_codes_rels" ADD CONSTRAINT "discount_codes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "discount_codes_rels" ADD CONSTRAINT "discount_codes_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "discount_codes_rels" ADD CONSTRAINT "discount_codes_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consultation_types" ADD CONSTRAINT "consultation_types_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_availability" ADD CONSTRAINT "consultation_availability_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_slots" ADD CONSTRAINT "consultation_slots_consultation_type_id_consultation_types_id_fk" FOREIGN KEY ("consultation_type_id") REFERENCES "public"."consultation_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_slots" ADD CONSTRAINT "consultation_slots_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_bookings" ADD CONSTRAINT "consultation_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_bookings" ADD CONSTRAINT "consultation_bookings_slot_id_consultation_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."consultation_slots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_bookings" ADD CONSTRAINT "consultation_bookings_consultation_type_id_consultation_types_id_fk" FOREIGN KEY ("consultation_type_id") REFERENCES "public"."consultation_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_bookings" ADD CONSTRAINT "consultation_bookings_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_user_id_users_id_fk" FOREIGN KEY ("converted_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_rels" ADD CONSTRAINT "leads_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_rels" ADD CONSTRAINT "leads_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instructor_blocked_dates" ADD CONSTRAINT "instructor_blocked_dates_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts_rels" ADD CONSTRAINT "blog_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts_rels" ADD CONSTRAINT "blog_posts_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_profiles_fk" FOREIGN KEY ("user_profiles_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rounds_fk" FOREIGN KEY ("rounds_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_plans_fk" FOREIGN KEY ("payment_plans_id") REFERENCES "public"."payment_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_installment_requests_fk" FOREIGN KEY ("installment_requests_id") REFERENCES "public"."installment_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_discount_codes_fk" FOREIGN KEY ("discount_codes_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultation_types_fk" FOREIGN KEY ("consultation_types_id") REFERENCES "public"."consultation_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultation_availability_fk" FOREIGN KEY ("consultation_availability_id") REFERENCES "public"."consultation_availability"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultation_slots_fk" FOREIGN KEY ("consultation_slots_id") REFERENCES "public"."consultation_slots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultation_bookings_fk" FOREIGN KEY ("consultation_bookings_id") REFERENCES "public"."consultation_bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_waitlist_fk" FOREIGN KEY ("waitlist_id") REFERENCES "public"."waitlist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_links_fk" FOREIGN KEY ("payment_links_id") REFERENCES "public"."payment_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructor_blocked_dates_fk" FOREIGN KEY ("instructor_blocked_dates_id") REFERENCES "public"."instructor_blocked_dates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_codes_fk" FOREIGN KEY ("verification_codes_id") REFERENCES "public"."verification_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_picture_idx" ON "users" USING btree ("picture_id");
  CREATE INDEX "users_instructor_id_idx" ON "users" USING btree ("instructor_id_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "companies_logo_idx" ON "companies" USING btree ("logo_id");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_profiles_user_idx" ON "user_profiles" USING btree ("user_id");
  CREATE INDEX "user_profiles_company_idx" ON "user_profiles" USING btree ("company_id");
  CREATE INDEX "user_profiles_updated_at_idx" ON "user_profiles" USING btree ("updated_at");
  CREATE INDEX "user_profiles_created_at_idx" ON "user_profiles" USING btree ("created_at");
  CREATE INDEX "user_profiles_rels_order_idx" ON "user_profiles_rels" USING btree ("order");
  CREATE INDEX "user_profiles_rels_parent_idx" ON "user_profiles_rels" USING btree ("parent_id");
  CREATE INDEX "user_profiles_rels_path_idx" ON "user_profiles_rels" USING btree ("path");
  CREATE INDEX "user_profiles_rels_tags_id_idx" ON "user_profiles_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "instructors_slug_idx" ON "instructors" USING btree ("slug");
  CREATE INDEX "instructors_picture_idx" ON "instructors" USING btree ("picture_id");
  CREATE INDEX "instructors_updated_at_idx" ON "instructors" USING btree ("updated_at");
  CREATE INDEX "instructors_created_at_idx" ON "instructors" USING btree ("created_at");
  CREATE INDEX "programs_objectives_order_idx" ON "programs_objectives" USING btree ("_order");
  CREATE INDEX "programs_objectives_parent_id_idx" ON "programs_objectives" USING btree ("_parent_id");
  CREATE INDEX "programs_requirements_order_idx" ON "programs_requirements" USING btree ("_order");
  CREATE INDEX "programs_requirements_parent_id_idx" ON "programs_requirements" USING btree ("_parent_id");
  CREATE INDEX "programs_target_audience_order_idx" ON "programs_target_audience" USING btree ("_order");
  CREATE INDEX "programs_target_audience_parent_id_idx" ON "programs_target_audience" USING btree ("_parent_id");
  CREATE INDEX "programs_seo_keywords_order_idx" ON "programs_seo_keywords" USING btree ("_order");
  CREATE INDEX "programs_seo_keywords_parent_id_idx" ON "programs_seo_keywords" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_slug_idx" ON "programs" USING btree ("slug");
  CREATE INDEX "programs_category_idx" ON "programs" USING btree ("category_id");
  CREATE INDEX "programs_instructor_idx" ON "programs" USING btree ("instructor_id");
  CREATE INDEX "programs_thumbnail_idx" ON "programs" USING btree ("thumbnail_id");
  CREATE INDEX "programs_cover_image_idx" ON "programs" USING btree ("cover_image_id");
  CREATE INDEX "programs_updated_at_idx" ON "programs" USING btree ("updated_at");
  CREATE INDEX "programs_created_at_idx" ON "programs" USING btree ("created_at");
  CREATE INDEX "programs_rels_order_idx" ON "programs_rels" USING btree ("order");
  CREATE INDEX "programs_rels_parent_idx" ON "programs_rels" USING btree ("parent_id");
  CREATE INDEX "programs_rels_path_idx" ON "programs_rels" USING btree ("path");
  CREATE INDEX "programs_rels_tags_id_idx" ON "programs_rels" USING btree ("tags_id");
  CREATE INDEX "rounds_program_idx" ON "rounds" USING btree ("program_id");
  CREATE INDEX "rounds_updated_at_idx" ON "rounds" USING btree ("updated_at");
  CREATE INDEX "rounds_created_at_idx" ON "rounds" USING btree ("created_at");
  CREATE INDEX "sessions_round_idx" ON "sessions" USING btree ("round_id");
  CREATE INDEX "sessions_instructor_idx" ON "sessions" USING btree ("instructor_id");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "sessions_rels_order_idx" ON "sessions_rels" USING btree ("order");
  CREATE INDEX "sessions_rels_parent_idx" ON "sessions_rels" USING btree ("parent_id");
  CREATE INDEX "sessions_rels_path_idx" ON "sessions_rels" USING btree ("path");
  CREATE INDEX "sessions_rels_media_id_idx" ON "sessions_rels" USING btree ("media_id");
  CREATE INDEX "payment_plans_installments_order_idx" ON "payment_plans_installments" USING btree ("_order");
  CREATE INDEX "payment_plans_installments_parent_id_idx" ON "payment_plans_installments" USING btree ("_parent_id");
  CREATE INDEX "payment_plans_round_idx" ON "payment_plans" USING btree ("round_id");
  CREATE INDEX "payment_plans_updated_at_idx" ON "payment_plans" USING btree ("updated_at");
  CREATE INDEX "payment_plans_created_at_idx" ON "payment_plans" USING btree ("created_at");
  CREATE UNIQUE INDEX "bookings_booking_code_idx" ON "bookings" USING btree ("booking_code");
  CREATE INDEX "bookings_user_idx" ON "bookings" USING btree ("user_id");
  CREATE INDEX "bookings_round_idx" ON "bookings" USING btree ("round_id");
  CREATE INDEX "bookings_payment_plan_idx" ON "bookings" USING btree ("payment_plan_id");
  CREATE INDEX "bookings_installment_request_idx" ON "bookings" USING btree ("installment_request_id");
  CREATE INDEX "bookings_booked_by_admin_idx" ON "bookings" USING btree ("booked_by_admin_id");
  CREATE INDEX "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE UNIQUE INDEX "payments_payment_code_idx" ON "payments" USING btree ("payment_code");
  CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE INDEX "installment_requests_user_idx" ON "installment_requests" USING btree ("user_id");
  CREATE INDEX "installment_requests_round_idx" ON "installment_requests" USING btree ("round_id");
  CREATE INDEX "installment_requests_payment_plan_idx" ON "installment_requests" USING btree ("payment_plan_id");
  CREATE INDEX "installment_requests_national_id_image_idx" ON "installment_requests" USING btree ("national_id_image_id");
  CREATE INDEX "installment_requests_reviewed_by_idx" ON "installment_requests" USING btree ("reviewed_by_id");
  CREATE INDEX "installment_requests_updated_at_idx" ON "installment_requests" USING btree ("updated_at");
  CREATE INDEX "installment_requests_created_at_idx" ON "installment_requests" USING btree ("created_at");
  CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE UNIQUE INDEX "discount_codes_code_idx" ON "discount_codes" USING btree ("code");
  CREATE INDEX "discount_codes_created_by_idx" ON "discount_codes" USING btree ("created_by_id");
  CREATE INDEX "discount_codes_updated_at_idx" ON "discount_codes" USING btree ("updated_at");
  CREATE INDEX "discount_codes_created_at_idx" ON "discount_codes" USING btree ("created_at");
  CREATE INDEX "discount_codes_rels_order_idx" ON "discount_codes_rels" USING btree ("order");
  CREATE INDEX "discount_codes_rels_parent_idx" ON "discount_codes_rels" USING btree ("parent_id");
  CREATE INDEX "discount_codes_rels_path_idx" ON "discount_codes_rels" USING btree ("path");
  CREATE INDEX "discount_codes_rels_programs_id_idx" ON "discount_codes_rels" USING btree ("programs_id");
  CREATE INDEX "discount_codes_rels_categories_id_idx" ON "discount_codes_rels" USING btree ("categories_id");
  CREATE INDEX "consultation_types_instructor_idx" ON "consultation_types" USING btree ("instructor_id");
  CREATE INDEX "consultation_types_updated_at_idx" ON "consultation_types" USING btree ("updated_at");
  CREATE INDEX "consultation_types_created_at_idx" ON "consultation_types" USING btree ("created_at");
  CREATE INDEX "consultation_availability_instructor_idx" ON "consultation_availability" USING btree ("instructor_id");
  CREATE INDEX "consultation_availability_updated_at_idx" ON "consultation_availability" USING btree ("updated_at");
  CREATE INDEX "consultation_availability_created_at_idx" ON "consultation_availability" USING btree ("created_at");
  CREATE INDEX "consultation_slots_consultation_type_idx" ON "consultation_slots" USING btree ("consultation_type_id");
  CREATE INDEX "consultation_slots_instructor_idx" ON "consultation_slots" USING btree ("instructor_id");
  CREATE INDEX "consultation_slots_updated_at_idx" ON "consultation_slots" USING btree ("updated_at");
  CREATE INDEX "consultation_slots_created_at_idx" ON "consultation_slots" USING btree ("created_at");
  CREATE UNIQUE INDEX "consultation_bookings_booking_code_idx" ON "consultation_bookings" USING btree ("booking_code");
  CREATE INDEX "consultation_bookings_user_idx" ON "consultation_bookings" USING btree ("user_id");
  CREATE INDEX "consultation_bookings_slot_idx" ON "consultation_bookings" USING btree ("slot_id");
  CREATE INDEX "consultation_bookings_consultation_type_idx" ON "consultation_bookings" USING btree ("consultation_type_id");
  CREATE INDEX "consultation_bookings_instructor_idx" ON "consultation_bookings" USING btree ("instructor_id");
  CREATE INDEX "consultation_bookings_updated_at_idx" ON "consultation_bookings" USING btree ("updated_at");
  CREATE INDEX "consultation_bookings_created_at_idx" ON "consultation_bookings" USING btree ("created_at");
  CREATE INDEX "leads_converted_user_idx" ON "leads" USING btree ("converted_user_id");
  CREATE INDEX "leads_assigned_to_idx" ON "leads" USING btree ("assigned_to_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "leads_rels_order_idx" ON "leads_rels" USING btree ("order");
  CREATE INDEX "leads_rels_parent_idx" ON "leads_rels" USING btree ("parent_id");
  CREATE INDEX "leads_rels_path_idx" ON "leads_rels" USING btree ("path");
  CREATE INDEX "leads_rels_programs_id_idx" ON "leads_rels" USING btree ("programs_id");
  CREATE INDEX "waitlist_user_idx" ON "waitlist" USING btree ("user_id");
  CREATE INDEX "waitlist_round_idx" ON "waitlist" USING btree ("round_id");
  CREATE INDEX "waitlist_updated_at_idx" ON "waitlist" USING btree ("updated_at");
  CREATE INDEX "waitlist_created_at_idx" ON "waitlist" USING btree ("created_at");
  CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id");
  CREATE INDEX "reviews_program_idx" ON "reviews" USING btree ("program_id");
  CREATE INDEX "reviews_round_idx" ON "reviews" USING btree ("round_id");
  CREATE INDEX "reviews_booking_idx" ON "reviews" USING btree ("booking_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE UNIQUE INDEX "certificates_certificate_code_idx" ON "certificates" USING btree ("certificate_code");
  CREATE INDEX "certificates_user_idx" ON "certificates" USING btree ("user_id");
  CREATE INDEX "certificates_program_idx" ON "certificates" USING btree ("program_id");
  CREATE INDEX "certificates_round_idx" ON "certificates" USING btree ("round_id");
  CREATE INDEX "certificates_booking_idx" ON "certificates" USING btree ("booking_id");
  CREATE INDEX "certificates_updated_at_idx" ON "certificates" USING btree ("updated_at");
  CREATE INDEX "certificates_created_at_idx" ON "certificates" USING btree ("created_at");
  CREATE UNIQUE INDEX "payment_links_code_idx" ON "payment_links" USING btree ("code");
  CREATE INDEX "payment_links_round_idx" ON "payment_links" USING btree ("round_id");
  CREATE INDEX "payment_links_payment_plan_idx" ON "payment_links" USING btree ("payment_plan_id");
  CREATE INDEX "payment_links_created_by_idx" ON "payment_links" USING btree ("created_by_id");
  CREATE INDEX "payment_links_updated_at_idx" ON "payment_links" USING btree ("updated_at");
  CREATE INDEX "payment_links_created_at_idx" ON "payment_links" USING btree ("created_at");
  CREATE INDEX "instructor_blocked_dates_instructor_idx" ON "instructor_blocked_dates" USING btree ("instructor_id");
  CREATE INDEX "instructor_blocked_dates_updated_at_idx" ON "instructor_blocked_dates" USING btree ("updated_at");
  CREATE INDEX "instructor_blocked_dates_created_at_idx" ON "instructor_blocked_dates" USING btree ("created_at");
  CREATE INDEX "verification_codes_email_idx" ON "verification_codes" USING btree ("email");
  CREATE INDEX "verification_codes_updated_at_idx" ON "verification_codes" USING btree ("updated_at");
  CREATE INDEX "verification_codes_created_at_idx" ON "verification_codes" USING btree ("created_at");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX "blog_posts_featured_image_idx" ON "blog_posts" USING btree ("featured_image_id");
  CREATE INDEX "blog_posts_author_idx" ON "blog_posts" USING btree ("author_id");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE INDEX "blog_posts_rels_order_idx" ON "blog_posts_rels" USING btree ("order");
  CREATE INDEX "blog_posts_rels_parent_idx" ON "blog_posts_rels" USING btree ("parent_id");
  CREATE INDEX "blog_posts_rels_path_idx" ON "blog_posts_rels" USING btree ("path");
  CREATE INDEX "blog_posts_rels_tags_id_idx" ON "blog_posts_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_user_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("user_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_instructors_id_idx" ON "payload_locked_documents_rels" USING btree ("instructors_id");
  CREATE INDEX "payload_locked_documents_rels_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("programs_id");
  CREATE INDEX "payload_locked_documents_rels_rounds_id_idx" ON "payload_locked_documents_rels" USING btree ("rounds_id");
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_payment_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_plans_id");
  CREATE INDEX "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_installment_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("installment_requests_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_discount_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("discount_codes_id");
  CREATE INDEX "payload_locked_documents_rels_consultation_types_id_idx" ON "payload_locked_documents_rels" USING btree ("consultation_types_id");
  CREATE INDEX "payload_locked_documents_rels_consultation_availability__idx" ON "payload_locked_documents_rels" USING btree ("consultation_availability_id");
  CREATE INDEX "payload_locked_documents_rels_consultation_slots_id_idx" ON "payload_locked_documents_rels" USING btree ("consultation_slots_id");
  CREATE INDEX "payload_locked_documents_rels_consultation_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("consultation_bookings_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_waitlist_id_idx" ON "payload_locked_documents_rels" USING btree ("waitlist_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_certificates_id_idx" ON "payload_locked_documents_rels" USING btree ("certificates_id");
  CREATE INDEX "payload_locked_documents_rels_payment_links_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_links_id");
  CREATE INDEX "payload_locked_documents_rels_instructor_blocked_dates_i_idx" ON "payload_locked_documents_rels" USING btree ("instructor_blocked_dates_id");
  CREATE INDEX "payload_locked_documents_rels_verification_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("verification_codes_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "user_profiles" CASCADE;
  DROP TABLE "user_profiles_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "instructors" CASCADE;
  DROP TABLE "programs_objectives" CASCADE;
  DROP TABLE "programs_requirements" CASCADE;
  DROP TABLE "programs_target_audience" CASCADE;
  DROP TABLE "programs_seo_keywords" CASCADE;
  DROP TABLE "programs" CASCADE;
  DROP TABLE "programs_rels" CASCADE;
  DROP TABLE "rounds" CASCADE;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "sessions_rels" CASCADE;
  DROP TABLE "payment_plans_installments" CASCADE;
  DROP TABLE "payment_plans" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "installment_requests" CASCADE;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "discount_codes" CASCADE;
  DROP TABLE "discount_codes_rels" CASCADE;
  DROP TABLE "consultation_types" CASCADE;
  DROP TABLE "consultation_availability" CASCADE;
  DROP TABLE "consultation_slots" CASCADE;
  DROP TABLE "consultation_bookings" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "leads_rels" CASCADE;
  DROP TABLE "waitlist" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "certificates" CASCADE;
  DROP TABLE "payment_links" CASCADE;
  DROP TABLE "instructor_blocked_dates" CASCADE;
  DROP TABLE "verification_codes" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "blog_posts_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_gender";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_preferred_language";
  DROP TYPE "public"."enum_users_lifecycle_stage";
  DROP TYPE "public"."enum_users_contact_source";
  DROP TYPE "public"."enum_companies_size";
  DROP TYPE "public"."enum_companies_type";
  DROP TYPE "public"."enum_user_profiles_title";
  DROP TYPE "public"."enum_user_profiles_work_field";
  DROP TYPE "public"."enum_user_profiles_years_of_experience";
  DROP TYPE "public"."enum_user_profiles_education";
  DROP TYPE "public"."enum_user_profiles_company_size";
  DROP TYPE "public"."enum_user_profiles_company_type";
  DROP TYPE "public"."enum_user_profiles_how_did_you_hear";
  DROP TYPE "public"."enum_tags_type";
  DROP TYPE "public"."enum_programs_type";
  DROP TYPE "public"."enum_programs_level";
  DROP TYPE "public"."enum_programs_language";
  DROP TYPE "public"."enum_rounds_location_type";
  DROP TYPE "public"."enum_rounds_currency";
  DROP TYPE "public"."enum_rounds_status";
  DROP TYPE "public"."enum_sessions_location_type";
  DROP TYPE "public"."enum_bookings_status";
  DROP TYPE "public"."enum_bookings_booking_source";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_payments_payment_method";
  DROP TYPE "public"."enum_installment_requests_status";
  DROP TYPE "public"."enum_notifications_type";
  DROP TYPE "public"."enum_discount_codes_type";
  DROP TYPE "public"."enum_discount_codes_applicable_to";
  DROP TYPE "public"."enum_consultation_types_currency";
  DROP TYPE "public"."enum_consultation_types_meeting_type";
  DROP TYPE "public"."enum_consultation_availability_day_of_week";
  DROP TYPE "public"."enum_consultation_slots_status";
  DROP TYPE "public"."enum_consultation_bookings_status";
  DROP TYPE "public"."enum_consultation_bookings_payment_status";
  DROP TYPE "public"."enum_consultation_bookings_cancelled_by";
  DROP TYPE "public"."enum_leads_source";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_priority";
  DROP TYPE "public"."enum_waitlist_status";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum_verification_codes_type";
  DROP TYPE "public"."enum_blog_posts_category";
  DROP TYPE "public"."enum_blog_posts_status";`)
}
