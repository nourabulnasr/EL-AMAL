/** Keep real text in the HTML. CSS progressively adds motion when supported. */
export function RevealText({children}:{children:string}) {
  return <>{children.split('\n').map((line,index)=><span className="reveal-line" key={index}><span>{line}{' '}</span></span>)}</>;
}
