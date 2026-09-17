'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {useBasket} from './basket-provider';
export function Header({locale}:{locale:Locale}){
 const t=copy[locale],path=usePathname(),other=locale==='en'?'ar':'en';
 const {lines}=useBasket();const [open,setOpen]=useState(false);
 const target=path.replace(/^\/(en|ar)(?=\/|$)/,`/${other}`);
 return <><noscript><style>{'.navigation{display:flex!important;order:4;width:100%;flex-wrap:wrap}.menu-toggle{display:none!important}'}</style></noscript><div className="preview-note">{t.fixture}</div><header className="site-header"><Link className="wordmark" href={`/${locale}`} aria-label={locale==='en'?'EL AMAL home':'الأمل الرئيسية'}><span className="brand-symbol" aria-hidden="true">A</span><span>EL AMAL<small>{locale==='en'?'Industrial instrumentation':'أجهزة القياس الصناعية'}</small></span></Link>
 <button className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{locale==='en'?'Menu':'القائمة'} <span aria-hidden="true">☰</span></button>
 <nav id="main-navigation" className={open?'navigation navigation-open':'navigation'} aria-label={locale==='en'?'Main navigation':'التنقل الرئيسي'}><Link href={`/${locale}/products`} onClick={()=>setOpen(false)}>{t.catalogue}</Link><Link href={`/${locale}#industries`} onClick={()=>setOpen(false)}>{t.industries}</Link><Link href={`/${locale}#approach`} onClick={()=>setOpen(false)}>{t.about}</Link></nav>
 <div className="header-actions"><Link className="language" href={target} lang={other} onClick={e=>{e.preventDefault();window.location.assign(target+window.location.search+window.location.hash);}}>{other==='ar'?'العربية':'English'}</Link><Link className="basket-link" href={`/${locale}/quote`}>{t.quote}<span>{lines.length}</span></Link></div></header></>;
}
