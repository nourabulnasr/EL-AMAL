// Keep model codes, signed ranges and units intact inside Arabic prose.
export function BidiText({children}:{children:string}){
 return children.split(/([\u0600-\u06ff]+)/u).map((part,index)=>
  /[A-Za-z0-9]/.test(part)?<bdi key={index} dir="ltr">{part}</bdi>:part);
}
