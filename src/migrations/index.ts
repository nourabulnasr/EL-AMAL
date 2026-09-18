import * as migration_20260918_090933_initial_catalogue from './20260918_090933_initial_catalogue';

export const migrations = [
  {
    up: migration_20260918_090933_initial_catalogue.up,
    down: migration_20260918_090933_initial_catalogue.down,
    name: '20260918_090933_initial_catalogue'
  },
];
