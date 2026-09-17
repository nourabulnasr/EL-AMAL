export type BasketLine = {productId:string; quantity:number};
const validQuantity = (q:unknown):q is number => typeof q === 'number' && Number.isSafeInteger(q) && q > 0 && q <= 9999;
export function readBasket(raw:string|null):BasketLine[] {
  try {
    const value:unknown = JSON.parse(raw ?? '[]');
    if(!Array.isArray(value) || value.length > 100) return [];
    const result:BasketLine[] = [];
    for(const line of value) {
      if(!line || typeof line.productId !== 'string' || !line.productId || line.productId.length > 100 || !validQuantity(line.quantity) || result.some(x=>x.productId === line.productId)) return [];
      result.push({productId:line.productId,quantity:line.quantity});
    }
    return result;
  } catch { return []; }
}
export function addLine(lines:BasketLine[], productId:string, quantity:number):BasketLine[] {
  if(!productId || !validQuantity(quantity)) throw new Error('Invalid quantity or product');
  const existing = lines.find(l=>l.productId === productId);
  if(existing) {
    if(!validQuantity(existing.quantity + quantity)) throw new Error('Quantity limit reached');
    return lines.map(l=>l.productId === productId ? {...l,quantity:l.quantity + quantity} : l);
  }
  if(lines.length >= 100) throw new Error('Basket limit reached');
  return [...lines,{productId,quantity}];
}
