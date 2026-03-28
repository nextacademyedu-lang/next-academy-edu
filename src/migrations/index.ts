import * as migration_20260316_020144 from './20260316_020144';
import * as migration_20260321_100401 from './20260321_100401';
import * as migration_20260322_113423_add_round_session_plan from './20260322_113423_add_round_session_plan';
import * as migration_20260322_150750_add_program_rounds_count from './20260322_150750_add_program_rounds_count';
import * as migration_20260325_224823_add_instructor_cover_image from './20260325_224823_add_instructor_cover_image';
import * as migration_20260326_132315_add_partners_collection from './20260326_132315_add_partners_collection';
import * as migration_20260327_001500_add_sessions_google_event_id from './20260327_001500_add_sessions_google_event_id';
import * as migration_20260328_154958_add_instructor_signup_intent_and_verification from './20260328_154958_add_instructor_signup_intent_and_verification';
import * as migration_20260328_192145_add_instructor_program_submissions from './20260328_192145_add_instructor_program_submissions';

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
    name: '20260328_192145_add_instructor_program_submissions'
  },
];
