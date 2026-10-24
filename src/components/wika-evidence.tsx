import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {safeDatasheetUrl} from '@/lib/public-catalogue';
import {wikaRelationship} from '@/content/business-profile';
import {RevealText} from './reveal-text';

export function WikaEvidence({locale}:{locale:Locale}){
 const evidence=safeDatasheetUrl(process.env.WIKA_EVIDENCE_URL);
 const ar=locale==='ar';
 return <section className="section wika-evidence wika-partnership" aria-labelledby="wika-relationship">
  <div className="framed-copy wika-statement">
   <p className="section-kicker">{ar?'الأمل × WIKA':'EL AMAL × WIKA'}</p>
   <h2 id="wika-relationship"><RevealText>{wikaRelationship[locale]}</RevealText></h2>
   <p className="wika-statement-note">{ar?'خبرة في القياس. اهتمام بكل اختيار.':'Measurement expertise. Care in every selection.'}</p>
   {evidence&&<a className="text-link" href={evidence} target="_blank" rel="noopener noreferrer">{ar?'عرض مستند العلاقة التجارية':'View relationship documentation'} <span aria-hidden="true">↗</span></a>}
  </div>
  <div className="wika-context">
   <p className="section-kicker">{ar?'من المصنّع إلى تطبيقك':'From manufacturer to your application'}</p>
   <h3>{ar?'القياس الدقيق يبدأ بالتفاصيل الصحيحة.':'Precision begins with the right details.'}</h3>
   <p>{ar?'تتخصص WIKA في تقنيات القياس الصناعية. استكشف لدى الأمل أجهزة قياس الضغط ودرجة الحرارة والصمامات والملحقات، مع المواصفات والمستندات الفنية للمصنّع.':'WIKA specialises in industrial measurement technology. Explore pressure and temperature instruments, valves and accessories through EL AMAL, with specifications and manufacturer technical documents.'}</p>
   <dl>
    <div><dt>{ar?'اختر وفق التطبيق':'Select for the application'}</dt><dd>{ar?'قارن نطاق القياس ووصلات العملية والمواد قبل تحديد التكوين.':'Compare measurement range, process connections and materials before selecting a configuration.'}</dd></div>
    <div><dt>{ar?'انتقل إلى عرض السعر':'Move to a quotation'}</dt><dd>{ar?'أرسل الطراز والكمية أو ارفع ملف متطلباتك لتأكيد التكوين والتوفر.':'Send the model and quantity, or upload your requirements to confirm configuration and availability.'}</dd></div>
   </dl>
   <div className="wika-context-links"><Link className="text-link" href={'/'+locale+'/products'}>{ar?'استكشف الأجهزة':'Explore the instruments'} <span aria-hidden="true">↗</span></Link><a className="text-link" href="https://www.wika.com/en-en/company.WIKA" target="_blank" rel="noopener noreferrer">{ar?'عن WIKA':'About WIKA'} <span aria-hidden="true">↗</span></a></div>
  </div>
 </section>;
}
