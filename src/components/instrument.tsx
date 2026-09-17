// Deliberately unbranded schematic, not product photography or a specification.
export function Instrument({small=false,kind='pressure'}:{small?:boolean;kind?:string}) {
 return <div className={`instrument ${small?'instrument-small':''} instrument-${kind}`} aria-hidden="true">
   <div className="instrument-stem"/><div className="instrument-case"><div className="instrument-face"><div className="dial-ticks"/><div className="dial-inner"><span className="dial-label">EL AMAL</span><div className="dial-needle"/><span className="dial-pin"/><span className="dial-caption">MEASUREMENT</span></div></div></div><div className="instrument-shadow"/>
 </div>;
}
