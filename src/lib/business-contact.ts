// Public business information supplied by the client, separate from the alert inbox.
export const businessEmail = 'alamal4trade@hotmail.com';
// Confirmed 16 October 2026. Egypt's domestic 0 is removed after country code +20.
export const businessPhone = '+201017314349';
export function businessContact(){
 const number=(value:string|undefined)=>value&&/^\+[1-9]\d{7,14}$/.test(value)?value:undefined;
 return {email:businessEmail,phone:number(process.env.BUSINESS_PHONE)??businessPhone,whatsapp:number(process.env.BUSINESS_WHATSAPP)?.slice(1)};
}
