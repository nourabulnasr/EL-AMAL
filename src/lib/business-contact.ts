// Public business information only. No fallback numbers or inferred partner claims.
// Supplied by the client for public display; separate from the private alert inbox.
export const businessEmail = 'alamal4trade@hotmail.com';
export function businessContact(){
 const number=(value:string|undefined)=>value&&/^\+[1-9]\d{7,14}$/.test(value)?value:undefined;
 return {email:businessEmail,phone:number(process.env.BUSINESS_PHONE),whatsapp:number(process.env.BUSINESS_WHATSAPP)?.slice(1)};
}
