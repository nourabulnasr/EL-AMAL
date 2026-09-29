import {canUseInventory,canPerformInventory,parseInventoryCommand,InventoryError,type InventoryActor,type InventoryCommand} from './inventory.ts';
import {readInput} from './enquiry-http.ts';
import {EnquiryInputError} from './enquiries.ts';

type Dependencies={enabled:()=>boolean;authenticate:(headers:Headers)=>Promise<unknown>;read:(actor:InventoryActor,url:URL)=>Promise<unknown>;execute:(actor:InventoryActor,command:InventoryCommand)=>Promise<{repeated:boolean}>};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
function failure(error:unknown){
  if(error instanceof InventoryError)return json({error:error.message},error.status);
  if(error instanceof EnquiryInputError)return json({error:'Invalid or oversized inventory request'},400);
  return json({error:'Inventory is temporarily unavailable. Retry the same action without changing its details.'},503);
}
export function inventoryHandlers(deps:Dependencies){return {
  GET:async(request:Request)=>{
    if(!deps.enabled())return json({error:'Inventory unavailable'},503);
    try{
      const actor=await deps.authenticate(request.headers);
      if(!canUseInventory(actor))return json({error:'Authorized staff sign-in required'},403);
      return json(await deps.read(actor,new URL(request.url)));
    }catch(error){return failure(error);}
  },
  POST:async(request:Request)=>{
    if(!deps.enabled())return json({error:'Inventory unavailable'},503);
    if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Invalid origin'},403);
    if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return json({error:'JSON required'},415);
    try{
      const actor=await deps.authenticate(request.headers);
      if(!canUseInventory(actor))return json({error:'Authorized staff sign-in required'},403);
      const command=parseInventoryCommand(await readInput(request,8192));
      if(!canPerformInventory(actor,command.kind))return json({error:'Your staff role cannot perform this action'},403);
      const result=await deps.execute(actor,command);
      return json(result,result.repeated?200:201);
    }catch(error){return failure(error);}
  },
};}
