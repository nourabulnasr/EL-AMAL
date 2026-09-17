'use client';
import {useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {useBasket} from './basket-provider';
export function AddToQuote({id,locale}:{id:string;locale:Locale}){
 const {add,ready,lines}=useBasket(),[added,setAdded]=useState(false),t=copy[locale];const full=(lines.find(l=>l.productId===id)?.quantity??0)>=9999;
 return <div className="add-control"><button disabled={!ready||full} className="button button-dark" onClick={()=>{add(id,1);setAdded(true);}}>{t.add}<span aria-hidden="true">+</span></button><span role="status" className="added-message">{added?t.added:''}</span></div>;
}
