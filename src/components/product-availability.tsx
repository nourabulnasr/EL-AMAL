import type {Locale,Product} from '@/lib/catalogue';
import {copy} from '@/content/copy';
export function ProductAvailability({product,locale}:{product:Product;locale:Locale}){
 const details=product.details,ar=locale==='ar';
 if(!details)return <p className="availability"><span aria-hidden="true"/>{copy[locale].availability}</p>;
 const label=details.availability==='in-stock'?(ar?'متوفر':'In stock'):details.availability==='out-of-stock'?(ar?'غير متوفر':'Out of stock'):(ar?'تحقق من التوفر':'Check availability');
 const date=new Intl.DateTimeFormat(ar?'ar-EG':'en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${details.availabilityReportedAt}T00:00:00Z`));
 return <p className="availability dated-availability"><strong>{label}</strong><small>{ar?'حسب تحديث':'Reported'} <time dateTime={details.availabilityReportedAt}>{date}</time></small></p>;
}
