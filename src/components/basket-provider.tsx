'use client';
import {createContext,useContext,useEffect,useState,useCallback,type ReactNode} from 'react';
import {addLine,readBasket,type BasketLine} from '@/lib/basket';
import {products} from '@/content/catalogue';
const key='el-amal-preview-basket-v1';
type BasketContextValue={lines:BasketLine[];ready:boolean;storageError:boolean;add:(id:string,qty:number)=>void;update:(id:string,qty:number)=>void;remove:(id:string)=>void};
const BasketContext=createContext<BasketContextValue|null>(null);
export function BasketProvider({children}:{children:ReactNode}) {
 const [lines,setLines]=useState<BasketLine[]>([]),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false);
 useEffect(()=>{try{setLines(readBasket(localStorage.getItem(key)).filter(l=>products.some(p=>p.id===l.productId)));}catch{setStorageError(true);}setReady(true);
 const sync=(e:StorageEvent)=>{if(e.key===key)setLines(readBasket(e.newValue).filter(l=>products.some(p=>p.id===l.productId)));};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(key,JSON.stringify(lines));}catch{setStorageError(true);}},[lines,ready]);
 const add=useCallback((id:string,qty:number)=>setLines(ls=>{try{return addLine(ls,id,qty);}catch{return ls;}}),[]);
 const update=useCallback((id:string,qty:number)=>{if(Number.isSafeInteger(qty)&&qty>0&&qty<=9999)setLines(ls=>ls.map(l=>l.productId===id?{...l,quantity:qty}:l));},[]);
 const remove=useCallback((id:string)=>setLines(ls=>ls.filter(l=>l.productId!==id)),[]);
 return <BasketContext.Provider value={{lines,ready,storageError,add,update,remove}}>{children}</BasketContext.Provider>;
}
export function useBasket(){const value=useContext(BasketContext);if(!value)throw new Error('BasketProvider missing');return value;}
