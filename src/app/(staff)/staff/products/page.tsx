import {headers} from 'next/headers';
import {cmsEnabled} from '@/lib/cms-runtime';
import {canReadDemand,DemandError} from '@/lib/demand-report';
import {parseInterestQuery} from '@/lib/product-interest';
import {interestPayload,interestSettings} from '@/lib/product-interest-runtime';
import {readProductInterest} from '@/lib/product-interest-service';
import {ProductInterestReport} from '@/components/product-interest-report';
import '../reports/reports.css';
export const dynamic='force-dynamic';
export const metadata={title:'Product interest | EL AMAL',robots:{index:false,follow:false}};
export default async function ProductInterestPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  try{
    if(!cmsEnabled())return <section><h1>Product interest</h1><p>Administration must be configured before reports can be shown.</p></section>;
    const payload=await interestPayload(),{user}=await payload.auth({headers:await headers()});
    if(!canReadDemand(user))return <section><h1>Private product report</h1><p>Sign in with an owner or sales account.</p><a className="button" href="/admin/login?redirect=%2Fstaff%2Fproducts">Sign in</a></section>;
    const params=new URLSearchParams();for(const [key,value] of Object.entries(await searchParams))for(const part of Array.isArray(value)?value:value===undefined?[]:[value])params.append(key,part);
    const filters=parseInterestQuery(params);if(filters.format!=='json')throw new DemandError('Use Download CSV to export this report.');
    const report=await readProductInterest(payload,user,filters,!!interestSettings());
    return <ProductInterestReport key={params.toString()} initial={report}/>;
  }catch(error){return <section><h1>Product interest</h1><p role="alert">{error instanceof DemandError?error.message:'Product reporting is temporarily unavailable.'}</p><a href="/staff/products">Reset report filters</a></section>;}
}
