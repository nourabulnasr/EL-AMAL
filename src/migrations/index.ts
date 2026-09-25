import * as migration_20260918_090933_initial_catalogue from './20260918_090933_initial_catalogue';
import * as migration_20260924_144538_payload_security_upgrade from './20260924_144538_payload_security_upgrade';
import * as migration_20260924_173404_enquiry_inbox from './20260924_173404_enquiry_inbox';
import * as migration_20260924_180259_notification_queue from './20260924_180259_notification_queue';
import * as migration_20260924_182238_client_requirements from './20260924_182238_client_requirements';
import * as migration_20260925_114611_enquiry_verification from './20260925_114611_enquiry_verification';

export const migrations = [
  {
    up: migration_20260918_090933_initial_catalogue.up,
    down: migration_20260918_090933_initial_catalogue.down,
    name: '20260918_090933_initial_catalogue',
  },
  {
    up: migration_20260924_144538_payload_security_upgrade.up,
    down: migration_20260924_144538_payload_security_upgrade.down,
    name: '20260924_144538_payload_security_upgrade',
  },
  {
    up: migration_20260924_173404_enquiry_inbox.up,
    down: migration_20260924_173404_enquiry_inbox.down,
    name: '20260924_173404_enquiry_inbox',
  },
  {
    up: migration_20260924_180259_notification_queue.up,
    down: migration_20260924_180259_notification_queue.down,
    name: '20260924_180259_notification_queue',
  },
  {
    up: migration_20260924_182238_client_requirements.up,
    down: migration_20260924_182238_client_requirements.down,
    name: '20260924_182238_client_requirements',
  },
  {
    up: migration_20260925_114611_enquiry_verification.up,
    down: migration_20260925_114611_enquiry_verification.down,
    name: '20260925_114611_enquiry_verification'
  },
];
