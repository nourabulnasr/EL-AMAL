import type {CollectionConfig} from 'payload';
import {hasRole} from '../lib/access.ts';
export const DeliveryOperations:CollectionConfig={
 slug:'delivery-operations',
 labels:{singular:'Delivery operations',plural:'Delivery operations'},
 admin:{useAsTitle:'key',defaultColumns:['key','lastOutcome','lastCompletedAt','lastSuccessAt'],description:'Scheduler health and queue counts only. Provider acceptance does not prove inbox receipt. A missing success for 15 minutes requires investigation.'},
 access:{create:()=>false,read:({req})=>hasRole(req.user,['owner']),update:()=>false,delete:()=>false},
 fields:[
  {name:'key',type:'text',required:true,unique:true},
  {name:'leaseToken',type:'text',admin:{hidden:true},access:{read:()=>false}},
  {name:'leaseExpiresAt',type:'date'},
  {name:'lastStartedAt',type:'date'},
  {name:'lastCompletedAt',type:'date'},
  {name:'lastSuccessAt',type:'date'},
  {name:'lastOutcome',type:'text'},
  {name:'processed',type:'number',defaultValue:0},
  {name:'failures',type:'number',defaultValue:0},
  {name:'verificationPending',type:'number',defaultValue:0},
  {name:'notificationPending',type:'number',defaultValue:0},
  {name:'oldestPendingAt',type:'date'},
 ],
};
