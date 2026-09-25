import type {NotificationTransport} from './notification-worker.ts';

type Environment=Record<string,string|undefined>;
const email=(value:string|undefined)=>!!value&&value.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value);
export function mailReadiness(env:Environment=process.env){
  return {
    enabled:env.NOTIFICATION_DELIVERY_ENABLED==='true',
    provider:env.MAIL_PROVIDER==='resend',
    apiKey:!!env.RESEND_API_KEY?.trim(),
    sender:email(env.MAIL_FROM),
    workerSecret:(env.NOTIFICATION_WORKER_SECRET?.length??0)>=32,
  };
}

// Construction never makes network calls. Activation is deliberately explicit.
export function notificationTransport(env:Environment=process.env,fetcher:typeof fetch=fetch):NotificationTransport|undefined {
  if(!Object.values(mailReadiness(env)).every(Boolean))return;
  return {send:async message=>{
    try {
      if(message.from!==undefined&&!email(message.from))throw new Error('Invalid sender');
      const response=await fetcher('https://api.resend.com/emails',{
        method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),
        headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':message.idempotencyKey},
        body:JSON.stringify({from:message.from??env.MAIL_FROM,to:[message.to],subject:message.subject,text:message.text}),
      });
      // Do not retain provider response errors: they may contain submitted addresses.
      if(!response.ok)throw new Error('Delivery not confirmed');
      const result:unknown=await response.json();
      if(!result||typeof result!=='object'||!('id' in result)||typeof result.id!=='string'||!result.id||result.id.length>200)throw new Error('Invalid receipt');
      return {id:result.id};
    }catch{throw new Error('Delivery not confirmed');}
  }};
}
