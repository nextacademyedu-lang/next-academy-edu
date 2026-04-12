import * as migration_20260316_020144 from './20260316_020144';
import * as migration_20260321_100401 from './20260321_100401';
import * as migration_20260322_113423_add_round_session_plan from './20260322_113423_add_round_session_plan';
import * as migration_20260322_150750_add_program_rounds_count from './20260322_150750_add_program_rounds_count';
import * as migration_20260325_224823_add_instructor_cover_image from './20260325_224823_add_instructor_cover_image';
import * as migration_20260326_132315_add_partners_collection from './20260326_132315_add_partners_collection';
import * as migration_20260327_001500_add_sessions_google_event_id from './20260327_001500_add_sessions_google_event_id';
import * as migration_20260328_154958_add_instructor_signup_intent_and_verification from './20260328_154958_add_instructor_signup_intent_and_verification';
import * as migration_20260328_192145_add_instructor_program_submissions from './20260328_192145_add_instructor_program_submissions';
import * as migration_20260328_214500_fix_instructor_program_submissions_fk from './20260328_214500_fix_instructor_program_submissions_fk';
import * as migration_20260329_000500_add_b2b_signup_intent from './20260329_000500_add_b2b_signup_intent';
import * as migration_20260329_010500_add_company_invitations from './20260329_010500_add_company_invitations';
import * as migration_20260403_034751_add_b2b_groups_policies_seats from './20260403_034751_add_b2b_groups_policies_seats';
import * as migration_20260403_195416_add_b2b_allocation_mode_fields from './20260403_195416_add_b2b_allocation_mode_fields';
import * as migration_20260408_230000_add_events_collection from './20260408_230000_add_events_collection';
import * as migration_20260409_010000_add_instructor_agreement_and_revenue_fields from './20260409_010000_add_instructor_agreement_and_revenue_fields';
import * as migration_20260411_020000_repair_schema_drift_for_auth_and_events from './20260411_020000_repair_schema_drift_for_auth_and_events';
import * as migration_20260411_030000_require_onboarding_program_details from './20260411_030000_require_onboarding_program_details';
import * as migration_20260411_050000_update_course_revenue_share_terms from './20260411_050000_update_course_revenue_share_terms';
import * as migration_20260412_010000_add_rounds_count_to_program_submissions from './20260412_010000_add_rounds_count_to_program_submissions';
import * as migration_20260412_140000_repair_onboarding_schema_drift from './20260412_140000_repair_onboarding_schema_drift';
import * as migration_20260412_150000_add_instructor_program_submissions_rels from './20260412_150000_add_instructor_program_submissions_rels';

export const migrations = [
  {
    up: migration_20260316_020144.up,
    down: migration_20260316_020144.down,
    name: '20260316_020144',
  },
  {
    up: migration_20260321_100401.up,
    down: migration_20260321_100401.down,
    name: '20260321_100401',
  },
  {
    up: migration_20260322_113423_add_round_session_plan.up,
    down: migration_20260322_113423_add_round_session_plan.down,
    name: '20260322_113423_add_round_session_plan',
  },
  {
    up: migration_20260322_150750_add_program_rounds_count.up,
    down: migration_20260322_150750_add_program_rounds_count.down,
    name: '20260322_150750_add_program_rounds_count',
  },
  {
    up: migration_20260325_224823_add_instructor_cover_image.up,
    down: migration_20260325_224823_add_instructor_cover_image.down,
    name: '20260325_224823_add_instructor_cover_image',
  },
  {
    up: migration_20260326_132315_add_partners_collection.up,
    down: migration_20260326_132315_add_partners_collection.down,
    name: '20260326_132315_add_partners_collection',
  },
  {
    up: migration_20260327_001500_add_sessions_google_event_id.up,
    down: migration_20260327_001500_add_sessions_google_event_id.down,
    name: '20260327_001500_add_sessions_google_event_id',
  },
  {
    up: migration_20260328_154958_add_instructor_signup_intent_and_verification.up,
    down: migration_20260328_154958_add_instructor_signup_intent_and_verification.down,
    name: '20260328_154958_add_instructor_signup_intent_and_verification',
  },
  {
    up: migration_20260328_192145_add_instructor_program_submissions.up,
    down: migration_20260328_192145_add_instructor_program_submissions.down,
    name: '20260328_192145_add_instructor_program_submissions',
  },
  {
    up: migration_20260328_214500_fix_instructor_program_submissions_fk.up,
    down: migration_20260328_214500_fix_instructor_program_submissions_fk.down,
    name: '20260328_214500_fix_instructor_program_submissions_fk',
  },
  {
    up: migration_20260329_000500_add_b2b_signup_intent.up,
    down: migration_20260329_000500_add_b2b_signup_intent.down,
    name: '20260329_000500_add_b2b_signup_intent',
  },
  {
    up: migration_20260329_010500_add_company_invitations.up,
    down: migration_20260329_010500_add_company_invitations.down,
    name: '20260329_010500_add_company_invitations',
  },
  {
    up: migration_20260403_034751_add_b2b_groups_policies_seats.up,
    down: migration_20260403_034751_add_b2b_groups_policies_seats.down,
    name: '20260403_034751_add_b2b_groups_policies_seats',
  },
  {
    up: migration_20260403_195416_add_b2b_allocation_mode_fields.up,
    down: migration_20260403_195416_add_b2b_allocation_mode_fields.down,
    name: '20260403_195416_add_b2b_allocation_mode_fields',
  },
  {
    up: migration_20260408_230000_add_events_collection.up,
    down: migration_20260408_230000_add_events_collection.down,
    name: '20260408_230000_add_events_collection',
  },
  {
    up: migration_20260409_010000_add_instructor_agreement_and_revenue_fields.up,
    down: migration_20260409_010000_add_instructor_agreement_and_revenue_fields.down,
    name: '20260409_010000_add_instructor_agreement_and_revenue_fields',
  },
  {
    up: migration_20260411_020000_repair_schema_drift_for_auth_and_events.up,
    down: migration_20260411_020000_repair_schema_drift_for_auth_and_events.down,
    name: '20260411_020000_repair_schema_drift_for_auth_and_events',
  },
  {
    up: migration_20260411_030000_require_onboarding_program_details.up,
    down: migration_20260411_030000_require_onboarding_program_details.down,
    name: '20260411_030000_require_onboarding_program_details',
  },
  {
    up: migration_20260411_050000_update_course_revenue_share_terms.up,
    down: migration_20260411_050000_update_course_revenue_share_terms.down,
    name: '20260411_050000_update_course_revenue_share_terms',
  },
  {
    up: migration_20260412_010000_add_rounds_count_to_program_submissions.up,
    down: migration_20260412_010000_add_rounds_count_to_program_submissions.down,
    name: '20260412_010000_add_rounds_count_to_program_submissions',
  },
  {
    up: migration_20260412_140000_repair_onboarding_schema_drift.up,
    down: migration_20260412_140000_repair_onboarding_schema_drift.down,
    name: '20260412_140000_repair_onboarding_schema_drift',
  },
  {
    up: migration_20260412_150000_add_instructor_program_submissions_rels.up,
    down: migration_20260412_150000_add_instructor_program_submissions_rels.down,
    name: '20260412_150000_add_instructor_program_submissions_rels',
  },
];
