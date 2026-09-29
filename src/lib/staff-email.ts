import {createHash} from 'node:crypto';
import type {EmailAdapter} from 'payload';
import {recoveryReady} from './staff-security.ts';

// Dedicated Payload recovery adapter: never log a reset link when delivery is unavailable.
export function staffEmailAdapter(env:Record<string,string|undefined>=process.env,fetcher:typeof fetch=fetch):EmailAdapter<{id:string}>{
  return ()=>({
    name:'el-amal-staff-recovery',defaultFromAddress:env.MAIL_FROM||'unconfigured@example.invalid',defaultFromName:'EL AMAL',
    async sendEmail(message){
      if(!recoveryReady(env))throw new Error('Staff recovery unavailable');
      const {to,subject,html}=message;
      if(typeof to!=='string'||to.length>254||!(/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(to))||typeof subject!=='string'||subject.length>200||typeof html!=='string'||html.length>20000)throw new Error('Invalid staff email');
      const body=JSON.stringify({from:env.MAIL_FROM,to:[to],subject,html});
      const deliveryKey=`staff-recovery-${createHash('sha256').update(body).digest('hex')}`;
      try{
        const response=await fetcher('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':deliveryKey},body});
        if(!response.ok)throw new Error('Unavailable');
        const data=await response.json();
        if(typeof data?.id!=='string'||!data.id||data.id.length>200)throw new Error('Unavailable');
        return {id:data.id};
      }catch{throw new Error('Staff email delivery not confirmed');}
    },
  });
}
