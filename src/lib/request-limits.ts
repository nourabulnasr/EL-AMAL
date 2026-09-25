import {createHmac} from 'node:crypto';
import {isIP} from 'node:net';
import type {Payload} from 'payload';
export function requestLimitKey(headers:Headers,scope:string,env:Record<string,string|undefined>=process.env){
 if((env.PAYLOAD_SECRET?.length??0)<32)throw new Error('Rate limiting unavailable');
 // Only trust this header when running directly behind the configured Vercel proxy.
 const forwarded=env.VERCEL==='1'?headers.get('x-forwarded-for')?.trim():undefined;
 const identity=forwarded&&forwarded.length<=64&&isIP(forwarded)?forwarded.toLowerCase():'shared';
 return createHmac('sha256',env.PAYLOAD_SECRET!).update(`request-limit-v1:${scope}:${identity}`).digest('hex');
}
export async function allowRequest(payload:Payload,key:string,limit=10){
 if(!/^[a-f0-9]{64}$/.test(key)||!Number.isInteger(limit)||limit<1||limit>1000)throw new Error('Invalid request limit');
 const result=await payload.db.pool.query(`INSERT INTO request_limits (key,hits,window_ends_at,created_at,updated_at)
 VALUES ($1,1,now()+interval '1 minute',now(),now()) ON CONFLICT (key) DO UPDATE
 SET hits=CASE WHEN request_limits.window_ends_at<=now() THEN 1 ELSE LEAST(request_limits.hits+1,$2+1) END,
 window_ends_at=CASE WHEN request_limits.window_ends_at<=now() THEN now()+interval '1 minute' ELSE request_limits.window_ends_at END,updated_at=now()
 RETURNING hits`,[key,limit]);
 // Bounded removal of stale pseudonymous buckets; no raw IPs or tokens are stored.
 await payload.db.pool.query("DELETE FROM request_limits WHERE id IN (SELECT id FROM request_limits WHERE window_ends_at<now()-interval '1 day' LIMIT 100)");
 return Number(result.rows[0].hits)<=limit;
}
