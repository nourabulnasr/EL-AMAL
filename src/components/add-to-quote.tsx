'use client';
import {useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import type {CatalogueOption} from '@/lib/catalogue-details';
import {copy} from '@/content/copy';
import {useBasket} from './basket-provider';
import './product-connection-options.css';
export function AddToQuote({id,locale,options=[]}:{id:string;locale:Locale;options?:CatalogueOption[]}){
 const {add,ready,lines}=useBasket(),[added,setAdded]=useState(false),[optionId,setOptionId]=useState<string>(),[quantity,setQuantity]=useState(1),t=copy[locale],ar=locale==='ar';
 const selected=options.find(option=>option.id===optionId),existing=lines.find(line=>line.productId===id&&line.optionId===optionId)?.quantity??0;
 const invalid=!Number.isSafeInteger(quantity)||quantity<1||existing+quantity>9999||(options.length>0&&!selected)||(!existing&&lines.length>=100);
 return <div className="connection-add">
  {options.length>0&&<fieldset className="connection-options"><legend>{ar?'اختر التوصيل':'Choose the connection'}</legend>{options.map(option=><label key={option.id}><input type="radio" name={'connection-'+id} value={option.id} checked={optionId===option.id} onChange={()=>{setOptionId(option.id);setAdded(false);}}/><span>{option.name[locale]}{option.model&&<> <bdi dir="ltr">({option.model})</bdi></>}</span></label>)}</fieldset>}
  <label className="connection-quantity" htmlFor={'add-quantity-'+id}>{t.quantity}<input id={'add-quantity-'+id} type="number" min={1} max={9999-existing} step={1} value={quantity} onChange={event=>{setQuantity(Number(event.target.value));setAdded(false);}}/></label>
  <div className="add-control"><button disabled={!ready||invalid} data-interest-kind="basket" className="button button-dark" onClick={()=>{add(id,quantity,optionId);setAdded(true);}}>{t.add}<span aria-hidden="true">+</span></button><span role="status" className="added-message">{added?t.added:''}</span></div>
 </div>;
}
