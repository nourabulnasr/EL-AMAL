import type {Locale} from '@/lib/catalogue';
import {safeDatasheetUrl} from '@/lib/public-catalogue';
// Populate only after the client supplies approved bilingual wording and evidence.
export function WikaEvidence({locale}:{locale:Locale}){
 const en=process.env.WIKA_RELATIONSHIP_EN,ar=process.env.WIKA_RELATIONSHIP_AR;
 const evidence=safeDatasheetUrl(process.env.WIKA_EVIDENCE_URL);
 if(!en||!ar||!evidence)return null;
 return <section className="section wika-evidence"><p className="section-kicker">WIKA</p><h2>{locale==='ar'?ar:en}</h2><a className="text-link" href={evidence} target="_blank" rel="noopener noreferrer">{locale==='ar'?'عرض مستند العلاقة التجارية':'View relationship documentation'} ↗</a></section>;
}
