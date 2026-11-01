'use client';
import {useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import type {CatalogueOption} from '@/lib/catalogue-details';
import {copy} from '@/content/copy';
import {useBasket} from './basket-provider';
import {configurationKey,resolveConfiguration,validateConfiguration,type Configuration} from '@/lib/product-configuration';
import {ProductConfigurationFields} from './product-configuration-fields';
import './product-connection-options.css';
export function AddToQuote({id,locale,options=[]}:{id:string;locale:Locale;options?:CatalogueOption[]}){
 const {add,ready,lines,catalogue}=useBasket(),[added,setAdded]=useState(false),[optionId,setOptionId]=useState<string>(),[quantity,setQuantity]=useState(1),t=copy[locale],ar=locale==='ar';
 const product=catalogue.products.find(p=>p.id===id)?.configurationProduct;
 const [configuration,setConfiguration]=useState<Configuration>({}),resolved=product?resolveConfiguration(product,configuration):configuration;
 const available=options.filter(o=>!resolved.model||!o.model||o.model===resolved.model),effectiveOption=available.length===1?available[0].id:optionId;
 const selected=available.find(option=>option.id===effectiveOption),existing=lines.find(line=>line.productId===id&&line.optionId===effectiveOption&&configurationKey(line.configuration)===configurationKey(resolved))?.quantity??0;
 const invalid=!Number.isSafeInteger(quantity)||quantity<1||existing+quantity>9999||(options.length>0&&!selected)||(!existing&&lines.length>=100)||(product&&!validateConfiguration(product,resolved));
 return <div className="connection-add">
  {product&&<ProductConfigurationFields product={product} locale={locale} value={configuration} onChange={next=>{setConfiguration(next);setAdded(false);}}/>}
  {options.length>0&&<fieldset className="connection-options"><legend>{ar?'موضع التركيب':'Mounting position'}</legend>{available.length===1?<strong>{available[0].name[locale]}</strong>:available.map(option=><label key={option.id}><input type="radio" name={'connection-'+id} value={option.id} checked={effectiveOption===option.id} onChange={()=>{setOptionId(option.id);setAdded(false);}}/><span>{option.name[locale]}{option.model&&<> <bdi dir="ltr">({option.model})</bdi></>}</span></label>)}</fieldset>}
  <label className="connection-quantity" htmlFor={'add-quantity-'+id}>{t.quantity}<input id={'add-quantity-'+id} type="number" min={1} max={9999-existing} step={1} value={quantity} onChange={event=>{setQuantity(Number(event.target.value));setAdded(false);}}/></label>
  <div className="add-control"><button disabled={!ready||invalid} data-interest-kind="basket" className="button button-dark" onClick={()=>{add(id,quantity,effectiveOption,resolved);setAdded(true);}}>{t.add}<span aria-hidden="true">+</span></button><span role="status" className="added-message">{added?t.added:''}</span></div>
 </div>;
}
