'use client';
import {createContext,useContext,useEffect,useState,useCallback,type ReactNode} from 'react';
import {addLine,readBasket,basketLineKey,normalizeBasket,basketSelectionRequired,selectBasketOption,type BasketLine} from '@/lib/basket';
import type {Catalogue} from '@/lib/public-catalogue';
import type {Product} from '@/lib/catalogue';
import type {CatalogueOption} from '@/lib/catalogue-details';
import {resolveConfiguration,type Configuration,type ConfigProduct} from '@/lib/product-configuration';
export type BasketCatalogue={source:Catalogue['source'];products:(Pick<Product,'id'|'model'|'name'>&{options?:CatalogueOption[];configurationProduct?:ConfigProduct})[]};
type BasketContextValue={catalogue:BasketCatalogue;publicEnquiries:boolean;lines:BasketLine[];ready:boolean;storageError:boolean;add:(id:string,qty:number,optionId?:string,configuration?:Configuration)=>void;update:(id:string,qty:number,optionId?:string,configuration?:Configuration)=>void;remove:(id:string,optionId?:string,configuration?:Configuration)=>void;selectOption:(line:BasketLine,optionId:string)=>void;configure:(line:BasketLine,configuration:Configuration)=>void};
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
 const add=useCallback((id:string,qty:number,optionId?:string,configuration?:Configuration)=>{
  const product=products.find(product=>product.id===id);if(!product)return;
  const resolved=product.configurationProduct?resolveConfiguration(product.configurationProduct,configuration):configuration;
  if(basketSelectionRequired({productId:id,quantity:qty,optionId,configuration:resolved},product))return;
  setLines(current=>{try{return addLine(current,id,qty,optionId,resolved);}catch{return current;}});
 },[products]);
 const update=useCallback((id:string,qty:number,optionId?:string,configuration?:Configuration)=>{
  if(Number.isSafeInteger(qty)&&qty>0&&qty<=9999)setLines(current=>current.map(line=>basketLineKey(line)===basketLineKey({productId:id,optionId,configuration})?{...line,quantity:qty}:line));
 },[]);
 const remove=useCallback((id:string,optionId?:string,configuration?:Configuration)=>setLines(current=>current.filter(line=>basketLineKey(line)!==basketLineKey({productId:id,optionId,configuration}))),[]);
 const configure=useCallback((line:BasketLine,configuration:Configuration)=>setLines(current=>{
  const entry=current.find(existing=>basketLineKey(existing)===basketLineKey(line));if(!entry)return current;
  const options=products.find(p=>p.id===entry.productId)?.options?.filter(o=>!configuration.model||!o.model||o.model===configuration.model);
  const optionId=options?.length===1?options[0].id:options?.some(o=>o.id===entry.optionId)?entry.optionId:undefined;
  const replacement={...entry,optionId,configuration},other=current.find(existing=>basketLineKey(existing)!==basketLineKey(entry)&&basketLineKey(existing)===basketLineKey(replacement));
  if(other){if(other.quantity+entry.quantity>9999)return current;return current.filter(existing=>existing!==entry).map(existing=>existing===other?{...other,quantity:other.quantity+entry.quantity}:existing);}
  return current.map(existing=>existing===entry?replacement:existing);
 }),[products]);
 const selectOption=useCallback((line:BasketLine,optionId:string)=>{
  if(!products.find(product=>product.id===line.productId)?.options?.some(option=>option.id===optionId))return;
  setLines(current=>{try{return selectBasketOption(current,line,optionId);}catch{return current;}});
 },[products]);
 return <BasketContext.Provider value={{catalogue,publicEnquiries,lines,ready,storageError,add,update,remove,selectOption,configure}}>{children}</BasketContext.Provider>;
}
export function useBasket(){const value=useContext(BasketContext);if(!value)throw new Error('BasketProvider missing');return value;}
