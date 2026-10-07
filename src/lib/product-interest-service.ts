import type {Payload} from 'payload';
import {canReadDemand,DemandError} from './demand-report.ts';
import {interestMetrics,parseInterestEvents,type InterestEvent,type InterestQuery,type InterestReport,type InterestRow} from './product-interest.ts';
import {interestSessionHash,type InterestSession} from './product-interest-session.ts';

export async function removeExpiredProductInterest(payload:Payload){
  const client=await payload.db.pool.connect();
  try{
    await client.query('BEGIN');await client.query("SET LOCAL statement_timeout='3s'; SET LOCAL lock_timeout='1s'");
    const present=await client.query("SELECT to_regclass('product_interest') AS present");
    if(present.rows[0].present)await client.query('DELETE FROM product_interest WHERE ctid IN (SELECT ctid FROM product_interest WHERE expires_at<=now() LIMIT 10000 FOR UPDATE SKIP LOCKED)');
    await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
export async function saveProductInterest(payload:Payload,session:InterestSession,input:InterestEvent[],secret:string){
  const events=parseInterestEvents({events:input});
  const client=await payload.db.pool.connect();
  try{
    await client.query('BEGIN');
    await client.query("SET LOCAL statement_timeout='5s'; SET LOCAL lock_timeout='2s'; SET LOCAL idle_in_transaction_session_timeout='10s'");
    // Serialize collector writes across instances to enforce capacity without races.
    await client.query("SELECT pg_advisory_xact_lock(hashtext(current_schema()),1072026)");
    await client.query('DELETE FROM product_interest WHERE ctid IN (SELECT ctid FROM product_interest WHERE expires_at<=now() LIMIT 2000)');
    const capacity=await client.query('SELECT count(*)::integer AS count FROM (SELECT 1 FROM product_interest LIMIT 100000) bounded');
    const products=await client.query(`SELECT p.id,p.model FROM products p JOIN categories c ON c.id=p.category_id
      WHERE p.id=ANY($1::integer[]) AND p._status='published' AND p.rights_confirmed=true AND p.reviewed_by_id IS NOT NULL AND p.reviewed_at IS NOT NULL
      AND length(trim(p.source_ref))>0 AND length(trim(p.name_en))>0 AND length(trim(p.name_ar))>0
      AND length(trim(p.description_en))>0 AND length(trim(p.description_ar))>0 AND length(trim(c.key))>0
      AND length(trim(c.name_en))>0 AND length(trim(c.name_ar))>0`,[[...new Set(events.map(event=>Number(event.productId.slice(4))))]]);
    const models=new Map<number,string>(products.rows.map(row=>[row.id,row.model]));
    if(events.some(event=>!models.has(Number(event.productId.slice(4)))))throw new DemandError('Unknown published product.');
    const hash=interestSessionHash(session,secret);
    const grouped=new Map<string,{product_id:number;model:string;locale:string;list:string;impression:boolean;selection:boolean;view:boolean;basket:boolean;datasheet:boolean}>();
    for(const event of events){
      const id=Number(event.productId.slice(4)),key=JSON.stringify([id,event.locale,event.list]);
      const row=grouped.get(key)??{product_id:id,model:models.get(id)!,locale:event.locale,list:event.list,impression:false,selection:false,view:false,basket:false,datasheet:false};
      row[event.kind]=true;grouped.set(key,row);
    }
    const records=JSON.stringify([...grouped.values()]);
    const extra=await client.query(`SELECT count(*)::integer AS count FROM jsonb_to_recordset($1::jsonb) AS incoming(product_id integer,locale text,list text)
      WHERE NOT EXISTS(SELECT 1 FROM product_interest p WHERE p.session_hash=$2 AND p.product_id=incoming.product_id AND p.locale=incoming.locale AND p.list=incoming.list AND p.device=$3)`,[records,hash,session.device]);
    if(capacity.rows[0].count+extra.rows[0].count>100000)throw new DemandError('Measurement capacity reached.',503);
    await client.query(`INSERT INTO product_interest(session_hash,product_id,model,locale,device,list,impression_at,selection_at,view_at,basket_at,datasheet_at)
      SELECT $2,product_id,model,locale,$3,list,CASE WHEN impression THEN now() END,CASE WHEN selection THEN now() END,CASE WHEN view THEN now() END,CASE WHEN basket THEN now() END,CASE WHEN datasheet THEN now() END
      FROM jsonb_to_recordset($1::jsonb) AS incoming(product_id integer,model text,locale text,list text,impression boolean,selection boolean,view boolean,basket boolean,datasheet boolean)
      ON CONFLICT(session_hash,product_id,locale,device,list) DO UPDATE SET
      impression_at=COALESCE(product_interest.impression_at,EXCLUDED.impression_at),selection_at=COALESCE(product_interest.selection_at,EXCLUDED.selection_at),
      view_at=COALESCE(product_interest.view_at,EXCLUDED.view_at),basket_at=COALESCE(product_interest.basket_at,EXCLUDED.basket_at),datasheet_at=COALESCE(product_interest.datasheet_at,EXCLUDED.datasheet_at)`,[records,hash,session.device]);
    await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

export async function readProductInterest(payload:Payload,actor:unknown,filters:InterestQuery,enabled:boolean):Promise<InterestReport>{
  if(!canReadDemand(actor))throw new DemandError('Owner or sales access is required.',403);
  const client=await payload.db.pool.connect();
  try{
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await client.query("SET LOCAL statement_timeout='8s'; SET LOCAL lock_timeout='2s'; SET LOCAL idle_in_transaction_session_timeout='15s'");
    const stored=await client.query('SELECT id,role FROM staff WHERE id=$1',[actor.id]);
    if(!canReadDemand({...stored.rows[0],collection:'staff'}))throw new DemandError('Owner or sales access is required.',403);
    const present=await client.query("SELECT to_regclass('product_interest') AS present");
    if(!present.rows[0].present){await client.query('COMMIT');return {filters,rows:[],updatedAt:new Date().toISOString(),enabled:false};}
    const inRange=(column:string)=>`${column}>=bounds.start AND ${column}<bounds.finish`;
    const result=await client.query(`WITH bounds AS (SELECT ($1::date::timestamp AT TIME ZONE 'Africa/Cairo') AS start,(($2::date+1)::timestamp AT TIME ZONE 'Africa/Cairo') AS finish),
      visits AS (SELECT product_id,session_hash,max(model) AS model,
        bool_or(${inRange('impression_at')}) AS impression,
        bool_or(${inRange('impression_at')} AND ${inRange('selection_at')}) AS selection,
        bool_or(${inRange('view_at')}) AS view, bool_or(${inRange('basket_at')}) AS basket, bool_or(${inRange('datasheet_at')}) AS datasheet
        FROM product_interest CROSS JOIN bounds
        WHERE expires_at>now() AND ($3='all' OR locale=$3) AND ($4='all' OR device=$4) AND ($5='all' OR list=$5)
        AND created_at<bounds.finish AND created_at>=bounds.start-interval '30 minutes'
        GROUP BY product_id,session_hash)
      SELECT 'cms-'||product_id AS "productId",max(model) AS model,
        count(*) FILTER(WHERE impression)::integer AS impressions,count(*) FILTER(WHERE selection)::integer AS selections,
        count(*) FILTER(WHERE view)::integer AS views,count(*) FILTER(WHERE basket)::integer AS "basketAdds",count(*) FILTER(WHERE datasheet)::integer AS datasheets
      FROM visits GROUP BY product_id ORDER BY product_id LIMIT 5001`,[filters.start,filters.end,filters.locale,filters.device,filters.list]);
    if(result.rows.length>5000)throw new DemandError('Too many products. Narrow the report filters.',413);
    const rows:InterestRow[]=result.rows.map(row=>({...row,...interestMetrics(row.impressions,row.selections)}));
    rows.sort((a,b)=>(b[filters.sort]??-1)-(a[filters.sort]??-1)||b.impressions-a.impressions||a.model.localeCompare(b.model));
    await client.query('COMMIT');return {filters,rows,updatedAt:new Date().toISOString(),enabled};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
