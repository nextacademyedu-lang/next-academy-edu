import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sessions_status" AS ENUM('scheduled', 'live', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_bulk_seat_allocations_allocations_status" AS ENUM('pending', 'enrolled', 'cancelled');
  CREATE TYPE "public"."enum_bulk_seat_allocations_status" AS ENUM('active', 'expired', 'cancelled');
  CREATE TYPE "public"."enum_popups_form_form_fields_field_type" AS ENUM('email', 'text', 'phone', 'name');
  CREATE TYPE "public"."enum_popups_status" AS ENUM('draft', 'active', 'paused', 'archived');
  CREATE TYPE "public"."enum_popups_content_image_position" AS ENUM('left', 'right', 'top', 'none');
  CREATE TYPE "public"."enum_popups_promo_promo_delivery" AS ENUM('show_directly', 'after_form', 'send_email');
  CREATE TYPE "public"."enum_popups_appearance_style_preset" AS ENUM('default', 'offer_dark');
  CREATE TYPE "public"."enum_popups_appearance_popup_type" AS ENUM('modal', 'slide_in', 'bottom_bar', 'full_screen');
  CREATE TYPE "public"."enum_popups_appearance_animation" AS ENUM('fade', 'slide_up', 'slide_side', 'zoom');
  CREATE TYPE "public"."enum_popups_targeting_display_pages" AS ENUM('all', 'specific');
  CREATE TYPE "public"."enum_popups_targeting_trigger_type" AS ENUM('on_load', 'after_delay', 'on_exit', 'on_scroll');
  CREATE TYPE "public"."enum_popups_targeting_frequency" AS ENUM('every_time', 'once_session', 'once_day', 'once_ever');
  CREATE TYPE "public"."enum_popups_targeting_target_audience" AS ENUM('all', 'guests_only', 'logged_in', 'specific_role');
  CREATE TYPE "public"."enum_popups_targeting_target_role" AS ENUM('student', 'instructor', 'b2b_manager');
  CREATE TYPE "public"."enum_popups_targeting_target_device" AS ENUM('all', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_popups_targeting_visitor_condition" AS ENUM('all', 'first_visit', 'returning_visitor');
  CREATE TYPE "public"."enum_popups_targeting_purchase_condition" AS ENUM('all', 'no_purchase', 'has_purchase');
  CREATE TYPE "public"."enum_popups_targeting_email_capture_condition" AS ENUM('all', 'email_captured', 'email_not_captured');
  CREATE TYPE "public"."enum_announcement_bars_status" AS ENUM('draft', 'active', 'paused');
  CREATE TYPE "public"."enum_announcement_bars_appearance_position" AS ENUM('top', 'bottom');
  CREATE TYPE "public"."enum_announcement_bars_appearance_font_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_announcement_bars_animation_animation_speed" AS ENUM('slow', 'normal', 'fast');
  CREATE TYPE "public"."enum_announcement_bars_animation_animation_direction" AS ENUM('ltr', 'rtl');
  CREATE TYPE "public"."enum_announcement_bars_targeting_display_pages" AS ENUM('all', 'specific');
  CREATE TYPE "public"."enum_upcoming_events_config_mode" AS ENUM('automatic', 'manual');
  CREATE TYPE "public"."enum_upcoming_events_config_filter_type" AS ENUM('all', 'workshop', 'course', 'webinar');
  CREATE TYPE "public"."enum_upcoming_events_config_sort_order" AS ENUM('date_asc', 'manual');
  CREATE TYPE "public"."enum_crm_sync_events_entity_type" AS ENUM('user', 'user_profile', 'lead', 'company', 'booking', 'payment', 'consultation_booking', 'bulk_seat_allocation', 'waitlist');
  CREATE TYPE "public"."enum_crm_sync_events_status" AS ENUM('pending', 'processing', 'done', 'failed', 'dead_letter');
  CREATE TABLE "bulk_seat_allocations_allocations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"allocated_at" timestamp(3) with time zone,
  	"status" "enum_bulk_seat_allocations_allocations_status" DEFAULT 'pending' NOT NULL
  );
  
  CREATE TABLE "bulk_seat_allocations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_id" integer NOT NULL,
  	"round_id" integer NOT NULL,
  	"total_seats" numeric NOT NULL,
  	"status" "enum_bulk_seat_allocations_status" DEFAULT 'active' NOT NULL,
  	"purchase_date" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "popups_form_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field_label" varchar,
  	"field_type" "enum_popups_form_form_fields_field_type",
  	"is_required" boolean DEFAULT true
  );
  
  CREATE TABLE "popups_targeting_specific_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "popups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_popups_status" DEFAULT 'draft' NOT NULL,
  	"content_title_ar" varchar,
  	"content_title_en" varchar,
  	"content_badge_ar" varchar,
  	"content_badge_en" varchar,
  	"content_subtitle_ar" varchar,
  	"content_subtitle_en" varchar,
  	"content_description_ar" jsonb,
  	"content_description_en" jsonb,
  	"content_legal_note_ar" varchar,
  	"content_legal_note_en" varchar,
  	"content_image_id" integer,
  	"content_image_position" "enum_popups_content_image_position" DEFAULT 'top',
  	"cta_primary_cta_text" varchar,
  	"cta_primary_cta_link" varchar,
  	"cta_secondary_cta_text" varchar,
  	"cta_secondary_cta_link" varchar,
  	"promo_has_promo_code" boolean DEFAULT false,
  	"promo_promo_code" varchar,
  	"promo_promo_delivery" "enum_popups_promo_promo_delivery" DEFAULT 'show_directly',
  	"form_has_form" boolean DEFAULT false,
  	"form_success_message" varchar,
  	"form_redirect_url" varchar,
  	"appearance_style_preset" "enum_popups_appearance_style_preset" DEFAULT 'default',
  	"appearance_popup_type" "enum_popups_appearance_popup_type" DEFAULT 'modal',
  	"appearance_animation" "enum_popups_appearance_animation" DEFAULT 'fade',
  	"appearance_overlay_darkness" numeric DEFAULT 50,
  	"appearance_close_on_outside_click" boolean DEFAULT true,
  	"appearance_bg_color" varchar DEFAULT '#1a1a2e',
  	"appearance_text_color" varchar DEFAULT '#ffffff',
  	"appearance_accent_color" varchar DEFAULT '#e94560',
  	"appearance_background_image_id" integer,
  	"appearance_background_overlay_opacity" numeric DEFAULT 62,
  	"appearance_border_color" varchar DEFAULT 'rgba(255,255,255,0.16)',
  	"appearance_badge_bg_color" varchar DEFAULT '#117fb2',
  	"appearance_badge_text_color" varchar DEFAULT '#ffffff',
  	"countdown_has_countdown" boolean DEFAULT false,
  	"countdown_countdown_target" timestamp(3) with time zone,
  	"targeting_display_pages" "enum_popups_targeting_display_pages" DEFAULT 'all',
  	"targeting_trigger_type" "enum_popups_targeting_trigger_type" DEFAULT 'on_load',
  	"targeting_trigger_delay" numeric DEFAULT 3,
  	"targeting_trigger_scroll" numeric DEFAULT 50,
  	"targeting_frequency" "enum_popups_targeting_frequency" DEFAULT 'once_session',
  	"targeting_target_audience" "enum_popups_targeting_target_audience" DEFAULT 'all',
  	"targeting_target_role" "enum_popups_targeting_target_role",
  	"targeting_target_device" "enum_popups_targeting_target_device" DEFAULT 'all',
  	"targeting_visitor_condition" "enum_popups_targeting_visitor_condition" DEFAULT 'all',
  	"targeting_purchase_condition" "enum_popups_targeting_purchase_condition" DEFAULT 'all',
  	"targeting_email_capture_condition" "enum_popups_targeting_email_capture_condition" DEFAULT 'all',
  	"targeting_min_session_page_views" numeric,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"priority" numeric DEFAULT 0,
  	"view_count" numeric DEFAULT 0,
  	"click_count" numeric DEFAULT 0,
  	"conversion_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "announcement_bars_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_ar" varchar NOT NULL,
  	"text_en" varchar NOT NULL,
  	"link_url" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "announcement_bars_targeting_specific_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "announcement_bars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_announcement_bars_status" DEFAULT 'draft' NOT NULL,
  	"appearance_position" "enum_announcement_bars_appearance_position" DEFAULT 'top',
  	"appearance_bg_color" varchar DEFAULT '#e94560',
  	"appearance_bg_gradient" varchar,
  	"appearance_text_color" varchar DEFAULT '#ffffff',
  	"appearance_font_size" "enum_announcement_bars_appearance_font_size" DEFAULT 'md',
  	"animation_is_animated" boolean DEFAULT true,
  	"animation_animation_speed" "enum_announcement_bars_animation_animation_speed" DEFAULT 'normal',
  	"animation_animation_direction" "enum_announcement_bars_animation_animation_direction" DEFAULT 'rtl',
  	"cta_button_has_cta_button" boolean DEFAULT false,
  	"cta_button_cta_text" varchar,
  	"cta_button_cta_link" varchar,
  	"countdown_has_countdown" boolean DEFAULT false,
  	"countdown_countdown_target" timestamp(3) with time zone,
  	"behavior_is_dismissible" boolean DEFAULT true,
  	"behavior_remember_dismiss" boolean DEFAULT true,
  	"targeting_display_pages" "enum_announcement_bars_targeting_display_pages" DEFAULT 'all',
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"priority" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "upcoming_events_config_manual_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"program_id" integer,
  	"round_id" integer,
  	"custom_image_id" integer,
  	"custom_url" varchar,
  	"sort_order" numeric DEFAULT 0
  );
  
  CREATE TABLE "upcoming_events_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_enabled" boolean DEFAULT true,
  	"section_title_ar" varchar DEFAULT 'الفعاليات القادمة',
  	"section_title_en" varchar DEFAULT 'Upcoming Events',
  	"mode" "enum_upcoming_events_config_mode" DEFAULT 'automatic',
  	"filter_type" "enum_upcoming_events_config_filter_type" DEFAULT 'all',
  	"max_items" numeric DEFAULT 6,
  	"sort_order" "enum_upcoming_events_config_sort_order" DEFAULT 'date_asc',
  	"auto_play_speed" numeric DEFAULT 5000,
  	"card_display_show_price" boolean DEFAULT true,
  	"card_display_show_date" boolean DEFAULT true,
  	"card_display_show_instructor" boolean DEFAULT true,
  	"card_display_show_location" boolean DEFAULT false,
  	"view_all_link" varchar DEFAULT '/programs',
  	"empty_message_ar" varchar DEFAULT 'لا توجد فعاليات قادمة حالياً',
  	"empty_message_en" varchar DEFAULT 'No upcoming events at this time',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "crm_sync_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"entity_type" "enum_crm_sync_events_entity_type" NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"action" varchar NOT NULL,
  	"dedupe_key" varchar NOT NULL,
  	"status" "enum_crm_sync_events_status" DEFAULT 'pending' NOT NULL,
  	"priority" numeric DEFAULT 50,
  	"attempts" numeric DEFAULT 0,
  	"next_retry_at" timestamp(3) with time zone,
  	"last_error" varchar,
  	"payload_snapshot" jsonb,
  	"result_snapshot" jsonb,
  	"source_collection" varchar,
  	"locked_at" timestamp(3) with time zone,
  	"processed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "programs" ADD COLUMN "featured_priority" numeric DEFAULT 0;
  ALTER TABLE "programs" ADD COLUMN "learners_count" numeric DEFAULT 0;
  ALTER TABLE "sessions" ADD COLUMN "status" "enum_sessions_status" DEFAULT 'scheduled';
  ALTER TABLE "sessions" ADD COLUMN "attendance_count" numeric DEFAULT 0;
  ALTER TABLE "consultation_types" ADD COLUMN "title" varchar;
  ALTER TABLE "consultation_types" ADD COLUMN "description" varchar;
  ALTER TABLE "consultation_availability" ADD COLUMN "day_index" numeric;
  ALTER TABLE "consultation_bookings" ADD COLUMN "twenty_crm_deal_id" varchar;
  ALTER TABLE "reviews" ADD COLUMN "is_video_testimonial" boolean DEFAULT false;
  ALTER TABLE "reviews" ADD COLUMN "video_url" varchar;
  ALTER TABLE "reviews" ADD COLUMN "video_thumbnail_id" integer;
  ALTER TABLE "reviews" ADD COLUMN "video_caption" varchar;
  ALTER TABLE "reviews" ADD COLUMN "video_subtitle" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "bulk_seat_allocations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "popups_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "announcement_bars_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "upcoming_events_config_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "crm_sync_events_id" integer;
  ALTER TABLE "bulk_seat_allocations_allocations" ADD CONSTRAINT "bulk_seat_allocations_allocations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bulk_seat_allocations_allocations" ADD CONSTRAINT "bulk_seat_allocations_allocations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bulk_seat_allocations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bulk_seat_allocations" ADD CONSTRAINT "bulk_seat_allocations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bulk_seat_allocations" ADD CONSTRAINT "bulk_seat_allocations_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "popups_form_form_fields" ADD CONSTRAINT "popups_form_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."popups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "popups_targeting_specific_pages" ADD CONSTRAINT "popups_targeting_specific_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."popups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "popups" ADD CONSTRAINT "popups_content_image_id_media_id_fk" FOREIGN KEY ("content_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "popups" ADD CONSTRAINT "popups_appearance_background_image_id_media_id_fk" FOREIGN KEY ("appearance_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "announcement_bars_messages" ADD CONSTRAINT "announcement_bars_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."announcement_bars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "announcement_bars_targeting_specific_pages" ADD CONSTRAINT "announcement_bars_targeting_specific_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."announcement_bars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "upcoming_events_config_manual_items" ADD CONSTRAINT "upcoming_events_config_manual_items_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "upcoming_events_config_manual_items" ADD CONSTRAINT "upcoming_events_config_manual_items_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "upcoming_events_config_manual_items" ADD CONSTRAINT "upcoming_events_config_manual_items_custom_image_id_media_id_fk" FOREIGN KEY ("custom_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "upcoming_events_config_manual_items" ADD CONSTRAINT "upcoming_events_config_manual_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."upcoming_events_config"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "bulk_seat_allocations_allocations_order_idx" ON "bulk_seat_allocations_allocations" USING btree ("_order");
  CREATE INDEX "bulk_seat_allocations_allocations_parent_id_idx" ON "bulk_seat_allocations_allocations" USING btree ("_parent_id");
  CREATE INDEX "bulk_seat_allocations_allocations_user_idx" ON "bulk_seat_allocations_allocations" USING btree ("user_id");
  CREATE INDEX "bulk_seat_allocations_company_idx" ON "bulk_seat_allocations" USING btree ("company_id");
  CREATE INDEX "bulk_seat_allocations_round_idx" ON "bulk_seat_allocations" USING btree ("round_id");
  CREATE INDEX "bulk_seat_allocations_updated_at_idx" ON "bulk_seat_allocations" USING btree ("updated_at");
  CREATE INDEX "bulk_seat_allocations_created_at_idx" ON "bulk_seat_allocations" USING btree ("created_at");
  CREATE INDEX "popups_form_form_fields_order_idx" ON "popups_form_form_fields" USING btree ("_order");
  CREATE INDEX "popups_form_form_fields_parent_id_idx" ON "popups_form_form_fields" USING btree ("_parent_id");
  CREATE INDEX "popups_targeting_specific_pages_order_idx" ON "popups_targeting_specific_pages" USING btree ("_order");
  CREATE INDEX "popups_targeting_specific_pages_parent_id_idx" ON "popups_targeting_specific_pages" USING btree ("_parent_id");
  CREATE INDEX "popups_content_content_image_idx" ON "popups" USING btree ("content_image_id");
  CREATE INDEX "popups_appearance_appearance_background_image_idx" ON "popups" USING btree ("appearance_background_image_id");
  CREATE INDEX "popups_updated_at_idx" ON "popups" USING btree ("updated_at");
  CREATE INDEX "popups_created_at_idx" ON "popups" USING btree ("created_at");
  CREATE INDEX "announcement_bars_messages_order_idx" ON "announcement_bars_messages" USING btree ("_order");
  CREATE INDEX "announcement_bars_messages_parent_id_idx" ON "announcement_bars_messages" USING btree ("_parent_id");
  CREATE INDEX "announcement_bars_targeting_specific_pages_order_idx" ON "announcement_bars_targeting_specific_pages" USING btree ("_order");
  CREATE INDEX "announcement_bars_targeting_specific_pages_parent_id_idx" ON "announcement_bars_targeting_specific_pages" USING btree ("_parent_id");
  CREATE INDEX "announcement_bars_updated_at_idx" ON "announcement_bars" USING btree ("updated_at");
  CREATE INDEX "announcement_bars_created_at_idx" ON "announcement_bars" USING btree ("created_at");
  CREATE INDEX "upcoming_events_config_manual_items_order_idx" ON "upcoming_events_config_manual_items" USING btree ("_order");
  CREATE INDEX "upcoming_events_config_manual_items_parent_id_idx" ON "upcoming_events_config_manual_items" USING btree ("_parent_id");
  CREATE INDEX "upcoming_events_config_manual_items_program_idx" ON "upcoming_events_config_manual_items" USING btree ("program_id");
  CREATE INDEX "upcoming_events_config_manual_items_round_idx" ON "upcoming_events_config_manual_items" USING btree ("round_id");
  CREATE INDEX "upcoming_events_config_manual_items_custom_image_idx" ON "upcoming_events_config_manual_items" USING btree ("custom_image_id");
  CREATE INDEX "upcoming_events_config_updated_at_idx" ON "upcoming_events_config" USING btree ("updated_at");
  CREATE INDEX "upcoming_events_config_created_at_idx" ON "upcoming_events_config" USING btree ("created_at");
  CREATE INDEX "crm_sync_events_entity_type_idx" ON "crm_sync_events" USING btree ("entity_type");
  CREATE INDEX "crm_sync_events_entity_id_idx" ON "crm_sync_events" USING btree ("entity_id");
  CREATE INDEX "crm_sync_events_action_idx" ON "crm_sync_events" USING btree ("action");
  CREATE UNIQUE INDEX "crm_sync_events_dedupe_key_idx" ON "crm_sync_events" USING btree ("dedupe_key");
  CREATE INDEX "crm_sync_events_status_idx" ON "crm_sync_events" USING btree ("status");
  CREATE INDEX "crm_sync_events_priority_idx" ON "crm_sync_events" USING btree ("priority");
  CREATE INDEX "crm_sync_events_next_retry_at_idx" ON "crm_sync_events" USING btree ("next_retry_at");
  CREATE INDEX "crm_sync_events_updated_at_idx" ON "crm_sync_events" USING btree ("updated_at");
  CREATE INDEX "crm_sync_events_created_at_idx" ON "crm_sync_events" USING btree ("created_at");
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_video_thumbnail_id_media_id_fk" FOREIGN KEY ("video_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bulk_seat_allocations_fk" FOREIGN KEY ("bulk_seat_allocations_id") REFERENCES "public"."bulk_seat_allocations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_popups_fk" FOREIGN KEY ("popups_id") REFERENCES "public"."popups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcement_bars_fk" FOREIGN KEY ("announcement_bars_id") REFERENCES "public"."announcement_bars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_upcoming_events_config_fk" FOREIGN KEY ("upcoming_events_config_id") REFERENCES "public"."upcoming_events_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_crm_sync_events_fk" FOREIGN KEY ("crm_sync_events_id") REFERENCES "public"."crm_sync_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "reviews_video_thumbnail_idx" ON "reviews" USING btree ("video_thumbnail_id");
  CREATE INDEX "payload_locked_documents_rels_bulk_seat_allocations_id_idx" ON "payload_locked_documents_rels" USING btree ("bulk_seat_allocations_id");
  CREATE INDEX "payload_locked_documents_rels_popups_id_idx" ON "payload_locked_documents_rels" USING btree ("popups_id");
  CREATE INDEX "payload_locked_documents_rels_announcement_bars_id_idx" ON "payload_locked_documents_rels" USING btree ("announcement_bars_id");
  CREATE INDEX "payload_locked_documents_rels_upcoming_events_config_id_idx" ON "payload_locked_documents_rels" USING btree ("upcoming_events_config_id");
  CREATE INDEX "payload_locked_documents_rels_crm_sync_events_id_idx" ON "payload_locked_documents_rels" USING btree ("crm_sync_events_id");
  ALTER TABLE "users" DROP COLUMN "locked_until";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bulk_seat_allocations_allocations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bulk_seat_allocations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "popups_form_form_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "popups_targeting_specific_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "popups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "announcement_bars_messages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "announcement_bars_targeting_specific_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "announcement_bars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "upcoming_events_config_manual_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "upcoming_events_config" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "crm_sync_events" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "bulk_seat_allocations_allocations" CASCADE;
  DROP TABLE "bulk_seat_allocations" CASCADE;
  DROP TABLE "popups_form_form_fields" CASCADE;
  DROP TABLE "popups_targeting_specific_pages" CASCADE;
  DROP TABLE "popups" CASCADE;
  DROP TABLE "announcement_bars_messages" CASCADE;
  DROP TABLE "announcement_bars_targeting_specific_pages" CASCADE;
  DROP TABLE "announcement_bars" CASCADE;
  DROP TABLE "upcoming_events_config_manual_items" CASCADE;
  DROP TABLE "upcoming_events_config" CASCADE;
  DROP TABLE "crm_sync_events" CASCADE;
  ALTER TABLE "reviews" DROP CONSTRAINT "reviews_video_thumbnail_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_bulk_seat_allocations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_popups_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_announcement_bars_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_upcoming_events_config_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_crm_sync_events_fk";
  
  DROP INDEX "reviews_video_thumbnail_idx";
  DROP INDEX "payload_locked_documents_rels_bulk_seat_allocations_id_idx";
  DROP INDEX "payload_locked_documents_rels_popups_id_idx";
  DROP INDEX "payload_locked_documents_rels_announcement_bars_id_idx";
  DROP INDEX "payload_locked_documents_rels_upcoming_events_config_id_idx";
  DROP INDEX "payload_locked_documents_rels_crm_sync_events_id_idx";
  ALTER TABLE "users" ADD COLUMN "locked_until" timestamp(3) with time zone;
  ALTER TABLE "programs" DROP COLUMN "featured_priority";
  ALTER TABLE "programs" DROP COLUMN "learners_count";
  ALTER TABLE "sessions" DROP COLUMN "status";
  ALTER TABLE "sessions" DROP COLUMN "attendance_count";
  ALTER TABLE "consultation_types" DROP COLUMN "title";
  ALTER TABLE "consultation_types" DROP COLUMN "description";
  ALTER TABLE "consultation_availability" DROP COLUMN "day_index";
  ALTER TABLE "consultation_bookings" DROP COLUMN "twenty_crm_deal_id";
  ALTER TABLE "reviews" DROP COLUMN "is_video_testimonial";
  ALTER TABLE "reviews" DROP COLUMN "video_url";
  ALTER TABLE "reviews" DROP COLUMN "video_thumbnail_id";
  ALTER TABLE "reviews" DROP COLUMN "video_caption";
  ALTER TABLE "reviews" DROP COLUMN "video_subtitle";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "bulk_seat_allocations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "popups_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "announcement_bars_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "upcoming_events_config_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "crm_sync_events_id";
  DROP TYPE "public"."enum_sessions_status";
  DROP TYPE "public"."enum_bulk_seat_allocations_allocations_status";
  DROP TYPE "public"."enum_bulk_seat_allocations_status";
  DROP TYPE "public"."enum_popups_form_form_fields_field_type";
  DROP TYPE "public"."enum_popups_status";
  DROP TYPE "public"."enum_popups_content_image_position";
  DROP TYPE "public"."enum_popups_promo_promo_delivery";
  DROP TYPE "public"."enum_popups_appearance_style_preset";
  DROP TYPE "public"."enum_popups_appearance_popup_type";
  DROP TYPE "public"."enum_popups_appearance_animation";
  DROP TYPE "public"."enum_popups_targeting_display_pages";
  DROP TYPE "public"."enum_popups_targeting_trigger_type";
  DROP TYPE "public"."enum_popups_targeting_frequency";
  DROP TYPE "public"."enum_popups_targeting_target_audience";
  DROP TYPE "public"."enum_popups_targeting_target_role";
  DROP TYPE "public"."enum_popups_targeting_target_device";
  DROP TYPE "public"."enum_popups_targeting_visitor_condition";
  DROP TYPE "public"."enum_popups_targeting_purchase_condition";
  DROP TYPE "public"."enum_popups_targeting_email_capture_condition";
  DROP TYPE "public"."enum_announcement_bars_status";
  DROP TYPE "public"."enum_announcement_bars_appearance_position";
  DROP TYPE "public"."enum_announcement_bars_appearance_font_size";
  DROP TYPE "public"."enum_announcement_bars_animation_animation_speed";
  DROP TYPE "public"."enum_announcement_bars_animation_animation_direction";
  DROP TYPE "public"."enum_announcement_bars_targeting_display_pages";
  DROP TYPE "public"."enum_upcoming_events_config_mode";
  DROP TYPE "public"."enum_upcoming_events_config_filter_type";
  DROP TYPE "public"."enum_upcoming_events_config_sort_order";
  DROP TYPE "public"."enum_crm_sync_events_entity_type";
  DROP TYPE "public"."enum_crm_sync_events_status";`)
}
