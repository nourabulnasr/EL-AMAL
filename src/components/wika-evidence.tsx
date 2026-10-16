import type {Locale} from '@/lib/catalogue';
import {safeDatasheetUrl} from '@/lib/public-catalogue';
import {wikaRelationship} from '@/content/business-profile';

export function WikaEvidence({locale}:{locale:Locale}){
 const evidence=safeDatasheetUrl(process.env.WIKA_EVIDENCE_URL);
 return <section className="section wika-evidence" aria-labelledby="wika-relationship"><div className="framed-copy"><p className="section-kicker">WIKA</p><h2 id="wika-relationship">{wikaRelationship[locale]}</h2>{evidence&&<a className="text-link" href={evidence} target="_blank" rel="noopener noreferrer">{locale==='ar'?'عرض مستند العلاقة التجارية':'View relationship documentation'} <span aria-hidden="true">↗</span></a>}</div></section>;
}
