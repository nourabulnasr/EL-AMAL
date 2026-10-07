export function shouldMeasureActivation(type:string,button:number,isLink:boolean){
  return type==='click'&&button===0||type==='auxclick'&&button===1&&isLink;
}
