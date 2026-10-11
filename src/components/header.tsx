'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {useBasket} from './basket-provider';
import {BrandLogo} from './brand-logo';
export function Header({locale}:{locale:Locale}){
 const t=copy[locale],path=usePathname(),other=locale==='en'?'ar':'en';
 const {lines,catalogue,publicEnquiries}=useBasket();const [open,setOpen]=useState(false);
 const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{const marker=document.getElementById('header-marker');if(!marker)return;const observer=new IntersectionObserver(([entry])=>setScrolled(!entry.isIntersecting));observer.observe(marker);return()=>observer.disconnect();},[]);
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);document.getElementById('menu-toggle')?.focus();}};if(open)window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[open]);
 const target=path.replace(/^\/(en|ar)(?=\/|$)/,`/${other}`);
 return <><noscript><style>{'.navigation{display:flex!important;order:4;width:100%;flex-wrap:wrap}.menu-toggle{display:none!important}'}</style></noscript><aside className="preview-note" aria-label={locale==='en'?'Website status':'حالة الموقع'}>{catalogue.source==='demo'?t.fixture:publicEnquiries?(locale==='en'?'Submit your requirement. Confirm your email. Our team reviews the details.':'أرسل متطلباتك وأكد بريدك الإلكتروني ليراجع فريقنا التفاصيل.'):(locale==='en'?'Client review — enquiries and stock reservations are not yet available.':'معاينة للعميل — إرسال الاستفسارات وحجز المخزون غير متاحين بعد.')}</aside><span id="header-marker" aria-hidden="true"/><header className={`site-header ${scrolled?'header-scrolled':''}`}><Link className="wordmark brand-wordmark" href={`/${locale}`} aria-label={locale==='en'?'EL AMAL Industrial instrumentation — Home':'EL AMAL أجهزة القياس الصناعية — الرئيسية'}><BrandLogo placement="header"/><small>{locale==='en'?'Industrial instrumentation':'أجهزة القياس الصناعية'}</small></Link>
 <button id="menu-toggle" className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{locale==='en'?'Menu':'القائمة'} <span aria-hidden="true">☰</span></button>
 <nav id="main-navigation" className={open?'navigation navigation-open':'navigation'} aria-label={locale==='en'?'Main navigation':'التنقل الرئيسي'}><Link aria-current={path.includes('/products')||path.includes('/categories')?'page':undefined} href={`/${locale}/products`} onClick={()=>setOpen(false)}>{t.catalogue}</Link><Link aria-current={path===`/${locale}/about`?'page':undefined} href={`/${locale}/about`} onClick={()=>setOpen(false)}>{locale==='ar'?'من نحن':'About us'}</Link><Link aria-current={path===`/${locale}/rfq`?'page':undefined} href={`/${locale}/rfq`} onClick={()=>setOpen(false)}>{locale==='ar'?'طلب عرض سعر':'Request a quote'}</Link><Link aria-current={path===`/${locale}/contact`?'page':undefined} href={`/${locale}/contact`} onClick={()=>setOpen(false)}>{locale==='ar'?'تواصل معنا':'Contact'}</Link></nav>
 <div className="header-actions"><Link className="language" href={target} lang={other} onClick={e=>{e.preventDefault();window.location.assign(target+window.location.search+window.location.hash);}}>{other==='ar'?'العربية':'English'}</Link><Link className="basket-link" href={`/${locale}/quote`}>{t.quote}<span>{lines.length}</span></Link></div></header></>;
}
