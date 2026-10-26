import 'server-only';
import {cache} from 'react';
import {createHash} from 'node:crypto';
import {unstable_cache} from 'next/cache';
import {connection} from 'next/server';
import {products,categories} from '@/content/catalogue';
import {cmsEnabled} from './cms-runtime';
import {catalogueSource,toPublicCatalogue,type Catalogue} from './public-catalogue';
import {readCatalogueRecords} from './read-catalogue-records';

// Deduplicate within a render. Across requests, check lightweight revisions before
// reusing public content so withdrawals remain visible on the next request.
export const loadCatalogue=cache(async ():Promise<Catalogue>=>{
 if(catalogueSource(process.env.CATALOGUE_SOURCE)==='demo')return {source:'demo',products,categories};
 await connection();
 if(!cmsEnabled())throw new Error('CMS catalogue requires configured CMS access');
 const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);
 const payload=await getPayload({config});
 const revisions=await readCatalogueRecords(
  page=>payload.find({collection:'products',overrideAccess:true,draft:false,
   where:{_status:{equals:'published'}},select:{updatedAt:true},depth:0,limit:200,page,sort:'id'}),
  page=>payload.find({collection:'categories',overrideAccess:true,select:{updatedAt:true},depth:0,limit:200,page,sort:'id'}),
 );
 // Namespace by database and release without storing a connection secret as a cache key.
 // Both membership and timestamps matter: deletions/unpublishing must also miss the cache.
 const revision=createHash('sha256').update(JSON.stringify([
  process.env.DATABASE_URL,process.env.VERCEL_GIT_COMMIT_SHA??'local',revisions,
 ])).digest('hex');
 return unstable_cache(async()=>{
  // Trusted server read is needed for publication evidence and private category relationships.
  // Only the explicit public projection below crosses the server boundary. No staff/SKUs are queried.
  const [productDocs,categoryDocs]=await readCatalogueRecords(
   page=>payload.find({collection:'products',overrideAccess:true,draft:false,
    where:{_status:{equals:'published'}},depth:0,limit:200,page,sort:'id'}),
   page=>payload.find({collection:'categories',overrideAccess:true,depth:0,limit:200,page,sort:'id'}),
  );
  // Do not replace a failed or empty real catalogue with plausible-looking demo records.
  return toPublicCatalogue(productDocs,categoryDocs);
 },['public-catalogue-v1',revision],{revalidate:300})();
});
