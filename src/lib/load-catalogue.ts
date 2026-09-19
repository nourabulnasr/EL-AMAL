import 'server-only';
import {cache} from 'react';
import {connection} from 'next/server';
import {products,categories} from '@/content/catalogue';
import {cmsEnabled} from './cms-runtime';
import {catalogueSource,toPublicCatalogue,type Catalogue} from './public-catalogue';

// Request-scoped deduplication only: a new request sees publication/unpublication immediately.
export const loadCatalogue=cache(async ():Promise<Catalogue>=>{
 if(catalogueSource(process.env.CATALOGUE_SOURCE)==='demo')return {source:'demo',products,categories};
 await connection();
 if(!cmsEnabled())throw new Error('CMS catalogue requires configured CMS access');
 const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);
 const payload=await getPayload({config});
 // Trusted server read is needed for publication evidence and private category relationships.
 // Only the explicit public projection below crosses the server boundary. No staff/SKUs are queried.
 const productDocs=[];
 let page=1;
 while(true){
  const result=await payload.find({collection:'products',overrideAccess:true,draft:false,
   where:{_status:{equals:'published'}},depth:0,limit:200,page,sort:'id'});
  productDocs.push(...result.docs);
  if(!result.hasNextPage)break;
  page++;
 }
 const categoryDocs=[];
 page=1;
 while(true){
  const result=await payload.find({collection:'categories',overrideAccess:true,depth:0,limit:200,page,sort:'id'});
  categoryDocs.push(...result.docs);
  if(!result.hasNextPage)break;
  page++;
 }
 // Do not replace a failed or empty real catalogue with plausible-looking demo records.
 return toPublicCatalogue(productDocs,categoryDocs);
});
