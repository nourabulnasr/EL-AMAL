import * as migration_20260918_090933_initial_catalogue from './20260918_090933_initial_catalogue';
import * as migration_20260924_144538_payload_security_upgrade from './20260924_144538_payload_security_upgrade';
import * as migration_20260924_173404_enquiry_inbox from './20260924_173404_enquiry_inbox';
import * as migration_20260924_180259_notification_queue from './20260924_180259_notification_queue';
import * as migration_20260924_182238_client_requirements from './20260924_182238_client_requirements';
import * as migration_20260925_114611_enquiry_verification from './20260925_114611_enquiry_verification';
import * as migration_20260925_121725_verification_email_outbox from './20260925_121725_verification_email_outbox';
import * as migration_20260927_203909_catalogue_details from './20260927_203909_catalogue_details';
import * as migration_20260929_002849_launch_operations from './20260929_002849_launch_operations';
import * as migration_20260929_141342_inventory_completion from './20260929_141342_inventory_completion';
import * as migration_20261001_120000_existing_quotations from './20261001_120000_existing_quotations';
import * as migration_20261007_120000_product_interest from './20261007_120000_product_interest';

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
    name: '20260925_114611_enquiry_verification',
  },
  {
    up: migration_20260925_121725_verification_email_outbox.up,
    down: migration_20260925_121725_verification_email_outbox.down,
    name: '20260925_121725_verification_email_outbox',
  },
  {
    up: migration_20260927_203909_catalogue_details.up,
    down: migration_20260927_203909_catalogue_details.down,
    name: '20260927_203909_catalogue_details',
  },
  {
    up: migration_20260929_002849_launch_operations.up,
    down: migration_20260929_002849_launch_operations.down,
    name: '20260929_002849_launch_operations',
  },
  {
    up: migration_20260929_141342_inventory_completion.up,
    down: migration_20260929_141342_inventory_completion.down,
    name: '20260929_141342_inventory_completion'
  },
  {up:migration_20261001_120000_existing_quotations.up,down:migration_20261001_120000_existing_quotations.down,name:'20261001_120000_existing_quotations'},
  {up:migration_20261007_120000_product_interest.up,down:migration_20261007_120000_product_interest.down,name:'20261007_120000_product_interest'},
];
