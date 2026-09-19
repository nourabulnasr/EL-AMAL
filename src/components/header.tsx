'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {useBasket} from './basket-provider';
export function Header({locale}:{locale:Locale}){
 const t=copy[locale],path=usePathname(),other=locale==='en'?'ar':'en';
 const {lines,catalogue}=useBasket();const [open,setOpen]=useState(false);
 const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{const marker=document.getElementById('header-marker');if(!marker)return;const observer=new IntersectionObserver(([entry])=>setScrolled(!entry.isIntersecting));observer.observe(marker);return()=>observer.disconnect();},[]);
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);document.getElementById('menu-toggle')?.focus();}};if(open)window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[open]);
 const target=path.replace(/^\/(en|ar)(?=\/|$)/,`/${other}`);
 return <><noscript><style>{'.navigation{display:flex!important;order:4;width:100%;flex-wrap:wrap}.menu-toggle{display:none!important}'}</style></noscript><div className="preview-note">{catalogue.source==='demo'?t.fixture:(locale==='en'?'Client review — enquiries and stock reservations are not yet available.':'معاينة للعميل — إرسال الاستفسارات وحجز المخزون غير متاحين بعد.')}</div><span id="header-marker" aria-hidden="true"/><header className={`site-header ${scrolled?'header-scrolled':''}`}><Link className="wordmark" href={`/${locale}`} aria-label={locale==='en'?'EL AMAL home':'الأمل الرئيسية'}><span className="brand-symbol" aria-hidden="true">A</span><span>EL AMAL<small>{locale==='en'?'Industrial instrumentation':'أجهزة القياس الصناعية'}</small></span></Link>
 <button id="menu-toggle" className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{locale==='en'?'Menu':'القائمة'} <span aria-hidden="true">☰</span></button>
 <nav id="main-navigation" className={open?'navigation navigation-open':'navigation'} aria-label={locale==='en'?'Main navigation':'التنقل الرئيسي'}><Link aria-current={path.includes('/products')||path.includes('/categories')?'page':undefined} href={`/${locale}/products`} onClick={()=>setOpen(false)}>{t.catalogue}</Link><Link href={`/${locale}#industries`} onClick={()=>setOpen(false)}>{t.industries}</Link><Link href={`/${locale}#approach`} onClick={()=>setOpen(false)}>{t.about}</Link></nav>
 <div className="header-actions"><Link className="language" href={target} lang={other} onClick={e=>{e.preventDefault();window.location.assign(target+window.location.search+window.location.hash);}}>{other==='ar'?'العربية':'English'}</Link><Link className="basket-link" href={`/${locale}/quote`}>{t.quote}<span>{lines.length}</span></Link></div></header></>;
}
