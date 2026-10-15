'use client';

import {useSearchParams} from 'next/navigation';
import {useEffect,useState,type SyntheticEvent} from 'react';
import type {Locale} from '@/lib/catalogue';

export function LanguageLink({target,locale}:{target:string;locale:Locale}){
 const search=useSearchParams().toString();
 const [hash,setHash]=useState('');

 useEffect(()=>{
  const updateHash=()=>setHash(window.location.hash);
  updateHash();
  window.addEventListener('hashchange',updateHash);
  window.addEventListener('popstate',updateHash);
  return()=>{
   window.removeEventListener('hashchange',updateHash);
   window.removeEventListener('popstate',updateHash);
  };
 },[target,search]);

 // A hash-only client navigation can use pushState without a hashchange event.
 // Refresh the real destination without intercepting native browser navigation.
 const refreshHref=(event:SyntheticEvent<HTMLAnchorElement>)=>{
  event.currentTarget.href=target+window.location.search+window.location.hash;
 };

 return <a
  className="language"
  href={target+(search?`?${search}`:'')+hash}
  lang={locale}
  onFocus={refreshHref}
  onPointerDown={refreshHref}
  onClick={refreshHref}
  onAuxClick={refreshHref}
  onContextMenu={refreshHref}
 >{locale==='ar'?'العربية':'English'}</a>;
}
