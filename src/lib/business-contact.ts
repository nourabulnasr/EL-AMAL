// Public business information only. No fallback numbers or inferred partner claims.
export function businessContact(){
 const number=(value:string|undefined)=>value&&/^\+[1-9]\d{7,14}$/.test(value)?value:undefined;
 return {phone:number(process.env.BUSINESS_PHONE),whatsapp:number(process.env.BUSINESS_WHATSAPP)?.slice(1)};
}
