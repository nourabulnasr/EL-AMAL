import {type MigrateUpArgs,type MigrateDownArgs,sql} from '@payloadcms/db-postgres';
import {interestSchema} from '../lib/product-interest-schema';
export async function up({db}:MigrateUpArgs):Promise<void>{await db.execute(sql.raw(interestSchema));}
export async function down({db}:MigrateDownArgs):Promise<void>{
  await db.execute(sql`DO $$ BEGIN
    IF EXISTS(SELECT 1 FROM product_interest) THEN RAISE EXCEPTION 'Product measurements exist; archive or expire them before rollback'; END IF;
  END $$; DROP TABLE product_interest;`);
}
