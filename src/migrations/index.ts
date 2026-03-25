import * as migration_20260316_020144 from './20260316_020144';
import * as migration_20260321_100401 from './20260321_100401';
import * as migration_20260322_113423_add_round_session_plan from './20260322_113423_add_round_session_plan';
import * as migration_20260322_150750_add_program_rounds_count from './20260322_150750_add_program_rounds_count';
import * as migration_20260325_224823_add_instructor_cover_image from './20260325_224823_add_instructor_cover_image';

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
    name: '20260322_150750_add_program_rounds_count'
  },
  {
    up: migration_20260325_224823_add_instructor_cover_image.up,
    down: migration_20260325_224823_add_instructor_cover_image.down,
    name: '20260325_224823_add_instructor_cover_image'
  },
];
