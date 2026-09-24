import * as migration_20260918_090933_initial_catalogue from './20260918_090933_initial_catalogue';
import * as migration_20260924_144538_payload_security_upgrade from './20260924_144538_payload_security_upgrade';

export const migrations = [
  {
    up: migration_20260918_090933_initial_catalogue.up,
    down: migration_20260918_090933_initial_catalogue.down,
    name: '20260918_090933_initial_catalogue',
  },
  {
    up: migration_20260924_144538_payload_security_upgrade.up,
    down: migration_20260924_144538_payload_security_upgrade.down,
    name: '20260924_144538_payload_security_upgrade'
  },
];
