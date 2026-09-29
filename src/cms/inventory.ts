import type {CollectionConfig,Field} from 'payload';
import {canUseInventory} from '../lib/inventory.ts';

const read=({req}:{req:{user:unknown}})=>canUseInventory(req.user);
const access={read,create:()=>false,update:()=>false,delete:()=>false};
const immutable=()=>{throw new Error('Inventory is append-only. Use the private inventory workflow.');};
const hooks:CollectionConfig['hooks']={beforeChange:[immutable],beforeDelete:[immutable]};
const relationship=(name:string,relationTo:'skus'|'staff'|'enquiries'|'inventory-reservations',required=true):Field=>({name,type:'relationship',relationTo,required,index:true});
export const InventoryReservations:CollectionConfig={
  slug:'inventory-reservations',access,hooks,
  admin:{group:'Stock control',useAsTitle:'reference',defaultColumns:['reference','sku','quantity','expiresAt','createdAt'],description:'Immutable hold records. Open /staff/inventory to create, release or dispatch holds. Lifecycle events are recorded in the stock ledger.'},
  fields:[
    {name:'reference',type:'text',required:true,unique:true},
    relationship('sku','skus'),relationship('enquiry','enquiries'),{name:'enquiryLineId',type:'text',required:true,index:true},
    {name:'quantity',type:'number',required:true,min:1,max:999999},
    {name:'expiresAt',type:'date',required:true,index:true},relationship('actor','staff'),
    {name:'reason',type:'textarea',required:true,maxLength:1000},
    {name:'skuSnapshot',type:'json',required:true},
  ],
};
export const InventoryMovements:CollectionConfig={
  slug:'inventory-movements',access,hooks,
  admin:{group:'Stock control',useAsTitle:'requestKey',defaultColumns:['kind','sku','onHandDelta','reservedDelta','blockedDelta','actor','createdAt'],description:'Append-only stock ledger. Corrections require a new reasoned adjustment in /staff/inventory. No opening balances are inferred from catalogue availability.'},
  fields:[
    {name:'requestKey',type:'text',required:true,unique:true},
    {name:'fingerprint',type:'text',required:true,admin:{hidden:true}},
    {name:'kind',type:'select',required:true,options:['receipt','adjustment','hold','release','expire','dispatch','reconcile','block','unblock','confirm']},
    relationship('sku','skus'),relationship('reservation','inventory-reservations',false),
    {name:'closeKey',type:'text',unique:true,admin:{hidden:true}},
    {name:'onHandDelta',type:'number',required:true},
    {name:'reservedDelta',type:'number',required:true},
    {name:'blockedDelta',type:'number',required:true,defaultValue:0},
    {name:'confirmedQuantity',type:'number',min:0,max:999999999,admin:{description:'Physical on-hand count reviewed by the owner or warehouse for a stock confirmation event.'}},
    relationship('actor','staff',false),{name:'actorRole',type:'text',required:true,admin:{description:'System expiry events have no staff actor.'}},
    {name:'reason',type:'textarea',required:true,maxLength:1000},
  ],
};
