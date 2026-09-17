'use client';
import Link from 'next/link';
import {useParams} from 'next/navigation';
export default function NotFound(){const params=useParams();const ar=params.locale==='ar';return <section className="empty-state"><p>404</p><h1>{ar?'الصفحة غير موجودة':'Page not found'}</h1><Link href={`/${ar?'ar':'en'}/products`} className="button button-dark">{ar?'تصفح الكتالوج':'Explore the catalogue'}</Link></section>;}
