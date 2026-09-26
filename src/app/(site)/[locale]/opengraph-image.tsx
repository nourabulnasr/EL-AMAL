import {ImageResponse} from 'next/og';
export const alt='EL AMAL — Industrial instrumentation';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){
 return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'#010736',color:'white',padding:64,position:'relative',fontFamily:'sans-serif'}}>
  <div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',width:740}}>
   <div style={{display:'flex',fontSize:30,letterSpacing:5}}>EL AMAL</div>
   <div style={{display:'flex',fontSize:76,lineHeight:1.05}}>Precision at every connection.</div>
   <div style={{display:'flex',fontSize:24}}>Pressure / Temperature / Accessories</div>
  </div>
  <div style={{position:'absolute',display:'flex',right:-115,top:110,width:460,height:460,borderRadius:230,background:'#091540',border:'2px solid #ffffff60',alignItems:'center',justifyContent:'center'}}>
   <div style={{display:'flex',width:320,height:320,borderRadius:160,border:'2px solid #ffffff90',alignItems:'center',justifyContent:'center'}}>
    <div style={{display:'flex',width:150,height:5,background:'#df934e',transform:'rotate(-40deg)'}}/>
   </div>
  </div>
 </div>,size);
}
