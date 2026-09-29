import {createHash} from 'node:crypto';

export type InventoryKind='receipt'|'adjustment'|'hold'|'release'|'dispatch'|'reconcile';
export type InventoryActor={id:number;collection:'staff';role:'owner'|'sales'|'warehouse'};
export type InventoryCommand={kind:InventoryKind;requestKey:string;skuId:number;reason:string;quantity?:number;enquiryId?:number;enquiryLineId?:string;expiresAt?:string;reservationId?:number};
export class InventoryError extends Error {
  status:number;
  constructor(message:string,status=400){super(message);this.status=status;}
}
export function canUseInventory(user:unknown):user is InventoryActor {
  if(!user||typeof user!=='object')return false;
  const value=user as Record<string,unknown>;
  return value.collection==='staff'&&Number.isSafeInteger(value.id)&&Number(value.id)>0&&['owner','sales','warehouse'].includes(String(value.role));
}
export function canPerformInventory(user:unknown,kind:InventoryKind){
  if(!canUseInventory(user))return false;
  return user.role==='owner'||(user.role==='sales'?['hold','release','reconcile']:['receipt','adjustment','dispatch','reconcile']).includes(kind);
}
export function parseInventoryCommand(value:unknown):InventoryCommand {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new InventoryError('Invalid inventory command');
  const v=value as Record<string,unknown>;
  const kinds=['receipt','adjustment','hold','release','dispatch','reconcile'];
  if(!kinds.includes(String(v.kind)))throw new InventoryError('Choose a supported inventory action');
  const kind=v.kind as InventoryKind;
  const extras=kind==='hold'?['quantity','enquiryId','enquiryLineId','expiresAt']:['receipt','adjustment'].includes(kind)?['quantity']:['release','dispatch'].includes(kind)?['reservationId']:[];
  if(Object.keys(v).some(key=>!['kind','requestKey','skuId','reason',...extras].includes(key)))throw new InventoryError('Unexpected inventory field');
  if(typeof v.requestKey!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.requestKey))throw new InventoryError('A unique request key is required');
  if(!Number.isSafeInteger(v.skuId)||Number(v.skuId)<1||Number(v.skuId)>2147483647)throw new InventoryError('Choose an exact SKU');
  if(typeof v.reason!=='string'||!v.reason.trim()||v.reason.trim().length>1000)throw new InventoryError('Enter a reason of at most 1000 characters');
  const command:InventoryCommand={kind,requestKey:v.requestKey.toLowerCase(),skuId:Number(v.skuId),reason:v.reason.trim()};
  if(extras.includes('quantity')){
    if(!Number.isInteger(v.quantity)||Number(v.quantity)===0||Math.abs(Number(v.quantity))>999999||(kind!=='adjustment'&&Number(v.quantity)<1))throw new InventoryError('Enter a whole quantity from 1 to 999999; adjustments may also be negative');
    command.quantity=Number(v.quantity);
  }
  if(kind==='hold'){
    if(!Number.isSafeInteger(v.enquiryId)||Number(v.enquiryId)<1||typeof v.enquiryLineId!=='string'||!v.enquiryLineId||v.enquiryLineId.length>100)throw new InventoryError('Choose a verified enquiry and its requested line');
    if(typeof v.expiresAt!=='string'||!Number.isFinite(Date.parse(v.expiresAt)))throw new InventoryError('Choose a hold expiry');
    command.enquiryId=Number(v.enquiryId);command.enquiryLineId=v.enquiryLineId;command.expiresAt=new Date(v.expiresAt).toISOString();
  }
  if(extras.includes('reservationId')){
    if(!Number.isSafeInteger(v.reservationId)||Number(v.reservationId)<1)throw new InventoryError('Choose a reservation');
    command.reservationId=Number(v.reservationId);
  }
  return command;
}
export function inventoryFingerprint(command:InventoryCommand,actorId:number){
  const {requestKey:_,...details}=command;
  return createHash('sha256').update(JSON.stringify({actorId,...details})).digest('hex');
}
export function assertStockChange(onHand:number,reserved:number,delta:number){
  const next=onHand+delta;
  if(!Number.isSafeInteger(next)||next<0||next<reserved||next>999999999)throw new InventoryError('This action would exceed available stock or the supported balance',409);
  return next;
}
