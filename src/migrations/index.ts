import * as migration_20260316_020144 from './20260316_020144';

export const migrations = [
  {
    up: migration_20260316_020144.up,
    down: migration_20260316_020144.down,
    name: '20260316_020144'
  },
];
