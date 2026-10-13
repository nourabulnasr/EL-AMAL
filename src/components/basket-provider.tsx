'use client';
import {createContext,useContext,useEffect,useState,useCallback,type ReactNode} from 'react';
import {addLine,readBasket,basketLineKey,normalizeBasket,basketSelectionRequired,selectBasketOption,type BasketLine} from '@/lib/basket';
import type {Catalogue} from '@/lib/public-catalogue';
import type {Product} from '@/lib/catalogue';
import type {CatalogueOption} from '@/lib/catalogue-details';
export type BasketCatalogue={source:Catalogue['source'];products:(Pick<Product,'id'|'model'|'name'>&{options?:CatalogueOption[]})[]};
type BasketContextValue={catalogue:BasketCatalogue;publicEnquiries:boolean;lines:BasketLine[];ready:boolean;storageError:boolean;add:(id:string,qty:number,optionId?:string)=>void;update:(id:string,qty:number,optionId?:string)=>void;remove:(id:string,optionId?:string)=>void;selectOption:(line:BasketLine,optionId:string)=>void};
const BasketContext=createContext<BasketContextValue|null>(null);
export function BasketProvider({children,catalogue,publicEnquiries=false}:{children:ReactNode;catalogue:BasketCatalogue;publicEnquiries?:boolean}){
 const {products,source}=catalogue,key=source==='demo'?'el-amal-preview-basket-v1':'el-amal-cms-basket-v1';
 const [lines,setLines]=useState<BasketLine[]>([]),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false);
 useEffect(()=>{
  try{setLines(normalizeBasket(readBasket(localStorage.getItem(key)),products));}catch{setStorageError(true);}setReady(true);
  const sync=(event:StorageEvent)=>{if(event.key===key)setLines(normalizeBasket(readBasket(event.newValue),products));};
  window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
 },[key,products]);
 useEffect(()=>{if(ready)try{localStorage.setItem(key,JSON.stringify(lines));}catch{setStorageError(true);}},[lines,ready,key]);
 const add=useCallback((id:string,qty:number,optionId?:string)=>{
  const product=products.find(product=>product.id===id);if(!product||basketSelectionRequired({productId:id,quantity:qty,optionId},product))return;
  setLines(current=>{try{return addLine(current,id,qty,optionId);}catch{return current;}});
 },[products]);
 const update=useCallback((id:string,qty:number,optionId?:string)=>{
  if(Number.isSafeInteger(qty)&&qty>0&&qty<=9999)setLines(current=>current.map(line=>basketLineKey(line)===basketLineKey({productId:id,optionId})?{...line,quantity:qty}:line));
 },[]);
 const remove=useCallback((id:string,optionId?:string)=>setLines(current=>current.filter(line=>basketLineKey(line)!==basketLineKey({productId:id,optionId}))),[]);
 const selectOption=useCallback((line:BasketLine,optionId:string)=>{
  if(!products.find(product=>product.id===line.productId)?.options?.some(option=>option.id===optionId))return;
  setLines(current=>{try{return selectBasketOption(current,line,optionId);}catch{return current;}});
 },[products]);
 return <BasketContext.Provider value={{catalogue,publicEnquiries,lines,ready,storageError,add,update,remove,selectOption}}>{children}</BasketContext.Provider>;
}
export function useBasket(){const value=useContext(BasketContext);if(!value)throw new Error('BasketProvider missing');return value;}
