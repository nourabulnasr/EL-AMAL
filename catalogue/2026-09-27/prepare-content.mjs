import {readFileSync,writeFileSync} from 'node:fs';
const base=new URL('./',import.meta.url);
const records=JSON.parse(readFileSync(new URL('official-extraction.json',base),'utf8'));
const overrides={
 'IR80':[['Application','Installation of high-temperature thermocouples'],['Installation','Horizontal and vertical installation'],['Compatibility','Flanged thermocouples'],['Construction','High mechanical stability and low weight']],
 'PP82':[['Material','Heavy-duty stainless steel'],['Construction','Side protection for mechanical stability'],['Mounting','Wall or 2-inch pipe mounting'],['Pressure indication','Pressure gauge with liquid damping']],
 'M12 x 1 cable':[['Connector','Circular connector M12 x 1, 4- and 5-pin'],['Version','Straight and angled'],['Cable length','2, 5 or 10 m'],['Ingress protection','IP67']],
};
const clean=s=>s.replace(/([A-Za-z])-\n([a-z])/g,'$1$2').replace(/\n®/g,'').replace(/\n(?!•)/g,' ').replace(/\s+•/g,'\n•').trim();
for(const record of records){
 record.rows=(overrides[record.model]?.map(([label,value])=>({label,value}))??record.rows).filter(r=>!r.label.startsWith('Data sheet')).map(r=>({label:clean(r.label),value:clean(r.value)}));
 if(/^DSS(26|34)[MT]$/.test(record.model)){
  record.rows=record.rows.filter(r=>['PN max.','System fill fluid'].includes(r.label));
  record.rows.unshift({label:'Application',value:record.model.startsWith('DSS26')?'Small flange process connections in the process industry':'Chemical, petrochemical and water treatment industries'});
 }
 if(record.model==='IBM, IBF') for(const row of record.rows)row.value=row.value.replace(/^BF:/,'IBF:');
 // Promotional superlatives and delivery promises are not technical specifications.
 for(const row of record.rows)row.value=row.value.replace('The fastest and simplest configuration on the market','Quick and simple configuration');
 record.datasheetIds=[...new Set((record.printedDatasheetIds??'').match(/[A-Z]{2}\s?\d{2}\.\d{2}/g)?.map(x=>x.replace(/\s/g,''))??[])];
 if(record.model==='IR80')record.datasheetIds=['AC80.22'];
 if(!record.rows.length||record.rows.some(r=>!r.label||!r.value))throw new Error(`Incomplete specification: ${record.model}`);
}
const terms=[...new Set(records.flatMap(r=>[r.label,...r.rows.flatMap(s=>[s.label,s.value])]))];
writeFileSync(new URL('content-source.json',base),JSON.stringify(records,null,2)+'\n');
writeFileSync(new URL('translation-input.json',base),JSON.stringify(terms.map((en,id)=>({id,en})),null,2)+'\n');
console.log(JSON.stringify({records:records.length,specifications:records.reduce((n,r)=>n+r.rows.length,0),terms:terms.length,labels:[...new Set(records.flatMap(r=>r.rows.map(s=>s.label)))]}));
