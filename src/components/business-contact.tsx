import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {businessContact} from '@/lib/business-contact';
export function BusinessContact({locale}:{locale:Locale}){
 const {phone,whatsapp}=businessContact(),ar=locale==='ar';
 return <aside className="business-contact" aria-label={ar?'تواصل مع الأمل':'Contact EL AMAL'}><Link href={`/${locale}/rfq`}>{ar?'طلب عرض سعر':'Request a quote'}</Link>{phone&&<a href={`tel:${phone}`}>{ar?'اتصل بنا':'Call us'} <bdi>{phone}</bdi></a>}{whatsapp&&<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">{ar?'واتساب':'WhatsApp'}</a>}</aside>;
}
